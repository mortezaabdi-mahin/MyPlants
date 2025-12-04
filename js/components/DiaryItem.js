export function DiaryItem(log) {
    // نگاشت آیکون‌ها
    const icons = {
        water: 'fa-tint',
        fertilizer: 'fa-flask',
        growth: 'fa-seedling',
        soil: 'fa-layer-group',
        pest: 'fa-bug',
        prune: 'fa-cut',
        other: 'fa-sticky-note'
    };

    // نگاشت عنوان فارسی
    const labels = {
        water: 'آبیاری',
        fertilizer: 'کوددهی',
        growth: 'رشد',
        soil: 'خاک',
        pest: 'آفت',
        prune: 'هرس',
        other: 'یادداشت'
    };

    // تبدیل تاریخ میلادی به شمسی (ساده)
    const dateStr = new Date(log.date).toLocaleDateString('fa-IR');

    return `
        <div class="log-item">
            <div class="log-icon type-${log.type}">
                <i class="fas ${icons[log.type] || 'fa-circle'}"></i>
            </div>
            <div class="log-content">
                <span class="log-date">
                    ${dateStr} | ${labels[log.type] || 'رویداد'}
                    <i class="fas fa-trash" 
                       style="float:left; cursor:pointer; color:#ef5350; margin-top:3px;" 
                       onclick="app.deleteLog(${log.id})" 
                       title="حذف"></i>
                </span>
                <div class="log-text">${log.note}</div>
            </div>
        </div>
    `;
}