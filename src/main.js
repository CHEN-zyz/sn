import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import './style.css'

const TOPIC_COLORS = {
  Lifestyle: 0xf0756b,
  Education: 0x41cbff,
  Design: 0xb98cff,
  Music: 0x37e0c8,
  Gaming: 0xffa83a,
  Travel: 0x5ee8a0,
  Tech: 0x7ab8ff,
}
const CLUSTERS = [
  { topic: 'Lifestyle', emotion: 'Healing', weight: 1.0 },
  { topic: 'Education', emotion: 'Insight', weight: 0.82 },
  { topic: 'Design', emotion: 'Inspiration', weight: 0.92 },
  { topic: 'Music', emotion: 'Excitement', weight: 0.7 },
  { topic: 'Gaming', emotion: 'Thrill', weight: 0.6 },
  { topic: 'Travel', emotion: 'Calm', weight: 0.66 },
  { topic: 'Tech', emotion: 'Focus', weight: 0.75 },
]
const TOTAL_WEIGHT = CLUSTERS.reduce((s, c) => s + c.weight, 0)

const clamp = THREE.MathUtils.clamp
const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)
const easeOutBack = (k) => { const c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2) }
const GROW_STAGGER = 0.35
const GROW_DUR = 1.8
let growStartTime = -1
let growDone = false
const _v = new THREE.Vector3()

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
const clusterObjs = []
let overviewPos = camera.position.clone()
let overviewTarget = new THREE.Vector3()

const PLACEMENT = [
  { x: 0, y: -1, z: 0, ry: 0 },
  { x: 1.4, y: 0, z: 0.9, ry: 2.1 },
  { x: -1.3, y: -0.2, z: 0.7, ry: 4.2 },
  { x: 0.6, y: 0, z: -1.1, ry: 1.0 },
  { x: -0.8, y: 0, z: -0.9, ry: 3.5 },
  { x: 1.8, y: 0, z: -0.4, ry: 5.3 },
  { x: -1.7, y: 0, z: -0.3, ry: 0.8 },
]

new GLTFLoader().load(
  '/models/coral.glb',
  (gltf) => {
    CLUSTERS.forEach((data, i) => {
      const group = new THREE.Group()
      const inner = gltf.scene.clone(true)
      group.add(inner)

      const box = new THREE.Box3().setFromObject(group)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z) || 1
      const pl = PLACEMENT[i]
      const norm = (1.2 * data.weight) / maxDim
      inner.position.sub(center)
      group.scale.setScalar(norm)

      const color = new THREE.Color(TOPIC_COLORS[data.topic])
      const mats = []
      inner.traverse((o) => {
        if (o.isMesh && o.material) {
          o.material = o.material.clone()
          o.material.emissive = color.clone()
          o.material.emissiveIntensity = 0.2
          mats.push(o.material)
        }
      })

      group.position.set(pl.x, pl.y, pl.z)
      group.rotation.y = pl.ry
      group.rotation.x = (Math.random() - 0.5) * 0.2
      group.rotation.z = (Math.random() - 0.5) * 0.15

      const div = document.createElement('div')
      div.className = 'label'
      div.style.borderColor = 'rgba(' + Math.round(color.r * 255) + ',' + Math.round(color.g * 255) + ',' + Math.round(color.b * 255) + ',0.45)'
      div.textContent = data.topic
      const label = new CSS2DObject(div)
      label.position.set(0, (size.y * norm) / 2 + 0.6, 0)
      label.layers.set(0)
      group.add(label)

      group.scale.setScalar(0.001)
      div.style.opacity = '0'

      const obj = { group, data, mats, color, baseScale: norm, phase: i * 1.27, labelEl: div, index: i }
      group.userData.clusterRef = obj
      reef.add(group)
      clusterObjs.push(obj)
    })

    buildConnections()
    if (lineMesh) lineMesh.material.opacity = 0
    growStartTime = timer.getElapsed() + 0.3

    const rbox = new THREE.Box3().setFromObject(reef)
    const rcenter = rbox.getCenter(new THREE.Vector3())
    const rsphere = rbox.getBoundingSphere(new THREE.Sphere())
    overviewTarget.copy(rcenter)
    overviewPos.set(rcenter.x, rcenter.y + rsphere.radius * 0.35, rcenter.z + rsphere.radius * 1.9)
    controls.target.copy(overviewTarget)
    camera.position.copy(overviewPos)
    controls.update()
  },
  undefined,
  (err) => console.warn('coral.glb load failed', err),
)

