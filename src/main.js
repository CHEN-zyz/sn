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
import './style.css'

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
const FALLBACK_CAT = { name: '기타', color: 0x888888, keys: [] }
const WEIGHTS = [0.5, 0.3, 0.2]
const EMOTIONS = {
  '뉴스·시사': '연대형', '경제·투자': '안정형', '요리': '치유형', '게임': '자극형',
  '스포츠': '열정형', '소프트웨어·AI': '몰입형', '환경·기후': '공감형', '광고·마케팅': '영감형',
  '음악': '여운형', '디자인·예술': '감성형', '여행': '설렘형', '영감·인사이트': '성장형',
  '학습': '탐구형', '스타일': '표현형', '기타': '중립형',
}
const Q_POOL = [
  { w: 3, q: '친구들과 대화할 때 가장 흥미롭게 듣는 주제는?', opts: [
    { text: '요즘 핫한 뉴스나 사회 이슈', cat: '뉴스·시사' },
    { text: '맛집이나 새로운 레시피', cat: '요리' },
    { text: '재테크나 투자 이야기', cat: '경제·투자' },
    { text: '최근 본 영상이나 음악 추천', cat: '음악' },
  ]},
  { w: 3, q: '내 방에서 가장 아끼는 물건은?', opts: [
    { text: '악기 / 스피커', cat: '음악' },
    { text: '게임기 / PC', cat: '게임' },
    { text: '요리 도구 / 커피 용품', cat: '요리' },
    { text: '운동 기구 / 공', cat: '스포츠' },
  ]},
  { w: 1.5, q: '영상을 보며 가장 느끼고 싶은 감정은?', opts: [
    { text: '편안하고 힐링되는 느낌', cat: '요리' },
    { text: '두근두근 자극적인 느낌', cat: '게임' },
    { text: '뭔가 배운 느낌', cat: '학습' },
    { text: '감동받거나 영감을 얻는 느낌', cat: '영감·인사이트' },
  ]},
  { w: 1.5, q: '평소 내 취향을 한 단어로 표현한다면?', opts: [
    { text: '탐험가', cat: '여행' },
    { text: '크리에이터', cat: '디자인·예술' },
    { text: '분석가', cat: '소프트웨어·AI' },
    { text: '힐러', cat: '요리' },
  ]},
  { w: 3, q: '돈이 생긴다면 주로 어디에 쓰나요?', opts: [
    { text: '여행', cat: '여행' },
    { text: '전자기기 / 가젯', cat: '소프트웨어·AI' },
    { text: '옷이나 뷰티', cat: '스타일' },
    { text: '맛있는 음식 / 맛집', cat: '요리' },
  ]},
  { w: 1.5, q: '콘텐츠를 볼 때 가장 얻고 싶은 것은?', opts: [
    { text: '실용적인 정보', cat: '학습' },
    { text: '새로운 시각이나 영감', cat: '영감·인사이트' },
    { text: '스트레스 해소', cat: '게임' },
    { text: '트렌드 파악', cat: '광고·마케팅' },
  ]},
  { w: 3, q: '유튜브 자동재생에서 멈추게 되는 영상은?', opts: [
    { text: '예쁜 풍경이나 여행 영상', cat: '여행' },
    { text: '먹방이나 요리 과정', cat: '요리' },
    { text: '게임 플레이나 하이라이트', cat: '게임' },
    { text: '신기한 기술이나 과학 영상', cat: '소프트웨어·AI' },
  ]},
  { w: 2, q: '자유시간이 생기면 뭘 하고 싶으세요?', opts: [
    { text: '요리하거나 카페 가기', cat: '요리' },
    { text: '게임하기', cat: '게임' },
    { text: '운동하거나 산책하기', cat: '스포츠' },
    { text: '뭔가 새로 배우기', cat: '학습' },
  ]},
  { w: 2, q: '어떤 영상을 보다가 시간 가는 줄 모르게 되셨나요?', opts: [
    { text: '브이로그 / 일상 영상', cat: '스타일' },
    { text: '강의나 다큐멘터리', cat: '학습' },
    { text: '음악 / 커버 영상', cat: '음악' },
    { text: '스포츠 하이라이트', cat: '스포츠' },
  ]},
  { w: 1.5, q: '지금 가장 필요한 건?', opts: [
    { text: '휴식', cat: '환경·기후' },
    { text: '자극', cat: '스포츠' },
    { text: '지식', cat: '소프트웨어·AI' },
    { text: '영감', cat: '디자인·예술' },
  ]},
  { w: 1.5, q: '한 단어로 본인을 표현한다면?', opts: [
    { text: '모험가', cat: '여행' },
    { text: '몽상가', cat: '영감·인사이트' },
    { text: '현실주의자', cat: '뉴스·시사' },
    { text: '덕후', cat: '게임' },
  ]},
  { w: 1.5, q: '가장 즐겨하는 SNS는?', opts: [
    { text: '인스타그램', cat: '스타일' },
    { text: '유튜브', cat: '학습' },
    { text: '틱톡', cat: '음악' },
    { text: '트위터/X', cat: '뉴스·시사' },
  ]},
  { w: 2, q: '최근 가장 궁금했던 건?', opts: [
    { text: '세계에서 무슨 일이 벌어지고 있는지', cat: '뉴스·시사' },
    { text: '돈을 어떻게 불릴 수 있는지', cat: '경제·투자' },
    { text: '새로운 기술이나 AI 트렌드', cat: '소프트웨어·AI' },
    { text: '환경 문제나 기후 변화', cat: '환경·기후' },
  ]},
  { w: 1.5, q: '가장 즐겨하는 취미는?', opts: [
    { text: '요리 / 베이킹', cat: '요리' },
    { text: '그림 / 디자인', cat: '디자인·예술' },
    { text: '독서 / 공부', cat: '학습' },
    { text: '쇼핑 / 패션', cat: '스타일' },
  ]},
]
const GROW_DUR = 1.8
const clamp = THREE.MathUtils.clamp
const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)
const easeOutBack = (k) => { const c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2) }
const _v = new THREE.Vector3()
const noise3D = createNoise3D()

