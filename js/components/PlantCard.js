import { iconMap } from '../utils.js';

export function PlantCard(name, info) {
    // 1. ساخت بخش ویژگی‌های اصلی (آبیاری، نور، کود و...)
    let featuresHtml = '';
    for (const key in info) {
        // این کلیدها را رد می‌کنیم چون جای مخصوص دارند
        if (!["گروه", "عیب_یابی", "دانشنامه"].includes(key)) {
            const icon = iconMap[key] || "fa-check";
            featuresHtml += `
                <div class="info-box">
                    <div class="info-icon"><i class="fas ${icon}"></i></div>
                    <div class="info-content">
                        <strong>${key}</strong>
                        <span>${info[key]}</span>
                    </div>
                </div>`;
        }
    }

    // 2. ساخت بخش شناسنامه داخلی (Local Encyclopedia)
    let localWikiHtml = '';
    let scientificName = ''; // متغیری برای ذخیره نام علمی جهت ارسال به دکمه ویکی‌پدیا

    if (info.دانشنامه) {
        // ذخیره نام علمی برای استفاده در دکمه پایین
        if (info.دانشنامه.نام_علمی) {
            scientificName = info.دانشنامه.نام_علمی;
        }

        let items = '';
        for (const wKey in info.دانشنامه) {
            const label = wKey.replace(/_/g, ' '); // حذف زیرخط
            const val = info.دانشنامه[wKey];
            const icon = iconMap[wKey] || "fa-info-circle";

            // منطق قرمز کردن متن برای گیاهان سمی
            const isToxic = wKey === "سمی_بودن" && (val.includes("بله") || val.includes("سمی"));
            const style = isToxic ? "color:#d32f2f; font-weight:bold;" : "";

            items += `
                <div class="wiki-item">
                    <i class="fas ${icon} wiki-icon" style="${style}"></i>
                    <div class="wiki-text">
                        <span class="wiki-label">${label}:</span>
                        <span class="wiki-value" style="${style}">${val}</span>
                    </div>
                </div>`;
        }
        localWikiHtml = `
            <div class="wiki-section">
                <h3 class="wiki-title"><i class="fas fa-passport"></i> شناسنامه گیاه</h3>
                <div class="wiki-grid">${items}</div>
            </div>`;
    }

    // 3. ساخت بخش عیب‌یابی (Troubleshooting)
    let troubleHtml = '';
    if (info.عیب_یابی && info.عیب_یابی.length > 0) {
        let items = '';
        info.عیب_یابی.forEach(item => {
            items += `
                <div class="trouble-box">
                    <div class="trouble-title">
                        <i class="fas fa-exclamation-circle"></i> ${item.مشکل}
                    </div>
                    <div class="trouble-cause">
                        <span>علت:</span> ${item.علت}
                    </div>
                    <div class="trouble-solution">
                        <i class="fas fa-check-circle"></i> <b>راه حل:</b> ${item.راه_حل}
                    </div>
                </div>`;
        });
        
        // این بخش را در یک کارت جداگانه با حاشیه قرمز قرار می‌دهیم
        troubleHtml = `
            <div class="plant-card" style="border-top: 4px solid var(--warning-red);">
                <h3 style="color: var(--warning-red); margin-bottom: 15px; display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-user-md"></i> پزشک گیاه (عیب‌یابی)
                </h3>
                <div style="display: grid; gap: 10px;">
                    ${items}
                </div>
            </div>`;
    }

    // 4. ترکیب نهایی HTML
    // دقت کنید: نام علمی (scientificName) به دکمه ویکی‌پیادیا پاس داده می‌شود
    return `
      <!-- کارت اصلی (اطلاعات) -->
      <div class="plant-card">
          <div class="plant-header">
              <h2><i class="fas fa-leaf"></i> ${name}</h2>
              <span class="badge">${info.گروه}</span>
          </div>
          
          <div class="info-grid">
              ${featuresHtml}
          </div>
          
          ${localWikiHtml}
          
          <div style="margin-top:20px; display:grid; gap:10px">
              <button class="btn-add-garden" onclick="app.openAddModal('${name}')">
                  <i class="fas fa-plus-circle"></i> افزودن به باغچه من
              </button>
              
              <!-- دکمه هوشمند ویکی‌پدیا (با ارسال نام علمی) -->
              <button class="btn-wiki" onclick="app.fetchWiki('${name}', '${scientificName}')">
                  <i class="fab fa-wikipedia-w"></i> مشاهده عکس و اطلاعات بیشتر (آنلاین)
              </button>
          </div>
      </div>

      <!-- کارت عیب‌یابی (زیر کارت اصلی نمایش داده می‌شود) -->
      ${troubleHtml}
    `;
}