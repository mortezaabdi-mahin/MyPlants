import { fetchJson } from "../utils.js";
import { PlantCard } from "../components/PlantCard.js";

let plantData = [];
let filteredPlants = [];
let currentPlant = null;

export async function loadData() {
  try {
    console.log("📚 شروع بارگذاری گیاهان...");
    const data = await fetchJson("./plants.json");

    if (data && typeof data === "object") {
      plantData = Object.entries(data).map(([name, info]) => ({
        name,
        ...info,
      }));
      console.log(`✅ ${plantData.length} گیاه بارگذاری شد`);

      // ✅ پرکردن فیلترها
      populateFilters();

      // ✅ نمایش اولیه تمام گیاهان
      filteredPlants = plantData;
      displayPlants(plantData);
      populatePlantSelector();
    }
  } catch (e) {
    console.error("❌ خطا:", e);
  }
}

// ✅ پرکردن فیلترهای دسته‌بندی و نور
function populateFilters() {
  const groups = new Set();
  const lights = new Set();

  plantData.forEach((plant) => {
    if (plant.گروه) groups.add(plant.گروه);
    if (plant.نور) lights.add(plant.نور);
  });

  const groupSelect = document.getElementById("group-filter");
  const lightSelect = document.getElementById("light-filter");

  if (groupSelect) {
    groupSelect.innerHTML = '<option value="">تمام دسته‌بندی‌ها</option>';
    groups.forEach((group) => {
      groupSelect.innerHTML += `<option value="${group}">${group}</option>`;
    });
  }

  if (lightSelect) {
    lightSelect.innerHTML = '<option value="">تمام نورها</option>';
    lights.forEach((light) => {
      lightSelect.innerHTML += `<option value="${light}">${light}</option>`;
    });
  }
}

// ✅ جستجو و فیلتر بهبود شده
export function filter() {
  const searchTerm = (
    document.getElementById("search-input")?.value || ""
  ).toLowerCase();
  const groupFilter = document.getElementById("group-filter")?.value || "";
  const lightFilter = document.getElementById("light-filter")?.value || "";

  filteredPlants = plantData.filter((plant) => {
    const matchName =
      plant.name.toLowerCase().includes(searchTerm) ||
      (plant.نام_علمی && plant.نام_علمی.includes(searchTerm));

    const matchGroup = !groupFilter || plant.گروه === groupFilter;
    const matchLight = !lightFilter || plant.نور === lightFilter;

    return matchName && matchGroup && matchLight;
  });

  // ✅ پرکردن selector
  populatePlantSelector();

  // نمایش نتیجه - لیست گیاهان فیلتر شده
  if (filteredPlants.length > 0) {
    displayPlants(filteredPlants);
  } else {
    document.getElementById("results").innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>گیاهی یافت نشد. دوباره تلاش کنید.</p>
      </div>
    `;
  }

  console.log(`🔍 ${filteredPlants.length} گیاه پیدا شد`);
}

// ✅ پرکردن selector جدید
function populatePlantSelector() {
  const selector = document.getElementById("plant-selector");
  if (!selector) return;

  selector.innerHTML = '<option value="">انتخاب گیاه...</option>';

  filteredPlants.forEach((plant) => {
    selector.innerHTML += `<option value="${plant.name}">${plant.name}</option>`;
  });
}

// ✅ نمایش اطلاعات گیاه از selector - و نمایش لیست
export function displayPlantInfo() {
  const selector = document.getElementById("plant-selector");
  const plantName = selector?.value;

  if (plantName) {
    const plant = plantData.find((p) => p.name === plantName);
    if (plant) {
      currentPlant = plant;
      const resultsDiv = document.getElementById("results");
      if (resultsDiv) {
        resultsDiv.innerHTML = PlantCard(plant.name, plant);
        resultsDiv.scrollIntoView({ behavior: "smooth" });
      }
    }
  } else {
    // اگر انتخابی نشود، دوباره لیست نمایش بده
    displayPlants(filteredPlants);
  }
}

// نمایش لیست گیاهان
function displayPlants(plants) {
  const resultsDiv = document.getElementById("results");

  if (!resultsDiv) return;

  if (plants.length === 0) {
    resultsDiv.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>گیاهی یافت نشد</p>
      </div>
    `;
    return;
  }

  // ✅ نمایش grid نتایج
  const html = `
    <div class="encyclopedia-grid">
      ${plants
        .map(
          (plant) => `
        <div class="plant-preview-card" onclick="app.showPlantDetail('${
          plant.name
        }')">
          ${
            plant.image
              ? `<img src="${plant.image}" alt="${plant.name}" class="plant-preview-image">`
              : '<div class="plant-preview-placeholder"><i class="fas fa-leaf"></i></div>'
          }
          <div class="plant-preview-info">
            <h3>${plant.name}</h3>
            <p class="badge">${plant.گروه || "عمومی"}</p>
            <p class="quick-info">
              💧 ${plant.آبیاری?.substring(0, 20) || "اطلاعات ندارد"}...
            </p>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  resultsDiv.innerHTML = html;
}

// ✅ نمایش جزئیات کامل
export async function showPlantDetail(plantName) {
  const plant = plantData.find((p) => p.name === plantName);
  if (plant) {
    currentPlant = plant;
    const resultsDiv = document.getElementById("results");
    if (resultsDiv) {
      resultsDiv.innerHTML = PlantCard(plant.name, plant);
      resultsDiv.scrollIntoView({ behavior: "smooth" });
    }
  }
}

// ✅ حذف جستجو
export function clearSearch() {
  document.getElementById("search-input").value = "";
  document.getElementById("group-filter").value = "";
  document.getElementById("light-filter").value = "";
  document.getElementById("plant-selector").value = "";

  filteredPlants = plantData;
  populatePlantSelector();
  displayPlants(plantData);

  console.log("🔄 جستجو پاک شد");
}
