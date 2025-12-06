// ایمپورت کردن تمام سرویس‌ها و کامپوننت‌ها
import * as Encyclo from './services/Encyclopedia.js';
import * as Garden from './services/GardenManager.js';
import * as Wiki from './services/WikiService.js';
import * as Settings from './services/SettingsManager.js';
import * as Quiz from './services/QuizManager.js';
import { fetchJson } from './utils.js';
import { EduItem } from './components/EduItem.js';

/* =========================================
   ۱. مدیریت بخش آموزش (Education)
   ========================================= */
let eduData = [];

async function loadEdu() {
    // دریافت اطلاعات از فایل JSON
    eduData = await fetchJson('education.json') || [];
}

function renderEdu() {
    const container = document.getElementById('edu-content');
    
    // اگر قبلاً رندر شده یا دیتا خالی است، کاری نکن
    if (container.innerHTML !== "" || eduData.length === 0) return;

    // استفاده از کامپوننت EduItem
    container.innerHTML = eduData.map((item, index) => EduItem(item, index)).join('');
}

function toggleEdu(index) {
    const body = document.getElementById(`edu-${index}`);
    const isOpen = body.classList.contains('open');
    
    // بستن همه آکاردئون‌ها
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
    document.getElementById(`tab-${tabName}`).style.display = 'block';
    
    // مدیریت کلاس active در نویگیشن پایین
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    const tabs = ['home', 'garden', 'quiz', 'edu', 'settings'];
    const index = tabs.indexOf(tabName);
    if (index > -1) {
        document.querySelectorAll('.nav-item')[index].classList.add('active');
    }

    // لود کردن محتوای اختصاصی هر تب هنگام ورود
    if (tabName === 'garden') Garden.render();
    if (tabName === 'edu') renderEdu();
    if (tabName === 'quiz') Quiz.renderQuizTab();
}

// تابع عمومی بستن مودال‌ها
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

/* =========================================
   ۳. اتصال به HTML (Window Binding)
   چون ماژول‌ها ایزوله هستند، توابع باید به window وصل شوند
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
    // ۱. اعمال تم ذخیره شده
    Settings.initTheme();
    
    // ۲. بارگذاری تمام دیتابیس‌ها به صورت موازی
    await Promise.all([
        Encyclo.loadData(),
        loadEdu(),
        Quiz.loadQuizData()
    ]);
    
    console.log("✅ Application Started Successfully");
};

// ثبت سرویس ورکر برای حالت آفلاین
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Error:', err));
    });
}