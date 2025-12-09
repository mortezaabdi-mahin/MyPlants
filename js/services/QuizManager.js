import { get, set } from "./Database.js";
import { fetchJson } from "../utils.js";

let quizData = [];
let currentQuiz = null;
let userAnswers = [];

// تنظیمات آزمون
const DEFAULT_QUESTIONS_PER_ROUND = 10;

// لود کردن دیتابیس
export async function loadQuizData() {
  try {
    console.log("📚 شروع بارگذاری آزمون...");
    const data = await fetchJson("./quiz.json");

    if (Array.isArray(data) && data.length > 0) {
      quizData = data;
      console.log(`✅ ${quizData.length} سؤال بارگذاری شد`);
    }
  } catch (e) {
    console.error("❌ خطا در بارگذاری آزمون:", e);
    quizData = [];
  }
}

// شروع آزمون
export async function startQuiz() {
  // ✅ دریافت سختی کاربر
  const profile = await get("userProfile");
  const difficultySettings = (await get("difficultySettings")) || {};

  const numberOfQuestions =
    difficultySettings.quizQuestions || DEFAULT_QUESTIONS_PER_ROUND;

  // انتخاب سؤالات تصادفی بر اساس سختی
  const selectedQuestions = selectRandomQuestions(quizData, numberOfQuestions);

  currentQuiz = {
    questions: selectedQuestions,
    currentIndex: 0,
    score: 0,
    difficulty: profile?.difficulty || "medium",
    startTime: Date.now(),
  };

  userAnswers = [];
  renderQuiz();
}

// نمایش صفحه اصلی آزمون
export function renderQuizTab() {
  const html = `
    <div class="center-box">
      <div class="quiz-icon"><i class="fas fa-clipboard-list"></i></div>
      <h2>📝 آزمون باغبانی</h2>
      <p>تست دانش خود درباره نگهداری گیاهان</p>

      <button class="btn-confirm big-btn" onclick="app.startQuiz()">
        <i class="fas fa-play"></i> شروع آزمون
      </button>

      <button class="btn-wiki" onclick="app.viewQuizStats()">
        <i class="fas fa-chart-bar"></i> آمار آزمون‌ها
      </button>
    </div>
  `;

  const container = document.getElementById("quiz-content");
  if (container) {
    container.innerHTML = html;
  }
}

// ثبت پاسخ کاربر
export async function submitAnswer(optionIndex) {
  if (!currentQuiz) return;

  const currentQuestion = currentQuiz.questions[currentQuiz.currentIndex];
  const isCorrect = optionIndex === currentQuestion.correct;

  // ✅ ثبت پاسخ
  userAnswers.push({
    questionId: currentQuestion.id,
    userAnswer: optionIndex,
    correct: isCorrect,
    question: currentQuestion.question,
  });

  if (isCorrect) {
    currentQuiz.score += 10;
  }

  // نمایش بازخورد
  const options = document.querySelectorAll(".quiz-option");
  options[optionIndex].classList.add(isCorrect ? "correct" : "wrong");
  options[currentQuestion.correct].classList.add("correct");

  // ادامه پس از ۲ ثانیه
  setTimeout(nextQuestion, 2000);
}

function nextQuestion() {
  if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
    currentQuiz.currentIndex++;
    renderQuiz();
  } else {
    // ✅ پایان آزمون
    endQuiz();
  }
}

async function endQuiz() {
  const endTime = Date.now();
  const duration = (endTime - currentQuiz.startTime) / 1000 / 60; // دقیقه

  // ✅ محاسبه درصد
  const percentage = Math.round(
    (currentQuiz.score / (currentQuiz.questions.length * 10)) * 100
  );

  // ✅ ذخیره نتیجه - اصلاح شده
  let profile = await get("userProfile");

  // اگر پروفایل وجود نداشته باشد، پروفایل پیش‌فرض ایجاد کنید
  if (!profile) {
    profile = {
      username: "کاربر",
      difficulty: "medium",
      createdAt: new Date().toISOString(),
      questionsAsked: 0,
      quizScore: 0,
      plantsAdded: 0,
      bestStreak: 0,
    };
  }

  // به‌روز کردن آمار پروفایل
  profile.questionsAsked =
    (profile.questionsAsked || 0) + currentQuiz.questions.length;
  profile.quizScore = (profile.quizScore || 0) + currentQuiz.score;

  // ذخیره پروفایل به‌روز شده
  await set("userProfile", profile);

  // ذخیره تاریخ آزمون‌ها
  const quizScores = (await get("quizScores")) || [];
  quizScores.push({
    date: new Date().toISOString(),
    score: currentQuiz.score,
    percentage,
    duration,
    difficulty: currentQuiz.difficulty,
    questions: currentQuiz.questions.length,
  });
  await set("quizScores", quizScores);

  // نمایش نتایج
  displayResults(percentage, currentQuiz.score, currentQuiz.questions.length);
}

