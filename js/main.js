// js/main.js

// 1. ایمپورت کردن تمام سرویس‌ها و کامپوننت‌ها
import * as Encyclo from './services/Encyclopedia.js';
import * as Garden from './services/GardenManager.js';
import * as Wiki from './services/WikiService.js';
import * as Settings from './services/SettingsManager.js';
import * as Quiz from './services/QuizManager.js';
import { fetchJson } from './utils.js';
import { EduItem } from './components/EduItem.js'; // <--- حیاتی برای نمایش آموزش

/* =========================================
   ۱. مدیریت بخش آموزش (Education) - اصلاح شده
   ========================================= */
let eduData = [];

async function loadEdu() {
    try {
        const data = await fetchJson('education.json');
        if (data && data.length > 0) {
            eduData = data;
            console.log("✅ آموزش‌ها لود شد:", eduData.length, "آیتم");
            
            // اگر کاربر همین الان در تب آموزش است، رفرش کن
            const eduTab = document.getElementById('tab-edu');
            if (eduTab && eduTab.style.display !== 'none') {
                renderEdu();
            }
        } else {
            console.warn("⚠️ فایل education.json خالی است یا یافت نشد.");
        }
    } catch (e) {
        console.error("❌ خطا در لود آموزش:", e);
    }
}

function renderEdu() {
    const container = document.getElementById('edu-content');
    
    // اگر دیتا هنوز لود نشده
    if (!eduData || eduData.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>در حال بارگذاری مطالب...</p></div>';
        return;
    }

    // رندر کردن آیتم‌ها با استفاده از کامپوننت EduItem
    container.innerHTML = eduData.map((item, index) => EduItem(item, index)).join('');
}

function toggleEdu(index) {
    const body = document.getElementById(`edu-${index}`);
    if (!body) return;
    
    const isOpen = body.classList.contains('open');
    
    // بستن همه آکاردئون‌ها (برای اینکه فقط یکی باز باشد)
    document.querySelectorAll('.edu-body').forEach(el => el.classList.remove('open'));
    
    // اگر بسته بود، بازش کن
    if (!isOpen) body.classList.add('open');
}

/* =========================================
   ۲. مدیریت تب‌ها و ناوبری (Navigation)
   ========================================= */
function switchTab(tabName) {
    // مخفی کردن همه سکشن‌ها
    document.querySelectorAll('.tab-section').forEach(el => el.style.display = 'none');
    
    // نمایش سکشن انتخاب شده
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.style.display = 'block';
    
    // مدیریت کلاس active در نویگیشن پایین
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    const tabs = ['home', 'garden', 'quiz', 'edu', 'settings'];
    const index = tabs.indexOf(tabName);
    if (index > -1) {
        document.querySelectorAll('.nav-item')[index].classList.add('active');
    }

    // لود کردن محتوای اختصاصی هر تب هنگام ورود
    if (tabName === 'garden') Garden.render();
    if (tabName === 'edu') renderEdu();     // <--- فراخوانی رندر آموزش
    if (tabName === 'quiz') Quiz.renderQuizTab();
}

// تابع عمومی بستن مودال‌ها
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

/* =========================================
   ۳. اتصال به HTML (Window Binding)
   ========================================= */
window.app = {
    // --- دانشنامه ---
    filterPlants: Encyclo.filter,
    displayPlantInfo: Encyclo.displayPlantInfo,
    clearSearch: Encyclo.clearSearch,
    
    // --- باغچه و دفترچه ---
    openAddModal: Garden.openAddModal,
    confirmAddToGarden: Garden.confirmAdd,
    waterPlant: Garden.water,
    deletePlant: Garden.deleteP,
    openDiary: Garden.openDiary,
    saveLog: Garden.saveLog,
    deleteLog: Garden.deleteLog,
    
    // --- ویکی‌پدیا ---
    fetchWiki: Wiki.fetchWiki,
    
    // --- تنظیمات ---
    toggleDarkMode: Settings.toggleDarkMode,
    backupData: Settings.backup,
    triggerRestore: () => document.getElementById('restore-input').click(),
    restoreData: Settings.restore,
    
    // --- آزمون ---
    startQuiz: Quiz.startQuiz,
    submitAnswer: Quiz.submitAnswer,
    
    // --- عمومی ---
    switchTab: switchTab,
    closeModal: closeModal,
    toggleEdu: toggleEdu
};

/* =========================================
   ۴. نقطه شروع برنامه (Startup)
   ========================================= */
window.onload = async () => {
    console.log("🚀 App Initializing...");
    
    // ۱. اعمال تم ذخیره شده
    Settings.initTheme();
    
    // ۲. بارگذاری تمام دیتابیس‌ها
    // به ترتیب اجرا می‌شوند تا تداخل ایجاد نشود
    await Encyclo.loadData();
    await loadEdu();
    await Quiz.loadQuizData();
    
    console.log("✅ App Ready");
};

// ثبت سرویس ورکر برای حالت آفلاین
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Error:', err));
    });
}