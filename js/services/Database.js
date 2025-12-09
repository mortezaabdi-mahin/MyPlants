const DB_NAME = "PlantAppDB";
const DB_VERSION = 1;
const STORE_NAME = "keyval";

let db = null;
let dbPromise = null; // ✅ ذخیره Promise برای جلوگیری از چند initialize

// تهیه‌سازی و باز کردن دیتابیس
const initDB = async () => {
  // ✅ اگر قبلاً initialize شده، همان Promise را برگردان
  if (dbPromise) {
    return dbPromise;
  }

  if (db) {
    return db;
  }

  // ✅ ایجاد Promise برای دریافت database
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("❌ خطا در باز کردن IndexedDB:", request.error);
      dbPromise = null; // ✅ تنظیم مجدد برای تلاش دوباره
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log("✅ IndexedDB باز شد");

      // ✅ Event listener برای بستن connection
      db.addEventListener("close", () => {
        console.warn("⚠️ IndexedDB اتصال بسته شد");
        db = null;
        dbPromise = null;
      });

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // اگر store موجود نیست، ایجاد کن
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
        console.log("✅ Object Store ایجاد شد");
      }
    };
  });

  return dbPromise;
};

// ✅ تابع کمکی برای مدیریت خطاهای transaction
const withRetry = async (operation, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error.name === "InvalidStateError" && attempt < maxRetries) {
        console.warn(`⚠️ تلاش ${attempt}/${maxRetries} ناموفق. دوباره تلاش...`);
        db = null;
        dbPromise = null;
        await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
      } else {
        throw error;
      }
    }
  }
};

// دریافت داده
export const get = async (key) => {
  try {
    return await withRetry(async () => {
      const db = await initDB();

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction([STORE_NAME], "readonly");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(key);

          request.onerror = () => {
            console.warn(`⚠️ خطا در دریافت ${key}:`, request.error);
            resolve(null);
          };

          request.onsuccess = () => {
            const result = request.result;
            if (result === undefined) {
              console.log(`ℹ️ ${key} موجود نیست`);
              resolve(null);
            } else {
              console.log(`✅ ${key} دریافت شد`);
              resolve(result);
            }
          };

          transaction.onerror = () => {
            console.error("❌ خطای Transaction:", transaction.error);
            resolve(null);
          };
        } catch (e) {
          console.error(`❌ خطا در ساخت transaction:`, e);
          reject(e);
        }
      });
    });
  } catch (e) {
    console.error(`❌ خطا در get(${key}):`, e);
    return null;
  }
};

// ذخیره‌سازی داده
export const set = async (key, value) => {
  try {
    return await withRetry(async () => {
      const db = await initDB();

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction([STORE_NAME], "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put(value, key);

          request.onerror = () => {
            console.error(`❌ خطا در ذخیره ${key}:`, request.error);
            resolve(false);
          };

          request.onsuccess = () => {
            console.log(
              `✅ ${key} ذخیره شد (${Math.round(
                JSON.stringify(value).length / 1024
              )}KB)`
            );
            resolve(true);
          };

          transaction.onerror = () => {
            console.error("❌ خطای Transaction:", transaction.error);
            resolve(false);
          };

          transaction.oncomplete = () => {
            // ✅ تضمین اتمام transaction
            console.log(`📝 Transaction برای ${key} تکمیل شد`);
          };
        } catch (e) {
          console.error(`❌ خطا در ساخت transaction:`, e);
          reject(e);
        }
      });
    });
  } catch (e) {
    console.error(`❌ خطا در set(${key}):`, e);
    return false;
  }
};

// حذف داده
export const remove = async (key) => {
  try {
    return await withRetry(async () => {
      const db = await initDB();

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction([STORE_NAME], "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(key);

          request.onerror = () => {
            console.error(`❌ خطا در حذف ${key}:`, request.error);
            resolve(false);
          };

          request.onsuccess = () => {
            console.log(`✅ ${key} حذف شد`);
            resolve(true);
          };

          transaction.onerror = () => {
            console.error("❌ خطای Transaction:", transaction.error);
            resolve(false);
          };
        } catch (e) {
          console.error(`❌ خطا در ساخت transaction:`, e);
          reject(e);
        }
      });
    });
  } catch (e) {
    console.error(`❌ خطا در remove(${key}):`, e);
    return false;
  }
};

// پاک کردن تمام داده‌ها
export const clear = async () => {
  try {
    return await withRetry(async () => {
      const db = await initDB();

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction([STORE_NAME], "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.clear();

          request.onerror = () => {
            console.error("❌ خطا در پاک کردن:", request.error);
            resolve(false);
          };

          request.onsuccess = () => {
            console.log("✅ تمام داده‌ها پاک شدند");
            resolve(true);
          };

          transaction.onerror = () => {
            console.error("❌ خطای Transaction:", transaction.error);
            resolve(false);
          };
        } catch (e) {
          console.error(`❌ خطا در ساخت transaction:`, e);
          reject(e);
        }
      });
    });
  } catch (e) {
    console.error("❌ خطا در clear():", e);
    return false;
  }
};

// دریافت تمام کلیدها
export const keys = async () => {
  try {
    return await withRetry(async () => {
      const db = await initDB();

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction([STORE_NAME], "readonly");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.getAllKeys();

          request.onerror = () => {
            console.warn("⚠️ خطا در دریافت کلیدها:", request.error);
            resolve([]);
          };

          request.onsuccess = () => {
            const result = request.result || [];
            console.log(`✅ ${result.length} کلید موجود است`);
            resolve(result);
          };

          transaction.onerror = () => {
            console.error("❌ خطای Transaction:", transaction.error);
            resolve([]);
          };
        } catch (e) {
          console.error(`❌ خطا در ساخت transaction:`, e);
          reject(e);
        }
      });
    });
  } catch (e) {
    console.error("❌ خطا در keys():", e);
    return [];
  }
};

// دریافت حجم دیتابیس
export const getSize = async () => {
  try {
    if (!navigator.storage || !navigator.storage.estimate) {
      console.warn("⚠️ Storage Estimate API موجود نیست");
      return null;
    }

    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percent = Math.round((used / quota) * 100);

    console.log(
      `📊 Storage: ${(used / 1024 / 1024).toFixed(2)}MB / ${(
        quota /
        1024 /
        1024
      ).toFixed(2)}MB (${percent}%)`
    );

    return {
      used,
      quota,
      percent,
    };
  } catch (e) {
    console.error("❌ خطا در getSize():", e);
    return null;
  }
};

// ✅ تابع جدید: ریست database
export const resetDB = async () => {
  try {
    // ابتدا connection را ببند
    if (db) {
      db.close();
      db = null;
    }
    dbPromise = null;

    // سپس database را حذف کن
    const request = indexedDB.deleteDatabase(DB_NAME);

    return new Promise((resolve, reject) => {
      request.onerror = () => {
        console.error("❌ خطا در حذف دیتابیس:", request.error);
        resolve(false);
      };

      request.onsuccess = () => {
        console.log("✅ دیتابیس حذف شد");
        resolve(true);
      };

      request.onblocked = () => {
        console.warn("⚠️ حذف دیتابیس مسدود است");
      };
    });
  } catch (e) {
    console.error("❌ خطا در resetDB():", e);
    return false;
  }
};

// ✅ تابع برای بررسی status
export const getDBStatus = () => {
  return {
    isConnected: db !== null,
    isPending: dbPromise !== null,
    dbName: DB_NAME,
    storeName: STORE_NAME,
  };
};
