// script.js
const translations = {
    gu: {
        title: "ક્વિઝ રમો અને રોકડ જીતો! 🤑",
        subtitle: "દરરોજ સાચા જવાબો આપો અને ₹500 સુધીના ઇનામો જીતો!",
        startBtn: "ક્વિઝ શરૂ કરો અને જીતો 💸",
        nextBtn: "આગળ",
        recentWinners: "🔥 રોહન: ₹250 જીત્યા | પૂજા: ₹150 જીત્યા | રાજ: ₹500 જીત્યા | અમીત: ₹300 જીત્યા",
        questionOf: "પ્રશ્ન",
        of: "માંથી",
        checking: "જવાબો ચેક થઈ રહ્યા છે...",
        loading: "તમારું ઇનામ તૈયાર થઈ રહ્યું છે...",
        resultTitle: "તમારું ઇનામ તૈયાર છે! 🎉",
        scoreLabel: "તમારો સ્કોર:",
        earningsLabel: "તમે જીત્યા:",
        restartBtn: "વધુ પૈસા જીતવા ફરી રમો",
        shareBtn: "WhatsApp પર Share કરી ₹ Claim કરો",
        evalGenius: "તમે Genius છો 😍",
        evalAverage: "તમે Average છો 🙂",
        evalTry: "વધુ પ્રેક્ટિસ કરો 😅",
        shareMsg1: "હું 🤑 ક્વિઝ રમીને ₹",
        shareMsg2: " જીત્યો છું! 😱 તમે પણ અહી રમો અને રોકડ જીતો: ",
        earningsText: "💰 બેલેન્સ:",
        currency: "₹"
    },
    en: {
        title: "Play Quiz & Win Cash! 🤑",
        subtitle: "Give correct answers daily and win up to ₹500!",
        startBtn: "Start Quiz & Earn 💸",
        nextBtn: "Next",
        recentWinners: "🔥 Rohan: Won ₹250 | Pooja: Won ₹150 | Raj: Won ₹500 | Amit: Won ₹300",
        questionOf: "Question",
        of: "of",
        checking: "Checking answers...",
        loading: "Preparing your reward...",
        resultTitle: "Your Reward is Ready! 🎉",
        scoreLabel: "Your Score:",
        earningsLabel: "You Won:",
        restartBtn: "Play Again to Win More",
        shareBtn: "Share on WhatsApp to Claim ₹",
        evalGenius: "You are a Genius 😍",
        evalAverage: "You are Average 🙂",
        evalTry: "Keep Trying 😅",
        shareMsg1: "I just won ₹",
        shareMsg2: " by playing this Quiz! 😱 Play now and win cash: ",
        earningsText: "💰 Wallet:",
        currency: "₹"
    }
};

const quizDataMulti = {
    gu: [
      { question: "સૌથી મોટો ગ્રહ કયો છે?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Jupiter" },
      { question: "ભારતની રાજધાની શું છે?", options: ["Mumbai", "Delhi", "Surat", "Ahmedabad"], answer: "Delhi" },
      { question: "2 + 2 * 2 = ?", options: ["6", "8", "4", "2"], answer: "6" },
      { question: "સૂર્ય કઈ દિશામાં ઉગે છે?", options: ["North", "South", "East", "West"], answer: "East" },
      { question: "પાણીનું રાસાયણિક સૂત્ર શું છે?", options: ["H2O", "CO2", "O2", "H2"], answer: "H2O" }
    ],
    en: [
      { question: "Which is the largest planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Jupiter" },
      { question: "What is the capital of India?", options: ["Mumbai", "Delhi", "Surat", "Ahmedabad"], answer: "Delhi" },
      { question: "2 + 2 * 2 = ?", options: ["6", "8", "4", "2"], answer: "6" },
      { question: "In which direction does the Sun rise?", options: ["North", "South", "East", "West"], answer: "East" },
      { question: "What is the chemical formula of water?", options: ["H2O", "CO2", "O2", "H2"], answer: "H2O" }
    ]
};

// Global State
let lang = localStorage.getItem('appLang') || 'gu';
let quizData = quizDataMulti[lang];
let currentQuestionIndex = 0;
let score = 0;
let moneyEarned = 0;
let timerInterval;
const TIME_LIMIT = 15; 
let timeLeft = TIME_LIMIT;

// DOM Elements
const qContainer = document.getElementById('question-container');
const qText = document.getElementById('question-text');
const optContainer = document.getElementById('options-container');
const nxtBtn = document.getElementById('next-btn');
const progText = document.getElementById('progress-text');
const pBar = document.getElementById('progress-bar');
const tElement = document.getElementById('timer');
const walletBalance = document.getElementById('wallet-balance');
const adSlot = document.getElementById('ad-slot');
const lScreen = document.getElementById('loading-screen');
const lMsg = document.getElementById('loading-message');
const qContent = document.getElementById('quiz-content');

// --- Initialization & I18N --- //
document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();
    const langSelect = document.getElementById('lang-select');
    if(langSelect) {
        langSelect.value = lang;
    }
});

