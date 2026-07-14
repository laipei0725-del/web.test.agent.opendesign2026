// ==========================================
// Dance Creator OS - Core Application Logic
// ==========================================

// Global States
let activeTab = 'dashboard';
let currentYear = 2026;
let currentMonth = 6; // July (0-indexed)
let activeAgentId = 'coach';
let activeStudioPlatform = 'instagram';
let activeChatThreadId = 'thread-1';
let activeFlowId = 'flow-1';

// ==========================================
// Mock Databases
// ==========================================

// Today's Dashboard Schedules
const mockSchedules = [
  { time: '14:00 - 15:30', title: 'Dancehall Foundation', loc: 'Studio A', count: '18 名學員' },
  { time: '16:00 - 17:30', title: 'Choreography Special', loc: 'Studio B', count: '24 名學員' },
  { time: '19:00 - 20:30', title: 'Leo Private Lesson', loc: 'VIP Room', count: '1 名學員' }
];

// Content Creator Tasks
const mockContentTasks = [
  { status: 'editing', title: '剪輯上週六 Dancehall Workshop 精彩影片', due: '今日 18:00 前' },
  { status: 'pending', title: '撰寫今晚排舞教學 Reels 貼文文案', due: '今日 21:00 前' },
  { status: 'draft', title: 'AI 靈感草稿：初學者如何克服扭臀動作障礙', due: '待審核' }
];

// AI Agents Catalog
const mockAgents = {
  coach: {
    name: 'Dance Coach Agent',
    icon: '💃',
    role: '專屬編舞與教學大腦',
    desc: '協助您規劃舞蹈教案、熱身流程、動作結構分解，並生成學員練習作業與回饋。',
    prompt: '你是一位擁有 10 年教學經驗的資深 Dancehall 舞蹈老師。你的風格親切熱情，擅長拆解動作結構，能以極具系統性的邏輯產出結構完整的舞蹈教案、課堂暖身步驟與課後練習指引。',
    memory: '我的主要受眾為 18-35 歲的潮流與街舞愛好者，主要專攻牙買加雷鬼（Dancehall）街頭律動。我的教學哲學是「每個人都能找到自己身體的律動節奏」。',
    templates: [
      { name: '📚 產生舞蹈基礎教案', raw: '規劃一堂適合初學者的 90 分鐘 Dancehall 律動教案，主題是「Wining (臀部律動)」技巧。' },
      { name: '🔥 規劃 15 分鐘高效暖身流程', raw: '規劃一堂高強度的熱身流程，包含關節活動、心肺提升，特別著重在髖關節與腰部肌群的啟動。' },
      { name: '📝 寫下一期學員的練習反饋', raw: '針對完成一個月體驗班的初級班同學，提供一段鼓勵性強、包含三個具體練習重點（重心轉換、核心收縮、音樂踩點）的課後作業。' }
    ]
  },
  cs: {
    name: 'Customer Service Agent',
    icon: '💬',
    role: '智能客服與銷售助理',
    desc: '自動化回覆體驗課諮詢、請假延期、學員跟進與費用問題，並維持溫馨鼓勵語氣。',
    prompt: '你是一位溫暖、體貼、充滿活力的舞蹈教室客服專員。你代表我們的品牌給予學員最高規格的關懷，會主動用積極溫暖的詞語（如「哈囉！」「太棒了！🔥」）拉近距離，並條理清晰地回覆學員關於課程費用、請假手續等問題。',
    memory: '教室規則：1. 體驗票限本人使用一次，價格 $450。2. 私人一對一課程單堂 $2,000 / 包堂優惠 10 堂 $18,000。3. 請假需在開課前 2 小時完成線上登記。',
    templates: [
      { name: '💬 回覆初學者體驗課諮詢', raw: '有一位初學者在 IG 詢問：「我沒有任何跳舞經驗，可以報名你們的 Dancehall 體驗課嗎？會不會跟不上？」請生成適合的回覆。' },
      { name: '💵 回覆私人課包堂與報價問題', raw: '學員詢問私人一對一特訓的價格與排課方式，請回覆包堂優惠並導向約課流程。' },
      { name: '⚠️ 回覆學員因故缺席或請假', raw: '學員臨時私訊告知晚上肚子痛不能來上課，希望能請假。請給予關懷並說明請假與補課規定。' }
    ]
  },
  content: {
    name: 'Content Creator Agent',
    icon: '🎬',
    role: '社群內容行銷推手',
    desc: '為 Instagram、TikTok、Threads、YouTube 等社群自動生成爆款 Hook、分鏡腳本與標籤。',
    prompt: '你是一位爆款社群短影音企劃與文案大師。你深諳 Reels / TikTok 演算法，擅長在影片前 3 秒安排強力吸引眼球的 Hook（鉤子），並能把舞蹈技巧轉化為極具觀看價值的教學短片腳本。',
    memory: '熱門標籤：#dancehall #dancehallteacher #dancelife #dancer #choreo #學跳舞 #街舞教學 #短影音劇本',
    templates: [
      { name: '📸 規劃 IG Reels 爆款劇本', raw: '為「一分鐘學會牙買加經典律動 One Drop」設計 Reels 短片腳本，包含分鏡、視覺指令、口播文字以及 Hook 鉤子。' },
      { name: '📘 撰寫 Facebook 走心社群貼文', raw: '寫一篇講述自己從完全不會跳舞，到成為舞蹈老師的「心路歷程」故事貼文，著重情感共鳴。' },
      { name: '🧵 生成 Threads 短文字話題', raw: '設計一個能引發舞蹈圈同好討論與互動的 Thread 短文，例如關於「舞蹈教學最怕遇到哪種情況」。' }
    ]
  },
  marketing: {
    name: 'Marketing Agent',
    icon: '🔥',
    role: '活動行銷策略顧問',
    desc: '規劃暑期工作坊、品牌促銷、廣告文案與漏斗導流策略，提高課程滿班率。',
    prompt: '你是一位舞蹈教室的資深行銷總監。你擅長運用促銷心理學設計吸引人的報名方案，並能撰寫出高轉換率的 Landing Page 文案與 FB 廣告文案。',
    memory: '即將推廣活動：暑期雙人同行限時 85 折「Dancehall 燃脂特訓工作坊」。',
    templates: [
      { name: '🎯 規劃暑期雙人同行工作坊促銷方案', raw: '為八月的「Dancehall 燃脂工作坊」規劃全套行銷策略，包含早鳥優惠、社群裂變機制。' },
      { name: '📢 撰寫 FB 高點擊率廣告文案', raw: '撰寫一則針對「想要塑形、又覺得傳統健身枯燥」的上班族為受眾的舞蹈工作坊招生廣告文案。' }
    ]
  },
  community: {
    name: 'Community Manager Agent',
    icon: '👥',
    role: '班級與社群經理人',
    desc: '生成學生群組公告、學員溫馨提醒、工作坊行前通知，維繫學員向心力。',
    prompt: '你是一位極具向心力的舞蹈社群經理。你的語氣充滿愛與歸屬感，善於在 LINE 群組發布活動通知、上課須知與行前關懷，讓學員感受到滿滿的安全感與凝聚力。',
    memory: '工作坊細節：本週日 14:00 Studio A 進行，需攜帶水壺與乾淨室內鞋，提前 15 分鐘報到。',
    templates: [
      { name: '📢 撰寫週日工作坊行前通知 LINE 公告', raw: '為即將到來的工作坊撰寫一份親切、溫馨的行前準備通知。' },
      { name: '🎂 撰寫學員生日專屬祝賀關懷信', raw: '為本月生日的學員設計一段專屬祝賀訊息，附帶一張免費團體課單堂券作為生日禮。' }
    ]
  },
  business: {
    name: 'Business Assistant',
    icon: '⚙️',
    role: '個人工作室營運秘書',
    desc: '協助起草品牌合作企劃書、教室管理 SOP、會議記錄與活動執行計劃。',
    prompt: '你是一位幹練、專業的商務秘書與營運顧問。你的格式嚴謹，擅長用 Bullet Points 與表格呈現商務企劃書、品牌聯名提案與工作標準作業流程（SOP）。',
    memory: '主要聯名對象：潮流服飾品牌、時尚運動服飾，目標是達成跨界品牌合作。',
    templates: [
      { name: '📋 起草舞蹈工作室與運動品牌聯名企劃案', raw: '撰寫一份 500 字的品牌合作企劃大綱，提議由我們的舞蹈老師穿著該品牌服飾拍攝教學短影片，並在其門市舉辦快閃體驗課。' },
      { name: '🛠️ 設計「舞蹈教室值班小幫手」SOP', raw: '規劃一份兼職員工或值班小幫手的開門、接待學員、下課收尾流程 SOP 清單。' }
    ]
  }
};

