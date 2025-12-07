export function GardenItem(plant) {
    const today = new Date();
    const lastDate = new Date(plant.lastWatered);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + plant.waterInterval);
    
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    let statusText = `${diffDays} روز مانده`;
    let urgencyClass = '';
    
    if (diffDays <= 0) {
        statusText = "🚨 موعد آبیاری گذشته!";
        urgencyClass = 'urgent';
    } else if (diffDays === 1) {
        statusText = "⏰ فردا نوبت آبیاری است";
    }

    // منطق نمایش عکس
    let imageHtml = '';
    if (plant.image) {
        imageHtml = `
        <div style="width: 80px; height: 80px; flex-shrink:0; border-radius: 12px; overflow: hidden; margin-left: 10px; border: 2px solid var(--border-glass);">
            <img src="${plant.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="plant">
        </div>`;
    } else {
        // آیکون پیش‌فرض اگر عکس نبود
        imageHtml = `
        <div style="width: 60px; height: 60px; flex-shrink:0; background: var(--bg-glass-strong); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: 10px; color: var(--primary-green); font-size: 1.5rem;">
            <i class="fas fa-seedling"></i>
        </div>`;
    }

    return `
        <div class="garden-card ${urgencyClass}" style="display: flex; align-items: center;">
            ${imageHtml}
            
            <div class="garden-info" style="flex: 1;">
                <h3 style="margin: 0 0 4px 0; font-size: 1rem;">${plant.nickname}</h3>
                <p style="margin: 0; font-size: 0.8rem; opacity: 0.8;">${plant.originalName}</p>
                <div style="margin-top:5px; font-weight:bold; font-size: 0.85rem; color:${diffDays<=0?'var(--warning-red)':'var(--primary-green)'}">
                    ${statusText}
                </div>
            </div>
            
            <div class="garden-actions" style="margin-right: 5px;">
                <button class="btn-water" style="background:var(--secondary-green); padding: 6px 10px;" onclick="app.openDiary(${plant.id})"><i class="fas fa-book"></i></button>
                <button class="btn-water" style="padding: 6px 10px;" onclick="app.waterPlant(${plant.id})"><i class="fas fa-tint"></i></button>
            </div>
        </div>
        <!-- دکمه حذف جداگانه برای جلوگیری از شلوغی، یا می‌توان در مودال گذاشت. اینجا فعلا در اکشن ها حذف شد برای سادگی ظاهر -->
        <div style="text-align: left; margin-top: -10px; margin-bottom: 10px; padding-left: 10px;">
             <small onclick="app.deletePlant(${plant.id})" style="color: var(--warning-red); cursor: pointer; opacity: 0.7;">حذف گیاه <i class="fas fa-trash"></i></small>
        </div>
    `;
}