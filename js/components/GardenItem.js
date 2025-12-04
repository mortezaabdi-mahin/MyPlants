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

    return `
        <div class="garden-card ${urgencyClass}">
            <div class="garden-info">
                <h3>${plant.nickname}</h3>
                <p>${plant.originalName}</p>
                <div style="margin-top:5px; font-weight:bold; color:${diffDays<=0?'var(--warning-red)':'var(--primary-green)'}">
                    <i class="fas fa-clock"></i> ${statusText}
                </div>
            </div>
            <div class="garden-actions">
                <button class="btn-water" style="background:var(--secondary-green)" onclick="app.openDiary(${plant.id})"><i class="fas fa-book"></i> دفترچه</button>
                <button class="btn-water" onclick="app.waterPlant(${plant.id})"><i class="fas fa-tint"></i> آب دادم</button>
                <button class="btn-delete" onclick="app.deletePlant(${plant.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
}