const corals = []
const coralTemplates = []
let coralTemplate = null
let focused = null
let hovered = null
let camTween = null
let overviewPos = new THREE.Vector3(0, 2, 8)
let overviewTarget = new THREE.Vector3(0, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
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
scene.background = new THREE.Color(0x000000)
scene.fog = new THREE.FogExp2(0x010509, 0.04)

const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
scene.environmentIntensity = 0.5
pmrem.dispose()

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 2, 8)

scene.add(new THREE.HemisphereLight(0x2a4a6a, 0x05080d, 0.35))
const keyLight = new THREE.DirectionalLight(0xbfe0ff, 0.8)
keyLight.position.set(3, 8, 5)
scene.add(keyLight)
scene.add(new THREE.DirectionalLight(0x4488cc, 0.3).translateX(-4).translateY(2).translateZ(-3))

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
    if (!addBtn.style.display || addBtn.style.display === 'none') { addBtn.style.display = ''; uploadBtn.style.display = ''; startQuizBtn.style.display = '' }
  }, undefined, (err) => {
    console.warn('load failed: ' + path, err)
    modelsLoaded++
  })
})

function classifyTitle(title) {
  const lower = title.toLowerCase()
  let best = null, bestCount = 0
  for (const cat of CATEGORIES) {
    const hits = cat.keys.filter((k) => lower.includes(k)).length
    if (hits > bestCount) { bestCount = hits; best = cat }
  }
  return best || FALLBACK_CAT
}

