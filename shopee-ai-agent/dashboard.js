// ==========================================
// Dance Creator OS - SaaS Architecture Core
// ==========================================

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = 'https://kremauxwtwobmbjwbzzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZW1hdXh3dHdvYm1iandienpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0ODYxMTAsImV4cCI6MjA5OTA2MjExMH0.smMJiEQ4n7qr5tpmR54EXPPMNakt1rM1ZM-pw4s5ABw';
const supabase = createClient(supabaseUrl, supabaseKey);

// Global States
let activeTab = 'dashboard';
let currentYear = 2026;
let currentMonth = 6; // July (0-indexed)
let activeAgentId = 'coach';
let activeStudioPlatform = 'instagram';
let activeChatThreadId = 'thread-1';
let activeFlowId = 'flow-1';
let activeSocialView = 'calendar';

// ==========================================
// Global Event Bus
// ==========================================
const EventBus = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  emit(event, data) {
    console.log(`[EventBus] Emit: ${event}`, data);
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
    // Automatically trigger dashboard calculations refresh on any event
    if (event !== 'dashboard.refresh') {
      this.emit('dashboard.refresh', data);
    }
  }
};

// ==========================================
// Global Application State (AppState)
// ==========================================
const AppState = {
  students: [],
  courses: [],
  events: [],
  payments: [],
  contents: [],
  customers: [],
  aiTasks: [],
  notifications: [],
  analytics: {},
  settings: {}
};

// ==========================================
// Decoupled SaaS Modules
// ==========================================

const StudentModule = {
  async load() {
    const { data, error } = await supabase.from('students').select('*').order('name');
    if (error) throw error;
    AppState.students = data || [];
  },
  async create(student) {
    const { data, error } = await supabase.from('students').insert([student]).select();
    if (error) throw error;
    EventBus.emit('student.created', data[0]);
    
    // Auto-create notification
    await NotificationModule.createNotification({
      title: '👥 新學員註冊 (New Registration)',
      message: `學員 ${data[0].name} 已加入 ${data[0].style} 課程。`,
      type: 'registration'
    });
    return data[0];
  },
  async update(id, updates) {
    const { data, error } = await supabase.from('students').update(updates).eq('id', id).select();
    if (error) throw error;
    EventBus.emit('student.updated', data[0]);
    return data[0];
  },
  async delete(id) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    EventBus.emit('student.deleted', id);
  }
};

const CourseModule = {
  async load() {
    const { data, error } = await supabase.from('courses').select('*').order('title');
    if (error) throw error;
    AppState.courses = data || [];
  },
  async create(course) {
    const { data, error } = await supabase.from('courses').insert([course]).select();
    if (error) throw error;
    EventBus.emit('course.created', data[0]);
    
    await NotificationModule.createNotification({
      title: '📚 開立新課程 (New Course)',
      message: `已建立新編舞課程: "${data[0].title}"。`,
      type: 'class'
    });
    return data[0];
  }
};

const EventModule = {
  async load() {
    const { data, error } = await supabase.from('events').select('*').order('date');
    if (error) throw error;
    AppState.events = data || [];
  },
  async create(evt) {
    const { data, error } = await supabase.from('events').insert([evt]).select();
    if (error) throw error;
    EventBus.emit('event.created', data[0]);

    await NotificationModule.createNotification({
      title: '📅 建立新活動 (New Event)',
      message: `已安排新工作坊/活動: "${data[0].title}"。`,
      type: 'class'
    });
    return data[0];
  }
};

const FinanceModule = {
  async load() {
    const { data, error } = await supabase.from('sales').select('*').order('created_at');
    if (error) throw error;
    AppState.payments = data || [];
  },
  async createPayment(payment) {
    const { data, error } = await supabase.from('sales').insert([payment]).select();
    if (error) throw error;
    EventBus.emit('payment.completed', data[0]);

    await NotificationModule.createNotification({
      title: '💰 收到款項 (Payment Received)',
      message: `已收到 ${data[0].student_name} 的學費 NT$${data[0].amount} 元。`,
      type: 'payment'
    });
    return data[0];
  }
};

const ContentModule = {
  async load() {
    const { data, error } = await supabase.from('content_calendar').select('*').order('scheduled_time');
    if (error) throw error;
    AppState.contents = data || [];
  },
  async publish(content) {
    const { data, error } = await supabase.from('content_calendar').insert([content]).select();
    if (error) throw error;
    EventBus.emit('content.published', data[0]);

    await NotificationModule.createNotification({
      title: '🎬 社群內容排程 (Content Scheduled)',
      message: `已排定 ${data[0].platform} 影音: "${data[0].title}"。`,
      type: 'ai'
    });
    return data[0];
  },
  async delete(id) {
    const { error } = await supabase.from('content_calendar').delete().eq('id', id);
    if (error) throw error;
    await this.load();
    EventBus.emit('content.published', { id });
  }
};

const AIAgentModule = {
  async createAgentTask(agentId, taskName, output) {
    const task = {
      id: Math.random().toString(36).substring(7),
      agentId,
      taskName,
      output,
      created_at: new Date().toISOString()
    };
    AppState.aiTasks.push(task);
    EventBus.emit('agent.finished', task);

    await NotificationModule.createNotification({
      title: '🤖 AI 任務完成 (AI Task Finished)',
      message: `經紀人已成功生成 "${taskName}" 方案稿。`,
      type: 'ai'
    });
    return task;
  }
};

const CustomerModule = {
  async load() {
    const { data, error } = await supabase.from('messages').select('*').order('created_at');
    if (error) throw error;
    AppState.customers = data || [];
  },
  async sendMessage(msg) {
    const { data, error } = await supabase.from('messages').insert([msg]).select();
    if (error) throw error;
    EventBus.emit('customer.message', data[0]);
    return data[0];
  }
};

const NotificationModule = {
  async load() {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    AppState.notifications = data || [];
  },
  async createNotification(notif) {
    const { data, error } = await supabase.from('notifications').insert([notif]).select();
    if (error) throw error;
    EventBus.emit('customer.message', data[0]);
    return data[0];
  },
  async markAllRead() {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
    if (error) throw error;
    await this.load();
    EventBus.emit('customer.message', {});
  }
};

