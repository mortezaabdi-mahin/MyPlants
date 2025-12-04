/* =========================================
   ۱. متغیرهای جهانی و تنظیمات اولیه
   ========================================= */
let plantData = {};
let educationData = [];

// نگاشت آیکون‌ها برای نمایش گرافیکی زیبا
const iconMap = {
  // ویژگی‌های اصلی
  آبیاری: "fa-tint",
  نور: "fa-sun",
  کوددهی: "fa-flask",
  قلمه: "fa-cut",
  آفات: "fa-bug",

  // ویژگی‌های دانشنامه (شناسنامه)
  دما: "fa-temperature-high",
  خاستگاه: "fa-globe-americas",
  خاک_ایده‌آل: "fa-layer-group",
  نام_علمی: "fa-dna",
  سمی_بودن: "fa-skull-crossbones", // آیکون اسکلت برای هشدار
  رطوبت: "fa-cloud-showers-heavy",
};

/* =========================================
   ۲. لود کردن داده‌ها (Data Loading)
   ========================================= */

// دریافت دیتابیس گیاهان از فایل JSON
async function loadPlantsData() {
  try {
    const response = await fetch("plants.json");
    if (!response.ok) throw new Error("مشکل در دریافت plants.json");

    plantData = await response.json();

    // پس از دریافت موفق، فیلترها را می‌سازیم
    populateFilters();
    filterPlants();
    console.log("✅ دیتابیس گیاهان بارگذاری شد.");
  } catch (error) {
    console.error(error);
    document.getElementById(
      "results"
    ).innerHTML = `<div class="empty-state" style="color:#d32f2f">
                <i class="fas fa-wifi"></i>
                <p>خطا در بارگذاری اطلاعات. لطفاً فایل‌ها را روی سرور اجرا کنید (Live Server).</p>
            </div>`;
  }
}

// دریافت دیتابیس آموزش‌ها از فایل JSON
async function loadEducationData() {
  try {
    const response = await fetch("education.json");
    if (!response.ok) throw new Error("مشکل در دریافت education.json");

    educationData = await response.json();
    console.log("✅ دیتابیس آموزش بارگذاری شد.");

    // اگر کاربر در تب آموزش است، رفرش کن
    if (document.getElementById("tab-edu").style.display === "block") {
      renderEducation();
    }
  } catch (error) {
    console.error(error);
  }
}

/* =========================================
   ۳. مدیریت تب‌ها (Navigation)
   ========================================= */
function switchTab(tabName) {
  // مخفی کردن همه تب‌ها
  document
    .querySelectorAll(".tab-section")
    .forEach((el) => (el.style.display = "none"));
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));

  // نمایش تب انتخاب شده
  document.getElementById(`tab-${tabName}`).style.display = "block";

  // اکتیو کردن دکمه نویگیشن مربوطه (0:Home, 1:Garden, 2:Edu, 3:Settings)
  let navIndex = 0;
  if (tabName === "garden") navIndex = 1;
  if (tabName === "edu") navIndex = 2;
  if (tabName === "settings") navIndex = 3;

  document.querySelectorAll(".nav-item")[navIndex].classList.add("active");

  // رندر کردن محتوای تب‌های خاص
  if (tabName === "garden") renderGarden();
  if (tabName === "edu") renderEducation();
}

/* =========================================
   ۴. دانشنامه و جستجو (Home Tab)
   ========================================= */

// پر کردن لیست فیلتر گروه
function populateFilters() {
  const groupFilter = document.getElementById("group-filter");
  const uniqueGroups = new Set();

  for (const name in plantData) {
    if (plantData[name].گروه) uniqueGroups.add(plantData[name].گروه);
  }

  groupFilter.innerHTML = '<option value="all">همه گروه‌ها</option>';
  uniqueGroups.forEach((val) => {
    const option = document.createElement("option");
    option.value = val;
    option.textContent = val;
    groupFilter.appendChild(option);
  });

  // پر کردن لیست فیلتر نور (ثابت)
  const lightFilter = document.getElementById("light-filter");
  lightFilter.innerHTML = `
        <option value="all">همه نورها</option>
        <option value="low">سایه‌دوست / کم</option>
        <option value="medium">متوسط / آپارتمانی</option>
        <option value="high">پرنور / آفتابی</option>
    `;
}

