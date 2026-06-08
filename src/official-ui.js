const PHOTO = {
  news: [
    'photo-1495020689067-958852a7765e',
    'photo-1504711434969-e33886168f5c',
    'photo-1585829365295-ab7cd400c167',
    'photo-1529107386315-e1a2ed48a620',
  ],
  finance: [
    'photo-1611974789855-9c2a0a7236a3',
    'photo-1579532537598-459ecdaf39cc',
    'photo-1590283603385-17ffb3a7f29f',
    'photo-1559526324-4b87b5e36e44',
  ],
  cooking: [
    'photo-1556911220-bff31c812dba',
    'photo-1476224203421-9ac39bcb3327',
    'photo-1504674900247-0877df9cc836',
    'photo-1547592180-85f173990554',
  ],
  gaming: [
    'photo-1542751371-adc38448a05e',
    'photo-1511512578047-dfb367046420',
    'photo-1493711662062-fa541adb3fc8',
    'photo-1606144042614-b2417e99c4e3',
  ],
  sports: [
    'photo-1461896836934-ffe607ba8211',
    'photo-1540747913346-19e32dc3e97e',
    'photo-1571019613454-1cb2f99b2d8b',
    'photo-1579952363873-27f3bade9f55',
  ],
  software: [
    'photo-1555066931-4365d14bab8c',
    'photo-1515879218367-8466d910aaa4',
    'photo-1488590528505-98d2b5aba04b',
    'photo-1535378917042-10a22c95931a',
  ],
  climate: [
    'photo-1469474968028-56623f02e42e',
    'photo-1531058020387-3be344556be6',
    'photo-1500534314209-a25ddb2bd429',
    'photo-1534269222346-5a896154c41d',
  ],
  marketing: [
    'photo-1460925895917-afdab827c52f',
    'photo-1552664730-d307ca884978',
    'photo-1533750516457-a7f992034fec',
    'photo-1521737711867-e3b97375f902',
  ],
  music: [
    'photo-1493225457124-a3eb161ffa5f',
    'photo-1511379938547-c1f69419868d',
    'photo-1524368535928-5b5e00ddc76b',
    'photo-1516280440614-37939bbacd81',
  ],
  design: [
    'photo-1561070791-2526d30994b5',
    'photo-1545235617-9465d2a55698',
    'photo-1549490349-8643362247b5',
    'photo-1558655146-d09347e92766',
  ],
  travel: [
    'photo-1488646953014-85cb44e25828',
    'photo-1501785888041-af3ef285b470',
    'photo-1507525428034-b723cf961d3e',
    'photo-1469854523086-cc02fe5d8800',
  ],
  insight: [
    'photo-1500530855697-b586d89ba3ee',
    'photo-1499209974431-9dddcece7f88',
    'photo-1516321318423-f06f85e504b3',
    'photo-1531988042231-d39a9cc12a9a',
  ],
  learning: [
    'photo-1523240795612-9a054b0db644',
    'photo-1509062522246-3755977927d7',
    'photo-1523050854058-8df90110c9f1',
    'photo-1434030216411-0b793f4b4173',
  ],
  style: [
    'photo-1445205170230-053b83016050',
    'photo-1529139574466-a303027c1d8b',
    'photo-1483985988355-763728e1935b',
    'photo-1539109136881-3be0616acf4b',
  ],
}