function parseWatchHistory(json) {
  const stats = new Map()
  const now = Date.now()
  let entries
  try { entries = typeof json === 'string' ? JSON.parse(json) : json } catch { return [] }
  if (!Array.isArray(entries)) return []

  for (const entry of entries) {
    if (!entry.title || !entry.titleUrl) continue
    const title = entry.title.replace(/^Watched\s+/, '')
    const cat = classifyTitle(title)
    const channel = entry.subtitles && entry.subtitles[0] ? entry.subtitles[0].name : 'unknown'
    const time = entry.time ? new Date(entry.time).getTime() : 0
    const daysSince = time ? (now - time) / 86400000 : 999

    if (!stats.has(cat.name)) stats.set(cat.name, { cat, count: 0, channels: new Set(), recentMin: 999, timestamps: [] })
    const s = stats.get(cat.name)
    s.count++
    s.channels.add(channel)
    s.recentMin = Math.min(s.recentMin, daysSince)
    s.timestamps.push(time)
  }

  const total = Array.from(stats.values()).reduce((s, v) => s + v.count, 0) || 1
  const result = Array.from(stats.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((s) => {
      const trend = computeTrend(s.timestamps)
      return {
        cat: s.cat,
        weight: s.count / total,
        count: s.count,
        diversity: s.channels.size,
        recency: clamp(1 - s.recentMin / 90, 0, 1),
        trend,
      }
    })
  return result
}

function computeTrend(timestamps) {
  if (timestamps.length < 4) return 0
  const sorted = timestamps.sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const firstHalf = mid
  const secondHalf = sorted.length - mid
  return clamp((secondHalf - firstHalf) / (firstHalf + secondHalf), -1, 1)
}

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
      o.material.opacity = 0.4 + data.weight * 0.6
      o.material.emissive = color.clone()
      o.material.emissiveIntensity = 0.1 + data.recency * 0.5
      o.material.roughness = 0.3 + (1 - Math.min(data.diversity / 15, 1)) * 0.5
      mats.push(o.material)
    }
  })

  displaceVertices(inner, 0.15 + data.weight * 0.25)
  inner.position.sub(center)

  const pos = findPlacement()
  pos.y += (data.weight - 0.3) * 1.2
  group.position.copy(pos)
  group.rotation.y = Math.random() * Math.PI * 2
  group.rotation.x = (Math.random() - 0.5) * 0.2
  group.rotation.z = (Math.random() - 0.5) * 0.15
  group.scale.setScalar(0.001)

  const div = document.createElement('div')
  div.className = 'label'
  div.style.borderColor = 'rgba(' + Math.round(color.r * 255) + ',' + Math.round(color.g * 255) + ',' + Math.round(color.b * 255) + ',0.45)'
  const labelName = data.subcats && data.subcats.length > 1
    ? data.subcats.map((s) => s.cat.name).join('·') + ' 산호'
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

  rebuildConnections()
  updateOverview()
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
  addCoralFromData(data)
}

function removeCoral(c) {
  c.removing = true
  c.removeStart = timer.getElapsed()
  if (focused === c) { focused = null; hideDetail() }
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

const FLOW_MAX = 3000, FLOW_RADIUS = 12, FLOW_SPEED = 0.3
const flowPos = new Float32Array(FLOW_MAX * 3), flowCol = new Float32Array(FLOW_MAX * 3), flowSeed = new Float32Array(FLOW_MAX)
for (let i = 0; i < FLOW_MAX; i++) {
  const r = FLOW_RADIUS * Math.cbrt(Math.random()), th = Math.acos(2 * Math.random() - 1), ph = Math.random() * Math.PI * 2
  flowPos[i * 3] = r * Math.sin(th) * Math.cos(ph); flowPos[i * 3 + 1] = r * Math.sin(th) * Math.sin(ph); flowPos[i * 3 + 2] = r * Math.cos(th)
  const b = 0.3 + Math.random() * 0.7; flowCol[i * 3] = flowCol[i * 3 + 1] = flowCol[i * 3 + 2] = b; flowSeed[i] = Math.random() * 1000
}
const flowGeo = new THREE.BufferGeometry()
flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3))
flowGeo.setAttribute('color', new THREE.BufferAttribute(flowCol, 3))
scene.add(new THREE.Points(flowGeo, new THREE.PointsMaterial({ size: 0.04, color: 0x5ad0ff, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })))
function updateFlow(dt, t) {
  const wrap = (v) => (v > FLOW_RADIUS ? v - 2 * FLOW_RADIUS : v < -FLOW_RADIUS ? v + 2 * FLOW_RADIUS : v)
  for (let i = 0; i < FLOW_MAX; i++) {
    const i3 = i * 3
    flowPos[i3] = wrap(flowPos[i3] + Math.sin(t * 0.4 + flowSeed[i]) * 0.004 + dt * FLOW_SPEED * 0.3)
    flowPos[i3 + 1] = wrap(flowPos[i3 + 1] + Math.cos(t * 0.35 + flowSeed[i]) * 0.003 - dt * 0.06)
    flowPos[i3 + 2] = wrap(flowPos[i3 + 2] + Math.sin(t * 0.3 + flowSeed[i] * 1.3) * 0.004)
  }
  flowGeo.attributes.position.needsUpdate = true
}

