# Coralithm — Design Document

## Concept

Coralithm turns a person's interests into a 3D reef that can keep growing.

Users can either upload their YouTube watch history or answer a short set of questions. Both paths produce a mix of interest categories, which then shapes each coral's color, form, glow, and movement. Completing the quiz adds another coral instead of replacing the existing reef.

---

## Current Implementation

### Two Input Modes

**YouTube data upload**

- Reads `watch-history.json` exported from Google Takeout
- Parses the file entirely in the browser; viewing history is not sent to a server
- Extracts video titles, channel names, and timestamps
- Uses Korean and English keyword matching to sort entries into 14 topics
- Calculates watch count, channel count, recency, and trend for each topic
- Generates corals for the 10 most-watched topics
- Replaces the current reef when a new history file is uploaded

**Random question mode**

- Contains a pool of 14 questions and draws 3 without repetition for each run
- Every question has 4 answers, each linked to an interest category
- Concrete, behavior-based questions carry more weight than abstract preference questions
- Repeated hits on the same category accumulate
- The final score distribution becomes one mixed-interest coral
- The quiz can be repeated to add more corals without clearing the reef
- Names are assembled from the matched categories, such as "게임·음악 산호" ("Game·Music Coral")

A manual demo entry point is still available. It asks the user to choose 3 categories and assigns fixed weights of 50%, 30%, and 20% in selection order.

### Categories

The current set contains 14 topics:

News & Current Affairs, Finance & Investment, Cooking, Gaming, Sports, Software & AI, Environment & Climate, Advertising & Marketing, Music, Design & Art, Travel, Inspiration & Insight, Learning, and Style.

YouTube entries that match no category fall back to "Other."

### Data and Visuals

The project loads 7 coral models and assigns them by primary category in a repeating cycle. Since there are more categories than models, some categories share the same base shape.

| Data | Visual treatment |
|---|---|
| Primary category | Coral color and base model |
| Category share | Height, opacity, and vertex displacement |
| Channel diversity | Width and material roughness |
| Recency | Emissive glow and breathing speed |
| Trend | Spin speed |
| Multiple matched categories | Ratio list in the detail panel and a combined name |

Simplex noise is applied once when a coral is created to vary its silhouette. New corals grow from nearly zero with a spring-like animation and are placed automatically to avoid overlap.

### Simulated Metrics in Question Mode

Quiz answers can support an interest mix, but they cannot reveal actual watch count, channel diversity, or recent viewing activity.

The current implementation generates placeholder values to drive the existing visual system:

- Watch count is derived from the largest category share
- Channel diversity is estimated from the number of matched categories
- Recency is derived from the largest category share
- Trend uses a fixed value

The detail panel does not yet distinguish these estimates from statistics calculated from YouTube history. This can make both modes look equally factual. A production version should either hide those fields in question mode, label them as estimates, or replace them with measures that the questionnaire can reasonably support.

### Scene and Interaction

- Black underwater scene with bloom, exponential fog, and a vignette
- 3,000 drifting particles, 800 marine-snow particles, and 3 light shafts
- Drag to orbit and scroll to zoom
- Hovering a coral emphasizes its label
- Clicking a coral moves the camera closer, fades the others, and opens a detail panel
- Clicking empty space returns to the overview
- Individual corals can be deleted
- Each coral connects to its 2 nearest neighbors; connections rebuild after additions or removals
- The current view can be exported as a PNG
- A "?" button explains how to export data from Google Takeout

---

## Known Limitations

### YouTube classification is still broad

Classification currently relies on title keywords. Ambiguous titles, missing keywords, and cross-topic videos can be assigned incorrectly, while "Other" may collect a large share of unrecognized entries.

### The trend metric needs a new definition

Trend exists in the data model and controls spin speed, but the current calculation does not meaningfully describe how an interest changes over time. It needs explicit time windows and a better comparison method.

### The two modes represent different kinds of data

YouTube mode describes observed viewing behavior. Question mode describes self-reported and momentary preferences. They can share the same coral language, but the detail panel should not present both as the same kind of measurement.

### Models are not unique to categories

Fourteen categories currently share 7 models. Color does most of the category differentiation; there is not yet a distinct shape system for every topic.

---

## Next Directions

### Clarify what the data means

- Mark observed statistics and questionnaire estimates clearly
- Give question mode measures it can support, such as interest strength or preference concentration
- Develop coral names beyond direct category combinations
- Redesign the trend calculation

### Improve classification

1. Extract video IDs from Takeout URLs and retrieve `categoryId` through the YouTube API
2. Keep keyword matching as a fallback
3. Use batch semantic classification for ambiguous titles

### Expand visual variety

- Add models so major categories have more recognizable silhouettes
- Use Shape Keys or a rig for branch growth
- Give individual corals their own particles and local glow
- Add a clearer view of category composition and data provenance