function image(photo, index = 0) {
  const id = PHOTO[photo][index % PHOTO[photo].length]
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=720&h=460&q=82`
}

const query = (url, value) => `${url}${encodeURIComponent(value)}`
const youtube = (value) => query('https://www.youtube.com/results?search_query=', value)
const naver = (value) => query('https://search.naver.com/search.naver?query=', value)
const spotify = (value) => query('https://open.spotify.com/search/', value)

const CONTENT_LIBRARY = {
  '뉴스·시사': [
    { source: '네이버 뉴스', title: '오늘의 주요 이슈 한눈에 보기', url: naver('오늘 주요 뉴스'), image: image('news', 0) },
    { source: '유튜브', title: '하루를 정리하는 저녁 뉴스 브리핑', url: youtube('오늘 뉴스 브리핑'), image: image('news', 1) },
    { source: 'Google News', title: '관심 주제별 최신 기사 모아보기', url: 'https://news.google.com/home?hl=ko&gl=KR&ceid=KR:ko', image: image('news', 2) },
    { source: 'BBC Korea', title: '세계의 변화를 설명하는 이야기', url: 'https://www.bbc.com/korean', image: image('news', 3) },
  ],
  '경제·투자': [
    { source: '네이버 금융', title: '오늘의 시장 흐름과 주요 지표', url: 'https://finance.naver.com/', image: image('finance', 0) },
    { source: '유튜브', title: '처음부터 배우는 경제와 투자', url: youtube('경제 투자 입문'), image: image('finance', 1) },
    { source: 'TradingView', title: '차트로 읽는 글로벌 시장', url: 'https://kr.tradingview.com/markets/', image: image('finance', 2) },
    { source: 'KDI', title: '데이터로 보는 한국 경제', url: 'https://eiec.kdi.re.kr/', image: image('finance', 3) },
  ],
  '요리': [
    { source: '만개의레시피', title: '지금 만들기 좋은 한 끼 레시피', url: 'https://www.10000recipe.com/', image: image('cooking', 0) },
    { source: '네이버 블로그', title: '재료가 단순한 집밥 아이디어', url: naver('간단 집밥 레시피 블로그'), image: image('cooking', 1) },
    { source: '유튜브', title: '10분 안에 완성하는 초간단 요리', url: youtube('10분 초간단 요리'), image: image('cooking', 2) },
    { source: 'Pinterest', title: '플레이팅과 디저트 영감 모음', url: 'https://www.pinterest.com/search/pins/?q=food%20plating', image: image('cooking', 3) },
  ],
  '게임': [
    { source: '유튜브', title: '지금 주목받는 게임 플레이', url: youtube('인기 게임 플레이 한국'), image: image('gaming', 0) },
    { source: 'Steam', title: '새롭게 발견하는 인디 게임', url: 'https://store.steampowered.com/tags/ko/%EC%9D%B8%EB%94%94/', image: image('gaming', 1) },
    { source: '인벤', title: '업데이트와 신작 소식 모아보기', url: 'https://www.inven.co.kr/', image: image('gaming', 2) },
    { source: 'Twitch', title: '지금 라이브 중인 게임 채널', url: 'https://www.twitch.tv/directory/category/games', image: image('gaming', 3) },
  ],
  '스포츠': [
    { source: '네이버 스포츠', title: '오늘의 경기와 하이라이트', url: 'https://sports.naver.com/', image: image('sports', 0) },
    { source: '유튜브', title: '놓치기 아까운 경기 명장면', url: youtube('스포츠 하이라이트 오늘'), image: image('sports', 1) },
    { source: 'Olympics', title: '종목별 선수와 올림픽 이야기', url: 'https://www.olympics.com/ko/', image: image('sports', 2) },
    { source: 'Strava', title: '달리고 기록하는 사람들의 활동', url: 'https://www.strava.com/', image: image('sports', 3) },
  ],
  '소프트웨어·AI': [
    { source: 'GitHub', title: '오늘 탐색할 오픈소스 프로젝트', url: 'https://github.com/explore', image: image('software', 0) },
    { source: '유튜브', title: 'AI와 데이터 기술 쉽게 이해하기', url: youtube('AI 데이터 기술 입문'), image: image('software', 1) },
    { source: 'Hugging Face', title: '직접 체험하는 새로운 AI 모델', url: 'https://huggingface.co/spaces', image: image('software', 2) },
    { source: 'Kaggle', title: '데이터셋에서 시작하는 작은 실험', url: 'https://www.kaggle.com/datasets', image: image('software', 3) },
  ],
  '환경·기후': [
    { source: 'TED', title: '기후를 다르게 바라보는 아이디어', url: 'https://www.ted.com/topics/climate', image: image('climate', 0) },
    { source: '유튜브', title: '일상에서 시작하는 환경 실천', url: youtube('환경 실천 제로웨이스트'), image: image('climate', 1) },
    { source: 'UNEP', title: '지구에서 지금 일어나고 있는 변화', url: 'https://www.unep.org/news-and-stories', image: image('climate', 2) },
    { source: '네이버', title: '지속가능한 생활을 위한 아이디어', url: naver('지속가능한 생활 환경'), image: image('climate', 3) },
  ],
  '광고·마케팅': [
    { source: 'Think with Google', title: '사람을 움직인 캠페인 인사이트', url: 'https://www.thinkwithgoogle.com/intl/ko-kr/', image: image('marketing', 0) },
    { source: '유튜브', title: '브랜드가 기억에 남는 이유', url: youtube('브랜드 마케팅 사례'), image: image('marketing', 1) },
    { source: 'Behance', title: '새로운 브랜딩 프로젝트 탐색', url: 'https://www.behance.net/search/projects/branding', image: image('marketing', 2) },
    { source: '네이버 블로그', title: '요즘 콘텐츠 마케팅 사례', url: naver('콘텐츠 마케팅 사례 블로그'), image: image('marketing', 3) },
  ],
  '음악': [
    { source: 'Spotify', title: '취향을 넓혀줄 새로운 플레이리스트', url: spotify('새로운 음악'), image: image('music', 0) },
    { source: 'YouTube Music', title: '라이브로 다시 듣는 오늘의 음악', url: youtube('라이브 음악 세션'), image: image('music', 1) },
    { source: 'SoundCloud', title: '아직 알려지지 않은 사운드 발견', url: 'https://soundcloud.com/discover', image: image('music', 2) },
    { source: 'NPR Music', title: '가까이서 만나는 Tiny Desk 공연', url: 'https://www.npr.org/series/tiny-desk-concerts/', image: image('music', 3) },
  ],
  '디자인·예술': [
    { source: 'Behance', title: '오늘의 큐레이션 디자인 프로젝트', url: 'https://www.behance.net/galleries', image: image('design', 0) },
    { source: 'Awwwards', title: '인터랙션이 돋보이는 웹사이트', url: 'https://www.awwwards.com/websites/', image: image('design', 1) },
    { source: 'Google Arts', title: '온라인으로 만나는 예술 컬렉션', url: 'https://artsandculture.google.com/', image: image('design', 2) },
    { source: 'Pinterest', title: '색과 형태를 위한 무드보드', url: 'https://www.pinterest.com/search/pins/?q=graphic%20design%20inspiration', image: image('design', 3) },
  ],
  '여행': [
    { source: '대한민국 구석구석', title: '이번 주말에 떠날 국내 여행지', url: 'https://korean.visitkorea.or.kr/', image: image('travel', 0) },
    { source: '유튜브', title: '낯선 도시를 걷는 여행 브이로그', url: youtube('감성 여행 브이로그'), image: image('travel', 1) },
    { source: '네이버', title: '계절에 어울리는 여행 코스', url: naver('계절 여행 코스'), image: image('travel', 2) },
    { source: 'Airbnb', title: '머물고 싶은 공간에서 여행 시작하기', url: 'https://www.airbnb.co.kr/', image: image('travel', 3) },
  ],
  '영감·인사이트': [
    { source: 'TED', title: '생각의 방향을 바꾸는 짧은 강연', url: 'https://www.ted.com/talks', image: image('insight', 0) },
    { source: '유튜브', title: '창작자의 작업과 생각 들여다보기', url: youtube('크리에이터 인터뷰 영감'), image: image('insight', 1) },
    { source: 'Medium', title: '천천히 읽어볼 새로운 관점', url: 'https://medium.com/tag/creativity', image: image('insight', 2) },
    { source: '네이버', title: '오늘 기록해두고 싶은 문장과 생각', url: naver('영감 인사이트 에세이'), image: image('insight', 3) },
  ],
  '학습': [
    { source: 'K-MOOC', title: '관심 분야를 넓히는 공개 강의', url: 'https://www.kmooc.kr/', image: image('learning', 0) },
    { source: 'Khan Academy', title: '기초부터 다시 배우는 핵심 개념', url: 'https://ko.khanacademy.org/', image: image('learning', 1) },
    { source: '유튜브', title: '오늘 20분 동안 배울 새로운 기술', url: youtube('20분 강의 새로운 기술'), image: image('learning', 2) },
    { source: 'Coursera', title: '세계 대학의 온라인 수업 탐색', url: 'https://www.coursera.org/', image: image('learning', 3) },
  ],
  '스타일': [
    { source: '무신사', title: '지금 참고하기 좋은 스타일 스냅', url: 'https://www.musinsa.com/snap/main', image: image('style', 0) },
    { source: 'Vogue Korea', title: '패션과 뷰티의 새로운 흐름', url: 'https://www.vogue.co.kr/', image: image('style', 1) },
    { source: '유튜브', title: '나에게 맞는 데일리 스타일링', url: youtube('데일리 스타일링 팁'), image: image('style', 2) },
    { source: 'Pinterest', title: '옷장에 더할 컬러와 실루엣', url: 'https://www.pinterest.com/search/pins/?q=korean%20fashion', image: image('style', 3) },
  ],
}

function distributeCards(weights, count = 6) {
  const total = weights.reduce((sum, value) => sum + value, 0) || 1
  const exact = weights.map((value) => (value / total) * count)
  const result = exact.map(Math.floor)
  let remaining = count - result.reduce((sum, value) => sum + value, 0)
  const order = exact
    .map((value, index) => ({ index, fraction: value - result[index] }))
    .sort((a, b) => b.fraction - a.fraction)
  for (let i = 0; i < remaining; i++) result[order[i % order.length].index]++

  result.forEach((value, index) => {
    if (value > 0) return
    const donor = result.indexOf(Math.max(...result))
    if (result[donor] > 1) {
      result[donor]--
      result[index]++
    }
  })
  return result
}

function profileFromCoral(coral) {
  if (coral.officialProfile) return coral.officialProfile
  const subcats = coral.data.subcats?.slice(0, 3) || [{ cat: coral.data.cat, weight: 1 }]
  const total = subcats.reduce((sum, item) => sum + item.weight, 0) || 1
  coral.officialProfile = {
    cats: subcats.map((item) => item.cat),
    weights: subcats.map((item) => Math.round((item.weight / total) * 100)),
    feedOffset: Math.floor(Math.random() * 4),
  }
  return coral.officialProfile
}

function coralName(profile, labelFor) {
  return profile.cats
    .map((cat) => labelFor(cat))
    .slice(0, 3)
    .join(' · ') + ' 산호'
}

function feedFor(profile, labelFor) {
  const counts = distributeCards(profile.weights)
  const cards = []
  profile.cats.forEach((cat, catIndex) => {
    const library = CONTENT_LIBRARY[cat.name] || []
    for (let i = 0; i < counts[catIndex]; i++) {
      if (!library.length) continue
      const item = library[(profile.feedOffset + i + catIndex) % library.length]
      cards.push({ ...item, category: labelFor(cat), weight: profile.weights[catIndex] })
    }
  })
  return cards.sort((a, b) => b.weight - a.weight || a.title.localeCompare(b.title, 'ko')).slice(0, 6)
}

export function createOfficialUI(api) {
  const labelFor = (cat) => api.categories.find((item) => item.cat === cat)?.label || cat.name
  let view = 'intro'
  let selected = []
  let activeCoral = null
  let addMode = false
  let modelsReady = api.modelsReady()

  const root = document.createElement('div')
  root.id = 'official-ui'
  root.innerHTML = `
    <header class="product-header" aria-label="CORALITHM">
      <button class="brand-button" type="button" aria-label="산호 전체 보기">
        <span>Start your exploration with</span>
        <strong>CORALITHM</strong>
      </button>
      <p class="header-context"></p>
    </header>

    <main>
      <section class="product-screen intro-screen is-active" data-screen="intro">
        <div class="intro-copy">
          <p class="intro-kicker">Start your exploration with</p>
          <h1>Coralithm</h1>
          <p class="intro-description">
            <span>당신의 취향을 선택하고 '알고리즘 산호'를 만들어보세요.</span>
            <span>그 구조를 기반으로 다양한 콘텐츠를 추천해드릴게요.</span>
          </p>
          <button class="primary-action intro-start" type="button">시작하기</button>
        </div>
        <span class="intro-hint">취향이 머무는 곳에서 산호가 자라납니다</span>
      </section>

      <section class="product-screen select-screen" data-screen="select">
        <div class="selection-card">
          <span class="eyebrow">GROW A NEW CORAL</span>
          <h1>어떤 산호를 성장시킬까요?</h1>
          <p>관심있는 주제 3가지를 선택해주세요.<br>선택한 주제를 기반으로 산호가 성장합니다.</p>
          <div class="official-category-grid" role="group" aria-label="관심 주제"></div>
          <div class="selection-footer">
            <button class="text-action selection-cancel" type="button">돌아가기</button>
            <span class="selection-count">0 / 3</span>
            <button class="primary-action create-coral" type="button" disabled>산호 생성하기</button>
          </div>
        </div>
      </section>

      <section class="product-screen overview-screen" data-screen="overview">
        <div class="overview-copy">
          <span class="eyebrow">MY CORAL REEF</span>
          <h1>나의 알고리즘 산호초</h1>
          <p>산호를 선택하면 취향의 구조와 추천 콘텐츠를 볼 수 있어요.</p>
        </div>
        <div class="overview-actions">
          <span class="coral-count"></span>
          <button class="glass-action add-coral" type="button">+ 산호 추가</button>
        </div>
      </section>

      <section class="product-screen coral-screen" data-screen="coral">
        <aside class="weight-panel glass-panel">
          <button class="back-button" type="button">← 전체 산호</button>
          <span class="eyebrow">ALGORITHM CORAL</span>
          <h1 class="coral-name"></h1>
          <p class="weight-instruction"></p>
          <div class="weight-controls"></div>
          <p class="weight-note">비중을 움직이면 산호의 빛과 추천 피드가 함께 달라집니다.</p>
        </aside>
        <div class="coral-actions">
          <button class="glass-action add-coral" type="button">+ 산호 추가</button>
          <button class="primary-action open-feed" type="button">+ 피드 보기</button>
        </div>
      </section>
    </main>

    <aside class="feed-panel" aria-hidden="true">
      <div class="feed-heading">
        <div>
          <span class="eyebrow">CURATED FOR THIS CORAL</span>
          <h2>산호 피드</h2>
          <p class="feed-summary"></p>
        </div>
        <button class="feed-close" type="button" aria-label="피드 닫기">×</button>
      </div>
      <div class="feed-grid"></div>
      <button class="glass-action feed-close-bottom" type="button">+ 피드 닫기</button>
    </aside>

    <div class="generation-overlay" aria-live="polite">
      <div class="growth-ring"></div>
      <strong>선택한 취향을 연결하고 있어요</strong>
      <span>당신만의 산호가 자라납니다</span>
    </div>
  `
  document.body.appendChild(root)

  const screens = [...root.querySelectorAll('[data-screen]')]
  const categoryGrid = root.querySelector('.official-category-grid')
  const createButton = root.querySelector('.create-coral')
  const countText = root.querySelector('.selection-count')
  const headerContext = root.querySelector('.header-context')
  const feedPanel = root.querySelector('.feed-panel')
  const generation = root.querySelector('.generation-overlay')

  api.categories.forEach(({ cat, label }, index) => {
    const button = document.createElement('button')
    button.className = 'official-category'
    button.type = 'button'
    button.dataset.index = String(index)
    button.innerHTML = `<span class="category-order"></span><span>${label}</span>`
    button.addEventListener('click', () => toggleCategory(cat))
    categoryGrid.appendChild(button)
  })

  function setView(next) {
    view = next
    root.dataset.view = next
    screens.forEach((screen) => screen.classList.toggle('is-active', screen.dataset.screen === next))
    document.body.classList.toggle('official-detail-view', next === 'coral')
    document.body.classList.toggle('official-overview-view', next === 'overview')
    document.body.classList.toggle('official-select-view', next === 'select')
    headerContext.textContent = next === 'overview'
      ? '당신의 취향으로 자란 산호들'
      : next === 'coral' && activeCoral
        ? coralName(profileFromCoral(activeCoral), labelFor)
        : ''
    if (next !== 'coral') closeFeed()
    if (next === 'overview') renderOverview()
  }

  function toggleCategory(cat) {
    const index = selected.indexOf(cat)
    if (index >= 0) selected.splice(index, 1)
    else if (selected.length < 3) selected.push(cat)
    renderSelection()
  }

  function renderSelection() {
    root.querySelectorAll('.official-category').forEach((button) => {
      const cat = api.categories[Number(button.dataset.index)].cat
      const index = selected.indexOf(cat)
      button.classList.toggle('is-selected', index >= 0)
      button.querySelector('.category-order').textContent = index >= 0 ? String(index + 1) : ''
    })
    countText.textContent = `${selected.length} / 3`
    createButton.disabled = selected.length !== 3 || !modelsReady
    createButton.textContent = modelsReady ? '산호 생성하기' : '산호를 준비하고 있어요'
  }

  function openSelection(isAdd = false) {
    addMode = isAdd
    selected = []
    renderSelection()
    root.querySelector('.selection-cancel').textContent = isAdd ? '취소' : '처음으로'
    setView('select')
  }

  function generateCoral() {
    if (selected.length !== 3 || !modelsReady) return
    generation.classList.add('is-active')
    const cats = [...selected]
    window.setTimeout(() => {
      const coral = api.createCoral(cats)
      if (!coral) {
        generation.classList.remove('is-active')
        return
      }
      coral.officialProfile = { cats, weights: [50, 30, 20], feedOffset: api.getCorals().length % 4 }
      activeCoral = coral
      api.updateCoral(coral, cats.map((cat, index) => ({ cat, weight: coral.officialProfile.weights[index] })))
      api.focusCoral(coral)
      renderCoral()
      setView('coral')
      generation.classList.remove('is-active')
    }, 900)
  }

  function renderCoral() {
    if (!activeCoral) return
    const profile = profileFromCoral(activeCoral)
    root.querySelector('.coral-name').textContent = coralName(profile, labelFor)
    root.querySelector('.weight-instruction').textContent =
      `${profile.cats.map(labelFor).join(' · ')} 콘텐츠의 비중을 조절해 주세요.`
    const controls = root.querySelector('.weight-controls')
    controls.innerHTML = ''
    profile.cats.forEach((cat, index) => {
      const row = document.createElement('label')
      row.className = 'weight-row'
      row.style.setProperty('--category-color', `#${cat.color.toString(16).padStart(6, '0')}`)
      row.innerHTML = `
        <span class="weight-label"><i></i>${labelFor(cat)}</span>
        <strong>${profile.weights[index]}%</strong>
        <input type="range" min="5" max="90" value="${profile.weights[index]}" aria-label="${labelFor(cat)} 비중">
      `
      row.querySelector('input').addEventListener('input', (event) => {
        profile.weights[index] = Number(event.target.value)
        normalizeProfileWeights(profile, index)
        applyProfile()
      })
      controls.appendChild(row)
    })
  }

  function normalizeProfileWeights(profile, changedIndex) {
    const changed = profile.weights[changedIndex]
    const others = profile.weights.map((value, index) => index === changedIndex ? 0 : value)
    const otherTotal = others.reduce((sum, value) => sum + value, 0) || 1
    const remaining = Math.max(10, 100 - changed)
    profile.weights = profile.weights.map((value, index) => {
      if (index === changedIndex) return Math.min(90, Math.max(10, changed))
      return Math.max(5, Math.round((value / otherTotal) * remaining))
    })
    const difference = 100 - profile.weights.reduce((sum, value) => sum + value, 0)
    const receiver = profile.weights.findIndex((_, index) => index !== changedIndex)
    profile.weights[receiver] += difference
  }

  function applyProfile() {
    const profile = profileFromCoral(activeCoral)
    api.updateCoral(activeCoral, profile.cats.map((cat, index) => ({ cat, weight: profile.weights[index] })))
    renderCoral()
    if (feedPanel.classList.contains('is-open')) renderFeed()
  }

  function renderFeed() {
    if (!activeCoral) return
    const profile = profileFromCoral(activeCoral)
    const cards = feedFor(profile, labelFor)
    root.querySelector('.feed-summary').textContent =
      `${profile.cats.map((cat, index) => `${labelFor(cat)} ${profile.weights[index]}%`).join(' · ')}`
    const grid = root.querySelector('.feed-grid')
    grid.innerHTML = ''
    cards.forEach((card) => {
      const anchor = document.createElement('a')
      anchor.className = 'feed-card'
      anchor.href = card.url
      anchor.target = '_blank'
      anchor.rel = 'noopener noreferrer'
      anchor.innerHTML = `
        <span class="feed-image" style="background-image:url('${card.image}')"></span>
        <span class="feed-card-copy">
          <span class="feed-meta"><b>${card.source}</b><em>${card.category}</em></span>
          <strong>${card.title}</strong>
          <small>콘텐츠 열기 ↗</small>
        </span>
      `
      grid.appendChild(anchor)
    })
  }

  function openFeed() {
    if (!activeCoral) return
    renderFeed()
    feedPanel.classList.add('is-open')
    feedPanel.setAttribute('aria-hidden', 'false')
    document.body.classList.add('official-feed-open')
  }

  function closeFeed() {
    feedPanel.classList.remove('is-open')
    feedPanel.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('official-feed-open')
  }

  function renderOverview() {
    const count = api.getCorals().length
    root.querySelector('.coral-count').textContent = `${count}개의 산호가 자라고 있어요`
  }

  function showCoral(coral) {
    if (!coral) return
    activeCoral = coral
    renderCoral()
    setView('coral')
  }

  root.querySelector('.intro-start').addEventListener('click', () => openSelection(false))
  root.querySelector('.selection-cancel').addEventListener('click', () => {
    if (addMode && api.getCorals().length) {
      api.showOverview()
      setView('overview')
    } else {
      setView('intro')
    }
  })
  createButton.addEventListener('click', generateCoral)
  root.querySelectorAll('.add-coral').forEach((button) => button.addEventListener('click', () => openSelection(true)))
  root.querySelector('.open-feed').addEventListener('click', openFeed)
  root.querySelector('.feed-close').addEventListener('click', closeFeed)
  root.querySelector('.feed-close-bottom').addEventListener('click', closeFeed)
  root.querySelector('.back-button').addEventListener('click', () => {
    api.showOverview()
    setView('overview')
  })
  root.querySelector('.brand-button').addEventListener('click', () => {
    if (!api.getCorals().length) {
      setView('intro')
      return
    }
    api.showOverview()
    setView('overview')
  })

  renderSelection()
  setView('intro')

  return {
    onModelsReady() {
      modelsReady = true
      renderSelection()
      api.seedIntro()
    },
    onCoralFocused(coral) {
      if (view === 'intro' || view === 'select') return
      showCoral(coral)
    },
    onOverview() {
      if (view === 'intro' || view === 'select') return
      setView('overview')
    },
  }
}
