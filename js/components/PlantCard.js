import { iconMap } from '../utils.js';

export function PlantCard(name, info) {
    let featuresHtml = '';
    // ویژگی‌های اصلی
    for (const key in info) {
        if (!["گروه", "عیب_یابی", "دانشنامه"].includes(key)) {
            const icon = iconMap[key] || "fa-check";
            featuresHtml += `
                <div class="info-box">
                    <div class="info-icon"><i class="fas ${icon}"></i></div>
                    <div class="info-content"><strong>${key}</strong><span>${info[key]}</span></div>
                </div>`;
        }
    }

    // شناسنامه (Wiki)
    let wikiHtml = '';
    if (info.دانشنامه) {
        let items = '';
        for (const wKey in info.دانشنامه) {
            const label = wKey.replace(/_/g, ' ');
            const val = info.دانشنامه[wKey];
            const isToxic = wKey === "سمی_بودن" && val.includes("بله");
            const style = isToxic ? "color:#d32f2f" : "";
            const icon = iconMap[wKey] || "fa-info-circle";
            items += `
                <div class="wiki-item">
                    <i class="fas ${icon} wiki-icon" style="${style}"></i>
                    <div class="wiki-text">
                        <span class="wiki-label">${label}:</span>
                        <span class="wiki-value" style="${style}">${val}</span>
                    </div>
                </div>`;
        }
        wikiHtml = `<div class="wiki-section"><h3 class="wiki-title">شناسنامه</h3><div class="wiki-grid">${items}</div></div>`;
    }

    return `
      <div class="plant-card">
          <div class="plant-header"><h2>${name}</h2><span class="badge">${info.گروه}</span></div>
          <div class="info-grid">${featuresHtml}</div>
          ${wikiHtml}
          <div style="margin-top:15px; display:grid; gap:10px">
              <button class="btn-add-garden" onclick="app.openAddModal('${name}')"><i class="fas fa-plus-circle"></i> افزودن به باغچه</button>
              <button class="btn-wiki" onclick="app.fetchWiki('${name}')"><i class="fab fa-wikipedia-w"></i> اطلاعات ویکی‌پدیا</button>
          </div>
      </div>
    `;
}