// ==========================================
// Dashboard Service (Aggregation Brain)
// ==========================================
const DashboardService = {
  calculateStudents() {
    return AppState.students.length;
  },

  calculateRevenue() {
    const paid = AppState.payments.filter(p => p.status === 'paid' || p.status === '已繳費');
    return paid.reduce((sum, p) => sum + Number(p.amount), 0);
  },

  calculateUpcomingEvents() {
    return AppState.events.length;
  },

  calculateGrowth() {
    const thisMonthSales = AppState.payments.filter(p => {
      const date = new Date(p.created_at);
      return date.getFullYear() === 2026 && date.getMonth() === 6 && (p.status === 'paid' || p.status === '已繳費');
    });
    const lastMonthSales = AppState.payments.filter(p => {
      const date = new Date(p.created_at);
      return date.getFullYear() === 2026 && date.getMonth() === 5 && (p.status === 'paid' || p.status === '已繳費');
    });

    const thisMonthRev = thisMonthSales.reduce((sum, p) => sum + Number(p.amount), 0);
    const lastMonthRev = lastMonthSales.reduce((sum, p) => sum + Number(p.amount), 0);

    if (lastMonthRev === 0) return '--';
    const diff = ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100;
    return (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%';
  },

  calculateContentQueue() {
    return AppState.contents.length;
  },

  calculateAITasks() {
    return AppState.aiTasks.length;
  },

  calculateUnreadMessages() {
    const unreads = AppState.notifications.filter(n => !n.read);
    return unreads.length;
  },

  calculateCourses() {
    return AppState.courses.length;
  },

  calculateActiveStudents() {
    const actives = AppState.students.filter(s => {
      const rate = parseInt(s.attendance);
      return isNaN(rate) ? false : rate >= 80;
    });
    return actives.length;
  },

  calculateMonthlyRevenue() {
    return this.calculateRevenue();
  },

  calculateWeeklyRevenue() {
    const now = new Date('2026-07-16');
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklySales = AppState.payments.filter(p => {
      const date = new Date(p.created_at);
      return date >= sevenDaysAgo && (p.status === 'paid' || p.status === '已繳費');
    });
    return weeklySales.reduce((sum, p) => sum + Number(p.amount), 0);
  },

  calculateConversionRate() {
    const total = AppState.students.length;
    if (total === 0) return '0%';
    const converted = AppState.students.filter(s => s.payment === '已繳費').length;
    return ((converted / total) * 100).toFixed(0) + '%';
  },

  calculateCompletionRate() {
    if (AppState.students.length === 0) return '0%';
    const rates = AppState.students.map(s => {
      const r = parseInt(s.attendance);
      return isNaN(r) ? 0 : r;
    });
    const avg = rates.reduce((sum, r) => sum + r, 0) / rates.length;
    return avg.toFixed(0) + '%';
  },

  calculateRecentActivities() {
    const activities = [];

    AppState.students.forEach(s => {
      activities.push({
        icon: '✔',
        text: `Student ${s.name} enrolled in ${s.style}`,
        time: 'Enrolled',
        date: s.created_at
      });
    });

    AppState.aiTasks.forEach(t => {
      activities.push({
        icon: '🤖',
        text: `AI generated ${t.agentId} task: ${t.taskName}`,
        time: 'AI Task',
        date: t.created_at
      });
    });

    AppState.courses.forEach(c => {
      activities.push({
        icon: '📚',
        text: `Course "${c.title}" published at ${c.location}`,
        time: 'Course',
        date: c.created_at
      });
    });

    AppState.payments.forEach(p => {
      if (p.status === 'paid' || p.status === '已繳費') {
        activities.push({
          icon: '💰',
          text: `Payment NT$${p.amount} received from ${p.student_name}`,
          time: 'Payment',
          date: p.created_at
        });
      }
    });

    AppState.events.forEach(e => {
      activities.push({
        icon: '📅',
        text: `Event "${e.title}" scheduled on ${e.date}`,
        time: 'Event',
        date: e.created_at
      });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    return activities.slice(0, 10);
  }
};

function hasNoData() {
  return AppState.students.length === 0 &&
         AppState.courses.length === 0 &&
         AppState.events.length === 0 &&
         AppState.aiTasks.length === 0;
}

function updateDashboardUIState() {
  const loadingEl = document.getElementById('dashboard-loading');
  const emptyEl = document.getElementById('dashboard-empty');
  const errorEl = document.getElementById('dashboard-error');
  const gridEl = document.getElementById('dashboard-data-grid');

  if (loadingEl) loadingEl.classList.add('hidden');
  if (errorEl) errorEl.classList.add('hidden');

  if (hasNoData()) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (gridEl) gridEl.classList.add('hidden');
  } else {
    if (emptyEl) emptyEl.classList.add('hidden');
    if (gridEl) gridEl.classList.remove('hidden');

    renderDashboardMetrics();
    renderDashboardLists();
  }
}

// ==========================================
// Social Posts Calendar caching mapping
// ==========================================
function syncCalendarCacheFromContentState() {
  Object.keys(mockSocialPosts).forEach(key => delete mockSocialPosts[key]);
  AppState.contents.forEach(item => {
    const dateStr = item.scheduled_time.split(' ')[0] || item.scheduled_time.split('T')[0];
    let plat = 'ig';
    if (item.platform === 'TikTok') plat = 'tiktok';
    else if (item.platform === 'Facebook') plat = 'fb';
    else if (item.platform === 'Threads') plat = 'threads';
    else if (item.platform === 'YouTube Shorts') plat = 'youtube';

    if (!mockSocialPosts[dateStr]) {
      mockSocialPosts[dateStr] = [];
    }

    mockSocialPosts[dateStr].push({
      title: item.title,
      time: item.scheduled_time.split(' ')[1] ? item.scheduled_time.split(' ')[1].substring(0, 5) : '18:00',
      platform: item.platform,
      desc: item.description,
      plat: plat
    });
  });
}

// ==========================================
// Supabase Sync Operations
// ==========================================

let failedToLoadDashboard = false;

async function loadDashboardData() {
  const loadingEl = document.getElementById('dashboard-loading');
  const emptyEl = document.getElementById('dashboard-empty');
  const errorEl = document.getElementById('dashboard-error');
  const gridEl = document.getElementById('dashboard-data-grid');

  if (loadingEl) loadingEl.classList.remove('hidden');
  if (emptyEl) emptyEl.classList.add('hidden');
  if (errorEl) errorEl.classList.add('hidden');
  if (gridEl) gridEl.classList.add('hidden');

  try {
    // Load modules asynchronously
    await Promise.all([
      StudentModule.load(),
      CourseModule.load(),
      EventModule.load(),
      FinanceModule.load(),
      ContentModule.load(),
      CustomerModule.load(),
      NotificationModule.load()
    ]);

    failedToLoadDashboard = false;

    // Load initial tasks if count is 0
    if (AppState.aiTasks.length === 0) {
      AppState.aiTasks = [
        { id: '1', agentId: 'coach', taskName: '基礎教案: Wining 臀部旋律律動', created_at: '2026-07-15 14:23:00+00' },
        { id: '2', agentId: 'cs', taskName: '答覆: Sandy Wang 私教報價', created_at: '2026-07-15 15:10:00+00' },
        { id: '3', agentId: 'content', taskName: 'IG Reels: 骨盆律動大公開', created_at: '2026-07-15 11:05:00+00' }
      ];
    }

    mockStudents = AppState.students;
    syncCalendarCacheFromContentState();

    updateDashboardUIState();
  } catch (err) {
    console.error("DashboardService load error:", err);
    failedToLoadDashboard = true;

    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl) {
      errorEl.classList.remove('hidden');
      const descEl = errorEl.querySelector('p');
      if (descEl) {
        descEl.innerHTML = `An error occurred while connecting to the database modules.<br><br>
        <div style="background: rgba(248, 208, 110, 0.1); border: 1px solid rgba(248, 208, 110, 0.3); padding: 12px; border-radius: 6px; margin-top: 10px; text-align: left; font-size: 13px; line-height: 1.5; color: #F8D06E; max-width: 450px; margin-left: auto; margin-right: auto;">
          <strong>⚠️ 偵測到瀏覽器連線阻擋 (Connection Blocked)：</strong><br>
          您電腦的網路連線正常，但 Chrome 瀏覽器拒絕了資料庫請求。<br>
          這通常是因為您啟用了 <strong>AdBlock / uBlock Origin</strong> 等廣告攔截外掛。<br><br>
          <strong>💡 解決方法 (Resolution)：</strong><br>
          請點選您瀏覽器右上角的 <strong>AdBlock 紅色圖標</strong>，選擇「<strong>在此網站上暫停 / Pause on this site</strong>」，然後重新整理網頁或點選下方按鈕重試即可！
        </div>`;
      }
    }
  }
}

function retryLoadDashboard() {
  loadDashboardData();
}

async function fetchStudentsFromSupabase() {
  await StudentModule.load();
  mockStudents = AppState.students;
  renderCrmTable();
}

async function fetchMessagesFromSupabase() {
  await CustomerModule.load();
  if (AppState.customers) {
     Object.keys(mockInbox).forEach(key => {
        mockInbox[key].messages = [];
     });

     AppState.customers.forEach(msg => {
        let threadId = 'thread-1';
        if (msg.student_name === 'Emma Lin') threadId = 'thread-1';
        else if (msg.student_name === 'Leo Chen') threadId = 'thread-2';
        else if (msg.student_name === 'Sandy Wang') threadId = 'thread-3';

        if (mockInbox[threadId]) {
           mockInbox[threadId].messages.push({
              sender: msg.sender,
              text: msg.text
           });
        }
     });

     selectChatThread(activeChatThreadId);
  }
}

function subscribeToSupabaseRealtime() {
  supabase
    .channel('db-changes-global')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'students' }, (payload) => {
      EventBus.emit('student.created', payload.new);
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'students' }, (payload) => {
      EventBus.emit('student.updated', payload.new);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'students' }, (payload) => {
      EventBus.emit('student.deleted', payload.old.id);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, (payload) => {
      EventBus.emit('course.created', payload.new);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
      EventBus.emit('event.created', payload.new);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, (payload) => {
      EventBus.emit('payment.completed', payload.new);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'content_calendar' }, (payload) => {
      EventBus.emit('content.published', payload.new);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
      EventBus.emit('customer.message', payload.new);
      fetchMessagesFromSupabase();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
      EventBus.emit('customer.message', payload.new);
    })
    .subscribe();
}

function initEventBusListeners() {
  EventBus.on('dashboard.refresh', async () => {
    try {
      await Promise.all([
        StudentModule.load(),
        CourseModule.load(),
        EventModule.load(),
        FinanceModule.load(),
        ContentModule.load(),
        CustomerModule.load(),
        NotificationModule.load()
      ]);
      mockStudents = AppState.students;
      syncCalendarCacheFromContentState();
      updateDashboardUIState();
    } catch (err) {
      console.error("Dashboard auto-refresh load failed:", err);
    }
  });
}

// ==========================================
// Core Tab Switcher
// ==========================================

function switchTab(tabId) {
  activeTab = tabId;

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const currentNav = document.getElementById(`nav-${tabId}`);
  if (currentNav) currentNav.classList.add('active');

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

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) activeContent.classList.add('active');

  if (tabId === 'dashboard') {
    loadDashboardData();
  } else if (tabId === 'agents') {
    initAgentsWorkspace();
  } else if (tabId === 'chat') {
    initChatInbox();
  } else if (tabId === 'social') {
    switchSocialView('calendar');
  } else if (tabId === 'crm') {
    renderCrmTable();
  } else if (tabId === 'automation') {
    initAutomations();
    renderIntegrationButtons();
  } else if (tabId === 'knowledge') {
    renderKnowledgeFiles();
  } else if (tabId === 'analytics') {
    renderAnalyticsCharts();
  }
}

