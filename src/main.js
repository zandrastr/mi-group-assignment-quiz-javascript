import './style/style.scss';

import animalQsEasy from './animals-easy.js';
import animalQsMedium from './animals-med.js';
import animalQsHard from './animals-hard.js';
import geographyQsEasy from './geography-easy.js';
import geographyQsMedium from './geography-medium.js';
import geographyQsHard from './geography-hard.js';
import computerQsEasy from './computer-easy.js';
import computerQsMedium from './computer-medium.js';
import computerQsHard from './computer-hard.js';
import { check } from 'prettier';
import { getJSDocParameterTags } from 'typescript';


//=================================================================================================
//----------------------------------- VARIABLE DECLARATIONS ---------------------------------------
//=================================================================================================
const animalQuestionsEasy = animalQsEasy.results;
const animalQuestionsMedium = animalQsMedium.results;
const animalQuestionsHard = animalQsHard.results;
const geographyQuestionsEasy = geographyQsEasy.results;
const geographyQuestionsMedium = geographyQsMedium.results;
const geographyQuestionsHard = geographyQsHard.results;
const computerQuestionsEasy = computerQsEasy.results;
const computerQuestionsMedium = computerQsMedium.results;
const computerQuestionsHard = computerQsHard.results;

const playerName = document.querySelector('#playerName');
const playerRegMsg = document.createElement("p");
const startGameBtn = document.querySelector('#start-game-button');
const startPage = document.querySelector('#start-page');

const allPages = document.querySelectorAll('.page');
const questionPage = document.querySelector('#question-page');
const gameOverPage = document.querySelector('#game-over-page');
const difficultyPage = document.querySelector('#difficulty-page');
const categoryPage = document.querySelector('#category-page');
const highscorePage = document.querySelector('#highscore-page');

const scoreText = document.querySelector('#score');
const questionText = document.querySelector('#question-text');
const answerBtns = document.querySelectorAll('.answer-btn');
const playAgainBtn = document.querySelector('#playAgainBtn');
const highscoreBtns = document.querySelectorAll('.highscore-btn');

const pointsScore = document.querySelector('#points');

const categoryImg = document.querySelector('#category-img');

const highscoreList = document.querySelector('#highscore-list');
const highscores = JSON.parse(localStorage.getItem('highscores')) || [];

// player
let currentName = null;
let currentScore = 0;
let scoreGain = null;

// category and difficulty (chosen at start screen)
let difficulty = null;
let category = null;
let questionTimer = null;
let timeBonus = 10;
let question = null;
let correctAnswer = null;
let incorrectAnswers = null;

let countdownInterval = null;
let bonusCountdown = null;

// animation
let animate = gsap.to('.countdown', {
  paused: true,
  duration: .5,
  scale: 2,
  top: '42%',
  left: '50%'
});

// keep track of current question
let questionCounter = 0;

//=================================================================================================
//----------------------------------- FUNCTION DECLARATIONS ---------------------------------------
//=================================================================================================

// initiate quiz
function init(reload) {
  if (reload) {
    window.location.reload();
  }
  playerName.value = '';
  currentName = '';
  currentScore = 0;
  questionCounter = 0;
  scoreGain = 0;
  renderStartPage();
}

// player information
class playerData {
  constructor(name, score) {
    this.name = name;
    this.score = score;
  }
}

// player name
function savePlayerName() {
  const nameRegEx = /^[a-zA-ZåäöÅÄÖ-]+$/;

  if (!playerName.value.match(nameRegEx)) {
    playerRegMsg.innerHTML = "Please insert a valid name.";
    addPlayer.append(playerRegMsg);
  } else {
    currentName = playerName.value;
    renderCategoryPage();
  }
}

//============================================= RENDER PAGES =============================================//

// start page
function renderStartPage() {
  allPages.forEach(page => {
    if (!page.classList.contains('start-page') && !page.classList.contains('hidden')) {
      page.classList.add('hidden');
    }
  });
  startPage.classList.remove('hidden');
}

// category page
function renderCategoryPage() {
  allPages.forEach(page => {
    if (!page.classList.contains('category-page') && !page.classList.contains('hidden')) {
      page.classList.add('hidden');
    }
  });
  categoryPage.classList.remove('hidden');
}