// Customer Service Chat Inbox
const mockInbox = {
  'thread-1': {
    id: 'thread-1',
    studentName: 'Emma Lin',
    platform: 'Instagram DM',
    avatar: '👩‍🦰',
    snippet: '請問下週三的 Dancehall 入門課還有名額嗎？',
    studentInfo: { level: '初學入門', attendance: '92%', payment: '已繳費 (本月季卡)', birthday: '08-15', notes: '對雷鬼舞步有極大興趣，臀部控制律動待加強。' },
    messages: [
      { sender: 'student', text: '哈囉老師！我有看到你最新發布的 Dancehall 影片，真的超級好看！' },
      { sender: 'teacher', text: '哈囉 Emma！謝謝妳的喜歡 🔥 牙買加的雷鬼律動真的非常有魅力喔！' },
      { sender: 'student', text: '想請問一下，下週三晚上的 Dancehall 入門課還有名額可以報名嗎？我朋友也想一起來。' }
    ]
  },
  'thread-2': {
    id: 'thread-2',
    studentName: 'Leo Chen',
    platform: 'LINE Chat',
    avatar: '👨',
    snippet: '老師，不好意思我今天晚上突然要加班，可能要請假...',
    studentInfo: { level: '中階進步', attendance: '60% (連續缺席2次)', payment: '已繳費 (一對一包堂剩3堂)', birthday: '11-02', notes: '上班族加班多，節奏感佳，但最近出席率不穩定。' },
    messages: [
      { sender: 'student', text: '老師，不好意思我今天晚上公司突然要緊急加班，可能要請假一次 😭' }
    ]
  },
  'thread-3': {
    id: 'thread-3',
    studentName: 'Sandy Wang',
    platform: 'Facebook Messenger',
    avatar: '👧',
    snippet: '想諮詢一下一對一私教課怎麼收費？',
    studentInfo: { level: '全新諮詢', attendance: '0%', payment: '未繳費 (未報名過)', birthday: '04-20', notes: '希望在年底婚禮上表演一段 Dancehall 排舞，詢問私教專案。' },
    messages: [
      { sender: 'student', text: '哈囉！我想詢問一下老師的一對一私教課是怎麼收費的？因為年底要結婚，希望有一段雙人排舞的表演。' }
    ]
  }
};

// Student CRM Records
const mockStudents = [
  { name: 'Emma Lin', level: '初學入門', style: 'Dancehall', attendance: '92%', payment: '已繳費', birthday: '08-15', tags: ['愛好者', '基礎加強'] },
  { name: 'Leo Chen', level: '中階進步', style: 'Dancehall / Reggae', attendance: '60%', payment: '已繳費', birthday: '11-02', tags: ['上班族', '缺席兩次'] },
  { name: 'Sandy Wang', level: '全新諮詢', style: 'Dancehall 婚禮排舞', attendance: '0%', payment: '體驗票', birthday: '04-20', tags: ['潛在客', '婚禮需求'] },
  { name: 'Tiffany Chang', level: '高階進階', style: 'Dancehall Choreo', attendance: '96%', payment: '已繳費', birthday: '01-25', tags: ['助教儲備', '音樂性佳'] },
  { name: 'Howard Liu', level: '初學入門', style: 'Dancehall Foundation', attendance: '80%', payment: '未繳費', birthday: '06-12', tags: ['待催繳', '體能需提升'] }
];

// Automation Center Workflows
const mockAutomationFlows = {
  'flow-1': {
    id: 'flow-1',
    name: 'IG DM 智能自動回覆與 CRM 同步',
    trigger: 'Instagram 新小盒子私訊',
    nodes: [
      { type: 'trigger', text: '📢 當有新 Instagram DM 諮詢' },
      { type: 'action', text: '🤖 AI 分析對話意圖與學員情緒' },
      { type: 'action', text: '✍️ 自動調用「Customer Service Agent」擬定草稿' },
      { type: 'action', text: '👥 自動同步對話摘要至 Student CRM 備忘錄' },
      { type: 'action', text: '🟢 透過 LINE 向老師發送高優先通知與建議回覆' }
    ]
  },
  'flow-2': {
    id: 'flow-2',
    name: '學員缺席關懷與補課提醒流程',
    trigger: 'CRM 標記學員缺席',
    nodes: [
      { type: 'trigger', text: '📅 當 CRM 出席狀態更新為「缺席」' },
      { type: 'action', text: '🤖 AI 計算該學員連續缺席次數' },
      { type: 'action', text: '✍️ 調用「Community Manager Agent」產生個人化溫暖關懷語' },
      { type: 'action', text: '📱 自動於 LINE 發送請假確認與預約補課連結' }
    ]
  },
  'flow-3': {
    id: 'flow-3',
    name: '新工作坊報名與金流對帳通知',
    trigger: '收到工作坊 Webhook 報名',
    nodes: [
      { type: 'trigger', text: '💳 當收到報名表單 Webhook 提交' },
      { type: 'action', text: '🤖 AI 自動比對匯款後五碼與金額' },
      { type: 'action', text: '👥 CRM 自動將繳費狀態更新為「已繳費」' },
      { type: 'action', text: '📅 Google 日曆自動同步加入該學員報名格' },
      { type: 'action', text: '📧 自動發送行前準備 Email 公告' }
    ]
  }
};