// ==========================================
// Creator Dashboard Metrics & Lists Rendering
// ==========================================

function renderDashboardMetrics() {
  const calculations = {
    'kpi-students': `${DashboardService.calculateStudents()} 名`,
    'kpi-courses': `${DashboardService.calculateCourses()} 堂`,
    'kpi-events': `${DashboardService.calculateUpcomingEvents()} 場`,
    'kpi-revenue': `NT$${DashboardService.calculateRevenue().toLocaleString()}`,
    'kpi-pending-content': `${DashboardService.calculateContentQueue()} 則`,
    'kpi-ai-tasks': `${DashboardService.calculateAITasks()} 次`,
    'kpi-unread-messages': `${DashboardService.calculateUnreadMessages()} 通`,
    'kpi-growth': DashboardService.calculateGrowth(),
    'kpi-completion-rate': DashboardService.calculateCompletionRate()
  };

  // Selective Reactive Render (No-rerender performance)
  Object.entries(calculations).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && el.textContent !== val) {
      el.textContent = val;
    }
  });

  // Render recent activities timeline
  const listEl = document.getElementById('recent-activities-list');
  if (listEl) {
    const activities = DashboardService.calculateRecentActivities();
    if (activities.length === 0) {
      listEl.innerHTML = '<li class="text-muted text-xs">No recent activity / 尚無最新動態</li>';
    } else {
      listEl.innerHTML = activities.map(act => `
        <li class="activity-timeline-item">
          <span class="activity-icon">${act.icon}</span>
          <span class="activity-text">${act.text}</span>
          <span class="activity-time">${act.time}</span>
        </li>
      `).join('');
    }
  }

  // Render Notification Center badge and dropdown
  const badgeEl = document.getElementById('nav-notification-badge');
  const count = DashboardService.calculateUnreadMessages();
  if (badgeEl) {
    if (count > 0) {
      badgeEl.textContent = count;
      badgeEl.classList.remove('hidden');
    } else {
      badgeEl.classList.add('hidden');
    }
  }

  const listNotif = document.getElementById('notification-list');
  if (listNotif) {
    const unreads = AppState.notifications;
    if (unreads.length === 0) {
      listNotif.innerHTML = '<li class="text-muted text-xs" style="text-align: center; padding: 12px 0;">No notifications / 尚無新通知</li>';
    } else {
      listNotif.innerHTML = unreads.map(n => `
        <li class="notification-item ${n.read ? '' : 'unread'}">
          <div class="notification-item-title">${n.title}</div>
          <div class="notification-item-desc">${n.message}</div>
        </li>
      `).join('');
    }
  }
}

