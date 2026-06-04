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

const CATEGORIES = [
  { name: '뉴스·시사', color: 0x4a90d9 },
  { name: '경제·시장·투자', color: 0x50c878 },
  { name: '요리', color: 0xf0756b },
  { name: '게임', color: 0xffa83a },
  { name: '스포츠', color: 0x5ee8a0 },
  { name: '소프트웨어·데이터·AI', color: 0x7ab8ff },
  { name: '환경·기후', color: 0x37e0c8 },
  { name: '광고·마케팅', color: 0xb98cff },
  { name: '음악', color: 0xff6b9d },
  { name: '디자인·예술', color: 0xc084fc },
  { name: '여행', color: 0x41cbff },
  { name: '영감·인사이트', color: 0xffd700 },
  { name: '학습', color: 0x64dfdf },
  { name: '스타일', color: 0xff85a2 },
]
const WEIGHTS = [0.5, 0.3, 0.2]
const GROW_DUR = 1.8
const clamp = THREE.MathUtils.clamp
const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)
const easeOutBack = (k) => { const c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2) }
const _v = new THREE.Vector3()

const corals = []
let coralTemplate = null
let focused = null
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

new GLTFLoader().load(
  '/models/coral.glb',
  (gltf) => {
    coralTemplate = gltf.scene
    addBtn.style.display = ''
  },
  undefined,
  (err) => console.warn('coral.glb load failed', err),
)

function findPlacement() {
  if (corals.length === 0) return new THREE.Vector3(0, 0, 0)
  const minDist = 2.2
  for (let r = 1; r < 8; r++) {
    const radius = r * 1.6
    const n = Math.max(6, r * 5)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r * 0.7
      const pos = new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)
      if (corals.every((c) => c.group.position.distanceTo(pos) > minDist)) return pos
    }
  }
  return new THREE.Vector3((Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 6)
}

function addCoral(cats) {
  if (!coralTemplate) return
  const group = new THREE.Group()
  const inner = coralTemplate.clone(true)
  group.add(inner)

  const box = new THREE.Box3().setFromObject(group)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const norm = 1.2 / maxDim
  inner.position.sub(center)

  const primaryColor = new THREE.Color(cats[0].cat.color)
  const mats = []
  inner.traverse((o) => {
    if (o.isMesh && o.material) {
      o.material = o.material.clone()
      o.material.transparent = true
      o.material.opacity = 1
      o.material.emissive = primaryColor.clone()
      o.material.emissiveIntensity = 0.2
      mats.push(o.material)
    }
  })

  const pos = findPlacement()
  group.position.copy(pos)
  group.rotation.y = Math.random() * Math.PI * 2
  group.rotation.x = (Math.random() - 0.5) * 0.2
  group.rotation.z = (Math.random() - 0.5) * 0.15
  group.scale.setScalar(0.001)

  const topName = cats[0].cat.name
  const div = document.createElement('div')
  div.className = 'label'
  div.style.borderColor = 'rgba(' + Math.round(primaryColor.r * 255) + ',' + Math.round(primaryColor.g * 255) + ',' + Math.round(primaryColor.b * 255) + ',0.45)'
  div.textContent = topName
  div.style.opacity = '0'
  const label = new CSS2DObject(div)
  label.position.set(0, (size.y * norm) / 2 + 0.6, 0)
  label.layers.set(0)
  group.add(label)

  const obj = {
    group, mats, color: primaryColor, baseScale: norm,
    phase: Math.random() * 10, labelEl: div,
    cats, growStart: timer.getElapsed(), grown: false,
    fade: 1, fadeTarget: 1, removing: false, removeStart: 0,
  }
  group.userData.clusterRef = obj
  reef.add(group)
  corals.push(obj)

  rebuildConnections()
  updateOverview()
}

function removeCoral(c) {
  c.removing = true
  c.removeStart = timer.getElapsed()
  if (focused === c) {
    focused = null
    hideDetail()
  }
  for (const o of corals) o.fadeTarget = 1
}