// Knowledge Base file repository
const mockFiles = [
  { name: 'Dancehall_Foundation_SOP.pdf', size: '2.4 MB', type: 'PDF' },
  { name: '2026_暑期工作坊學員須知_FAQ.docx', size: '1.2 MB', type: 'DOCX' },
  { name: '品牌調性_Tone_And_Voice_指南.txt', size: '45 KB', type: 'TXT' }
];

// Mock Calendar social media posts
const mockSocialPosts = {
  '2026-07-13': [
    { platform: 'Instagram', time: '18:00', title: 'Dancehall排舞精選影片', desc: '週六工作坊高燃排舞片段，搭配 Hook 吸引互動。', plat: 'ig' }
  ],
  '2026-07-15': [
    { platform: 'TikTok', time: '19:00', title: 'Wining臀部基礎教學', desc: '一分鐘內拆解初學者最容易做錯的三個扭臀動作。', plat: 'tiktok' },
    { platform: 'Threads', time: '21:00', title: '關於排舞的肢體力量討論', desc: '提出「動作爆發力到底來自於核心還是放鬆」話題互動。', plat: 'threads' }
  ],
  '2026-07-18': [
    { platform: 'YouTube Shorts', time: '12:00', title: '老師上課日常趣味側拍', desc: '上課時的NG搞笑互動，拉近與粉絲的距離。', plat: 'youtube' }
  ]
};

// ==========================================
// Initialization & Core Tab Switcher
// ==========================================

function switchTab(tabId) {
  activeTab = tabId;

  // Update navigation buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const currentNav = document.getElementById(`nav-${tabId}`);
  if (currentNav) currentNav.classList.add('active');

  // Update page header title
  const tabTitles = {
    dashboard: 'Creator Dashboard',
    agents: 'AI Agents Workspace',
    studio: 'Content Studio',
    chat: 'Customer Service Center',
    social: 'Social Media Manager',
    crm: 'Student CRM Database',
    automation: 'Automation Center',
    knowledge: 'Knowledge Base',
    analytics: 'Analytics Overview',
    settings: 'Personal AI Brain / Settings'
  };
  document.getElementById('current-tab-title').textContent = tabTitles[tabId];

  // Update tab content displays
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) activeContent.classList.add('active');

  // Specific tab initializations
  if (tabId === 'dashboard') {
    renderDashboardLists();
  } else if (tabId === 'agents') {
    initAgentsWorkspace();
  } else if (tabId === 'chat') {
    initChatInbox();
  } else if (tabId === 'social') {
    renderSocialCalendar();
  } else if (tabId === 'crm') {
    renderCrmTable();
  } else if (tabId === 'automation') {
    initAutomations();
  } else if (tabId === 'knowledge') {
    renderKnowledgeFiles();
  } else if (tabId === 'analytics') {
    renderAnalyticsCharts();
  }
}

// ==========================================
// Creator Dashboard Rendering
// ==========================================

function renderDashboardLists() {
  // Today's Schedules
  const schedList = document.getElementById('today-schedules');
  schedList.innerHTML = mockSchedules.map(s => `
    <li>
      <span class="badge badge-success" style="font-size:10px; margin-right:4px;">${s.time}</span>
      <strong>${s.title}</strong>
      <span class="text-muted" style="margin-left:auto; font-size:11px;">📍 ${s.loc} (${s.count})</span>
    </li>
  `).join('');

  // Content Tasks
  const taskList = document.getElementById('today-content-tasks');
  taskList.innerHTML = mockContentTasks.map(t => {
    let statEmoji = '📝';
    if (t.status === 'editing') statEmoji = '🎬';
    if (t.status === 'draft') statEmoji = '💡';
    return `
      <li>
        <span>${statEmoji}</span>
        <span>${t.title}</span>
        <span class="tag-badge" style="margin-left:auto;">${t.due}</span>
      </li>
    `;
  }).join('');

  // Customer Inbox summary
  const inboxList = document.getElementById('today-inbox-preview');
  inboxList.innerHTML = Object.values(mockInbox).map(thread => `
    <li style="cursor:pointer" onclick="switchTab('chat'); selectChatThread('${thread.id}')">
      <span>${thread.avatar}</span>
      <strong>${thread.studentName}</strong>
      <span class="text-muted text-xs" style="margin-left:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px;">${thread.snippet}</span>
      <span class="tag-badge badge-primary" style="margin-left:auto; font-size:9px;">${thread.platform}</span>
    </li>
  `).join('');
}

// ==========================================
// AI Agents Workspace Logic
// ==========================================

function initAgentsWorkspace() {
  const container = document.getElementById('agents-list-container');
  container.innerHTML = Object.entries(mockAgents).map(([id, a]) => `
    <button class="agent-select-btn ${id === activeAgentId ? 'active' : ''}" onclick="switchAgent('${id}')">
      <span class="btn-agent-title">${a.icon} ${a.name}</span>
      <span class="btn-agent-role">${a.role}</span>
    </button>
  `).join('');

  switchAgent(activeAgentId);
}

function switchAgent(agentId) {
  activeAgentId = agentId;
  
  // Highlight active selector
  document.querySelectorAll('.agent-select-btn').forEach(btn => btn.classList.remove('active'));
  // Trigger rendering in workspace
  const agent = mockAgents[agentId];
  
  document.getElementById('active-agent-icon').textContent = agent.icon;
  document.getElementById('active-agent-name').textContent = agent.name;
  document.getElementById('active-agent-desc').textContent = agent.desc;
  document.getElementById('active-agent-prompt').value = agent.prompt;
  document.getElementById('active-agent-memory').value = agent.memory;

  // Load templates dropdown
  const templateSelect = document.getElementById('agent-input-template');
  templateSelect.innerHTML = agent.templates.map((t, idx) => `
    <option value="${idx}">${t.name}</option>
  `).join('');

  onAgentTemplateChange();
}

