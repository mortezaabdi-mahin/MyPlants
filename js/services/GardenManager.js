import { GardenItem } from '../components/GardenItem.js';
import { DiaryItem } from '../components/DiaryItem.js';
import { get, set } from './Database.js'; // استفاده از دیتابیس اصلی

let selectedPlant = null;
let currentDiaryId = null;

// --- افزودن گیاه ---
export function openAddModal(name) {
    selectedPlant = name;
    document.getElementById('modal-nickname').value = name;
    // پاک کردن ورودی عکس قبلی اگر وجود دارد
    const imgInput = document.getElementById('modal-plant-image');
    if(imgInput) imgInput.value = '';
    
    document.getElementById('add-modal').style.display = 'flex';
}

// تبدیل عکس به فرمت متنی برای ذخیره در دیتابیس
const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = (error) => reject(error);
    });
};

export async function confirmAdd() {
    const nick = document.getElementById('modal-nickname').value || selectedPlant;
    const days = parseInt(document.getElementById('modal-days').value) || 7;
    const fileInput = document.getElementById('modal-plant-image');
    
    let imageBase64 = null;
    if (fileInput && fileInput.files[0]) {
        try {
            imageBase64 = await convertBase64(fileInput.files[0]);
        } catch (e) {
            console.error("Image Error", e);
        }
    }
    
    const garden = await getGardenData();
    garden.push({
        id: Date.now(),
        originalName: selectedPlant,
        nickname: nick,
        waterInterval: days,
        lastWatered: new Date().toISOString(),
        image: imageBase64, // ذخیره عکس
        logs: []
    });
    
    await saveGardenData(garden);
    document.getElementById('add-modal').style.display = 'none';
    render(); 
}

// --- نمایش لیست باغچه ---
export async function render() {
    const garden = await getGardenData();
    const list = document.getElementById('my-garden-list');
    
    if(!garden || garden.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>هنوز گیاهی اضافه نکرده‌اید.</p></div>';
        return;
    }
    
    // رندرсинکرونوس (چون GardenItem تابع ساده است)
    list.innerHTML = garden.map(p => GardenItem(p)).join('');
}

// --- آبیاری و حذف ---
export async function water(id) {
    const garden = await getGardenData();
    const p = garden.find(item => item.id === id);
    if(p) {
        p.lastWatered = new Date().toISOString();
        if(!p.logs) p.logs = [];
        p.logs.push({
            id: Date.now(), type: 'water', date: new Date().toISOString().slice(0,10), note: 'آبیاری ثبت شد (خودکار)'
        });
        
        await saveGardenData(garden);
        render();
        checkNotifications(); // بررسی برای نوتیفیکیشن بعدی
    }
}

export async function deleteP(id) {
    if(!confirm('آیا از حذف این گیاه مطمئن هستید؟')) return;
    let garden = await getGardenData();
    garden = garden.filter(i => i.id !== id);
    await saveGardenData(garden);
    render();
}

// --- مدیریت دفترچه خاطرات ---
export async function openDiary(id) {
    currentDiaryId = id;
    const garden = await getGardenData();
    const p = garden.find(item => item.id === id);
    if(p) {
        document.getElementById('diary-title').innerText = `تاریخچه: ${p.nickname}`;
        document.getElementById('diary-modal').style.display = 'flex';
        renderLogs(p);
    }
}

export async function saveLog() {
    const type = document.getElementById('log-type').value;
    const dateInput = document.getElementById('log-date').value;
    const date = dateInput || new Date().toISOString().slice(0,10);
    const note = document.getElementById('log-note').value;
    
    if(!note.trim()) return alert('لطفاً متنی بنویسید');
    
    const garden = await getGardenData();
    const p = garden.find(i => i.id === currentDiaryId);
    
    if(p) {
        if(!p.logs) p.logs = [];
        p.logs.push({ id: Date.now(), type, date, note });
        
        if(type === 'water') p.lastWatered = new Date().toISOString();
        
        await saveGardenData(garden);
        renderLogs(p);
        render();
        document.getElementById('log-note').value = '';
    }
}

export async function deleteLog(logId) {
    if(!confirm("آیا این یادداشت حذف شود؟")) return;
    const garden = await getGardenData();
    const p = garden.find(i => i.id === currentDiaryId);
    if(p && p.logs) {
        p.logs = p.logs.filter(l => l.id !== logId);
        await saveGardenData(garden);
        renderLogs(p);
    }
}

function renderLogs(plant) {
    const list = document.getElementById('diary-list');
    if(!plant.logs || plant.logs.length === 0) {
        list.innerHTML = '<div class="empty-state" style="font-size:0.9rem;">هنوز رویدادی ثبت نشده است.</div>';
        return;
    }
    const sorted = plant.logs.sort((a,b) => new Date(b.date) - new Date(a.date));
    list.innerHTML = sorted.map(log => DiaryItem(log)).join('');
}

// --- توابع کمکی دیتابیس (جایگزین LocalStorage) ---
async function getGardenData() {
    const data = await get('myGarden');
    return data || [];
}

async function saveGardenData(data) {
    await set('myGarden', data);
}

// درخواست مجوز نوتیفیکیشن
export function checkNotifications() {
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}