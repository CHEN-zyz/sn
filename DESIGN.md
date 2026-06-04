# Coralithm — Design Document

## Concept

Social media data visualized as a living coral reef.
Each coral cluster represents a topic category; size, color, and emotion are driven by user data.
The reef grows in real-time, forming a unique "digital identity portrait" per user.

---

## Current Implementation (Prototype)

### Core

- **7 coral clusters** arranged as a dense reef, each colored by topic category
- **Data-driven sizing**: cluster scale is proportional to its `weight` value
- **Mock data**: topic / emotion / weight defined in a JSON array at the top of `main.js`, easily replaceable by API response
- **Growth animation**: on page load, clusters grow from zero in staggered sequence (easeOutBack), connection lines fade in after all clusters finish

### Visual

- **Bioluminescent atmosphere**: pure black background, bloom post-processing, exponential fog, vignette overlay
- **Marine snow**: 800 particles drifting downward with slight horizontal sway
- **Light shafts**: 3 semi-transparent planes simulating god rays from above, slowly swaying and pulsing
- **Emissive breathing**: each cluster's glow intensity pulses softly over time
- **Floating particles**: 3000 ambient flow particles drifting around the reef (additive blending)

### Interaction

- **OrbitControls**: drag to rotate, scroll to zoom
- **Click cluster → camera fly-in**: smooth easeInOut tween to focus on the clicked cluster; detail panel appears (topic, emotion, share %)
- **Click empty → return**: camera flies back to overview
- **CSS2D labels**: topic name floats above each cluster, fades by distance, dims when another cluster is focused

### Connection Lines

- Curved (quadratic Bezier) lines linking each cluster to its 2 nearest neighbors
- Additive blending, low opacity, breathing animation
- Appear only after growth animation completes

### Tech Stack

- Vite (vanilla JS, no framework)
- Three.js r184 (WebGLRenderer, EffectComposer, UnrealBloomPass, OutputPass, CSS2DRenderer)
- THREE.Timer (replaces deprecated Clock)
- Single file: `src/main.js` (~420 lines)

### Model

- `coral.glb` (Tripo AI generated, 17 MB, glTF 2.0, uncompressed)
- 1 mesh, 1 PBR material (basecolor + roughness/metallic + normal), 1 animation (unused)
- Cloned per cluster with unique emissive color overlay

---

## Planned Features (Achievable)

### Data Pipeline (3-layer classification)

**Layer 1 — YouTube API + lookup table (covers ~80%, zero AI cost)**
- User pastes YouTube channel URL → backend calls YouTube Data API v3 (free tier)
- Fetches subscriptions / watch history; each video/channel already carries a YouTube `categoryId` (Gaming=20, Music=10, Education=27…)
- A static lookup table maps YouTube categoryId → Coralithm topic cluster
- Weight is computed from subscription count / watch time per cluster

**Layer 2 — Keyword / rule fallback (covers ~10%)**
- Videos categorized as generic "Entertainment" or "People & Blogs" go through keyword matching on title + description
- Rules: e.g., title contains "recipe" / "cooking" → Lifestyle; "tutorial" / "how to code" → Tech
- Deterministic, fast, no API cost

**Layer 3 — LLM smart analysis (covers remaining ~10% + emotion)**
- Ambiguous content that passes through Layer 1 & 2 unresolved → send title + description batch to LLM (Claude / GPT) for topic classification
- **Emotion inference** (LLM's primary value): analyze a user's content consumption pattern to determine emotional tendency per topic (e.g., their Gaming content skews "Thrill" vs "Healing") — this is something keywords cannot do
- Batched to minimize API calls (one call per user, not per video)

**Output**: `[{topic, emotion, weight}, ...]` → feeds directly into the frontend `CLUSTERS` array

### Visual Upgrades

- **Multiple coral models**: different geometry per topic (branching / brain / plate / staghorn) instead of cloning the same glb 7 times — requires sourcing or generating additional models
- **Per-cluster particle halos**: small particle cloud tinted to cluster color, orbiting each cluster individually
- **Selective bloom**: only emissive elements glow (using layers + separate bloom pass), keeps non-glowing surfaces crisp

### Interaction Upgrades

- **Hover highlight**: cluster brightens + label enlarges on mouse hover (before click)
- **Detail panel expansion**: show top 3 subscribed channels / most watched content under each topic
- **Share / export**: screenshot button (renderer.domElement.toDataURL) to save reef as PNG

### Deployment

- Static site on Vercel (no server needed)
- `npm run build` → `dist/` served as-is
- glb served from `public/models/` (included in build output)
