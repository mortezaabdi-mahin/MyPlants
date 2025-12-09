import { get, set } from "./Database.js";

// ✅ تم و حالت شب
export async function toggleDarkMode() {
  const isDark = document.getElementById("dark-mode-toggle")?.checked || false;
  if (isDark) {
    document.body.classList.add("dark-mode");
    await set("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    await set("theme", "light");
  }
}

export async function initTheme() {
  try {
    const theme = await get("theme");
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      const toggle = document.getElementById("dark-mode-toggle");
      if (toggle) toggle.checked = true;
    }
  } catch (e) {
    console.warn(`⚠️ خطا در بارگذاری تم: ${e.message}`);
  }
}

// ✅ نوتیفیکیشن‌ها - کامل و فانکشنال
export async function toggleNotifications() {
  const enabled =
    document.getElementById("notifications-toggle")?.checked || false;
  await set("notificationsEnabled", enabled);

  if (enabled) {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        sendNotification(
          "🔔 نوتیفیکیشن‌ها فعال شدند!",
          "اطلاع‌رسانی‌های روزانه برای آبیاری و مراقبت فعال است."
        );
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            sendNotification(
              "🔔 نوتیفیکیشن‌ها فعال شدند!",
              "اطلاع‌رسانی‌های روزانه برای آبیاری و مراقبت فعال است."
            );
          }
        });
      }
    }

    // شروع به ارسال نوتیفیکیشن‌های دوره‌ای
    startNotificationScheduler();
    console.log("✅ نوتیفیکیشن‌ها فعال شدند");
  } else {
    stopNotificationScheduler();
    console.log("❌ نوتیفیکیشن‌ها غیرفعال شدند");
  }
}

// ارسال نوتیفیکیشن
function sendNotification(title, options = {}) {
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "icon-192.png",
      badge: "icon-192.png",
      ...options,
    });

    // بستن خودکار بعد از ۵ ثانیه
    setTimeout(() => notification.close(), 5000);

    // کلیک روی نوتیفیکیشن
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

// شناسایی و ارسال نوتیفیکیشن‌های آبیاری
async function checkWateringNotifications() {
  try {
    const garden = (await get("myGarden")) || [];
    const now = Date.now();

    garden.forEach((plant) => {
      const lastWatered = new Date(plant.lastWatered).getTime();
      const interval = plant.waterInterval * 24 * 60 * 60 * 1000; // تبدیل روز به میلی‌ثانیه
      const daysSinceWatering = (now - lastWatered) / (24 * 60 * 60 * 1000);

      // اگر زمان آبیاری رسیده باشد
      if (daysSinceWatering >= plant.waterInterval) {
        sendNotification(`💧 ${plant.nickname} نیاز به آبیاری دارد!`, {
          body: `${Math.round(
            daysSinceWatering
          )} روز از آخرین آبیاری گذشته است.`,
          tag: `water-${plant.id}`,
        });
      }
      // اگر یک روز مانده باشد
      else if (daysSinceWatering >= plant.waterInterval - 1) {
        sendNotification(`⏰ یادآوری: ${plant.nickname}`, {
          body: `فردا این گیاه نیاز به آبیاری دارد.`,
          tag: `water-reminder-${plant.id}`,
        });
      }
    });
  } catch (e) {
    console.error("❌ خطا در بررسی نوتیفیکیشن‌های آبیاری:", e);
  }
}

// شناسایی نوتیفیکیشن‌های بازی
async function checkGameNotifications() {
  try {
    const gameState = (await get("gameState")) || null;
    if (!gameState || !gameState.plant) return;

    const plant = gameState.plant;

    // اگر سلامت کم باشد
    if (plant.health < 30) {
      sendNotification(`⚠️ گیاهت در خطر است!`, {
        body: `سلامت: ${plant.health}% - درمان فوری لازم است.`,
        tag: "game-danger",
      });
    }

    // اگر سطح جدید رسیده باشد
    if (plant.level > (await get("lastNotifiedLevel")) || 0) {
      await set("lastNotifiedLevel", plant.level);
      sendNotification(`🎉 تبریک! به سطح ${plant.level} رسیدید!`, {
        body: "گیاه شما رشد کرده است.",
        tag: "game-level",
      });
    }
  } catch (e) {
    console.error("❌ خطا در بررسی نوتیفیکیشن‌های بازی:", e);
  }
}

