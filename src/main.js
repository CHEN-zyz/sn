import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { createNoise3D } from 'simplex-noise'
import { createOfficialUI } from './official-ui.js'
import { params, setParam, getAccumulatedChange, resetAccumulatedChange, EVOLUTION_THRESHOLD } from './ecosystem-params.js'
import './style.css'
import './official-ui.css'

const CATEGORIES = [
  { name: '뉴스·시사', color: 0x4a90d9, keys: ['news','뉴스','시사','정치','politics','current'] },
  { name: '경제·투자', color: 0x50c878, keys: ['경제','finance','invest','stock','crypto','money','market','부동산'] },
  { name: '요리', color: 0xf0756b, keys: ['cook','recipe','먹방','요리','food','baking','맛집','mukbang'] },
  { name: '게임', color: 0xffa83a, keys: ['game','gaming','게임','gamer','play','minecraft','fortnite','lol','valorant'] },
  { name: '스포츠', color: 0x5ee8a0, keys: ['sport','축구','야구','basketball','soccer','football','운동','workout','fitness'] },
  { name: '소프트웨어·AI', color: 0x7ab8ff, keys: ['code','coding','programming','개발','software','ai','machine learning','python','javascript','데이터'] },
  { name: '환경·기후', color: 0x37e0c8, keys: ['climate','환경','environment','green','sustainability','eco','재활용'] },
  { name: '광고·마케팅', color: 0xb98cff, keys: ['marketing','마케팅','광고','brand','branding','seo','digital marketing'] },
  { name: '음악', color: 0xff6b9d, keys: ['music','음악','song','album','concert','mv','lyrics','guitar','piano','cover'] },
  { name: '디자인·예술', color: 0xc084fc, keys: ['design','디자인','art','예술','illustration','figma','photoshop','drawing','ui','ux'] },
  { name: '여행', color: 0x41cbff, keys: ['travel','여행','vlog','trip','tour','hotel','flight','관광'] },
  { name: '영감·인사이트', color: 0xffd700, keys: ['inspire','motivation','ted','insight','인사이트','self','mindset','성장'] },
  { name: '학습', color: 0x64dfdf, keys: ['learn','교육','tutorial','lecture','study','course','how to','강의','수학','science','english'] },
  { name: '스타일', color: 0xff85a2, keys: ['fashion','style','패션','beauty','makeup','스타일','haul','outfit','skincare'] },
]
const OFFICIAL_CATEGORY_NAMES = {
  '뉴스·시사': '뉴스·시사',
  '경제·투자': '경제·시장·투자',
  '요리': '요리',
  '게임': '게임',
  '스포츠': '스포츠',
  '소프트웨어·AI': '소프트웨어·데이터·AI',
  '환경·기후': '환경·기후',
  '광고·마케팅': '광고·마케팅',
  '음악': '음악',
  '디자인·예술': '디자인·예술',
  '여행': '여행',
  '영감·인사이트': '영감·인사이트',
  '학습': '학습',
  '스타일': '스타일',
}
function officialCategoryName(name) {
  return OFFICIAL_CATEGORY_NAMES[name] || name
}
const WEIGHTS = [0.5, 0.3, 0.2]
const urlParams = new URLSearchParams(window.location.search)
const capturePreset = urlParams.get('capture')
const pvAutoStart = urlParams.get('pv') === '1'
const captureMode = ['void', 'signal', 'forming', 'solo', 'trio', 'reef'].includes(capturePreset)
const officialMode = !captureMode
if (captureMode) document.body.classList.add('capture-mode')
if (officialMode) document.body.classList.add('official-app')
const GROW_DUR = 1.8
const clamp = THREE.MathUtils.clamp
const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)
const easeOut = (k) => 1 - Math.pow(1 - k, 3)
const easeOutBack = (k) => { const c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2) }
const _v = new THREE.Vector3()
const noise3D = createNoise3D()

const corals = []
const coralTemplates = []
let coralTemplate = null
let officialUI = null
let introPreviewCorals = []
let focused = null
let hovered = null
let camTween = null
let overviewPos = new THREE.Vector3(0, 2, 8)
let overviewTarget = new THREE.Vector3(0, 0, 0)

// Mouse world-position tracking (for coral sway + particle activation)
const mouseNDC = new THREE.Vector2(0, 0)
const mouseWorld = new THREE.Vector3(0, 0, 0)
const _mousePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const _mouseRay = new THREE.Raycaster()

// Drag-on-coral state
let dragCoral = null
let dragStart = null
let isDragging = false

// Evolution mode
let evolutionActive = false
let evolutionStart = 0
const EVOLUTION_DURATION = 3.0

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.85
document.body.appendChild(renderer.domElement)

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'fixed'
labelRenderer.domElement.style.top = '0'
labelRenderer.domElement.style.left = '0'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement)

const scene = new THREE.Scene()
// Underwater gradient background: lighter at top (surface), darker at bottom (abyss)
const bgCanvas = document.createElement('canvas')
bgCanvas.width = 2; bgCanvas.height = 512
const bgCtx = bgCanvas.getContext('2d')
function drawBgGradient(topHex, midHex, bottomHex) {
  const g = bgCtx.createLinearGradient(0, 0, 0, 512)
  g.addColorStop(0, topHex)
  g.addColorStop(0.5, midHex)
  g.addColorStop(1, bottomHex)
  bgCtx.fillStyle = g
  bgCtx.fillRect(0, 0, 2, 512)
  if (bgTexture) bgTexture.needsUpdate = true
}
drawBgGradient('#3568a8', '#1a3058', '#0a1428')
const bgTexture = new THREE.CanvasTexture(bgCanvas)
bgTexture.colorSpace = THREE.SRGBColorSpace
scene.background = bgTexture
scene.fog = new THREE.FogExp2(0x1a3058, 0.045)

const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
scene.environmentIntensity = 0.5
pmrem.dispose()

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 2, 8)

const hemiLight = new THREE.HemisphereLight(0x2a4a6a, 0x05080d, 0.35)
scene.add(hemiLight)
const keyLight = new THREE.DirectionalLight(0xbfe0ff, 0.8)
keyLight.position.set(3, 8, 5)
scene.add(keyLight)
const fillLight = new THREE.DirectionalLight(0x4488cc, 0.3)
fillLight.position.set(-4, 2, -3)
scene.add(fillLight)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.minDistance = 2.5
controls.maxDistance = 25
controls.maxPolarAngle = Math.PI * 0.88
controls.target.set(0, 0, 0)

const reef = new THREE.Group()
scene.add(reef)

