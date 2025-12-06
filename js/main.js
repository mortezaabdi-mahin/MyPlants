// 1. ایمپورت کردن تمام سرویس‌ها و ابزارها
// دقت کنید که مسیرها دقیق باشند (./ یعنی همین پوشه)
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
    try {
        const data = await fetchJson('education.json');
        if (data && data.length > 0) {
            eduData = data;
            // اگر کاربر الان در تب آموزش است، رفرش کن
            if (document.getElementById('tab-edu').style.display === 'block') {
                renderEdu();
            }
        }
    } catch (e) {
        console.error("Error loading education:", e);
    }
}

function renderEdu() {
    const container = document.getElementById('edu-content');
    
    // جلوگیری از رندر تکراری یا خالی
    if (!eduData || eduData.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>در حال بارگذاری...</p></div>';
        return;
    }

    container.innerHTML = eduData.map((item, index) => EduItem(item, index)).join('');
}

function toggleEdu(index) {
    const body = document.getElementById(`edu-${index}`);
    if (!body) return;
    
    const isOpen = body.classList.contains('open');
    
    // بستن بقیه
    document.querySelectorAll('.edu-body').forEach(el => el.classList.remove('open'));
    
    // باز کردن کلیک شده
    if (!isOpen) body.classList.add('open');
}

/* =========================================
   ۲. مدیریت تب‌ها (Navigation)
   ========================================= */
function switchTab(tabName) {
    // مخفی کردن همه
    document.querySelectorAll('.tab-section').forEach(el => el.style.display = 'none');
    
    // نمایش تب مورد نظر
    const target = document.getElementById(`tab-${tabName}`);
    if (target) target.style.display = 'block';
    
    // آپدیت نویگیشن پایین
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    const tabs = ['home', 'garden', 'quiz', 'edu', 'settings'];
    const index = tabs.indexOf(tabName);
    if (index > -1) {
        document.querySelectorAll('.nav-item')[index].classList.add('active');
    }

    // لود کردن محتوای تب‌های خاص
    if (tabName === 'garden') Garden.render();
    if (tabName === 'edu') renderEdu();
    if (tabName === 'quiz') Quiz.renderQuizTab();
}

// تابع بستن مودال
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.style.display = 'none';
}

/* =========================================
   ۳. اتصال توابع به HTML (Window Binding)
   این مهم‌ترین بخش است! بدون این، دکمه‌ها کار نمی‌کنند.
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
    triggerRestore: Settings.triggerRestore || (() => document.getElementById('restore-input').click()),
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
   ۴. شروع برنامه (Startup)
   ========================================= */
window.onload = async () => {
    console.log("🚀 App Starting...");
    
    try {
        // ۱. تنظیم تم (دارک/لایت)
        await Settings.initTheme();
        
        // ۲. لود کردن تمام دیتابیس‌ها به صورت موازی
        await Promise.all([
            Encyclo.loadData(),
            loadEdu(),
            Quiz.loadQuizData()
        ]);
        
        console.log("✅ App Loaded Successfully");
        
    } catch (e) {
        console.error("❌ Critical Error during startup:", e);
    }
};

// ثبت سرویس ورکر
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Failed', err));
    });
}