// ==========================================
// AI 聰明工具箱 Dashboard Logic
// ==========================================

// Global state
let currentYear = 2026;
let currentMonth = 6; // July (0-indexed)
let activeTab = 'dashboard';

// Mock Databases
const mockProducts = {
  nike: [
    { id: 'nike-1', name: 'Nike Air Max Dn (新世代緩震跑鞋)', price: '$4,500', img: '👟' },
    { id: 'nike-2', name: 'Nike Pegasus 41 (經典避震跑鞋)', price: '$3,800', img: '🏃' },
    { id: 'nike-3', name: 'Nike Sportswear Tech Fleece (運動連帽外套)', price: '$3,200', img: '🧥' }
  ],
  apple: [
    { id: 'apple-1', name: 'iPhone 15 Pro Max', price: '$44,900', img: '📱' },
    { id: 'apple-2', name: 'MacBook Air 13" M3', price: '$35,900', img: '💻' },
    { id: 'apple-3', name: 'Apple Watch Series 9', price: '$13,500', img: '⌚' }
  ],
  dyson: [
    { id: 'dyson-1', name: 'Dyson V15 Detect (智能無線吸塵器)', price: '$24,900', img: '🧹' },
    { id: 'dyson-2', name: 'Dyson Airwrap (多功能造型器)', price: '$17,600', img: '💇' },
    { id: 'dyson-3', name: 'Dyson Purifier Hot+Cool (三合一涼暖空氣清淨機)', price: '$22,900', img: '🌀' }
  ],
  uniqlo: [
    { id: 'uniqlo-1', name: 'AIRism 棉質寬版圓領 T 恤', price: '$590', img: '👕' },
    { id: 'uniqlo-2', name: '特級極輕羽絨蓬鬆外套', price: '$2,490', img: '🧥' },
    { id: 'uniqlo-3', name: '防皺無褶寬褲', price: '$990', img: '👖' }
  ]
};

const mockBrands = [
  {
    key: 'nike',
    name: 'Nike 運動潮流專區',
    description: '引領運動科技與街頭時尚潮流。強調熱情、超越自我與極致性能。',
    positioning: '高階運動性能與日常時尚穿搭的完美融合',
    tone: '🔥 熱情銷售、激勵人心、注重科技與設計亮點',
    pricing: '中高價位帶 ($3,000 ~ $6,000)',
    audience: '18-35 歲運動愛好者、街頭潮流追隨者、學生與上班族',
    logo: '✔️'
  },
  {
    key: 'apple',
    name: 'Apple 科技生活館',
    description: '極簡、極致、重塑生活習慣。講求科技美學與極致的使用體驗。',
    positioning: '引領數位生活風潮的高端個人科技生態圈',
    tone: '💼 專業嚴謹、極簡洗鍊、聚焦於生活體驗而非單純規格',
    pricing: '高價位帶 ($10,000 ~ $50,000)',
    audience: '高質感生活追求者、科技愛好者、創作者與商務人士',
    logo: '🍎'
  },
  {
    key: 'dyson',
    name: 'Dyson 智能家電專櫃',
    description: '用工程技術解決日常問題。代表著極致科技、工藝美學與高端家電定位。',
    positioning: '解決生活痛點的智能高科技奢華家電',
    tone: '✨ 科技開箱、機能詳解、生活格調的無形提升',
    pricing: '極高價位帶 ($15,000 ~ $30,000)',
    audience: '中產階級家庭、重視生活品質與健康科技的科技中產、美髮造型愛好者',
    logo: '🌀'
  },
  {
    key: 'uniqlo',
    name: 'UNIQLO 簡約美學店',
    description: 'LifeWear 服飾，簡約、高品質、日常。重視機能性材料與高性價比。',
    positioning: '適合所有人的簡約、舒適、高機能日常服飾',
    tone: '🍃 溫暖柔和、簡約生活感、著重機能（如 AIRism, HEATTECH）與百搭特質',
    pricing: '親民平實價位 ($390 ~ $3,000)',
    audience: '全年齡層大眾、重視穿著舒適度與實穿百搭風格的實用主義者',
    logo: '🔴'
  }
];