const MODEL_PATHS = ['/models/coral.glb', '/models/coral2.glb', '/models/coral3.glb', '/models/coral4.glb', '/models/coral5.glb', '/models/coral6.glb', '/models/coral7.glb']
let modelsLoaded = 0
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
const loader = new GLTFLoader()
loader.setDRACOLoader(dracoLoader)
MODEL_PATHS.forEach((path, i) => {
  loader.load(path, (gltf) => {
    coralTemplates[i] = gltf.scene
    if (!coralTemplate) coralTemplate = gltf.scene
    modelsLoaded++
    maybeBuildCaptureScene()

    officialUI?.onModelsProgress?.(modelsLoaded, MODEL_PATHS.length)
    if (modelsLoaded === MODEL_PATHS.length) officialUI?.onModelsReady()
  }, undefined, (err) => {
    console.warn('load failed: ' + path, err)
    modelsLoaded++
    maybeBuildCaptureScene()

    officialUI?.onModelsProgress?.(modelsLoaded, MODEL_PATHS.length)
    if (modelsLoaded === MODEL_PATHS.length) officialUI?.onModelsReady()
  })
})

function findPlacement() {
  if (corals.length === 0) return new THREE.Vector3(0, 0, 0)
  const minDist = 2.2
  for (let r = 1; r < 8; r++) {
    const radius = r * 1.6
    const n = Math.max(6, r * 5)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r * 0.7
      const y = (Math.sin(a * 2.3 + r) * 0.8 + (Math.random() - 0.5) * 0.6)
      const pos = new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius)
      if (corals.every((c) => c.group.position.distanceTo(pos) > minDist)) return pos
    }
  }
  return new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 6)
}

function displaceVertices(inner, amplitude) {
  inner.traverse((o) => {
    if (!o.isMesh || !o.geometry) return
    const pos = o.geometry.attributes.position
    if (!pos) return
    const arr = pos.array
    for (let i = 0; i < arr.length; i += 3) {
      const n = noise3D(arr[i] * 2, arr[i + 1] * 2, arr[i + 2] * 2) * amplitude
      arr[i] += n * 0.15
      arr[i + 1] += n * 0.15
      arr[i + 2] += n * 0.15
    }
    pos.needsUpdate = true
    o.geometry.computeVertexNormals()
  })
}

function pickTemplate(data) {
  const available = coralTemplates.filter(Boolean)
  if (available.length === 0) return coralTemplate
  if (Number.isInteger(data.modelIndex) && coralTemplates[data.modelIndex]) return coralTemplates[data.modelIndex]
  const catIdx = CATEGORIES.indexOf(data.cat)
  const modelIdx = catIdx >= 0 ? catIdx % available.length : corals.length % available.length
  return available[modelIdx]
}

function addCoralFromData(data) {
  if (!coralTemplate) return
  const group = new THREE.Group()
  const template = pickTemplate(data)
  const inner = template.clone(true)
  group.add(inner)

  const box = new THREE.Box3().setFromObject(group)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const baseNorm = 1.2 / maxDim

  const yStretch = 1.0 + data.weight * 0.3
  const xzGirth = 0.85 + Math.min(data.diversity / 15, 1) * 0.2

  const color = new THREE.Color(data.cat.color)
  const mats = []
  inner.traverse((o) => {
    if (o.isMesh && o.material) {
      o.material = o.material.clone()
      o.material.transparent = true
      o.material.opacity = (0.4 + data.weight * 0.6) * (data.captureOpacity ?? 1)
      o.material.emissive = color.clone()
      o.material.emissiveIntensity = (0.1 + data.recency * 0.5) * (data.captureGlow ?? 1)
      o.material.roughness = 0.3 + (1 - Math.min(data.diversity / 15, 1)) * 0.5
      mats.push(o.material)
    }
  })

  displaceVertices(inner, 0.15 + data.weight * 0.25)
  inner.position.sub(center)

  const pos = data.position ? new THREE.Vector3(...data.position) : findPlacement()
  if (!data.position) pos.y += (data.weight - 0.3) * 1.2
  group.position.copy(pos)
  group.rotation.order = 'ZXY'
  group.rotation.y = data.rotationY ?? Math.random() * Math.PI * 2
  group.rotation.x = data.rotationX ?? (Math.random() - 0.5) * 0.2
  group.rotation.z = data.rotationZ ?? (Math.random() - 0.5) * 0.15
  group.scale.setScalar(0.001)

  const div = document.createElement('div')
  div.className = 'label'
  div.style.borderColor = 'rgba(' + Math.round(color.r * 255) + ',' + Math.round(color.g * 255) + ',' + Math.round(color.b * 255) + ',0.45)'
  const labelName = data.subcats && data.subcats.length > 1
    ? data.subcats.map((s) => officialCategoryName(s.cat.name)).join('·') + ' 산호'
    : data.cat.name + ' 산호'
  div.textContent = labelName
  div.style.opacity = '0'
  const label = new CSS2DObject(div)
  label.position.set(0, (size.y * baseNorm * yStretch) / 2 + 0.6, 0)
  label.layers.set(0)
  group.add(label)

  const spinSpeed = 0.04 + clamp(data.trend + 0.5, 0, 1) * 0.12

  const obj = {
    group, mats, color, baseNorm, yStretch, xzGirth,
    baseScale: baseNorm, phase: Math.random() * 10,
    labelEl: div, data,
    growStart: timer.getElapsed(), grown: false,
    fade: 1, fadeTarget: 1, removing: false, removeStart: 0,
    spinSpeed, breathFreq: 0.5 + data.recency * 2,
  }
  group.userData.clusterRef = obj
  reef.add(group)
  corals.push(obj)

  if (!captureMode) rebuildConnections()
  updateOverview()
  return obj
}

let captureBuilt = false
function captureData(catIndex, modelIndex, position, weight, diversity, recency, trend, rotationY = 0) {
  const cat = CATEGORIES[catIndex]
  return {
    cat, modelIndex, position, rotationY,
    weight, count: Math.round(20 + weight * 80),
    diversity, recency, trend,
    subcats: [{ cat, weight: 1 }],
  }
}

function addCaptureSignal(position = [0, 0, 0], size = 0.08) {
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(size, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x7fe9ff }),
  )
  glow.position.set(...position)
  scene.add(glow)

  const light = new THREE.PointLight(0x65dcff, 3.5, 3)
  light.position.copy(glow.position)
  scene.add(light)
}

