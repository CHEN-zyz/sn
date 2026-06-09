// Centralised tunable parameters for the entire scene atmosphere + coral behavior.

export const params = {
  // Scene atmosphere
  bgColor: 0x000000,
  fogColor: 0x010509,
  fogDensity: 0.04,
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

  // Coral behavior
  growthSpeed: 1.0,
  connectionDistance: 2,
  glowIntensity: 1.0,
  flowSpeed: 1.0,
  mouseSwayStrength: 0.5,
}

// --- change tracking (for evolution mode) ---
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

// --- scene presets: each defines a complete visual atmosphere ---
export const PRESETS = {
  '기본': {
    bgColor: 0x000000, fogColor: 0x010509, fogDensity: 0.04,
    bloomStrength: 0.65, toneMappingExposure: 0.85,
    hemiSkyColor: 0x2a4a6a, hemiGroundColor: 0x05080d, hemiIntensity: 0.35,
    keyLightColor: 0xbfe0ff, keyLightIntensity: 0.8,
    fillLightColor: 0x4488cc, fillLightIntensity: 0.3,
    particleColor: 0x5ad0ff, particleSize: 0.045, particleOpacity: 0.62,
    shaftOpacity: 0.05,
    growthSpeed: 1.0, connectionDistance: 2, glowIntensity: 1.0, flowSpeed: 1.0,
  },
  '심해': {
    bgColor: 0x000408, fogColor: 0x020810, fogDensity: 0.07,
    bloomStrength: 0.3, toneMappingExposure: 0.45,
    hemiSkyColor: 0x0a1a2a, hemiGroundColor: 0x020406, hemiIntensity: 0.2,
    keyLightColor: 0x4466aa, keyLightIntensity: 0.4,
    fillLightColor: 0x1a2a44, fillLightIntensity: 0.15,
    particleColor: 0x1a3a5a, particleSize: 0.03, particleOpacity: 0.3,
    shaftOpacity: 0.02,
    growthSpeed: 0.5, connectionDistance: 1, glowIntensity: 0.3, flowSpeed: 0.3,
  },
  '생물발광': {
    bgColor: 0x000a08, fogColor: 0x021a14, fogDensity: 0.03,
    bloomStrength: 1.4, toneMappingExposure: 1.0,
    hemiSkyColor: 0x1a5a4a, hemiGroundColor: 0x081a14, hemiIntensity: 0.45,
    keyLightColor: 0x80ffc0, keyLightIntensity: 0.9,
    fillLightColor: 0x40cc90, fillLightIntensity: 0.4,
    particleColor: 0x80ffcc, particleSize: 0.06, particleOpacity: 0.85,
    shaftOpacity: 0.1,
    growthSpeed: 0.8, connectionDistance: 3, glowIntensity: 2.8, flowSpeed: 0.7,
  },
  '급성장': {
    bgColor: 0x080400, fogColor: 0x0f0804, fogDensity: 0.025,
    bloomStrength: 0.85, toneMappingExposure: 0.95,
    hemiSkyColor: 0x5a3a1a, hemiGroundColor: 0x0d0804, hemiIntensity: 0.4,
    keyLightColor: 0xffcc88, keyLightIntensity: 0.9,
    fillLightColor: 0xcc6633, fillLightIntensity: 0.35,
    particleColor: 0xff8855, particleSize: 0.055, particleOpacity: 0.75,
    shaftOpacity: 0.08,
    growthSpeed: 2.5, connectionDistance: 4, glowIntensity: 1.5, flowSpeed: 2.5,
  },
}

export const EVOLUTION_THRESHOLD = 1.5

export const PARAM_DEFS = [
  { key: 'growthSpeed', label: '성장 속도', min: 0.2, max: 3.0, step: 0.1 },
  { key: 'connectionDistance', label: '연결 수', min: 0, max: 5, step: 1 },
  { key: 'glowIntensity', label: '발광 강도', min: 0.1, max: 3.0, step: 0.1 },
  { key: 'flowSpeed', label: '흐름 속도', min: 0.1, max: 3.0, step: 0.1 },
  { key: 'bloomStrength', label: '블룸', min: 0.1, max: 2.0, step: 0.05 },
  { key: 'fogDensity', label: '안개', min: 0.01, max: 0.1, step: 0.005 },
]
