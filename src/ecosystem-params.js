// Three user-facing axes: brightness, depth, coral activity.
// Presets set all three + color palette. Sliders fine-tune continuously.

export const params = {
  // User-facing continuous controls
  brightness: 0.9,   // overall exposure
  depth: 0.4,        // 0=shallow, 1=abyss → fog, light, gradient darkness
  activity: 0.5,     // 0=dormant, 1=thriving → growth speed, glow

  // Color palette (set by presets, derived values computed in animation loop)
  bgTopShallow: '#4888b8',   // gradient top when depth=0
  bgTopDeep: '#0c1830',      // gradient top when depth=1
  bgBottomShallow: '#1a3050', // gradient bottom when depth=0
  bgBottomDeep: '#040810',   // gradient bottom when depth=1
  fogColorShallow: 0x284060,
  fogColorDeep: 0x0c1830,
  hemiSkyColor: 0x4070a0,
  hemiGroundColor: 0x0a1020,
  keyLightColor: 0xbfe0ff,
  fillLightColor: 0x4488cc,
  particleColor: 0x5ad0ff,
  particleSize: 0.045,
  particleBaseOpacity: 0.62,
  shaftBaseOpacity: 0.06,

  // Mouse (fixed)
  mouseSwayStrength: 1.0,
}

// --- change tracking ---
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

// Presets define color palette + slider starting points
export const PRESETS = {
  '기본': {
    brightness: 0.9, depth: 0.4, activity: 0.5,
    bgTopShallow: '#4888b8', bgTopDeep: '#0c1830',
    bgBottomShallow: '#1a3050', bgBottomDeep: '#040810',
    fogColorShallow: 0x284060, fogColorDeep: 0x0c1830,
    hemiSkyColor: 0x4070a0, hemiGroundColor: 0x0a1020,
    keyLightColor: 0xbfe0ff, fillLightColor: 0x4488cc,
    particleColor: 0x5ad0ff, particleSize: 0.045, particleBaseOpacity: 0.62,
    shaftBaseOpacity: 0.06,
  },
  '심해': {
    brightness: 0.55, depth: 0.9, activity: 0.15,
    bgTopShallow: '#3060a0', bgTopDeep: '#0a1828',
    bgBottomShallow: '#102840', bgBottomDeep: '#020408',
    fogColorShallow: 0x1a3060, fogColorDeep: 0x060c1a,
    hemiSkyColor: 0x152848, hemiGroundColor: 0x040810,
    keyLightColor: 0x2244aa, fillLightColor: 0x102244,
    particleColor: 0x2255aa, particleSize: 0.03, particleBaseOpacity: 0.35,
    shaftBaseOpacity: 0.02,
  },
  '생물발광': {
    brightness: 0.85, depth: 0.55, activity: 0.85,
    bgTopShallow: '#2a8850', bgTopDeep: '#0a2810',
    bgBottomShallow: '#0c4020', bgBottomDeep: '#020a04',
    fogColorShallow: 0x1a5030, fogColorDeep: 0x081808,
    hemiSkyColor: 0x1a5035, hemiGroundColor: 0x081a10,
    keyLightColor: 0x33bb66, fillLightColor: 0x1a7744,
    particleColor: 0x33ff88, particleSize: 0.05, particleBaseOpacity: 0.7,
    shaftBaseOpacity: 0.04,
  },
  '급성장': {
    brightness: 1.3, depth: 0.1, activity: 1.0,
    bgTopShallow: '#5599cc', bgTopDeep: '#1a3050',
    bgBottomShallow: '#284868', bgBottomDeep: '#0a1828',
    fogColorShallow: 0x3a6888, fogColorDeep: 0x142838,
    hemiSkyColor: 0x5599bb, hemiGroundColor: 0x1a3040,
    keyLightColor: 0xffeedd, fillLightColor: 0x66aacc,
    particleColor: 0x88ccee, particleSize: 0.04, particleBaseOpacity: 0.55,
    shaftBaseOpacity: 0.22,
  },
}

export const EVOLUTION_THRESHOLD = 1.5

// Three intuitive sliders
export const PARAM_DEFS = [
  { key: 'brightness', label: '밝기', min: 0.3, max: 1.5, step: 0.05 },
  { key: 'depth', label: '수심', min: 0, max: 1, step: 0.02 },
  { key: 'activity', label: '산호 활성도', min: 0, max: 1, step: 0.02 },
]