const mockKeywords = [
  { text: '中元普渡箱', stat: '🔥 +320% 飆升' },
  { text: 'Nike Air Max Dn', stat: '⚡ +142% 熱搜' },
  { text: '超商冷凍免運', stat: '✨ +95%' },
  { text: '防潑水機能外套', stat: '📈 +80%' },
  { text: 'Dyson造型器限時折', stat: '🔥 +74%' },
  { text: 'AIRism寬版素T', stat: '⚡ +65%' }
];

const mockRankProducts = [
  { text: 'AIRism 棉質寬版圓領 T 恤', stat: '銷量: 2,410' },
  { text: 'Nike Air Max Dn 跑鞋', stat: '銷量: 1,840' },
  { text: 'Dyson V15 Detect 旗艦吸塵器', stat: '銷量: 620' },
  { text: 'iPhone 15 Pro Max', stat: '銷量: 590' },
  { text: '特級極輕羽絨蓬鬆外套', stat: '銷量: 450' }
];

const mockRankBrands = [
  { text: 'Nike 聰明工具箱官方旗艦店', stat: '互動率: 4.8%' },
  { text: 'UNIQLO 聰明工具箱直營店', stat: '互動率: 4.5%' },
  { text: 'Dyson 智能家電專賣店', stat: '互動率: 4.1%' },
  { text: 'Apple 授權經銷旗艦店', stat: '互動率: 3.9%' }
];

// Calendar Events Database (keys represent date strings: "YYYY-MM-DD")
const calendarEvents = {
  '2026-07-01': [
    { title: 'Nike Air Max Dn 新鞋款穿搭分享', time: '11:00', platform: '聰明工具箱 Feed', desc: '穿上新一代 Air Max Dn，感受動能流轉！⚡ #AirMax #穿搭' }
  ],
  '2026-07-06': [
    { title: 'Dyson V15 大掃除智能實測', time: '14:30', platform: 'Instagram', desc: '實測影片上線！灰塵現形功能超狂，吸力無敵！🧹 #Dyson #開箱' }
  ],
  '2026-07-10': [
    { title: 'UNIQLO AIRism 經典素T多色穿搭', time: '19:00', platform: 'Facebook', desc: '熱銷第一素T，百搭多色挑戰，現領 9 折券！👕 #LifeWear #素T' }
  ],
  '2026-07-13': [
    { title: '中元普渡箱驚喜開箱', time: '18:00', platform: '聰明工具箱 Feed', desc: '🏮 中元普渡倒數！超澎派拜拜箱大公開，餅乾飲料一次滿足，免搬運送到家！🛒 #中元普渡 #澎派拜拜箱' }
  ],
  '2026-07-17': [
    { title: 'Apple iPhone 15 Pro 特惠促銷', time: '12:00', platform: '聰明工具箱 Feed', desc: '限時狂降 $2,500！果粉必看，極致鈦金屬邊框，拍照新高度！📱 #iPhone15 #限時促銷' }
  ],
  '2026-07-22': [
    { title: 'Dyson Airwrap 美髮造型技巧', time: '20:30', platform: 'Instagram', desc: '夏日防塌蓬鬆感教學！只要 3 分鐘輕鬆出門！💇 #Dyson造型器' }
  ]
};

// AI Insights stream source data
const aiInsightsTemplates = [
  '⚡ 監測到競品「特級極輕跑鞋」在工具箱搜尋權重提高，建議調整相關商品的 Hashtag。',
  '📊 智慧分析：UNIQLO 素 T 目前在台北地區以 20-25 歲女性點擊率最高，建議增加此客群文案定位。',
  '💰 Nike 專區「Pegasus 41」加入購物車率提升 24%，轉化率有上漲空間，建議啟動限時折價優惠。',
  '📢 社群情緒監測：Dyson 新造型器討論區情緒值「92% 正向」，用戶偏愛「不傷髮質」的特點。',
  '🎯 發現新關鍵字趨勢：「夏日吸濕排汗素色 T-shirt」搜尋指數暴增 85%，可關聯 AIRism 系列。',
  '⏳ Apple 專區下午 13:00 - 15:00 點擊率達峰值，建議文案發布排程設定在此黃金時段。'
];

