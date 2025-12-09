import { GameComponent } from "../components/GameComponent.js";
import { get, set } from "./Database.js";

let gameState = {
  plant: {
    name: "گیاه من",
    level: 1,
    score: 0,
    water: 50,
    light: 50,
    nutrition: 50,
    health: 100,
    achievements: [],
    lastActionTime: Date.now(),
    daysSurvived: 0,
    actionHistory: [], // تاریخچه اعمال
    waterChangeNeeded: false, // نیاز به تعویض خاک
    season: "بهار", // فصل سال
  },
};

let messageTimeout = null;

// ✅ نصائح آموزشی
const TIPS = {
  water: [
    "💧 آبیاری: هر ۳ روز یکبار برای گیاهان عمومی",
    "💧 علامت تشنگی: خاک خشک، برگ پژمرده",
    "💧 هشدار: آبیاری بیش از حد باعث پوسیدگی ریشه می‌شود",
    "💧 نکته: آب اتاق‌دما استفاده کنید، نه سرد",
  ],
  light: [
    "☀️ نور: بیشتر گیاهان ۶-۸ ساعت نور نیاز دارند",
    "☀️ سایه‌دوست: سانسوریا، پتوس، آگلونما",
    "☀️ پرنور: کاکتوس، شمعدانی، حسن یوسف",
    "☀️ علامت کمبود نور: ساقه دراز و باریک می‌شود",
  ],
  feed: [
    "🧪 کود: کود ۲۰-۲۰-۲۰ برای رشد متعادل",
    "🧪 فسفر بالا: برای گلدهی و ریشه‌زایی",
    "🧪 پتاس بالا: برای کاکتوس‌ها و سختی گیاه",
    "🧪 زیادی: باعث سوختگی ریشه می‌شود",
  ],
  soil: [
    "🌍 خاک: هر ۶-۱۲ ماه یکبار تعویض کنید",
    "🌍 علامت نیاز: ریشه بیرون سوراخ، رشد آهسته",
    "🌍 ترکیب: ۵۰% پیت + ۳۰% پرلیت + ۲۰% کوکوپیت",
    "🌍 زهکشی: حتماً سوراخ در ته گلدان",
  ],
  heal: [
    "❤️ بیماری: قارچ، آفات، پوسیدگی ریشه",
    "❤️ درمان: جداسازی، تهویه، سمپاشی",
    "❤️ پیشگیری: رطوبت کنترل، تهویه خوب",
    "❤️ علامت خطر: برگ سیاه، بوی نامطبوع",
  ],
};

// ✅ وظایف روزانه
function generateDailyTasks(plant) {
  const tasks = [];
  const waterPercent = plant.water;
  const lightPercent = plant.light;
  const nutritionPercent = plant.nutrition;
  const healthPercent = plant.health;

  // وظیفه آبیاری
  if (waterPercent < 30) {
    tasks.push({
      icon: "💧",
      title: "آبیاری فوری",
      description: `آب گیاه ${Math.round(100 - waterPercent)}% کم است!`,
      priority: "عالی",
    });
  } else if (waterPercent < 50) {
    tasks.push({
      icon: "💧",
      title: "آبیاری",
      description: "خاک خشک شده است، وقت آبیاری است",
      priority: "بالا",
    });
  }

  // وظیفه نور
  if (lightPercent < 30) {
    tasks.push({
      icon: "☀️",
      title: "نور بیشتر",
      description: `گیاه ${Math.round(100 - lightPercent)}% نور کافی ندارد`,
      priority: "عالی",
    });
  }

  // وظیفه کود
  if (nutritionPercent < 40) {
    tasks.push({
      icon: "🧪",
      title: "کوددهی",
      description: "گیاه به غذا (کود) نیاز دارد",
      priority: "بالا",
    });
  }

  // وظیفه تعویض خاک
  if (plant.daysSurvived > 0 && plant.daysSurvived % 60 === 0) {
    tasks.push({
      icon: "🌍",
      title: "تعویض خاک",
      description: "وقت تعویض خاک گیاه شده است",
      priority: "بالا",
    });
  }

  // وظیفه بهبودی
  if (healthPercent < 70) {
    tasks.push({
      icon: "❤️",
      title: "درمان",
      description: "سلامت گیاه کم است، توجه بیشتری الزم است",
      priority: "عالی",
    });
  }

  return tasks;
}

// ✅ حالت‌های گیاه
function getPlantStatus(plant) {
  const avgHealth = (plant.water + plant.light + plant.nutrition) / 3;

  if (avgHealth >= 80 && plant.health >= 90) return "خیلی سالم 🌟";
  if (avgHealth >= 60) return "سالم 💚";
  if (avgHealth >= 40) return "ضعیف 😐";
  if (avgHealth >= 20) return "بسیار ضعیف 😢";
  return "در خطر ⚠️";
}

// شروع بازی
export async function startGame() {
  const saved = await get("gameState");
  if (saved) {
    gameState = saved;
  } else {
    gameState.plant.lastActionTime = Date.now();
    await set("gameState", gameState);
  }

  renderGame();
}

// رندر بازی
function renderGame() {
  const container = document.getElementById("game-content");
  if (container) {
    container.innerHTML = GameComponent.gameScreen(gameState.plant);
  }
}