function changeLanguage(selectedLang) {
    lang = selectedLang;
    localStorage.setItem('appLang', lang);
    applyTranslations();
    quizData = quizDataMulti[lang];
    if(document.getElementById('quiz-content')) {
        currentQuestionIndex = 0;
        score = 0;
        moneyEarned = 0;
        updateWalletDisplay();
        loadQuestion();
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

function updateWalletDisplay() {
    if(walletBalance) {
        walletBalance.innerText = translations[lang].currency + moneyEarned;
        // Small pop animation
        walletBalance.style.transform = "scale(1.3)";
        setTimeout(() => walletBalance.style.transform = "scale(1)", 200);
    }
}

// --- Quiz Logic --- //
if (window.location.pathname.endsWith('quiz.html') || qContent) {
    loadQuestion();
    updateWalletDisplay();
    
    nxtBtn.addEventListener('click', () => {
        const selOpt = document.querySelector('.option-btn.selected');
        if (!selOpt) {
            alert(lang === 'gu' ? "કૃપા કરીને એક જવાબ પસંદ કરો!" : "Please select an answer!");
            return;
        }

        if (selOpt.getAttribute('data-value') === quizData[currentQuestionIndex].answer) {
            score++;
            moneyEarned += 50; // Earn ₹50 per correct answer
            updateWalletDisplay();
        }

        clearInterval(timerInterval);
        currentQuestionIndex++;

        // Ads Placement After 2nd and 4th Questions
        if (currentQuestionIndex === 2 || currentQuestionIndex === 4) {
            adSlot.style.display = 'flex';
        } else {
            adSlot.style.display = 'none';
        }

        if (currentQuestionIndex < quizData.length) {
            loadQuestion();
        } else {
            finishQuiz();
        }
    });
}

function loadQuestion() {
    timeLeft = TIME_LIMIT;
    updateTimerDisplay();
    clearInterval(timerInterval);
    
    const tCont = document.getElementById('timer-container');
    if(tCont) tCont.classList.remove('warning');

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 5 && tCont) tCont.classList.add('warning');
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);

    const q = quizData[currentQuestionIndex];
    qText.innerText = q.question;
    optContainer.innerHTML = '';

    q.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn d-block text-start mb-3';
        btn.innerText = opt;
        btn.setAttribute('data-value', opt);
        btn.onclick = () => selectOption(btn);
        optContainer.appendChild(btn);
    });

    const t = translations[lang];
    if(progText) {
        progText.innerText = `${t.questionOf} ${currentQuestionIndex + 1} ${t.of} ${quizData.length}`;
    }
    if(pBar) {
        pBar.style.width = `${((currentQuestionIndex + 1) / quizData.length) * 100}%`;
    }
    
    nxtBtn.disabled = true;
    
    qContainer.classList.remove('fade-in');
    void qContainer.offsetWidth; // reflow
    qContainer.classList.add('fade-in');
}

function selectOption(btn) {
    document.querySelectorAll('.option-btn').forEach(o => o.classList.remove('selected'));
    btn.classList.add('selected');
    nxtBtn.disabled = false;
}

function handleTimeOut() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex === 2 || currentQuestionIndex === 4) {
        adSlot.style.display = 'flex';
    } else {
        adSlot.style.display = 'none';
    }

    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
}

function updateTimerDisplay() {
    if(tElement) {
        tElement.innerText = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
    }
}

function finishQuiz() {
    localStorage.setItem('quizScore', score);
    localStorage.setItem('moneyEarned', moneyEarned);
    localStorage.setItem('totalQuestions', quizData.length);
    
    qContent.style.display = 'none';
    lScreen.style.display = 'flex';
    
    const t = translations[lang];
    let msgs = [t.checking, t.loading];
    let msgIndex = 0;
    
    lMsg.innerText = msgs[0];
    
    const mInt = setInterval(() => {
        msgIndex++;
        if(msgIndex < msgs.length) {
            lMsg.style.opacity = 0;
            setTimeout(() => {
                lMsg.innerText = msgs[msgIndex];
                lMsg.style.opacity = 1;
            }, 200);
        } else {
            clearInterval(mInt);
            window.location.href = 'result.html';
        }
    }, 1200);
}

// --- Result Page Logic --- //
if (window.location.pathname.endsWith('result.html') || document.getElementById('result-content')) {
    applyTranslations();

    const t = translations[lang];
    const finalScore = parseInt(localStorage.getItem('quizScore') || '0');
    const finalMoney = parseInt(localStorage.getItem('moneyEarned') || '0');
    const totalQ = parseInt(localStorage.getItem('totalQuestions') || '5');
    
    let resText = "";

    if(finalScore >= 4) {
        resText = t.evalGenius;
    } else if(finalScore >= 2) {
        resText = t.evalAverage;
    } else {
        resText = t.evalTry;
    }

    document.getElementById('score-display').innerText = `${finalScore}/${totalQ}`;
    document.getElementById('amount-display').innerText = t.currency + finalMoney;
    document.getElementById('result-text').innerText = resText;

    const sBtn = document.getElementById('share-btn');
    if (sBtn) {
        sBtn.addEventListener('click', () => {
            let url = window.location.href.replace('result.html', 'index.html');
            let shareText = `${t.shareMsg1}${finalMoney}${t.shareMsg2}${url}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
        });
    }
}