// ==========================================
// Tab Switching
// ==========================================
function switchTab(tabId) {
  // Update state
  activeTab = tabId;
  
  // Update navigation buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const currentNav = document.getElementById(`nav-${tabId}`);
  if (currentNav) currentNav.classList.add('active');

  // Update page title
  const tabTitles = {
    dashboard: '數據總覽',
    calendar: '排程行事曆',
    generator: 'AI 文案生成器',
    brands: '品牌資料庫',
    trends: '趨勢與競品',
    reports: 'AI 分析報告'
  };
  document.getElementById('current-tab-title').textContent = tabTitles[tabId];

  // Update tab content displays
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`tab-${tabId}`).classList.add('active');

  // Specific tab initializations
  if (tabId === 'calendar') {
    renderCalendar();
  } else if (tabId === 'generator') {
    onGeneratorBrandChange();
  } else if (tabId === 'trends') {
    animateTrendChart();
  }
}

// ==========================================
// Initialize Dashboard
// ==========================================
function initDashboard() {
  // 1. Populate Keywords
  const keywordsContainer = document.getElementById('rank-keywords');
  keywordsContainer.innerHTML = mockKeywords.map((item, idx) => `
    <li class="rank-item">
      <span class="rank-num">${idx + 1}</span>
      <span class="rank-text">${item.text}</span>
      <span class="rank-stat">${item.stat}</span>
    </li>
  `).join('');

  // 2. Populate Products
  const productsContainer = document.getElementById('rank-products');
  productsContainer.innerHTML = mockRankProducts.map((item, idx) => `
    <li class="rank-item">
      <span class="rank-num">${idx + 1}</span>
      <span class="rank-text">${item.text}</span>
      <span class="rank-stat">${item.stat}</span>
    </li>
  `).join('');

  // 3. Populate Brands
  const brandsContainer = document.getElementById('rank-brands');
  brandsContainer.innerHTML = mockRankBrands.map((item, idx) => `
    <li class="rank-item">
      <span class="rank-num">${idx + 1}</span>
      <span class="rank-text">${item.text}</span>
      <span class="rank-stat">${item.stat}</span>
    </li>
  `).join('');

  // 4. Initial AI Insights
  const streamContainer = document.getElementById('ai-insight-stream');
  streamContainer.innerHTML = '';
  addInsightItem('13:46:12', '🎉 AI Agent 初始化成功。連結品牌專區資料庫完畢。');
  addInsightItem('13:46:15', '🏮 發現新活動商機：<b>中元節</b> 促銷潮即將開始，已為您智慧規劃相關貼文排程。');
  
  // 5. Start Insight Stream
  setInterval(() => {
    if (activeTab === 'dashboard') {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const randomMsg = aiInsightsTemplates[Math.floor(Math.random() * aiInsightsTemplates.length)];
      addInsightItem(timeStr, randomMsg);
    }
  }, 10000);
}

function addInsightItem(time, message) {
  const streamContainer = document.getElementById('ai-insight-stream');
  const div = document.createElement('div');
  div.className = 'stream-item';
  div.innerHTML = `
    <span class="stream-time">${time}</span>
    <p class="stream-msg">${message}</p>
  `;
  streamContainer.insertBefore(div, streamContainer.firstChild);

  // Keep max 15 items in stream
  if (streamContainer.children.length > 15) {
    streamContainer.removeChild(streamContainer.lastChild);
  }
}

// ==========================================
// Calendar Logic
// ==========================================
function renderCalendar() {
  const gridBody = document.getElementById('calendar-grid-body');
  const monthYearLabel = document.getElementById('calendar-month-year');
  gridBody.innerHTML = '';

  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  monthYearLabel.textContent = `${currentYear} 年 ${months[currentMonth]}`;

  // Get first day of the month and number of days
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Convert getDay() index: 0(Sun) -> index 6, 1(Mon) -> index 0, ..., 6(Sat) -> index 5
  let adjustedFirstDay = firstDayIndex - 1;
  if (adjustedFirstDay < 0) adjustedFirstDay = 6; // Sunday becomes index 6

  // Generate empty cells for preceding month's offset
  for (let i = 0; i < adjustedFirstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    gridBody.appendChild(emptyCell);
  }

  // Generate day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dayCell.onclick = () => openCalendarDayModal(dayStr, day);

    dayCell.innerHTML = `<span class="day-number">${day}</span>`;

    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'calendar-events-container';

    // Insert events if present
    if (calendarEvents[dayStr]) {
      calendarEvents[dayStr].forEach((ev, idx) => {
        const evDiv = document.createElement('div');
        let platClass = 'smart';
        if (ev.platform === 'Instagram') platClass = 'ig';
        else if (ev.platform === 'Facebook') platClass = 'fb';
        else if (ev.platform === 'Threads') platClass = 'threads';
        
        evDiv.className = `calendar-event ${platClass}`;
        evDiv.textContent = `[${ev.time}] ${ev.title}`;
        evDiv.title = ev.desc;
        eventsContainer.appendChild(evDiv);
      });
    }

    dayCell.appendChild(eventsContainer);
    gridBody.appendChild(dayCell);
  }
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