// difficulty page
function renderDifficultyPage() {
  allPages.forEach(page => {
    if (!page.classList.contains('difficulty-page') && !page.classList.contains('hidden')) {
      page.classList.add('hidden');
    }
  });
  difficultyPage.classList.remove('hidden');
}

// questions page
function renderQuestionsPage() {
  allPages.forEach(page => {
    if (!page.classList.contains('question-page') && !page.classList.contains('hidden')) {
      page.classList.add('hidden');
    }
  });
  questionPage.classList.remove('hidden');
}

// game over page
function renderGameOverPage() {
  setHighscore();
  pointsScore.innerHTML = `${currentScore}`;
  allPages.forEach(page => {
    if (!page.classList.contains('game-over-page') && !page.classList.contains('hidden')) {
      page.classList.add('hidden');
    }
  });
  gameOverPage.classList.remove('hidden');
}

// highscore page
function renderHighscores() {
  addHighscore();
  allPages.forEach(page => {
    if (!page.classList.contains('highscore-page') && !page.classList.contains('hidden')) {
      page.classList.add('hidden');
    }
  });
  highscorePage.classList.remove('hidden');
}

//========================================== QUIZ CHOICES ===========================================//

// category choice
function categoryChoice(e) {
  const choice = e.currentTarget.innerHTML;

  if (choice.toLowerCase() == 'animals') {
    category = 'animals';
    categoryImg.src = './animal-bg.png'
  } else if (choice.toLowerCase() == 'geography') {
    category = 'geography';
    categoryImg.src = './geography-bg.png';
    categoryImg.alt = "A colorful world map cartoon.";
  } else if (choice.toLowerCase() == 'computer') {
    category = 'computer';
    categoryImg.src = './computer-bg.png';
    categoryImg.alt = "A colorful computer cartoon.";
  }
  renderDifficultyPage();
}

// difficulty choice
function difficultyChoice(e) {
  const choice = e.currentTarget.innerHTML;

  if (choice.toLowerCase() == 'easy') {
    difficulty = 'easy';
  } else if (choice.toLowerCase() == 'medium') {
    difficulty = 'medium';
  } else if (choice.toLowerCase() == 'hard') {
    difficulty = 'hard';
  }
  renderQuestionsPage();
  renderQuestions();
}

// check which category & difficulty  ----- TODO : Solve in a cleaner way -----
function chosenQuiz() {
  if (category == 'animals') {
    if (difficulty == 'easy') {
      question = animalQuestionsEasy[questionCounter].question;
      correctAnswer = animalQuestionsEasy[questionCounter].correct_answer;
      incorrectAnswers = animalQuestionsEasy[questionCounter].incorrect_answers;
      questionTimer = 45;
      scoreGain = 1;
    } else if (difficulty == 'medium') {
      question = animalQuestionsMedium[questionCounter].question;
      correctAnswer = animalQuestionsMedium[questionCounter].correct_answer;
      incorrectAnswers = animalQuestionsMedium[questionCounter].incorrect_answers;
      questionTimer = 30;
      scoreGain = 2;
    } else if (difficulty == 'hard') {
      question = animalQuestionsHard[questionCounter].question;
      correctAnswer = animalQuestionsHard[questionCounter].correct_answer;
      incorrectAnswers = animalQuestionsHard[questionCounter].incorrect_answers;

      questionTimer = 15;
      scoreGain = 3;
    }

  } else if (category == 'geography') {
    if (difficulty == 'easy') {
      question = geographyQuestionsEasy[questionCounter].question;
      correctAnswer = geographyQuestionsEasy[questionCounter].correct_answer;
      incorrectAnswers = geographyQuestionsEasy[questionCounter].incorrect_answers;
      questionTimer = 45;
      scoreGain = 1;
    } else if (difficulty == 'medium') {
      question = geographyQuestionsMedium[questionCounter].question;
      correctAnswer = geographyQuestionsMedium[questionCounter].correct_answer;
      incorrectAnswers = geographyQuestionsMedium[questionCounter].incorrect_answers;
      questionTimer = 30;
      scoreGain = 2;
    } else if (difficulty == 'hard') {
      question = geographyQuestionsHard[questionCounter].question;
      correctAnswer = geographyQuestionsHard[questionCounter].correct_answer;
      incorrectAnswers = geographyQuestionsHard[questionCounter].incorrect_answers;
      questionTimer = 15;
      scoreGain = 3;
    }

  } else if (category == 'computer') {
    if (difficulty == 'easy') {
      question = computerQuestionsEasy[questionCounter].question;
      correctAnswer = computerQuestionsEasy[questionCounter].correct_answer;
      incorrectAnswers = computerQuestionsEasy[questionCounter].incorrect_answers;
      questionTimer = 45;
      scoreGain = 1;
    } else if (difficulty == 'medium') {
      question = computerQuestionsMedium[questionCounter].question;
      correctAnswer = computerQuestionsMedium[questionCounter].correct_answer;
      incorrectAnswers = computerQuestionsMedium[questionCounter].incorrect_answers;
      questionTimer = 30;
      scoreGain = 2;
    } else if (difficulty == 'hard') {
      question = computerQuestionsHard[questionCounter].question;
      correctAnswer = computerQuestionsHard[questionCounter].correct_answer;
      incorrectAnswers = computerQuestionsHard[questionCounter].incorrect_answers;
      questionTimer = 15;
      scoreGain = 3;
    }
  }
}