function toggleNotificationCenter() {
  const dropdown = document.getElementById('notification-dropdown-panel');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

async function markAllNotificationsRead() {
  try {
    await NotificationModule.markAllRead();
  } catch (err) {
    console.error(err);
  }
}

function renderDashboardLists() {
  // Real schedules (Courses + Events)
  const schedList = document.getElementById('today-schedules');
  if (schedList) {
    if (AppState.courses.length === 0 && AppState.events.length === 0) {
      schedList.innerHTML = '<li class="text-muted text-xs">無排定課程與活動。請點擊下方新增。</li>';
    } else {
      const courseHtml = AppState.courses.map(c => `
        <li>
          <span class="badge badge-success" style="font-size:10px; margin-right:4px;">${c.time_slot}</span>
          <strong>${c.title}</strong>
          <span class="text-muted" style="margin-left:auto; font-size:11px;">📍 ${c.location} (${c.student_count} 名學員)</span>
        </li>
      `).join('');

      const eventHtml = AppState.events.map(e => `
        <li>
          <span class="badge badge-primary" style="font-size:10px; margin-right:4px;">${e.date}</span>
          <strong>${e.title}</strong>
          <span class="text-muted" style="margin-left:auto; font-size:11px;">📍 ${e.location}</span>
        </li>
      `).join('');

      schedList.innerHTML = courseHtml + eventHtml;
    }
  }

  // Real scheduled content posts
  const taskList = document.getElementById('today-content-tasks');
  if (taskList) {
    if (AppState.contents.length === 0) {
      taskList.innerHTML = '<li class="text-muted text-xs">無排定的社群發布。</li>';
    } else {
      taskList.innerHTML = AppState.contents.map(t => `
        <li>
          <span>🎬</span>
          <strong>[${t.platform}]</strong> ${t.title}
          <span class="tag-badge" style="margin-left:auto;">${t.scheduled_time.split(' ')[1] ? t.scheduled_time.split(' ')[1].substring(0, 5) : '18:00'}</span>
        </li>
      `).join('');
    }
  }

  // Customer Inbox summary
  const inboxList = document.getElementById('today-inbox-preview');
  if (inboxList) {
    inboxList.innerHTML = Object.values(mockInbox).map(thread => `
      <li style="cursor:pointer" onclick="switchTab('chat'); selectChatThread('${thread.id}')">
        <span>${thread.avatar}</span>
        <strong>${thread.studentName}</strong>
        <span class="text-muted text-xs" style="margin-left:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px;">${thread.snippet}</span>
        <span class="tag-badge badge-primary" style="margin-left:auto; font-size:9px;">${thread.platform}</span>
      </li>
    `).join('');
  }
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

  document.querySelectorAll('.agent-select-btn').forEach(btn => btn.classList.remove('active'));

  const agent = mockAgents[agentId];
  if (!agent) return;

  document.getElementById('active-agent-icon').textContent = agent.icon;
  document.getElementById('active-agent-name').textContent = agent.name;
  document.getElementById('active-agent-desc').textContent = agent.desc;
  document.getElementById('active-agent-prompt').value = agent.prompt;
  document.getElementById('active-agent-memory').value = agent.memory;

  const csModifiers = document.getElementById('cs-agent-modifiers');
  if (agentId === 'cs') {
    csModifiers.classList.remove('hidden');
  } else {
    csModifiers.classList.add('hidden');
  }

  const templateSelect = document.getElementById('agent-input-template');
  templateSelect.innerHTML = agent.templates.map((t, idx) => `
    <option value="${idx}">${t.name}</option>
  `).join('');

  onAgentTemplateChange();
  renderAgentHistory();
}

function onAgentTemplateChange() {
  const agent = mockAgents[activeAgentId];
  const selectIdx = document.getElementById('agent-input-template').value;
  if (agent && agent.templates[selectIdx]) {
    document.getElementById('agent-input-raw').value = agent.templates[selectIdx].raw;
  }
}

function renderAgentHistory() {
  const historyList = document.getElementById('agent-history-list');
  const agent = mockAgents[activeAgentId];
  if (!agent || !agent.history) {
    historyList.innerHTML = '<li class="file-item text-muted">無歷史生成記錄</li>';
    return;
  }

  historyList.innerHTML = agent.history.map(h => `
    <li class="file-item" style="cursor:pointer" onclick="loadHistoryItem('${h.title}', '${h.result.replace(/'/g, "\\'")}')">
      <span class="file-item-name">⏱️ ${h.timestamp} - ${h.title}</span>
      <span class="file-item-size" style="font-size:10px; color:var(--color-accent);">載入預覽 ➔</span>
    </li>
  `).join('');
}

function loadHistoryItem(title, result) {
  document.getElementById('agent-output-text').textContent = `【歷史記錄預覽：${title}】\n\n${result}`;
}

function generateAgentOutput() {
  const outputBox = document.getElementById('agent-output-text');
  outputBox.innerHTML = '🤖 AI Agent 正在調用知識庫與 System Prompt 運算中...\n████▒▒▒▒▒▒ 40%';

  setTimeout(() => {
    outputBox.innerHTML = '🤖 AI Agent 正在套用個人大腦 Tone & Voice 潤飾中...\n████████▒▒ 80%';
    setTimeout(async () => {
      const rawInput = document.getElementById('agent-input-raw').value;
      const agent = mockAgents[activeAgentId];

      let finalOutputText = '';
      if (activeAgentId === 'coach') {
        finalOutputText = `【${agent.name} 產出方案】\n\n📌 主題: ${rawInput}\n\n1. 課堂暖身設計 (15 mins):\n   - 呼吸調節與重心沉降配合 (Dancehall 經典 One Drop 踩點準備)。\n   - 髖關節與臀部 Wining 慢速環繞熱身，強化大腿內側肌群與核心穩定性。\n\n2. 基礎動作拆解 (30 mins):\n   - Wining (牙買加臀部畫圓律動) 的三大核心口訣：膝蓋微彎、腹部微收、利用骨盆向上帶起圓弧。\n   - 配合雷鬼樂的 One Drop 和 Steppa 節奏做變速訓練 (60BPM -> 85BPM)。\n\n3. 編舞小品排練 (35 mins):\n   - 結合經典動作的 4 個 Eight Counts 排舞練習。配合 🔥 激情滿點的 Dancehall 音樂，鼓勵同學眼神與面部表情的主動釋放！\n\n4. 課後練習重點與關懷:\n   - 提醒大家對鏡子練習時手部動作配合核心放鬆。\n   - 「跳舞是享受，不要把表情鎖死，給自己一點自信！🔥💃」`;
      } else if (activeAgentId === 'cs') {
        finalOutputText = `【${agent.name} 智能回覆建議】\n\n哈囉！太棒了！🔥 很高興妳對 Dancehall 有興趣！\n\n別擔心！我們的體驗課是專門為完全零基礎的同學設計的喔！課堂上老師會非常詳細地將每一個臀部律動與踏步動作拆解，同學也都是初學者，氣氛非常好、超好玩！大家都可以跟得上喔～💃✨\n\n下週三晚上的課程目前僅剩 3 個名額，體驗課費用單堂是 $450 元。妳跟朋友要不要直接幫妳們保留下週的位置呢？我可以直接幫妳們登記預約喔！❤️`;
      } else if (activeAgentId === 'content') {
        finalOutputText = `【${agent.name} 社群影音腳本】\n\n🔥 Reels / TikTok 標題: 舞蹈小白必看！3 步學會 Dancehall 最性感臀部律動 Wining！\n\n🎬 [0:00 - 0:05] Hook (吸睛畫面)\n- 視覺: 老師穿著潮流服飾，做一段 5 秒超有爆發力的 Wining 展示，眼神對著鏡頭放電。\n- 口播: 「跳 Dancehall 臀部老是扭得很卡？那是原因你少做了這一步！」\n\n🎬 [0:05 - 0:35] Body (教學步驟拆解)\n- 步驟 1: 膝蓋先微彎，把重心沉下去 (建立地基)。\n- 步驟 2: 想像骨盆在畫圓，而不是腰在扭 (避免腰部受傷)。\n- 步驟 3: 音樂踩點時，每一次畫圓都要對準雷鬼重拍！\n\n🎬 [0:35 - 0:50] Call to Action (互動與轉化)\n- 口播: 「學會了嗎？這週三來教室，我帶你直接用音樂感受！趕快點下方連結報名啦！🔥」\n\n🏷️ 推薦標籤: #dancehall #dancehallteacher #dancelife #街舞教學 #雷鬼舞蹈 #短影音劇本`;
      } else {
        finalOutputText = `【${agent.name} 輸出結果】\n\n已成功根據：\n「${rawInput}」\n為您生成適配 Dance Creator OS 品牌語氣風格的完整行銷文案及執行 SOP 文案，並包含預設的 #dancehall 標籤。已準備就緒，您可以直接複製使用！`;
      }

      outputBox.innerHTML = finalOutputText;

      // Add to history list
      agent.history.unshift({
        timestamp: '剛剛',
        title: rawInput.length > 18 ? rawInput.substring(0, 15) + '...' : rawInput,
        result: finalOutputText
      });
      renderAgentHistory();

      // Trigger automatic refresh of Dashboard metrics on AI task completion via AI Module
      await AIAgentModule.createAgentTask(activeAgentId, rawInput.substring(0, 15), finalOutputText);
    }, 800);
  }, 600);
}

function modifyAgentOutputText(mode) {
  const outputBox = document.getElementById('agent-output-text');
  const currentText = outputBox.textContent;
  if (currentText.startsWith('等待') || currentText.startsWith('🤖')) return;

  outputBox.textContent = '🤖 AI 正在套用格式並修飾語氣...';
  setTimeout(() => {
    let modified = '';
    if (mode === 'generate') {
      modified = `【AI 客服重新回覆】\n哈囉！這堂雷鬼排舞課名額快滿了，今天報名可以幫您保留位置喔！歡迎您跟朋友一起来跳舞，非常舒壓好玩！✨`;
    } else if (mode === 'rewrite') {
      modified = `【AI 客服重寫】\n哈囉！想了解 Dancehall 基礎體驗課的朋友們注意囉！這堂課是特別為了零經驗的學員設計的，動作簡單易懂。下週三名額有限，立即報名吧！🔥`;
    } else if (mode === 'warmer') {
      modified = `【AI 客服 - 更溫慢】\n親愛的寶貝～❤️ 沒問題喔！身體健康最重要，今天肚子痛就在家多休息、喝熱水喔！晚上好好睡一覺，老師會幫你登記請假的，下週看你健健康康地回來扭臀喔！加油喔！🥰✨`;
    } else if (mode === 'professional') {
      modified = `【AI 客服 - 更專業】\n您好，感謝您的諮詢。本教室的一對一私人指導課程收費標準為：單堂體驗費 NT$2,000，一次性報名 10 堂享有包堂優惠價 NT$18,000（限期三個月內使用完畢）。我們將根據您的需求客製編舞與上課時段。如有意向，我們將為您排定30分鐘的商務諮詢，謝謝。`;
    } else if (mode === 'short') {
      modified = `【AI 客服 - 精簡】\n哈囉！體驗課單堂 $450，初學者完全可以跟得上喔！下週三還有空位，要幫您跟朋友登記嗎？✨`;
    } else if (mode === 'long') {
      modified = `【AI 客服 - 詳細說明】\n哈囉！非常感謝您的來信諮詢！有關一對一私教班的收費方式：我們提供客製化的私教特訓，單堂費用為 2000 元，若您選擇包堂方案（10堂課），我們會提供最優特惠價 18,000 元，平均一堂可節省 200 元喔！上課時，我們會為您的婚禮雙人舞曲目進行一對一的動作修改、姿勢調整與進度追蹤。您可以點選下方連結預訂首堂時間。`;
    }
    outputBox.textContent = modified;
  }, 500);
}

function copyAgentOutputText() {
  const text = document.getElementById('agent-output-text').textContent;
  navigator.clipboard.writeText(text);
  alert('已複製結果！');
}

// ==========================================
// Content Studio Logic
// ==========================================

function generateStudioScripts() {
  const style = document.getElementById('studio-style').value;
  const topic = document.getElementById('studio-topic').value;
  const idea = document.getElementById('studio-idea').value;

  const textContent = document.getElementById('studio-mockup-text-content');
  textContent.textContent = '🎬 AI 正在為您串接跨平台發布格式，進行一鍵生成中...';

  setTimeout(() => {
    mockStudioOutputs.instagram.text = `【🎬 IG Reels 短影音劇本】\n\n📌 影片主題：${topic}\n🕺 風格：${style}\n🔥 3秒黃金Hook: 「大家都想跳好${style}，但90%的人動作都做錯了！」\n\n🎥 畫面分鏡：\n1. [0-3s] 配合極富張力的動作點展現 ${topic} 的震撼力。\n2. [3-25s] ${idea || '分步驟細緻拆解動作發力，強調肢體控制'}\n3. [25-50s] 老師帶領學員配合節奏進行實練展示。\n\n✍️ 貼文 Caption:\n今天跟著影片做一次，保證讓你突破舞蹈瓶頸！想要更系統化進步，歡迎點個人檔案連結報名最新的一對一私教班！🔥\n\n🏷️ Hashtags:\n#dancehall #${style.toLowerCase().replace(/\s+/g, '')} #choreo #學跳舞 #影音劇本`;

    mockStudioOutputs.tiktok.text = `【🎵 TikTok 短影音腳本】\n\n📌 影片主題：${topic}\n🕺 風格：${style}\n🔥 爆點Hook: 「別再瞎跳了！用這3步做正宗的 ${style} 臀部律動！」\n\n🎥 畫面分鏡：\n1. [0-5s] 錯誤示範對比正確示範，引出痛點。\n2. [5-20s] 重心沉降，發力點特寫 (搭配綠幕箭頭指示)。\n3. [20-40s] 配合當前最火雷鬼樂慢速踩點實操。\n\n🏷️ Hashtags:\n#dancehallstyle #${style.toLowerCase().replace(/\s+/g, '')} #dancer #學跳舞 #TikTok舞蹈`;

    mockStudioOutputs.facebook.text = `【📘 Facebook 品牌貼文】\n\n📌 主題：【${style} 行動教學短片】${topic}\n\n各位熱愛跳舞的朋友！\n今天我們為大家帶來正宗的 ${style} 技巧教學。跳舞的性感與力量，往往取決於對重心下沉的掌控度。\n\n很多同學在做 Wining 畫圓時，常因為腰部用錯力而感到卡卡的，甚至容易拉傷。在影片中我們詳細拆解了核心發力的三大核心要訣：\n1. 膝蓋微蹲\n2. 腹部微收\n3. 骨盆向上帶起圓弧\n\n想學習更多？趕快分享這篇文，這週三晚上我們在線下教室帶你伴隨音樂律動！💃🔥\n\n👉 報名連結：[點擊前往約課系統]`;

    mockStudioOutputs.threads.text = `【🧵 Threads 熱門話題】\n\n跳 ${style} 時，臀部律動 ${topic} 最難的不是肌肉發力，而是你能不能在滿堂同學的鏡子前面放開自我、擺脫尷尬？😂\n\n許多學員一開始都卡在心魔，其實放膽扭下去就對了！\n今晚課堂見，今晚誰會到？在下面留個 🔥 讓我知道！👇`;

    mockStudioOutputs.youtube.text = `【🎥 YouTube Shorts 腳本】\n\n📌 主題：${topic}\n🔥 Hook: 「一分鐘改善你跳舞僵硬的問題！${style} 核心律動練習！」\n\n🎥 畫面分鏡：\n- 老師特寫示範腰部與大腿的核心發力，並用箭頭後製標註力量流向。\n- 結尾加入大字卡「訂閱我的頻道，每週五更新舞蹈動作教學！」`;

    switchStudioPreviewPlatform(activeStudioPlatform);
  }, 1000);
}

function switchStudioPreviewPlatform(platform) {
  activeStudioPlatform = platform;

  document.querySelectorAll('.platform-tab').forEach(tab => tab.classList.remove('active'));
  const currentTab = document.getElementById(`stab-${platform}`);
  if (currentTab) currentTab.classList.add('active');

  const data = mockStudioOutputs[platform];
  document.getElementById('studio-mockup-title').textContent = data.title;
  document.getElementById('studio-mockup-text-content').textContent = data.text;
}

function copyStudioScriptText() {
  const text = document.getElementById('studio-mockup-text-content').textContent;
  navigator.clipboard.writeText(text);
  alert('已複製當前平台的影音腳本文案！');
}

async function scheduleStudioScript() {
  const title = document.getElementById('studio-topic').value || 'AI 推薦短影音發布';
  const desc = document.getElementById('studio-mockup-text-content').textContent;
  const platform = activeStudioPlatform === 'ig' ? 'Instagram' :
                   activeStudioPlatform === 'tiktok' ? 'TikTok' :
                   activeStudioPlatform === 'fb' ? 'Facebook' :
                   activeStudioPlatform === 'threads' ? 'Threads' : 'YouTube Shorts';

  const dateStr = '2026-07-16';
  const time = '18:00';
  const scheduled_time = `${dateStr} ${time}:00`;

  try {
    await ContentModule.publish({
      title: title,
      description: desc,
      platform: platform,
      scheduled_time: scheduled_time,
      status: 'scheduled',
      brand_id: '6cf18857-352f-474e-aaba-1d67f570f23b'
    });
    alert('已將此影音腳本寫入資料庫排程，並同步更新至社群發布行事曆！');
    switchTab('social');
  } catch (err) {
    console.error('Error scheduling content post:', err);
    alert('排程失敗：' + err.message);
  }
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

  document.querySelectorAll('.chat-thread-item').forEach(item => item.classList.remove('active'));

  const thread = mockInbox[threadId];
  if (!thread) return;

  const msgBody = document.getElementById('chat-messages-body');
  msgBody.innerHTML = thread.messages.map(m => `
    <div class="chat-message ${m.sender}">
      ${m.text}
    </div>
  `).join('');

  msgBody.scrollTop = msgBody.scrollHeight;

  document.getElementById('c-name').textContent = thread.studentName;
  document.getElementById('c-level').textContent = thread.studentInfo.level;
  document.getElementById('c-attendance').textContent = thread.studentInfo.attendance;
  document.getElementById('c-payment').textContent = thread.studentInfo.payment;
  document.getElementById('c-birthday').textContent = thread.studentInfo.birthday;
  document.getElementById('c-tags').textContent = thread.studentInfo.tags;

  const prevConversationsList = document.getElementById('chat-previous-conversations');
  if (thread.previousConversations) {
    prevConversationsList.innerHTML = thread.previousConversations.map(c => `
      <li>
        <span class="badge badge-success" style="font-size:10px;">${c.date}</span>
        <span class="text-muted" style="font-size:11px;">${c.snippet}</span>
      </li>
    `).join('');
  } else {
    prevConversationsList.innerHTML = '<li>無先前對話記錄</li>';
  }

  regenerateAICopilotReply();
}

async function sendUserChatMessage() {
  const inputBox = document.getElementById('chat-input-box');
  const text = inputBox.value.trim();
  if (!text) return;

  const thread = mockInbox[activeChatThreadId];
  if (!thread) return;

  try {
    await CustomerModule.sendMessage({
      student_name: thread.studentName,
      sender: 'teacher',
      text: text,
      platform: thread.platform
    });
    inputBox.value = '';
    await fetchMessagesFromSupabase();
    
    // Simulate student response
    setTimeout(async () => {
      await CustomerModule.sendMessage({
        student_name: thread.studentName,
        sender: 'student',
        text: '好的，謝謝老師！那我把我的聯絡電話跟本名私訊留給您。',
        platform: thread.platform
      });
      await fetchMessagesFromSupabase();
    }, 1500);
  } catch (err) {
    console.error('Error sending message:', err);
  }
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

// Apply Copilot Recommended message
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
    } else if (tone === 'professional') {
      replyBody.textContent = `您好，關於您諮詢的課程事項：${currentText.replace('哈囉', '').replace('❤️', '').replace('！', '。')}`;
    } else if (tone === 'short') {
      replyBody.textContent = currentText.substring(0, 45) + '... 直接幫您登記好嗎？✨';
    } else if (tone === 'long') {
      replyBody.textContent = `【詳細建議】\n${currentText} 另外，如果有任何時間上的變動，均可於課前2小時在線請假。我們也提供各類型的街舞與基礎教學，歡迎隨時預約。`;
    }
  }, 600);
}