function onAgentTemplateChange() {
  const agent = mockAgents[activeAgentId];
  const selectIdx = document.getElementById('agent-input-template').value;
  if (agent && agent.templates[selectIdx]) {
    document.getElementById('agent-input-raw').value = agent.templates[selectIdx].raw;
  }
}

function generateAgentOutput() {
  const outputBox = document.getElementById('agent-output-text');
  outputBox.innerHTML = '🤖 AI Agent 正在調用知識庫與 System Prompt 運算中...\n████▒▒▒▒▒▒ 40%';
  
  setTimeout(() => {
    outputBox.innerHTML = '🤖 AI Agent 正在套用個人大腦 Tone & Voice 潤飾中...\n████████▒▒ 80%';
    setTimeout(() => {
      const rawInput = document.getElementById('agent-input-raw').value;
      const agent = mockAgents[activeAgentId];
      
      let finalOutputText = '';
      if (activeAgentId === 'coach') {
        finalOutputText = `【${agent.name} 產出方案】\n\n📌 主題: ${rawInput}\n\n1. 課堂暖身設計 (15 mins):\n   - 呼吸調節與重心沉降配合 (Dancehall 經典 One Drop 踩點準備)。\n   - 髖關節與臀部 Wining 慢速環繞熱身，強化大腿內側肌群與核心穩定性。\n\n2. 基礎動作拆解 (30 mins):\n   - Wining (牙買加臀部畫圓律動) 的三大核心口訣：膝蓋微彎、腹部微收、利用骨盆向上帶起圓弧。\n   - 配合雷鬼樂的 One Drop 和 Steppa 節奏做變速訓練 (60BPM -> 85BPM)。\n\n3. 編舞小品排練 (35 mins):\n   - 結合經典動作的 4 個 Eight Counts 排舞練習。配合 🔥 激情滿點的 Dancehall 音樂，鼓勵同學眼神與面部表情的主動釋放！\n\n4. 課後練習重點與關懷:\n   - 提醒大家對鏡子練習時手部動作配合核心放鬆。\n   - 「跳舞是享受，不要把表情鎖死，給自己一點自信！🔥💃」`;
      } else if (activeAgentId === 'cs') {
        finalOutputText = `【${agent.name} 智能回覆建議】\n\n哈囉！太棒了！🔥 很高興妳對 Dancehall 有興趣！\n\n別擔心！我們的體驗課是專門為完全零基礎的同學設計的喔！課堂上老師會非常詳細地將每一個臀部律動與踏步動作拆解，同學也都是初學者，氣氛非常好、超好玩！大家都可以跟得上喔～💃✨\n\n下週三晚上的課程目前僅剩 3 個名額，體驗課費用單堂是 $450 元。妳跟朋友要不要直接幫妳們保留下週的位置呢？我可以直接幫妳們登記預約喔！❤️`;
      } else if (activeAgentId === 'content') {
        finalOutputText = `【${agent.name} 社群影音腳本】\n\n🔥 Reels / TikTok 標題: 舞蹈小白必看！3 步學會 Dancehall 最性感臀部律動 Wining！\n\n🎬 [0:00 - 0:05] Hook (吸睛畫面)\n- 視覺: 老師穿著潮流服飾，做一段 5 秒超有爆發力的 Wining 展示，眼神對著鏡頭放電。\n- 口播: 「跳 Dancehall 臀部老是扭得很卡？那是因為你少做了這一步！」\n\n🎬 [0:05 - 0:35] Body (教學步驟拆解)\n- 步驟 1: 膝蓋先微彎，把重心沉下去 (建立地基)。\n- 步驟 2: 想像骨盆在畫圓，而不是腰在扭 (避免腰部受傷)。\n- 步驟 3: 音樂踩點時，每一次畫圓都要對準雷鬼重拍！\n\n🎬 [0:35 - 0:50] Call to Action (互動與轉化)\n- 口播: 「學會了嗎？這週三來教室，我帶你直接用音樂感受！趕快點下方連結報名啦！🔥」\n\n🏷️ 推薦標籤: #dancehall #dancehallteacher #dancelife #街舞教學 #雷鬼舞蹈 #短影音劇本`;
      } else {
        finalOutputText = `【${agent.name} 輸出結果】\n\n已成功根據：\n「${rawInput}」\n為您生成適配 Dance Creator OS 品牌語氣風格的完整行銷文案及執行 SOP 文案，並包含預設的 #dancehall 標籤。已準備就緒，您可以直接複製使用！`;
      }
      
      outputBox.innerHTML = finalOutputText;
    }, 800);
  }, 600);
}

function copyAgentOutputText() {
  const text = document.getElementById('agent-output-text').textContent;
  navigator.clipboard.writeText(text);
  alert('已複製 Agent 生成結果！');
}

// ==========================================
// Content Studio Logic
// ==========================================

const mockStudioOutputs = {
  instagram: {
    title: 'Instagram Reels',
    text: `【🎬 IG Reels 短影音劇本】\n\n📌 影片主題：初學者必學 Dancehall 臀部律動技巧\n🔥 3秒黃金Hook: 「跳舞扭屁股總是看起來像肚子痛？因為你用錯發力點了！」\n\n🎥 畫面分鏡：\n1. [0-3s] 老師示範高爆發力的 Wining 動作，搭配節奏雷鬼音樂。\n2. [3-20s] 側面鏡頭拆解：膝蓋彎曲 -> 骨盆向上提拉 -> 後推畫圓。\n3. [20-45s] 正面踩點雷鬼節奏 (One Drop) 慢速到快速。\n\n✍️ 貼文 Caption:\n跳 Dancehall 的性感靈魂來自於臀部律動！Wining 畫圓其實是用核心跟大腿發力喔！這篇快點收藏起來練，這週三晚上課堂我帶你實際踩點節奏！🔥💃\n\n🏷️ Hashtags:\n#dancehall #wining #dancelife #街舞教學 #雷鬼舞蹈 #ReelsChoreo`
  },
  tiktok: {
    title: 'TikTok Video',
    text: `【🎵 TikTok 影音腳本】\n\n📌 影片主題：3步學會牙買加經典 Wining 律動\n🔥 爆點Hook: 「別再瞎扭了！牙買加雷鬼舞老師教你3步學會最正宗的 Wining 臀部律動！」\n\n🎥 畫面分鏡：\n1. 快速切入：直接把錯誤動作與正確動作放在一起比對 (錯誤: 腰部過度用力 vs 正確: 核心帶動)。\n2. 節奏拆解：拍子1屈膝、拍子2骨盆提起、拍子3順滑畫圓。\n3. 快嘴口播，搭配流行雷鬼背景音。\n\n🏷️ Hashtags:\n#dancehallstyle #winingtutorial #dancer #學跳舞 #街舞教學 #TikTok舞蹈`
  },
  youtube: {
    title: 'YouTube Shorts',
    text: `【🎥 YouTube Shorts 腳本】\n\n📌 主題：牙買加 Dancehall 基礎律動\n🔥 Hook: 「一分鐘改善你跳舞僵硬的問題！Dancehall 核心律動練習！」\n\n🎥 畫面分鏡：\n- 老師特寫示範腰部與大腿的核心發力，並用箭頭後製標註力量流向。\n- 結尾加入大字卡「訂閱我的頻道，每週五更新舞蹈動作教學！」\n\n✍️ 說明欄文案:\n如果你想提升舞蹈的流暢感與律動性，Dancehall 是最好的練習風格。歡迎加入這週工作坊特訓！\n\n🏷️ Hashtags:\n#shorts #dancehall #dancetutorial #雷鬼舞步 #核心訓練`
  },
  threads: {
    title: 'Threads Topic',
    text: `【🧵 Threads 熱門討論】\n\n有沒有人也覺得，跳 Dancehall 臀部畫圓（Wining）的時候，最難的不是腰部用不用力，而是你能不能在滿堂的鏡子前面放開自我、不要覺得尷尬？😂\n\n很多學員一開始都卡在心魔，其實大家都在看老師，根本沒人在看你啦！放膽扭下去就對了！\n\n今天晚上課堂見，今晚誰要來？在下面留個 🔥 讓我知道！👇`
  }
};

