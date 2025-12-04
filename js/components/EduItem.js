export function EduItem(item, index) {
    return `
        <div class="edu-card">
            <div class="edu-header" onclick="app.toggleEdu(${index})">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-book-open"></i> ${item.title}
                </div>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="edu-body" id="edu-${index}">
                <span class="tag">${item.category}</span>
                <div class="edu-text">${item.content}</div>
            </div>
        </div>
    `;
}