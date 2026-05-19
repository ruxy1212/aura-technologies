/**
 * AuraOrb — Organic pulsating visualization
 *
 * Renders an SVG blob whose vertices are continuously displaced by:
 *   - A slow base breathing animation (always present, even in silence)
 *   - RMS energy (amplitude of displacement)
 *   - Spectral centroid (speed of displacement — brighter voice = faster)
 *   - isSpeech (whether to activate the excited state)
 *
 * The organic shape is achieved by generating N points around a circle,
 * displacing each radially by a time-varying noise function (sum of sines
 * at different phases and frequencies), then drawing a smooth SVG path
 * through them using cubic bezier curves.
 *
 * This runs entirely in requestAnimationFrame — no physics engine, no library.
 */

import { useRef, useEffect, useCallback } from 'react';

const SIZE = 320;         // SVG viewBox size
const CX = SIZE / 2;      // center x
const CY = SIZE / 2;      // center y
const BASE_RADIUS = 90;   // resting radius
const NUM_POINTS = 12;    // number of blob vertices (more = smoother, slower)

// Each vertex has its own noise parameters so they move independently
const VERTEX_PARAMS = Array.from({ length: NUM_POINTS }, (_, i) => ({
  phaseOffset: (i / NUM_POINTS) * Math.PI * 2,
  // Each vertex gets 3 sine waves at different frequencies/phases
  waves: [
    { freq: 0.0008 + i * 0.00003, amp: 1.0, phase: i * 0.7 },
    { freq: 0.0019 + i * 0.00007, amp: 0.6, phase: i * 1.3 },
    { freq: 0.0031 + i * 0.00005, amp: 0.4, phase: i * 2.1 },
  ],
}));

/**
 * Compute the radial displacement for a vertex at a given time.
 * Returns a value in [-1, 1].
 */
function noiseAt(vertexParams, t) {
  return vertexParams.waves.reduce((sum, w) => {
    return sum + w.amp * Math.sin(w.freq * t + w.phase);
  }, 0) / (vertexParams.waves.reduce((s, w) => s + w.amp, 0));
}

/**
 * Generate an SVG cubic bezier path through N blob points.
 * Uses the catmull-rom to bezier conversion for smooth curves.
 */
function buildBlobPath(points) {
  const n = points.length;
  let d = '';

  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    // Catmull-Rom → cubic bezier control points (tension = 0.4)
    const tension = 0.4;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    if (i === 0) {
      d += `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} `;
    }
    d += `C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }

  return d + 'Z';
}

export function AuraOrb({ rmsLevel = 0, spectralCentroid = null, isSpeech = false, state = 'idle' }) {
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const smoothedRms = useRef(0);
  const smoothedCentroid = useRef(0.5);

  const animate = useCallback((t) => {
    if (!svgRef.current) return;

    // Smooth the incoming RMS to avoid jitter
    // Attack: fast (0.15), Release: slow (0.05) — asymmetric smoothing
    const targetRms = rmsLevel;
    const alpha = targetRms > smoothedRms.current ? 0.15 : 0.05;
    smoothedRms.current += alpha * (targetRms - smoothedRms.current);

    // Normalize spectral centroid to [0,1] range (typical voice: 500–3000 Hz)
    const normalizedCentroid = spectralCentroid
      ? Math.min(Math.max((spectralCentroid - 500) / 2500, 0), 1)
      : 0.3;
    smoothedCentroid.current += 0.03 * (normalizedCentroid - smoothedCentroid.current);

    const rms = smoothedRms.current;
    const centroid = smoothedCentroid.current;

    // Time multiplier: faster animation when voice is bright/active
    const timeScale = isSpeech ? (1 + centroid * 2.5) : 0.6;
    const effectiveT = t * timeScale;

    // Displacement magnitude: silence = tiny breathing, loud speech = large deformation
    const baseDisplacement = 6;  // always present — the orb is never perfectly still
    const speechDisplacement = isSpeech ? rms * 55 : 0;
    const totalDisplacement = baseDisplacement + speechDisplacement;

    // Build vertex positions
    const points = VERTEX_PARAMS.map((params, i) => {
      const angle = (i / NUM_POINTS) * Math.PI * 2;
      const noise = noiseAt(params, effectiveT);
      const r = BASE_RADIUS + noise * totalDisplacement;
      return {
        x: CX + r * Math.cos(angle),
        y: CY + r * Math.sin(angle),
      };
    });

    const path = svgRef.current.querySelector('#orb-path');
    const glowPath = svgRef.current.querySelector('#orb-glow');
    if (path) path.setAttribute('d', buildBlobPath(points));
    if (glowPath) glowPath.setAttribute('d', buildBlobPath(points));

    // Update glow intensity based on speech energy
    const glowOpacity = isSpeech ? 0.12 + rms * 0.25 : 0.06;
    if (glowPath) glowPath.style.opacity = glowOpacity;

    rafRef.current = requestAnimationFrame(animate);
  }, [rmsLevel, spectralCentroid, isSpeech]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  // Color based on state
  const orbColor = state === 'recording' && isSpeech
    ? 'var(--white)'
    : state === 'recording'
    ? '#6a6460'
    : '#3a3530';

  const glowColor = isSpeech ? 'var(--white)' : '#3a3530';

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="orb-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      {/* Glow layer — blurred, behind the main shape */}
      <path
        id="orb-glow"
        fill={glowColor}
        filter="url(#orb-blur)"
        style={{ transition: 'fill 0.6s ease', opacity: 0.06 }}
      />

      {/* Main orb shape */}
      <path
        id="orb-path"
        fill="none"
        stroke={orbColor}
        strokeWidth={isSpeech ? '1.2' : '0.8'}
        style={{
          transition: 'stroke 0.4s ease, stroke-width 0.2s ease',
        }}
      />

      {/* Center dot — always visible, tiny */}
      <circle
        cx={CX}
        cy={CY}
        r={isSpeech ? 2.5 : 1.5}
        fill={orbColor}
        style={{ transition: 'r 0.3s ease, fill 0.4s ease' }}
      />
    </svg>
  );
}