// --- START OF FILE JalaliDatePicker.js ---

export class JalaliDatePicker {
  constructor() {
    this.selectedDate = new Date();

    // دریافت تاریخ امروز سیستم
    const today = new Date();
    const jToday = this.toJalaali(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );

    this.state = {
      todayJy: jToday.jy,
      todayJm: jToday.jm,
      todayJd: jToday.jd,
      viewJy: jToday.jy,
      viewJm: jToday.jm,
      selectedJy: jToday.jy,
      selectedJm: jToday.jm,
      selectedJd: jToday.jd,
    };

    // اتصال متدها به پنجره مرورگر
    this.bindGlobalEvents();
  }

  // ==========================================
  // 🧮 موتور ریاضی دقیق (بدون باگ سال 425)
  // ==========================================

  toJalaali(gy, gm, gd) {
    gy = parseInt(gy);
    gm = parseInt(gm);
    gd = parseInt(gd);
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979;
    gy -= gy <= 1600 ? 621 : 1600;
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days =
      365 * gy +
      parseInt((gy2 + 3) / 4) -
      parseInt((gy2 + 99) / 100) +
      parseInt((gy2 + 399) / 400) -
      80 +
      gd +
      g_d_m[gm - 1];
    jy += 33 * parseInt(days / 12053);
    days %= 12053;
    jy += 4 * parseInt(days / 1461);
    days %= 1461;
    jy += parseInt((days - 1) / 365);
    if (days > 365) days = (days - 1) % 365;
    let jm =
      days < 186 ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
    let jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return { jy, jm, jd };
  }