function finishRemove(c) {
  reef.remove(c.group)
  const idx = corals.indexOf(c)
  if (idx >= 0) corals.splice(idx, 1)
  rebuildConnections()
  updateOverview()
  if (focused) {
    startCamTween(overviewPos, overviewTarget)
    focused = null
  }
}

let lineMesh = null
function rebuildConnections() {
  if (lineMesh) { reef.remove(lineMesh); lineMesh.geometry.dispose(); lineMesh = null }
  if (corals.length < 2) return
  const active = corals.filter((c) => !c.removing)
  if (active.length < 2) return
  const curves = []
  for (let i = 0; i < active.length; i++) {
    const dists = active
      .map((c, j) => ({ j, d: i === j ? Infinity : active[i].group.position.distanceTo(c.group.position) }))
      .sort((a, b) => a.d - b.d)
    const neighbors = Math.min(2, active.length - 1)
    for (let k = 0; k < neighbors; k++) {
      const a = active[i].group.position
      const b = active[dists[k].j].group.position
      const mid = a.clone().add(b).multiplyScalar(0.5)
      mid.y += 0.3 + a.distanceTo(b) * 0.12
      curves.push(new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone()))
    }
  }
  const verts = []
  curves.forEach((c) => {
    const pts = c.getPoints(20)
    for (let k = 0; k < pts.length - 1; k++) {
      verts.push(pts[k].x, pts[k].y, pts[k].z, pts[k + 1].x, pts[k + 1].y, pts[k + 1].z)
    }
  })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  lineMesh = new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ color: 0x4ac8ff, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false, fog: true }),
  )
  reef.add(lineMesh)
}

function updateOverview() {
  if (corals.length === 0) {
    overviewPos.set(0, 2, 8)
    overviewTarget.set(0, 0, 0)
    return
  }
  const box = new THREE.Box3()
  for (const c of corals) if (!c.removing) box.expandByObject(c.group)
  if (box.isEmpty()) return
  const center = box.getCenter(new THREE.Vector3())
  const sphere = box.getBoundingSphere(new THREE.Sphere())
  overviewTarget.copy(center)
  overviewPos.set(center.x, center.y + sphere.radius * 0.4, center.z + Math.max(sphere.radius * 2.2, 5))
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
scene.add(new THREE.Points(flowGeo, new THREE.PointsMaterial({
  size: 0.04, color: 0x5ad0ff, vertexColors: true, transparent: true,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
})))

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
scene.add(new THREE.Points(snowGeo, new THREE.PointsMaterial({
  size: 0.025, color: 0x8abbd6, transparent: true, opacity: 0.45,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
})))

function makeShaftTexture() {
  const c = document.createElement('canvas')
  c.width = 32; c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, 'rgba(140,200,255,0.4)')
  g.addColorStop(0.5, 'rgba(130,190,255,0.1)')
  g.addColorStop(1, 'rgba(130,190,255,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
const shaftTex = makeShaftTexture()
const shafts = []
for (let i = 0; i < 3; i++) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 16),
    new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }),
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

const title = document.createElement('div')
title.id = 'site-title'
title.innerHTML = '<small>Start your exploration with</small><span>CORALITHM</span>'
document.body.appendChild(title)

const addBtn = document.createElement('button')
addBtn.id = 'add-btn'
addBtn.textContent = '+ 산호 추가'
addBtn.style.display = 'none'
addBtn.addEventListener('click', openModal)
document.body.appendChild(addBtn)

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
const closeBtn = modalContent.querySelector('.modal-close')
let selected = []

