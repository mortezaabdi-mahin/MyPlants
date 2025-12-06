/* 
   نام کش را تغییر دادم (v6) تا مرورگر مجبور شود 
   فایل‌های جدید (ساختار ماژولار) را دریافت کند.
*/
const CACHE_NAME = 'plant-expert-v6';

// لیست تمام فایل‌های پروژه که باید کش شوند
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  
  // دیتابیس‌ها
  './plants.json',
  './education.json',
  './quiz.json',

  // فایل اصلی جاواسکریپت
  './js/main.js',
  './js/utils.js',

  // کامپوننت‌ها (UI)
  './js/components/PlantCard.js',
  './js/components/GardenItem.js',
  './js/components/EduItem.js',
  './js/components/DiaryItem.js',
  './js/components/QuizComponent.js',

  // سرویس‌ها (Logic)
  './js/services/Encyclopedia.js',
  './js/services/GardenManager.js',
  './js/services/WikiService.js',
  './js/services/SettingsManager.js',
  './js/services/QuizManager.js'
  
  // آیکون‌ها (اگر دارید آن‌کامنت کنید)
  // './icon-192.png',
  // './icon-512.png'
];

// ۱. نصب و کش کردن فایل‌ها
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Caching all assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // فعال‌سازی فوری
  self.skipWaiting();
});

// ۲. پاکسازی کش‌های قدیمی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('SW: Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// ۳. پاسخ به درخواست‌ها (استراتژی Cache First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // اگر در کش بود، همان را بده
      if (response) {
        return response;
      }
      // اگر نبود، از شبکه بگیر
      return fetch(event.request).catch(() => {
        // اگر شبکه هم نبود، خطا نده (می‌توان صفحه آفلاین گذاشت)
        console.log('Offline: Asset not found');
      });
    })
  );
});