function generateStudioScripts() {
  const style = document.getElementById('studio-style').value;
  const topic = document.getElementById('studio-topic').value;
  const idea = document.getElementById('studio-idea').value;

  const textContent = document.getElementById('studio-mockup-text-content');
  textContent.textContent = '🎬 AI 正在為您串接跨平台發布格式，產生中...';

  setTimeout(() => {
    // Dynamically enrich mock texts based on input
    mockStudioOutputs.instagram.text = `【🎬 IG Reels 短影音劇本】\n\n📌 影片主題：${topic}\n🕺 風格：${style}\n🔥 3秒黃金Hook: 「大家都想跳好${style}，但90%的人動作都做錯了！」\n\n🎥 畫面分鏡：\n1. [0-3s] 配合極富張力的動作點展現 ${topic} 的震撼力。\n2. [3-25s] ${idea || '分步驟細緻拆解動作發力，強調肢體控制'}\n3. [25-50s] 老師帶領學員配合節奏進行實練展示。\n\n✍️ 貼文 Caption:\n今天跟著影片做一次，保證讓你突破舞蹈瓶頸！想要更系統化進步，歡迎點個人檔案連結報名最新的一對一私教班！🔥\n\n🏷️ Hashtags:\n#dancehall #${style.toLowerCase().replace(/\s+/g, '')} #choreo #學跳舞 #影音劇本`;
    
    switchStudioPreviewPlatform(activeStudioPlatform);
  }, 1000);
}

function switchStudioPreviewPlatform(platform) {
  activeStudioPlatform = platform;
  
  // Update active tab buttons
  document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
  const currentTab = document.getElementById(`stab-${platform}`);
  if (currentTab) currentTab.classList.add('active');

  // Load preview copy
  const data = mockStudioOutputs[platform];
  document.getElementById('studio-mockup-title').textContent = data.title;
  document.getElementById('studio-mockup-text-content').textContent = data.text;
}

function copyStudioScriptText() {
  const text = document.getElementById('studio-mockup-text-content').textContent;
  navigator.clipboard.writeText(text);
  alert('已複製當前平台的影音腳本文案！');
}

function scheduleStudioScript() {
  alert('已將此影音腳本儲存為草稿，並同步發送至 Social Media Manager 發布行事曆！');
  switchTab('social');
}

// ==========================================
// Customer Service Center Logic
// ==========================================

function initChatInbox() {
  const container = document.getElementById('chat-thread-list-container');
  container.innerHTML = Object.values(mockInbox).map(thread => `
    <div class="chat-thread-item ${thread.id === activeChatThreadId ? 'active' : ''}" onclick="selectChatThread('${thread.id}')">
      <div class="chat-thread-header">
        <span>${thread.avatar} ${thread.studentName}</span>
        <span class="chat-thread-plat">${thread.platform}</span>
      </div>
      <div class="chat-thread-snippet">${thread.snippet}</div>
    </div>
  `).join('');

  selectChatThread(activeChatThreadId);
}

function selectChatThread(threadId) {
  activeChatThreadId = threadId;
  
  // Highlight active selector
  document.querySelectorAll('.chat-thread-item').forEach(item => item.classList.remove('active'));
  
  const thread = mockInbox[threadId];
  if (!thread) return;

  // Render chat messages
  const msgBody = document.getElementById('chat-messages-body');
  msgBody.innerHTML = thread.messages.map(m => `
    <div class="chat-message ${m.sender}">
      ${m.text}
    </div>
  `).join('');

  // Scroll to bottom
  msgBody.scrollTop = msgBody.scrollHeight;

  // Render CRM mini-card
  document.getElementById('c-name').textContent = thread.studentName;
  document.getElementById('c-level').textContent = thread.studentInfo.level;
  document.getElementById('c-attendance').textContent = thread.studentInfo.attendance;
  document.getElementById('c-payment').textContent = thread.studentInfo.payment;

  // Generate initial recommended reply
  regenerateAICopilotReply();
}

function sendUserChatMessage() {
  const inputBox = document.getElementById('chat-input-box');
  const text = inputBox.value.trim();
  if (!text) return;

  const thread = mockInbox[activeChatThreadId];
  if (!thread) return;

  // Push user message
  thread.messages.push({ sender: 'teacher', text });
  inputBox.value = '';

  // Render
  selectChatThread(activeChatThreadId);

  // Automatically trigger a mock customer response after 1.5 seconds
  setTimeout(() => {
    thread.messages.push({ sender: 'student', text: '好的，謝謝老師！那我把我的聯絡電話跟本名私訊留給您。' });
    selectChatThread(activeChatThreadId);
  }, 1500);
}