// ==========================================
// Social Media Manager Views
// ==========================================

function switchSocialView(viewName) {
  activeSocialView = viewName;

  const buttons = ['calendar', 'draft', 'scheduled', 'published', 'analytics'];
  buttons.forEach(btn => {
    const el = document.getElementById(`sbtn-${btn}`);
    if (el) {
      if (btn === viewName) el.classList.add('active');
      else el.classList.remove('active');
    }
  });

  const calendarContainer = document.getElementById('social-calendar-view-container');
  const listContainer = document.getElementById('social-list-view-container');
  const listTitle = document.getElementById('social-list-view-title');
  const listBody = document.getElementById('social-list-view-body');

  if (viewName === 'calendar') {
    calendarContainer.classList.remove('hidden');
    listContainer.classList.add('hidden');
    renderSocialCalendar();
  } else {
    calendarContainer.classList.add('hidden');
    listContainer.classList.remove('hidden');

    if (viewName === 'draft') {
      listTitle.textContent = '📝 Drafts (草稿備忘箱)';
      listBody.innerHTML = `
        <li>🎬 <strong>[IG Reels]</strong> 基礎 Wining 錯誤動作比對 (AI 建議採用) <button class="btn btn-secondary btn-xs" style="margin-left:auto;">編輯發布</button></li>
        <li>📘 <strong>[Facebook]</strong> 上課側錄 NG 鏡頭大合輯 <button class="btn btn-secondary btn-xs" style="margin-left:auto;">編輯發布</button></li>
      `;
    } else if (viewName === 'scheduled') {
      listTitle.textContent = '⏳ Scheduled (排程等待中)';
      if (AppState.contents.length === 0) {
        listBody.innerHTML = '<li>無排定發布內容</li>';
      } else {
        listBody.innerHTML = AppState.contents.map(item => `
          <li>🎬 <strong>[${item.platform}]</strong> ${item.title} - ${item.scheduled_time} 發布 <button class="btn btn-danger btn-xs" style="margin-left:auto;" onclick="deleteContentPost('${item.id}')">取消排程</button></li>
        `).join('');
      }
    } else if (viewName === 'published') {
      listTitle.textContent = '✅ Published (已發布歷史紀錄)';
      listBody.innerHTML = `
        <li>🎬 <strong>[Instagram]</strong> 週六工作坊精彩排舞回顧 - 2026-07-13 發布 <span class="tag-badge badge-success" style="margin-left:auto;">已發布</span></li>
      `;
    } else if (viewName === 'analytics') {
      listTitle.textContent = '📊 Social Analytics (內容成效表現)';
      listBody.innerHTML = `
        <li>🎬 <strong>IG Reels: 基礎 Wining Teaching</strong> - 互動率 8.4% (高於平均 35%)</li>
        <li>🎵 <strong>TikTok: 1分鐘基礎 One Drop</strong> - 點閱數 14.5k</li>
      `;
    }
  }
}