// دکمه ضربدر باکس جستجو
function clearSearch() {
  document.getElementById("search-input").value = "";
  filterPlants();
}

// منطق اصلی فیلتر و جستجو
function filterPlants() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  const searchText = searchInput.value.trim();
  const groupVal = document.getElementById("group-filter").value;
  const lightVal = document.getElementById("light-filter").value;

  const selector = document.getElementById("plant-selector");
  const results = document.getElementById("results");

  selector.innerHTML = '<option value="">-- انتخاب کنید --</option>';
  results.innerHTML =
    '<div class="empty-state"><i class="fas fa-search"></i><p>گیاه مورد نظر را جستجو یا انتخاب کنید.</p></div>';

  let matchCount = 0;

  for (const name in plantData) {
    const p = plantData[name];

    // شرط ۱: فیلتر گروه
    const gMatch = groupVal === "all" || p.گروه === groupVal;

    // شرط ۲: فیلتر نور
    let lMatch = true;
    if (lightVal !== "all") {
      if (
        lightVal === "low" &&
        !p.نور.includes("کم") &&
        !p.نور.includes("سایه")
      )
        lMatch = false;
      if (
        lightVal === "medium" &&
        !p.نور.includes("متوسط") &&
        !p.نور.includes("فیلتر")
      )
        lMatch = false;
      if (
        lightVal === "high" &&
        !p.نور.includes("زیاد") &&
        !p.نور.includes("آفتاب")
      )
        lMatch = false;
    }

    // شرط ۳: جستجوی متنی
    const sMatch = searchText === "" || name.includes(searchText);

    if (gMatch && lMatch && sMatch) {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      selector.appendChild(opt);
      matchCount++;
    }
  }

  if (matchCount === 0) {
    selector.innerHTML = '<option value="">-- گیاهی یافت نشد --</option>';
  } else if (matchCount === 1 && searchText !== "") {
    // انتخاب خودکار اگر فقط یک نتیجه بود
    selector.selectedIndex = 1;
    displayPlantInfo();
  }
}

