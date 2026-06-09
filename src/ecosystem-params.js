// Centralised tunable parameters shared by the parameter panel, presets, mouse
// interactivity, and evolution mode.

export const params = {
  growthSpeed: 1.0,
  connectionDistance: 2,
  glowIntensity: 1.0,
  particleDensity: 1.0,
  flowSpeed: 1.0,
  mouseSwayRadius: 3.0,
  mouseSwayStrength: 0.15,
  mouseParticleBoost: 2.0,
  lightFollowStrength: 0.3,
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

// --- presets ---
export const PRESETS = {
  '기본': { growthSpeed: 1.0, connectionDistance: 2, glowIntensity: 1.0, particleDensity: 1.0, flowSpeed: 1.0, mouseSwayStrength: 0.15 },
  '심해': { growthSpeed: 0.5, connectionDistance: 1, glowIntensity: 0.4, particleDensity: 0.6, flowSpeed: 0.4, mouseSwayStrength: 0.05 },
  '생물발광': { growthSpeed: 0.8, connectionDistance: 3, glowIntensity: 2.5, particleDensity: 1.4, flowSpeed: 0.7, mouseSwayStrength: 0.2 },
  '급성장': { growthSpeed: 2.5, connectionDistance: 4, glowIntensity: 1.2, particleDensity: 1.8, flowSpeed: 2.0, mouseSwayStrength: 0.3 },
}

export const EVOLUTION_THRESHOLD = 5.0

export const PARAM_DEFS = [
  { key: 'growthSpeed', label: '성장 속도', min: 0.2, max: 3.0, step: 0.1 },
  { key: 'connectionDistance', label: '연결 거리', min: 0, max: 5, step: 1 },
  { key: 'glowIntensity', label: '발광 강도', min: 0.1, max: 3.0, step: 0.1 },
  { key: 'particleDensity', label: '입자 밀도', min: 0.2, max: 2.5, step: 0.1 },
  { key: 'flowSpeed', label: '흐름 속도', min: 0.1, max: 3.0, step: 0.1 },
]
