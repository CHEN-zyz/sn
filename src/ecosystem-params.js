// Centralised tunable parameters shared by the parameter panel, presets, mouse
// interactivity, and evolution mode.

export const params = {
  // Scene-level (controlled by presets, also individually tweakable)
  fogDensity: 0.04,
  bloomStrength: 0.65,
  particleColor: 0x5ad0ff,
  particleSize: 0.045,
  particleOpacity: 0.62,
  shaftOpacity: 0.05,
  snowOpacity: 0.36,
  toneMappingExposure: 0.85,

  // Per-coral / generative
  growthSpeed: 1.0,
  connectionDistance: 2,
  glowIntensity: 1.0,
  flowSpeed: 1.0,

  // Mouse interactivity
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
  changeAccumulator += Math.abs(value - old)
  listeners.forEach((fn) => fn(key, value, old))
}

export function applyPreset(preset) {
  Object.entries(preset).forEach(([k, v]) => {
    if (k in params) setParam(k, v)
  })
}

// --- scene presets (control fog, bloom, particles, shafts, exposure — the whole mood) ---
export const PRESETS = {
  '기본': {
    fogDensity: 0.04, bloomStrength: 0.65, particleColor: 0x5ad0ff, particleSize: 0.045,
    particleOpacity: 0.62, shaftOpacity: 0.05, snowOpacity: 0.36, toneMappingExposure: 0.85,
    growthSpeed: 1.0, connectionDistance: 2, glowIntensity: 1.0, flowSpeed: 1.0, mouseSwayStrength: 0.5,
  },
  '심해': {
    fogDensity: 0.07, bloomStrength: 0.35, particleColor: 0x1a3a5a, particleSize: 0.03,
    particleOpacity: 0.3, shaftOpacity: 0.02, snowOpacity: 0.55, toneMappingExposure: 0.5,
    growthSpeed: 0.5, connectionDistance: 1, glowIntensity: 0.3, flowSpeed: 0.3, mouseSwayStrength: 0.2,
  },
  '생물발광': {
    fogDensity: 0.03, bloomStrength: 1.4, particleColor: 0x80ffcc, particleSize: 0.06,
    particleOpacity: 0.85, shaftOpacity: 0.1, snowOpacity: 0.2, toneMappingExposure: 1.0,
    growthSpeed: 0.8, connectionDistance: 3, glowIntensity: 2.8, flowSpeed: 0.7, mouseSwayStrength: 0.6,
  },
  '급성장': {
    fogDensity: 0.025, bloomStrength: 0.8, particleColor: 0xff8855, particleSize: 0.055,
    particleOpacity: 0.75, shaftOpacity: 0.08, snowOpacity: 0.25, toneMappingExposure: 0.95,
    growthSpeed: 2.5, connectionDistance: 4, glowIntensity: 1.5, flowSpeed: 2.5, mouseSwayStrength: 0.8,
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
