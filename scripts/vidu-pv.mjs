import fs from 'node:fs/promises'
import path from 'node:path'

const API_ROOT = 'https://api.vidu.cn/ent/v2'
const root = path.resolve(import.meta.dirname, '..')
const envPath = process.env.VIDU_ENV_PATH || 'D:/ANS Agent/.env'
const outputDir = path.join(root, 'pv', 'round-01')
const model = process.env.VIDU_MODEL || 'viduq2-turbo'
const duration = Number(process.env.VIDU_DURATION || 5)
const resolution = process.env.VIDU_RESOLUTION || '720p'

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

async function submitMultiframe(token) {
  const body = {
    model,
    start_image: await imageData(path.join(root, shots[0].start)),
    image_settings: [
      {
        prompt: shots[0].prompt,
        key_image: await imageData(path.join(root, shots[0].end)),
        duration,
      },
      {
        prompt: shots[1].prompt,
        key_image: await imageData(path.join(root, shots[1].end)),
        duration,
      },
      {
        prompt: shots[2].prompt,
        key_image: await imageData(path.join(root, shots[2].end)),
        duration,
      },
    ],
    resolution,
    watermark: false,
    payload: JSON.stringify({ project: 'coralithm-pv', shot: 'multiframe-A-B-C', round: 1 }),
  }
  return request(token, '/multiframe', {
    method: 'POST',
    body: JSON.stringify(body),
  })
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

const shots = [
  {
    id: 'A_trace',
    start: 'captures/void.png',
    end: 'captures/signal.png',
    seed: 61401,
    prompt: 'A vast dark underwater void. One small cyan bioluminescent particle drifts slowly forward, then moves toward a barely visible organic coral silhouette in the distance. Sparse suspended particles, subtle volumetric light, deep black negative space, restrained cinematic motion. The camera follows with a very slow forward drift. Preserve the final silhouette. No fish, no plants, no text, no interface, no sudden movement.',
  },
  {
    id: 'B_gather',
    start: 'captures/signal.png',
    end: 'captures/forming.png',
    seed: 61402,
    prompt: 'The cyan particle reaches the faint coral silhouette. Tiny luminous traces are gently drawn toward it like slow underwater currents. Thin cyan and violet veins gradually outline the coral from inside while fine particles gather around the branches. Organic and digital at the same time, black deep-sea background, continuous slow camera push-in. Preserve the coral shape and composition. No explosion, no creatures, no text.',
  },
  {
    id: 'C_form',
    start: 'captures/forming.png',
    end: 'captures/solo.png',
    seed: 61403,
    prompt: 'The half-formed luminous coral slowly gains physical material. Fine particles settle onto its glowing branches and form a translucent organic surface. The finished coral releases one soft pulse of light like its first breath. Preserve the exact coral silhouette, position, and final composition. Minimal camera motion, restrained cinematic deep sea, no extra objects, no text, no interface.',
  },
]

await fs.mkdir(outputDir, { recursive: true })
const token = await getToken()
const manifest = {
  mode: 'multiframe',
  model,
  duration,
  resolution,
  shots,
}

console.log(`Submitting multiframe test: ${model}, ${resolution}, ${duration}s x ${shots.length}`)
const submitted = await submitMultiframe(token)
console.log(`multiframe: task=${submitted.task_id}, quoted_credits=${submitted.credits}`)
const result = await poll(token, submitted.task_id)
manifest.task_id = submitted.task_id
manifest.quoted_credits = submitted.credits
manifest.state = result.state
manifest.actual_credits = result.credits
manifest.err_code = result.err_code || ''

if (result.state === 'success' && result.creations?.[0]?.url) {
  const destination = path.join(outputDir, 'multiframe-A-B-C.mp4')
  await download(result.creations[0].url, destination)
  manifest.file = path.relative(root, destination).replaceAll('\\', '/')
}

await fs.writeFile(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(JSON.stringify({
  state: manifest.state,
  task_id: manifest.task_id,
  quoted_credits: manifest.quoted_credits,
  actual_credits: manifest.actual_credits,
  file: manifest.file,
  err_code: manifest.err_code,
}, null, 2))
