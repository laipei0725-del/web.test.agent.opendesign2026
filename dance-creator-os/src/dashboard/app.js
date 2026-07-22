import { supabase } from '../shared/supabase.js';
import { eventBus } from '../shared/event-bus.js';

// Application Local State
const state = {
  activeTab: 'dashboard',
  students: [],
  courses: [],
  sales: [],
  chatThreads: [
    {
      id: 'emma-line',
      name: '林艾瑪 (Emma)',
      channel: 'LINE 官方帳號',
      avatar: '👩',
      lastMessage: '我想預約今天下午兩點的雷鬼基礎班...',
      time: '14:10',
      phone: '0912-345-678',
      email: 'emma.lin@test.com',
      points: '剩餘 6 堂',
      attendance: '92%',
      level: '基礎/入門',
      notes: '學習熱情很高，雷鬼律動抓得不錯，著重核心律動。對編舞班表示有興趣。'
    }
  ],
  activeThreadId: 'emma-line'
};

// DOM Elements & Routing
function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Hide all sections
  document.querySelectorAll('main > div > section').forEach(sec => sec.classList.add('hidden'));
  // Show target
  const activeSec = document.getElementById(`tab-${tabId}`);
  if (activeSec) activeSec.classList.remove('hidden');

  // Update sidebar buttons
  document.querySelectorAll('aside nav button').forEach(btn => {
    btn.className = 'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-gray-400 hover:bg-white/5 hover:text-white';
  });
  
  const activeBtn = document.getElementById(`nav-${tabId}`);
  if (activeBtn) {
    activeBtn.className = 'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all bg-white/5 border border-white/10 text-white shadow-sm';
  }

  // Update top header label
  const labels = {
    dashboard: 'Creator Dashboard',
    chat: 'Customer Service Hub',
    crm: 'Student CRM',
    settings: 'System Settings'
  };
  document.getElementById('current-tab-label').textContent = labels[tabId] || tabId;
}

// Fetch stats and lists from Supabase
async function refreshDashboardData() {
  try {
    // 1. Fetch Students
    const { data: students, error: err1 } = await supabase.from('students').select('*');
    if (err1) throw err1;
    state.students = students || [];

    // 2. Fetch Courses
    const { data: courses, error: err2 } = await supabase.from('courses').select('*');
    if (err2) throw err2;
    state.courses = courses || [];

    // 3. Fetch Sales
    const { data: sales, error: err3 } = await supabase.from('sales').select('*');
    if (err3) throw err3;
    state.sales = sales || [];

    renderDashboardKPIs();
    renderCRMList();
    renderClassSchedule();
  } catch (err) {
    console.error('Failed to load database state:', err);
  }
}

// Render values into DOM
function renderDashboardKPIs() {
  // Sum revenue
  const totalRev = state.sales.reduce((sum, item) => sum + (item.amount || 0), 0);
  document.getElementById('kpi-revenue').textContent = `NT$ ${totalRev.toLocaleString()}`;

  // Count active students
  document.getElementById('kpi-students').textContent = `${state.students.length} 人`;

  // Count courses
  document.getElementById('kpi-courses').textContent = `${state.courses.length} 門`;
}

function renderCRMList() {
  const tableBody = document.getElementById('crm-table-body');
  if (!tableBody) return;

  if (state.students.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-gray-500">無學員資料</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = state.students.map(s => `
    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
      <td class="p-4 font-bold">${s.name}</td>
      <td class="p-4">${s.phone || '--'}</td>
      <td class="p-4">${s.email || '--'}</td>
      <td class="p-4 text-brand-cyan font-bold">${s.points_remaining || 0} 堂</td>
      <td class="p-4">${s.attendance_rate || 100}%</td>
      <td class="p-4">
        <span class="px-2 py-0.5 rounded text-[10px] ${s.points_remaining > 0 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}">
          ${s.points_remaining > 0 ? '正常' : '已到期'}
        </span>
      </td>
    </tr>
  `).join('');
}

function renderClassSchedule() {
  const schedBox = document.getElementById('today-class-schedule');
  if (!schedBox) return;

  if (state.courses.length === 0) {
    schedBox.innerHTML = `
      <div class="p-4 text-center text-xs text-gray-500">今日無排定課程</div>
    `;
    return;
  }

  schedBox.innerHTML = state.courses.map(c => `
    <div class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
      <div>
        <span class="badge bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan px-2 py-0.5 rounded text-[10px] font-bold">${c.time_slot}</span>
        <strong class="text-sm block mt-1">${c.title}</strong>
      </div>
      <div class="text-right">
        <span class="text-xs text-gray-400 block">${c.location}</span>
        <span class="text-xs text-white font-semibold">${c.student_count || 0} 人已約課</span>
      </div>
    </div>
  `).join('');
}

// Chat Interactions
function sendChatReply() {
  const inputEl = document.getElementById('chat-input-text');
  const text = inputEl.value.trim();
  if (!text) return;

  // Add message bubble to DOM
  const container = document.getElementById('chat-messages-container');
  const bubble = document.createElement('div');
  bubble.className = 'flex items-start gap-3 max-w-[80%] self-end flex-row-reverse';
  bubble.innerHTML = `
    <span class="text-2xl mt-1">😎</span>
    <div class="bg-gradient-to-r from-brand-pink/25 via-brand-blue/25 to-brand-cyan/25 border border-white/10 p-3 rounded-2xl text-xs leading-relaxed text-gray-200">
      ${text}
    </div>
  `;
  container.appendChild(bubble);
  inputEl.value = '';
  
  // Auto scroll
  container.scrollTop = container.scrollHeight;
}

function applyCopilotReply() {
  const copilotText = document.getElementById('ai-suggested-reply').textContent.trim();
  document.getElementById('chat-input-text').value = copilotText;
}

function saveSettings() {
  const style = document.getElementById('set-style').value;
  const tone = document.getElementById('set-tone').value;
  
  localStorage.setItem('dance-copilot-style', style);
  localStorage.setItem('dance-copilot-tone', tone);

  alert('💾 成功儲存 AI 教學大腦與金流設定！');
}

// Event Listeners initialization
window.addEventListener('DOMContentLoaded', () => {
  refreshDashboardData();

  // Listen to realtime updates via Supabase
  supabase
    .channel('schema-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => {
      refreshDashboardData();
    })
    .subscribe();
});

// Export functions to window scope for HTML triggers
window.switchTab = switchTab;
window.refreshDashboardData = refreshDashboardData;
window.sendChatReply = sendChatReply;
window.applyCopilotReply = applyCopilotReply;
window.saveSettings = saveSettings;
export { switchTab, refreshDashboardData };
