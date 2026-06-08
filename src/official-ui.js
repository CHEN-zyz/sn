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

const youtubeVideo = (id) => `https://www.youtube.com/watch?v=${id}`
const youtubeThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
const steamImage = (appId) => `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`

const SPECIFIC_CONTENT_LIBRARY = {
  '뉴스·시사': [
    { source: 'BBC Korea', title: '기후 변화: 지구가 보내는 경고', url: 'https://www.bbc.com/korean', image: image('news', 0) },
    { source: 'Google News', title: '한국 주요 뉴스 모아보기', url: 'https://news.google.com/topstories?hl=ko&gl=KR&ceid=KR:ko', image: image('news', 1) },
    { source: 'Reuters', title: '세계 뉴스와 국제 이슈', url: 'https://www.reuters.com/world/', image: image('news', 2) },
    { source: 'The Guardian', title: 'Long Read: 깊게 읽는 오늘의 이슈', url: 'https://www.theguardian.com/news/series/the-long-read', image: image('news', 3) },
  ],
  '경제·투자': [
    { source: 'Naver Finance', title: '오늘의 국내 증시 지표', url: 'https://finance.naver.com/sise/', image: image('finance', 0) },
    { source: 'TradingView', title: 'S&P 500 실시간 차트', url: 'https://kr.tradingview.com/symbols/SPX/', image: image('finance', 1) },
    { source: 'KDI', title: '경제정보센터: 경제정책 자료', url: 'https://eiec.kdi.re.kr/main.do', image: image('finance', 2) },
    { source: 'FRED', title: '미국 기준금리 데이터', url: 'https://fred.stlouisfed.org/series/FEDFUNDS', image: image('finance', 3) },
  ],
  '요리': [
    { source: '만개의레시피', title: '김치볶음밥 레시피', url: 'https://www.10000recipe.com/recipe/list.html?q=%EA%B9%80%EC%B9%98%EB%B3%B6%EC%9D%8C%EB%B0%A5', image: image('cooking', 0) },
    { source: 'Maangchi', title: 'Kimchi fried rice', url: 'https://www.maangchi.com/recipe/kimchi-bokkeumbap', image: image('cooking', 1) },
    { source: 'BBC Good Food', title: 'Easy pancake recipe', url: 'https://www.bbcgoodfood.com/recipes/easy-pancakes', image: image('cooking', 2) },
    { source: 'Allrecipes', title: 'Banana bread recipe', url: 'https://www.allrecipes.com/recipe/20144/banana-banana-bread/', image: image('cooking', 3) },
  ],
  '게임': [
    { source: 'Steam', title: 'Hades', url: 'https://store.steampowered.com/app/1145360/Hades/', image: steamImage('1145360') },
    { source: 'Steam', title: 'Stardew Valley', url: 'https://store.steampowered.com/app/413150/Stardew_Valley/', image: steamImage('413150') },
    { source: 'Steam', title: 'Stray', url: 'https://store.steampowered.com/app/1332010/Stray/', image: steamImage('1332010') },
    { source: 'Steam', title: 'Dave the Diver', url: 'https://store.steampowered.com/app/1868140/DAVE_THE_DIVER/', image: steamImage('1868140') },
  ],
  '스포츠': [
    { source: 'Olympics', title: '올림픽 종목 소개', url: 'https://olympics.com/ko/sports/', image: image('sports', 0) },
    { source: 'NBA', title: 'NBA 경기 하이라이트', url: 'https://www.nba.com/watch/featured', image: image('sports', 1) },
    { source: 'FIFA', title: 'FIFA 월드컵 뉴스', url: 'https://www.fifa.com/fifaplus/ko/tournaments/mens/worldcup', image: image('sports', 2) },
    { source: 'Strava', title: '러닝과 라이딩 기록하기', url: 'https://www.strava.com/sports/running', image: image('sports', 3) },
  ],
  '소프트웨어·AI': [
    { source: 'GitHub', title: 'VS Code repository', url: 'https://github.com/microsoft/vscode', image: image('software', 0) },
    { source: 'Hugging Face', title: 'Stable Diffusion XL', url: 'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0', image: image('software', 1) },
    { source: 'Kaggle', title: 'Titanic machine learning dataset', url: 'https://www.kaggle.com/c/titanic', image: image('software', 2) },
    { source: 'MDN', title: 'JavaScript 첫걸음', url: 'https://developer.mozilla.org/ko/docs/Learn/JavaScript/First_steps', image: image('software', 3) },
  ],
  '환경·기후': [
    { source: 'TED', title: 'Climate change talks', url: 'https://www.ted.com/topics/climate+change', image: image('climate', 0) },
    { source: 'NASA', title: 'Global Climate Change', url: 'https://climate.nasa.gov/', image: image('climate', 1) },
    { source: 'UNEP', title: 'Beat Plastic Pollution', url: 'https://www.unep.org/interactives/beat-plastic-pollution/', image: image('climate', 2) },
    { source: 'Our World in Data', title: 'CO2 and greenhouse gas emissions', url: 'https://ourworldindata.org/co2-and-greenhouse-gas-emissions', image: image('climate', 3) },
  ],
  '광고·마케팅': [
    { source: 'Think with Google', title: 'Consumer insights', url: 'https://www.thinkwithgoogle.com/intl/ko-kr/consumer-insights/', image: image('marketing', 0) },
    { source: 'HubSpot', title: 'What is content marketing?', url: 'https://blog.hubspot.com/marketing/content-marketing', image: image('marketing', 1) },
    { source: 'Mailchimp', title: 'What is a marketing campaign?', url: 'https://mailchimp.com/marketing-glossary/marketing-campaign/', image: image('marketing', 2) },
    { source: 'Behance', title: 'Brand identity projects', url: 'https://www.behance.net/search/projects/brand%20identity', image: image('marketing', 3) },
  ],
  '음악': [
    { source: 'YouTube', title: 'PSY - GANGNAM STYLE', url: youtubeVideo('9bZkp7q19f0'), image: youtubeThumb('9bZkp7q19f0') },
    { source: 'YouTube', title: 'Rick Astley - Never Gonna Give You Up', url: youtubeVideo('dQw4w9WgXcQ'), image: youtubeThumb('dQw4w9WgXcQ') },
    { source: 'YouTube', title: 'OneRepublic - Counting Stars', url: youtubeVideo('hT_nvWreIhg'), image: youtubeThumb('hT_nvWreIhg') },
    { source: 'NPR Music', title: 'Tiny Desk Concerts', url: 'https://www.npr.org/series/tiny-desk-concerts/', image: image('music', 3) },
  ],
  '디자인·예술': [
    { source: 'Google Arts', title: 'Van Gogh Museum', url: 'https://artsandculture.google.com/partner/van-gogh-museum', image: image('design', 0) },
    { source: 'Awwwards', title: 'Website of the Day', url: 'https://www.awwwards.com/websites/sotd/', image: image('design', 1) },
    { source: 'Behance', title: 'UI/UX design projects', url: 'https://www.behance.net/search/projects/ui%20ux%20design', image: image('design', 2) },
    { source: 'MoMA', title: 'Collection: Design', url: 'https://www.moma.org/collection/terms/design', image: image('design', 3) },
  ],
  '여행': [
    { source: 'Visit Korea', title: '서울 여행 정보', url: 'https://english.visitkorea.or.kr/svc/whereToGo/locIntrdn/rgnContentsView.do?vcontsId=140659', image: image('travel', 0) },
    { source: 'Airbnb', title: '서울 숙소 둘러보기', url: 'https://www.airbnb.co.kr/s/Seoul--South-Korea/homes', image: image('travel', 1) },
    { source: 'National Geographic', title: 'Best of the World', url: 'https://www.nationalgeographic.com/travel/article/best-of-the-world', image: image('travel', 2) },
    { source: 'Lonely Planet', title: 'Japan travel guide', url: 'https://www.lonelyplanet.com/japan', image: image('travel', 3) },
  ],
  '영감·인사이트': [
    { source: 'TED', title: 'Do schools kill creativity?', url: youtubeVideo('iG9CE55wbtY'), image: youtubeThumb('iG9CE55wbtY') },
    { source: 'TED', title: 'The danger of a single story', url: youtubeVideo('D9Ihs241zeg'), image: youtubeThumb('D9Ihs241zeg') },
    { source: 'YouTube', title: 'How to speak so that people want to listen', url: youtubeVideo('eIho2S0ZahI'), image: youtubeThumb('eIho2S0ZahI') },
    { source: 'The Marginalian', title: 'Figuring', url: 'https://www.themarginalian.org/2019/02/12/figuring/', image: image('insight', 3) },
  ],
  '학습': [
    { source: 'Khan Academy', title: 'Algebra basics', url: 'https://www.khanacademy.org/math/algebra-basics', image: image('learning', 0) },
    { source: 'Coursera', title: 'Learning How to Learn', url: 'https://www.coursera.org/learn/learning-how-to-learn', image: image('learning', 1) },
    { source: 'K-MOOC', title: 'K-MOOC 강좌 찾기', url: 'https://www.kmooc.kr/courses', image: image('learning', 2) },
    { source: 'YouTube', title: 'The first 20 hours: how to learn anything', url: youtubeVideo('5MgBikgcWnY'), image: youtubeThumb('5MgBikgcWnY') },
  ],
  '스타일': [
    { source: 'Vogue Korea', title: 'Fashion', url: 'https://www.vogue.co.kr/category/fashion/', image: image('style', 0) },
    { source: 'Musinsa', title: 'Street snap', url: 'https://www.musinsa.com/snap/main', image: image('style', 1) },
    { source: 'GQ Korea', title: 'Style', url: 'https://www.gqkorea.co.kr/category/style/', image: image('style', 2) },
    { source: 'W Korea', title: 'Fashion', url: 'https://www.wkorea.com/category/fashion/', image: image('style', 3) },
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
    const library = SPECIFIC_CONTENT_LIBRARY[cat.name] || []
    for (let i = 0; i < counts[catIndex]; i++) {
      if (!library.length) continue
      const item = library[(profile.feedOffset + i + catIndex) % library.length]
      cards.push({ ...item, category: labelFor(cat), weight: profile.weights[catIndex], color: cat.color })
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
  let loadProgress = { loaded: 0, total: 0 }

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
          <div class="tag-editor">
            <div class="tag-editor-head">
              <span>태그 변경</span>
              <small>카테고리를 바꾸면 산호와 피드가 함께 바뀝니다.</small>
            </div>
            <div class="tag-slots"></div>
          </div>
          <div class="weight-controls"></div>
          <p class="weight-note">비중을 움직이면 산호의 빛과 추천 피드가 함께 달라집니다.</p>
          <button class="delete-coral" type="button">산호 삭제</button>
        </aside>
        <div class="coral-actions">
          <button class="glass-action add-coral" type="button">+ 산호 추가</button>
          <button class="primary-action open-feed" type="button">피드 보기</button>
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
    headerContext.textContent = next === 'coral' && activeCoral
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
    createButton.textContent = modelsReady
      ? '산호 생성하기'
      : loadProgress.total
        ? `산호를 준비하고 있어요 (${loadProgress.loaded}/${loadProgress.total})`
        : '산호를 준비하고 있어요'
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
    generation.classList.remove('is-error')
    generation.classList.add('is-active')
    const cats = [...selected]
    window.setTimeout(() => {
      const coral = api.createCoral(cats)
      if (!coral) {
        showGenerationError()
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

  function showGenerationError() {
    const strong = generation.querySelector('strong')
    const span = generation.querySelector('span')
    const prevStrong = strong?.textContent
    const prevSpan = span?.textContent
    generation.classList.add('is-error')
    if (strong) strong.textContent = '산호를 만들지 못했어요'
    if (span) span.textContent = '잠시 후 다시 시도해 주세요'
    window.setTimeout(() => {
      generation.classList.remove('is-active')
      generation.classList.remove('is-error')
      if (strong && prevStrong) strong.textContent = prevStrong
      if (span && prevSpan) span.textContent = prevSpan
    }, 2400)
  }

  function renderCoral() {
    if (!activeCoral) return
    const profile = profileFromCoral(activeCoral)
    root.querySelector('.coral-name').textContent = coralName(profile, labelFor)
    root.querySelector('.weight-instruction').textContent =
      `${profile.cats.map(labelFor).join(' · ')} 콘텐츠의 비중을 조절해 주세요.`
    renderTagEditor(profile)
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
        commitWeights()
      })
      controls.appendChild(row)
    })
  }

  function renderTagEditor(profile) {
    const slots = root.querySelector('.tag-slots')
    slots.innerHTML = ''
    profile.cats.forEach((cat, index) => {
      const row = document.createElement('label')
      row.className = 'tag-slot'
      row.innerHTML = `
        <span>${index + 1}</span>
        <select aria-label="태그 ${index + 1} 변경"></select>
      `
      const select = row.querySelector('select')
      api.categories.forEach(({ cat: optionCat, label }) => {
        const option = document.createElement('option')
        option.value = optionCat.name
        option.textContent = label
        option.selected = optionCat.name === cat.name
        option.disabled = profile.cats.some((selectedCat, selectedIndex) =>
          selectedIndex !== index && selectedCat.name === optionCat.name
        )
        select.appendChild(option)
      })
      select.addEventListener('change', () => {
        const nextCat = api.categories.find((item) => item.cat.name === select.value)?.cat
        if (!nextCat) return
        profile.cats[index] = nextCat
        applyProfile()
      })
      slots.appendChild(row)
    })
  }

  function normalizeProfileWeights(profile, changedIndex) {
    const min = 5
    const max = 90
    const changed = Math.min(max, Math.max(min, Math.round(profile.weights[changedIndex])))
    const otherIndexes = profile.weights.map((_, index) => index).filter((index) => index !== changedIndex)
    const remaining = 100 - changed
    const previousOtherTotal = otherIndexes.reduce((sum, index) => sum + Math.max(min, profile.weights[index]), 0)

    profile.weights = profile.weights.map((value, index) => {
      if (index === changedIndex) return changed
      const ratio = previousOtherTotal ? Math.max(min, value) / previousOtherTotal : 1 / otherIndexes.length
      return Math.max(min, Math.round(remaining * ratio))
    })

    let difference = 100 - profile.weights.reduce((sum, value) => sum + value, 0)
    while (difference !== 0) {
      const index = otherIndexes.find((candidate) => {
        const nextValue = profile.weights[candidate] + Math.sign(difference)
        return nextValue >= min && nextValue <= max
      })
      if (index === undefined) break
      profile.weights[index] += Math.sign(difference)
      difference -= Math.sign(difference)
    }
  }

  // Weight drags update the existing rows in place — rebuilding the DOM (renderCoral)
  // on every input event would destroy the slider mid-drag and break smooth dragging.
  function commitWeights() {
    if (!activeCoral) return
    const profile = profileFromCoral(activeCoral)
    api.updateCoral(activeCoral, profile.cats.map((cat, index) => ({ cat, weight: profile.weights[index] })))
    syncWeightRows(profile)
    scheduleFeedRefresh()
  }

  function syncWeightRows(profile) {
    root.querySelectorAll('.weight-controls .weight-row').forEach((row, index) => {
      const value = profile.weights[index]
      const strong = row.querySelector('strong')
      if (strong) strong.textContent = `${value}%`
      const input = row.querySelector('input')
      if (input && document.activeElement !== input) input.value = String(value)
    })
  }

  let feedRefreshTimer = null
  function scheduleFeedRefresh() {
    if (!feedPanel.classList.contains('is-open')) return
    if (feedRefreshTimer) return
    feedRefreshTimer = window.setTimeout(() => {
      feedRefreshTimer = null
      renderFeed()
    }, 140)
  }

  // Used for tag changes, which alter categories/colors/labels and need a full rebuild.
  function applyProfile() {
    const profile = profileFromCoral(activeCoral)
    api.updateCoral(activeCoral, profile.cats.map((cat, index) => ({ cat, weight: profile.weights[index] })))
    headerContext.textContent = coralName(profile, labelFor)
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
        <span class="feed-image" style="background-color:#${card.color.toString(16).padStart(6, '0')};background-image:url('${card.image}')"></span>
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
  root.querySelector('.delete-coral').addEventListener('click', () => {
    if (!activeCoral) return
    const deleting = activeCoral
    activeCoral = null
    closeFeed()
    api.removeCoral(deleting)
    api.showOverview()
    setView('overview')
  })
  root.querySelector('.feed-close').addEventListener('click', closeFeed)
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
    onModelsProgress(loaded, total) {
      loadProgress = { loaded, total }
      if (!modelsReady) renderSelection()
    },
    onModelsReady() {
      modelsReady = true
      loadProgress = { loaded: loadProgress.total, total: loadProgress.total }
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
