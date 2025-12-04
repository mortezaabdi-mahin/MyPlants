import * as Encyclo from './services/Encyclopedia.js';
import * as Garden from './services/GardenManager.js';
import * as Wiki from './services/WikiService.js';
import * as Settings from './services/SettingsManager.js';
import { fetchJson } from './utils.js';
import { EduItem } from './components/EduItem.js';

// --- مدیریت آموزش‌ها (ساده شده در اینجا) ---
let eduData = [];
async function loadEdu() {
    eduData = await fetchJson('education.json') || [];
}
function renderEdu() {
    const el = document.getElementById('edu-content');
    if(!el.innerHTML && eduData.length) {
        el.innerHTML = eduData.map((item, idx) => EduItem(item, idx)).join('');
    }
}
function toggleEdu(idx) {
    const body = document.getElementById(`edu-${idx}`);
    const isOpen = body.classList.contains('open');
    document.querySelectorAll('.edu-body').forEach(e => e.classList.remove('open'));
    if(!isOpen) body.classList.add('open');
}

// --- مدیریت تب‌ها ---
function switchTab(name) {
    document.querySelectorAll('.tab-section').forEach(e => e.style.display = 'none');
    document.getElementById(`tab-${name}`).style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
    // پیدا کردن ایندکس ساده بر اساس نام (برای هایلایت نویگیشن)
    const navs = ['home','garden','edu','settings'];
    const idx = navs.indexOf(name);
    if(idx > -1) document.querySelectorAll('.nav-item')[idx].classList.add('active');

    if(name === 'garden') Garden.render();
    if(name === 'edu') renderEdu();
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- اتصال به Window (برای دسترسی HTML) ---
window.app = {
    // Encyclopedia
    filterPlants: Encyclo.filter,
    displayPlantInfo: Encyclo.displayPlantInfo,
    clearSearch: Encyclo.clearSearch,
    
    // Garden
    openAddModal: Garden.openAddModal,
    confirmAddToGarden: Garden.confirmAdd,
    waterPlant: Garden.water,
    deletePlant: Garden.deleteP,
    openDiary: Garden.openDiary,
    saveLog: Garden.saveLog,
    
    // Wiki
    fetchWiki: Wiki.fetchWiki,
    
    // Settings
    toggleDarkMode: Settings.toggleDarkMode,
    backupData: Settings.backup,
    triggerRestore: () => document.getElementById('restore-input').click(),
    restoreData: Settings.restore,
    
    // General
    switchTab: switchTab,
    closeModal: closeModal,
    toggleEdu: toggleEdu
};

// --- شروع برنامه ---
window.onload = async () => {
    Settings.initTheme();
    await Encyclo.loadData();
    await loadEdu();
};