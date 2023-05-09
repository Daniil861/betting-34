
import { deleteMoney } from './functions.js';
import { startData } from './startData.js';
import { config, cickBall, resetData, startGame, drawCurrentColors, initStartData, generateEnemyTeam, showGameScreen, drawTeamsPictures, resetSelectTeamsBox } from './script.js';
import { configSlot } from './slot.js';

let xOffset = 0;
let yOffset = 0;

// Объявляем слушатель событий "клик"
document.addEventListener('click', (e) => {
	initStartData();

	const targetElement = e.target;

	const preloader = document.querySelector('.preloader');
	const wrapper = document.querySelector('.wrapper');

	const money = +sessionStorage.getItem('money');
	const currentBet = +sessionStorage.getItem('current-bet');

	if (targetElement.closest('.preloader__button')) {
		preloader.classList.add('_hide');
		if (!sessionStorage.getItem('privacy')) {
			sessionStorage.setItem('privacy', true);
		}
	}

	if (targetElement.closest('[data-button="game"]')) {
		// запуск футбола
		setTimeout(() => {
			wrapper.classList.add('_select');
		}, 250);
	}

	if (targetElement.closest('[data-button="slot"]')) {
		wrapper.classList.add('_slot');
	}

	if (targetElement.closest('[data-button="privacy"]')) {
		preloader.classList.remove('_hide');
	}

	if (targetElement.closest('[data-button="select-home"]')) {
		wrapper.classList.remove('_select');
	}

	if (targetElement.closest('[data-button="game-home"]')) {
		wrapper.classList.remove('_game');

		resetData();
		xOffset = 0;
		yOffset = 0;
	}

	if (targetElement.closest('[data-button="slot-home"]')) {
		wrapper.classList.remove('_slot');

		configSlot.isAutMode = false;
		clearInterval(configSlot.autospin)
		document.querySelector('.controls-slot__button-spin').classList.remove('_hold');
		document.querySelector('.controls-slot__max').classList.remove('_hold');
		document.querySelector('.controls-slot__auto').classList.remove('_hold');
		document.querySelector('.bet-box').classList.remove('_hold');
	}

	// select screen

	if (targetElement.closest('.select__team')) {
		config.playerTeam = +targetElement.closest('.select__team').dataset.team;
		targetElement.closest('.select__team').classList.add('_selected');
		targetElement.closest('.select__teams').classList.add('_selected');

		setTimeout(() => {
			generateEnemyTeam();
			drawTeamsPictures();
		}, 1000);
		setTimeout(() => {
			showGameScreen();
			resetSelectTeamsBox();
		}, 2000);
	}

	//========================================================================================================================================================

	if (targetElement.closest('.timer__body')) {
		// startGame();
	}

	if (targetElement.closest('[data-screen="start-bet"] .final__button')) {
		document.querySelector('[data-screen="start-bet"]').classList.remove('_visible');
		setTimeout(() => {
			wrapper.classList.add('_game');
			startGame();
			deleteMoney(currentBet, '.score', 'money');
		}, 250);
	}

	if (targetElement.closest('.footer__btn-foot')) {

		if (config.isBallNear) cickBall('right');
	}

	if (targetElement.closest('[data-screen="final"] .final__button')) {

		if (wrapper.classList.contains('_game')) wrapper.classList.remove('_game');
		if (document.querySelector('[data-screen="final"]').classList.contains('_visible')) document.querySelector('[data-screen="final"]').classList.remove('_visible');

		resetData();
		xOffset = 0;
		yOffset = 0;
	}

	//========================================================================================================================================================

	if (targetElement.closest('.bet-box__minus') && currentBet > startData.countBet) {
		sessionStorage.setItem('current-bet', currentBet - startData.countBet);
		if (document.querySelector('.bet-box__bet')) document.querySelector('.bet-box__bet').textContent = sessionStorage.getItem('current-bet');
	}

	if (targetElement.closest('.bet-box__plus') && money > currentBet + startData.countBet && currentBet < startData.maxBet) {
		sessionStorage.setItem('current-bet', currentBet + startData.countBet);
		if (document.querySelector('.bet-box__bet')) document.querySelector('.bet-box__bet').textContent = sessionStorage.getItem('current-bet');
	}
})