let lineMesh = null
function buildConnections() {
  const curves = []
  for (let i = 0; i < clusterObjs.length; i++) {
    const dists = clusterObjs
      .map((c, j) => ({ j, d: i === j ? Infinity : clusterObjs[i].group.position.distanceTo(c.group.position) }))
      .sort((a, b) => a.d - b.d)
    for (let k = 0; k < 2; k++) {
      const a = clusterObjs[i].group.position
      const b = clusterObjs[dists[k].j].group.position
      const mid = a.clone().add(b).multiplyScalar(0.5)
      mid.y += 0.3 + a.distanceTo(b) * 0.12
      const curve = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone())
      curves.push(curve)
    }
  }
  const pos = []
  curves.forEach((c) => {
    const pts = c.getPoints(20)
    for (let k = 0; k < pts.length - 1; k++) {
      pos.push(pts[k].x, pts[k].y, pts[k].z, pts[k + 1].x, pts[k + 1].y, pts[k + 1].z)
    }
  })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  lineMesh = new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({
      color: 0x4ac8ff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: true,
    }),
  )
  reef.add(lineMesh)
}

const FLOW_MAX = 3000
const FLOW_RADIUS = 4
const FLOW_SPEED = 0.3
const flowPos = new Float32Array(FLOW_MAX * 3)
const flowCol = new Float32Array(FLOW_MAX * 3)
const flowSeed = new Float32Array(FLOW_MAX)
for (let i = 0; i < FLOW_MAX; i++) {
  const r = FLOW_RADIUS * Math.cbrt(Math.random())
  const th = Math.acos(2 * Math.random() - 1)
  const ph = Math.random() * Math.PI * 2
  flowPos[i * 3] = r * Math.sin(th) * Math.cos(ph)
  flowPos[i * 3 + 1] = r * Math.sin(th) * Math.sin(ph)
  flowPos[i * 3 + 2] = r * Math.cos(th)
  const b = 0.3 + Math.random() * 0.7
  flowCol[i * 3] = flowCol[i * 3 + 1] = flowCol[i * 3 + 2] = b
  flowSeed[i] = Math.random() * 1000
}
const flowGeo = new THREE.BufferGeometry()
flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3))
flowGeo.setAttribute('color', new THREE.BufferAttribute(flowCol, 3))
const flowMat = new THREE.PointsMaterial({
  size: 0.04,
  color: 0x5ad0ff,
  vertexColors: true,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  sizeAttenuation: true,
})
scene.add(new THREE.Points(flowGeo, flowMat))

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

const SNOW = 800
const snowBox = { x: 8, yTop: 7, yBot: -5, z: 8 }
const snowPos = new Float32Array(SNOW * 3)
for (let i = 0; i < SNOW; i++) {
  snowPos[i * 3] = (Math.random() * 2 - 1) * snowBox.x
  snowPos[i * 3 + 1] = snowBox.yBot + Math.random() * (snowBox.yTop - snowBox.yBot)
  snowPos[i * 3 + 2] = (Math.random() * 2 - 1) * snowBox.z
}
const snowGeo = new THREE.BufferGeometry()
snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3))
scene.add(
  new THREE.Points(
    snowGeo,
    new THREE.PointsMaterial({
      size: 0.025,
      color: 0x8abbd6,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  ),
)

function makeShaftTexture() {
  const c = document.createElement('canvas')
  c.width = 32
  c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, 'rgba(140,200,255,0.4)')
  g.addColorStop(0.5, 'rgba(130,190,255,0.1)')
  g.addColorStop(1, 'rgba(130,190,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
const shaftTex = makeShaftTexture()
const shafts = []
for (let i = 0; i < 3; i++) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 16),
    new THREE.MeshBasicMaterial({
      map: shaftTex,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    }),
  )
  const bx = (i - 1) * 3
  m.position.set(bx, 5, -2 - i * 0.5)
  m.rotation.z = (i % 2 ? 1 : -1) * 0.12
  m.userData.bx = bx
  shafts.push(m)
  scene.add(m)
}

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.65, 0.65, 0.42))
composer.addPass(new OutputPass())

const hint = document.createElement('div')
hint.id = 'hint'
hint.textContent = 'click a coral to focus · click empty to return'
document.body.appendChild(hint)

const detail = document.createElement('div')
detail.id = 'detail-panel'
document.body.appendChild(detail)

const vignette = document.createElement('div')
vignette.id = 'vignette'
document.body.appendChild(vignette)

function showDetail(c) {
  const pct = Math.round((c.data.weight / TOTAL_WEIGHT) * 100)
  const hex = '#' + c.color.getHexString()
  detail.innerHTML =
    '<h2>' + c.data.topic + '</h2>' +
    '<div class="row"><span class="dot" style="background:' + hex + '"></span>Emotion · ' + c.data.emotion + '</div>' +
    '<div class="row">Share · ' + pct + '%</div>'
  detail.classList.add('show')
}
function hideDetail() {
  detail.classList.remove('show')
}

