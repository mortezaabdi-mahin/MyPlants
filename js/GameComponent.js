export const GameComponent = {
  // صفحه شروع بازی
  homeScreen: () => `
    <div class="game-container center-box">
      <div class="game-icon"><i class="fas fa-leaf"></i></div>
      <h2>🌱 بازی گلداری پیشرفته</h2>
      <p>گیاهت را پرورش بده و یاد بگیر!</p>
      
      <div class="game-stats">
        <div class="stat-box">
          <span>🎮 سطح:</span>
          <strong id="player-level">۱</strong>
        </div>
        <div class="stat-box">
          <span>⭐ امتیاز:</span>
          <strong id="player-score">۰</strong>
        </div>
        <div class="stat-box">
          <span>📅 روز:</span>
          <strong id="player-days">۰</strong>
        </div>
      </div>

      <button class="btn-confirm big-btn" onclick="app.startGarden()">
        <i class="fas fa-play"></i> شروع بازی
      </button>
      <button class="btn-wiki" onclick="app.viewGameGuide()">
        <i class="fas fa-question-circle"></i> راهنما
      </button>
    </div>
  `,

  // صفحه اصلی بازی
  gameScreen: (plant) => `
    <div class="game-wrapper">
      <!-- سر صفحه -->
      <div class="game-header">
        <div class="game-info">
          <h3>${plant.name}</h3>
          <span class="game-level">سطح ${plant.level}</span>
        </div>
        <div class="game-score">
          <i class="fas fa-star"></i> ${plant.score} | 📅 ${
    plant.daysSurvived || 0
  } روز
        </div>
      </div>

      <!-- وضعیت و وظایف -->
      <div class="game-status-bar">
        <div class="status-badge" id="plant-status"></div>
        <div class="tasks-preview" id="tasks-preview"></div>
      </div>

      <!-- تصویر و نوار وضعیت -->
      <div class="game-display">
        <div class="plant-visual">
          ${GameComponent.renderAnimatedPlant(plant)}
        </div>
        
        <div class="plant-status">
          <div class="status-bar">
            <span>💧</span>
            <div class="bar"><div class="fill" style="width:${
              plant.water
            }%"></div></div>
            <span>${plant.water}%</span>
          </div>
          
          <div class="status-bar">
            <span>☀️</span>
            <div class="bar"><div class="fill" style="width:${
              plant.light
            }%"></div></div>
            <span>${plant.light}%</span>
          </div>
          
          <div class="status-bar">
            <span>🧪</span>
            <div class="bar"><div class="fill" style="width:${
              plant.nutrition
            }%"></div></div>
            <span>${plant.nutrition}%</span>
          </div>

          <div class="status-bar">
            <span>❤️</span>
            <div class="bar health"><div class="fill" style="width:${
              plant.health
            }%"></div></div>
            <span>${plant.health}%</span>
          </div>
        </div>
      </div>

      <!-- دکمه‌های عمل -->
      <div class="game-actions">
        <button class="action-btn water-btn" onclick="app.gameAction('water')">
          <i class="fas fa-tint"></i> آبیاری
        </button>
        <button class="action-btn light-btn" onclick="app.gameAction('light')">
          <i class="fas fa-sun"></i> نور
        </button>
        <button class="action-btn feed-btn" onclick="app.gameAction('feed')">
          <i class="fas fa-flask"></i> کود
        </button>
        <button class="action-btn soil-btn" onclick="app.gameAction('soil')" style="background: linear-gradient(135deg, #8b4513, #a0522d);">
          <i class="fas fa-leaf"></i> خاک
        </button>
      </div>

      <div class="game-actions">
        <button class="action-btn heal-btn" onclick="app.gameAction('heal')" style="grid-column: span 2;">
          <i class="fas fa-heart"></i> درمان
        </button>
        <button class="action-btn" onclick="app.viewGameGuide()" style="grid-column: span 2; background: var(--info-blue);">
          <i class="fas fa-book"></i> نصائح
        </button>
      </div>

      <!-- پیام و نکته -->
      <div class="game-message" id="game-message"></div>

      <!-- دستاورد‌ها -->
      <div class="game-achievements">
        <h4>🏅 دستاورد‌ها:</h4>
        <div class="achievement-list" id="achievement-list">
          ${GameComponent.renderAchievements(plant.achievements || [])}
        </div>
      </div>

      <button class="btn-cancel" onclick="app.switchTab('home')" style="width:100%; margin-top:15px;">
        <i class="fas fa-arrow-left"></i> بازگشت
      </button>
    </div>
  `,

  // ✅ انیمیشن گیاه مثل Pou
  renderAnimatedPlant: (plant) => {
    const health = plant.health;
    let size = "small";
    let plantChar = "🌱";
    let sizeLabel = "بسیار کوچک";

    if (plant.level >= 3) {
      size = "medium";
      plantChar = "🌿";
      sizeLabel = "کوچک";
    }
    if (plant.level >= 7) {
      size = "large";
      plantChar = "🌾";
      sizeLabel = "متوسط";
    }
    if (plant.level >= 12) {
      size = "xlarge";
      plantChar = "🌳";
      sizeLabel = "بزرگ";
    }
    if (plant.level >= 18) {
      size = "xxlarge";
      plantChar = "🌲";
      sizeLabel = "بسیار بزرگ";
    }

    let mood = "happy";
    let moodEmoji = "😊";
    let moodText = "شاد";

    if (health < 30) {
      mood = "sad";
      moodEmoji = "😢";
      moodText = "ناراحت";
    } else if (health < 60) {
      mood = "neutral";
      moodEmoji = "😐";
      moodText = "خنثی";
    } else if (health < 80) {
      mood = "smile";
      moodEmoji = "🙂";
      moodText = "راضی";
    } else {
      mood = "happy";
      moodEmoji = "😄";
      moodText = "خیلی شاد";
    }

    return `
      <style>
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes sway { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-2deg); } 75% { transform: rotate(2deg); } }
        @keyframes pulse-glow { 0%, 100% { filter: drop-shadow(0 0 5px rgba(52, 199, 89, 0.5)); } 50% { filter: drop-shadow(0 0 15px rgba(52, 199, 89, 0.8)); } }
        
        .plant-container { display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .plant-animation { position: relative; height: 200px; display: flex; align-items: center; justify-content: center; }
        .plant-body { font-size: ${
          size === "small"
            ? "60px"
            : size === "medium"
            ? "80px"
            : size === "large"
            ? "100px"
            : size === "xlarge"
            ? "120px"
            : "140px"
        }; animation: bounce 2s ease-in-out infinite, sway 3s ease-in-out infinite, pulse-glow 2s ease-in-out infinite; }
        .face-container { display: flex; gap: 10px; align-items: center; font-size: 40px; margin-top: 10px; }
        .eyes { display: flex; gap: 8px; font-size: 20px; }
        .mouth { font-size: 24px; }
        .status-info { text-align: center; margin-top: 10px; }
        .status-info p { margin: 3px 0; font-size: 0.9rem; }
      </style>
      
      <div class="plant-container">
        <div class="plant-animation">
          <div class="plant-body">${plantChar}</div>
        </div>
        
        <div class="face-container">
          <div class="eyes">
            <span>${
              mood === "sad"
                ? "😢"
                : mood === "neutral"
                ? "😐"
                : mood === "smile"
                ? "🙂"
                : "😊"
            }</span>
          </div>
        </div>

        <div class="status-info">
          <p><strong>${sizeLabel}</strong></p>
          <p style="color: var(--primary-green); font-weight: bold;">
            ${
              health >= 80
                ? "✨ خیلی سالم"
                : health >= 60
                ? "💚 سالم"
                : health >= 40
                ? "😐 ضعیف"
                : "⚠️ در خطر"
            }
          </p>
          <p style="font-size: 0.8rem; color: var(--text-secondary);">
            ${moodText} ${moodEmoji}
          </p>
        </div>
      </div>
    `;
  },

  renderAchievements: (achievements) => {
    const allAchievements = [
      { id: "first_water", icon: "💧", name: "اولین آبیاری" },
      { id: "level_5", icon: "⭐", name: "سطح ۵" },
      { id: "level_10", icon: "⭐⭐", name: "سطح ۱۰" },
      { id: "healthy", icon: "❤️", name: "سلامت کامل" },
      { id: "long_life", icon: "📅", name: "۳۰ روز بقا" },
      { id: "master", icon: "👑", name: "استاد باغبانی" },
    ];

    return allAchievements
      .map((ach) =>
        achievements.includes(ach.id)
          ? `<div class="achievement unlocked"><span>${ach.icon}</span> ${ach.name}</div>`
          : `<div class="achievement locked"><span>🔒</span> ${ach.name}</div>`
      )
      .join("");
  },

  // ✅ راهنمای کامل بازی
  guideScreen: () => `
    <div class="game-guide">
      <h3 style="color: var(--primary-green); margin-bottom: 15px; text-align: center;">
        <i class="fas fa-gamepad"></i> 🎮 راهنمای بازی گلداری
      </h3>
      
      <div class="guide-section">
        <h4>🎯 هدف بازی:</h4>
        <p>از گیاه خود مراقبت کنید تا سطح بالاتری رسیده، دستاورد کسب کنید و درباره باغبانی واقعی یاد بگیرید!</p>
      </div>

      <div class="guide-section">
        <h4>💧 آبیاری (Watering):</h4>
        <ul>
          <li>هر ۳ روز یکبار یا وقتی خاک خشک شد</li>
          <li>⚠️ <strong>هشدار:</strong> آبیاری بیش از حد = پوسیدگی ریشه و مرگ</li>
          <li>✅ <strong>علامات خشکی:</strong> خاک خشک، برگ‌های پژمرده</li>
          <li>💡 <strong>نکته:</strong> از آب اتاق‌دما استفاده کنید</li>
        </ul>
      </div>

      <div class="guide-section">
        <h4>☀️ نور (Light):</h4>
        <ul>
          <li>بیشتر گیاهان ۶-۸ ساعت نور نیاز دارند</li>
          <li>⚠️ <strong>علامات کمبود:</strong> ساقه‌های دراز، برگ‌های کم‌رنگ</li>
          <li>✅ <strong>پنجره جنوبی:</strong> برای کاکتوس و گیاهان گلدار</li>
          <li>💡 <strong>نکته:</strong> نور مستقیم می‌تواند برگ را بسوزاند</li>
        </ul>
      </div>

      <div class="guide-section">
        <h4>🧪 کود (Fertilizer):</h4>
        <ul>
          <li>کود ۲۰-۲۰-۲۰ برای رشد متعادل</li>
          <li>⚠️ <strong>خطر:</strong> کود بیش از حد = سوختگی ریشه</li>
          <li>✅ <strong>هنگام:</strong> بهار و تابستان (فصل رشد)</li>
          <li>💡 <strong>نکته:</strong> کود فسفر بالا برای گلدهی</li>
        </ul>
      </div>

      <div class="guide-section">
        <h4>🌍 تعویض خاک (Soil Change):</h4>
        <ul>
          <li>هر ۲ ماه یکبار خاک را تعویض کنید</li>
          <li>✅ <strong>علامات نیاز:</strong> ریشه بیرون سوراخ</li>
          <li>💡 <strong>خاک مناسب:</strong> ۵۰% پیت ماس + ۳۰% پرلیت + ۲۰% کوکوپیت</li>
          <li>⚠️ <strong>هشدار:</strong> خاک باغچه برای گلدان مناسب نیست</li>
        </ul>
      </div>

      <div class="guide-section">
        <h4>❤️ درمان (Healing):</h4>
        <ul>
          <li>وقتی سلامت گیاه کم است از این دکمه استفاده کنید</li>
          <li>⚠️ <strong>علامات خطر:</strong> برگ‌های سیاه، بوی نامطبوع</li>
          <li>✅ <strong>راه‌حل:</strong> تهویه بهتر، کاهش آبیاری</li>
          <li>💡 <strong>نکته:</strong> پیشگیری بهتر از درمان است!</li>
        </ul>
      </div>

      <div class="guide-section" style="background: rgba(52, 199, 89, 0.1); padding: 12px; border-radius: 12px; border-right: 4px solid var(--primary-green);">
        <h4>💡 نکات طلایی:</h4>
        <ul style="margin: 10px 0; font-size: 0.9rem;">
          <li>🎯 <strong>تعادل مهم است:</strong> هر دکمه را نزنید!</li>
          <li>📈 <strong>پیشرفت:</strong> هر ۱۰۰ امتیاز = ۱ سطح جدید</li>
          <li>🏆 <strong>دستاورد:</strong> ۳۰ روز بقا = 🏅</li>
          <li>📚 <strong>یادگیری:</strong> نصائح هر بار نمایش داده می‌شود</li>
          <li>⏰ <strong>منظم باشید:</strong> هر روز اپ را باز کنید!</li>
          <li>🌱 <strong>رشد طبیعی:</strong> گیاه تا سطح ۲۰ رشد می‌کند</li>
        </ul>
      </div>

      <button class="btn-cancel" onclick="app.closeModal('game-guide-modal')" style="width:100%; margin-top:20px;">
        بستن
      </button>
    </div>
  `,
};