function regenerateAICopilotReply() {
  const replyBody = document.getElementById('ai-recommended-reply-body');
  replyBody.textContent = '🤖 AI 正在根據該學員的 CRM 檔案特徵生成最佳對話建議...';

  setTimeout(() => {
    const thread = mockInbox[activeChatThreadId];
    let reply = '';
    if (activeChatThreadId === 'thread-1') {
      reply = `哈囉 Emma！太棒了！🔥 很高興妳對 Dancehall 有興趣！下週三晚上的入門課非常適合零基礎的同學，目前還有名額。體驗課一堂是 $450，我可以直接幫妳跟妳朋友保留兩個位置嗎？❤️`;
    } else if (activeChatThreadId === 'thread-2') {
      reply = `Leo 沒問題，工作辛苦了！保重身體，多喝水休息喔！今天的課程我會幫你登記請假，我們下堂課再見，加油！🔥`;
    } else {
      reply = `哈囉 Sandy！恭喜妳即將步入禮堂！這真的太美好了 😭💍 我們的一對一私教包堂是 10 堂 $18,000 元，老師會為你們的婚禮音樂專屬編舞、做動作修改，時間也可以完全彈性配合你們的行程喔！需要為您預約一次 30 分鐘的線上諮詢溝通嗎？`;
    }
    replyBody.textContent = reply;
  }, 800);
}

function applyCopilotReply() {
  const text = document.getElementById('ai-recommended-reply-body').textContent;
  if (text.startsWith('🤖')) return;
  document.getElementById('chat-input-box').value = text;
}

function modifyCopilotTone(tone) {
  const replyBody = document.getElementById('ai-recommended-reply-body');
  const currentText = replyBody.textContent;
  if (currentText.startsWith('🤖')) return;

  replyBody.textContent = '🤖 AI 正在調整語氣與字數...';
  
  setTimeout(() => {
    if (tone === 'warmer') {
      replyBody.textContent = `親愛的 ❤️！${currentText.replace('哈囉', '哈囉寶貝').replace('！', '！🥰✨')}`;
    } else if (tone === 'shorter') {
      replyBody.textContent = currentText.substring(0, 45) + '... 直接幫您登記好嗎？✨';
    }
  }, 600);
}

// ==========================================
// Student CRM Database Logic
// ==========================================

function renderCrmTable() {
  const tbody = document.getElementById('crm-table-body');
  tbody.innerHTML = mockStudents.map((s, idx) => {
    let payClass = 'badge-success';
    if (s.payment === '未繳費') payClass = 'badge-warning';
    if (s.payment === '體驗票') payClass = 'badge-primary';

    return `
      <tr>
        <td class="font-bold">${s.name}</td>
        <td><span class="tag-badge badge-primary">${s.level}</span></td>
        <td>${s.style}</td>
        <td>${s.attendance}</td>
        <td><span class="tag-badge ${payClass}">${s.payment}</span></td>
        <td>${s.birthday}</td>
        <td>${s.tags.map(t => `<span class="tag-badge" style="margin-right:4px;">${t}</span>`).join('')}</td>
        <td>
          <button class="btn btn-secondary btn-xs" onclick="selectCrmStudent(${idx})">📊 分析</button>
        </td>
      </tr>
    `;
  }).join('');

  // Update AI Strategy selector
  const selector = document.getElementById('crm-ai-student-select');
  selector.innerHTML = mockStudents.map((s, idx) => `
    <option value="${idx}">${s.name} (${s.level})</option>
  `).join('');
}

function selectCrmStudent(idx) {
  document.getElementById('crm-ai-student-select').value = idx;
  generateStudentCrmStrategy();
}

function generateStudentCrmStrategy() {
  const idx = document.getElementById('crm-ai-student-select').value;
  const student = mockStudents[idx];
  const outputBox = document.getElementById('crm-ai-output-body');

  outputBox.textContent = `🤖 AI 正在比對 ${student.name} 的出席率與教學備忘錄，擬定關懷計畫...`;

  setTimeout(() => {
    let strategy = `【${student.name} 的 AI 專屬關懷策略建議】\n`;
    strategy += `1. 情況分析：出席率 ${student.attendance}，目前狀態為 [${student.payment}]。\n`;
    strategy += `2. 痛點診斷：${student.tags.join(', ')}。應針對學員的個人特徵給予具體回饋。\n\n`;
    strategy += `3. 推薦 LINE 行動訊息模板（一鍵複製）：\n`;
    
    if (student.attendance.replace('%', '') < 80) {
      strategy += `「嗨 ${student.name}，最近工作還順利嗎？🥰 老師有注意到你最近兩堂課缺席了，是不是上班太累了呀？跳舞是釋放壓力的好方法，這週日有一堂超好玩的基礎律動，要不要幫你預留一個位置來動一動、放鬆一下呢？❤️💃」`;
    } else {
      strategy += `「嗨 ${student.name}！最近看你上課的臀部律動控制力越來越穩定了耶，真的進步超多！🔥 老師建議你這週可以在家多做 5 分鐘的大腿核心肌肉啟動，下堂課編舞小品我們來挑戰變速跳法，加油！✨💪」`;
    }
    outputBox.textContent = strategy;
  }, 800);
}

function openNewStudentModal() {
  document.getElementById('new-student-modal').classList.remove('hidden');
}

function closeNewStudentModal() {
  document.getElementById('new-student-modal').classList.add('hidden');
}

function saveNewStudent() {
  const name = document.getElementById('ns-name').value;
  const level = document.getElementById('ns-level').value;
  const style = document.getElementById('ns-style').value;
  const attendance = document.getElementById('ns-attendance').value;
  const payment = document.getElementById('ns-payment').value;
  const birthday = document.getElementById('ns-birthday').value;
  const tagsRaw = document.getElementById('ns-tags').value;

  if (!name) {
    alert('請輸入學員姓名！');
    return;
  }

  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : [];

  mockStudents.push({ name, level, style, attendance, payment, birthday, tags });
  closeNewStudentModal();
  renderCrmTable();
}

// ==========================================
// Automation Center Logic
// ==========================================

function initAutomations() {
  const container = document.getElementById('automation-flows-container');
  container.innerHTML = Object.values(mockAutomationFlows).map(flow => `
    <div class="flow-item ${flow.id === activeFlowId ? 'active' : ''}" onclick="selectAutomationFlow('${flow.id}')">
      <div class="flow-item-meta">
        <h4>${flow.name}</h4>
        <p>觸發條件：${flow.trigger}</p>
      </div>
      <span class="badge badge-success" style="font-size:10px;">已啟用</span>
    </div>
  `).join('');

  selectAutomationFlow(activeFlowId);
}

function selectAutomationFlow(flowId) {
  activeFlowId = flowId;
  document.querySelectorAll('.flow-item').forEach(item => item.classList.remove('active'));
  
  const flow = mockAutomationFlows[flowId];
  if (!flow) return;

  const visualizer = document.getElementById('workflow-visualizer-nodes');
  visualizer.innerHTML = flow.nodes.map((node, idx) => {
    const connector = idx < flow.nodes.length - 1 ? '<div class="flow-node-connector"></div>' : '';
    const nodeClass = node.type === 'trigger' ? 'node-trigger' : 'node-action';
    return `
      <div class="flow-node ${nodeClass}">
        ${node.text}
      </div>
      ${connector}
    `;
  }).join('');
}

