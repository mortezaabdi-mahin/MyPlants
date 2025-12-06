export const QuizComponent = {
    // صفحه شروع آزمون
    startScreen: (highScore) => `
        <div class="quiz-container center-box">
            <div class="quiz-icon"><i class="fas fa-clipboard-list"></i></div>
            <h2>آزمون باغبانی</h2>
            <p>دانش خود را محک بزنید! در هر آزمون ۲۰ سوال تصادفی پرسیده می‌شود.</p>
            
            <div class="stat-box">
                <span>🏆 بهترین رکورد شما:</span>
                <strong>${highScore} / 100</strong>
            </div>

            <button class="btn-confirm big-btn" onclick="app.startQuiz()">
                <i class="fas fa-play"></i> شروع آزمون
            </button>
        </div>
    `,

    // صفحه سوال
    questionScreen: (currentQ, index, total) => {
        const progress = ((index + 1) / total) * 100;
        
        let optionsHtml = '';
        currentQ.options.forEach((opt, idx) => {
            optionsHtml += `
                <button class="quiz-option" onclick="app.submitAnswer(${idx})">
                    ${opt}
                </button>
            `;
        });

        return `
            <div class="quiz-container">
                <div class="quiz-header">
                    <span>سوال ${index + 1} از ${total}</span>
                    <span><i class="fas fa-leaf"></i></span>
                </div>
                <div class="progress-bar"><div class="fill" style="width:${progress}%"></div></div>
                
                <div class="question-text">${currentQ.question}</div>
                
                <div class="options-grid">
                    ${optionsHtml}
                </div>
            </div>
        `;
    },

    // صفحه نتیجه
    resultScreen: (score, correctCount, total, isNewRecord) => {
        let message = "";
        let color = "";
        
        if(score >= 90) { message = "فوق‌العاده! شما استاد هستید 🌸"; color="var(--primary-green)"; }
        else if(score >= 70) { message = "آفرین! اطلاعات خوبی دارید 🌱"; color="#f57c00"; }
        else { message = "نیاز به مطالعه بیشتر دارید 🥀"; color="#d32f2f"; }

        return `
            <div class="quiz-container center-box">
                <div class="result-circle" style="border-color:${color}; color:${color}">
                    ${score}
                </div>
                <h3>${message}</h3>
                <p>تعداد پاسخ صحیح: ${correctCount} از ${total}</p>
                
                ${isNewRecord ? '<div class="new-record">🎉 رکورد جدید! 🎉</div>' : ''}

                <div class="quiz-actions">
                    <button class="btn-cancel" onclick="app.switchTab('home')">خروج</button>
                    <button class="btn-confirm" onclick="app.startQuiz()">آزمون مجدد</button>
                </div>
            </div>
        `;
    }
};