const SNOW = 800, snowBox = { x: 16, yTop: 10, yBot: -8, z: 16 }
const snowPos = new Float32Array(SNOW * 3)
for (let i = 0; i < SNOW; i++) { snowPos[i * 3] = (Math.random() * 2 - 1) * snowBox.x; snowPos[i * 3 + 1] = snowBox.yBot + Math.random() * (snowBox.yTop - snowBox.yBot); snowPos[i * 3 + 2] = (Math.random() * 2 - 1) * snowBox.z }
const snowGeo = new THREE.BufferGeometry()
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3))
scene.add(new THREE.Points(snowGeo, new THREE.PointsMaterial({ size: 0.025, color: 0x8abbd6, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })))

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

const title = document.createElement('div')
title.id = 'site-title'
title.innerHTML = '<small>Start your exploration with</small><span>CORALITHM</span>'
document.body.appendChild(title)

const btnRow = document.createElement('div')
btnRow.id = 'btn-row'
document.body.appendChild(btnRow)

const addBtn = document.createElement('button')
addBtn.id = 'add-btn'
addBtn.textContent = '+ 산호 추가'
addBtn.style.display = 'none'
addBtn.addEventListener('click', openModal)
btnRow.appendChild(addBtn)

const uploadBtn = document.createElement('button')
uploadBtn.id = 'upload-btn'
uploadBtn.textContent = '📂 YouTube 데이터 업로드'
uploadBtn.style.display = 'none'
uploadBtn.addEventListener('click', () => fileInput.click())
btnRow.appendChild(uploadBtn)

const tutorialBtn = document.createElement('button')
tutorialBtn.id = 'tutorial-btn'
tutorialBtn.textContent = '?'
tutorialBtn.addEventListener('click', openTutorial)
document.body.appendChild(tutorialBtn)

const fileInput = document.createElement('input')
fileInput.type = 'file'
fileInput.accept = '.json'
fileInput.style.display = 'none'
document.body.appendChild(fileInput)
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const data = parseWatchHistory(ev.target.result)
    if (data.length === 0) { alert('데이터를 찾을 수 없습니다. watch-history.json 파일인지 확인해주세요.'); return }
    corals.filter((c) => !c.removing).forEach((c) => removeCoral(c))
    setTimeout(() => { data.forEach((d) => addCoralFromData(d)) }, 1000)
  }
  reader.readAsText(file)
  fileInput.value = ''
})

const tutorialOverlay = document.createElement('div')
tutorialOverlay.className = 'modal-overlay'
tutorialOverlay.innerHTML =
  '<div class="modal-content" style="position:relative;max-width:560px;text-align:left">' +
  '<button class="modal-close">&times;</button>' +
  '<h2>YouTube 데이터 가져오기</h2>' +
  '<div class="tutorial-steps">' +
  '<div class="step"><span class="step-num">1</span><a href="https://takeout.google.com" target="_blank" rel="noopener">takeout.google.com</a> 에 접속합니다</div>' +
  '<div class="step"><span class="step-num">2</span>"모두 선택 해제" 를 누른 뒤 <b>YouTube 및 YouTube Music</b> 만 체크합니다</div>' +
  '<div class="step"><span class="step-num">3</span>"모든 YouTube 데이터 포함" → <b>시청 기록</b>만 선택, 형식을 <b>JSON</b>으로 변경합니다</div>' +
  '<div class="step"><span class="step-num">4</span>"내보내기 만들기" → 완료되면 ZIP 다운로드 → 압축 해제</div>' +
  '<div class="step"><span class="step-num">5</span>폴더 안의 <b>watch-history.json</b> 파일을 이 페이지에 업로드합니다</div>' +
  '</div>' +
  '<p style="margin-top:16px;font-size:11px;opacity:0.5">데이터는 브라우저에서만 처리되며 외부로 전송되지 않습니다.</p>' +
  '</div>'