// Scheduler برای نوتیفیکیشن‌های دوره‌ای
let notificationInterval = null;

function startNotificationScheduler() {
  // بررسی هر ساعت
  notificationInterval = setInterval(async () => {
    const enabled = await get("notificationsEnabled");
    if (enabled) {
      checkWateringNotifications();
      checkGameNotifications();
    }
  }, 60 * 60 * 1000); // هر ساعت

  // بررسی فوری در شروع
  checkWateringNotifications();
  checkGameNotifications();
}

function stopNotificationScheduler() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}

export async function initNotifications() {
  const enabled = (await get("notificationsEnabled")) || true;
  const toggle = document.getElementById("notifications-toggle");
  if (toggle) toggle.checked = enabled;

  if (enabled) {
    startNotificationScheduler();
  }
}

// ✅ سایز فونت
export async function changeFontSize(size) {
  const root = document.documentElement;
  const sizes = {
    small: "14px",
    medium: "16px",
    large: "18px",
  };

  root.style.fontSize = sizes[size] || sizes.medium;
  await set("fontSize", size);

  // تغییر رنگ دکمه‌ها
  document.querySelectorAll(".btn-small").forEach((btn) => {
    const textContent = btn.textContent.trim();
    const sizeMap = { small: "کوچک", medium: "متوسط", large: "بزرگ" };
    const isActive = textContent === sizeMap[size];

    if (isActive) {
      btn.style.background = "var(--primary-green)";
      btn.style.color = "white";
      btn.style.boxShadow = "0 4px 12px rgba(52, 199, 89, 0.3)";
    } else {
      btn.style.background = "var(--bg-input)";
      btn.style.color = "var(--text-main)";
      btn.style.boxShadow = "none";
    }
  });

  console.log(`✅ سایز فونت: ${size}`);
}

export async function initFontSize() {
  const size = (await get("fontSize")) || "medium";
  changeFontSize(size);
}

// ✅ پروفایل کاربر - با تصویر
export async function saveProfile() {
  const username = document.getElementById("username-input")?.value || "کاربر";
  const difficulty =
    document.getElementById("difficulty-select")?.value || "medium";
  const profileImageInput = document.getElementById("profile-image-input");

  if (!username.trim()) {
    alert("⚠️ لطفاً نام کاربری را وارد کنید");
    return;
  }

  // تبدیل عکس به Base64
  let profileImage = null;
  if (profileImageInput && profileImageInput.files[0]) {
    try {
      profileImage = await convertBase64(profileImageInput.files[0]);
    } catch (e) {
      console.error("❌ خطا در آپلود عکس:", e);
      alert("❌ خطا در آپلود تصویر");
      return;
    }
  }

  // ✅ ذخیره پروفایل کامل
  const profile = {
    username,
    difficulty,
    profileImage, // ✅ تصویر
    createdAt: new Date().toISOString(),
    questionsAsked: 0,
    quizScore: 0,
    plantsAdded: 0,
    bestStreak: 0,
  };

  await set("userProfile", profile);
  await updateDifficultySettings(difficulty);

  // نمایش پیام موفقیت
  const successMsg = document.createElement("div");
  successMsg.innerHTML = `✅ پروفایل ذخیره شد: ${username}`;
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--primary-green);
    color: white;
    padding: 12px 20px;
    border-radius: 50px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(successMsg);

  setTimeout(() => {
    successMsg.style.animation = "slideOut 0.3s ease";
    setTimeout(() => successMsg.remove(), 300);
  }, 2000);

  console.log("✅ پروفایل ذخیره شد:", profile);

  // به‌روز کردن نمایش
  displayProfileStats(profile);
}

export async function loadProfile() {
  const profile = (await get("userProfile")) || {
    username: "کاربر",
    difficulty: "medium",
    profileImage: null,
    createdAt: new Date().toISOString(),
    questionsAsked: 0,
    quizScore: 0,
    plantsAdded: 0,
    bestStreak: 0,
  };

  const usernameInput = document.getElementById("username-input");
  const difficultySelect = document.getElementById("difficulty-select");
  const profileImageInput = document.getElementById("profile-image-input");

  if (usernameInput) usernameInput.value = profile.username;
  if (difficultySelect) difficultySelect.value = profile.difficulty;

  // نمایش آمار کاربر
  displayProfileStats(profile);

  return profile;
}

