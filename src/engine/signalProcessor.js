/**
 * Aura Signal Processor
 *
 * Consumes raw FrameData from the AudioEngine and produces:
 *   1. A running per-frame timeline (stored in memory during the session)
 *   2. A computed session report after the session ends
 *
 * This is entirely deterministic JavaScript — no API calls, no ML models.
 * All math is standard signal processing.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

// How many ms of speech frames to use when computing the personal baseline.
// We use the first 8 seconds of voiced speech (not total time — silence excluded).
const BASELINE_WINDOW_MS = 8000;

// Rolling window size (in frames) for smoothing noisy raw features.
// At ~86fps, 20 frames ≈ 230ms — short enough to track real shifts,
// long enough to suppress single-frame noise spikes.
const SMOOTHING_WINDOW = 20;

// Rolling window size (in frames) for computing jitter.
// 50 frames ≈ 580ms — captures cycle-to-cycle pitch micro-variation.
const JITTER_WINDOW = 50;

// Minimum deviation score (0–1) to flag as significant.
// 0.25 means the metric shifted 25% away from the personal baseline.
const DEVIATION_THRESHOLD = 0.25;

// Minimum pause duration (ms) to record in the pause map.
// Pauses shorter than this are normal breath gaps, not hesitations.
const MIN_PAUSE_MS = 400;

// ─── Math Helpers ────────────────────────────────────────────────────────────

/** Arithmetic mean of an array. Returns 0 for empty arrays. */
function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

/** Standard deviation of an array. Returns 0 for arrays shorter than 2. */
function stdDev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

/**
 * Compute deviation score: how far is `value` from `baseline`,
 * normalized by baseline. Returns a value in [0, ∞), typically [0, 1].
 * Returns 0 if baseline is effectively zero.
 */
function deviationScore(value, baseline) {
  if (Math.abs(baseline) < 1e-9) return 0;
  return Math.abs(value - baseline) / Math.abs(baseline);
}

/**
 * Simple rolling mean smoother.
 * Given a full array and a window size, returns the mean of the last
 * `window` elements (or all elements if fewer than `window` exist).
 */
function rollingMean(arr, window) {
  const slice = arr.slice(-window);
  return mean(slice);
}

// ─── SignalProcessor Class ────────────────────────────────────────────────────

export class SignalProcessor {
  constructor() {
    this.reset();
  }

  reset() {
    // Raw frame storage — every frame from the engine
    this._frames = [];

    // Accumulated speech-only frames used for baseline computation
    this._baselineSpeechFrames = [];
    this._baselineFinalized = false;

    // Computed baseline (set once after BASELINE_WINDOW_MS of speech)
    this.baseline = null;

    // Pause tracking
    this._lastSpeechMs = null;
    this._currentPauseStart = null;

    // Output structure — built up incrementally
    this._pauseMap = [];
    this._smoothedTimeline = []; // one entry per smoothed window
  }

  /**
   * Feed a single FrameData from the AudioEngine into the processor.
   * Call this from the onFrame callback.
   *
   * @param {import('./audioEngine').FrameData} frame
   */
  ingest(frame) {
    this._frames.push(frame);
    this._trackPause(frame);
    this._tryFinalizeBaseline(frame);
    this._appendSmoothedEntry(frame);
  }

  /**
   * Called after the session ends. Computes the full session report.
   *
   * @param {object[]} transcriptSegments - From the TranscriptCollector
   * @returns {SessionReport}
   */
  computeReport(transcriptSegments = []) {
    if (!this.baseline) {
      // Edge case: user barely spoke. Use whatever frames we have.
      this._finalizeBaseline(this._frames.filter((f) => f.isSpeech));
    }

    // Close any open pause
    const lastFrame = this._frames[this._frames.length - 1];
    if (lastFrame && this._currentPauseStart !== null) {
      const duration = lastFrame.timestampMs - this._currentPauseStart;
      if (duration >= MIN_PAUSE_MS) {
        this._pauseMap.push({
          startMs: this._currentPauseStart,
          durationMs: duration,
          precedingText: null, // will be filled in by alignment step
        });
      }
    }

    const acousticTimeline = this._buildAcousticTimeline();
    const alignedSegments = this._alignTranscript(transcriptSegments, acousticTimeline);
    const highDeviationMoments = this._findHighDeviationMoments(alignedSegments);

    return {
      baseline: this.baseline,
      acousticTimeline,
      transcriptSegments: alignedSegments,
      pauseMap: this._alignPausesToTranscript(this._pauseMap, transcriptSegments),
      highDeviationMoments,
      sessionDurationMs: lastFrame?.timestampMs ?? 0,
    };
  }

  // ─── Private: Pause Tracking ──────────────────────────────────────────────

