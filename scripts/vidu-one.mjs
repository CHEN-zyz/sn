import fs from 'node:fs/promises'
import path from 'node:path'

const API_ROOT = 'https://api.vidu.cn/ent/v2'
const root = path.resolve(import.meta.dirname, '..')
const envPath = process.env.VIDU_ENV_PATH || 'D:/ANS Agent/.env'
const outputDir = path.join(root, 'pv', 'round-01')

function parseEnv(text) {
  return Object.fromEntries(
    text.split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()]
      }),
  )
}

async function getToken() {
  if (process.env.VIDU_API_KEY) return process.env.VIDU_API_KEY
  const env = parseEnv(await fs.readFile(envPath, 'utf8'))
  if (!env.VIDU_API_KEY) throw new Error(`VIDU_API_KEY missing in ${envPath}`)
  return env.VIDU_API_KEY
}

async function imageData(file) {
  const bytes = await fs.readFile(file)
  return `data:image/png;base64,${bytes.toString('base64')}`
}

async function request(token, url, options = {}) {
  const response = await fetch(`${API_ROOT}${url}`, {
    ...options,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = await response.json()
  if (!response.ok) throw new Error(`${response.status} ${JSON.stringify(body)}`)
  return body
}

async function poll(token, taskId) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const result = await request(token, `/tasks/${taskId}/creations`)
    if (result.state === 'success' || result.state === 'failed') return result
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
  throw new Error(`Timed out waiting for task ${taskId}`)
}

async function download(url, destination) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download failed: ${response.status}`)
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()))
}

const mode = process.env.VIDU_MODE || 'img2video'
const model = process.env.VIDU_MODEL || 'viduq2-turbo'
const duration = Number(process.env.VIDU_DURATION || 1)
const resolution = process.env.VIDU_RESOLUTION || '540p'
const seed = Number(process.env.VIDU_SEED || 62001)
const shot = process.env.VIDU_SHOT || 'solo'
const prompt = process.env.VIDU_PROMPT || 'A single bioluminescent coral breathes softly in a dark underwater digital space. Very slow subtle motion, calm drifting particles, preserve the exact coral shape, color and composition. No text, no interface, no animals, no plants.'

const imagesByShot = {
  solo: ['captures/solo.png'],
  trio: ['captures/trio.png'],
  reef: ['captures/reef.png'],
  refs: ['captures/solo.png', 'captures/trio.png', 'captures/reef.png', 'captures/forming.png'],
}

async function submit(token) {
  if (mode === 'img2video') {
    return request(token, '/img2video', {
      method: 'POST',
      body: JSON.stringify({
        model,
        images: [await imageData(path.join(root, imagesByShot[shot][0]))],
        prompt,
        audio: false,
        bgm: false,
        duration,
        seed,
        resolution,
        off_peak: false,
        watermark: false,
        payload: JSON.stringify({ project: 'coralithm-pv', mode, shot }),
      }),
    })
  }

  if (mode === 'reference2video') {
    return request(token, '/reference2video', {
      method: 'POST',
      body: JSON.stringify({
        model,
        images: await Promise.all(imagesByShot.refs.map((file) => imageData(path.join(root, file)))),
        prompt,
        audio: false,
        duration,
        seed,
        aspect_ratio: '16:9',
        resolution,
        off_peak: false,
        watermark: false,
        payload: JSON.stringify({ project: 'coralithm-pv', mode, shot }),
      }),
    })
  }

  throw new Error(`Unsupported VIDU_MODE=${mode}`)
}

await fs.mkdir(outputDir, { recursive: true })
const token = await getToken()
console.log(`Submitting ${mode}: ${model}, ${shot}, ${resolution}, ${duration}s`)
const submitted = await submit(token)
console.log(`${mode}: task=${submitted.task_id}, quoted_credits=${submitted.credits}`)
const result = await poll(token, submitted.task_id)
const manifest = {
  mode,
  model,
  shot,
  prompt,
  task_id: submitted.task_id,
  quoted_credits: submitted.credits,
  state: result.state,
  actual_credits: result.credits,
  err_code: result.err_code || '',
}
if (result.state === 'success' && result.creations?.[0]?.url) {
  const destination = path.join(outputDir, `${mode}-${shot}.mp4`)
  await download(result.creations[0].url, destination)
  manifest.file = path.relative(root, destination).replaceAll('\\', '/')
}
await fs.writeFile(path.join(outputDir, `${mode}-${shot}.json`), JSON.stringify(manifest, null, 2))
console.log(JSON.stringify({
  state: manifest.state,
  task_id: manifest.task_id,
  quoted_credits: manifest.quoted_credits,
  actual_credits: manifest.actual_credits,
  file: manifest.file,
  err_code: manifest.err_code,
}, null, 2))