const raycaster = new THREE.Raycaster()
let pointerStart = null
let focused = null
let camTween = null

function startCamTween(toPos, toTarget) {
  camTween = {
    fromPos: camera.position.clone(),
    toPos: toPos.clone(),
    fromTar: controls.target.clone(),
    toTar: toTarget.clone(),
    t0: timer.getElapsed(),
    dur: 1.0,
  }
}
function updateCamTween() {
  if (!camTween) return
  let k = (timer.getElapsed() - camTween.t0) / camTween.dur
  if (k >= 1) k = 1
  const a = easeInOut(k)
  camera.position.lerpVectors(camTween.fromPos, camTween.toPos, a)
  controls.target.lerpVectors(camTween.fromTar, camTween.toTar, a)
  if (k >= 1) camTween = null
}

function pickCluster(o) {
  while (o) {
    if (o.userData && o.userData.clusterRef) return o.userData.clusterRef
    o = o.parent
  }
  return null
}
function focusCluster(c) {
  focused = c
  const cpos = c.group.getWorldPosition(new THREE.Vector3())
  const dir = camera.position.clone().sub(controls.target).normalize()
  const dist = 1.8 + c.baseScale * 4
  startCamTween(cpos.clone().add(dir.multiplyScalar(dist)), cpos)
  showDetail(c)
}
function resetView() {
  focused = null
  startCamTween(overviewPos, overviewTarget)
  hideDetail()
}

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerStart = { x: e.clientX, y: e.clientY, t: performance.now() }
})
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!pointerStart) return
  const moved = Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y)
  const elapsed = performance.now() - pointerStart.t
  pointerStart = null
  if (moved >= 6 || elapsed >= 350) return
  const ndc = new THREE.Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
  raycaster.setFromCamera(ndc, camera)
  const hits = raycaster.intersectObjects(clusterObjs.map((c) => c.group), true)
  const c = hits.length ? pickCluster(hits[0].object) : null
  if (c) focusCluster(c)
  else if (focused) resetView()
})

function onResize() {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  composer.setSize(w, h)
  labelRenderer.setSize(w, h)
}
window.addEventListener('resize', onResize)

const timer = new THREE.Timer()
timer.connect(document)

renderer.setAnimationLoop((time) => {
  timer.update(time)
  const dt = Math.min(timer.getDelta(), 0.05)
  const t = timer.getElapsed()

  if (!focused && !camTween) reef.rotation.y += dt * 0.06

  let allGrown = true
  for (const c of clusterObjs) {
    let growK = 1
    if (growStartTime >= 0) {
      const elapsed = t - growStartTime - c.index * GROW_STAGGER
      if (elapsed < 0) { growK = 0; allGrown = false }
      else if (elapsed < GROW_DUR) { growK = easeOutBack(elapsed / GROW_DUR); allGrown = false }
    }

    const p = 0.5 + 0.5 * Math.sin(t * 1.0 + c.phase)
    for (const m of c.mats) m.emissiveIntensity = (0.12 + 0.2 * p) * growK
    c.group.scale.setScalar(c.baseScale * growK * (1 + 0.02 * Math.sin(t * 0.7 + c.phase)))
    const d = camera.position.distanceTo(c.group.getWorldPosition(_v))
    const op = clamp(1.4 - d / 14, 0.1, 1) * growK
    c.labelEl.style.opacity = String(focused && focused !== c ? op * 0.25 : op)
  }
  if (allGrown && !growDone) growDone = true

  const lineBase = growDone ? 0.1 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.7)) : 0
  if (lineMesh) {
    lineMesh.material.opacity += (lineBase - lineMesh.material.opacity) * 0.05
  }

  updateFlow(dt, t)

  for (let i = 0; i < SNOW; i++) {
    const i3 = i * 3
    snowPos[i3 + 1] -= dt * (0.18 + (i % 5) * 0.04)
    snowPos[i3] += Math.sin(t * 0.25 + i) * 0.001
    if (snowPos[i3 + 1] < snowBox.yBot) snowPos[i3 + 1] = snowBox.yTop
  }
  snowGeo.attributes.position.needsUpdate = true

  shafts.forEach((s, i) => {
    s.material.opacity = 0.03 + 0.025 * (0.5 + 0.5 * Math.sin(t * 0.35 + i * 1.5))
    s.position.x = s.userData.bx + Math.sin(t * 0.12 + i) * 0.4
  })

  if (camTween) updateCamTween()
  else controls.update()

  composer.render()
  labelRenderer.render(scene, camera)
})

onResize()
