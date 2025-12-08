import { get, set } from './Database.js';

export async function toggleDarkMode() {
    const isDark = document.getElementById('dark-mode-toggle')?.checked || false;
    if(isDark) { 
        document.body.classList.add('dark-mode'); 
        await set('theme', 'dark');
    } else { 
        document.body.classList.remove('dark-mode'); 
        await set('theme', 'light'); 
    }
}

export async function initTheme() {
    try {
        const theme = await get('theme');
        if(theme === 'dark') {
            document.body.classList.add('dark-mode');
            const toggle = document.getElementById('dark-mode-toggle');
            if(toggle) toggle.checked = true;
        }
    } catch (e) {
        console.warn(`⚠️ خطا در بارگذاری تم: ${e.message}`);
        // پیش‌فرض: light mode
    }
}

export async function backup() {
    try {
        const garden = await get('myGarden') || [];
        const theme = await get('theme') || 'light';
        
        const data = { garden, theme };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        console.log('✅ بکاپ دانلود شد');
    } catch (e) {
        console.error('❌ خطا در بکاپ:', e);
        alert('خطا در دانلود بکاپ');
    }
}

export function restore(input) {
    const file = input?.files?.[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const d = JSON.parse(e.target.result);
            if(d.garden) await set('myGarden', d.garden);
            if(d.theme) await set('theme', d.theme);
            alert("✅ بازگردانی موفق!");
            location.reload();
        } catch(err) {
            console.error('❌ فایل خراب:', err);
            alert("❌ فایل خراب است");
        }
    };
    reader.readAsText(file);
}