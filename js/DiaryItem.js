// --- START OF FILE components/DiaryItem.js ---

import { gregorianToJalali } from "../utils.js";

export function DiaryItem(log) {
  const icons = {
    water: { icon: "fa-tint", label: "آبیاری", color: "#4cc9f0" },
    fertilizer: { icon: "fa-flask", label: "کوددهی", color: "#06d6a0" },
    growth: { icon: "fa-leaf", label: "رشد", color: "#90be6d" },
    soil: { icon: "fa-layer-group", label: "خاک", color: "#8b4513" },
    pest: { icon: "fa-bug", label: "آفت", color: "#ef5350" },
    prune: { icon: "fa-cut", label: "هرس", color: "#f72585" },
    other: { icon: "fa-sticky-note", label: "یادداشت", color: "#ff9500" },
  };

  const logConfig = icons[log.type] || icons.other;

  // 1. اطمینان از فرمت ورودی (تبدیل به عدد صحیح)
  let year, month, day;

  if (typeof log.date === "string" && log.date.includes("-")) {
    const parts = log.date.split("-");
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    // Fallback برای فرمت‌های قدیمی احتمالی
    const d = new Date(log.date);
    year = d.getFullYear();
    month = d.getMonth() + 1;
    day = d.getDate();
  }

  // 2. تبدیل به شمسی با الگوریتم دقیق
  const [jy, jm, jd] = gregorianToJalali(year, month, day);

  const monthNames = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  const dayNames = [
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
  ];

  // محاسبه روز هفته میلادی
  const gDate = new Date(year, month - 1, day);
  const dayName = dayNames[gDate.getDay()];

  // ساخت رشته خروجی
  const jalaaliDateStr = `${jd} ${monthNames[jm - 1]} ${jy}`;

  return `
    <div class="diary-item-improved">
      <div class="diary-item-left">
        <div class="diary-icon-circle" style="background-color: ${logConfig.color}20; border-color: ${logConfig.color}">
          <i class="fas ${logConfig.icon}" style="color: ${logConfig.color}; font-size: 1.1rem;"></i>
        </div>
      </div>

      <div class="diary-item-content">
        <div class="diary-item-header">
          <span class="diary-label" style="background-color: ${logConfig.color}20; color: ${logConfig.color}; border: 1px solid ${logConfig.color}40;">
            ${logConfig.label}
          </span>
          <button onclick="app.deleteLog(${log.id})" class="diary-delete-btn" title="حذف">
            <i class="fas fa-trash"></i>
          </button>
        </div>

        <div class="diary-date">
          <i class="fas fa-calendar-alt"></i>
          <span>${dayName}، ${jalaaliDateStr}</span>
        </div>

        <div class="diary-note">
          ${log.note}
        </div>
      </div>
    </div>
  `;
}