CATEGORIES.forEach((cat) => {
  const tag = document.createElement('div')
  tag.className = 'cat-tag'
  tag.textContent = cat.name
  tag.addEventListener('click', () => {
    const idx = selected.indexOf(cat)
    if (idx >= 0) {
      selected.splice(idx, 1)
    } else if (selected.length < 3) {
      selected.push(cat)
    }
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
    if (idx >= 0) {
      const badge = document.createElement('span')
      badge.className = 'order'
      badge.textContent = String(idx + 1)
      el.appendChild(badge)
    }
  })
  genBtn.disabled = selected.length !== 3
}

function openModal() {
  selected = []
  updateTagStates()
  modalOverlay.classList.add('show')
}
function closeModal() {
  modalOverlay.classList.remove('show')
}
closeBtn.addEventListener('click', closeModal)
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal() })

genBtn.addEventListener('click', () => {
  if (selected.length !== 3) return
  const cats = selected.map((cat, i) => ({ cat, weight: WEIGHTS[i] }))
  closeModal()
  addCoral(cats)
})

const detail = document.createElement('div')
detail.id = 'detail-panel'
document.body.appendChild(detail)

const vignette = document.createElement('div')
vignette.id = 'vignette'
document.body.appendChild(vignette)

function showDetail(c) {
  let html = '<h2>' + c.cats[0].cat.name + '</h2>'
  c.cats.forEach((entry) => {
    const hex = '#' + new THREE.Color(entry.cat.color).getHexString()
    const pct = Math.round(entry.weight * 100)
    html += '<div class="row"><span class="dot" style="background:' + hex + '"></span>' + entry.cat.name + ' · ' + pct + '%</div>'
  })
  html += '<button id="delete-btn">산호 삭제</button>'
  detail.innerHTML = html
  detail.classList.add('show')
  detail.querySelector('#delete-btn').addEventListener('click', () => {
    if (focused) removeCoral(focused)
  })
}
function hideDetail() {
  detail.classList.remove('show')
}

const raycaster = new THREE.Raycaster()
let pointerStart = null

function startCamTween(toPos, toTarget) {
  camTween = { fromPos: camera.position.clone(), toPos: toPos.clone(), fromTar: controls.target.clone(), toTar: toTarget.clone(), t0: timer.getElapsed(), dur: 1.0 }
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
  if (c.removing) return
  focused = c
  const cpos = c.group.getWorldPosition(new THREE.Vector3())
  const dir = camera.position.clone().sub(controls.target).normalize()
  startCamTween(cpos.clone().add(dir.multiplyScalar(3.5)), cpos)
  showDetail(c)
  for (const o of corals) o.fadeTarget = (o === c) ? 1 : 0.12
}
function resetView() {
  focused = null
  startCamTween(overviewPos, overviewTarget)
  hideDetail()
  for (const o of corals) o.fadeTarget = 1
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
  const groups = corals.filter((c) => !c.removing).map((c) => c.group)
  const hits = raycaster.intersectObjects(groups, true)
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

  for (let ci = corals.length - 1; ci >= 0; ci--) {
    const c = corals[ci]

    if (c.removing) {
      const re = t - c.removeStart
      const rk = clamp(1 - re / 0.8, 0, 1)
      c.group.scale.setScalar(c.baseScale * rk * rk)
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

    const p = 0.5 + 0.5 * Math.sin(t * 1.0 + c.phase)
    for (const m of c.mats) {
      m.emissiveIntensity = (0.12 + 0.2 * p) * growK * c.fade
      m.opacity = clamp(c.fade, 0.08, 1)
    }
    const scaleFade = 0.7 + 0.3 * c.fade
    c.group.scale.setScalar(c.baseScale * growK * scaleFade * (1 + 0.02 * Math.sin(t * 0.7 + c.phase)))
    const d = camera.position.distanceTo(c.group.getWorldPosition(_v))
    const op = clamp(1.4 - d / 14, 0.1, 1) * growK * c.fade
    c.labelEl.style.opacity = String(op)
  }

  if (lineMesh) {
    const allGrown = corals.every((c) => c.grown || c.removing)
    const lineTarget = allGrown && corals.length >= 2 ? 0.1 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.7)) : 0
    lineMesh.material.opacity += (lineTarget - lineMesh.material.opacity) * 0.05
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
