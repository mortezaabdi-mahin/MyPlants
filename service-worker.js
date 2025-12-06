/* 
   نام کش: plant-expert-v7
   تغییر ورژن باعث می‌شود مرورگر فایل‌های قدیمی را پاک کرده
   و فایل‌های جدید (شامل ساختار ماژولار و دیتابیس) را دریافت کند.
*/
const CACHE_NAME = 'plant-expert-v7';

// لیست تمام فایل‌های پروژه که باید برای حالت آفلاین کش شوند
const ASSETS_TO_CACHE = [
  // --- فایل‌های ریشه ---
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  
  // --- دیتابیس‌های ثابت ---
  './plants.json',
  './education.json',
  './quiz.json',

  // --- هسته جاواسکریپت ---
  './js/main.js',
  './js/utils.js',

  // --- سرویس‌ها (Logic) ---
  './js/services/Database.js',        // موتور دیتابیس جدید
  './js/services/Encyclopedia.js',
  './js/services/GardenManager.js',
  './js/services/WikiService.js',
  './js/services/SettingsManager.js',
  './js/services/QuizManager.js',

  // --- کامپوننت‌ها (UI) ---
  './js/components/PlantCard.js',
  './js/components/GardenItem.js',
  './js/components/EduItem.js',
  './js/components/DiaryItem.js',
  './js/components/QuizComponent.js',

  // --- آیکون‌ها (اگر در پروژه دارید، از کامنت خارج کنید) ---
  // './icon-192.png',
  // './icon-512.png'
];

/* 
   ۱. مرحله نصب (Install)
   در این مرحله تمام فایل‌های لیست بالا دانلود و در حافظه مرورگر ذخیره می‌شوند.
*/
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching all app files...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // این دستور باعث می‌شود سرویس ورکر جدید بلافاصله فعال شود
  self.skipWaiting();
});

/* 
   ۲. مرحله فعال‌سازی (Activate)
   در این مرحله کش‌های قدیمی (مثلاً v6) پاک می‌شوند تا فضا آزاد شود.
*/
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker: Cleaning old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // کنترل تمام صفحات باز شده توسط سرویس ورکر جدید
  return self.clients.claim();
});

/* 
   ۳. مدیریت درخواست‌ها (Fetch)
   استراتژی: اول کش، اگر نبود شبکه (Cache First)
*/
self.addEventListener('fetch', (event) => {
  // اگر درخواست مربوط به API خارجی (مثل ویکی‌پدیا) بود، کش نکن
  if (event.request.url.includes('wikipedia.org')) {
    return; // اجازه بده مستقیم به اینترنت وصل شود
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // ۱. اگر فایل در کش موجود بود، همان را برگردان (سرعت بالا)
      if (response) {
        return response;
      }
      
      // ۲. اگر نبود، از اینترنت دانلود کن
      return fetch(event.request).catch(() => {
        // ۳. اگر اینترنت هم نبود (آفلاین کامل) و فایل پیدا نشد
        // اینجا می‌توان یک صفحه "شما آفلاین هستید" نشان داد
        // فعلاً فقط در کنسول لاگ می‌زنیم
        console.log('Offline: Asset not found in cache');
      });
    })
  );
});