  _trackPause(frame) {
    if (frame.isSpeech) {
      // We were in a pause — close it
      if (this._currentPauseStart !== null) {
        const duration = frame.timestampMs - this._currentPauseStart;
        if (duration >= MIN_PAUSE_MS) {
          this._pauseMap.push({
            startMs: this._currentPauseStart,
            durationMs: duration,
            precedingText: null,
          });
        }
        this._currentPauseStart = null;
      }
      this._lastSpeechMs = frame.timestampMs;
    } else {
      // Silence frame — start tracking a pause if we were just speaking
      if (this._currentPauseStart === null && this._lastSpeechMs !== null) {
        this._currentPauseStart = frame.timestampMs;
      }
    }
  }

  // ─── Private: Baseline ────────────────────────────────────────────────────

  _tryFinalizeBaseline(frame) {
    if (this._baselineFinalized) return;
    if (!frame.isSpeech) return;

    this._baselineSpeechFrames.push(frame);

    // Check how many ms of speech we've collected
    const firstMs = this._baselineSpeechFrames[0].timestampMs;
    const latestMs = frame.timestampMs;
    if (latestMs - firstMs >= BASELINE_WINDOW_MS) {
      this._finalizeBaseline(this._baselineSpeechFrames);
    }
  }

  _finalizeBaseline(speechFrames) {
    if (this._baselineFinalized || !speechFrames.length) return;

    const rmsValues = speechFrames.map((f) => f.rms);
    const f0Values = speechFrames.filter((f) => f.f0 !== null).map((f) => f.f0);
    const centroidValues = speechFrames
      .filter((f) => f.spectralCentroid !== null)
      .map((f) => f.spectralCentroid);

    this.baseline = {
      rms: mean(rmsValues),
      f0: f0Values.length ? mean(f0Values) : null,
      spectralCentroid: centroidValues.length ? mean(centroidValues) : null,
      // Store std devs too — used to contextualize deviation magnitudes
      rmsStd: stdDev(rmsValues),
      f0Std: f0Values.length ? stdDev(f0Values) : null,
    };

    this._baselineFinalized = true;
  }

  // ─── Private: Smoothed Timeline Entry ─────────────────────────────────────

  /**
   * After each new frame, append a smoothed snapshot to the timeline.
   * Each snapshot represents the rolling mean of the last SMOOTHING_WINDOW frames.
   * This runs in O(1) using the rolling window helper.
   */
  _appendSmoothedEntry(frame) {
    if (!frame.isSpeech) return; // only track voiced frames in the smoothed timeline

    const recentFrames = this._frames.slice(-SMOOTHING_WINDOW);
    const speechRecent = recentFrames.filter((f) => f.isSpeech);
    if (!speechRecent.length) return;

    const smoothed = {
      timestampMs: frame.timestampMs,
      rms: mean(speechRecent.map((f) => f.rms)),
      spectralCentroid: mean(
        speechRecent.filter((f) => f.spectralCentroid !== null).map((f) => f.spectralCentroid)
      ),
      zcr: mean(speechRecent.map((f) => f.zcr)),
      f0: mean(speechRecent.filter((f) => f.f0 !== null).map((f) => f.f0)) || null,
    };

    this._smoothedTimeline.push(smoothed);
  }

  // ─── Private: Acoustic Timeline ──────────────────────────────────────────