function maybeBuildCaptureScene() {
  if (!captureMode || captureBuilt || modelsLoaded < MODEL_PATHS.length || !coralTemplate) return
  captureBuilt = true

  const presets = {
    void: [],
    signal: [
      { ...captureData(8, 4, [0, 0.05, -0.4], 0.72, 8, 0.5, 0.1, -0.35), captureOpacity: 0.13, captureGlow: 0.35 },
    ],
    forming: [
      { ...captureData(8, 4, [0, 0.05, 0], 0.8, 10, 0.72, 0.25, -0.35), captureOpacity: 0.48, captureGlow: 1.35 },
    ],
    solo: [
      captureData(8, 4, [0, 0, 0], 0.86, 11, 0.72, 0.35, -0.35),
    ],
    trio: [
      captureData(10, 0, [-2.1, -0.15, 0.15], 0.72, 8, 0.82, 0.18, 0.25),
      captureData(5, 3, [0, 0.25, -0.35], 0.95, 13, 0.92, 0.4, -0.2),
      captureData(9, 6, [2.15, -0.2, 0.2], 0.66, 6, 0.7, -0.05, 0.45),
    ],
    reef: [
      captureData(10, 0, [-2.8, -0.7, 0.6], 0.58, 6, 0.64, -0.1, 0.25),
      captureData(6, 1, [-1.9, 0.65, -0.85], 0.78, 9, 0.82, 0.2, -0.35),
      captureData(8, 2, [-0.75, -0.35, 0.85], 0.68, 7, 0.72, 0.1, 0.4),
      captureData(5, 3, [0, 0.85, -1.15], 0.96, 14, 0.88, 0.45, -0.1),
      captureData(2, 4, [0.9, -0.65, 0.7], 0.62, 5, 0.58, -0.15, 0.35),
      captureData(9, 5, [1.75, 0.45, -0.65], 0.82, 10, 0.76, 0.22, -0.3),
      captureData(13, 6, [2.8, -0.55, 0.55], 0.55, 6, 0.66, 0.05, 0.5),
    ],
  }

  presets[capturePreset].forEach(addCoralFromData)
  if (capturePreset === 'void') addCaptureSignal([-0.55, 0.15, 0], 0.065)
  if (capturePreset === 'signal') addCaptureSignal([-0.45, 0.08, 0.35], 0.07)
  reef.rotation.y = capturePreset === 'solo' ? 0.2 : -0.08

  if (capturePreset === 'void') {
    overviewTarget.set(0, 0, 0)
    overviewPos.set(0, 0.5, 5.2)
  } else if (capturePreset === 'signal') {
    overviewTarget.set(0, 0.1, 0)
    overviewPos.set(0, 0.65, 5.1)
  } else if (capturePreset === 'forming') {
    overviewTarget.set(0, 0.2, 0)
    overviewPos.set(0, 0.85, 3.75)
  } else if (capturePreset === 'solo') {
    overviewTarget.set(0, 0.25, 0)
    overviewPos.set(0, 0.85, 3.25)
  } else if (capturePreset === 'trio') {
    overviewTarget.set(0, 0.1, 0)
    overviewPos.set(0, 1.35, 6.25)
  } else {
    overviewTarget.set(0, 0, 0)
    overviewPos.set(0, 1.8, 8.4)
  }
  camera.position.copy(overviewPos)
  controls.target.copy(overviewTarget)
  controls.update()
}


// === Integrated PV system ===
let pvPlaying = false
let pvElapsed = 0
const pvCreatedCorals = []
const pvCards = []

// PV coral schedule: [time, position]
const PV_SCHEDULE = [
  { t: 4, pos: [0, 0, 0] },
  { t: 9, pos: [-2.5, -0.2, 0] },
  { t: 13, pos: [2.3, 0.3, 0] },
  { t: 16, pos: [-1.5, 0.8, 0] },
  { t: 17.5, pos: [1.2, -0.6, 0] },
]
const PV_DEPTH_CURVE = [[0, 1.0], [4, 0.95], [8, 0.75], [13, 0.55], [16, 0.4], [20, 0.3], [26, 0.25]]
const PV_CAM = [
  { t: 0, pos: [0, 0.5, 10], tgt: [0, 0, 0] },
  { t: 4, pos: [0, 0.3, 4.5], tgt: [0, 0, 0] },
  { t: 8, pos: [0.3, 0.3, 4.0], tgt: [0, 0, 0] },
  { t: 9, pos: [-1.5, 0.2, 4.5], tgt: [-2.5, -0.2, 0] },
  { t: 12, pos: [0, 0.3, 5.0], tgt: [0, 0, 0] },
  { t: 13, pos: [1.5, 0.4, 4.5], tgt: [2.3, 0.3, 0] },
  { t: 15.5, pos: [0, 0.5, 6.5], tgt: [0, 0, 0] },
  { t: 18, pos: [0, 0.5, 8.0], tgt: [0, 0, 0] },
  { t: 22, pos: [0, 0.5, 9.0], tgt: [0, 0, 0] },
]

function startPV() {
  pvPlaying = true
  pvElapsed = 0
  pvCreatedCorals.forEach((c) => { reef.remove(c.group); const idx = corals.indexOf(c); if (idx >= 0) corals.splice(idx, 1) })
  pvCreatedCorals.length = 0
  pvCards.forEach((el) => el.remove())
  pvCards.length = 0
  clearIntroPreview()
  reef.rotation.y = 0
  setParam('depth', 1.0)
  controls.enableRotate = false
  controls.enablePan = false
  controls.enableZoom = false
}

function stopPV() {
  pvPlaying = false
  controls.enableRotate = true
  controls.enablePan = true
  controls.enableZoom = true
  // PV corals become intro preview corals
  pvCreatedCorals.forEach((c) => { c.isIntroPreview = true; c.hideLabel = true; c.labelEl.style.display = 'none' })
  introPreviewCorals = [...pvCreatedCorals]
  pvCreatedCorals.length = 0
  overviewTarget.set(0, 0, 0)
  overviewPos.set(0, 1.25, 7.8)
}

function samplePVCurve(stops, t) {
  for (let i = 0; i < stops.length - 1; i++) {
    if (t <= stops[i + 1][0]) {
      const k = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0])
      return stops[i][1] + (stops[i + 1][1] - stops[i][1]) * k
    }
  }
  return stops[stops.length - 1][1]
}

function samplePVCam(t) {
  for (let i = 0; i < PV_CAM.length - 1; i++) {
    if (t <= PV_CAM[i + 1].t) {
      const k = easeInOut((t - PV_CAM[i].t) / (PV_CAM[i + 1].t - PV_CAM[i].t))
      return {
        pos: PV_CAM[i].pos.map((v, j) => v + (PV_CAM[i + 1].pos[j] - v) * k),
        tgt: PV_CAM[i].tgt.map((v, j) => v + (PV_CAM[i + 1].tgt[j] - v) * k),
      }
    }
  }
  const last = PV_CAM[PV_CAM.length - 1]
  return { pos: last.pos, tgt: last.tgt }
}

function createPVCard(coral, cats) {
  const card = officialUI?.createPVCard?.(cats)
  if (card) { document.body.appendChild(card); pvCards.push(card) }
  return card
}

