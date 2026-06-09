# Coralithm Design

## Current Product

Coralithm is an interactive 3D web experience that turns selected interests into algorithm corals. A user chooses three interest categories, generates a coral, adjusts the category weights, edits the coral tags, and opens a feed of recommended content connected to that coral.

The current default web flow is:

1. Intro screen
2. Interest selection screen
3. Coral generation/detail screen
4. Coral feed panel
5. Add coral flow
6. Coral overview screen

## Intro Screen

The intro screen uses a dark underwater 3D background with floating coral objects. The title is rendered as web text, not as a pasted image.

Visible elements:

- `Start your exploration with`
- `CORALITHM`
- `당신의 취향을 선택하고 '알고리즘 산호'를 만들어보세요.`
- `그 구조를 기반으로 다양한 콘텐츠를 추천해드릴게요.`
- `시작하기`

Clicking `시작하기` opens the interest selection screen.

## Interest Selection Screen

The selection screen asks the user to choose exactly three categories.

Visible text:

- `어떤 산호를 성장시킬까요?`
- `관심있는 주제 3가지를 선택해주세요.`
- `선택한 주제를 기반으로 산호가 성장합니다.`
- `산호 생성하기`

The current category set contains 14 categories:

- 뉴스·시사
- 경제·시장·투자
- 요리
- 게임
- 스포츠
- 소프트웨어·데이터·AI
- 환경·기후
- 광고·마케팅
- 음악
- 디자인·예술
- 여행
- 영감·인사이트
- 학습
- 스타일

The generation button is disabled until three categories are selected. The selected order becomes the initial weight order: 50%, 30%, and 20%.

## Coral Generation And Detail Screen

After generation, the center of the screen shows the 3D coral. The left panel shows the coral title, tag editor, weight sliders, and delete button.

Visible controls:

- `← 전체 산호`
- coral title, such as `요리 · 소프트웨어·데이터·AI · 스타일 산호`
- `태그 변경`
- three category selectors
- three weight sliders
- `산호 삭제`
- `+ 산호 추가`
- `피드 보기`

The coral title is built from the three active category tags. The same title is also shown in the top header on the coral detail screen.

## Tag Editing

The `태그 변경` area lets the user change the three category tags attached to the current coral.

Current behavior:

- Each tag slot uses a category dropdown.
- A category already used in another slot is disabled in the dropdown.
- Changing a tag immediately updates the coral title.
- Changing a tag immediately updates the weight labels.
- Changing a tag immediately updates the feed content.
- Changing a tag immediately updates the coral's category-based visual mapping.

## Weight Editing

The three sliders control the category ratio of the current coral.

Current behavior:

- The three values always sum to 100%.
- Values do not become negative.
- Values do not exceed the allowed slider range.
- Moving a slider redistributes the remaining percentage across the other two categories.
- The coral visual and feed update after each weight change.

## Coral Delete

The `산호 삭제` button removes the current coral. After deletion, the interface returns to the coral overview screen.

## Coral Feed Panel

Clicking `피드 보기` opens the feed panel on the right side of the screen.

Visible feed elements:

- `산호 피드`
- category-weight summary
- six content cards
- top-right `×` close button

Each content card has:

- source/platform name
- category label
- content title
- image preview
- concrete content URL

YouTube cards use the corresponding video thumbnail. Webpage cards use a preview image generated from the corresponding page URL. Clicking a card opens that specific content page in a new tab.

The feed cards are selected from the three active coral categories. Higher-weight categories receive more cards.

## Coral Overview Screen

The overview screen shows the user's generated coral reef.

Visible elements:

- `나의 알고리즘 산호초`
- `산호를 선택하면 취향의 구조와 추천 콘텐츠를 볼 수 있어요.`
- generated corals
- coral labels
- coral count
- `+ 산호 추가`

Clicking a coral opens its detail screen. Clicking `+ 산호 추가` reuses the interest selection screen and adds another coral to the reef.

## 3D Scene

The current scene includes:

- black underwater background
- bloom
- fog
- vignette
- drifting particles
- marine-snow particles
- light shafts
- orbit camera controls
- automatic coral placement
- coral growth animation
- coral labels in overview
- connection lines between nearby corals

The project currently loads seven coral models. The primary category chooses the coral color and base model. The category ratio affects size, opacity, roughness, glow, and shape variation.

## Current Data Mapping

| Input | Current effect |
|---|---|
| Three selected categories | coral tags, title, feed categories |
| Category order | initial 50%, 30%, 20% weights |
| Primary category | color and base model |
| Weight sliders | category ratio, coral appearance, feed distribution |
| Tag editor | category labels, title, feed, visual mapping |
| Delete button | removes the selected coral |

## Current Feed Data

The feed uses a curated content library. Each category has concrete content items. A card is not a search entry; it links to a specific page or video.
