const DB_NAME = "PlantAppDB";
const STORE_NAME = "keyval";

// Safe Get - با پاک‌سازی داده‌های خراب
const safeGet = async (key) => {
  try {
    if (typeof localStorage !== "undefined") {
      const item = localStorage.getItem(key);
      if (!item) return null;

      // سعی کنید پارس کنید
      return JSON.parse(item);
    }
  } catch (e) {
    // داده‌های خراب را پاک کن
    console.warn(`⚠️ Storage خراب (${key}): ${e.message}`);
    try {
      localStorage.removeItem(key);
    } catch (clearErr) {
      console.warn(`⚠️ نتوانستم ${key} را پاک کنم`);
    }
  }
  return null;
};

// Safe Set - بررسی قبل از ذخیره
const safeSet = async (key, value) => {
  try {
    if (typeof localStorage !== "undefined") {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      console.log(`✅ ${key} ذخیره شد`);
      return true;
    }
  } catch (e) {
    console.warn(`⚠️ Storage مسدود (${key}): ${e.message}`);
    // اگر مسدود است، سکوت کن (نه خطا)
    return false;
  }
};

export const get = safeGet;
export const set = safeSet;
