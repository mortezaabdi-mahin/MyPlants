// نام کش (هر وقت فایل‌ها تغییر کرد، این ورژن را بالا ببرید: v4 -> v5)
const CACHE_NAME = "plant-expert-v4";

// لیست تمام فایل‌هایی که باید کش شوند
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./plants.json", // دیتابیس گیاهان
  "./education.json", // دیتابیس آموزش‌ها
  "./manifest.json",
  // اگر آیکون دارید آن‌کامنت کنید:
  // './icon-192.png',
  // './icon-512.png'
];

// ۱. نصب: کش کردن فایل‌ها
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Service Worker: Caching files...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // اجبار به فعال‌سازی فوری سرویس ورکر جدید
  self.skipWaiting();
});

// ۲. فعال‌سازی: پاک کردن کش‌های قدیمی
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Service Worker: Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // کنترل تمام کلاینت‌ها (صفحات) توسط این سرویس ورکر
  return self.clients.claim();
});

// ۳. فچ: استراتژی Cache First (اول کش، اگر نبود شبکه)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // اگر فایل در کش بود، برگردان
      if (response) {
        return response;
      }
      // اگر نبود، از شبکه بگیر
      return fetch(event.request).catch(() => {
        // اگر شبکه هم نبود (آفلاین)، می‌توان صفحه جایگزین نشان داد
        // فعلاً فقط لاگ می‌زنیم
        console.log("Offline: File not found in cache");
      });
    })
  );
});
