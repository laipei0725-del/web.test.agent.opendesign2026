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

const ecpayForm = document.getElementById('ecpay-checkout-form');
const checkoutFields = document.getElementById('checkout-fields');
const checkoutLoading = document.getElementById('checkout-loading-state');

let selectedCourse = null;

// ECPay Official Test Credentials (Sandbox)
const MERCHANT_ID = '3002607';
const HASH_KEY = 'pwFHCqoQZGmho4w6';
const HASH_IV = 'EkRm7iFT261dpevs';

// Helper to format Date as yyyy/MM/dd HH:mm:ss
function formatECPayDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}`;
}

// Generate CheckMacValue according to ECPay specification
function calculateCheckMacValue(params, hashKey, hashIV) {
  // 1. Sort by key alphabetically A-Z
  const sortedKeys = Object.keys(params).sort();
  
  // 2. Join as key=value string
  let rawStr = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&');
    
  // 3. Add HashKey at front and HashIV at end
  rawStr = `HashKey=${hashKey}&${rawStr}&HashIV=${hashIV}`;
  
  // 4. URL Encode
  let encodedStr = encodeURIComponent(rawStr);
  
  // 5. Replace standard URL encode characters with ECPay specific ones (.NET encoding style)
  encodedStr = encodedStr
    .replace(/%2D/g, '-')
    .replace(/%5F/g, '_')
    .replace(/%2E/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2A/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%20/g, '+');
    
  // 6. Convert to lowercase
  const lowerStr = encodedStr.toLowerCase();
  
  // 7. Calculate SHA256 and convert to UPPERCASE
  const sha256 = CryptoJS.SHA256(lowerStr).toString(CryptoJS.enc.Hex).toUpperCase();
  
  return sha256;
}

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

function submitECPayPayment() {
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
  
  // ECPay specific trade parameters
  const tradeDate = formatECPayDate();
  const tradeNo = 'D' + new Date().getTime().toString().substring(3); // Unique and max 20 chars
  
  const params = {
    MerchantID: MERCHANT_ID,
    MerchantTradeNo: tradeNo,
    MerchantTradeDate: tradeDate,
    PaymentType: 'aio',
    TotalAmount: selectedCourse.price,
    TradeDesc: `Dance Creator OS - ${selectedCourse.title}`,
    ItemName: `${selectedCourse.title} 單堂約課`,
    ReturnURL: window.location.origin + window.location.pathname,
    ChoosePayment: 'Credit',
    EncryptType: '1',
    ClientBackURL: window.location.origin + window.location.pathname
  };
  
  // Calculate signature
  const checkMacValue = calculateCheckMacValue(params, HASH_KEY, HASH_IV);
  
  // Insert values into the hidden form
  document.getElementById('ecpay-MerchantID').value = params.MerchantID;
  document.getElementById('ecpay-MerchantTradeNo').value = params.MerchantTradeNo;
  document.getElementById('ecpay-MerchantTradeDate').value = params.MerchantTradeDate;
  document.getElementById('ecpay-PaymentType').value = params.PaymentType;
  document.getElementById('ecpay-TotalAmount').value = params.TotalAmount;
  document.getElementById('ecpay-TradeDesc').value = params.TradeDesc;
  document.getElementById('ecpay-ItemName').value = params.ItemName;
  document.getElementById('ecpay-ReturnURL').value = params.ReturnURL;
  document.getElementById('ecpay-ChoosePayment').value = params.ChoosePayment;
  document.getElementById('ecpay-EncryptType').value = params.EncryptType;
  document.getElementById('ecpay-ClientBackURL').value = params.ClientBackURL;
  document.getElementById('ecpay-CheckMacValue').value = checkMacValue;
  
  // Submit the form to ECPay AioCheckOut Gateway
  setTimeout(() => {
    ecpayForm.submit();
  }, 1000);
}

// Expose functions globally for HTML triggers
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.submitECPayPayment = submitECPayPayment;

// Run on load
document.addEventListener('DOMContentLoaded', initBookingPage);