document.body.appendChild(tutorialOverlay)
tutorialOverlay.querySelector('.modal-close').addEventListener('click', () => tutorialOverlay.classList.remove('show'))
tutorialOverlay.addEventListener('click', (e) => { if (e.target === tutorialOverlay) tutorialOverlay.classList.remove('show') })
function openTutorial() { tutorialOverlay.classList.add('show') }

const modalOverlay = document.createElement('div')
modalOverlay.className = 'modal-overlay'
const modalContent = document.createElement('div')
modalContent.className = 'modal-content'
modalContent.style.position = 'relative'
modalContent.innerHTML =
  '<button class="modal-close">&times;</button>' +
  '<h2>어떤 산호를 성장시킬까요?</h2>' +
  '<p>관심있는 주제 3가지를 선택해주세요.<br>선택한 주제를 기반으로 산호가 성장합니다.</p>' +
  '<div class="cat-grid"></div>' +
  '<button id="generate-btn" disabled>산호 생성하기</button>'
modalOverlay.appendChild(modalContent)
document.body.appendChild(modalOverlay)

const catGrid = modalContent.querySelector('.cat-grid')
const genBtn = modalContent.querySelector('#generate-btn')
modalContent.querySelector('.modal-close').addEventListener('click', closeModal)
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal() })
let selected = []

CATEGORIES.forEach((cat) => {
  const tag = document.createElement('div')
  tag.className = 'cat-tag'
  tag.textContent = cat.name
  tag.addEventListener('click', () => {
    const idx = selected.indexOf(cat)
    if (idx >= 0) selected.splice(idx, 1)
    else if (selected.length < 3) selected.push(cat)
    updateTagStates()
  })
  tag.dataset.catName = cat.name
  catGrid.appendChild(tag)
})

function updateTagStates() {
  catGrid.querySelectorAll('.cat-tag').forEach((el) => {
    const cat = CATEGORIES.find((c) => c.name === el.dataset.catName)
    const idx = selected.indexOf(cat)
    el.classList.toggle('selected', idx >= 0)
    const existing = el.querySelector('.order')
    if (existing) existing.remove()
    if (idx >= 0) { const b = document.createElement('span'); b.className = 'order'; b.textContent = String(idx + 1); el.appendChild(b) }
  })
  genBtn.disabled = selected.length !== 3
}

function openModal() { selected = []; updateTagStates(); modalOverlay.classList.add('show') }
function closeModal() { modalOverlay.classList.remove('show') }
genBtn.addEventListener('click', () => {
  if (selected.length !== 3) return
  const cats = selected.map((cat) => ({ cat }))
  closeModal()
  addCoralManual(cats)
})

const detail = document.createElement('div')
detail.id = 'detail-panel'
document.body.appendChild(detail)

const vignette = document.createElement('div')
vignette.id = 'vignette'
document.body.appendChild(vignette)

function showDetail(c) {
  const d = c.data
  let html = '<h2>' + d.cat.name + '</h2>'
  if (d.subcats) {
    d.subcats.forEach((s) => {
      const hex = '#' + new THREE.Color(s.cat.color).getHexString()
      html += '<div class="row"><span class="dot" style="background:' + hex + '"></span>' + s.cat.name + ' · ' + Math.round(s.weight * 100) + '%</div>'
    })
  } else {
    html += '<div class="row"><span class="dot" style="background:#' + c.color.getHexString() + '"></span>비중 · ' + Math.round(d.weight * 100) + '%</div>'
  }
  html += '<div class="row">정서 유형 · ' + (EMOTIONS[d.cat.name] || '중립형') + '</div>'
  html += '<div class="row">시청 수 · ' + d.count + '회</div>'
  html += '<div class="row">채널 다양성 · ' + d.diversity + '개</div>'
  html += '<div class="row">최근 활성도 · ' + (d.recency > 0.6 ? '높음' : d.recency > 0.3 ? '보통' : '낮음') + '</div>'
  html += '<button id="delete-btn">산호 삭제</button>'
  detail.innerHTML = html
  detail.classList.add('show')
  detail.querySelector('#delete-btn').addEventListener('click', () => { if (focused) removeCoral(focused) })
}
function hideDetail() { detail.classList.remove('show') }

