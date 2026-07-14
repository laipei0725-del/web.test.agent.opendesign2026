// blog.js – Fetch and render blog posts dynamically from Supabase
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('blog-posts-container')
  const toastContainer = document.getElementById('toast-container')

  // --- Helper: Toast Notification ---
  function showToast(message, type = 'info') {
    if (!toastContainer) return
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.innerHTML = `
      <span>${message}</span>
      <button style="background:transparent;border:none;color:inherit;cursor:pointer;font-size:1.1rem;margin-left:1rem;">&times;</button>
    `
    toast.querySelector('button').addEventListener('click', () => toast.remove())
    toastContainer.appendChild(toast)
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0'
        toast.style.transform = 'translateY(20px)'
        toast.style.transition = 'all 0.3s ease'
        setTimeout(() => toast.remove(), 300)
      }
    }, 4000)
  }

  // --- Fetch & Render Blogs ---
  async function fetchBlogPosts() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        postsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-muted);">目前尚無部落格文章。</p>'
        return
      }

      postsContainer.innerHTML = data.map(post => {
        const imgUrl = post.image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600'
        return `
          <article class="card" data-category="blog">
            <img src="${imgUrl}" alt="${post.title}" class="card-img" onerror="this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600'" />
            <h3 class="card-title" style="margin-bottom: 0.5rem;">${post.title}</h3>
            <p class="card-desc" style="margin-bottom: 1.5rem;">${post.description}</p>
            <button class="cta-button btn-read-more" data-id="${post.id}" style="margin: 0 1rem 1.5rem; border: none; cursor: pointer; text-align: center;">閱讀全文</button>
          </article>
        `
      }).join('')

      // Attach click events to "閱讀全文" buttons
      document.querySelectorAll('.btn-read-more').forEach(button => {
        button.addEventListener('click', () => {
          const postId = button.dataset.id
          const post = data.find(p => p.id === postId)
          if (post) {
            openArticleModal(post)
          }
        })
      })

    } catch (err) {
      console.error('Error fetching blog posts:', err)
      showToast('無法載入部落格文章，請稍後再試。', 'error')
      postsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff5b5b;">資料載入失敗。</p>'
    }
  }

  // --- Dynamic Article Modal ---
  function openArticleModal(post) {
    // Create modal backdrop and container
    const backdrop = document.createElement('div')
    backdrop.className = 'modal-backdrop'
    
    // Add custom style override to expand width for readable article body
    backdrop.innerHTML = `
      <div class="modal-container" style="max-width: 700px; max-height: 85vh; overflow-y: auto;">
        <button class="modal-close" id="btn-close-article-modal">&times;</button>
        <img src="${post.image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600'}" alt="${post.title}" style="width:100%; height:250px; object-fit:cover; border-radius:6px; margin-bottom:1.5rem;" />
        <h2 style="color: var(--color-primary); margin-bottom: 0.5rem;">${post.title}</h2>
        <div style="font-size: 0.85rem; color: var(--color-muted); margin-bottom: 1.5rem;">
          發佈日期：${new Date(post.created_at).toLocaleDateString('zh-TW')}
        </div>
        <div style="line-height: 1.8; color: var(--color-text); font-size: 1.05rem; white-space: pre-wrap;">
          ${post.content || post.description}
        </div>
      </div>
    `

    document.body.appendChild(backdrop)

    // Trigger transition animation
    setTimeout(() => backdrop.classList.add('show'), 10)

    // Close logic
    const closeBtn = backdrop.querySelector('#btn-close-article-modal')
    const close = () => {
      backdrop.classList.remove('show')
      setTimeout(() => backdrop.remove(), 300)
    }

    closeBtn.addEventListener('click', close)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close()
    })
  }

  // Fetch blogs on load
  fetchBlogPosts()
})
