// js/main.js
import * as Encyclo from "./services/Encyclopedia.js";
import * as Garden from "./services/GardenManager.js";
import * as Wiki from "./services/WikiService.js";
import * as Settings from "./services/SettingsManager.js";
import * as Quiz from "./services/QuizManager.js";
import { fetchJson } from "./utils.js";
import { EduItem } from "./components/EduItem.js";
import DEBUG from "./debug.js";

let eduData = [];

async function loadEdu() {
  try {
    console.log("📚 شروع بارگذاری آموزش...");
    const data = await fetchJson("./education.json");

    if (data && Array.isArray(data) && data.length > 0) {
      eduData = data;
      console.log(`✅ ${eduData.length} مقاله بارگذاری شد`);
      if (document.getElementById("tab-edu")?.style.display === "block") {
        renderEdu();
      }
    } else {
      console.warn("⚠️ آموزش خالی یا نامعتبر");
      eduData = [];
    }
  } catch (e) {
    console.error("❌ خطا در بارگذاری آموزش:", e);
    eduData = [];
  }
}

function renderEdu() {
  const container = document.getElementById("edu-content");
  if (!container) {
    console.warn("⚠️ کانتینر آموزش یافت نشد");
    return;
  }

  if (!eduData || eduData.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-book-open"></i><p>آموزشی موجود نیست</p></div>';
    return;
  }

  console.log(`🎓 نمایش ${eduData.length} مقاله`);
  container.innerHTML = eduData
    .map((item, index) => EduItem(item, index))
    .join("");
}

function toggleEdu(index) {
  const body = document.getElementById(`edu-${index}`);
  if (!body) return;
  const isOpen = body.classList.contains("open");
  document
    .querySelectorAll(".edu-body")
    .forEach((el) => el.classList.remove("open"));
  if (!isOpen) body.classList.add("open");
}

function switchTab(tabName) {
  document
    .querySelectorAll(".tab-section")
    .forEach((el) => (el.style.display = "none"));
  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.style.display = "block";

  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));
  const tabs = ["home", "garden", "quiz", "edu", "settings"];
  const index = tabs.indexOf(tabName);
  if (index > -1) {
    document.querySelectorAll(".nav-item")[index].classList.add("active");
  }

  if (tabName === "garden") Garden.render();
  if (tabName === "edu") renderEdu();
  if (tabName === "quiz") Quiz.renderQuizTab();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}

// اتصال توابع به شیء global
window.app = {
  filterPlants: Encyclo.filter,
  displayPlantInfo: Encyclo.displayPlantInfo,
  clearSearch: Encyclo.clearSearch,
  openAddModal: Garden.openAddModal,
  confirmAddToGarden: Garden.confirmAdd,
  waterPlant: Garden.water,
  deletePlant: Garden.deleteP,
  openDiary: Garden.openDiary,
  saveLog: Garden.saveLog,
  deleteLog: Garden.deleteLog,
  fetchWiki: Wiki.fetchWiki,
  toggleDarkMode: Settings.toggleDarkMode,
  backupData: Settings.backup,
  triggerRestore:
    Settings.triggerRestore ||
    (() => document.getElementById("restore-input").click()),
  restoreData: Settings.restore,
  startQuiz: Quiz.startQuiz,
  submitAnswer: Quiz.submitAnswer,
  switchTab: switchTab,
  closeModal: closeModal,
  toggleEdu: toggleEdu,
};

window.onload = async () => {
  try {
    console.log("🚀 شروع بارگذاری برنامه...");

    await Settings.initTheme();
    console.log("✅ تم بارگذاری شد");

    await Promise.all([
      Encyclo.loadData(),
      loadEdu(),
      Quiz.loadQuizData(),
    ]);

    console.log("✅ تمام داده‌ها بارگذاری شدند");

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch((err) => {
        console.warn("⚠️ اطلاع‌رسانی غیرفعال:", err);
      });
    }

    console.log("%c✅ برنامه با موفقیت شروع شد!", "color: #4CAF50; font-weight: bold;");
  } catch (e) {
    console.error("❌ خطای بحرانی:", e);
  }
};

// سرویس ورکر
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.log("SW Failed", err));
  });
}
