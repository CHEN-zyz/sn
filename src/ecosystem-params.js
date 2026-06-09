// Scene atmosphere + per-preset coral behavior.
// Presets control the whole environment; sliders fine-tune scene params only.

export const params = {
  // Scene atmosphere
  bgTop: '#3568a8',
  bgMid: '#1a3058',
  bgBottom: '#0a1428',
  fogColor: 0x1a3058,
  fogDensity: 0.045,
  bloomStrength: 0.65,
  toneMappingExposure: 0.85,
  hemiSkyColor: 0x2a4a6a,
  hemiGroundColor: 0x05080d,
  hemiIntensity: 0.35,
  keyLightColor: 0xbfe0ff,
  keyLightIntensity: 0.8,
  fillLightColor: 0x4488cc,
  fillLightIntensity: 0.3,
  particleColor: 0x5ad0ff,
  particleSize: 0.045,
  particleOpacity: 0.62,
  shaftOpacity: 0.05,

  // Coral behavior (set by presets, no slider)
  growthSpeed: 1.0,
  glowIntensity: 1.0,

  // Mouse (fixed, not in presets)
  mouseSwayStrength: 1.0,
}

// --- change tracking ---
let changeAccumulator = 0
const listeners = []
export function onParamChange(fn) { listeners.push(fn) }
export function getAccumulatedChange() { return changeAccumulator }
export function resetAccumulatedChange() { changeAccumulator = 0 }

// Only these keys contribute to the evolution accumulator (slider-range values, not colors/hex)
const TRACKABLE_KEYS = new Set(['bloomStrength', 'fogDensity', 'toneMappingExposure', 'particleOpacity', 'shaftOpacity'])

export function setParam(key, value) {
  const old = params[key]
  if (old === undefined) return
  params[key] = value
  if (TRACKABLE_KEYS.has(key)) changeAccumulator += Math.abs(value - old)
  listeners.forEach((fn) => fn(key, value, old))
}

export function applyPreset(preset) {
  Object.entries(preset).forEach(([k, v]) => {
    if (k in params) setParam(k, v)
  })
}

export const PRESETS = {
  // Blue underwater — clearly blue gradient, balanced
  '기본': {
    bgTop: '#3568a8', bgMid: '#1a3058', bgBottom: '#0a1428',
    fogColor: 0x1a3058, fogDensity: 0.045,
    bloomStrength: 0.65, toneMappingExposure: 0.9,
    hemiSkyColor: 0x4070a0, hemiGroundColor: 0x0a1020, hemiIntensity: 0.4,
    keyLightColor: 0xbfe0ff, keyLightIntensity: 0.8,
    fillLightColor: 0x4488cc, fillLightIntensity: 0.3,
    particleColor: 0x5ad0ff, particleSize: 0.045, particleOpacity: 0.62,
    shaftOpacity: 0.06,
    growthSpeed: 1.0, glowIntensity: 1.0,
  },
  // Deep abyss — dark blue, dim corals, barely any light
  '심해': {
    bgTop: '#1a3060', bgMid: '#0c1830', bgBottom: '#040810',
    fogColor: 0x0c1830, fogDensity: 0.08,
    bloomStrength: 0.2, toneMappingExposure: 0.55,
    hemiSkyColor: 0x152848, hemiGroundColor: 0x040810, hemiIntensity: 0.18,
    keyLightColor: 0x2244aa, keyLightIntensity: 0.35,
    fillLightColor: 0x102244, fillLightIntensity: 0.15,
    particleColor: 0x2255aa, particleSize: 0.03, particleOpacity: 0.3,
    shaftOpacity: 0.015,
    growthSpeed: 0.4, glowIntensity: 0.3,
  },
  // Green sea — visible green water, corals self-glow
  '생물발광': {
    bgTop: '#1a6838', bgMid: '#0c3018', bgBottom: '#041008',
    fogColor: 0x0c3018, fogDensity: 0.045,
    bloomStrength: 0.85, toneMappingExposure: 0.85,
    hemiSkyColor: 0x1a5035, hemiGroundColor: 0x081a10, hemiIntensity: 0.25,
    keyLightColor: 0x33bb66, keyLightIntensity: 0.5,
    fillLightColor: 0x1a7744, fillLightIntensity: 0.3,
    particleColor: 0x33ff88, particleSize: 0.05, particleOpacity: 0.7,
    shaftOpacity: 0.04,
    growthSpeed: 0.8, glowIntensity: 2.5,
  },
  // Shallow warm water — bright, sunlit, fast coral growth
  '급성장': {
    bgTop: '#4888b8', bgMid: '#284060', bgBottom: '#102030',
    fogColor: 0x284060, fogDensity: 0.03,
    bloomStrength: 0.5, toneMappingExposure: 1.3,
    hemiSkyColor: 0x5599bb, hemiGroundColor: 0x1a3040, hemiIntensity: 0.6,
    keyLightColor: 0xffeedd, keyLightIntensity: 1.3,
    fillLightColor: 0x66aacc, fillLightIntensity: 0.5,
    particleColor: 0x88ccee, particleSize: 0.04, particleOpacity: 0.55,
    shaftOpacity: 0.22,
    growthSpeed: 2.5, glowIntensity: 1.2,
  },
}

export const EVOLUTION_THRESHOLD = 1.5

// User-facing sliders: intuitive controls, not technical params
export const PARAM_DEFS = [
  { key: 'toneMappingExposure', label: '밝기', min: 0.3, max: 1.5, step: 0.05 },
]