function updatePV(dt) {
  if (!pvPlaying) return
  pvElapsed += dt

  // Drive depth
  setParam('depth', samplePVCurve(PV_DEPTH_CURVE, pvElapsed))

  // Drive camera
  const cam = samplePVCam(pvElapsed)
  camera.position.set(...cam.pos)
  controls.target.set(...cam.tgt)
  camera.lookAt(...cam.tgt)

  // Create corals at scheduled times
  PV_SCHEDULE.forEach((sched, i) => {
    if (pvElapsed >= sched.t && !pvCreatedCorals[i]) {
      const shuffled = [...CATEGORIES].sort(() => Math.random() - 0.5)
      const cats = shuffled.slice(0, 3)
      const data = {
        cat: cats[0], weight: 0.5 + Math.random() * 0.4,
        count: 15 + Math.floor(Math.random() * 25), diversity: 4 + Math.floor(Math.random() * 6),
        recency: 0.5 + Math.random() * 0.4, trend: (Math.random() - 0.5) * 0.3,
        subcats: cats.map((cat, j) => ({ cat, weight: WEIGHTS[j] })),
        position: sched.pos,
      }
      const coral = addCoralFromData(data)
      if (coral) {
        pvCreatedCorals[i] = coral
        coral._pvCard = createPVCard(coral, cats)
        coral._pvCardShowTime = pvElapsed
      }
    }
  })

  // Update card positions + fade
  pvCreatedCorals.forEach((c) => {
    if (!c || !c._pvCard) return
    const age = pvElapsed - c._pvCardShowTime
    const wp = c.group.getWorldPosition(new THREE.Vector3()).project(camera)
    const x = (wp.x * 0.5 + 0.5) * window.innerWidth
    const y = (-wp.y * 0.5 + 0.5) * window.innerHeight
    c._pvCard.style.left = `${x + 60}px`
    c._pvCard.style.top = `${y - 40}px`
    // Float up + fade in for 2s, hold 2s, fade out 1s
    if (age < 2) {
      c._pvCard.style.opacity = String(age / 2)
      c._pvCard.style.transform = `translateY(${20 - age * 10}px)`
    } else if (age < 4) {
      c._pvCard.style.opacity = '1'
      c._pvCard.style.transform = 'translateY(0)'
    } else if (age < 5) {
      c._pvCard.style.opacity = String(1 - (age - 4))
      c._pvCard.style.transform = `translateY(${-(age - 4) * 15}px)`
    } else {
      c._pvCard.style.opacity = '0'
    }
  })

  // After all corals appear (18s), accelerating rotation for 8s → exactly one full turn back to front
  if (pvElapsed > 18) {
    const rt = pvElapsed - 18  // seconds since rotation started
    // θ = ½at², a = 2π / (½ * 8²) = π/16
    reef.rotation.y = (Math.PI / 16) * rt * rt  // accelerating, reaches 2π at t=8
  }

  // End PV at ~26s
  if (pvElapsed >= 26) {
    pvCards.forEach((el) => el.remove())
    pvCards.length = 0
    stopPV()
    officialUI?.onPVEnd?.()
  }
}

function addCoralManual(cats) {
  const catIndices = cats.map((c) => CATEGORIES.indexOf(c.cat))
  const primaryIdx = catIndices[0] >= 0 ? catIndices[0] : 0
  const spread = new Set(catIndices).size
  const data = {
    cat: cats[0].cat,
    weight: 0.3 + (WEIGHTS[0]) * (0.5 + primaryIdx / CATEGORIES.length * 0.5),
    count: 5 + primaryIdx * 3 + spread * 4,
    diversity: spread + Math.floor(primaryIdx / 3) + 2,
    recency: 0.4 + WEIGHTS[0] * 0.6,
    trend: (primaryIdx % 3 - 1) * 0.3,
    subcats: cats.map((c, i) => ({ cat: c.cat, weight: WEIGHTS[i] })),
  }
  return addCoralFromData(data)
}

function updateCoralProfile(coral, weightedCats) {
  if (!coral || !weightedCats.length) return
  const total = weightedCats.reduce((sum, item) => sum + item.weight, 0) || 1
  const normalized = weightedCats
    .map((item) => ({ cat: item.cat, weight: item.weight / total }))
    .sort((a, b) => b.weight - a.weight)
  const primary = normalized[0]

  coral.data.cat = primary.cat
  coral.data.subcats = normalized
  coral.data.weight = primary.weight
  coral.data.diversity = normalized.length + 2
  coral.data.recency = 0.55 + primary.weight * 0.4
  coral.color.set(primary.cat.color)
  coral.yStretch = 1 + primary.weight * 0.34
  coral.xzGirth = 0.9 + (1 - primary.weight) * 0.18

  coral.mats.forEach((material) => {
    material.emissive.copy(coral.color)
    material.roughness = 0.34 + primary.weight * 0.28
  })
  coral.labelEl.textContent = normalized.map((item) => officialCategoryName(item.cat.name)).join('·') + ' 산호'
}

function clearIntroPreview() {
  introPreviewCorals.forEach((coral) => {
    reef.remove(coral.group)
    const index = corals.indexOf(coral)
    if (index >= 0) corals.splice(index, 1)
  })
  introPreviewCorals = []
  rebuildConnections()
  updateOverview()
}

function seedIntroPreview() {
  if (!officialMode || introPreviewCorals.length || modelsLoaded < MODEL_PATHS.length || !coralTemplate) return
  const previewData = [
    captureData(8, 4, [-2.8, -0.55, 0.4], 0.72, 8, 0.72, 0.15, 0.2),
    captureData(5, 3, [-1.25, 0.65, -1.1], 0.88, 11, 0.84, 0.2, -0.35),
    captureData(6, 1, [0.2, -0.45, 0.75], 0.62, 7, 0.68, 0.05, 0.4),
    captureData(9, 5, [1.55, 0.55, -0.85], 0.78, 9, 0.76, 0.18, -0.25),
    captureData(10, 0, [2.9, -0.6, 0.35], 0.58, 6, 0.64, -0.08, 0.45),
  ]
  introPreviewCorals = previewData.map((data) => {
    data.isIntroPreview = true
    const coral = addCoralFromData(data)
    if (coral) {
      coral.isIntroPreview = true
      coral.hideLabel = true
      coral.labelEl.style.display = 'none'
    }
    return coral
  }).filter(Boolean)
  overviewTarget.set(0, 0, 0)
  overviewPos.set(0, 1.25, 7.8)
  camera.position.copy(overviewPos)
  controls.target.copy(overviewTarget)
  controls.update()
}

function removeCoral(c) {
  c.removing = true
  c.removeStart = timer.getElapsed()
  if (focused === c) focused = null
  for (const o of corals) o.fadeTarget = 1
}

function finishRemove(c) {
  reef.remove(c.group)
  const idx = corals.indexOf(c)
  if (idx >= 0) corals.splice(idx, 1)
  rebuildConnections()
  updateOverview()
}

