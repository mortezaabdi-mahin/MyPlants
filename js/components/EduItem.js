export function EduItem(item, index) {
  // انتخاب آیکون بر اساس دسته‌بندی
  let icon = "fa-book";
  if (item.category && item.category.includes("تغذیه")) icon = "fa-flask";
  if (item.category && item.category.includes("آفات")) icon = "fa-bug";
  if (item.category && item.category.includes("آبیاری")) icon = "fa-tint";
  if (item.category && item.category.includes("خاک")) icon = "fa-layer-group";
  if (item.category && item.category.includes("نور")) icon = "fa-sun";
  if (item.category && item.category.includes("تکثیر")) icon = "fa-cut";
  if (item.category && item.category.includes("عیب‌یابی")) icon = "fa-user-md";

  // بررسی وجود تصویر و ساخت کد HTML مربوط به آن
  let imageHtml = "";
  if (item.image) {
    imageHtml = `
            <div class="edu-img-wrapper">
                <img src="${item.image}" alt="${item.title}" loading="lazy" />
                <div class="edu-img-hint"><i class="fas fa-search-plus"></i> برای بزرگنمایی کلیک کنید</div>
            </div>
        `;
  }

  // ساخت قالب نهایی
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
                ${imageHtml}
                <div class="edu-text">${item.content}</div>
            </div>
        </div>
    `;
}