// ==========================================
// Modal Operations
// ==========================================
function openCalendarDayModal(dateStr, dayNum) {
  const modal = document.getElementById('event-modal');
  document.getElementById('modal-day-num').value = dateStr;
  
  const titleInput = document.getElementById('modal-post-title');
  const timeInput = document.getElementById('modal-post-time');
  const platformSelect = document.getElementById('modal-post-platform');
  const descTextarea = document.getElementById('modal-post-desc');

  // Check if we already have an event for this day
  if (calendarEvents[dateStr] && calendarEvents[dateStr].length > 0) {
    const ev = calendarEvents[dateStr][0];
    document.getElementById('modal-title').textContent = `${dateStr} 排程貼文`;
    titleInput.value = ev.title;
    timeInput.value = ev.time;
    platformSelect.value = ev.platform;
    descTextarea.value = ev.desc;
  } else {
    document.getElementById('modal-title').textContent = `${dateStr} 新增排程貼文`;
    titleInput.value = 'AI 推薦主題貼文';
    timeInput.value = '18:00';
    platformSelect.value = '聰明工具箱 Feed';
    descTextarea.value = '輸入文案內容...';
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('event-modal').classList.add('hidden');
}

function saveModalEvent() {
  const dateStr = document.getElementById('modal-day-num').value;
  const title = document.getElementById('modal-post-title').value;
  const time = document.getElementById('modal-post-time').value;
  const platform = document.getElementById('modal-post-platform').value;
  const desc = document.getElementById('modal-post-desc').value;

  calendarEvents[dateStr] = [{ title, time, platform, desc }];
  closeModal();
  renderCalendar();

  // Show status indicator increase
  const todayGenerated = document.getElementById('kpi-content-generated');
  if (todayGenerated) {
    const val = parseInt(todayGenerated.textContent) + 1;
    todayGenerated.textContent = `${val} 篇`;
  }
}

function deleteModalEvent() {
  const dateStr = document.getElementById('modal-day-num').value;
  if (calendarEvents[dateStr]) {
    delete calendarEvents[dateStr];
  }
  closeModal();
  renderCalendar();
}

// ==========================================
// AI Content Generator Tab Logic
// ==========================================
function onGeneratorBrandChange() {
  const brand = document.getElementById('gen-brand').value;
  const productSelect = document.getElementById('gen-product');
  
  if (mockProducts[brand]) {
    productSelect.innerHTML = mockProducts[brand].map(p => `
      <option value="${p.id}">${p.name} - ${p.price}</option>
    `).join('');
  }
}

// Typing effect simulation
function triggerAIGeneration() {
  const brandKey = document.getElementById('gen-brand').value;
  const productId = document.getElementById('gen-product').value;
  const platform = document.querySelector('input[name="gen-platform"]:checked').value;
  const tone = document.getElementById('gen-tone').value;
  const promo = document.getElementById('gen-promo').value;
  const extra = document.getElementById('gen-prompt-extra').value;

  const btn = document.getElementById('btn-generate');
  btn.disabled = true;
  btn.textContent = '🤖 AI 正在精雕細琢文案中...';

  // Find product details
  const pList = mockProducts[brandKey];
  const productObj = pList.find(p => p.id === productId);

  // Update mockup headers immediately
  const mockupTitle = document.getElementById('mockup-header-title');
  const mockupAuthor = document.getElementById('mockup-author');
  const mockupAvatar = document.getElementById('mockup-avatar');
  const mockupVisual = document.getElementById('mockup-visual');
  const mockupVisualDesc = document.getElementById('mockup-visual-desc');

  mockupTitle.textContent = platform;
  
  // Visual avatar / branding update based on selected brand
  const avatars = { nike: '✔️', apple: '🍎', dyson: '🌀', uniqlo: '🔴' };
  const authors = { nike: 'Nike 官方旗艦館', apple: 'Apple 授權經銷旗艦店', dyson: 'Dyson 智能家電專賣店', uniqlo: 'UNIQLO 直營店' };
  
  mockupAvatar.textContent = avatars[brandKey] || '🍊';
  mockupAuthor.textContent = authors[brandKey] || 'AI 聰明工具箱';
  
  // Visual placeholder description update
  mockupVisualDesc.textContent = `${productObj.img} ${productObj.name} 商品圖`;
  mockupVisual.style.background = `linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(245, 61, 45, 0.15) 100%)`;

  // Select base copy style depending on inputs
  let genText = '';
  
  const formattedPromo = promo ? `\n\n【限定優惠】\n⭐️ ${promo}` : '';
  const formattedExtra = extra ? `\n\n【小編私心推薦】\n${extra}` : '';

  if (tone === 'energetic') {
    genText = `🔥 震撼新品來襲！${productObj.name} 隆重登場！

你有想像過極致的使用感受嗎？今天終於等到它！
極佳的細節設計、潮流的視覺，絕對是本季最值得投資的單品沒有之一！

${productObj.img} 商品特色：
✅ 設計美感再升級，潮流百搭
✅ 高效性能，完美融入日常生活
✅ 老鳥網購私心推薦首選

不要再等了，限量是殘酷的，趕快點擊下方連結手刀搶購吧！🛍️👇
🛒 搶購連結：smart-box.tw/products/${brandKey} ${formattedPromo}${formattedExtra}

#聰明工具箱 #潮流必備 #熱門推薦 #${brandKey}`;
  } else if (tone === 'professional') {
    genText = `💼 專業深度解析：${productObj.name} 功能評測

本次針對旗艦款進行全面剖析，為您整理以下核心升級：

${productObj.img} 核心技術指標：
1. 結構全面優化：在維持前代優勢前提下，顯著提升了使用壽命與手感。
2. 機能材料配置：具備出色的實用度，適應多元情境。
3. 性價比考量：同級距商品中的標竿之作。

【專業點評】
這款商品無疑在效能與日常體驗間取得了近乎完美的平衡，推薦給講究細節與科技表現的愛好者。
${formattedPromo}${formattedExtra}

  🛒 官方授權直營連結：smart-box.tw/products/${brandKey}

#專業開箱 #深度解析 #科技美學 #${brandKey}`;
  } else if (tone === 'luxury') {
    genText = `✨ 儀式感生活，從細節開始 ｜ ${productObj.name}

生活是一場精雕細琢的藝術。
選擇 ${productObj.name}，不只是選擇一個日常工具，而是為自己的生活格調，增添一抹精緻的註腳。

${productObj.img} 細緻品味：
- 極簡設計美學：無贅飾線條，融入現代居家/穿搭空間。
- 溫潤工藝細節：極佳親膚觸感與符合人體工學的流線設計。
- 靜謐而強大：高雅、沉穩的極致表現。

讓生活的每一天，都更值得期待。🍂
  🛒 尊爵專享：smart-box.tw/products/${brandKey} ${formattedPromo}${formattedExtra}

#美學生活 #高質感必備 #品味細節 #${brandKey}`;
  } else {
    // Humorous
    genText = `🤪 【老闆不要看】這款 ${productObj.name} 真的好用到讓人想偷懶！

小編我收到樣品的時候是抱著懷疑的態度的，
結果用了一天... 對不起老闆，我今天好想提早下班，因為它太好用了！
(到底為什麼可以把細節做得這麼舒服啦？？？

${productObj.img} 欠買三大理由：
👉 好用到連我媽都問我幹嘛不幫她買一台/雙
👉 顏值太高，拿在手上感覺自己走路都有風
👉 這價格... 真的，買個快樂很便宜吧？

看完覺得被推坑了？不要懷疑，點連結跟小編一起加入敗家行列！🛒🤑
  🔗 敗家傳送門：smart-box.tw/products/${brandKey} ${formattedPromo}${formattedExtra}

#小編崩潰推薦 #剁手小編 #推坑專區 #${brandKey}`;
  }

  // Typewriting Simulation
  const textContainer = document.getElementById('mockup-text-content');
  textContainer.textContent = '';
  textContainer.classList.remove('post-text-p');
  
  let i = 0;
  function type() {
    if (i < genText.length) {
      textContainer.textContent += genText.charAt(i);
      i++;
      setTimeout(type, 10); // Speed control
    } else {
      btn.disabled = false;
      btn.textContent = '✨ 啟動 AI 創作文案';
      
      // Update KPI
      const kpiAnalyzed = document.getElementById('kpi-ai-analyzed');
      if (kpiAnalyzed) {
        const val = parseInt(kpiAnalyzed.textContent) + 1;
        kpiAnalyzed.textContent = `${val} 筆`;
      }
    }
  }

  setTimeout(type, 800); // Small initial delay to simulate AI brain wave thinking
}

function copyMockupText() {
  const text = document.getElementById('mockup-text-content').textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('📋 文案已複製到剪貼簿！');
  }).catch(err => {
    alert('複製失敗: ' + err);
  });
}