async function deleteContentPost(id) {
  try {
    await ContentModule.delete(id);
    alert('已成功取消排程。');
  } catch (err) {
    console.error('Failed to delete content post:', err);
    alert('取消排程失敗');
  }
}

// ==========================================
// Student CRM Database Logic
// ==========================================

function renderCrmTable() {
  const tbody = document.getElementById('crm-table-body');
  if (!tbody) return;

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

  const selector = document.getElementById('crm-ai-student-select');
  if (selector) {
    selector.innerHTML = mockStudents.map((s, idx) => `
      <option value="${idx}">${s.name} (${s.level})</option>
    `).join('');
  }
}

function selectCrmStudent(idx) {
  const selector = document.getElementById('crm-ai-student-select');
  if (selector) {
    selector.value = idx;
    triggerCrmAction('summarize');
  }
}

function triggerCrmAction(actionType) {
  const idx = document.getElementById('crm-ai-student-select').value;
  const student = mockStudents[idx];
  const outputBox = document.getElementById('crm-ai-output-body');

  outputBox.textContent = `🤖 AI CRM 大腦正在比對資料並執行運算...`;

  setTimeout(() => {
    let text = '';
    if (actionType === 'summarize') {
      text = `【學員歷史總結 (CRM History Summary) - ${student.name}】\n`;
      text += `- 舞蹈能力: ${student.level} | 核心風格: ${student.style}\n`;
      text += `- 出席紀錄: 目前出席率為 ${student.attendance}，最近一個月內請假次數已紀錄。\n`;
      text += `- 付費歷史: 當前狀態為 [${student.payment}]。\n`;
      text += `- 教師備註: 該生對於 ${student.style} 風格相當有熱情，動作力量控制優秀，但需注意工作繁忙時容易連續缺席。`;
    } else if (actionType === 'followup') {
      text = `【AI 跟進建議 (Suggested Follow-up) - ${student.name}】\n`;
      text += `- 建議跟進行動: 由於出席率或付費狀態，建議今天利用 LINE 發送關懷訊息。\n`;
      text += `- 回訪主題: ${student.attendance.replace('%', '') < 80 ? '連續缺席關懷與課堂預約' : '課後進度肯定與動作微調鼓勵'}\n`;
      text += `- 推薦時程: 今天下午 16:00 點前發送效果最佳。`;
    } else if (actionType === 'message') {
      text = `【AI 自動生成訊息 (Generated Message) - ${student.name}】\n`;
      if (student.attendance.replace('%', '') < 80) {
        text += `「嗨 ${student.name}，最近工作還順利嗎？🥰 老師有注意到你最近兩堂課缺席了，是不是上班太累了呀？跳舞是釋放壓力的好方法，這週日有一堂超好玩的基礎律動，要不要幫你預留一個位置來動一動、放鬆一下呢？❤️💃」`;
      } else {
        text += `「嗨 ${student.name}！最近看你上課的臀部律動控制力越來越穩定了耶，真的進步超多！🔥 老師建議你這週可以在家多做 5 分鐘的大腿核心肌肉啟動，下堂課編舞小品我們來挑戰變速跳法，加油！✨💪」`;
      }
    }
    outputBox.textContent = text;
  }, 700);
}

