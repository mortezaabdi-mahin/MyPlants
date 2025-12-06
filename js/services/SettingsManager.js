import { get, set } from './Database.js';

export async function toggleDarkMode() {
    const isDark = document.getElementById('dark-mode-toggle').checked;
    if(isDark) { 
        document.body.classList.add('dark-mode'); 
        await set('theme', 'dark'); // ذخیره در DB
    } else { 
        document.body.classList.remove('dark-mode'); 
        await set('theme', 'light'); 
    }
}

export async function initTheme() {
    const theme = await get('theme'); // خواندن از DB
    if(theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-toggle').checked = true;
    }
}

export async function backup() {
    // خواندن همزمان باغچه و تم
    const garden = await get('myGarden') || [];
    const theme = await get('theme') || 'light';
    
    const data = { garden, theme };
    const blob = new Blob([JSON.stringify(data)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup-idb.json';
    a.click();
}

export function restore(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const d = JSON.parse(e.target.result);
            if(d.garden) await set('myGarden', d.garden);
            if(d.theme) await set('theme', d.theme);
            alert("بازگردانی انجام شد!");
            location.reload();
        } catch(err) {
            alert("فایل خراب است");
        }
    };
    reader.readAsText(file);
}