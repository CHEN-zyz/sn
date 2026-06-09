// Three user-facing axes: brightness, depth (ocean layer), coral activity.
// Depth maps to real ocean zones with piecewise color/fog/light curves in main.js.
// Presets set slider positions + lighting palette.

export const params = {
  brightness: 0.9,
  depth: 0.35,
  activity: 0.5,

  // Lighting palette (set by presets — determines the COLOR of light, not intensity)
  hemiSkyColor: 0x4080a0,
  hemiGroundColor: 0x0a1020,
  keyLightColor: 0xbfe0ff,
  fillLightColor: 0x4488cc,
  particleColor: 0x5ad0ff,
  particleSize: 0.045,
  particleBaseOpacity: 0.62,
  shaftBaseOpacity: 0.06,

  mouseSwayStrength: 1.0,
}

let changeAccumulator = 0
const listeners = []
const TRACKABLE = new Set(['brightness', 'depth', 'activity'])
export function onParamChange(fn) { listeners.push(fn) }
export function getAccumulatedChange() { return changeAccumulator }
export function resetAccumulatedChange() { changeAccumulator = 0 }

export function setParam(key, value) {
  const old = params[key]
  if (old === undefined) return
  params[key] = value
  if (TRACKABLE.has(key)) changeAccumulator += Math.abs(value - old)
  listeners.forEach((fn) => fn(key, value, old))
}

export function applyPreset(preset) {
  Object.entries(preset).forEach(([k, v]) => {
    if (k in params) setParam(k, v)
  })
}

// Presets: depth sets the ocean layer (color derived from depth curves in main.js)
// Lighting palette determines the tint/mood on top of the depth-derived base
export const PRESETS = {
  '기본': {
    brightness: 0.9, depth: 0.3, activity: 0.5,
    hemiSkyColor: 0x4080a0, hemiGroundColor: 0x0a1020,
    keyLightColor: 0xbfe0ff, fillLightColor: 0x4488cc,
    particleColor: 0x5ad0ff, particleSize: 0.045, particleBaseOpacity: 0.62,
  },
  '심해': {
    brightness: 0.6, depth: 0.9, activity: 0.12,
    hemiSkyColor: 0x152848, hemiGroundColor: 0x040810,
    keyLightColor: 0x2244aa, fillLightColor: 0x102244,
    particleColor: 0x2255aa, particleSize: 0.03, particleBaseOpacity: 0.3,
  },
  '생물발광': {
    brightness: 0.85, depth: 0.15, activity: 0.85,
    hemiSkyColor: 0x1a5040, hemiGroundColor: 0x081a10,
    keyLightColor: 0x33bb66, fillLightColor: 0x1a7744,
    particleColor: 0x33ff88, particleSize: 0.055, particleBaseOpacity: 0.75,
  },
  '급성장': {
    brightness: 1.3, depth: 0.1, activity: 1.0,
    hemiSkyColor: 0x5599bb, hemiGroundColor: 0x1a3040,
    keyLightColor: 0xffeedd, fillLightColor: 0x66aacc,
    particleColor: 0x88ddee, particleSize: 0.04, particleBaseOpacity: 0.55,
  },
}

export const EVOLUTION_THRESHOLD = 1.5

export const PARAM_DEFS = [
  { key: 'brightness', label: '밝기', min: 0.3, max: 1.5, step: 0.05 },
  { key: 'depth', label: '수심', min: 0, max: 1, step: 0.02 },
  { key: 'activity', label: '산호 활성도', min: 0, max: 1, step: 0.02 },
]