const screenshotBtn = document.createElement('button')
screenshotBtn.id = 'screenshot-btn'
screenshotBtn.textContent = '📷'
screenshotBtn.addEventListener('click', () => {
  composer.render()
  const link = document.createElement('a')
  link.download = 'coralithm.png'
  link.href = renderer.domElement.toDataURL('image/png')
  link.click()
})
document.body.appendChild(screenshotBtn)

const quizOverlay = document.createElement('div')
quizOverlay.className = 'modal-overlay'
const quizContent = document.createElement('div')
quizContent.className = 'modal-content'
quizContent.style.position = 'relative'
quizOverlay.appendChild(quizContent)
document.body.appendChild(quizOverlay)
let quizStep = 0, quizPicked = [], quizScores = []

function pickQuizQuestions() {
  const pool = [...Q_POOL]
  const picked = []
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(idx, 1)[0])
  }
  return picked
}

function showQuiz() {
  quizStep = 0
  quizPicked = pickQuizQuestions()
  quizScores = []
  renderQuizStep()
  quizOverlay.classList.add('show')
}

function renderQuizStep() {
  const q = quizPicked[quizStep]
  let html = '<h2>' + q.q + '</h2><div class="quiz-opts">'
  q.opts.forEach((o) => { html += '<button class="quiz-opt" data-cat="' + o.cat + '">' + o.text + '</button>' })
  html += '</div><p class="quiz-progress">' + (quizStep + 1) + ' / 3</p>'
  quizContent.innerHTML = html
  quizContent.querySelectorAll('.quiz-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      quizScores.push({ catName: btn.dataset.cat, weight: quizPicked[quizStep].w })
      quizStep++
      if (quizStep < 3) renderQuizStep()
      else finishQuiz()
    })
  })
}

function finishQuiz() {
  quizOverlay.classList.remove('show')
  const merged = new Map()
  for (const s of quizScores) {
    merged.set(s.catName, (merged.get(s.catName) || 0) + s.weight)
  }
  const totalPts = Array.from(merged.values()).reduce((a, b) => a + b, 0)
  const sorted = Array.from(merged.entries()).sort((a, b) => b[1] - a[1])
  const primaryName = sorted[0][0]
  const primaryCat = CATEGORIES.find((c) => c.name === primaryName) || FALLBACK_CAT
  const subcats = sorted.map(([name, pts]) => ({
    cat: CATEGORIES.find((c) => c.name === name) || FALLBACK_CAT,
    weight: pts / totalPts,
  }))
  const topWeight = sorted[0][1] / totalPts
  const data = {
    cat: primaryCat,
    weight: topWeight,
    count: Math.round(topWeight * 30),
    diversity: sorted.length + 2,
    recency: 0.5 + topWeight * 0.4,
    trend: 0.1,
    subcats,
  }
  addCoralFromData(data)
}

const startQuizBtn = document.createElement('button')
startQuizBtn.id = 'start-quiz-btn'
startQuizBtn.textContent = '🧭 시작 질문'
startQuizBtn.style.display = 'none'
startQuizBtn.addEventListener('click', showQuiz)
btnRow.appendChild(startQuizBtn)

const raycaster = new THREE.Raycaster()
const hoverRaycaster = new THREE.Raycaster()
let pointerStart = null

function startCamTween(toPos, toTarget) {
  camTween = { fromPos: camera.position.clone(), toPos: toPos.clone(), fromTar: controls.target.clone(), toTar: toTarget.clone(), t0: timer.getElapsed(), dur: 1.0 }
}
function updateCamTween() {
  if (!camTween) return
  let k = (timer.getElapsed() - camTween.t0) / camTween.dur; if (k >= 1) k = 1
  const a = easeInOut(k)
  camera.position.lerpVectors(camTween.fromPos, camTween.toPos, a)
  controls.target.lerpVectors(camTween.fromTar, camTween.toTar, a)
  if (k >= 1) camTween = null
}

