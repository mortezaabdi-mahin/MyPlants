import { GardenItem } from '../components/GardenItem.js';import { GardenItem } from '../components/GardenItem.js';
import { DiaryItem } from '../components/DiaryItem.js';
// ایمپورت جدید
import { get, set } from './Database.js'; 

let selectedPlant = null;
let currentDiaryId = null;

// --- توابع کمکی دیتابیس ---
async function getGarden() {
    // اگر دیتابیس خالی بود، آرایه خالی برگردان
    return (await get('myGarden')) || []; 
}

async function saveGarden(data) {
    await set('myGarden', data);
}

// --- توابع اصلی ---

export function openAddModal(name) {
    selectedPlant = name;
    document.getElementById('modal-nickname').value = name;
    document.getElementById('add-modal').style.display = 'flex';
}

// نکته: این تابع باید async شود
export async function confirmAdd() {
    const nick = document.getElementById('modal-nickname').value || selectedPlant;
    const days = parseInt(document.getElementById('modal-days').value) || 7;
    
    // ۱. دریافت باغچه (با await)
    const garden = await getGarden();
    
    garden.push({
        id: Date.now(),
        originalName: selectedPlant,
        nickname: nick,
        waterInterval: days,
        lastWatered: new Date().toISOString(),
        logs: []
    });
    
    // ۲. ذخیره باغچه (با await)
    await saveGarden(garden);
    
    document.getElementById('add-modal').style.display = 'none';
    alert('اضافه شد!');
    
    // ۳. رندر مجدد
    render(); 
}

export async function render() {
    const garden = await getGarden(); // await اضافه شد
    const list = document.getElementById('my-garden-list');
    
    if(garden.length === 0) {
        list.innerHTML = '<div class="empty-state">هنوز گیاهی اضافه نکرده‌اید.</div>';
        return;
    }
    list.innerHTML = garden.map(p => GardenItem(p)).join('');
}

export async function water(id) {
    const garden = await getGarden();
    const p = garden.find(item => item.id === id);
    if(p) {
        p.lastWatered = new Date().toISOString();
        if(!p.logs) p.logs = [];
        p.logs.push({id: Date.now(), type:'water', date: new Date().toISOString().slice(0,10), note:'آبیاری خودکار'});
        
        await saveGarden(garden);
        render();
    }
}

export async function deleteP(id) {
    if(!confirm('حذف شود؟')) return;
    let garden = await getGarden();
    garden = garden.filter(i => i.id !== id);
    await saveGarden(garden);
    render();
}

// --- بخش Diary ---
export async function openDiary(id) {
    currentDiaryId = id;
    const garden = await getGarden();
    const p = garden.find(item => item.id === id);
    
    document.getElementById('diary-title').innerText = p.nickname;
    document.getElementById('diary-modal').style.display = 'flex';
    renderLogs(p);
}

export async function saveLog() {
    const type = document.getElementById('log-type').value;
    const date = document.getElementById('log-date').value || new Date().toISOString().slice(0,10);
    const note = document.getElementById('log-note').value;
    
    if(!note) return alert('متن بنویسید');
    
    const garden = await getGarden();
    const p = garden.find(i => i.id === currentDiaryId);
    if(p) {
        if(!p.logs) p.logs = [];
        p.logs.push({id: Date.now(), type, date, note});
        if(type === 'water') p.lastWatered = new Date().toISOString();
        
        await saveGarden(garden);
        renderLogs(p);
        render();
        document.getElementById('log-note').value = '';
    }
}

// توجه: در اینجا چون plant را مستقیم داریم، نیازی به await نیست مگر اینکه بخواهیم لیست را دوباره بگیریم
// اما برای سادگی همان منطق قبلی (رندر HTML) کافیست
function renderLogs(plant) {
    const list = document.getElementById('diary-list');
    if(!plant.logs || plant.logs.length === 0) {
        list.innerHTML = '<div class="empty-state" style="font-size:0.9rem">خالی</div>'; 
        return;
    }
    const sorted = plant.logs.sort((a,b) => new Date(b.date) - new Date(a.date));
    list.innerHTML = sorted.map(l => DiaryItem(l)).join('');
}

export async function deleteLog(logId) {
    if(!confirm("حذف شود؟")) return;
    
    const garden = await getGarden();
    const p = garden.find(i => i.id === currentDiaryId);
    
    if(p && p.logs) {
        p.logs = p.logs.filter(l => l.id !== logId);
        await saveGarden(garden);
        renderLogs(p);
    }
}

let selectedPlant = null;
let currentDiaryId = null;

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
    alert('اضافه شد!');
}

export function render() {
    const garden = getGarden();
    const list = document.getElementById('my-garden-list');
    if(garden.length === 0) {
        list.innerHTML = '<div class="empty-state">خالی</div>';
        return;
    }
    list.innerHTML = garden.map(p => GardenItem(p)).join('');
}

export function water(id) {
    const garden = getGarden();
    const p = garden.find(item => item.id === id);
    if(p) {
        p.lastWatered = new Date().toISOString();
        if(!p.logs) p.logs = [];
        p.logs.push({id: Date.now(), type:'water', date: new Date().toISOString().slice(0,10), note:'آبیاری خودکار'});
        saveGarden(garden);
        render();
    }
}

export function deleteP(id) {
    if(!confirm('حذف شود؟')) return;
    const garden = getGarden().filter(i => i.id !== id);
    saveGarden(garden);
    render();
}

// --- Diary Logic ---
export function openDiary(id) {
    currentDiaryId = id;
    const p = getGarden().find(item => item.id === id);
    document.getElementById('diary-title').innerText = p.nickname;
    document.getElementById('diary-modal').style.display = 'flex';
    renderLogs(p);
}

export function saveLog() {
    const type = document.getElementById('log-type').value;
    const date = document.getElementById('log-date').value || new Date().toISOString().slice(0,10);
    const note = document.getElementById('log-note').value;
    
    if(!note) return alert('متن بنویسید');
    
    const garden = getGarden();
    const p = garden.find(i => i.id === currentDiaryId);
    if(p) {
        if(!p.logs) p.logs = [];
        p.logs.push({id: Date.now(), type, date, note});
        if(type === 'water') p.lastWatered = new Date().toISOString();
        saveGarden(garden);
        renderLogs(p);
        render(); // برای آپدیت تایمر باغچه
        document.getElementById('log-note').value = '';
    }
}

function renderLogs(plant) {
    const list = document.getElementById('diary-list');
    if(!plant.logs || plant.logs.length === 0) {
        list.innerHTML = 'خالی'; return;
    }
    const sorted = plant.logs.sort((a,b) => new Date(b.date) - new Date(a.date));
    list.innerHTML = sorted.map(l => `
        <div class="log-item">
            <div class="log-content" style="border-right:4px solid var(--primary-green); padding:10px; margin-bottom:10px; background:#fff">
                <small>${l.date} | ${l.type}</small>
                <div>${l.note}</div>
            </div>
        </div>
    `).join('');
}

function getGarden() { return JSON.parse(localStorage.getItem('myGarden')) || []; }
function saveGarden(data) { localStorage.setItem('myGarden', JSON.stringify(data)); }