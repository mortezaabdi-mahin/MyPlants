import { GardenItem } from '../components/GardenItem.js';
import { DiaryItem } from '../components/DiaryItem.js'; 

let selectedPlant = null;
let currentDiaryId = null;

// --- افزودن گیاه ---
export function openAddModal(name) {
    selectedPlant = name;
    document.getElementById('modal-nickname').value = name;
    document.getElementById('add-modal').style.display = 'flex';
}

export function confirmAdd() {
    const nick = document.getElementById('modal-nickname').value || selectedPlant;
    const days = parseInt(document.getElementById('modal-days').value) || 7;
    
    const garden = getGarden();
    garden.push({
        id: Date.now(),
        originalName: selectedPlant,
        nickname: nick,
        waterInterval: days,
        lastWatered: new Date().toISOString(),
        logs: []
    });
    
    saveGarden(garden);
    document.getElementById('add-modal').style.display = 'none';
    alert('گیاه با موفقیت اضافه شد!');
    render(); // رفرش لیست
}

// --- نمایش لیست باغچه ---
export function render() {
    const garden = getGarden();
    const list = document.getElementById('my-garden-list');
    
    if(!garden || garden.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>هنوز گیاهی اضافه نکرده‌اید.</p></div>';
        return;
    }
    
    // استفاده از کامپوننت GardenItem
    list.innerHTML = garden.map(p => GardenItem(p)).join('');
}

// --- آبیاری و حذف ---
export function water(id) {
    const garden = getGarden();
    const p = garden.find(item => item.id === id);
    if(p) {
        p.lastWatered = new Date().toISOString();
        
        // ثبت خودکار در دفترچه
        if(!p.logs) p.logs = [];
        p.logs.push({
            id: Date.now(),
            type: 'water',
            date: new Date().toISOString().slice(0,10),
            note: 'آبیاری ثبت شد (خودکار)'
        });
        
        saveGarden(garden);
        render();
    }
}

export function deleteP(id) {
    if(!confirm('آیا از حذف این گیاه مطمئن هستید؟')) return;
    const garden = getGarden().filter(i => i.id !== id);
    saveGarden(garden);
    render();
}

// --- مدیریت دفترچه خاطرات (Diary) ---
export function openDiary(id) {
    currentDiaryId = id;
    const p = getGarden().find(item => item.id === id);
    if(p) {
        document.getElementById('diary-title').innerText = `تاریخچه: ${p.nickname}`;
        document.getElementById('diary-modal').style.display = 'flex';
        renderLogs(p);
    }
}

export function saveLog() {
    const type = document.getElementById('log-type').value;
    // اگر تاریخ خالی بود، امروز را بزن
    const dateInput = document.getElementById('log-date').value;
    const date = dateInput || new Date().toISOString().slice(0,10);
    const note = document.getElementById('log-note').value;
    
    if(!note.trim()) return alert('لطفاً متنی بنویسید');
    
    const garden = getGarden();
    const p = garden.find(i => i.id === currentDiaryId);
    
    if(p) {
        if(!p.logs) p.logs = [];
        
        const newLog = { id: Date.now(), type, date, note };
        p.logs.push(newLog);
        
        // اگر نوع لاگ آبیاری بود، زمان آبیاری گیاه هم آپدیت شود
        if(type === 'water') {
            p.lastWatered = new Date().toISOString();
        }
        
        saveGarden(garden);
        renderLogs(p);
        render(); // برای آپدیت وضعیت کارت اصلی
        
        // خالی کردن ورودی
        document.getElementById('log-note').value = '';
    }
}

export function deleteLog(logId) {
    if(!confirm("آیا این یادداشت حذف شود؟")) return;
    
    const garden = getGarden();
    const p = garden.find(i => i.id === currentDiaryId);
    
    if(p && p.logs) {
        p.logs = p.logs.filter(l => l.id !== logId);
        saveGarden(garden);
        renderLogs(p);
    }
}

function renderLogs(plant) {
    const list = document.getElementById('diary-list');
    
    if(!plant.logs || plant.logs.length === 0) {
        list.innerHTML = '<div class="empty-state" style="font-size:0.9rem; padding:20px;">هنوز رویدادی ثبت نشده است.</div>';
        return;
    }
    
    // مرتب‌سازی از جدید به قدیم
    const sorted = plant.logs.sort((a,b) => new Date(b.date) - new Date(a.date));
    
    // استفاده از کامپوننت DiaryItem
    list.innerHTML = sorted.map(log => DiaryItem(log)).join('');
}

// --- توابع کمکی LocalStorage ---
function getGarden() { 
    return JSON.parse(localStorage.getItem('myGarden')) || []; 
}

function saveGarden(data) { 
    localStorage.setItem('myGarden', JSON.stringify(data)); 
}