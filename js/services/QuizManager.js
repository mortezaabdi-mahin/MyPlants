import { fetchJson } from '../utils.js';
import { QuizComponent } from '../components/QuizComponent.js';

let allQuestions = [];
let currentSession = {
    questions: [],
    currentIndex: 0,
    score: 0,
    active: false
};

// تنظیمات آزمون
const QUESTIONS_PER_ROUND = 20;

// لود کردن دیتابیس
export async function loadQuizData() {
    allQuestions = await fetchJson('quiz.json') || [];
}

// شروع آزمون
export function startQuiz() {
    if (allQuestions.length === 0) {
        alert("دیتابیس سوالات لود نشده است.");
        return;
    }

    // انتخاب ۲۰ سوال رندوم
    // الگوریتم: آرایه را بُر می‌زنیم (Shuffle) و ۲۰ تای اول را برمی‌داریم
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, QUESTIONS_PER_ROUND);

    currentSession = {
        questions: selected,
        currentIndex: 0,
        score: 0,
        active: true
    };

    renderQuestion();
}

// نمایش صفحه اصلی آزمون
export function renderQuizTab() {
    const container = document.getElementById('quiz-content');
    const highScore = localStorage.getItem('quizHighScore') || 0;
    
    // اگر آزمون در جریان است، سوال را نشان بده، وگرنه صفحه شروع
    if (currentSession.active) {
        renderQuestion();
    } else {
        container.innerHTML = QuizComponent.startScreen(highScore);
    }
}

// رندر کردن سوال جاری
function renderQuestion() {
    const container = document.getElementById('quiz-content');
    const q = currentSession.questions[currentSession.currentIndex];
    
    container.innerHTML = QuizComponent.questionScreen(
        q, 
        currentSession.currentIndex, 
        QUESTIONS_PER_ROUND
    );
}

// ثبت پاسخ کاربر
export function submitAnswer(selectedIndex) {
    const q = currentSession.questions[currentSession.currentIndex];
    const options = document.querySelectorAll('.quiz-option');
    
    // قفل کردن دکمه‌ها
    options.forEach(btn => btn.disabled = true);

    const isCorrect = selectedIndex === q.correct;
    
    // استایل دهی (سبز یا قرمز)
    if (isCorrect) {
        options[selectedIndex].classList.add('correct');
        currentSession.score++;
    } else {
        options[selectedIndex].classList.add('wrong');
        options[q.correct].classList.add('correct'); // نشان دادن جواب درست
    }

    // رفتن به سوال بعد با تاخیر کوتاه
    setTimeout(() => {
        currentSession.currentIndex++;
        
        if (currentSession.currentIndex < QUESTIONS_PER_ROUND) {
            renderQuestion();
        } else {
            finishQuiz();
        }
    }, 1500); // 1.5 ثانیه مکث
}

// پایان آزمون
function finishQuiz() {
    currentSession.active = false;
    const container = document.getElementById('quiz-content');
    
    // محاسبه نمره از ۱۰۰
    const finalScore = Math.round((currentSession.score / QUESTIONS_PER_ROUND) * 100);
    
    // بررسی رکورد
    const oldHigh = parseInt(localStorage.getItem('quizHighScore') || 0);
    let isNewRecord = false;
    
    if (finalScore > oldHigh) {
        localStorage.setItem('quizHighScore', finalScore);
        isNewRecord = true;
    }

    container.innerHTML = QuizComponent.resultScreen(
        finalScore, 
        currentSession.score, 
        QUESTIONS_PER_ROUND, 
        isNewRecord
    );
}