function scheduleMockupText() {
  const text = document.getElementById('mockup-text-content').textContent;
  const platform = document.getElementById('mockup-header-title').textContent;
  
  // Insert to a future day (e.g. tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  
  calendarEvents[dateStr] = [{
    title: 'AI 排程文案發布',
    time: '18:00',
    platform: platform,
    desc: text
  }];

  alert(`📅 貼文已排程於：${dateStr} 18:00 發布！`);
  
  // Update KPI
  const todayGenerated = document.getElementById('kpi-content-generated');
  if (todayGenerated) {
    const val = parseInt(todayGenerated.textContent) + 1;
    todayGenerated.textContent = `${val} 篇`;
  }
}

// Quick recommendation action on Dashboard
function quickAction(actionType) {
  switchTab('generator');
  
  const brandSelect = document.getElementById('gen-brand');
  const promoInput = document.getElementById('gen-promo');
  const extraTextarea = document.getElementById('gen-prompt-extra');
  const toneSelect = document.getElementById('gen-tone');

  if (actionType === 'mid-ghost') {
    brandSelect.value = 'uniqlo';
    onGeneratorBrandChange();
    promoInput.value = '普渡組合箱免運 滿千折 $100';
    extraTextarea.value = '強調拜拜澎派箱超大份量，不用跑大賣場，直接搬送到家。';
    toneSelect.value = 'energetic';
  } else if (actionType === 'nike-interaction') {
    brandSelect.value = 'nike';
    onGeneratorBrandChange();
    promoInput.value = '限時留言抽 Air Max 緩震跑鞋體驗券';
    extraTextarea.value = '融入週末跑步休閒與潮流穿搭，邀請粉絲在底下留言分享自己的休閒運動。';
    toneSelect.value = 'humorous';
  }
}

