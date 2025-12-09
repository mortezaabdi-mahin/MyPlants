// --- START OF FILE utils.js ---

export const iconMap = {
  آبیاری: "fa-tint",
  النور: "fa-sun",
  کوددهی: "fa-flask",
  قلمه: "fa-cut",
  آفات: "fa-bug",
  دما: "fa-temperature-high",
  خاستگاه: "fa-globe-americas",
  خاک_ایده‌آل: "fa-layer-group",
  نام_علمی: "fa-dna",
  سمی_بودن: "fa-skull-crossbones",
  رطوبت: "fa-cloud-showers-heavy",
};

export async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Error loading ${url}:`, err);
    return null;
  }
}

export function cleanPlantName(name) {
  return name ? name.split("(")[0].trim() : "";
}

// ✅ الگوریتم دقیق تبدیل تاریخ (با حذف اعشار)
export function gregorianToJalali(gy, gm, gd) {
  gy = parseInt(gy, 10);
  gm = parseInt(gm, 10);
  gd = parseInt(gd, 10);

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;

  const gy2 = gm > 2 ? gy + 1 : gy;

  // استفاده از Math.floor برای اطمینان از عدد صحیح
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;

  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;

  let jm =
    days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  let jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);

  return [parseInt(jy), parseInt(jm), parseInt(jd)];
}

export function jalaliToGregorian(jy, jm, jd) {
  jy = parseInt(jy, 10);
  jm = parseInt(jm, 10);
  jd = parseInt(jd, 10);

  let gy;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }

  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

  gy += 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  gy += Math.floor((days - 1) / 365);
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

  return [gy, gm, gd];
}
