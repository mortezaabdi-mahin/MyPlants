// js/debug.js
// فایل دیباگینگ جامع برای ردیابی تمام خطاها

export const DEBUG = {
  // لاگینگ سطح‌بندی شده
  levels: {
    ERROR: "❌",
    WARN: "⚠️",
    INFO: "ℹ️",
    SUCCESS: "✅",
    DEBUG: "🐛",
  },

  // ثبت خطاهای مرورگر
  setupErrorHandlers() {
    console.log("🔧 تنظیم Error Handlers...");

    // خطاهای JavaScript
    window.addEventListener("error", (event) => {
      console.error(`${this.levels.ERROR} Error: ${event.message}`, {
        file: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    });

    // خطاهای Promise غیرمدیریت‌شده
    window.addEventListener("unhandledrejection", (event) => {
      console.error(
        `${this.levels.ERROR} Unhandled Promise Rejection:`,
        event.reason
      );
    });

    // اتصال عمومی
    window.addEventListener("online", () => {
      console.log(`${this.levels.SUCCESS} اتصال برقرار شد`);
    });

    window.addEventListener("offline", () => {
      console.warn(
        `${this.levels.WARN} اتصال قطع شد - برنامه در حالت آفلاین است`
      );
    });

    console.log(`${this.levels.SUCCESS} Error Handlers آماده است`);
  },

  // بررسی وضعیت localStorage
  checkStorage() {
    try {
      localStorage.setItem("_test", "1");
      localStorage.removeItem("_test");
      console.log(`${this.levels.SUCCESS} localStorage فعال است`);

      const myGarden = localStorage.getItem("myGarden");
      console.log(
        `${this.levels.INFO} تعداد گیاهان: ${
          myGarden ? JSON.parse(myGarden).length : 0
        }`
      );
      return true;
    } catch (e) {
      console.error(`${this.levels.ERROR} localStorage غیرفعال: ${e.message}`);
      return false;
    }
  },

  // بررسی DOM Elements
  checkDOM() {
    const elements = {
      "tab-home": "#tab-home",
      "tab-garden": "#tab-garden",
      "tab-quiz": "#tab-quiz",
      "tab-edu": "#tab-edu",
      "tab-settings": "#tab-settings",
      "search-input": "#search-input",
      "plant-selector": "#plant-selector",
      "my-garden-list": "#my-garden-list",
      "quiz-content": "#quiz-content",
      "edu-content": "#edu-content",
      "add-modal": "#add-modal",
      "diary-modal": "#diary-modal",
      "wiki-modal": "#wiki-modal",
    };

    let missingCount = 0;
    for (const [name, selector] of Object.entries(elements)) {
      const el = document.querySelector(selector);
      if (!el) {
        console.warn(
          `${this.levels.WARN} Element یافت نشد: ${name} (${selector})`
        );
        missingCount++;
      }
    }

    if (missingCount === 0) {
      console.log(`${this.levels.SUCCESS} تمام Elements موجود است`);
    } else {
      console.error(`${this.levels.ERROR} ${missingCount} Element یافت نشد`);
    }

    return missingCount === 0;
  },

  // بررسی فایل‌های ضروری
  async checkAssets() {
    const assets = [
      "./plants.json",
      "./education.json",
      "./quiz.json",
      "./styles.css",
      "./manifest.json",
    ];

    for (const asset of assets) {
      try {
        const response = await fetch(asset, { method: "HEAD" });
        if (response.ok) {
          console.log(`${this.levels.SUCCESS} ${asset} موجود است`);
        } else {
          console.warn(
            `${this.levels.WARN} ${asset} - Status: ${response.status}`
          );
        }
      } catch (e) {
        console.error(`${this.levels.ERROR} ${asset} یافت نشد`);
      }
    }
  },

  // بررسی API ها
  checkAPIs() {
    const apis = {
      "Service Worker": "serviceWorker" in navigator,
      Notification: "Notification" in window,
      localStorage: typeof localStorage !== "undefined",
      fetch: typeof fetch !== "undefined",
      Promise: typeof Promise !== "undefined",
    };

    for (const [name, available] of Object.entries(apis)) {
      console.log(
        `${available ? this.levels.SUCCESS : this.levels.WARN} ${name}: ${
          available ? "فعال" : "غیرفعال"
        }`
      );
    }
  },

  // لاگ فعالیت‌های اصلی
  logActivity(action, data = {}) {
    const timestamp = new Date().toLocaleTimeString("fa-IR");
    console.log(`[${timestamp}] 📌 ${action}`, data);
  },

  // ریپورت خطاهای API
  logAPIError(endpoint, status, message) {
    console.error(
      `${this.levels.ERROR} API Error: ${endpoint} (${status}) - ${message}`
    );
  },

  // تست localStorage
  testLocalStorage() {
    console.log(`\n=== localStorage Test ===`);
    const testData = { test: "data", timestamp: new Date().toISOString() };
    localStorage.setItem("_debug_test", JSON.stringify(testData));
    const retrieved = JSON.parse(localStorage.getItem("_debug_test"));
    console.log(
      `${this.levels.SUCCESS} Data written and retrieved:`,
      retrieved
    );
    localStorage.removeItem("_debug_test");
  },

  // نمایش Performance
  showPerformance() {
    if (window.performance) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;

      console.log(`\n=== Performance Metrics ===`);
      console.log(`Page Load Time: ${pageLoadTime}ms`);
      console.log(`Server Response Time: ${connectTime}ms`);
    }
  },

  // شروع debugging
  init() {
    console.clear();
    console.log(
      "%c🌱 MyPlants Debugging Suite 🌱",
      "font-size: 16px; font-weight: bold; color: #4CAF50;"
    );
    console.log("═".repeat(50));

    this.setupErrorHandlers();
    this.checkDOM();
    this.checkStorage();
    this.checkAPIs();
    this.testLocalStorage();
    this.checkAssets();
    this.showPerformance();

    console.log("═".repeat(50));
    console.log(`${this.levels.SUCCESS} Debugging Suite آماده است\n`);
  },
};

export default DEBUG;
