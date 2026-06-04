# Coralithm — Design Document

## Concept

Social media watch history visualized as a living coral reef.
Users upload their YouTube data (Google Takeout); the system analyzes viewing patterns and grows a unique coral for each topic category.
Every coral's shape, size, color, glow, and motion is driven by real data — no two reefs look the same.

---

## Current Implementation

### Data Input (two modes)

**Mode A — Google Takeout upload (real data)**
- User clicks "📂 YouTube 데이터 업로드" → selects `watch-history.json` exported from Google Takeout
- Frontend-only parsing (no server, no data transmitted externally)
- Extracts: video titles, channels, timestamps
- Classification: keyword matching against 14 topic categories (Korean + English + common terms per category)
- Computes per-category: watch count, channel diversity, recency, trend (increasing/decreasing interest)
- Generates one coral per category found in the user's data, each with unique visual properties

**Mode B — Manual selection (demo/fallback)**
- User clicks "+ 산호 추가" → modal with 14 category tags → selects 3 → generates corals with simulated data
- Selection order determines weight: 1st = 50%, 2nd = 30%, 3rd = 20%

**Tutorial**
- "?" button (bottom-right) opens a 5-step guide explaining how to export YouTube data from Google Takeout
- Includes direct link to takeout.google.com
- Privacy notice: data processed in-browser only

### Data → Visual Mapping (7 dimensions)

Each coral clone is visually unique based on its data. All mappings use standard Three.js APIs, no custom shaders.

| Data Dimension | Visual Parameter | Three.js API | Perceptual Meaning |
|---|---|---|---|
| Category | Hue (color) | `material.emissive.set(color)` | Different interests = different colors |
| Watch count (weight) | Y-axis stretch (height) | `group.scale.y` | Watched more = taller coral |
| Channel diversity | XZ scale (girth) | `group.scale.x/z` | Broader interests = wider coral |
| Recency (days since last watch) | Emissive intensity | `material.emissiveIntensity` | Recent = glowing; dormant = dim |
| Frequency trend | Spin speed | `group.rotation.y += speed * dt` | Growing interest = faster spin |
| Activity level | Breathing frequency | `sin(t * freq)` scale oscillation | Active = rapid pulse |
| Weight + noise seed | Vertex displacement | `simplex-noise` on `geometry.attributes.position` | Each coral's silhouette is subtly different |

**Vertex displacement** is applied once at clone time using simplex noise. Amplitude scales with watch count — heavier categories produce more distorted, organic shapes.

### Visual Atmosphere

- Pure black background (#000000)
- UnrealBloomPass post-processing (strength 0.65, radius 0.65, threshold 0.42)
- Exponential fog (density 0.04)
- Vignette overlay (CSS radial-gradient)
- 3000 ambient flow particles (additive blending, drifting)
- 800 marine snow particles (falling with horizontal sway)
- 3 light shaft planes (god rays, swaying and pulsing)

### Interaction

- **OrbitControls**: drag to rotate, scroll to zoom
- **Click coral → camera fly-in**: smooth easeInOut tween, detail panel appears showing category name, weight %, watch count, channel diversity, recency level
- **Click empty → return to overview**: camera flies back
- **Other corals fade**: unfocused corals scale down to 70% and fade to 12% opacity
- **Delete coral**: "산호 삭제" button in detail panel → coral shrinks to zero and disappears, connection lines rebuild
- **CSS2D labels**: category name above each coral, fades by distance
- **Growth animation**: each coral grows from zero with easeOutBack on spawn
- **Auto-placement**: spiral algorithm with collision avoidance, new corals never overlap

### Connection Lines

- Quadratic Bezier curves linking each coral to its 2 nearest neighbors
- Additive blending, breathing opacity animation
- Rebuild dynamically when corals are added or removed
- Appear only after all current corals finish growing

### Tech Stack

- Vite (vanilla JS, no framework)
- Three.js r184 (WebGLRenderer, EffectComposer, UnrealBloomPass, OutputPass, CSS2DRenderer)
- THREE.Timer
- simplex-noise (vertex displacement)
- Single file: `src/main.js`

### Model

- `coral.glb` (Tripo AI generated, 17 MB, glTF 2.0, uncompressed)
- 1 mesh, 1 PBR material (basecolor + roughness/metallic + normal)
- Cloned per coral with independent material properties and vertex displacement

### Deployment

- Vercel static site: **sn-rouge.vercel.app**
- Auto-deploys on every `git push` to main
- No server needed; all processing runs in-browser

---

## Planned Features (Achievable)

### Data Pipeline Enhancement (3-layer classification)

Current: keyword matching only (Layer 2). To improve accuracy:

**Layer 1 — YouTube Data API v3 + lookup table (covers ~80%, zero AI cost)**
- Backend calls YouTube API with user's video IDs (extracted from Takeout URLs)
- Each video carries a `categoryId` (Gaming=20, Music=10, Education=27…)
- Static lookup table maps categoryId → Coralithm topic
- Requires a lightweight backend for OAuth / API key management

**Layer 2 — Keyword matching (current implementation, covers ~10-15%)**
- Already implemented for titles without API
- 14 categories × 6-10 keywords each (Korean + English)

**Layer 3 — LLM smart analysis (remaining ~5-10% + emotion)**
- Ambiguous titles → batch to Claude/GPT for semantic classification
- Emotion inference per category (e.g., user's Gaming content skews "Thrill" vs "Healing")
- Batched: one API call per user, not per video

### Visual Upgrades

- **Multiple coral models**: different geometry per category (branching / brain / plate / staghorn) — requires additional models from modeling software or AI 3D tools (Meshy / Rodin)
- **Growth morphing**: Shape Keys / Morph Targets for branch-extension animation — requires modeling in 3D software, exported to glb
- **Per-coral particle halo**: small particle cloud orbiting each coral, tinted to category color
- **Selective bloom**: only emissive elements glow (layer-based bloom), non-glowing surfaces stay crisp

### Interaction Upgrades

- **Hover highlight**: coral brightens + label enlarges before click
- **Sub-category drill-down**: click into a coral to see sub-topics (e.g., Lifestyle → Cooking / Fashion / Fitness)
- **Share / export**: screenshot button to save reef as PNG