// render questions
function renderQuestions() {

  // set bonus score countdown
  timeBonus = 10;

  // check which quiz is chosen
  chosenQuiz();

  // animate questions and answers
  animateQuestions();

  // start countdowns
  startCountdown(questionTimer);
  bonusScoreCountdown();

  // render score
  scoreText.innerHTML = `Score: ${currentScore}`;

  // render question
  questionText.innerHTML = question;

  // randomize answer buttons
  let randomIndex = Math.floor(Math.random() * 4);
  let incorrectBtnIndex = 0;

  // render answer buttons
  answerBtns.forEach((btn, index) => {
    if (index != randomIndex) {
      btn.innerHTML = `${incorrectAnswers[incorrectBtnIndex]}`
      btn.classList.add('incorrectAnswer');
      incorrectBtnIndex++;
    } else {
      btn.innerHTML = `${correctAnswer}`;
      btn.classList.add('correctAnswer');
    }
  });
}

// reset button classes after each question
function clearClasses() {
  answerBtns.forEach(btn => {
    btn.className = 'answer-btn';
    btn.removeAttribute('disabled');
  });
}

// prevent multiple answers in same question
function disableBtns() {
  answerBtns.forEach(btn => {
    btn.disabled = true;
  });
}

// countdown for bonus time score
function bonusScoreCountdown() {
  bonusCountdown = setInterval(updateBonusCountdown, 1000);

  function updateBonusCountdown() {
    if (timeBonus < 0) {
      stopBonusCountdown();
    }
    timeBonus--;
  }
  updateBonusCountdown();
}

// start countdown timer
function startCountdown(seconds) {
  const countdownEl = document.querySelector('#countdown');
  let countdownSeconds = seconds;
  countdownInterval = setInterval(updateCountdown, 1000);

  function updateCountdown() {
    countdownEl.innerHTML = `${countdownSeconds}`;

    if (countdownSeconds < 0) {
      stopAnimateCountdown();
      stopCountdown();
      renderGameOverPage();
    } else if (countdownSeconds < 11) {
      animateCountdown();
    }
    countdownSeconds--;
  }
  updateCountdown();
}

// stop countdown timer 
function stopCountdown() {
  clearInterval(countdownInterval);
}

function stopBonusCountdown() {
  clearInterval(bonusCountdown);
}

// animations when below 10 seconds on countdown timer
function animateCountdown() {
  animate.play();
}

function stopAnimateCountdown() {
  animate.revert();

  animate = gsap.to('.countdown', {
    paused: true,
    duration: .5,
    scale: 2,
    top: '42%',
    left: '50%'
  });
}

function animateQuestions() {
  gsap.from('.question-container', { duration: 1.5, opacity: 0 });
  gsap.from('.answer-btn', { duration: 1, opacity: 0, stagger: .3, delay: .5 });
}

// play again
function restartGame() {
  const reload = true;
  init(reload);
}

// highscore
function setHighscore() {
  const newScore = new playerData(currentName, currentScore);

  highscores.push(newScore);
  highscores.sort((a, b) => b.score - a.score);
  highscores.splice(10);

  localStorage.setItem('highscores', JSON.stringify(highscores));

  addHighscore();
}