// نمایش کارت اطلاعات گیاه
function displayPlantInfo() {
  const selector = document.getElementById("plant-selector");
  const selectedPlant = selector.value;
  const resultsDiv = document.getElementById("results");

  if (!selectedPlant) return;

  const info = plantData[selectedPlant];

  let htmlContent = `
      <div class="plant-card">
          <div class="plant-header">
              <h2><i class="fas fa-leaf"></i> ${selectedPlant}</h2>
              <span class="badge">${info.گروه}</span>
          </div>
          
          <div class="info-grid">
    `;

  // نمایش ویژگی‌های اصلی (به جز موارد خاص)
  for (const key in info) {
    if (key !== "گروه" && key !== "عیب_یابی" && key !== "دانشنامه") {
      const iconClass = iconMap[key] || "fa-check";
      htmlContent += `
          <div class="info-box">
              <div class="info-icon"><i class="fas ${iconClass}"></i></div>
              <div class="info-content">
                  <strong>${key}</strong>
                  <span>${info[key]}</span>
              </div>
          </div>
        `;
    }
  }
  htmlContent += `</div>`;

  // === بخش دانشنامه (شناسنامه) ===
  if (info.دانشنامه) {
    htmlContent += `
        <div class="wiki-section">
            <h3 class="wiki-title"><i class="fas fa-passport"></i> شناسنامه گیاه</h3>
            <div class="wiki-grid">
      `;

    for (const wikiKey in info.دانشنامه) {
      const label = wikiKey.replace(/_/g, " ");
      const value = info.دانشنامه[wikiKey];
      const iconClass = iconMap[wikiKey] || "fa-info-circle";

      // استایل قرمز برای هشدار سمی بودن
      const isToxic =
        wikiKey === "سمی_بودن" &&
        (value.includes("بله") || value.includes("سمی"));
      const style = isToxic ? "color: #d32f2f;" : "";

      htmlContent += `
          <div class="wiki-item">
              <i class="fas ${iconClass} wiki-icon" style="${style}"></i>
              <div class="wiki-text">
                  <span class="wiki-label">${label}:</span>
                  <span class="wiki-value" style="${style}">${value}</span>
              </div>
          </div>
        `;
    }
    htmlContent += `</div></div>`;
  }

  // دکمه‌های عملیات (افزودن به باغچه + ویکی‌پدیا)
  htmlContent += `
        <button class="btn-add-garden" onclick="openAddModal('${selectedPlant}')">
            <i class="fas fa-plus-circle"></i> افزودن به باغچه من
        </button>
        <button class="btn-wiki" onclick="fetchWikipedia('${selectedPlant}')">
            <i class="fab fa-wikipedia-w"></i> مشاهده عکس و اطلاعات در ویکی‌پدیا
        </button>
    </div>`;

  // بخش عیب‌یابی
  if (info.عیب_یابی && info.عیب_یابی.length > 0) {
    htmlContent += `
          <div class="plant-card">
             <h3 style="color: var(--warning-red); margin: 15px; display:flex; align-items:center; gap:10px;">
                <i class="fas fa-user-md"></i> پزشک گیاه
             </h3>
             <div style="padding: 0 15px 15px 15px; display: grid; gap: 10px;">
        `;

    info.عیب_یابی.forEach((item) => {
      htmlContent += `
                <div class="trouble-box">
                    <div class="trouble-title">
                        <i class="fas fa-exclamation-circle"></i> ${item.مشکل}
                    </div>
                    <div class="trouble-cause">
                        <span>علت:</span> ${item.علت}
                    </div>
                    <div class="trouble-solution">
                        <i class="fas fa-check-circle"></i> <b>راه حل:</b> ${item.راه_حل}
                    </div>
                </div>
            `;
    });
    htmlContent += `</div></div>`;
  }

  resultsDiv.innerHTML = htmlContent;
}

/* =========================================
   ۵. اتصال به ویکی‌پدیا (Wikipedia API)
   ========================================= */

// تمیز کردن نام گیاه (حذف پرانتزها)
function cleanPlantName(name) {
  return name.split("(")[0].trim();
}

async function fetchWikipedia(plantName) {
  const cleanName = cleanPlantName(plantName);
  const modal = document.getElementById("wiki-modal");
  const loading = document.getElementById("wiki-loading");
  const resultDiv = document.getElementById("wiki-result");
  const errorDiv = document.getElementById("wiki-error");

  // باز کردن مودال
  modal.style.display = "flex";
  loading.style.display = "block";
  resultDiv.style.display = "none";
  errorDiv.style.display = "none";

  try {
    const apiUrl = `https://fa.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&titles=${cleanName}&pithumbsize=500&exintro&explaintext&origin=*`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const pageData = pages[pageId];

    if (pageId === "-1") throw new Error("مقاله‌ای پیدا نشد");

    // پر کردن اطلاعات
    document.getElementById(
      "wiki-title-modal"
    ).innerHTML = `<i class="fab fa-wikipedia-w"></i> ${pageData.title}`;
    document.getElementById("wiki-extract").innerText = pageData.extract
      ? pageData.extract.substring(0, 500) + "..."
      : "توضیحات متنی موجود نیست.";

    const imgEl = document.getElementById("wiki-image");
    if (pageData.thumbnail && pageData.thumbnail.source) {
      imgEl.src = pageData.thumbnail.source;
      imgEl.style.display = "block";
    } else {
      imgEl.style.display = "none";
    }

    document.getElementById(
      "wiki-link"
    ).href = `https://fa.wikipedia.org/wiki/${cleanName}`;

    loading.style.display = "none";
    resultDiv.style.display = "block";
  } catch (error) {
    console.error(error);
    loading.style.display = "none";
    errorDiv.style.display = "block";
  }
}