function triggerTestWorkflowRun() {
  alert('💡 已成功觸發工作流測試運行！\n系統成功調用 Webhook，自動向您的測試 LINE 帳號發送了推薦回覆與學員 CRM 變更卡片。');
}

// ==========================================
// RAG & Knowledge Base Logic
// ==========================================

function renderKnowledgeFiles() {
  const container = document.getElementById('knowledge-files-list');
  container.innerHTML = mockFiles.map(f => `
    <li class="file-item">
      <span class="file-item-name">📄 ${f.name}</span>
      <span class="file-item-size">${f.size} (${f.type})</span>
    </li>
  `).join('');
}

function triggerFileInputClick() {
  document.getElementById('knowledge-file-input').click();
}

function handleMockFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  mockFiles.push({
    name: file.name,
    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    type: file.name.split('.').pop().toUpperCase()
  });

  renderKnowledgeFiles();
  alert(`成功上傳並學習檔案：${file.name}！\nAI 知識庫大腦已將其向量化並錄入 RAG 資料夾。`);
}

function queryRagDatabase() {
  const query = document.getElementById('rag-query').value.trim();
  const output = document.getElementById('rag-output-body');
  if (!query) return;

  output.textContent = '🔍 正在比對向量相似度並提取 PDF/Word 知識庫段落中...';

  setTimeout(() => {
    let ans = '';
    if (query.includes('請假') || query.includes('缺席')) {
      ans = `【🔍 檢索自：2026_暑期工作坊學員須知_FAQ.docx】\n\n「若學員因故無法出席，需於開課前 2 小時透過 LINE 線上請假系統提交申請。請假成功後，可於三個月內預約同等級之團體課進行補課。逾期未請假者視同放棄上課資格，不予補課或退費。」`;
    } else if (query.includes('雷鬼') || query.includes('Dancehall')) {
      ans = `【🔍 檢索自：Dancehall_Foundation_SOP.pdf】\n\n「Dancehall 基礎動作大綱包含：Wining, One Drop, Steppa, Log On。暖身時應著重於骨盆環繞、胸腔隔離與下肢力量爆發訓練。動作要領在於重心沈降，呼吸與大腿核心的連貫配合。」`;
    } else {
      ans = `【🔍 檢索自知識庫大腦】\n\n「針對您詢問的：『${query}』，已在品牌 Tone & Voice 指南中找到相符敘述。建議使用『鼓勵、充滿活力、搭配大量跳舞表情符號 🔥💃』的風格為學員解答。」`;
    }
    output.textContent = ans;
  }, 1000);
}

// ==========================================
// Analytics Charts Rendering (Pure CSS Bar animations)
// ==========================================

function renderAnalyticsCharts() {
  // Mock growth chart
  const growthContainer = document.getElementById('analytics-growth-chart');
  const growthData = [
    { label: 'Instagram', val: '80%', display: '+2,450 粉絲' },
    { label: 'TikTok', val: '95%', display: '+3,820 粉絲' },
    { label: 'Threads', val: '60%', display: '+1,120 粉絲' },
    { label: 'YouTube', val: '45%', display: '+450 訂閱' }
  ];
  
  growthContainer.innerHTML = growthData.map(d => `
    <div class="chart-bar-item">
      <span class="chart-bar-label">${d.label}</span>
      <div class="chart-bar-container">
        <div class="chart-bar-fill" style="width: ${d.val}; background: linear-gradient(90deg, #F53D2D 0%, #F8D06E 100%);"></div>
      </div>
      <span class="chart-bar-val">${d.display}</span>
    </div>
  `).join('');

  // Mock revenue chart
  const revContainer = document.getElementById('analytics-revenue-chart');
  const revData = [
    { label: '團體團課', val: '75%', display: '$117,000' },
    { label: '一對一私教', val: '55%', display: '$36,000' },
    { label: '工作坊門票', val: '30%', display: '$18,000' },
    { label: '周邊商品', val: '15%', display: '$4,500' }
  ];

  revContainer.innerHTML = revData.map(d => `
    <div class="chart-bar-item">
      <span class="chart-bar-label">${d.label}</span>
      <div class="chart-bar-container">
        <div class="chart-bar-fill" style="width: ${d.val}; background: linear-gradient(90deg, #10B981 0%, #3B82F6 100%);"></div>
      </div>
      <span class="chart-bar-val">${d.display}</span>
    </div>
  `).join('');
}

function generateWeeklyAnalyticsReport() {
  const reportBody = document.getElementById('analytics-report-body');
  reportBody.textContent = '🤖 AI 正在彙整本週社群轉換數據、私教回購率與營業額，產生分析中...';

  setTimeout(() => {
    reportBody.innerHTML = `<h3>📊 Dance Creator OS 週度營運改善建議 (2026/07/14)</h3>
<p><b>本週核心觀察：</b>本月團體課報名率已達 85% 歷史新高，但一對一私教課程回購率較上月下滑了 8%。主要原因在於部分學員（如 Leo Chen 等）由於加班頻繁缺席，進而延長了包堂消耗週期。</p>

<h4>💡 本週改善方針：</h4>
<ul>
  <li><b>私教靈活排課制</b>：針對常加班的上班族學員，主動推送「週末清晨/深夜彈性預約時段」，降低請假流失率。</li>
  <li><b>內容裂變行銷</b>：TikTok 粉絲增長迅速（本月+95%），應善加利用「TikTok 基礎律動教學影音」向本地舞蹈教室進行導流，提供專屬的「線下首堂體驗票 $450」折扣碼。</li>
  <li><b>主打風格聚焦</b>：數據顯示，包含 <b>Dancehall Wining</b> 的影片互動率比一般編舞排舞影片高出 42%，建議下週多產出該風格短影音。</li>
</ul>`;
  }, 1200);
}

// ==========================================
// Settings & System Save
// ==========================================

function saveSystemSettings() {
  const style = document.getElementById('set-style').value;
  const tone = document.getElementById('set-tone').value;
  const service = document.getElementById('set-service').value;

  // Update in-memory models
  mockAgents.coach.memory = `舞蹈風格偏好：${style}。寫作語氣：${tone}。`;
  mockAgents.cs.memory = `客戶回覆原則：${service}`;

  alert('💾 成功將個人大腦設定儲存至 Dance Creator OS！\n所有專屬 AI Agents 的 System Prompt 與背景記憶體皆已完成無縫熱更新。');
}

