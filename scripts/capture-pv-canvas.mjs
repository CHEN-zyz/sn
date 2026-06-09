import { spawn } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const baseUrl = process.env.PV_URL || 'http://127.0.0.1:5173/'
const outDir = path.resolve(process.env.PV_OUT_DIR || 'pv/web')
const times = (process.env.PV_TIMES || '0,4,9,14,19,24,26').split(',').map((v) => Number(v.trim())).filter(Number.isFinite)
const port = Number(process.env.PV_CDP_PORT || 9444)
const profileDir = path.join(tmpdir(), `coral-pv-cdp-${port}`)
const attachOnly = process.env.PV_ATTACH === '1'
const skipFrames = process.env.PV_SKIP_FRAMES === '1'
const recordTimeline = process.env.PV_RECORD === '1'
const recordMs = Number(process.env.PV_RECORD_MS || 27000)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitJson(url, timeout = 12000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    try {
      const res = await fetch(url)
      if (res.ok) return res.json()
    } catch {
      // Chrome is still booting.
    }
    await sleep(120)
  }
  throw new Error(`Timed out waiting for ${url}`)
}

class CDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.seq = 0
    this.pending = new Map()
    this.waiters = new Map()
  }

  async open() {
    this.ws = new WebSocket(this.wsUrl)
    this.ws.addEventListener('message', (event) => this.onMessage(event))
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('CDP websocket open timeout')), 10000)
      this.ws.addEventListener('open', () => { clearTimeout(timeout); resolve() }, { once: true })
      this.ws.addEventListener('error', (err) => { clearTimeout(timeout); reject(err) }, { once: true })
    })
  }

  onMessage(event) {
    const msg = JSON.parse(event.data)
    if (msg.id && this.pending.has(msg.id)) {
      const { resolve, reject } = this.pending.get(msg.id)
      this.pending.delete(msg.id)
      if (msg.error) reject(new Error(`${msg.error.message}: ${msg.error.data || ''}`))
      else resolve(msg.result)
      return
    }
    const waiters = this.waiters.get(msg.method)
    if (!waiters) return
    this.waiters.delete(msg.method)
    waiters.forEach((resolve) => resolve(msg.params || {}))
  }

  send(method, params = {}) {
    const id = ++this.seq
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }))
  }

  waitFor(method, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeout)
      const wrapped = (params) => { clearTimeout(timeoutId); resolve(params) }
      const waiters = this.waiters.get(method) || []
      waiters.push(wrapped)
      this.waiters.set(method, waiters)
    })
  }

  close() {
    this.ws?.close()
  }
}

async function createTarget() {
  const targetUrl = `http://127.0.0.1:${port}/json/new?${encodeURIComponent('about:blank')}`
  let res = await fetch(targetUrl, { method: 'PUT' })
  if (!res.ok) res = await fetch(targetUrl)
  if (!res.ok) throw new Error(`Failed to create Chrome target: ${res.status} ${await res.text()}`)
  return res.json()
}

function pvUrl(time) {
  const url = new URL(baseUrl)
  url.searchParams.set('pv', '1')
  url.searchParams.set('pvTime', String(time))
  url.searchParams.set('captureTick', String(Date.now()))
  return url.href
}

function livePVUrl() {
  const url = new URL(baseUrl)
  url.searchParams.set('pv', '1')
  url.searchParams.set('captureTick', String(Date.now()))
  return url.href
}

async function evaluate(cdp, expression, awaitPromise = false) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise,
    returnByValue: true,
  })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime.evaluate failed')
  return result.result?.value
}

async function waitForExpression(cdp, expression, timeout = 30000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await evaluate(cdp, `Boolean(${expression})`)) return
    await sleep(180)
  }
  throw new Error(`Timed out waiting for expression: ${expression}`)
}

async function navigate(cdp, url) {
  const load = cdp.waitFor('Page.loadEventFired', 20000).catch(() => null)
  await cdp.send('Page.navigate', { url })
  await load
}

async function captureFrame(cdp, time) {
  await navigate(cdp, pvUrl(time))
  await waitForExpression(cdp, `window.__coralPVReady === true && typeof window.__coralExportCanvasPNG === 'function'`)
  await evaluate(cdp, `new Promise((resolve) => {
    let frames = 0
    const step = () => {
      frames += 1
      if (frames >= 8) resolve(true)
      else requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })`, true)
  const dataUrl = await evaluate(cdp, `window.__coralExportCanvasPNG()`)
  if (!dataUrl?.startsWith('data:image/png;base64,')) throw new Error(`No PNG data URL for ${time}s`)
  return dataUrl
}