function displayResults(percentage, score, total) {
  const resultHtml = `
    <div class="quiz-results">
      <div class="result-circle" style="border-color: ${
        percentage >= 70 ? "#34c759" : percentage >= 50 ? "#ffcc00" : "#ff3b30"
      }">
        ${percentage}%
      </div>
      
      <h3 style="text-align: center; color: ${
        percentage >= 70 ? "#34c759" : percentage >= 50 ? "#ffcc00" : "#ff3b30"
      }">
        ${
          percentage >= 70
            ? "🎉 عالی!"
            : percentage >= 50
            ? "😊 خوب!"
            : "📚 دوباره تلاش کن"
        }
      </h3>
      
      <div class="result-details">
        <p><strong>نمره:</strong> ${score} از ${total * 10}</p>
        <p><strong>تعداد سؤالات:</strong> ${total}</p>
        <p><strong>سختی:</strong> ${
          currentQuiz.difficulty === "easy"
            ? "آسان"
            : currentQuiz.difficulty === "medium"
            ? "متوسط"
            : "سخت"
        }</p>
      </div>

      <div class="result-analysis">
        <h4>تحلیل عملکرد:</h4>
        <ul>
          ${userAnswers
            .map(
              (ans, idx) => `
            <li style="color: ${ans.correct ? "#34c759" : "#ff3b30"}">
              ${idx + 1}. ${ans.correct ? "✅" : "❌"} ${ans.question.substring(
                0,
                50
              )}...
            </li>
          `
            )
            .join("")}
        </ul>
      </div>

      <button class="btn-confirm big-btn" onclick="app.startQuiz()" style="width: 100%; margin-top: 15px;">
        <i class="fas fa-redo"></i> آزمون دوباره
      </button>
      <button class="btn-cancel" onclick="app.switchTab('quiz')" style="width: 100%; margin-top: 10px;">
        بازگشت
      </button>
    </div>
  `;

  const container = document.getElementById("quiz-content");
  if (container) {
    container.innerHTML = resultHtml;
  }
}

function selectRandomQuestions(questions, count) {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, questions.length));
}

function renderQuiz() {
  if (
    !currentQuiz ||
    currentQuiz.currentIndex >= currentQuiz.questions.length
  ) {
    return;
  }

  const question = currentQuiz.questions[currentQuiz.currentIndex];
  const progress =
    ((currentQuiz.currentIndex + 1) / currentQuiz.questions.length) * 100;

  const quizHtml = `
    <div class="quiz-header">
      <span>${currentQuiz.currentIndex + 1} / ${
    currentQuiz.questions.length
  }</span>
      <span>امتیاز: ${currentQuiz.score}</span>
    </div>

    <div class="progress-bar">
      <div class="fill" style="width: ${progress}%"></div>
    </div>

    <div class="question-text">${question.question}</div>

    <div class="options-grid">
      ${question.options
        .map(
          (opt, idx) =>
            `<button class="quiz-option" onclick="app.submitAnswer(${idx})">${opt}</button>`
        )
        .join("")}
    </div>
  `;

  const container = document.getElementById("quiz-content");
  if (container) {
    container.innerHTML = quizHtml;
  }
}

export async function viewQuizStats() {
  const quizScores = (await get("quizScores")) || [];
  const profile = (await get("userProfile")) || {};

  if (quizScores.length === 0) {
    alert("هنوز آزمونی انجام نداده‌اید!");
    return;
  }

  const avgScore = (
    quizScores.reduce((sum, q) => sum + q.percentage, 0) / quizScores.length
  ).toFixed(1);
  const bestScore = Math.max(...quizScores.map((q) => q.percentage));

  const statsHtml = `
    <div class="quiz-stats">
      <h3>📊 آمار آزمون‌های شما</h3>
      
      <div class="stats-grid">
        <div class="stat-box">
          <strong>تعداد آزمون:</strong>
          <span>${quizScores.length}</span>
        </div>
        <div class="stat-box">
          <strong>میانگین:</strong>
          <span>${avgScore}%</span>
        </div>
        <div class="stat-box">
          <strong>بهترین نمره:</strong>
          <span>${bestScore}%</span>
        </div>
        <div class="stat-box">
          <strong>کل سؤالات:</strong>
          <span>${profile.questionsAsked || 0}</span>
        </div>
      </div>

      <h4>آخرین آزمون‌ها:</h4>
      <div class="recent-quizzes">
        ${quizScores
          .slice(-5)
          .reverse()
          .map(
            (q) => `
          <div class="quiz-item">
            <span>${new Date(q.date).toLocaleDateString("fa-IR")}</span>
            <span style="color: ${
              q.percentage >= 70 ? "#34c759" : "#ffcc00"
            }">${q.percentage}%</span>
            <span>${q.questions} سؤال</span>
          </div>
        `
          )
          .join("")}
      </div>

      <button class="btn-cancel" onclick="app.switchTab('quiz')" style="width: 100%; margin-top: 15px;">
        بازگشت
      </button>
    </div>
  `;

  const container = document.getElementById("quiz-content");
  if (container) {
    container.innerHTML = statsHtml;
  }
}