  toGregorian(jy, jm, jd) {
    jy = parseInt(jy);
    jm = parseInt(jm);
    jd = parseInt(jd);
    let gy;
    if (jy > 979) {
      gy = 1600;
      jy -= 979;
    } else {
      gy = 621;
    }
    let days =
      365 * jy +
      parseInt(jy / 33) * 8 +
      parseInt(((jy % 33) + 3) / 4) +
      78 +
      jd +
      (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
    gy += 400 * parseInt(days / 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * parseInt(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * parseInt(days / 1461);
    days %= 1461;
    gy += parseInt((days - 1) / 365);
    if (days > 365) days = (days - 1) % 365;
    let gd = days + 1;
    const sal_a = [
      0,
      31,
      (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    let gm;
    for (gm = 0; gm < 13; gm++) {
      const v = sal_a[gm];
      if (gd <= v) break;
      gd -= v;
    }
    return { gy, gm, gd };
  }

  // محاسبه روز اول ماه (0 = شنبه)
  getFirstDayOfMonth(jy, jm) {
    const { gy, gm, gd } = this.toGregorian(jy, jm, 1);
    const date = new Date(gy, gm - 1, gd);
    return (date.getDay() + 1) % 7;
  }

  getDaysInMonth(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    // کبیسه دقیق با باقی‌مانده بر 33
    const rem = jy % 33;
    const isLeap = [1, 5, 9, 13, 17, 22, 26, 30].includes(rem);
    return isLeap ? 30 : 29;
  }

  // ==========================================
  // 🎮 کنترلرها
  // ==========================================

  bindGlobalEvents() {
    window.app = window.app || {};
    window.app.selectJalaliDate = (d, m, y) => this.selectDate(d, m, y);
    window.app.previousMonthJalali = () => this.changeMonthStep(-1);
    window.app.nextMonthJalali = () => this.changeMonthStep(1);
    window.app.changeMonthSelect = (m) => this.setMonth(parseInt(m));
    window.app.changeYearInput = (y) => this.setYear(parseInt(y));
    window.app.selectTodayJalali = () => this.goToToday();
    window.app.closeJalaliModal = () => {
      const el = document.getElementById("jalali-picker-modal");
      if (el) el.remove();
    };
  }

  changeMonthStep(step) {
    let { viewJy, viewJm } = this.state;
    viewJm += step;
    if (viewJm > 12) {
      viewJm = 1;
      viewJy++;
    } else if (viewJm < 1) {
      viewJm = 12;
      viewJy--;
    }
    this.state.viewJy = viewJy;
    this.state.viewJm = viewJm;
    this.render();
  }

  setMonth(m) {
    this.state.viewJm = m;
    this.render();
  }

  setYear(y) {
    if (y > 1300 && y < 1500) {
      this.state.viewJy = y;
      this.render();
    }
  }

  goToToday() {
    const { todayJy, todayJm, todayJd } = this.state;
    this.selectDate(todayJd, todayJm, todayJy);
  }

  selectDate(d, m, y) {
    // بروزرسانی استیت
    this.state.selectedJd = d;
    this.state.selectedJm = m;
    this.state.selectedJy = y;
    this.state.viewJy = y;
    this.state.viewJm = m;

    // تبدیل به میلادی برای ذخیره در دیتابیس
    const { gy, gm, gd } = this.toGregorian(y, m, d);

    // فرمت‌دهی استاندارد YYYY-MM-DD
    const gregorianStr = `${gy}-${String(gm).padStart(2, "0")}-${String(
      gd
    ).padStart(2, "0")}`;
    const jalaliStr = `${y}/${m}/${d}`;

    // آپدیت UI اصلی
    const displayEl = document.getElementById("log-date-display");
    const valueEl = document.getElementById("log-date");

    if (displayEl) displayEl.textContent = `📅 ${jalaliStr}`;
    if (valueEl) valueEl.value = gregorianStr;

    // بستن مودال
    this.render(); // رندر مجدد برای نمایش انتخاب
    setTimeout(() => window.app.closeJalaliModal(), 300);
  }

  // ==========================================
  // 🖥️ رندر
  // ==========================================

  render() {
    this.bindGlobalEvents();
    window.app.closeJalaliModal(); // بستن قبلی‌ها

    const {
      viewJy,
      viewJm,
      selectedJy,
      selectedJm,
      selectedJd,
      todayJy,
      todayJm,
      todayJd,
    } = this.state;
    const daysInMonth = this.getDaysInMonth(viewJy, viewJm);
    const startDay = this.getFirstDayOfMonth(viewJy, viewJm);
    const months = [
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

    let grid = "";
    // روزهای خالی
    for (let i = 0; i < startDay; i++)
      grid += `<div class="jp-cell empty"></div>`;

    // روزهای اصلی
    for (let d = 1; d <= daysInMonth; d++) {
      const isSel =
        d === selectedJd && viewJm === selectedJm && viewJy === selectedJy;
      const isTod = d === todayJd && viewJm === todayJm && viewJy === todayJy;
      grid += `<div class="jp-cell ${isSel ? "selected" : ""} ${
        isTod ? "today" : ""
      }" onclick="window.app.selectJalaliDate(${d},${viewJm},${viewJy})">${d}</div>`;
    }

    const modal = document.createElement("div");
    modal.id = "jalali-picker-modal";
    modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);">
      <div style="background:#fff;width:320px;border-radius:16px;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,0.2);font-family:inherit;direction:rtl;">
        
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
          <h3 style="margin:0;font-size:16px;">انتخاب تاریخ</h3>
          <button onclick="window.app.closeJalaliModal()" style="border:none;background:none;font-size:20px;cursor:pointer;">&times;</button>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;background:#f5f5f5;padding:8px;border-radius:10px;margin-bottom:15px;">
          <button onclick="window.app.nextMonthJalali()" style="border:none;background:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;">&lt;</button>
          <div style="display:flex;gap:5px;">
            <select onchange="window.app.changeMonthSelect(this.value)" style="border:none;background:transparent;font-weight:bold;cursor:pointer;">
              ${months
                .map(
                  (m, i) =>
                    `<option value="${i + 1}" ${
                      i + 1 === viewJm ? "selected" : ""
                    }>${m}</option>`
                )
                .join("")}
            </select>
            <input type="number" value="${viewJy}" onchange="window.app.changeYearInput(this.value)" style="width:60px;border:none;background:transparent;text-align:center;font-weight:bold;">
          </div>
          <button onclick="window.app.previousMonthJalali()" style="border:none;background:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;">&gt;</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:12px;color:#888;margin-bottom:5px;">
          <div>ش</div><div>ی</div><div>د</div><div>س</div><div>چ</div><div>پ</div><div>ج</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">
          ${grid}
        </div>

        <div style="margin-top:15px;padding-top:15px;border-top:1px solid #eee;display:flex;gap:10px;">
          <button onclick="window.app.selectTodayJalali()" style="flex:1;padding:8px;background:#e8f5e9;color:#2e7d32;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">امروز</button>
          <button onclick="window.app.closeJalaliModal()" style="flex:1;padding:8px;background:#ffebee;color:#c62828;border:none;border-radius:8px;cursor:pointer;">لغو</button>
        </div>

      </div>
    </div>
    <style>
      .jp-cell { height:34px; display:flex; align-items:center; justify-content:center; border-radius:8px; cursor:pointer; font-size:14px; }
      .jp-cell:hover:not(.empty) { background:#f0f0f0; }
      .jp-cell.selected { background:#4CAF50; color:white; }
      .jp-cell.today { border:2px solid #4CAF50; color:#4CAF50; font-weight:bold; }
      .jp-cell.selected.today { border:2px solid #4CAF50; color:white; }
    </style>
    `;
    document.body.appendChild(modal);
  }
}

export const jalaliPicker = new JalaliDatePicker();