function openNewStudentModal() {
  document.getElementById('new-student-modal').classList.remove('hidden');
}

function closeNewStudentModal() {
  document.getElementById('new-student-modal').classList.add('hidden');
}

async function saveNewStudent() {
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

  try {
    // Write new student to Supabase
    await StudentModule.create({
      name, level, style, attendance, payment, birthday, tags
    });

    // Create corresponding transaction invoice in the sales table to dynamically compute Revenue
    let amount = 0;
    if (payment === '已繳費') amount = 18000;
    else if (payment === '體驗票') amount = 450;

    if (amount > 0) {
      await FinanceModule.createPayment({
        student_name: name,
        amount: amount,
        status: 'paid'
      });
    }

    closeNewStudentModal();
  } catch (err) {
    console.error('Error saving student to Supabase:', err);
    alert('儲存失敗：' + err.message);
  }
}

// ==========================================
// New Course / New Event Modals Handlers
// ==========================================

function openNewCourseModal() {
  document.getElementById('new-course-modal').classList.remove('hidden');
}

function closeNewCourseModal() {
  document.getElementById('new-course-modal').classList.add('hidden');
}

async function saveNewCourse() {
  const title = document.getElementById('nc-title').value;
  const style = document.getElementById('nc-style').value;
  const time_slot = document.getElementById('nc-time').value;
  const location = document.getElementById('nc-location').value;
  const student_count = Number(document.getElementById('nc-students').value);

  if (!title) {
    alert('請輸入課程名稱！');
    return;
  }

  try {
    await CourseModule.create({
      title, style, time_slot, location, student_count
    });
    closeNewCourseModal();
  } catch (err) {
    console.error('Error saving course to Supabase:', err);
    alert('儲存失敗：' + err.message);
  }
}

function openNewEventModal() {
  document.getElementById('new-event-modal').classList.remove('hidden');
}

function closeNewEventModal() {
  document.getElementById('new-event-modal').classList.add('hidden');
}