let lineMesh = null
function rebuildConnections() {
  if (lineMesh) { reef.remove(lineMesh); lineMesh.geometry.dispose(); lineMesh = null }
  const active = corals.filter((c) => !c.removing)
  if (active.length < 2) return
  const curves = []
  for (let i = 0; i < active.length; i++) {
    const dists = active.map((c, j) => ({ j, d: i === j ? Infinity : active[i].group.position.distanceTo(c.group.position) })).sort((a, b) => a.d - b.d)
    for (let k = 0; k < Math.min(2, active.length - 1); k++) {
      const a = active[i].group.position, b = active[dists[k].j].group.position
      const mid = a.clone().add(b).multiplyScalar(0.5)
      mid.y += 0.3 + a.distanceTo(b) * 0.12
      curves.push(new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone()))
    }
  }
  const verts = []
  curves.forEach((c) => { const pts = c.getPoints(20); for (let k = 0; k < pts.length - 1; k++) verts.push(pts[k].x, pts[k].y, pts[k].z, pts[k + 1].x, pts[k + 1].y, pts[k + 1].z) })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  lineMesh = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x4ac8ff, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false, fog: true }))
  reef.add(lineMesh)
}

function updateOverview() {
  if (corals.length === 0) { overviewPos.set(0, 2, 8); overviewTarget.set(0, 0, 0); return }
  const box = new THREE.Box3()
  for (const c of corals) if (!c.removing) box.expandByObject(c.group)
  if (box.isEmpty()) return
  const center = box.getCenter(new THREE.Vector3())
  const sphere = box.getBoundingSphere(new THREE.Sphere())
  overviewTarget.copy(center)
  overviewPos.set(center.x, center.y + sphere.radius * 0.4, center.z + Math.max(sphere.radius * 2.2, 5))
}

const FLOW_MAX = 6000, FLOW_RADIUS = 12, FLOW_SPEED = 0.3
function makeParticleTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.7)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}
const particleTex = makeParticleTex()
const flowPos = new Float32Array(FLOW_MAX * 3), flowCol = new Float32Array(FLOW_MAX * 3), flowSeed = new Float32Array(FLOW_MAX)
for (let i = 0; i < FLOW_MAX; i++) {
  const r = FLOW_RADIUS * Math.cbrt(Math.random()), th = Math.acos(2 * Math.random() - 1), ph = Math.random() * Math.PI * 2
  flowPos[i * 3] = r * Math.sin(th) * Math.cos(ph); flowPos[i * 3 + 1] = r * Math.sin(th) * Math.sin(ph); flowPos[i * 3 + 2] = r * Math.cos(th)
  const b = 0.3 + Math.random() * 0.7; flowCol[i * 3] = flowCol[i * 3 + 1] = flowCol[i * 3 + 2] = b; flowSeed[i] = Math.random() * 1000
}
const flowGeo = new THREE.BufferGeometry()
flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3))
flowGeo.setAttribute('color', new THREE.BufferAttribute(flowCol, 3))
const flowMat = new THREE.PointsMaterial({ size: 0.045, map: particleTex, color: 0x5ad0ff, vertexColors: true, transparent: true, opacity: 0.62, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })
scene.add(new THREE.Points(flowGeo, flowMat))
function updateFlow(dt, t) {
  const wrap = (v) => (v > FLOW_RADIUS ? v - 2 * FLOW_RADIUS : v < -FLOW_RADIUS ? v + 2 * FLOW_RADIUS : v)
  const speed = FLOW_SPEED
  for (let i = 0; i < FLOW_MAX; i++) {
    const i3 = i * 3
    const dx = flowPos[i3] - mouseWorld.x, dy = flowPos[i3 + 1] - mouseWorld.y, dz = flowPos[i3 + 2] - mouseWorld.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const boost = dist < 3 ? 1 + (1 - dist / 3) * 1.5 : 1
    flowPos[i3] = wrap(flowPos[i3] + Math.sin(t * 0.4 + flowSeed[i]) * 0.004 * boost + dt * speed * 0.3 * boost)
    flowPos[i3 + 1] = wrap(flowPos[i3 + 1] + Math.cos(t * 0.35 + flowSeed[i]) * 0.003 * boost - dt * 0.06)
    flowPos[i3 + 2] = wrap(flowPos[i3 + 2] + Math.sin(t * 0.3 + flowSeed[i] * 1.3) * 0.004 * boost)
    const brighten = dist < 3 ? 0.3 * (1 - dist / 3) : 0
    const base = 0.3 + (flowSeed[i] % 1) * 0.7
    flowCol[i3] = flowCol[i3 + 1] = flowCol[i3 + 2] = Math.min(1, base + brighten)
  }
  flowGeo.attributes.position.needsUpdate = true
  flowGeo.attributes.color.needsUpdate = true
}

const SNOW = 800, snowBox = { x: 16, yTop: 10, yBot: -8, z: 16 }
const snowPos = new Float32Array(SNOW * 3)
for (let i = 0; i < SNOW; i++) { snowPos[i * 3] = (Math.random() * 2 - 1) * snowBox.x; snowPos[i * 3 + 1] = snowBox.yBot + Math.random() * (snowBox.yTop - snowBox.yBot); snowPos[i * 3 + 2] = (Math.random() * 2 - 1) * snowBox.z }
const snowGeo = new THREE.BufferGeometry()
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3))
scene.add(new THREE.Points(snowGeo, new THREE.PointsMaterial({ size: 0.03, map: particleTex, color: 0x8abbd6, transparent: true, opacity: 0.36, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })))

function makeShaftTex() {
  const c = document.createElement('canvas'); c.width = 32; c.height = 256
  const ctx = c.getContext('2d'), g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, 'rgba(140,200,255,0.4)'); g.addColorStop(0.5, 'rgba(130,190,255,0.1)'); g.addColorStop(1, 'rgba(130,190,255,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 256)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}
const shaftTex = makeShaftTex(), shafts = []
for (let i = 0; i < 3; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 16), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }))
  const bx = (i - 1) * 3; m.position.set(bx, 5, -2 - i * 0.5); m.rotation.z = (i % 2 ? 1 : -1) * 0.12; m.userData.bx = bx; shafts.push(m); scene.add(m)
}

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.65, 0.65, 0.42))
composer.addPass(new OutputPass())


const vignette = document.createElement('div')
vignette.id = 'vignette'
document.body.appendChild(vignette)

const ecoHud = document.createElement('div')
ecoHud.id = 'eco-hud'
ecoHud.innerHTML = '<div class="hud-row"><span>산호</span><strong id="hud-count">0</strong></div>' +
  '<div class="hud-row"><span>연결</span><strong id="hud-connections">0</strong></div>' +
  '<div class="hud-row"><span>주요 카테고리</span><strong id="hud-dominant">-</strong></div>'
document.body.appendChild(ecoHud)

const evoFlash = document.createElement('div')
evoFlash.id = 'evo-flash'
document.body.appendChild(evoFlash)