// ==========================================
// Social Media Manager Calendar Rendering
// ==========================================

function renderSocialCalendar() {
  const gridBody = document.getElementById('social-calendar-grid-body');
  const monthYearLabel = document.getElementById('social-calendar-month-year');
  gridBody.innerHTML = '';

  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  monthYearLabel.textContent = `${currentYear} 年 ${months[currentMonth]}`;

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let adjustedFirstDay = firstDayIndex - 1;
  if (adjustedFirstDay < 0) adjustedFirstDay = 6; // Sunday becomes index 6

  // Empty padding cells
  for (let i = 0; i < adjustedFirstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    gridBody.appendChild(emptyCell);
  }

  // Active day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dayCell.onclick = () => openSocialCalendarDayModal(dayStr, day);

    dayCell.innerHTML = `<span class="day-number">${day}</span>`;

    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'calendar-events-container';

    if (mockSocialPosts[dayStr]) {
      mockSocialPosts[dayStr].forEach((ev) => {
        const evDiv = document.createElement('div');
        let platClass = 'smart';
        if (ev.plat === 'ig') platClass = 'ig';
        else if (ev.plat === 'fb') platClass = 'fb';
        else if (ev.plat === 'threads') platClass = 'threads';
        else if (ev.plat === 'tiktok') platClass = 'threads'; // Styled similarly or customized
        else if (ev.plat === 'youtube') platClass = 'smart'; 
        
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

function openSocialCalendarDayModal(dateStr, dayNum) {
  const modal = document.getElementById('event-modal');
  document.getElementById('modal-day-num').value = dateStr;
  
  const titleInput = document.getElementById('modal-post-title');
  const timeInput = document.getElementById('modal-post-time');
  const platformSelect = document.getElementById('modal-post-platform');
  const descTextarea = document.getElementById('modal-post-desc');

  if (mockSocialPosts[dateStr] && mockSocialPosts[dateStr].length > 0) {
    const ev = mockSocialPosts[dateStr][0];
    document.getElementById('modal-title').textContent = `${dateStr} 排程內容`;
    titleInput.value = ev.title;
    timeInput.value = ev.time;
    platformSelect.value = ev.platform;
    descTextarea.value = ev.desc;
  } else {
    document.getElementById('modal-title').textContent = `${dateStr} 新增排程內容`;
    titleInput.value = 'AI 推薦短影音發布';
    timeInput.value = '18:00';
    platformSelect.value = 'Instagram';
    descTextarea.value = '請輸入或貼上影音文案內容...';
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

  let plat = 'ig';
  if (platform === 'TikTok') plat = 'tiktok';
  if (platform === 'Facebook') plat = 'fb';
  if (platform === 'Threads') plat = 'threads';
  if (platform === 'YouTube Shorts') plat = 'youtube';

  mockSocialPosts[dateStr] = [{ title, time, platform, desc, plat }];
  closeModal();
  renderSocialCalendar();
}

function deleteModalEvent() {
  const dateStr = document.getElementById('modal-day-num').value;
  if (mockSocialPosts[dateStr]) {
    delete mockSocialPosts[dateStr];
  }
  closeModal();
  renderSocialCalendar();
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  if (activeTab === 'social') {
    renderSocialCalendar();
  }
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  if (activeTab === 'social') {
    renderSocialCalendar();
  }
}

// Quick Actions Mapper from Dashboard
function quickAction(actionId) {
  if (actionId === 'dancehall-reels') {
    switchTab('studio');
    document.getElementById('studio-style').value = 'Dancehall (牙買加雷鬼舞)';
    document.getElementById('studio-topic').value = '初學者必練 3 個性感的 Wining 擺臀動作';
    document.getElementById('studio-idea').value = '強調核心發力，不單純是用腰，避免扭傷。前3秒是老師排舞示範。';
    generateStudioScripts();
  } else if (actionId === 'tiktok-script') {
    switchTab('studio');
    document.getElementById('studio-style').value = 'Dancehall Choreo';
    document.getElementById('studio-topic').value = '快速學會雷鬼街頭步 Log On';
    document.getElementById('studio-idea').value = '節奏踩點、側向踏步、手部動作同步搭配。適合 TikTok 快速合拍。';
    generateStudioScripts();
  } else if (actionId === 'lesson-plan') {
    switchTab('agents');
    switchAgent('coach');
    document.getElementById('agent-input-template').value = 0;
    onAgentTemplateChange();
  } else if (actionId === 'workshop-promo') {
    switchTab('agents');
    switchAgent('marketing');
    document.getElementById('agent-input-template').value = 0;
    onAgentTemplateChange();
  } else if (actionId === 'reply-student-leo') {
    switchTab('chat');
    selectChatThread('thread-2');
  }
}

// ==========================================
// Page Load Initializer
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  switchTab('dashboard');
});

// Expose all functions to global window scope to prevent Vite tree-shaking
window.switchTab = switchTab;
window.quickAction = quickAction;
window.switchAgent = switchAgent;
window.onAgentTemplateChange = onAgentTemplateChange;
window.generateAgentOutput = generateAgentOutput;
window.copyAgentOutputText = copyAgentOutputText;
window.generateStudioScripts = generateStudioScripts;
window.switchStudioPreviewPlatform = switchStudioPreviewPlatform;
window.copyStudioScriptText = copyStudioScriptText;
window.scheduleStudioScript = scheduleStudioScript;
window.selectChatThread = selectChatThread;
window.sendUserChatMessage = sendUserChatMessage;
window.regenerateAICopilotReply = regenerateAICopilotReply;
window.applyCopilotReply = applyCopilotReply;
window.modifyCopilotTone = modifyCopilotTone;
window.selectCrmStudent = selectCrmStudent;
window.generateStudentCrmStrategy = generateStudentCrmStrategy;
window.openNewStudentModal = openNewStudentModal;
window.closeNewStudentModal = closeNewStudentModal;
window.saveNewStudent = saveNewStudent;
window.selectAutomationFlow = selectAutomationFlow;
window.triggerTestWorkflowRun = triggerTestWorkflowRun;
window.triggerFileInputClick = triggerFileInputClick;
window.handleMockFileUpload = handleMockFileUpload;
window.queryRagDatabase = queryRagDatabase;
window.generateWeeklyAnalyticsReport = generateWeeklyAnalyticsReport;
window.saveSystemSettings = saveSystemSettings;
window.prevMonth = prevMonth;
window.nextMonth = nextMonth;
window.closeModal = closeModal;
window.saveModalEvent = saveModalEvent;
window.deleteModalEvent = deleteModalEvent;