async function saveNewEvent() {
  const title = document.getElementById('ne-title').value;
  const date = document.getElementById('ne-date').value;
  const location = document.getElementById('ne-location').value;

  if (!title) {
    alert('請輸入活動名稱！');
    return;
  }

  try {
    await EventModule.create({
      title, date, location
    });
    closeNewEventModal();
  } catch (err) {
    console.error('Error saving event to Supabase:', err);
    alert('儲存失敗：' + err.message);
  }
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

function renderIntegrationButtons() {
  const ids = ['make', 'n8n', 'zapier', 'webhook', 'gcal', 'notion', 'gsheet'];
  ids.forEach(id => {
    const el = document.getElementById(`int-${id}`);
    if (el) {
      if (mockIntegrations[id]) {
        el.textContent = 'Connected';
        el.className = 'btn btn-primary btn-xs';
      } else {
        el.textContent = 'Disconnected';
        el.className = 'btn btn-secondary btn-xs';
      }
    }
  });
}

function toggleIntegration(id) {
  mockIntegrations[id] = !mockIntegrations[id];
  renderIntegrationButtons();
  alert(`${id.toUpperCase()} 串接連線狀態已變更為：${mockIntegrations[id] ? '啟用' : '停用'}`);
}

function triggerTestWorkflowRun() {
  alert('💡 已成功觸發自動化測試流程！\nWebhook 成功對外派送，模擬將學員 IG DM 私訊轉換，並同步更新至 CRM 系統。');
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
// Analytics Charts Rendering
// ==========================================

function renderAnalyticsCharts() {
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
    reportBody.innerHTML = `<h3>📊 Dance Creator OS 週度營運改善建議 (2026/07/16)</h3>
<p><b>本週核心觀察：</b>本月團體課報名率已達 85% 歷史新高，但一對一私教課程回購率較上月下滑了 8%。主要原因在於部分學員（如 Leo Chen 等）由於加班頻繁缺席，進而延長了包堂消耗週期。</p>

<h4>💡 本週改善方針：</h4>
<ul>
  <li><b>私教靈活排課制</b>：針對常加班的上班族學員，主動推送「週末清晨/深夜彈性預約時段」，降低請假流失率。</li>
  <li><b>內容裂變行銷</b>：TikTok 粉絲增長迅速（本月+95%），應善加利用「TikTok 基礎律動教學影音」向線下團體課進行導流，提供專屬的「線下首堂體驗票 $450」折扣碼。</li>
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
  const philosophy = document.getElementById('set-philosophy').value;
  const sop = document.getElementById('set-sop').value;
  const brand = document.getElementById('set-brand').value;

  mockAgents.coach.memory = `舞蹈風格特色：${style}。書寫語氣：${tone}。舞蹈哲學：${philosophy}。`;
  mockAgents.cs.memory = `客戶回覆原則：${service}。教室規則 SOP：${sop}。品牌基本資訊：${brand}`;

  alert('💾 成功將個人大腦設定儲存至 Dance Creator OS！\n所有專屬 AI Agents 的 System Prompt 與背景知識已完成即時熱更新。');
}

// ==========================================
// Social Media Manager Calendar Rendering
// ==========================================

function renderSocialCalendar() {
  const gridBody = document.getElementById('social-calendar-grid-body');
  const monthYearLabel = document.getElementById('social-calendar-month-year');
  if (!gridBody || !monthYearLabel) return;

  gridBody.innerHTML = '';

  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  monthYearLabel.textContent = `${currentYear} 年 ${months[currentMonth]}`;

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let adjustedFirstDay = firstDayIndex - 1;
  if (adjustedFirstDay < 0) adjustedFirstDay = 6;

  for (let i = 0; i < adjustedFirstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    gridBody.appendChild(emptyCell);
  }

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
        else if (ev.plat === 'tiktok') platClass = 'threads';
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

async function saveModalEvent() {
  const dateStr = document.getElementById('modal-day-num').value;
  const title = document.getElementById('modal-post-title').value;
  const time = document.getElementById('modal-post-time').value;
  const platform = document.getElementById('modal-post-platform').value;
  const desc = document.getElementById('modal-post-desc').value;

  const scheduled_time = `${dateStr} ${time}:00`;

  try {
    await ContentModule.publish({
      title: title,
      description: desc,
      platform: platform,
      scheduled_time: scheduled_time,
      status: 'scheduled',
      brand_id: '6cf18857-352f-474e-aaba-1d67f570f23b'
    });
    closeModal();
  } catch (err) {
    console.error('Error saving post:', err);
    alert('排程失敗：' + err.message);
  }
}

async function deleteModalEvent() {
  const dateStr = document.getElementById('modal-day-num').value;
  const item = AppState.contents.find(c => c.scheduled_time.startsWith(dateStr));
  if (item) {
    try {
      await ContentModule.delete(item.id);
      closeModal();
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('刪除排程失敗');
    }
  } else {
    closeModal();
  }
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
  if (actionId === 'gen-ig-post') {
    switchTab('studio');
    document.getElementById('studio-style').value = 'Dancehall (牙買加雷鬼舞)';
    document.getElementById('studio-topic').value = '初學者必練 3 個性感的 Wining 擺臀動作';
    document.getElementById('studio-idea').value = '強調核心發力，不單純是用腰，避免扭傷。前3秒是老師排舞示範。';
    generateStudioScripts();
  } else if (actionId === 'gen-tiktok-script') {
    switchTab('studio');
    document.getElementById('studio-style').value = 'Dancehall Choreo';
    document.getElementById('studio-topic').value = '快速學會雷鬼街頭步 Log On';
    document.getElementById('studio-idea').value = '節奏踩點、側向踏步、手部動作同步搭配。適合 TikTok 快速合拍。';
    generateStudioScripts();
  } else if (actionId === 'reply-student') {
    switchTab('chat');
    selectChatThread('thread-1');
  } else if (actionId === 'create-lesson-plan') {
    switchTab('agents');
    switchAgent('coach');
    document.getElementById('agent-input-template').value = 0;
    onAgentTemplateChange();
  } else if (actionId === 'create-event-promo') {
    switchTab('agents');
    switchAgent('marketing');
    document.getElementById('agent-input-template').value = 0;
    onAgentTemplateChange();
  }
}

// ==========================================
// Page Load Initializer
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize Global Event Bus listeners for reactive dashboard rendering
  initEventBusListeners();

  // Switch to Dashboard (will trigger async module loads & UI render)
  switchTab('dashboard');

  // Supabase Realtime Change Listener Setup
  subscribeToSupabaseRealtime();

  // Load chat messages
  await fetchMessagesFromSupabase();
});

// Expose all functions to global window scope to prevent Vite tree-shaking
window.switchTab = switchTab;
window.quickAction = quickAction;
window.switchAgent = switchAgent;
window.onAgentTemplateChange = onAgentTemplateChange;
window.generateAgentOutput = generateAgentOutput;
window.modifyAgentOutputText = modifyAgentOutputText;
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
window.triggerCrmAction = triggerCrmAction;
window.openNewStudentModal = openNewStudentModal;
window.closeNewStudentModal = closeNewStudentModal;
window.saveNewStudent = saveNewStudent;
window.openNewCourseModal = openNewCourseModal;
window.closeNewCourseModal = closeNewCourseModal;
window.saveNewCourse = saveNewCourse;
window.openNewEventModal = openNewEventModal;
window.closeNewEventModal = closeNewEventModal;
window.saveNewEvent = saveNewEvent;
window.selectAutomationFlow = selectAutomationFlow;
window.toggleIntegration = toggleIntegration;
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
window.switchSocialView = switchSocialView;
window.loadHistoryItem = loadHistoryItem;
window.toggleNotificationCenter = toggleNotificationCenter;
window.markAllNotificationsRead = markAllNotificationsRead;
window.retryLoadDashboard = retryLoadDashboard;
