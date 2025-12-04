import { fetchJson } from '../utils.js';
import { PlantCard } from '../components/PlantCard.js';

let plantData = {};

export async function loadData() {
    plantData = await fetchJson('plants.json') || {};
    populateFilters();
    filter(); // نمایش اولیه
}

function populateFilters() {
    const groupSelect = document.getElementById("group-filter");
    const lightSelect = document.getElementById("light-filter");
    const groups = new Set();
    
    for(const k in plantData) if(plantData[k].گروه) groups.add(plantData[k].گروه);
    
    groupSelect.innerHTML = '<option value="all">همه</option>';
    groups.forEach(g => groupSelect.innerHTML += `<option value="${g}">${g}</option>`);

    lightSelect.innerHTML = `
        <option value="all">همه</option>
        <option value="low">سایه‌دوست</option>
        <option value="medium">متوسط</option>
        <option value="high">پرنور</option>
    `;
}

export function filter() {
    const txt = document.getElementById("search-input").value.trim();
    const grp = document.getElementById("group-filter").value;
    const lgt = document.getElementById("light-filter").value;
    const selector = document.getElementById("plant-selector");
    const results = document.getElementById("results");

    selector.innerHTML = '<option value="">-- انتخاب --</option>';
    results.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>جستجو کنید</p></div>';

    let count = 0;
    for (const name in plantData) {
        const p = plantData[name];
        const matchG = grp === "all" || p.گروه === grp;
        const matchS = txt === "" || name.includes(txt);
        let matchL = true;
        if(lgt !== 'all') {
             if (lgt === 'low' && !p.نور.includes("کم") && !p.نور.includes("سایه")) matchL = false;
             if (lgt === 'medium' && !p.نور.includes("متوسط")) matchL = false;
             if (lgt === 'high' && !p.نور.includes("زیاد")) matchL = false;
        }

        if(matchG && matchS && matchL) {
            selector.innerHTML += `<option value="${name}">${name}</option>`;
            count++;
        }
    }
    
    if(count === 0) selector.innerHTML = '<option>یافت نشد</option>';
    else if(count === 1 && txt !== "") {
        selector.selectedIndex = 1;
        displayPlantInfo();
    }
}

export function displayPlantInfo() {
    const name = document.getElementById("plant-selector").value;
    if(!name || !plantData[name]) return;
    document.getElementById("results").innerHTML = PlantCard(name, plantData[name]);
}

export function clearSearch() {
    document.getElementById("search-input").value = "";
    filter();
}