const btnLeft = document.querySelector('[data-controls="left"]');
const btnRight = document.querySelector('[data-controls="right"]');
const btnUp = document.querySelector('[data-controls="up"]');
const btnDown = document.querySelector('[data-controls="down"]');

const ball = document.querySelector('.game__ball');

const player = document.querySelector('.game__player_2');
const countOffset = 10;
let timer = false;


// move left
btnLeft.addEventListener('touchstart', () => {

	const isIphone = checkIphone();

	if (!isIphone) {
		setTimeout(() => {
			clearInterval(timer);
		}, 1500);
	}

	movePlayer('left');
	config.pl1Run = true;
})
btnLeft.addEventListener('touchend', () => {
	clearInterval(timer);
	config.pl1Run = false;

})

// move right
btnRight.addEventListener('touchstart', () => {

	const isIphone = checkIphone();

	if (!isIphone) {
		setTimeout(() => {
			clearInterval(timer);
		}, 1500);
	}

	movePlayer('right');
	config.pl1Run = true;
})
btnRight.addEventListener('touchend', () => {

	clearInterval(timer);
	config.pl1Run = false;
})

// move up
btnUp.addEventListener('touchstart', () => {

	const isIphone = checkIphone();

	if (!isIphone) {
		setTimeout(() => {
			clearInterval(timer);
		}, 1500);
	}

	movePlayer('up');
	config.pl1Run = true;
})
btnUp.addEventListener('touchend', () => {
	clearInterval(timer);
	config.pl1Run = false;
})

// move down
btnDown.addEventListener('touchstart', () => {

	const isIphone = checkIphone();

	if (!isIphone) {
		setTimeout(() => {
			clearInterval(timer);
		}, 1500);
	}

	movePlayer('down');
	config.pl1Run = true;
})
btnDown.addEventListener('touchend', () => {
	clearInterval(timer);
	config.pl1Run = false;
})

function movePlayer(turn) {
	moveLogic(turn);

	timer = setInterval(() => {
		moveLogic(turn);
	}, 60);
}

function moveLogic(turn) {
	if (turn === 'left') {
		xOffset -= countOffset;
	} else if (turn === 'right') {
		xOffset += countOffset;
	} else if (turn === 'up') {
		moveBall('up');
		yOffset -= countOffset;
	} else if (turn === 'down') {
		moveBall('down');
		yOffset += countOffset;
	}
	player.style.transform = `translate(${xOffset}px,${yOffset}px)`;

}

function moveBall(turn) {
	let info = ball.getBoundingClientRect();
	let topPos = info.top;
	if (turn === 'up' && config.isBallNear) {
		ball.style.top = `${topPos - 9}px`;
	} else if (turn === 'down' && config.isBallNear) {
		ball.style.top = `${topPos + 9}px`;
	}
}

//========================================================================================================================================================
// Настройки для блокировки контекстного меню и корректной работы на айфонах
// отмена вызова контекстного меню при удерживании касания на мобильных устройствах
document.addEventListener('touchstart', blockedCntxtMenu, false);

function blockedCntxtMenu(e) {
	let targetElement = e.target;
	if (targetElement.closest('.footer__btn_left') || targetElement.closest('.footer__btn_right')) {
		targetElement.oncontextmenu = function () {
			return false;
		}
	}
}


// Отмена выделения текста на айфоне
const disableTextSelection = (element) => {
	let startSelection, endSelection;

	const disableTouchStart = (e) => {
		startSelection = e.target.selectionStart;
		endSelection = e.target.selectionEnd;

		if (startSelection === endSelection) {
			e.preventDefault();
		}
	};

	const disableTouchMove = (e) => {
		e.preventDefault();
	};

	element.addEventListener('touchstart', disableTouchStart);
	element.addEventListener('touchmove', disableTouchMove);
};

disableTextSelection(btnLeft);
disableTextSelection(btnRight);
disableTextSelection(btnUp);
disableTextSelection(btnDown);
// disableTextSelection(document.querySelector('.game__field'));


function checkIphone() {
	let uagent = navigator.userAgent.toLowerCase();

	if (uagent.lastIndexOf("iphone") === -1 && uagent.lastIndexOf("ipad") === -1 && uagent.lastIndexOf("webos") === -1) {
		return true;
	}
}