// عمل‌های بازی
export async function performGameAction(action) {
  const plant = gameState.plant;
  const now = Date.now();
  const timePassed = (now - plant.lastActionTime) / 1000;

  let message = "";
  let tip = "";
  let scoreGain = 0;

  // ✅ اطمینان از وجود actionHistory
  if (!plant.actionHistory) {
    plant.actionHistory = [];
  }

  // کاهش طبیعی مقادیر
  const decay = Math.min(timePassed * 0.5, 30);
  plant.water = Math.max(0, Math.round(plant.water - decay * 0.3));
  plant.light = Math.max(0, Math.round(plant.light - decay * 0.2));
  plant.nutrition = Math.max(0, Math.round(plant.nutrition - decay * 0.25));

  // بررسی سلامت
  if (plant.water < 10 || plant.light < 10 || plant.nutrition < 10) {
    plant.health = Math.max(0, plant.health - 15);
  }

  // عمل بازیکن
  switch (action) {
    case "water":
      plant.water = Math.min(100, Math.round(plant.water + 40));
      message = "💧 آبیاری کردید!";
      tip = TIPS.water[Math.floor(Math.random() * TIPS.water.length)];
      scoreGain = 10;
      break;
    case "light":
      plant.light = Math.min(100, Math.round(plant.light + 35));
      message = "☀️ به نور بیشتری منتقل شد!";
      tip = TIPS.light[Math.floor(Math.random() * TIPS.light.length)];
      scoreGain = 10;
      break;
    case "feed":
      plant.nutrition = Math.min(100, Math.round(plant.nutrition + 45));
      message = "🧪 کود داده شد!";
      tip = TIPS.feed[Math.floor(Math.random() * TIPS.feed.length)];
      scoreGain = 15;
      break;
    case "soil":
      if (plant.daysSurvived % 60 < 5) {
        plant.nutrition = Math.min(100, plant.nutrition + 20);
        message = "🌍 خاک تعویض شد!";
        tip = TIPS.soil[Math.floor(Math.random() * TIPS.soil.length)];
        scoreGain = 25;
      } else {
        message = "⚠️ هنوز وقت تعویض خاک نشده است!";
        return;
      }
      break;
    case "heal":
      if (plant.health < 100) {
        plant.health = Math.min(100, Math.round(plant.health + 30));
        message = "❤️ گیاه درمان شد!";
        tip = TIPS.heal[Math.floor(Math.random() * TIPS.heal.length)];
        scoreGain = 20;
      } else {
        message = "✅ گیاه کاملاً سالم است!";
      }
      break;
  }

  // محاسبه سلامت
  const avgHealth = (plant.water + plant.light + plant.nutrition) / 3;
  plant.health = Math.min(100, Math.round((plant.health + avgHealth) / 2));

  // امتیاز و سطح
  plant.score += scoreGain;
  const newLevel = Math.floor(plant.score / 100) + 1;

  if (newLevel > plant.level) {
    plant.level = newLevel;
    message += ` 🎉 به سطح ${plant.level} رسیدید!`;
    scoreGain += 50;
  }

  // ✅ ثبت در تاریخچه (اکنون actionHistory تعریف شده است)
  plant.actionHistory.push({
    action,
    timestamp: now,
    waterAfter: plant.water,
    lightAfter: plant.light,
    nutritionAfter: plant.nutrition,
  });

  // دستاورد‌ها
  checkAchievements(plant);

  plant.lastActionTime = now;
  plant.daysSurvived = Math.floor(
    (now - gameState.plant.lastActionTime) / (1000 * 60 * 60 * 24)
  );

  await set("gameState", gameState);

  showMessage(message, tip);
  renderGame();
}

// بررسی دستاورد‌ها
function checkAchievements(plant) {
  const achievements = plant.achievements || [];

  if (!achievements.includes("first_water") && plant.water > 50) {
    achievements.push("first_water");
    showMessage("🏅 دستاورد: اولین آبیاری!");
  }

  if (!achievements.includes("level_5") && plant.level >= 5) {
    achievements.push("level_5");
    showMessage("🏅 دستاورد: سطح ۵!");
  }

  if (!achievements.includes("level_10") && plant.level >= 10) {
    achievements.push("level_10");
    showMessage("🏅 دستاورد: سطح ۱۰!");
  }

  if (!achievements.includes("healthy") && plant.health === 100) {
    achievements.push("healthy");
    showMessage("🏅 دستاورد: سلامت کامل!");
  }

  if (!achievements.includes("master") && plant.level >= 20) {
    achievements.push("master");
    showMessage("🏅 دستاورد: استاد باغبانی!");
  }

  if (!achievements.includes("long_life") && plant.daysSurvived >= 30) {
    achievements.push("long_life");
    showMessage("🏅 دستاورد: ۳۰ روز بقا!");
  }

  plant.achievements = achievements;
}

// نمایش پیام با نکته
function showMessage(msg, tip = "") {
  const msgEl = document.getElementById("game-message");
  if (msgEl) {
    let fullMsg = msg;
    if (tip) {
      fullMsg += `\n\n📚 نکته: ${tip}`;
    }
    msgEl.innerHTML = fullMsg.replace(/\n/g, "<br>");
    msgEl.style.display = "block";

    if (messageTimeout) clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
      msgEl.style.display = "none";
    }, 5000);
  }
}

// نمایش راهنما
export function showGameGuide() {
  const modal = document.getElementById("game-guide-modal");
  const content = document.getElementById("game-guide-content");

  if (modal && content) {
    // ✅ پر کردن content با rahnama
    content.innerHTML = GameComponent.guideScreen();
    modal.style.display = "flex";
  }
}

// رندر تب بازی
export function renderGameTab() {
  const container = document.getElementById("game-content");
  if (container) {
    container.innerHTML = GameComponent.homeScreen();
  }
}

// تابع جدید: دریافت وظایف روزانه
export function getDailyTasks() {
  return generateDailyTasks(gameState.plant);
}

// تابع جدید: دریافت حالت گیاه
export function getStatus() {
  return getPlantStatus(gameState.plant);
}
