// 1. 모듈 및 기본 설정
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. 단어 데이터 로딩 (Promise 기반으로 수정)
const easyWords = [];
const mediumWords = [];
const hardWords = [];

const loadWords = (filePath) => {
    return new Promise((resolve, reject) => {
        const words = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                console.log(row); // 디버깅 코드
                words.push(row);
            })
            .on('end', () => {
                console.log(`${filePath} 파일 로딩 완료.`);
                resolve(words);
            })
            .on('error', (error) => reject(error));
    });
};

// 3. (임시) 사용자 데이터베이스
const users = {
    'testuser': { password: 'password123', name: '테스트유저' },
};

// 4. 라우팅(Routing) - 기능별 주소 처리
// (이전과 동일한 로그인, 회원가입, 퀴즈, 정답 확인 코드가 여기에 위치합니다)

// 회원가입 기능
app.post('/signup', (req, res) => {
    const { userid, password, password_confirm, username } = req.body;
    if (password !== password_confirm) {
        return res.send('<h1>회원가입 실패</h1><p>비밀번호가 일치하지 않습니다.</p><a href="/signup.html">다시 시도</a>');
    }
    if (users[userid]) {
        return res.send('<h1>회원가입 실패</h1><p>이미 존재하는 아이디입니다.</p><a href="/signup.html">다시 시도</a>');
    }
    users[userid] = { password: password, name: username };
    console.log('새로운 사용자 등록 완료!', users);
    res.redirect('/');
});

// 로그인 기능
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (users[email] && users[email].password === password) {
        res.redirect('/home.html');
    } else {
        res.send('<h1>로그인 실패</h1><p>아이디 또는 비밀번호가 올바르지 않습니다.</p><a href="/">다시 시도</a>');
    }
});

// 퀴즈 데이터 제공 기능
app.get('/quiz', (req, res) => {
    const { difficulty } = req.query;
    let selectedWords;
    if (difficulty === 'easy') selectedWords = [...easyWords];
    else if (difficulty === 'medium') selectedWords = [...mediumWords];
    else selectedWords = [...hardWords];
    if (!selectedWords || selectedWords.length === 0) {
        return res.status(500).json({ error: '단어 목록을 불러올 수 없습니다.' });
    }
    selectedWords.sort(() => Math.random() - 0.5);
    res.json(selectedWords);
});

// 정답 확인 기능
app.post('/check-answer', (req, res) => {
    const { word, userAnswer } = req.body;
    const allWords = [...easyWords, ...mediumWords, ...hardWords];
    const questionWord = allWords.find(w => w.word === word);
    if (questionWord) {
        if (questionWord.meaning === userAnswer) {
            res.json({ correct: true });
        } else {
            res.json({ correct: false, correctAnswer: questionWord.meaning });
        }
    } else {
        res.status(404).json({ error: '단어를 찾을 수 없습니다.' });
    }
});


// 5. 모든 파일 로딩이 끝난 후에 서버를 시작
Promise.all([
    loadWords('words_easy.csv'),
    loadWords('words_medium.csv'),
    loadWords('words_hard.csv')
]).then(([easy, medium, hard]) => {
    // 각 배열에 로드된 데이터를 저장
    easyWords.push(...easy);
    mediumWords.push(...medium);
    hardWords.push(...hard);

    // 서버 실행 (Promise.all 내부로 이동)
    app.listen(port, () => {
        console.log(`모든 단어 파일 로딩 완료!`);
        console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
    });

}).catch(error => {
    console.error('파일 로딩 중 에러 발생:', error);
});