document.addEventListener('DOMContentLoaded', () => {
    const difficultySelector = document.querySelector('.difficulty-selector');
    const quizContainer = document.getElementById('quiz-container');
    const mainContent = document.getElementById('quiz-main');

    let quizWords = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let currentDifficulty = ''; // 현재 난이도 저장 변수

    difficultySelector.addEventListener('click', async (event) => {
        if (event.target.classList.contains('difficulty-btn')) {
            const difficulty = event.target.dataset.difficulty;
            currentDifficulty = difficulty; // 난이도 저장
            await fetchQuizData(difficulty);
            difficultySelector.classList.add('hidden');
            displayQuiz();
        }
    });

    async function fetchQuizData(difficulty) {
        const response = await fetch(`/quiz?difficulty=${difficulty}`);
        quizWords = await response.json();
        currentQuestionIndex = 0;
        score = 0;
    }

    function displayQuiz() {
        if (currentQuestionIndex >= quizWords.length) {
            displayCompletionScreen();
            return;
        }

        const currentWord = quizWords[currentQuestionIndex];
        const allMeanings = quizWords.map(w => w.meaning);
        const correctAnswer = currentWord.meaning;
        const wrongAnswersPool = allMeanings.filter(m => m !== correctAnswer);
        wrongAnswersPool.sort(() => Math.random() - 0.5);
        const options = [correctAnswer, ...wrongAnswersPool.slice(0, 3)];
        options.sort(() => Math.random() - 0.5);
        
        // 난이도 표시 추가
        const difficultyText = { easy: '쉬움', medium: '보통', hard: '어려움' }[currentDifficulty];

        quizContainer.innerHTML = `
            <div class="quiz-header">
                <div class="quiz-difficulty">난이도: ${difficultyText}</div>
                <div class="quiz-progress">${currentQuestionIndex + 1} / ${quizWords.length}</div>
            </div>
            <h2 class="quiz-word">'${currentWord.word}'의 뜻은?</h2>
            <div class="quiz-options">
                ${options.map(option => `<button class="option-btn">${option}</button>`).join('')}
            </div>
            <button id="submit-btn" class="hidden">제출하기</button>
            <div id="feedback"></div>
        `;
        quizContainer.classList.remove('hidden');

        let selectedAnswer = null;
        const optionButtons = document.querySelectorAll('.option-btn');
        const submitBtn = document.getElementById('submit-btn');

        optionButtons.forEach(button => {
            button.addEventListener('click', () => {
                optionButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                selectedAnswer = button.textContent;
                submitBtn.classList.remove('hidden');
            });
        });

        submitBtn.addEventListener('click', async () => {
            if (!selectedAnswer) return;

            const response = await fetch('/check-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: currentWord.word, userAnswer: selectedAnswer })
            });
            const result = await response.json();

            const feedbackEl = document.getElementById('feedback');
            if (result.correct) {
                score++;
                feedbackEl.textContent = '정답입니다!';
                feedbackEl.className = 'feedback correct';
            } else {
                feedbackEl.textContent = `오답입니다. (정답: ${result.correctAnswer})`;
                feedbackEl.className = 'feedback incorrect';
            }
            
            // 버튼 비활성화
            document.querySelectorAll('.option-btn, #submit-btn').forEach(btn => btn.disabled = true);

            setTimeout(() => {
                currentQuestionIndex++;
                displayQuiz();
            }, 1500);
        });
    }

    function displayCompletionScreen() {
        mainContent.innerHTML = `
            <div class="completion-container">
                <h2>오늘의 퀴즈 완료!</h2>
                <div class="final-score">${score} / ${quizWords.length}</div>
                <div class="completion-buttons">
                    <a href="/home.html" class="completion-btn">홈으로</a>
                    <button id="retry-btn" class="completion-btn">다시 풀기</button>
                </div>
            </div>
        `;
        document.getElementById('retry-btn').addEventListener('click', () => {
            window.location.reload();
        });
    }
});