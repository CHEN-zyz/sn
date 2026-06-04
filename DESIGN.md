# Coralithm — Design Document

## Concept

YouTube watch history visualized as a coral reef.
Users upload their Google Takeout data, the system classifies their viewing into topic categories and grows a coral for each one. Size, color, glow, and motion reflect how much, how recently, and how diversely the user watches that category.

---

## Current Implementation

### Data Input

**Google Takeout upload**
- User selects their `watch-history.json` (exported from Google Takeout)
- Parsed entirely in the browser. Nothing is sent to any server.
- Extracts video titles, channel names, and timestamps
- Classifies each video into 14 topic categories via keyword matching (Korean / English)
- Per category: watch count, channel diversity, recency, trend

**Manual selection (for demo)**
- User picks 3 categories from a modal, corals are generated with simulated data
- Weight by selection order: 1st = 50%, 2nd = 30%, 3rd = 20%

**Tutorial**
- "?" button opens a step-by-step guide on how to export from Google Takeout
- Links to takeout.google.com directly

### Data → Visual Mapping

Each coral is a clone of the same base model, but 7 data dimensions make them look different:

| Data | Maps to | Why |
|---|---|---|
| Category | Color | Immediate visual grouping |
| Watch count | Height (Y scale) | More = taller |
| Channel diversity | Width (XZ scale) | Broader = wider |
| Recency | Emissive glow | Recent = bright, old = dim |
| Frequency trend | Spin speed | Rising interest = spins faster |
| Activity | Breathing rate | Active = faster pulse |
| Weight × noise | Vertex displacement (simplex noise) | Breaks the "copy-paste" silhouette |

Vertex displacement runs once when the coral is created. Heavier categories get more distortion.

### Atmosphere

- Black background, bloom, exponential fog, vignette
- 3000 drifting particles, 800 falling marine snow, 3 light shafts

### Interaction

- Drag/scroll to orbit and zoom
- Click a coral: camera flies in, detail panel shows stats, other corals fade out
- Click empty space: camera returns, everything restores
- Delete button in the detail panel removes the coral, connections rebuild
- Labels float above each coral, fade with distance
- New corals grow from zero (easeOutBack), auto-placed on a spiral grid to avoid overlap

### Connection Lines

- Bezier curves between each coral and its 2 nearest neighbors
- Fade in after growth finishes, rebuild on add/remove

### Tech

- Vite, vanilla JS, single file (`src/main.js`)
- Three.js r184, CSS2DRenderer, UnrealBloomPass, simplex-noise
- Model: `coral.glb` (Tripo, 17 MB, standard PBR)
- Deployed on Vercel: **sn-rouge.vercel.app**, auto-deploys on push

---

## Next Steps

### Better classification

Currently keyword-only. Can be improved in layers:

1. **YouTube API**: fetch `categoryId` per video using IDs from the Takeout URLs. Covers most videos. Needs a small backend for API keys.
2. **Keyword fallback**: already done, catches titles the API misses.
3. **LLM batch**: for ambiguous titles + emotion tagging per category. One API call per user.

### More visual variety

- Different coral models per category (needs additional glb files from 3D tools or AI generation)
- Shape Keys for branch-growth animation (needs modeling work)
- Per-coral particle halos
- Layer-based selective bloom

### More interaction

- Hover preview before clicking
- Sub-category breakdown inside a coral
- Screenshot export
