export function toggleDarkMode() {
    const isDark = document.getElementById('dark-mode-toggle').checked;
    if(isDark) { document.body.classList.add('dark-mode'); localStorage.setItem('theme', 'dark'); }
    else { document.body.classList.remove('dark-mode'); localStorage.setItem('theme', 'light'); }
}

export function initTheme() {
    if(localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-toggle').checked = true;
    }
}

export function backup() {
    const data = { garden: localStorage.getItem('myGarden'), theme: localStorage.getItem('theme') };
    const blob = new Blob([JSON.stringify(data)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'backup.json';
    a.click();
}

export function restore(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const d = JSON.parse(e.target.result);
        if(d.garden) localStorage.setItem('myGarden', d.garden);
        if(d.theme) localStorage.setItem('theme', d.theme);
        location.reload();
    };
    reader.readAsText(file);
}