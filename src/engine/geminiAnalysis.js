/**
 * Aura Gemini Integration
 *
 * Single responsibility: take a structured SessionReport from the
 * SignalProcessor and return an array of UnspokenMoments.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const IS_DIRECT = !!API_KEY;

const GEMINI_API_URL = IS_DIRECT
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`
  : '/api/gemini';

/**
 * @typedef {object} UnspokenMoment
 * @property {string} text        - The exact words spoken
 * @property {number} timestampMs - When in the session this occurred
 * @property {string} signal      - Which acoustic signals deviated and by how much
 * @property {string} observation - A single plain-English observation
 */

function buildPayload(report) {
  const significantSegments = report.transcriptSegments
    .filter((s) => s.acousticIntensityScore >= 0.20)
    .map((s) => ({
      text: s.text,
      timestampMs: s.startMs,
      acousticIntensityScore: parseFloat(s.acousticIntensityScore.toFixed(3)),
      deviations: {
        pitch: parseFloat((s.deviations?.f0 ?? 0).toFixed(3)),
        energy: parseFloat((s.deviations?.rms ?? 0).toFixed(3)),
        brightness: parseFloat((s.deviations?.spectralCentroid ?? 0).toFixed(3)),
        jitter: parseFloat((s.deviations?.jitter ?? 0).toFixed(3)),
      },
    }));

  return {
    baseline: {
      rms: parseFloat((report.baseline?.rms ?? 0).toFixed(4)),
      f0: report.baseline?.f0 ? parseFloat(report.baseline.f0.toFixed(2)) : null,
      spectralCentroid: report.baseline?.spectralCentroid
        ? parseFloat(report.baseline.spectralCentroid.toFixed(2))
        : null,
    },
    significantSegments,
    pauseMap: report.pauseMap
      .filter((p) => p.durationMs >= 600)
      .map((p) => ({
        durationMs: p.durationMs,
        precedingText: p.precedingText,
      })),
    sessionDurationMs: report.sessionDurationMs,
  };
}

const SYSTEM_PROMPT = `You are an acoustic pattern analyst. You receive structured data from a voice session.

The data contains:
- A personal acoustic baseline (the speaker's neutral resting voice measurements)  
- Transcript segments with acoustic intensity scores and deviation metrics
- A pause map showing hesitations after specific phrases

Your ONLY job is to identify moments where the acoustic signal diverged significantly from the neutral emotional tone of the words spoken. These are called Unspoken Moments.

Rules:
1. Return ONLY a JSON object. No preamble, no explanation, no markdown fences.
2. The JSON must have a single key: "unspokenMoments" containing an array.
3. Return a maximum of 3 moments, ordered by acoustic intensity (highest first).
4. Only include moments where the acoustic score is above 0.25 AND the words themselves appear emotionally neutral or minimizing.
5. If the words already express strong emotion (e.g. "I was so angry"), do NOT flag them — there is no divergence.
6. Each moment must have exactly these fields:
   - text: the exact words from the segment
   - timestampMs: the timestamp from the segment
   - signal: one specific sentence describing which acoustic signal deviated and by how much (use plain language, no jargon)
   - observation: one sentence, written directly to the speaker, that reflects what the voice revealed — not advice, not diagnosis, just honest reflection

Example output format:
{"unspokenMoments":[{"text":"work has been fine lately","timestampMs":4200,"signal":"pitch instability rose 34% above your baseline and held for 2.6 seconds","observation":"Your voice hesitated on this longer than your words suggested it needed to."}]}

If no segments show meaningful divergence, return: {"unspokenMoments":[]}`;

/**
 * Call Gemini with the session report and return UnspokenMoments.
 *
 * @param {import('./signalProcessor').SessionReport} report
 * @returns {Promise<UnspokenMoment[]>}
 */
export async function analyzeWithGemini(report) {
  const payload = buildPayload(report);

  if (!payload.significantSegments.length) {
    return [];
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nData: ${JSON.stringify(payload)}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  
  // If we called the direct API, the structure is candidates[0]...
  // If we called a custom proxy, it might be different, but assuming standard Gemini shape
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textContent) {
    throw new Error('No text content in Gemini response');
  }

  try {
    const parsed = JSON.parse(textContent);
    return parsed.unspokenMoments ?? [];
  } catch (err) {
    console.error('Failed to parse Gemini JSON:', textContent);
    throw new Error('Invalid JSON format from Gemini');
  }
}