// نمایش آمار پروفایل
async function displayProfileStats(profile) {
  const statsHtml = `
    <div class="profile-stats">
      <div class="profile-avatar">
        ${
          profile.profileImage
            ? `<img src="${profile.profileImage}" alt="${profile.username}" />`
            : `<i class="fas fa-user"></i>`
        }
      </div>
      <div class="profile-info">
        <div class="stat-item">
          <i class="fas fa-user"></i>
          <span>${profile.username}</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-graduation-cap"></i>
          <span>${profile.questionsAsked} سؤال</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-star"></i>
          <span>${profile.quizScore} امتیاز</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-leaf"></i>
          <span>${profile.plantsAdded} گیاه</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-fire"></i>
          <span>${profile.bestStreak} روز پیاپی</span>
        </div>
      </div>
    </div>
  `;

  // نمایش آمار در بخش پروفایل
  const profileContainer = document.querySelector(
    ".setting-item[style*='flex-direction: column'][style*='gap: 12px']"
  );

  // حذف آمار قدیمی اگر موجود بود
  const oldStats = profileContainer?.querySelector(".profile-stats");
  if (oldStats) oldStats.remove();

  if (profileContainer) {
    profileContainer.insertAdjacentHTML("beforeend", statsHtml);
  }
}

// تبدیل عکس به Base64
const convertBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

// ...existing code...

// ✅ پشتیبان‌گیری
export async function backup() {
  try {
    const garden = (await get("myGarden")) || [];
    const gameState = (await get("gameState")) || {};
    const profile = (await get("userProfile")) || {};
    const theme = (await get("theme")) || "light";

    const data = {
      garden,
      gameState,
      profile,
      theme,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();

    console.log("✅ بکاپ دانلود شد");
    alert("✅ بکاپ با موفقیت دانلود شد");
  } catch (e) {
    console.error("❌ خطا در بکاپ:", e);
    alert("❌ خطا در دانلود بکاپ");
  }
}

export function triggerRestore() {
  document.getElementById("restore-input")?.click();
}

export function restore(input) {
  const file = input?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (data.garden) await set("myGarden", data.garden);
      if (data.gameState) await set("gameState", data.gameState);
      if (data.profile) await set("userProfile", data.profile);
      if (data.theme) await set("theme", data.theme);

      alert("✅ بازگردانی موفق!");
      location.reload();
    } catch (err) {
      console.error("❌ فایل خراب:", err);
      alert("❌ فایل خراب است");
    }
  };
  reader.readAsText(file);
}

// ✅ Export کامل
export async function exportAllData() {
  try {
    const allData = {
      garden: await get("myGarden"),
      gameState: await get("gameState"),
      quizScores: await get("quizScores"),
      profile: await get("userProfile"),
      theme: await get("theme"),
      fontSize: await get("fontSize"),
      notificationsEnabled: await get("notificationsEnabled"),
      exportDate: new Date().toISOString(),
      appVersion: "1.2.0",
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `full-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();

    console.log("✅ Export کامل دانلود شد");
    alert("✅ تمام داده‌ها صادر شدند");
  } catch (e) {
    console.error("❌ خطا در Export:", e);
    alert("❌ خطا در صادر کردن");
  }
}

// ✅ پاک کردن کش
export async function clearCache() {
  if (confirm("⚠️ آیا می‌خواهید کش را پاک کنید؟")) {
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      alert("✅ کش پاک شد");
      location.reload();
    } catch (e) {
      alert("❌ خطا در پاک کردن کش");
    }
  }
}

// ✅ ریست کل داده‌ها
export async function resetData() {
  if (
    confirm("⚠️⚠️ این عمل تمام داده‌های شما را حذف می‌کند. آیا مطمئن هستید؟")
  ) {
    if (confirm("آخرین تایید: تمام داده‌ها حذف خواهند شد!")) {
      try {
        // حذف تمام کلیدها
        const keys = [
          "myGarden",
          "gameState",
          "quizScores",
          "userProfile",
          "theme",
          "fontSize",
          "notificationsEnabled",
        ];

        for (const key of keys) {
          await set(key, null);
        }

        alert("✅ تمام داده‌ها ریست شدند");
        location.reload();
      } catch (e) {
        alert("❌ خطا در ریست");
      }
    }
  }
}