window.addEventListener('pointermove', (e) => {
  mouseNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
  _mouseRay.setFromCamera(mouseNDC, camera)
  _mouseRay.ray.intersectPlane(_mousePlane, mouseWorld)
})

function updateHUD() {
  if (!officialMode) return
  const active = corals.filter((c) => !c.removing && !c.isIntroPreview)
  const el = (id) => document.getElementById(id)
  el('hud-count').textContent = `${active.length}개`
  // Each coral connects to min(connectionDistance, neighbors) nearest, each curve = 40 verts
  const connCount = lineMesh ? Math.floor(lineMesh.geometry.attributes.position.count / 40) : 0
  el('hud-connections').textContent = `${connCount}개`
  const catCounts = {}
  active.forEach((c) => {
    if (c.data.subcats) c.data.subcats.forEach((s) => { catCounts[s.cat.name] = (catCounts[s.cat.name] || 0) + 1 })
    else { const n = c.data.cat.name; catCounts[n] = (catCounts[n] || 0) + 1 }
  })
  const dominant = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]
  el('hud-dominant').textContent = dominant ? officialCategoryName(dominant[0]) : '-'
}

function exportCanvasPNG() {
  composer.render()
  return renderer.domElement.toDataURL('image/png')
}
window.__coralExportCanvasPNG = exportCanvasPNG
const raycaster = new THREE.Raycaster()
const hoverRaycaster = new THREE.Raycaster()
let pointerStart = null

function startCamTween(toPos, toTarget, dur = 1.0, ease = easeInOut) {
  camTween = { fromPos: camera.position.clone(), toPos: toPos.clone(), fromTar: controls.target.clone(), toTar: toTarget.clone(), t0: timer.getElapsed(), dur, ease }
  controls.enabled = false

}
function updateCamTween() {
  if (!camTween) return
  let k = (timer.getElapsed() - camTween.t0) / camTween.dur; if (k >= 1) k = 1
  const a = camTween.ease(k)
  camera.position.lerpVectors(camTween.fromPos, camTween.toPos, a)
  controls.target.lerpVectors(camTween.fromTar, camTween.toTar, a)
  camera.lookAt(controls.target)
  if (k >= 1) {
    camTween = null
    controls.enabled = true
    controls.saveState()
    controls.reset()
  }
}

function pickCluster(o) { while (o) { if (o.userData && o.userData.clusterRef) return o.userData.clusterRef; o = o.parent } return null }
function focusCluster(c, notifyOfficial = true) {
  if (c.removing) return
  focused = c
  if (hovered) { hovered.labelEl.classList.remove('label-hover'); hovered = null }

  const cpos = c.group.getWorldPosition(new THREE.Vector3())
  startCamTween(cpos.clone().add(new THREE.Vector3(0, 0.3, 3.5)), cpos)
  for (const o of corals) o.fadeTarget = (o === c) ? 1 : 0.12
  if (notifyOfficial) officialUI?.onCoralFocused(c)
}
function resetView(notifyOfficial = true) {
  focused = null
  updateOverview()

  startCamTween(overviewPos.clone(), overviewTarget.clone(), 0.6, easeOut)
  for (const o of corals) o.fadeTarget = 1
  if (notifyOfficial) officialUI?.onOverview()
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerStart = { x: e.clientX, y: e.clientY, t: performance.now(), camPos: camera.position.clone(), camTarget: controls.target.clone() }

  // Detect coral hit for drag-on-coral
  if (officialMode && !focused && !captureMode) {
    const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
    const groups = corals.filter((c) => !c.removing && !c.isIntroPreview).map((c) => c.group)
    const hits = raycaster.intersectObjects(groups, true)
    const hitCoral = hits.length ? pickCluster(hits[0].object) : null
    if (hitCoral) { dragCoral = hitCoral; dragStart = { x: e.clientX, y: e.clientY }; isDragging = false }
  }
})
renderer.domElement.addEventListener('pointerup', (e) => {
  // Drag-on-coral completed
  if (isDragging && dragCoral) {
    controls.enabled = true
    dragCoral = null; dragStart = null; isDragging = false
    pointerStart = null
    return
  }
  dragCoral = null; dragStart = null; isDragging = false

  if (!pointerStart) return
  const moved = Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y)
  const elapsed = performance.now() - pointerStart.t
  const saved = pointerStart
  pointerStart = null
  if (moved >= 6 || elapsed >= 350) return

  camera.position.copy(saved.camPos)
  controls.target.copy(saved.camTarget)

  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
  raycaster.setFromCamera(ndc, camera)
  const groups = corals.filter((c) => !c.removing && !c.isIntroPreview).map((c) => c.group)
  const hits = raycaster.intersectObjects(groups, true)
  const c = hits.length ? pickCluster(hits[0].object) : null
  if (focused) {
    if (c !== focused) resetView()
  } else if (c) {
    focusCluster(c)
  }
})
window.addEventListener('pointerup', () => {
  if (isDragging) controls.enabled = true
  dragCoral = null; dragStart = null; isDragging = false
})
window.addEventListener('pointermove', (e) => {
  if (dragCoral && dragStart) {
    const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y
    if (!isDragging && Math.hypot(dx, dy) > 6) { isDragging = true; controls.enabled = false }
    if (isDragging) {
      dragCoral.spinSpeed = 0.04 + clamp(dx * 0.005, -0.5, 0.5)
      dragCoral.group.rotation.z = clamp(dx * 0.008, -0.6, 0.6)
      dragCoral.group.rotation.x = clamp(dy * 0.008, -0.6, 0.6)
      for (const m of dragCoral.mats) m.emissiveIntensity = 0.8
    }
  }
})

// Double-click void → generate new coral
renderer.domElement.addEventListener('dblclick', (e) => {
  if (!officialMode || focused || captureMode) return
  if (!coralTemplate || modelsLoaded < MODEL_PATHS.length) return
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
  raycaster.setFromCamera(ndc, camera)
  const groups = corals.filter((c) => !c.removing && !c.isIntroPreview).map((c) => c.group)
  if (raycaster.intersectObjects(groups, true).length > 0) return
  const target = new THREE.Vector3()
  if (!raycaster.ray.intersectPlane(_mousePlane, target)) return
  target.x = clamp(target.x, -10, 10)
  target.z = clamp(target.z, -10, 10)
  target.y = (Math.random() - 0.5) * 0.8
  // Ensure minimum distance from existing corals
  const minDist = 2.0
  const tooClose = corals.some((c) => !c.removing && c.group.position.distanceTo(target) < minDist)
  if (tooClose) { target.x += (Math.random() - 0.5) * 3; target.z += (Math.random() - 0.5) * 3 }
  const shuffled = [...CATEGORIES].sort(() => Math.random() - 0.5)
  const cats = shuffled.slice(0, 3)
  const data = {
    cat: cats[0],
    weight: 0.4 + Math.random() * 0.4,
    count: 10 + Math.floor(Math.random() * 30),
    diversity: 3 + Math.floor(Math.random() * 8),
    recency: 0.4 + Math.random() * 0.5,
    trend: (Math.random() - 0.5) * 0.4,
    subcats: cats.map((cat, i) => ({ cat, weight: WEIGHTS[i] })),
    position: [target.x, target.y, target.z],
  }
  const coral = addCoralFromData(data)
  if (coral) {
    coral.officialProfile = { cats, weights: [50, 30, 20], feedOffset: corals.length % 4 }
  }
  officialUI?.onOverview?.()
})