  /**
   * Divide the session into 5-second windows.
   * For each window, compute aggregate metrics and deviation scores
   * relative to the personal baseline.
   */
  _buildAcousticTimeline() {
    if (!this.baseline || !this._frames.length) return [];

    const totalMs = this._frames[this._frames.length - 1].timestampMs;
    const WINDOW_MS = 5000;
    const windows = [];

    for (let start = 0; start < totalMs; start += WINDOW_MS) {
      const end = start + WINDOW_MS;
      const windowFrames = this._frames.filter(
        (f) => f.timestampMs >= start && f.timestampMs < end && f.isSpeech
      );

      if (!windowFrames.length) {
        windows.push({
          windowMs: [start, end],
          avgDeviationScore: 0,
          dominantSignal: 'silence',
          jitter: 0,
          energyDelta: 0,
          speechDensity: 0,
        });
        continue;
      }

      // Energy deviation
      const avgRms = mean(windowFrames.map((f) => f.rms));
      const rmsDeviation = deviationScore(avgRms, this.baseline.rms);

      // Pitch deviation
      const f0Frames = windowFrames.filter((f) => f.f0 !== null);
      let f0Deviation = 0;
      let jitter = 0;
      if (f0Frames.length >= 2 && this.baseline.f0) {
        const avgF0 = mean(f0Frames.map((f) => f.f0));
        f0Deviation = deviationScore(avgF0, this.baseline.f0);

        // Jitter: std dev of F0 series normalized by mean F0
        const f0Series = f0Frames.map((f) => f.f0);
        jitter = this.baseline.f0 > 0 ? stdDev(f0Series) / this.baseline.f0 : 0;
      }

      // Spectral centroid deviation
      const centroidFrames = windowFrames.filter((f) => f.spectralCentroid !== null);
      let centroidDeviation = 0;
      if (centroidFrames.length && this.baseline.spectralCentroid) {
        const avgCentroid = mean(centroidFrames.map((f) => f.spectralCentroid));
        centroidDeviation = deviationScore(avgCentroid, this.baseline.spectralCentroid);
      }

      // Composite deviation score (weighted: pitch matters most for emotional state)
      const avgDeviationScore = f0Deviation * 0.45 + rmsDeviation * 0.30 + centroidDeviation * 0.25;

      // Energy delta vs previous window
      const prevWindow = windows[windows.length - 1];
      const energyDelta = prevWindow
        ? avgRms - (prevWindow.avgRms ?? this.baseline.rms)
        : 0;

      // Speech density: what % of this window was voiced
      const allWindowFrames = this._frames.filter(
        (f) => f.timestampMs >= start && f.timestampMs < end
      );
      const speechDensity = allWindowFrames.length
        ? windowFrames.length / allWindowFrames.length
        : 0;

      // Dominant signal label
      let dominantSignal = 'calm';
      if (avgDeviationScore > DEVIATION_THRESHOLD) {
        if (f0Deviation > centroidDeviation && f0Deviation > rmsDeviation) {
          dominantSignal = jitter > 0.08 ? 'vocal_stress' : 'pitch_shift';
        } else if (rmsDeviation > centroidDeviation) {
          dominantSignal = avgRms > this.baseline.rms ? 'energy_spike' : 'energy_drop';
        } else {
          dominantSignal = 'tonal_shift';
        }
      }

      windows.push({
        windowMs: [start, end],
        avgDeviationScore: Math.min(avgDeviationScore, 1), // cap at 1 for UI normalization
        dominantSignal,
        jitter: Math.min(jitter, 1),
        energyDelta,
        speechDensity,
        avgRms, // stored for next window's delta calculation
      });
    }

    return windows;
  }

  // ─── Private: Transcript Alignment ───────────────────────────────────────

  /**
   * For each transcript segment, find the acoustic frames that overlap
   * with its time window and compute an acoustic intensity score.
   */
  _alignTranscript(segments, acousticTimeline) {
    if (!segments.length || !this.baseline) return segments;

    return segments.map((seg) => {
      // Find frames within this segment's time window
      const segFrames = this._frames.filter(
        (f) =>
          f.isSpeech &&
          f.timestampMs >= seg.startMs &&
          f.timestampMs <= seg.endMs
      );

      if (!segFrames.length) {
        return { ...seg, acousticIntensityScore: 0, deviations: {} };
      }

      // Compute per-metric deviations for this segment
      const avgRms = mean(segFrames.map((f) => f.rms));
      const rmsDeviation = deviationScore(avgRms, this.baseline.rms);

      const f0Frames = segFrames.filter((f) => f.f0 !== null);
      let f0Deviation = 0;
      let jitter = 0;
      if (f0Frames.length >= 2 && this.baseline.f0) {
        f0Deviation = deviationScore(mean(f0Frames.map((f) => f.f0)), this.baseline.f0);
        jitter = stdDev(f0Frames.map((f) => f.f0)) / this.baseline.f0;
      }

      const centroidFrames = segFrames.filter((f) => f.spectralCentroid !== null);
      let centroidDeviation = 0;
      if (centroidFrames.length && this.baseline.spectralCentroid) {
        centroidDeviation = deviationScore(
          mean(centroidFrames.map((f) => f.spectralCentroid)),
          this.baseline.spectralCentroid
        );
      }

      const acousticIntensityScore =
        f0Deviation * 0.45 + rmsDeviation * 0.30 + centroidDeviation * 0.25;

      return {
        ...seg,
        acousticIntensityScore: Math.min(acousticIntensityScore, 1),
        deviations: {
          f0: f0Deviation,
          rms: rmsDeviation,
          spectralCentroid: centroidDeviation,
          jitter,
        },
      };
    });
  }

  /**
   * Tag each pause with the transcript text that immediately preceded it.
   */
  _alignPausesToTranscript(pauses, segments) {
    return pauses.map((pause) => {
      // Find the last segment that ended before this pause started
      const preceding = segments
        .filter((s) => s.endMs <= pause.startMs)
        .sort((a, b) => b.endMs - a.endMs)[0];

      return {
        ...pause,
        precedingText: preceding?.text ?? null,
      };
    });
  }

  /**
   * Return timestamps (ms) of segments with acoustic intensity above threshold.
   * These become the "Unspoken Moments" candidates sent to Gemini.
   */
  _findHighDeviationMoments(alignedSegments) {
    return alignedSegments
      .filter((s) => s.acousticIntensityScore >= DEVIATION_THRESHOLD)
      .map((s) => s.startMs)
      .sort((a, b) => a - b);
  }
}