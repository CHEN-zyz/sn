// Scene atmosphere parameters. Presets and sliders control the environment;
// corals respond naturally through lighting, bloom, fog.

export const params = {
  // Scene atmosphere (controlled by presets + sliders)
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

  // Mouse interactivity (not in presets, fixed behavior)
  mouseSwayStrength: 1.0,
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

// --- scene presets: purely atmosphere, no coral-specific values ---
export const PRESETS = {
  '기본': {
    bgColor: 0x000000, fogColor: 0x010509, fogDensity: 0.04,
    bloomStrength: 0.65, toneMappingExposure: 0.85,
    hemiSkyColor: 0x2a4a6a, hemiGroundColor: 0x05080d, hemiIntensity: 0.35,
    keyLightColor: 0xbfe0ff, keyLightIntensity: 0.8,
    fillLightColor: 0x4488cc, fillLightIntensity: 0.3,
    particleColor: 0x5ad0ff, particleSize: 0.045, particleOpacity: 0.62,
    shaftOpacity: 0.05,
  },
  '심해': {
    bgColor: 0x030a1a, fogColor: 0x0a1a38, fogDensity: 0.06,
    bloomStrength: 0.3, toneMappingExposure: 0.5,
    hemiSkyColor: 0x153565, hemiGroundColor: 0x040810, hemiIntensity: 0.25,
    keyLightColor: 0x3366bb, keyLightIntensity: 0.5,
    fillLightColor: 0x1a3366, fillLightIntensity: 0.2,
    particleColor: 0x2255aa, particleSize: 0.035, particleOpacity: 0.4,
    shaftOpacity: 0.03,
  },
  '생물발광': {
    bgColor: 0x041a14, fogColor: 0x0a3828, fogDensity: 0.03,
    bloomStrength: 1.6, toneMappingExposure: 1.1,
    hemiSkyColor: 0x20806a, hemiGroundColor: 0x0a2a1a, hemiIntensity: 0.5,
    keyLightColor: 0x66ffaa, keyLightIntensity: 1.0,
    fillLightColor: 0x33cc88, fillLightIntensity: 0.5,
    particleColor: 0x55ffbb, particleSize: 0.065, particleOpacity: 0.9,
    shaftOpacity: 0.12,
  },
  '급성장': {
    bgColor: 0x180a02, fogColor: 0x2a1508, fogDensity: 0.025,
    bloomStrength: 0.9, toneMappingExposure: 1.0,
    hemiSkyColor: 0x805020, hemiGroundColor: 0x1a0c04, hemiIntensity: 0.45,
    keyLightColor: 0xffaa55, keyLightIntensity: 1.0,
    fillLightColor: 0xdd6622, fillLightIntensity: 0.4,
    particleColor: 0xff7733, particleSize: 0.06, particleOpacity: 0.8,
    shaftOpacity: 0.1,
  },
}

export const EVOLUTION_THRESHOLD = 1.5

// Sliders: scene atmosphere only — what each does to the visual:
// 블룸 → coral glow spreads, edges blur, dreamy feel
// 안개 → distant corals fade into background tint
// 밝기 → overall scene brightness
// 입자 → floating underwater debris visibility
// 빛줄기 → overhead light shafts visible in the water
export const PARAM_DEFS = [
  { key: 'bloomStrength', label: '블룸 강도', min: 0.1, max: 2.0, step: 0.05 },
  { key: 'fogDensity', label: '안개 농도', min: 0.01, max: 0.1, step: 0.005 },
  { key: 'toneMappingExposure', label: '밝기', min: 0.3, max: 1.5, step: 0.05 },
  { key: 'particleOpacity', label: '입자 밝기', min: 0.1, max: 1.0, step: 0.05 },
  { key: 'shaftOpacity', label: '빛줄기', min: 0, max: 0.2, step: 0.01 },
]
