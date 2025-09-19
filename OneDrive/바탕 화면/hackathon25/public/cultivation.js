document.addEventListener('DOMContentLoaded', () => {
    const userScoreEl = document.getElementById('user-score');
    const plantSlotsEl = document.getElementById('plant-slots');


    // 페이지 로드 시 점수만 불러오는 기능
    async function loadScore() {
        const response = await fetch('/api/user-data');
        const data = await response.json();
        userScoreEl.textContent = data.score;
    }

    loadScore();
});