// ==========================================
// Brand Intelligence Tab
// ==========================================
function renderBrands() {
  const container = document.getElementById('brands-container');
  container.innerHTML = mockBrands.map(b => `
    <div class="glass-card brand-card">
      <div class="brand-card-header">
        <div class="brand-card-logo">${b.logo}</div>
        <div class="brand-card-meta">
          <h3>${b.name}</h3>
          <p>${b.description}</p>
        </div>
      </div>
      <div class="brand-card-body">
        <div class="brand-info-row">
          <span class="brand-info-label">核心定位</span>
          <span class="brand-info-value">${b.positioning}</span>
        </div>
        <div class="brand-info-row">
          <span class="brand-info-label">AI 語氣偏好</span>
          <span class="brand-info-value theme-orange">${b.tone}</span>
        </div>
        <div class="brand-info-row">
          <span class="brand-info-label">價格區間</span>
          <span class="brand-info-value">${b.pricing}</span>
        </div>
        <div class="brand-info-row">
          <span class="brand-info-label">受眾族群</span>
          <span class="brand-info-value">${b.audience}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// Trends & Competitors Charts Animation
// ==========================================
function animateTrendChart() {
  const trends = [
    { label: '中元普渡箱', val: '95%', width: '95%' },
    { label: '機能避震跑鞋', val: '80%', width: '80%' },
    { label: '無繩智能吸塵器', val: '65%', width: '65%' },
    { label: '超商冷凍免運', val: '58%', width: '58%' },
    { label: 'LifeWear 素T', val: '50%', width: '50%' }
  ];

  const chart = document.getElementById('trend-bar-chart');
  chart.innerHTML = trends.map(t => `
    <div class="chart-bar-item">
      <span class="chart-bar-label">${t.label}</span>
      <div class="chart-bar-container">
        <div class="chart-bar-fill" style="width: 0px"></div>
      </div>
      <span class="chart-bar-val">${t.val}</span>
    </div>
  `).join('');

  // Animate widths after insertion
  setTimeout(() => {
    const fills = chart.querySelectorAll('.chart-bar-fill');
    fills.forEach((fill, idx) => {
      fill.style.width = trends[idx].width;
    });
  }, 100);
}

// ==========================================
// Tab 6: Report Reader Logic
// ==========================================
const mockReports = {
  'report-0713': `
    <h3>每日市場與社群輿情分析報告 - 2026/07/13</h3>
    <blockquote>本報告由 AI 聰明工具箱 自動產生，彙整 7/12 社群全網輿情與大數據分析。</blockquote>
    
    <h4>1. 今日市場焦點趨勢 (Market Trends)</h4>
    <ul>
      <li><b>中元普渡選品</b>: 「普渡澎派包」、「懶人包」等關鍵字搜尋熱度創下單週新高 (+320%)，建議各品牌商家立即在首頁或 Feed 釋出中元組合包優惠。</li>
      <li><b>機能運動鞋</b>: Nike Air Max Dn 帶來極大聲量，主要集中在 18-24 歲潮流客群。</li>
    </ul>

    <h4>2. 社群聲量與情緒值 (Sentiment Analysis)</h4>
    <p><b>Dyson 家電系列</b>: 針對新款美髮造型器的評論，正向情緒高達 92%。用戶痛點多集中在「夏季頭髮容易塌陷，需要快速蓬鬆造型」之技巧分享，建議小編切入教學短影音方向。</p>
    <p><b>Nike 運動系列</b>: 聯名跑鞋相關討論有輕微退燒跡象，本會互動率下滑 12%。建議於今日 18:00 - 20:00 黃金時段安排留言抽獎的互動型貼文以防流失客群。</p>

    <h4>3. 競品情報追蹤 (Competitor Teardowns)</h4>
    <p>競品「優雅運動館」於昨日下午調降跑鞋促銷價格並大肆宣傳「滿 1200 折 100」促銷方案，短期內導流效果顯著。建議我方可對應推出「領券立折」之策略抗衡。</p>
  `,
  'report-0712': `
    <h3>每日市場與社群輿情分析報告 - 2026/07/12</h3>
    <blockquote>本報告由 AI 聰明工具箱 自動產生，彙整 7/11 大數據分析。</blockquote>
    
    <h4>1. 昨日市場焦點趨勢 (Market Trends)</h4>
    <ul>
      <li><b>夏日涼感衣物</b>: 由於氣溫攀升，涼感材質與寬版素 T 銷量顯著上升 (+65%)。UNIQLO AIRism 系列是目前聲量榜首。</li>
      <li><b>高單價小家電</b>: 智能吸塵器以「過敏防護」為主要消費者訴求。</li>
    </ul>

    <h4>2. 社群聲量與情緒值 (Sentiment Analysis)</h4>
    <p><b>UNIQLO 系列</b>: AIRism 的主要負面討論在於熱門顏色尺碼容易斷貨，應善加提醒用戶利用線上商城訂購補貨。</p>
  `
};

function viewReport(reportId) {
  const readerBox = document.getElementById('report-reader-box');
  const title = document.getElementById('reader-title');
  const body = document.getElementById('reader-content-body');

  if (mockReports[reportId]) {
    title.textContent = reportId === 'report-0713' ? '2026/07/13 智慧分析報告' : '2026/07/12 智慧分析報告';
    body.innerHTML = mockReports[reportId];
    readerBox.classList.remove('hidden');
    // Scroll reader into view
    readerBox.scrollIntoView({ behavior: 'smooth' });
  }
}

function closeReportReader() {
  document.getElementById('report-reader-box').classList.add('hidden');
}

// ==========================================
// Page Load Initializer
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  renderBrands();
});
