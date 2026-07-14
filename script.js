// script.js – Dynamic content loading, Supabase auth & application forms
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const cardsContainer = document.getElementById('cards-container')
  const categorySelect = document.getElementById('category-select')
  const toastContainer = document.getElementById('toast-container')

  // Auth elements
  const authNavItem = document.getElementById('auth-nav-item')
  const modalLogin = document.getElementById('modal-login')
  const modalLoginClose = document.getElementById('modal-login-close')
  
  // Login Tabs & Forms
  const tabLoginBtn = document.getElementById('tab-login-btn')
  const tabSignupBtn = document.getElementById('tab-signup-btn')
  const formLogin = document.getElementById('form-login')
  const formSignup = document.getElementById('form-signup')

  // Apply Modal & Form
  const btnApplyTrigger = document.getElementById('btn-apply-trigger')
  const modalApply = document.getElementById('modal-apply')
  const modalApplyClose = document.getElementById('modal-apply-close')
  const formApply = document.getElementById('form-apply')

  let currentUser = null

  // --- Helper: Toast Notification ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
      <span>${message}</span>
      <button style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:1.1rem;margin-left:1rem;">&times;</button>
    `
    
    // Close button inside toast
    toast.querySelector('button').addEventListener('click', () => {
      toast.remove()
    })

    toastContainer.appendChild(toast)

    // Auto remove
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0'
        toast.style.transform = 'translateY(20px)'
        toast.style.transition = 'all 0.3s ease'
        setTimeout(() => toast.remove(), 300)
      }
    }, 4000)
  }

  // --- Fetch & Render Announcements ---
  async function fetchAnnouncements() {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        cardsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-muted);">暫無最新公告或服務項目。</p>'
        return
      }

      // Render cards
      cardsContainer.innerHTML = data.map(item => {
        // Fallback default image if image_url is empty
        const imgUrl = item.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600'
        return `
          <article class="card" data-category="${item.category}">
            <img src="${imgUrl}" alt="${item.title}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600'" />
            <h3 class="card-title">${item.title}</h3>
            <p class="card-desc">${item.description}</p>
          </article>
        `
      }).join('')

      // Initialize filter logic on the dynamic elements
      applyFilter()

    } catch (err) {
      console.error('Error fetching announcements:', err)
      showToast('無法載入公告與服務資訊，請稍後再試。', 'error')
      cardsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff5b5b;">資料載入失敗。</p>'
    }
  }

  // Filter logic: show cards matching selected category or all
  function applyFilter() {
    if (!categorySelect) return
    const value = categorySelect.value
    const cards = cardsContainer.querySelectorAll('.card')
    cards.forEach(card => {
      const cat = card.dataset.category
      if (value === 'all' || value === cat) {
        card.style.display = ''
      } else {
        card.style.display = 'none'
      }
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilter)
  }

  // --- Auth State UI Sync ---
  function updateAuthUI(user) {
    currentUser = user
    if (user) {
      // User is logged in
      authNavItem.innerHTML = `
        <div class="user-menu">
          <span class="user-email" title="${user.email}">${user.email.split('@')[0]} (會員)</span>
          <button class="btn-logout" id="btn-logout">登出</button>
        </div>
      `
      // Attach logout event
      document.getElementById('btn-logout').addEventListener('click', handleLogout)
    } else {
      // User is logged out
      authNavItem.innerHTML = `
        <button class="btn-login" id="btn-login-trigger">會員快捷登入</button>
      `
      // Re-attach login trigger event
      document.getElementById('btn-login-trigger').addEventListener('click', () => {
        openModal(modalLogin)
      })
    }
  }

  // Check initial session
  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    updateAuthUI(session?.user || null)
  }

  // Listen to auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    updateAuthUI(session?.user || null)
  })

  // --- Modal Utilities ---
  function openModal(modal) {
    modal.classList.add('show')
  }

  function closeModal(modal) {
    modal.classList.remove('show')
  }

  // Close when clicking outside modal container
  [modalLogin, modalApply].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal)
      })
    }
  })

  if (modalLoginClose) {
    modalLoginClose.addEventListener('click', () => closeModal(modalLogin))
  }
  if (modalApplyClose) {
    modalApplyClose.addEventListener('click', () => closeModal(modalApply))
  }

  // Login Tabs Switch
  if (tabLoginBtn && tabSignupBtn) {
    tabLoginBtn.addEventListener('click', () => {
      tabLoginBtn.classList.add('active')
      tabSignupBtn.classList.remove('active')
      formLogin.style.display = 'block'
      formSignup.style.display = 'none'
    })

    tabSignupBtn.addEventListener('click', () => {
      tabSignupBtn.classList.add('active')
      tabLoginBtn.classList.remove('active')
      formSignup.style.display = 'block'
      formLogin.style.display = 'none'
    })
  }

  // --- Login & Registration Flow ---
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = document.getElementById('login-email').value.trim()
      const password = document.getElementById('login-password').value
      const submitBtn = document.getElementById('btn-login-submit')

      submitBtn.disabled = true
      submitBtn.innerText = '登入中...'

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        showToast('登入成功！歡迎回到建築師公會。', 'success')
        closeModal(modalLogin)
        formLogin.reset()
      } catch (err) {
        showToast(err.message || '登入失敗，請檢查您的帳號密碼。', 'error')
      } finally {
        submitBtn.disabled = false
        submitBtn.innerText = '登入'
      }
    })
  }

  if (formSignup) {
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = document.getElementById('signup-email').value.trim()
      const password = document.getElementById('signup-password').value
      const submitBtn = document.getElementById('btn-signup-submit')

      submitBtn.disabled = true
      submitBtn.innerText = '註冊中...'

      try {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        showToast('註冊成功！若設定了信箱驗證，請至信箱點擊驗證連結。', 'success')
        closeModal(modalLogin)
        formSignup.reset()
      } catch (err) {
        showToast(err.message || '註冊失敗，請稍後再試。', 'error')
      } finally {
        submitBtn.disabled = false
        submitBtn.innerText = '註冊'
      }
    })
  }

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      showToast('您已成功登出。', 'success')
    } catch (err) {
      showToast('登出失敗：' + err.message, 'error')
    }
  }

  // --- Apply Application Section ---
  if (btnApplyTrigger) {
    btnApplyTrigger.addEventListener('click', () => {
      if (!currentUser) {
        showToast('此服務僅限會員使用，請先登入會員。', 'error')
        openModal(modalLogin)
      } else {
        openModal(modalApply)
      }
    })
  }

  if (formApply) {
    formApply.addEventListener('submit', async (e) => {
      e.preventDefault()
      if (!currentUser) {
        showToast('請先登入會員再行申辦。', 'error')
        closeModal(modalApply)
        openModal(modalLogin)
        return
      }

      const type = document.getElementById('apply-type').value
      const name = document.getElementById('apply-name').value.trim()
      const phone = document.getElementById('apply-phone').value.trim()
      const project = document.getElementById('apply-project').value.trim()
      const details = document.getElementById('apply-details').value.trim()
      const submitBtn = document.getElementById('btn-apply-submit')

      submitBtn.disabled = true
      submitBtn.innerText = '傳送中...'

      try {
        const { data, error } = await supabase
          .from('applications')
          .insert({
            user_id: currentUser.id,
            type,
            applicant_name: name,
            applicant_phone: phone,
            project_name: project,
            details
          })

        if (error) throw error

        showToast('線上申辦成功！我們會盡快與您聯絡。', 'success')
        closeModal(modalApply)
        formApply.reset()
      } catch (err) {
        console.error('Submission error:', err)
        showToast('送出失敗：' + (err.message || '請確認您是否有足夠權限。'), 'error')
      } finally {
        submitBtn.disabled = false
        submitBtn.innerText = '送出申請'
      }
    })
  }

  // --- Smooth scroll for internal anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href')
      const target = document.querySelector(href)
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })

  // --- Initialization ---
  checkSession()
  fetchAnnouncements()
})
