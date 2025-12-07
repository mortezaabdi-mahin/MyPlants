export function EduItem(item, index) {
 
    let icon = "fa-book";
    if(item.category && item.category.includes("تغذیه")) icon = "fa-flask";
    if(item.category && item.category.includes("آفات")) icon = "fa-bug";
    if(item.category && item.category.includes("آبیاری")) icon = "fa-tint";
    if(item.category && item.category.includes("خاک")) icon = "fa-layer-group";
    if(item.category && item.category.includes("نور")) icon = "fa-sun";
    if(item.category && item.category.includes("تکثیر")) icon = "fa-cut";
    if(item.category && item.category.includes("عیب‌یابی")) icon = "fa-user-md";

    // بخش جدید: اگر تصویر وجود داشت، کد HTML آن ساخته شود
    let imageHtml = '';
    if (item.image) {
        imageHtml = `
            <div class="edu-img-wrapper">
                <img src="${item.image}" alt="${item.title}" loading="lazy" />
                <div class="edu-img-hint"><i class="fas fa-search-plus"></i> برای بزرگنمایی کلیک کنید</div>
            </div>
        `;
    }

    return `
        <div class="edu-card">
            <div class="edu-header" onclick="app.toggleEdu(${index})">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas ${icon}" style="color:rgba(255,255,255,0.9)"></i>
                    <span>${item.title}</span>
                </div>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="edu-body" id="edu-${index}">
                <span class="tag">${item.category}</span>
                ${imageHtml} <!-- نمایش عکس در اینجا -->
                <div class="edu-text">${item.content}</div>
            </div>
        </div>
    `;
}