async function makeContactSheet(cdp, frames) {
  const payload = JSON.stringify(frames.map(({ time, dataUrl }) => ({ time, dataUrl })))
  return evaluate(cdp, `(async () => {
    const frames = ${payload}
    const thumbW = 426
    const thumbH = 240
    const cols = 3
    const rows = 3
    const canvas = document.createElement('canvas')
    canvas.width = thumbW * cols
    canvas.height = thumbH * rows
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#020508'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = '20px ui-monospace, SFMono-Regular, Consolas, monospace'
    ctx.textBaseline = 'top'
    for (let i = 0; i < frames.length; i++) {
      const img = new Image()
      img.src = frames[i].dataUrl
      await img.decode()
      const x = (i % cols) * thumbW
      const y = Math.floor(i / cols) * thumbH
      ctx.drawImage(img, x, y, thumbW, thumbH)
      ctx.fillStyle = 'rgba(0,0,0,0.42)'
      ctx.fillRect(x, y, 76, 34)
      ctx.fillStyle = 'rgba(220,245,255,0.92)'
      ctx.fillText(String(frames[i].time).padStart(2, '0') + 's', x + 14, y + 8)
    }
    return canvas.toDataURL('image/jpeg', 0.92)
  })()`, true)
}

async function recordLivePV(cdp) {
  await navigate(cdp, livePVUrl())
  await waitForExpression(cdp, `window.__coralPVReady === true && typeof window.__coralResetPVTimeline === 'function' && typeof window.__coralExportCanvasPNG === 'function'`)
  await evaluate(cdp, `window.__coralResetPVTimeline()`)
  return evaluate(cdp, `(async () => {
    const canvas = document.querySelector('canvas')
    const stream = canvas.captureStream(30)
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm;codecs=vp8'
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3500000 })
    const chunks = []
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data)
    }
    const done = new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      }
    })
    recorder.start(1000)
    setTimeout(() => recorder.stop(), ${recordMs})
    return done
  })()`, true)
}

async function saveDataUrl(filePath, dataUrl) {
  const [, base64] = dataUrl.split(',')
  await writeFile(filePath, Buffer.from(base64, 'base64'))
}

async function main() {
  await mkdir(outDir, { recursive: true })
  const chrome = attachOnly ? null : spawn(chromePath, [
      '--headless=new',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-allow-origins=*',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      '--window-size=1280,720',
      'about:blank',
    ], { stdio: ['ignore', 'ignore', 'pipe'] })
  let chromeStderr = ''
  chrome?.stderr.on('data', (chunk) => { chromeStderr += chunk.toString() })

  let cdp
  try {
    await waitJson(`http://127.0.0.1:${port}/json/version`).catch((err) => {
      throw new Error(`${err.message}\nChrome stderr:\n${chromeStderr.trim()}`)
    })
    const target = await createTarget()
    cdp = new CDP(target.webSocketDebuggerUrl)
    await cdp.open()
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')

    if (!skipFrames) {
      const frames = []
      for (const time of times) {
        const dataUrl = await captureFrame(cdp, time)
        const filename = `pv-${String(time).padStart(2, '0')}.png`
        const filePath = path.join(outDir, filename)
        await saveDataUrl(filePath, dataUrl)
        frames.push({ time, dataUrl })
        console.log(`${filename} saved`)
      }

      const contactSheet = await makeContactSheet(cdp, frames)
      await saveDataUrl(path.join(outDir, 'pv-contact-sheet.jpg'), contactSheet)
      console.log('pv-contact-sheet.jpg saved')
    }

    if (recordTimeline) {
      const video = await recordLivePV(cdp)
      await saveDataUrl(path.join(outDir, 'pv-web-live.webm'), video)
      console.log('pv-web-live.webm saved')
    }
  } finally {
    cdp?.close()
    chrome?.kill()
    if (!attachOnly && profileDir.startsWith(path.join(tmpdir(), 'coral-pv-cdp-'))) {
      await rm(profileDir, { recursive: true, force: true }).catch(() => {})
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
