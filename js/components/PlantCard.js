import { iconMap } from "../utils.js";

export function PlantCard(name, plant) {
  // استخراج داده‌ها
  const آبیاری = plant.آبیاری || "اطلاعات ندارد";
  const نور = plant.نور || "اطلاعات ندارد";
  const کوددهی = plant.کوددهی || "اطلاعات ندارد";
  const قلمه = plant.قلمه || "اطلاعات ندارد";
  const آفات = plant.آفات || "اطلاعات ندارد";
  const گروه = plant.گروه || "عمومی";
  const نام_علمی = plant.دانشنامه?.نام_علمی || "نامعلوم";
  const خاستگاه = plant.دانشنامه?.خاستگاه || "نامعلوم";
  const دما = plant.دانشنامه?.دما || "نامعلوم";
  const سمی_بودن = plant.دانشنامه?.سمی_بودن || "نامعلوم";

  const عیب_یابی = plant.عیب_یابی || [];
  const نصائح = plant.نصائح || [];

  return `
    <div class="plant-card-container">
      <!-- هدر با تصویر و اطلاعات اساسی -->
      <div class="plant-header-section">
        <div class="plant-image-wrapper">
          ${
            plant.image
              ? `<img src="${plant.image}" alt="${name}" class="plant-image">`
              : `<div class="plant-image-placeholder">
                  <i class="fas fa-leaf"></i>
                  <p>بدون تصویر</p>
                </div>`
          }
          <!-- بهج ظاهری -->
          <div class="plant-badge-group">
            <span class="badge badge-category">${گروه}</span>
            <span class="badge badge-status">
              ${
                سمی_بودن === "خیر"
                  ? '<i class="fas fa-check-circle"></i> بی‌خطر'
                  : '<i class="fas fa-exclamation-circle"></i> سمی'
              }
            </span>
          </div>
        </div>

        <div class="plant-intro">
          <h2 class="plant-name">${name}</h2>
          <p class="plant-scientific-name">
            <i class="fas fa-dna"></i> ${نام_علمی}
          </p>
          
          <div class="plant-quick-stats">
            <div class="quick-stat">
              <i class="fas fa-globe"></i>
              <span>${خاستگاه}</span>
            </div>
            <div class="quick-stat">
              <i class="fas fa-thermometer-half"></i>
              <span>${دما}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- تب‌های اطلاعات -->
      <div class="plant-tabs">
        <button class="plant-tab-btn active" onclick="app.switchPlantTab('care', this)">
          <i class="fas fa-leaf"></i> مراقبت
        </button>
        <button class="plant-tab-btn" onclick="app.switchPlantTab('troubleshoot', this)">
          <i class="fas fa-wrench"></i> عیب‌یابی
        </button>
        <button class="plant-tab-btn" onclick="app.switchPlantTab('info', this)">
          <i class="fas fa-book"></i> اطلاعات
        </button>
      </div>

      <!-- محتوای تب‌ها -->
      <div class="plant-tabs-content">
        
        <!-- تب مراقبت -->
        <div id="plant-tab-care" class="plant-tab-content active">
          <div class="care-grid">
            <!-- آبیاری -->
            <div class="care-card watering">
              <div class="care-icon">
                <i class="fas fa-droplet"></i>
              </div>
              <div class="care-content">
                <h4>💧 آبیاری</h4>
                <p>${آبیاری}</p>
                <div class="care-tip">
                  <i class="fas fa-lightbulb"></i>
                  <span>نوک انگشتتان را در خاک فرو کنید. اگر خشک بود، آب دهید.</span>
                </div>
              </div>
            </div>

            <!-- نور -->
            <div class="care-card lighting">
              <div class="care-icon">
                <i class="fas fa-sun"></i>
              </div>
              <div class="care-content">
                <h4>☀️ نور</h4>
                <p>${نور}</p>
                <div class="care-tip">
                  <i class="fas fa-lightbulb"></i>
                  <span>نور فیلتر شده بهترین است. از آفتاب سوزان اجتناب کنید.</span>
                </div>
              </div>
            </div>

            <!-- کوددهی -->
            <div class="care-card fertilizing">
              <div class="care-icon">
                <i class="fas fa-flask"></i>
              </div>
              <div class="care-content">
                <h4>🧪 کوددهی</h4>
                <p>${کوددهی}</p>
                <div class="care-tip">
                  <i class="fas fa-lightbulb"></i>
                  <span>کود بیش از حد مضر است. کمتر بهتر از بیشتر است.</span>
                </div>
              </div>
            </div>

            <!-- قلمه -->
            <div class="care-card propagation">
              <div class="care-icon">
                <i class="fas fa-scissors"></i>
              </div>
              <div class="care-content">
                <h4>✂️ قلمه</h4>
                <p>${قلمه}</p>
                <div class="care-tip">
                  <i class="fas fa-lightbulb"></i>
                  <span>بهترین زمان: بهار و اوایل تابستان.</span>
                </div>
              </div>
            </div>

            <!-- آفات -->
            <div class="care-card pest">
              <div class="care-icon">
                <i class="fas fa-bug"></i>
              </div>
              <div class="care-content">
                <h4>🐛 آفات</h4>
                <p>${آفات}</p>
                <div class="care-tip">
                  <i class="fas fa-lightbulb"></i>
                  <span>بررسی مرتب پشت برگ‌ها ضروری است.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- تب عیب‌یابی -->
        <div id="plant-tab-troubleshoot" class="plant-tab-content">
          <div class="troubleshoot-list">
            ${
              عیب_یابی && عیب_یابی.length > 0
                ? عیب_یابی
                    .map(
                      (issue) => `
              <div class="troubleshoot-item">
                <div class="troubleshoot-header">
                  <h4>
                    <i class="fas fa-triangle-exclamation"></i>
                    ${issue.مشکل}
                  </h4>
                </div>
                
                <div class="troubleshoot-body">
                  <div class="troubleshoot-section">
                    <strong>🔍 علت:</strong>
                    <p>${issue.علت}</p>
                  </div>
                  
                  <div class="troubleshoot-section solution">
                    <strong>✅ راه‌حل:</strong>
                    <p>${issue.راه_حل}</p>
                  </div>
                </div>
              </div>
            `
                    )
                    .join("")
                : `
              <div class="empty-troubleshoot">
                <i class="fas fa-smile-wink"></i>
                <p>این گیاه بسیار مقاوم است!</p>
                <small>مشکلات خاصی برای آن ثبت نشده است.</small>
              </div>
            `
            }
          </div>
        </div>

        <!-- تب اطلاعات -->
        <div id="plant-tab-info" class="plant-tab-content">
          <div class="info-grid">
            <div class="info-box">
              <div class="info-label">
                <i class="fas fa-globe"></i> خاستگاه
              </div>
              <div class="info-value">${خاستگاه}</div>
            </div>

            <div class="info-box">
              <div class="info-label">
                <i class="fas fa-thermometer"></i> دمای مناسب
              </div>
              <div class="info-value">${دما}</div>
            </div>

            <div class="info-box">
              <div class="info-label">
                <i class="fas fa-dna"></i> نام علمی
              </div>
              <div class="info-value">${نام_علمی}</div>
            </div>

            <div class="info-box">
              <div class="info-label">
                <i class="fas fa-layer-group"></i> دسته‌بندی
              </div>
              <div class="info-value">${گروه}</div>
            </div>

            <div class="info-box ${سمی_بودن !== "خیر" ? "toxic" : "safe"}">
              <div class="info-label">
                <i class="fas fa-shield-alt"></i> سمیت
              </div>
              <div class="info-value">
                ${سمی_بودن === "خیر" ? "✅ بی‌خطر" : "⚠️ سمی"}
              </div>
            </div>

            ${
              سمی_بودن !== "خیر"
                ? `
            <div class="info-box warning">
              <div class="info-label">
                <i class="fas fa-exclamation-triangle"></i> هشدار
              </div>
              <div class="info-value">${سمی_بودن}</div>
            </div>
            `
                : ""
            }
          </div>

          <!-- نصائح عمومی -->
          <div class="tips-section">
            <h4>
              <i class="fas fa-star"></i> نصائح مهم
            </h4>
            <ul class="tips-list">
              ${
                نصائح && نصائح.length > 0
                  ? نصائح
                      .map(
                        (tip) => `
            <li>
              <i class="fas fa-check"></i>
              ${tip}
            </li>
          `
                      )
                      .join("")
                  : `
            <li>
              <i class="fas fa-check"></i>
              این گیاه در شرایط مختلف می‌تواند رشد کند.
            </li>
            <li>
              <i class="fas fa-check"></i>
              تغییر مکان آن را استرس دهد.
            </li>
            <li>
              <i class="fas fa-check"></i>
              صبور باشید و ملاحظه کنید.
            </li>
          `
              }
            </ul>
          </div>
        </div>
      </div>

      <!-- دکمه‌های عمل (بدون تکرار) -->
      <div class="plant-action-footer">
        <button class="btn-confirm big-btn" onclick="app.openAddModal('${name}')">
          <i class="fas fa-plus"></i> افزودن به باغچه
        </button>
        <button class="btn-wiki" onclick="app.fetchWiki('${name}', '${نام_علمی}')">
          <i class="fab fa-wikipedia-w"></i> ویکی‌پدیا
        </button>
      </div>
    </div>
  `;
}