function pickCluster(o) { while (o) { if (o.userData && o.userData.clusterRef) return o.userData.clusterRef; o = o.parent } return null }
function focusCluster(c) {
  if (c.removing) return
  focused = c
  const cpos = c.group.getWorldPosition(new THREE.Vector3())
  const dir = camera.position.clone().sub(controls.target).normalize()
  startCamTween(cpos.clone().add(dir.multiplyScalar(3.5)), cpos)
  showDetail(c)
  for (const o of corals) o.fadeTarget = (o === c) ? 1 : 0.12
}
function resetView() {
  focused = null; startCamTween(overviewPos, overviewTarget); hideDetail()
  for (const o of corals) o.fadeTarget = 1
}

renderer.domElement.addEventListener('pointerdown', (e) => { pointerStart = { x: e.clientX, y: e.clientY, t: performance.now() } })
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!pointerStart) return
  const moved = Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y)
  const elapsed = performance.now() - pointerStart.t
  pointerStart = null
  if (moved >= 6 || elapsed >= 350) return
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
  raycaster.setFromCamera(ndc, camera)
  const groups = corals.filter((c) => !c.removing).map((c) => c.group)
  const hits = raycaster.intersectObjects(groups, true)
  const c = hits.length ? pickCluster(hits[0].object) : null
  if (c) focusCluster(c)
  else if (focused) resetView()
})

renderer.domElement.addEventListener('pointermove', (e) => {
  if (focused) return
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
  hoverRaycaster.setFromCamera(ndc, camera)
  const groups = corals.filter((c) => !c.removing).map((c) => c.group)
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
    if (ge < GROW_DUR) growK = easeOutBack(clamp(ge / GROW_DUR, 0, 1))
    else if (!c.grown) c.grown = true

    c.fade += (c.fadeTarget - c.fade) * 0.08
    const isHovered = (c === hovered && !focused) ? 1 : 0
    const p = 0.5 + 0.5 * Math.sin(t * c.breathFreq + c.phase)
    for (const m of c.mats) {
      m.emissiveIntensity = (0.1 + 0.3 * p + isHovered * 0.4) * growK * c.fade * Math.max(c.data.recency, 0.3)
      m.opacity = clamp(c.fade * (0.4 + c.data.weight * 0.6), 0.08, 1)
    }
    const scaleFade = 0.7 + 0.3 * c.fade
    const breathScale = 1 + 0.02 * Math.sin(t * c.breathFreq + c.phase)
    c.group.scale.set(
      c.baseNorm * c.xzGirth * growK * scaleFade * breathScale,
      c.baseNorm * c.yStretch * growK * scaleFade * breathScale,
      c.baseNorm * c.xzGirth * growK * scaleFade * breathScale,
    )
    if (!focused) c.group.rotation.y += c.spinSpeed * dt

    const d = camera.position.distanceTo(c.group.getWorldPosition(_v))
    c.labelEl.style.opacity = String(clamp(1.4 - d / 14, 0.1, 1) * growK * c.fade)
  }

  if (lineMesh) {
    const allGrown = corals.every((c) => c.grown || c.removing)
    const lt = allGrown && corals.length >= 2 ? 0.1 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.7)) : 0
    lineMesh.material.opacity += (lt - lineMesh.material.opacity) * 0.05
  }

  updateFlow(dt, t)
  for (let i = 0; i < SNOW; i++) { const i3 = i * 3; snowPos[i3 + 1] -= dt * (0.18 + (i % 5) * 0.04); snowPos[i3] += Math.sin(t * 0.25 + i) * 0.001; if (snowPos[i3 + 1] < snowBox.yBot) snowPos[i3 + 1] = snowBox.yTop }
  snowGeo.attributes.position.needsUpdate = true
  shafts.forEach((s, i) => { s.material.opacity = 0.03 + 0.025 * (0.5 + 0.5 * Math.sin(t * 0.35 + i * 1.5)); s.position.x = s.userData.bx + Math.sin(t * 0.12 + i) * 0.4 })

  if (camTween) updateCamTween()
  else controls.update()
  composer.render()
  labelRenderer.render(scene, camera)
})
onResize()
