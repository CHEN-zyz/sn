// Scene atmosphere + per-preset coral behavior.
// Presets control the whole environment; sliders fine-tune scene params only.

export const params = {
  // Scene atmosphere
  bgColor: 0x04081a,
  fogColor: 0x04081a,
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

export function setParam(key, value) {
  const old = params[key]
  if (old === undefined) return
  params[key] = value
  changeAccumulator += Math.abs(typeof value === 'number' && typeof old === 'number' ? value - old : 1)
  listeners.forEach((fn) => fn(key, value, old))
}

export function applyPreset(preset) {
  Object.entries(preset).forEach(([k, v]) => {
    if (k in params) setParam(k, v)
  })
}

export const PRESETS = {
  // Visibly blue deep water, balanced
  '기본': {
    bgColor: 0x04081a, fogColor: 0x04081a, fogDensity: 0.045,
    bloomStrength: 0.65, toneMappingExposure: 0.85,
    hemiSkyColor: 0x2a4a6a, hemiGroundColor: 0x05080d, hemiIntensity: 0.35,
    keyLightColor: 0xbfe0ff, keyLightIntensity: 0.8,
    fillLightColor: 0x4488cc, fillLightIntensity: 0.3,
    particleColor: 0x5ad0ff, particleSize: 0.045, particleOpacity: 0.62,
    shaftOpacity: 0.05,
    growthSpeed: 1.0, glowIntensity: 1.0,
  },
  // Almost no light, deep blue-black, corals barely visible, slow growth
  '심해': {
    bgColor: 0x020510, fogColor: 0x020510, fogDensity: 0.09,
    bloomStrength: 0.2, toneMappingExposure: 0.35,
    hemiSkyColor: 0x081020, hemiGroundColor: 0x020408, hemiIntensity: 0.12,
    keyLightColor: 0x1a3366, keyLightIntensity: 0.25,
    fillLightColor: 0x0a1a33, fillLightIntensity: 0.1,
    particleColor: 0x1a3355, particleSize: 0.025, particleOpacity: 0.2,
    shaftOpacity: 0.01,
    growthSpeed: 0.4, glowIntensity: 0.25,
  },
  // Dark green sea, corals self-glow brightly but bloom controlled (shape stays clear)
  '생물발광': {
    bgColor: 0x041a0e, fogColor: 0x041a0e, fogDensity: 0.05,
    bloomStrength: 0.85, toneMappingExposure: 0.75,
    hemiSkyColor: 0x0a3020, hemiGroundColor: 0x041008, hemiIntensity: 0.2,
    keyLightColor: 0x33aa66, keyLightIntensity: 0.4,
    fillLightColor: 0x1a6640, fillLightIntensity: 0.25,
    particleColor: 0x33ff88, particleSize: 0.05, particleOpacity: 0.7,
    shaftOpacity: 0.03,
    growthSpeed: 0.8, glowIntensity: 2.5,
  },
  // Warm shallow water, bright, fast coral growth
  '급성장': {
    bgColor: 0x0c2030, fogColor: 0x0c2030, fogDensity: 0.03,
    bloomStrength: 0.5, toneMappingExposure: 1.3,
    hemiSkyColor: 0x4488aa, hemiGroundColor: 0x183040, hemiIntensity: 0.55,
    keyLightColor: 0xffeedd, keyLightIntensity: 1.3,
    fillLightColor: 0x66aacc, fillLightIntensity: 0.5,
    particleColor: 0x88ccee, particleSize: 0.04, particleOpacity: 0.5,
    shaftOpacity: 0.2,
    growthSpeed: 2.5, glowIntensity: 1.2,
  },
}

export const EVOLUTION_THRESHOLD = 1.5

// Sliders: scene atmosphere only (coral behavior is preset-driven, no manual slider)
export const PARAM_DEFS = [
  { key: 'bloomStrength', label: '블룸 강도', min: 0.1, max: 2.0, step: 0.05 },
  { key: 'fogDensity', label: '안개 농도', min: 0.01, max: 0.12, step: 0.005 },
  { key: 'toneMappingExposure', label: '밝기', min: 0.2, max: 1.5, step: 0.05 },
  { key: 'particleOpacity', label: '입자 밝기', min: 0.1, max: 1.0, step: 0.05 },
  { key: 'shaftOpacity', label: '빛줄기', min: 0, max: 0.25, step: 0.01 },
]