renderer.domElement.addEventListener('pointermove', (e) => {
  if (focused) return
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
  hoverRaycaster.setFromCamera(ndc, camera)
  const groups = corals.filter((c) => !c.removing && !c.isIntroPreview).map((c) => c.group)
  const hits = hoverRaycaster.intersectObjects(groups, true)
  const c = hits.length ? pickCluster(hits[0].object) : null
  if (c !== hovered) {
    if (hovered) hovered.labelEl.classList.remove('label-hover')
    hovered = c
    if (hovered) hovered.labelEl.classList.add('label-hover')
    renderer.domElement.style.cursor = hovered ? 'pointer' : ''
  }
})

function onResize() {
  const w = window.innerWidth, h = window.innerHeight
  camera.aspect = w / h; camera.updateProjectionMatrix()
  renderer.setSize(w, h); composer.setSize(w, h); labelRenderer.setSize(w, h)
}
window.addEventListener('resize', onResize)

const timer = new THREE.Timer()
timer.connect(document)

if (officialMode) {
  officialUI = createOfficialUI({
    categories: CATEGORIES.map((cat) => ({ cat, label: officialCategoryName(cat.name) })),
    getCorals: () => corals.filter((coral) => !coral.removing && !coral.isIntroPreview),
    createCoral: (selectedCats) => {
      clearIntroPreview()
      const coral = addCoralManual(selectedCats.map((cat) => ({ cat })))
      if (coral) updateCoralProfile(coral, selectedCats.map((cat, index) => ({ cat, weight: WEIGHTS[index] })))
      return coral
    },
    updateCoral: updateCoralProfile,
    removeCoral,
    focusCoral: (coral) => focusCluster(coral, false),
    showOverview: () => resetView(false),
    seedIntro: seedIntroPreview,
    startPV,
    pvAutoStart,
    modelsReady: () => modelsLoaded >= MODEL_PATHS.length && Boolean(coralTemplate),
  })
  if (modelsLoaded >= MODEL_PATHS.length) officialUI.onModelsReady()
}

