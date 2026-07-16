import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = 'https://kremauxwtwobmbjwbzzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZW1hdXh3dHdvYm1iandienpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0ODYxMTAsImV4cCI6MjA5OTA2MjExMH0.smMJiEQ4n7qr5tpmR54EXPPMNakt1rM1ZM-pw4s5ABw';
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const classesGrid = document.getElementById('booking-classes-grid');
const checkoutModal = document.getElementById('checkout-modal');
const payCourseTitle = document.getElementById('pay-course-title');
const payCoursePrice = document.getElementById('pay-course-price');
const studentNameInput = document.getElementById('pay-student-name');
const studentEmailInput = document.getElementById('pay-student-email');
const studentPhoneInput = document.getElementById('pay-student-phone');

const mpgForm = document.getElementById('newebpay-mpg-form');
const mpgMerchantID = document.getElementById('mpg-MerchantID');
const mpgTradeInfo = document.getElementById('mpg-TradeInfo');
const mpgTradeSha = document.getElementById('mpg-TradeSha');
const mpgVersion = document.getElementById('mpg-Version');

const checkoutFields = document.getElementById('checkout-fields');
const checkoutLoading = document.getElementById('checkout-loading-state');

let selectedCourse = null;

// NewebPay Test Sandbox Credentials
const MERCHANT_ID = 'MS32917965';
const HASH_KEY = '12345678901234567890123456789012';
const HASH_IV = '1234567890123456';

// Initialize and Fetch Classes
async function initBookingPage() {
  try {
    // Check local storage for theme
    const savedTheme = localStorage.getItem('dance-creator-theme') || 'light';
    document.body.className = `theme-${savedTheme}`;

    const { data: courses, error } = await supabase.from('courses').select('*').order('title');
    if (error) throw error;
    
    // Add a hardcoded One-on-One session to showcase all SOP options
    const list = [...(courses || [])];
    if (!list.some(c => c.title.includes('One-on-One'))) {
      list.push({
        id: 'one-on-one-private',
        title: 'One-on-One Private Lesson',
        style: 'Custom Style',
        time_slot: '預約預定制 (By Appointment)',
        location: 'Studio A / B',
        student_count: 1
      });
    }

    renderCourses(list);
  } catch (err) {
    console.error('Failed to load courses:', err);
    classesGrid.innerHTML = `<p style="color:var(--color-warning);">❌ 無法讀取課程資料，請檢查網路後重試。</p>`;
  }
}

function renderCourses(courses) {
  classesGrid.innerHTML = '';
  courses.forEach(c => {
    // Determine price based on title
    let price = 450;
    let priceDesc = '體驗單堂價';
    if (c.title.includes('Choreography')) {
      price = 600;
      priceDesc = '常態單堂價';
    } else if (c.title.includes('One-on-One') || c.title.includes('Private')) {
      price = 2000;
      priceDesc = '一對一單堂價';
    }
    
    const card = document.createElement('div');
    card.className = 'glass-card course-card';
    card.innerHTML = `
      <h3 class="course-title">${c.title}</h3>
      <div class="course-meta">
        <div class="course-meta-item"><span style="margin-right: 6px;">🏷️</span>風格：${c.style || '雷鬼舞'}</div>
        <div class="course-meta-item"><span style="margin-right: 6px;">⏰</span>時段：${c.time_slot}</div>
        <div class="course-meta-item"><span style="margin-right: 6px;">📍</span>教室：${c.location}</div>
      </div>
      <div class="course-price-box">
        <span class="price-label">${priceDesc}</span>
        <span class="price-val">NT$ ${price}</span>
      </div>
      <button class="btn btn-primary btn-book" onclick="openCheckoutModal('${c.title.replace(/'/g, "\\'")}', ${price})">
        ⚡ 立即單堂約課
      </button>
    `;
    classesGrid.appendChild(card);
  });
}

function openCheckoutModal(title, price) {
  selectedCourse = { title, price };
  payCourseTitle.value = title;
  payCoursePrice.value = `NT$ ${price}`;
  
  checkoutFields.style.display = 'block';
  checkoutLoading.style.display = 'none';
  checkoutModal.classList.add('active');
}

function closeCheckoutModal() {
  checkoutModal.classList.remove('active');
}

function submitNewebPayPayment() {
  if (!selectedCourse) return;
  
  const name = studentNameInput.value.trim();
  const email = studentEmailInput.value.trim();
  const phone = studentPhoneInput.value.trim();
  
  if (!name || !email || !phone) {
    alert('⚠️ 請填寫完整的預約人姓名、電子信箱與手機號碼！');
    return;
  }
  
  checkoutFields.style.display = 'none';
  checkoutLoading.style.display = 'flex';
  
  // Create NewebPay transaction details
  const timestamp = Math.round(new Date().getTime() / 1000);
  const orderNo = 'DANCE_' + timestamp;
  
  const params = {
    MerchantID: MERCHANT_ID,
    RespondType: 'JSON',
    TimeStamp: timestamp,
    Version: '2.0',
    MerchantOrderNo: orderNo,
    Amt: selectedCourse.price,
    ItemDesc: `${selectedCourse.title} - 單堂約課`,
    Email: email,
    LoginType: 0,
    CREDIT: 1,
    ReturnURL: window.location.origin + window.location.pathname,
    ClientBackURL: window.location.origin + window.location.pathname
  };
  
  // Format parameters to URL Query String
  const paramString = Object.entries(params)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
    
  // AES-256-CBC encryption using CryptoJS
  const key = CryptoJS.enc.Utf8.parse(HASH_KEY);
  const iv = CryptoJS.enc.Utf8.parse(HASH_IV);
  const encrypted = CryptoJS.AES.encrypt(paramString, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  const tradeInfo = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  
  // Calculate SHA-256 TradeSha
  const shaString = `HashKey=${HASH_KEY}&${tradeInfo}&HashIV=${HASH_IV}`;
  const tradeSha = CryptoJS.SHA256(shaString).toString(CryptoJS.enc.Hex).toUpperCase();
  
  // Set hidden form parameters
  mpgMerchantID.value = MERCHANT_ID;
  mpgTradeInfo.value = tradeInfo;
  mpgTradeSha.value = tradeSha;
  mpgVersion.value = '2.0';
  
  // Submit the form to NewebPay MPG Gateway
  setTimeout(() => {
    mpgForm.submit();
  }, 1000);
}

// Expose functions globally for HTML triggers
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.submitNewebPayPayment = submitNewebPayPayment;

// Run on load
document.addEventListener('DOMContentLoaded', initBookingPage);
