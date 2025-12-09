/* 
   نام کش: plant-e/* 
   نام کش: plant-expert-v10
   تغییر ورژن به v10 باعث می‌شود مرورگر فایل‌های قدیمی را پاک کرده
   و تصاویر جدید آموزشی را دانلود کند.
*/
const CACHE_NAME = "plant-expert-v10";

// لیست تمام فایل‌های پروژه که باید برای حالت آفلاین کش شوند
const ASSETS_TO_CACHE = [
  // --- فایل‌های ریشه ---
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",

  // --- دیتابیس‌های ثابت ---
  "./plants.json",
  "./education.json",
  "./quiz.json",

  // --- تصاویر آموزشی ---
  "./images/light.jpg",
  "./images/water.jpg",
  "./images/disease.jpg",

  // --- آیکون‌های برنامه ---
  "./icon-192.png",
  "./icon-512.png",

  // --- هسته جاواسکریپت ---
  "./js/main.js",
  "./js/utils.js",
  "./js/debug.js",

  // --- سرویس‌ها ---
  "./js/services/Database.js",
  "./js/services/Encyclopedia.js",
  "./js/services/GardenManager.js",
  "./js/services/WikiService.js",
  "./js/services/SettingsManager.js",
  "./js/services/QuizManager.js",
  "./js/services/GameManager.js",
  "./js/services/JalaliDatePicker.js", // ✅ اضافه شد

  // --- کامپوننت‌ها ---
  "./js/components/PlantCard.js",
  "./js/components/GardenItem.js",
  "./js/components/EduItem.js",
  "./js/components/DiaryItem.js",
  "./js/components/QuizComponent.js",
  "./js/components/GameComponent.js", // ✅ اضافه شد
];

/* 
   ۱. مرحله نصب (Install)
   در این مرحله تمام فایل‌های لیست بالا دانلود و در حافظه مرورگر ذخیره می‌شوند.
*/
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker Installing v10...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching assets...");
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.error("❌ Cache error:", err);
      });
    })
  );
  // فعال‌سازی فوری سرویس ورکر جدید
  self.skipWaiting();
});

/* 
   ۲. مرحله فعال‌سازی (Activate)
   در این مرحله کش‌های قدیمی (مثلاً v9) پاک می‌شوند تا فضا آزاد شود.
*/
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker Activating...");
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`🗑️ Deleting old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

/* 
   ۳. مدیریت درخواست‌ها (Fetch)
   استراتژی: اول کش، اگر نبود شبکه (Cache First)
*/
self.addEventListener("fetch", (event) => {
  // اگر درخواست مربوط به API خارجی (مثل ویکی‌پدیا) بود، کش نکن
  if (
    event.request.url.includes("wikipedia.org") ||
    event.request.url.includes("eruda")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // ۱. اگر فایل در کش موجود بود، همان را برگردان (سرعت بالا)
      if (response) {
        console.log(`✅ Serving from cache: ${event.request.url}`);
        return response;
      }

      // ۲. اگر نبود، از اینترنت دانلود کن
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          console.log(`📡 Fetched from network: ${event.request.url}`);
          return networkResponse;
        })
        .catch((err) => {
          console.warn(`⚠️ Fetch failed: ${event.request.url}`, err);
          // اگر Request یک صفحه HTML بود، fallback رو serve کن
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("./index.html");
          }
        });
    })
  );
});