function closeWikiModal() {
  document.getElementById("wiki-modal").style.display = "none";
}

/* =========================================
   ۶. باغچه من (My Garden Logic)
   ========================================= */
let selectedPlantForGarden = null;

function openAddModal(plantName) {
  selectedPlantForGarden = plantName;
  document.getElementById("modal-nickname").value = plantName;
  document.getElementById("add-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("add-modal").style.display = "none";
}

function confirmAddToGarden() {
  const nickname =
    document.getElementById("modal-nickname").value || selectedPlantForGarden;
  const interval = parseInt(document.getElementById("modal-days").value) || 7;

  const newPlant = {
    id: Date.now(),
    originalName: selectedPlantForGarden,
    nickname: nickname,
    waterInterval: interval,
    lastWatered: new Date().toISOString(),
    logs: [], // آرایه خالی برای دفترچه خاطرات
  };

  let garden = JSON.parse(localStorage.getItem("myGarden")) || [];
  garden.push(newPlant);
  localStorage.setItem("myGarden", JSON.stringify(garden));

  closeModal();
  alert("✅ گیاه به باغچه شما اضافه شد");
  switchTab("garden");
}

function renderGarden() {
  const garden = JSON.parse(localStorage.getItem("myGarden")) || [];
  const list = document.getElementById("my-garden-list");

  if (garden.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><p>هنوز گیاهی اضافه نکرده‌اید.</p></div>';
    return;
  }

  list.innerHTML = "";
  const today = new Date();

  garden.forEach((plant) => {
    const lastDate = new Date(plant.lastWatered);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + plant.waterInterval);

    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let statusText = `${diffDays} روز مانده`;
    let cardClass = "garden-card";

    if (diffDays <= 0) {
      statusText = "🚨 موعد آبیاری گذشته!";
      cardClass += " urgent";
    } else if (diffDays === 1) {
      statusText = "⏰ فردا نوبت آبیاری است";
    }

    const div = document.createElement("div");
    div.className = cardClass;
    div.innerHTML = `
            <div class="garden-info">
                <h3>${plant.nickname}</h3>
                <p>${plant.originalName}</p>
                <div style="margin-top:5px; font-weight:bold; color: ${
                  diffDays <= 0 ? "var(--warning-red)" : "var(--primary-green)"
                }">
                    <i class="fas fa-clock"></i> ${statusText}
                </div>
            </div>
            <div class="garden-actions">
                <button class="btn-water" style="background:var(--secondary-green)" onclick="openDiary(${
                  plant.id
                })">
                    <i class="fas fa-book"></i> دفترچه
                </button>
                <button class="btn-water" onclick="waterPlant(${plant.id})">
                    <i class="fas fa-tint"></i> آب دادم
                </button>
                <button class="btn-delete" onclick="deletePlant(${plant.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    list.appendChild(div);
  });
}

function waterPlant(id) {
  let garden = JSON.parse(localStorage.getItem("myGarden"));
  const index = garden.findIndex((p) => p.id === id);
  if (index > -1) {
    garden[index].lastWatered = new Date().toISOString();
    // ثبت خودکار در دفترچه
    if (!garden[index].logs) garden[index].logs = [];
    garden[index].logs.push({
      id: Date.now(),
      type: "water",
      date: new Date().toISOString().slice(0, 10),
      note: "آبیاری ثبت شد (خودکار)",
    });

    localStorage.setItem("myGarden", JSON.stringify(garden));
    renderGarden();
  }
}

function deletePlant(id) {
  if (!confirm("آیا از حذف این گیاه مطمئن هستید؟")) return;
  let garden = JSON.parse(localStorage.getItem("myGarden"));
  garden = garden.filter((p) => p.id !== id);
  localStorage.setItem("myGarden", JSON.stringify(garden));
  renderGarden();
}

/* =========================================
   ۷. دفترچه خاطرات (Plant Diary)
   ========================================= */
let currentPlantIdForDiary = null;

function openDiary(plantId) {
  currentPlantIdForDiary = plantId;
  const garden = JSON.parse(localStorage.getItem("myGarden"));
  const plant = garden.find((p) => p.id === plantId);

  document.getElementById(
    "diary-title"
  ).innerText = `تاریخچه: ${plant.nickname}`;
  document.getElementById("diary-modal").style.display = "flex";
  document.getElementById("log-date").valueAsDate = new Date();
  document.getElementById("log-note").value = "";

  renderLogs(plant);
}

function closeDiary() {
  document.getElementById("diary-modal").style.display = "none";
}

function renderLogs(plant) {
  const list = document.getElementById("diary-list");
  list.innerHTML = "";

  if (!plant.logs || plant.logs.length === 0) {
    list.innerHTML =
      '<div class="empty-state" style="padding:20px; font-size:0.9rem;">هنوز رویدادی ثبت نشده است.</div>';
    return;
  }

  // مرتب‌سازی: جدیدترین بالا
  const sortedLogs = plant.logs.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const icons = {
    water: "fa-tint",
    fertilizer: "fa-flask",
    growth: "fa-seedling",
    soil: "fa-layer-group",
    pest: "fa-bug",
    prune: "fa-cut",
    other: "fa-sticky-note",
  };
  const labels = {
    water: "آبیاری",
    fertilizer: "کوددهی",
    growth: "رشد",
    soil: "خاک",
    pest: "آفت",
    prune: "هرس",
    other: "یادداشت",
  };

  sortedLogs.forEach((log) => {
    const div = document.createElement("div");
    div.className = "log-item";
    div.innerHTML = `
            <div class="log-icon type-${log.type}">
                <i class="fas ${icons[log.type]}"></i>
            </div>
            <div class="log-content">
                <span class="log-date">
                    ${new Date(log.date).toLocaleDateString("fa-IR")} | ${
      labels[log.type]
    }
                    <i class="fas fa-trash" style="float:left; cursor:pointer; color:#ef5350;" onclick="deleteLog(${
                      log.id
                    })"></i>
                </span>
                <div class="log-text">${log.note}</div>
            </div>
        `;
    list.appendChild(div);
  });
}

function saveLog() {
  const type = document.getElementById("log-type").value;
  const date = document.getElementById("log-date").value;
  const note = document.getElementById("log-note").value.trim();

  if (!note) {
    alert("لطفاً توضیح بنویسید.");
    return;
  }

  let garden = JSON.parse(localStorage.getItem("myGarden"));
  const plantIndex = garden.findIndex((p) => p.id === currentPlantIdForDiary);

  if (plantIndex > -1) {
    if (!garden[plantIndex].logs) garden[plantIndex].logs = [];

    const newLog = { id: Date.now(), type, date, note };
    garden[plantIndex].logs.push(newLog);

    // آپدیت زمان آبیاری اگر نوع رویداد آبیاری بود
    if (type === "water") {
      garden[plantIndex].lastWatered = new Date().toISOString();
    }

    localStorage.setItem("myGarden", JSON.stringify(garden));
    renderLogs(garden[plantIndex]);
    renderGarden();
    document.getElementById("log-note").value = "";
  }
}

function deleteLog(logId) {
  if (!confirm("آیا حذف شود؟")) return;
  let garden = JSON.parse(localStorage.getItem("myGarden"));
  const plantIndex = garden.findIndex((p) => p.id === currentPlantIdForDiary);
  if (plantIndex > -1) {
    garden[plantIndex].logs = garden[plantIndex].logs.filter(
      (l) => l.id !== logId
    );
    localStorage.setItem("myGarden", JSON.stringify(garden));
    renderLogs(garden[plantIndex]);
  }
}

/* =========================================
   ۸. بخش آموزش (Education)
   ========================================= */
function renderEducation() {
  const container = document.getElementById("edu-content");
  if (container.innerHTML !== "" || educationData.length === 0) return;

  educationData.forEach((item, index) => {
    let icon = "fa-book";
    if (item.category === "تغذیه" || item.category === "تقویتی")
      icon = "fa-flask";
    if (item.category === "آفات") icon = "fa-bug";
    if (item.category === "آبیاری") icon = "fa-tint";
    if (item.category === "خاک") icon = "fa-layer-group";
    if (item.category === "نور") icon = "fa-sun";
    if (item.category === "تکثیر") icon = "fa-cut";

    const div = document.createElement("div");
    div.className = "edu-card";
    div.innerHTML = `
            <div class="edu-header" onclick="toggleEdu(${index})">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas ${icon}" style="color:rgba(255,255,255,0.8)"></i>
                    ${item.title}
                </div>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="edu-body" id="edu-${index}">
                <span class="tag">${item.category}</span>
                <div class="edu-text">${item.content}</div>
            </div>
        `;
    container.appendChild(div);
  });
}

function toggleEdu(index) {
  const body = document.getElementById(`edu-${index}`);
  const isOpen = body.classList.contains("open");
  document
    .querySelectorAll(".edu-body")
    .forEach((el) => el.classList.remove("open"));
  if (!isOpen) body.classList.add("open");
}

/* =========================================
   ۹. تنظیمات (دارک مود و بکاپ)
   ========================================= */

// تغییر حالت شب
function toggleDarkMode() {
  const body = document.body;
  const checkbox = document.getElementById("dark-mode-toggle");
  if (checkbox.checked) {
    body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    const checkbox = document.getElementById("dark-mode-toggle");
    if (checkbox) checkbox.checked = true;
  }
}

// پشتیبان‌گیری
function backupData() {
  const gardenData = localStorage.getItem("myGarden");
  const themeData = localStorage.getItem("theme");

  if (!gardenData || gardenData === "[]") {
    alert("اطلاعاتی برای پشتیبان‌گیری وجود ندارد.");
    return;
  }

  const backupObject = {
    date: new Date().toISOString(),
    garden: JSON.parse(gardenData),
    theme: themeData || "light",
  };

  const dataStr = JSON.stringify(backupObject, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `plant-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// بازگردانی
function triggerRestore() {
  if (
    confirm(
      "هشدار: اطلاعات فعلی با فایل پشتیبان جایگزین خواهد شد. ادامه می‌دهید؟"
    )
  ) {
    document.getElementById("restore-input").click();
  }
}

function restoreData(inputElement) {
  const file = inputElement.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsedData = JSON.parse(e.target.result);
      if (!parsedData.garden) throw new Error("فایل نامعتبر است");

      localStorage.setItem("myGarden", JSON.stringify(parsedData.garden));
      if (parsedData.theme) localStorage.setItem("theme", parsedData.theme);

      alert("✅ بازگردانی موفقیت‌آمیز بود.");
      location.reload();
    } catch (error) {
      alert("❌ خطا در خواندن فایل: " + error.message);
    }
  };
  reader.readAsText(file);
  inputElement.value = "";
}

/* =========================================
   ۱۰. راه‌اندازی اولیه
   ========================================= */
window.onload = function () {
  loadTheme();
  loadPlantsData();
  loadEducationData();
};

// ثبت Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => console.log("SW registered"))
      .catch((err) => console.log("SW failed", err));
  });
}