renderer.setAnimationLoop((time) => {
  timer.update(time)
  const dt = Math.min(timer.getDelta(), 0.05)
  const t = timer.getElapsed()

  if (!focused && !camTween) reef.rotation.y += dt * 0.06

  for (let ci = corals.length - 1; ci >= 0; ci--) {
    const c = corals[ci]
    if (c.removing) {
      const rk = clamp(1 - (t - c.removeStart) / 0.8, 0, 1)
      c.group.scale.setScalar(c.baseNorm * rk * rk)
      for (const m of c.mats) m.opacity = rk
      c.labelEl.style.opacity = String(rk)
      if (rk <= 0) finishRemove(c)
      continue
    }

    let growK = 1
    const ge = t - c.growStart
    const growSpeed = 0.3 + params.activity * 2.7
    const effectiveGrowDur = GROW_DUR / growSpeed
    if (ge < effectiveGrowDur) growK = easeOutBack(clamp(ge / effectiveGrowDur, 0, 1))
    else if (!c.grown) c.grown = true

    c.fade += (c.fadeTarget - c.fade) * 0.08
    const isHovered = (c === hovered && !focused) ? 1 : 0
    const p = 0.5 + 0.5 * Math.sin(t * c.breathFreq + c.phase)
    for (const m of c.mats) {
      const glowFromActivity = 0.15 + params.activity * 0.85
      m.emissiveIntensity = (0.1 + 0.3 * p + isHovered * 0.4) * growK * c.fade * Math.max(c.data.recency, 0.3) * (c.data.captureGlow ?? 1) * glowFromActivity
      m.opacity = clamp(c.fade * (0.4 + c.data.weight * 0.6) * (c.data.captureOpacity ?? 1), 0.02, 1)
    }
    const scaleFade = 0.7 + 0.3 * c.fade
    const breathScale = 1 + 0.02 * Math.sin(t * c.breathFreq + c.phase)
    const pvScale = c.pvScale ?? 1
    c.group.scale.set(
      c.baseNorm * c.xzGirth * growK * scaleFade * breathScale * pvScale,
      c.baseNorm * c.yStretch * growK * scaleFade * breathScale * pvScale,
      c.baseNorm * c.xzGirth * growK * scaleFade * breathScale * pvScale,
    )
    if (!focused) c.group.rotation.y += c.spinSpeed * dt

    // Mouse → coral sway: tilt direction and amount directly maps to mouse offset from coral
    if (officialMode && !focused) {
      if (c._baseRotZ === undefined) { c._baseRotZ = c.group.rotation.z; c._baseRotX = c.group.rotation.x }
      const wp = c.group.getWorldPosition(new THREE.Vector3()).project(camera)
      const dx = mouseNDC.x - wp.x, dy = mouseNDC.y - wp.y
      const dist = Math.hypot(dx, dy)
      let tgtZ = 0, tgtX = 0
      if (dist < 1.5) {
        const scale = (1 - dist / 1.5) * params.mouseSwayStrength
        tgtZ = dx * scale
        tgtX = -dy * scale
      }
      c._swayZ = (c._swayZ || 0) + (tgtZ - (c._swayZ || 0)) * 0.3
      c._swayX = (c._swayX || 0) + (tgtX - (c._swayX || 0)) * 0.3
      c.group.rotation.z = c._baseRotZ + c._swayZ
      c.group.rotation.x = c._baseRotX + c._swayX
    }

    const d = camera.position.distanceTo(c.group.getWorldPosition(_v))
    c.labelEl.style.opacity = c.hideLabel ? '0' : String(clamp(1.4 - d / 14, 0.1, 1) * growK * c.fade)
  }

  if (lineMesh) {
    const allGrown = corals.every((c) => c.grown || c.removing)
    const lt = allGrown && corals.length >= 2 ? 0.1 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.7)) : 0
    lineMesh.material.opacity += (lt - lineMesh.material.opacity) * 0.05
  }

  updateFlow(dt, t)
  for (let i = 0; i < SNOW; i++) { const i3 = i * 3; snowPos[i3 + 1] -= dt * (0.18 + (i % 5) * 0.04); snowPos[i3] += Math.sin(t * 0.25 + i) * 0.001; if (snowPos[i3 + 1] < snowBox.yBot) snowPos[i3 + 1] = snowBox.yTop }
  snowGeo.attributes.position.needsUpdate = true
  // === Depth-zone based scene derivation ===
  // Real ocean layers: 표층(0-0.2) → 중층(0.2-0.4) → 약광대(0.4-0.65) → 무광대(0.65-0.85) → 심연(0.85-1)
  const D = params.depth

  // Piecewise interpolation along depth-zone keyframes
  // Each stop: [depth, R, G, B]
  // 0.0=shallow turquoise-green → 0.15=green-blue → 0.3=blue → 0.5=deep blue → 0.7=very dark → 1.0=black
  const gradTopStops = [[0, 65, 175, 155], [0.15, 50, 155, 165], [0.3, 40, 110, 175], [0.5, 25, 65, 135], [0.7, 12, 35, 72], [0.85, 6, 16, 38], [1, 3, 6, 14]]
  const gradBotStops = [[0, 25, 110, 105], [0.15, 22, 90, 100], [0.3, 18, 60, 95], [0.5, 12, 32, 60], [0.7, 6, 18, 38], [0.85, 3, 8, 20], [1, 2, 4, 7]]
  const fogStops     = [[0, 40, 130, 120], [0.15, 35, 110, 120], [0.3, 28, 75, 115], [0.5, 18, 45, 85], [0.7, 10, 25, 52], [0.85, 5, 12, 28], [1, 3, 5, 10]]
  const fogDenStops  = [[0, 0.018], [0.15, 0.022], [0.3, 0.035], [0.5, 0.05], [0.7, 0.07], [0.85, 0.085], [1, 0.1]]
  const exposStops   = [[0, 1.4], [0.15, 1.25], [0.3, 1.0], [0.5, 0.8], [0.7, 0.6], [0.85, 0.42], [1, 0.28]]
  const hemiStops    = [[0, 0.6], [0.15, 0.5], [0.3, 0.38], [0.5, 0.25], [0.7, 0.14], [0.85, 0.06], [1, 0.02]]
  const keyStops     = [[0, 1.4], [0.15, 1.2], [0.3, 0.9], [0.5, 0.6], [0.7, 0.3], [0.85, 0.1], [1, 0.03]]
  const shaftStops   = [[0, 0.24], [0.15, 0.16], [0.3, 0.08], [0.5, 0.04], [0.7, 0.015], [0.85, 0.003], [1, 0]]
  const bloomStops   = [[0, 0.45], [0.15, 0.55], [0.3, 0.65], [0.5, 0.55], [0.7, 0.4], [0.85, 0.22], [1, 0.12]]

  function sampleStops(stops, d) {
    for (let i = 0; i < stops.length - 1; i++) {
      if (d <= stops[i + 1][0]) {
        const k = (d - stops[i][0]) / (stops[i + 1][0] - stops[i][0])
        if (stops[i].length === 2) return stops[i][1] + (stops[i + 1][1] - stops[i][1]) * k
        const r = Math.round(stops[i][1] + (stops[i + 1][1] - stops[i][1]) * k)
        const g = Math.round(stops[i][2] + (stops[i + 1][2] - stops[i][2]) * k)
        const b = Math.round(stops[i][3] + (stops[i + 1][3] - stops[i][3]) * k)
        return [r, g, b]
      }
    }
    const last = stops[stops.length - 1]
    return last.length === 2 ? last[1] : [last[1], last[2], last[3]]
  }
  const rgbToHex = (c) => '#' + ((c[0] << 16) | (c[1] << 8) | c[2]).toString(16).padStart(6, '0')
  const rgbToInt = (c) => (c[0] << 16) | (c[1] << 8) | c[2]

  const topC = sampleStops(gradTopStops, D), botC = sampleStops(gradBotStops, D)
  const midC = [Math.round((topC[0] + botC[0]) / 2), Math.round((topC[1] + botC[1]) / 2), Math.round((topC[2] + botC[2]) / 2)]
  drawBgGradient(rgbToHex(topC), rgbToHex(midC), rgbToHex(botC))

  scene.fog.color.setHex(rgbToInt(sampleStops(fogStops, D)))
  scene.fog.density = sampleStops(fogDenStops, D)
  renderer.toneMappingExposure = sampleStops(exposStops, D) * params.brightness
  hemiLight.color.setHex(params.hemiSkyColor)
  hemiLight.groundColor.setHex(params.hemiGroundColor)
  hemiLight.intensity = sampleStops(hemiStops, D) * params.brightness
  keyLight.color.setHex(params.keyLightColor)
  keyLight.intensity = sampleStops(keyStops, D) * params.brightness
  fillLight.color.setHex(params.fillLightColor)
  fillLight.intensity = sampleStops(keyStops, D) * 0.4 * params.brightness

  const shaftOp = sampleStops(shaftStops, D)
  shafts.forEach((s, i) => { s.material.opacity = shaftOp * (0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.35 + i * 1.5))); s.position.x = s.userData.bx + Math.sin(t * 0.12 + i) * 0.4 })

  flowMat.color.setHex(params.particleColor)
  flowMat.size = params.particleSize
  flowMat.opacity = params.particleBaseOpacity * clamp(1 - D * 0.6, 0.15, 1)
  if (!evolutionActive) composer.passes[1].strength = sampleStops(bloomStops, D)

  // Evolution mode
  if (officialMode && !evolutionActive && getAccumulatedChange() >= EVOLUTION_THRESHOLD) {
    evolutionActive = true
    evolutionStart = t
    resetAccumulatedChange()
  }
  if (evolutionActive) {
    const ek = (t - evolutionStart) / EVOLUTION_DURATION
    if (ek >= 1) {
      evolutionActive = false
      evoFlash.style.opacity = '0'
    } else {
      const pulse = Math.sin(ek * Math.PI)
      composer.passes[1].strength = sampleStops(bloomStops, params.depth) + pulse * 1.2
      evoFlash.style.opacity = String(pulse * 0.25)
      for (const c of corals) { if (!c.removing) for (const m of c.mats) m.emissiveIntensity += pulse * 0.8 }
      if (ek < 0.1) {
        for (const c of corals) {
          if (c.removing || c.isIntroPreview) continue
          c.group.position.x += (Math.random() - 0.5) * 0.02
          c.group.position.y += (Math.random() - 0.5) * 0.015
          c.group.position.z += (Math.random() - 0.5) * 0.02
        }
        rebuildConnections()
      }
    }
  }

  // HUD update (~1 per second)
  if (officialMode && Math.floor(t) !== Math.floor(t - dt)) updateHUD()

  updatePV(dt)

  if (pvPlaying) { /* PV drives camera directly */ }
  else if (camTween) updateCamTween()
  else controls.update()

  composer.render()
  labelRenderer.render(scene, camera)
})
onResize()