// add to highscores
function addHighscore() {
  highscoreList.innerHTML = highscores.map(score => {
    return `<li>${score.name}: ${score.score}`;
  })
    .join("");
}

// check if answer is correct, add 1 score if true
function checkAnswer(e) {
  const myAnswer = e.currentTarget.innerHTML;
  const checkMyAnswerCorrect = e.currentTarget;

  stopBonusCountdown();
  disableBtns();

  let myAnswerArray = [];
  myAnswerArray.push(myAnswer);

  myAnswerArray.forEach((answer) => {
    const compareAnswersTable = document.querySelector(".compare-answers-table");

    const showQuestionRow = document.createElement("tr");

    const showQuestion = document.createElement("th");
    showQuestion.setAttribute("class", "show-question");
    showQuestion.setAttribute("colspan", "2");
    showQuestion.innerHTML = question;
    showQuestionRow.append(showQuestion);
    compareAnswersTable.append(showQuestionRow);

    const compareAnswers = document.createElement("tr");
    compareAnswers.setAttribute("class", "compare-answers");

    const showUserAnswer = document.createElement("td");
    showUserAnswer.setAttribute("class", "show-user-answer");
    showUserAnswer.innerHTML = answer;
    compareAnswers.append(showUserAnswer);

    const showCorrectAnswer = document.createElement("td");
    showCorrectAnswer.setAttribute("class", "show-correct-answer");
    showCorrectAnswer.innerHTML = correctAnswer;
    compareAnswers.append(showCorrectAnswer);
    compareAnswersTable.append(compareAnswers);
  })

  // add score or remove score (minimum 0 score)
  if (myAnswer == correctAnswer) {
    timeBonus > 0 ? currentScore += (scoreGain + 1) : currentScore += scoreGain; // +1 score if question is answered within 10 seconds
    const showUserAnswer = document.querySelector(".show-user-answer");
    showUserAnswer.setAttribute("class", "show-user-answer-correct");
    checkMyAnswerCorrect.classList.add("green-answer"); //add class to change color
    // change back color
    setTimeout(() => {
      checkMyAnswerCorrect.classList.remove('green-answer')
    }, 3000);
  } else if ((myAnswer == incorrectAnswers[0] || myAnswer == incorrectAnswers[1] || myAnswer == incorrectAnswers[2])) {
    currentScore >= scoreGain ? currentScore -= scoreGain : currentScore = 0;
    const checkMyAnswerIncorrect = e.currentTarget;
    checkMyAnswerIncorrect.classList.add("red-answer"); //add class to change color
    const showUserAnswer = document.querySelector(".show-user-answer");
    showUserAnswer.setAttribute("class", "show-user-answer-wrong");
    // change back color
    setTimeout(() => {
      checkMyAnswerIncorrect.classList.remove('red-answer');
    }, 3000);
  }

  stopAnimateCountdown();
  stopCountdown();

  if (questionCounter < 9) {
    questionCounter++;
    setTimeout(questionDelay, 3000); //3 sek delay
  } else {
    renderGameOverPage();
    clearClasses();
  }
}

// create delay and then clear classes and render next question
function questionDelay() {
  renderQuestions();
  clearClasses();
}

//=================================================================================================
//-------------------------------------- PROGRAM LOGIC --------------------------------------------
//=================================================================================================

// start quiz
startGameBtn.addEventListener('click', savePlayerName);

// category
document.querySelector('#animals-btn').addEventListener('click', categoryChoice);
document.querySelector('#geography-btn').addEventListener('click', categoryChoice);
document.querySelector('#computer-btn').addEventListener('click', categoryChoice);

// difficulty
document.querySelector('#easy-btn').addEventListener('click', difficultyChoice);
document.querySelector('#medium-btn').addEventListener('click', difficultyChoice);
document.querySelector('#hard-btn').addEventListener('click', difficultyChoice);

// go back btn
document.querySelector('#back-btn').addEventListener('click', init);

// play again
playAgainBtn.addEventListener('click', restartGame);

// check answers
answerBtns.forEach(btn => {
  btn.addEventListener('click', checkAnswer);

})

highscoreBtns.forEach(btn => {
  btn.addEventListener('click', renderHighscores);
})

// calls init function to run on page load
init();