import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { draco } from '@gltf-transform/functions'
import draco3d from 'draco3dgltf'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

const MODELS_DIR = 'public/models'
const files = (await readdir(MODELS_DIR)).filter(f => f.endsWith('.glb'))

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
})

for (const file of files) {
  const path = join(MODELS_DIR, file)
  const before = (await stat(path)).size
  const doc = await io.read(path)
  await doc.transform(draco())
  await io.write(path, doc)
  const after = (await stat(path)).size
  console.log(`${file}: ${(before/1e6).toFixed(1)}MB → ${(after/1e6).toFixed(1)}MB (${Math.round((1-after/before)*100)}% smaller)`)
}
