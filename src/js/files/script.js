
import { addMoney, getRandom, deleteMoney } from '../files/functions.js';
import { startData } from './startData.js';

if (sessionStorage.getItem('privacy')) {
	document.querySelector('.preloader').classList.add('_hide');
}

export function initStartData() {
	if (sessionStorage.getItem('money')) {
		writeScore();
	} else {
		sessionStorage.setItem('money', startData.bank);
		writeScore();
	}

	if (!sessionStorage.getItem('current-bet')) {
		sessionStorage.setItem('current-bet', startData.countBet);
		if (document.querySelector('.bet-box__bet')) document.querySelector('.bet-box__bet').textContent = sessionStorage.getItem('current-bet');
	} else {
		if (document.querySelector('.bet-box__bet')) document.querySelector('.bet-box__bet').textContent = sessionStorage.getItem('current-bet');
	}
}

function writeScore() {
	if (document.querySelector('.score')) {
		document.querySelectorAll('.score').forEach(el => {
			el.textContent = sessionStorage.getItem('money');
		})
	}
}

initStartData();


//========================================================================================================================================================

const wrapper = document.querySelector('.wrapper');
const teams = document.querySelectorAll('.select__team');

const ball = document.querySelector('.game__ball');
const ballInner = document.querySelector('.game__ball-inner');

const leftGate = document.querySelector('.game__gate_1');
const rightGate = document.querySelector('.game__gate_2');

const player1 = document.querySelector('.game__player_2');

export const config = {
	timeConst: 60,
	timeCurrent: 0,
	scorePl1: 0,
	scorePl2: 0,
	currentPlayer: 1,

	playerTeam: 1,
	enemyTeam: 2,
	maxTeams: 16,

	enemys: [],
	players: [],

	vxMin: 5,
	vxMax: 14,
	vyMin: 5,
	vyMax: 12,

	pl1Run: false,
	isBallNear: false,
	isTargetPl1: false,
	isTargetPl2: false,

	isPlaying: false,

	timer: false,

	isBounceEnable: true,
	isScalingStart: false
}


//=======================================
// select screen
export function generateEnemyTeam() {
	const number = getRandom(1, config.maxTeams + 1);

	if (number !== config.playerTeam) {
		config.enemyTeam = number;

		teams.forEach(team => {
			if (team.dataset.team == config.enemyTeam) team.classList.add('_selected');
		})

		return true;
	}

	return generateEnemyTeam();
}

export function drawTeamsPictures() {
	const players = document.querySelectorAll('.game__player p');
	const enemys = document.querySelectorAll('.game__enemy p');

	players.forEach(player => {
		player.style.backgroundImage = `url("img/teams/team-${config.playerTeam}.svg")`;
	})

	enemys.forEach(enemy => {
		enemy.style.backgroundImage = `url("img/teams/team-${config.enemyTeam}.svg")`;
	})
}

export function showGameScreen() {
	wrapper.classList.add('_game');
	setTimeout(() => {
		wrapper.classList.remove('_select');
		startGame();
		deleteMoney(50, '.score', 'money');
	}, 1000);
}

//=======================================

// При загрузке страницы проверяем размеры экрана - если у клиента от планшета и более, делаем больше пределы полета мяча
if (window.innerWidth > 600 && window.innerHeight > 600) {
	config.vxMin = 13;
	config.vxMax = 4;
	config.vyMin = 5;
	config.vyMax = 15;
}

class Player {
	constructor(item, isBot) {
		this.xOffset = 0;
		this.countOffset = Math.random();
		this.item = document.querySelector(item);
		this.autoBot = isBot;
	}
}

class Enemy {
	constructor(item, number) {
		this.xOffset = 0;
		this.countOffset = Math.random();
		if (this.countOffset < 0.5 && number === 2) this.countOffset = 0.7;
		this.item = document.querySelector(item);
	}

}

function createPlayers() {
	config.players.push(new Player('.game__player_1 p', true), new Player('.game__player_2 p', false), new Player('.game__player_3 p', true));
}

function createEnemys() {
	config.enemys.push(new Enemy('.game__enemy_1', 1), new Enemy('.game__enemy_2', 2), new Enemy('.game__enemy_3', 3));
}


let vx = 0; // Horizontal velocity
let vy = 0; // Vertical velocity
let vz = 0; // Имитируем отклонение по оси z
let angle = 0; // Rotation angle
let xturn = 0;
let turn = 1;

const semiWidthGate = 3;

const gravity = 0.5; // 0.5
const bounceFactor = 0.7; // Energy lost on bounce

export function startGame() {
	config.isBounceEnable = true;
	createPlayers();
	createEnemys();

	config.isPlaying = true;
	animate();
	timer();
	setTimeout(() => {
		config.isBounceEnable = false;
	}, 1500);
}


function animate() {

	if (config.isBounceEnable) {
		// Apply gravity
		vy += gravity;
	}

	// Move the ball vertically and horizontally
	const rect = ball.getBoundingClientRect();

	const gate1 = leftGate.getBoundingClientRect();
	const gate2 = rightGate.getBoundingClientRect();

	const pl1 = player1.getBoundingClientRect();

	// x offset
	const maxX = gate2.left;
	const minX = gate1.left + semiWidthGate;

	// y offset
	let maxY = 170;
	if (innerHeight > 700 && innerWidth > 700) maxY = 440;

	const newX = rect.left + vx;
	const newY = rect.top + vy;

	// Проверяем в какую сторону летит мяч
	turn = xturn > newX ? 'left' : 'right';
	xturn = newX;

	if (config.isBounceEnable) {
		// При старте игры - скидываем мяч вниз
		// Vertical offset
		if (newY > maxY) { // Если достигли минимального порога отклонения (в данном случае дно)
			// Bounce the ball vertically
			vy = -vy * bounceFactor;

			ball.style.top = maxY + 'px';
		} else { // Если не достигли минимального порога отклонения - продолжаем движение
			ball.style.top = newY + 'px';
		}
	}
	// Horizontal offset
	if (newX + rect.width > maxX) { // гол сопернику и останавливаем мяч
		// Bounce the ball horizontally
		vx = 0;

		config.isBounceEnable = true;

		++config.scorePl1;
		updateScore();

		setTimeout(() => {
			restartStartPositionBall(ball, 2);
		}, 500);

	} else if (newX < minX) { // гол игроку и останавливаем мяч
		vx = 0;

		config.isBounceEnable = true;

		++config.scorePl2;
		updateScore();

		setTimeout(() => {
			restartStartPositionBall(ball, 1);
		}, 500);

	} else {
		ball.style.left = newX + 'px';
	}

	const ballLeft = rect.left;
	const ballRight = rect.left + rect.width;
	const ballTop = rect.top;
	const ballBottom = rect.top + rect.width;

	const pl1Top = pl1.top - 15;
	const pl1Right = pl1.left + pl1.width;

	// Мяч летит в сторону противника
	config.enemys.forEach(enemy => {

		const enemyInfo = enemy.item.getBoundingClientRect();
		const pl2Top = enemyInfo.top - 15;
		const pl2Bottom = enemyInfo.top + enemyInfo.height;
		const pl2Left = enemyInfo.left;

		if (pl2Top < ballBottom && pl2Bottom > ballTop) { // проверяем что мяч находится по высоте на уровне игрока
			if (ballRight >= pl2Left && ballRight < pl2Left + 10 && !config.isTargetPl2) {
				config.isTargetPl2 = true;
				vx = 0;
				vz = 0;
				setTimeout(() => {
					cickBall('left');
				}, 1000);
			}
		}
	})

	// Мяч летит в сторону игрока 
	config.players.forEach(player => {

		const playerInfo = player.item.getBoundingClientRect();
		const pl1Top = playerInfo.top - 15;
		const pl1Bottom = playerInfo.top + playerInfo.height;
		const pl1Right = playerInfo.left + playerInfo.width;

		if (pl1Top < ballBottom && pl1Bottom > ballTop) { // проверяем что мяч находится по высоте на уровне игрока
			if (ballLeft >= pl1Right && ballLeft < pl1Right + 7 && !config.isTargetPl1) {
				config.isTargetPl1 = true;
				vx = 0;
				vz = 0;
				if (player.autoBot) {
					setTimeout(() => {
						cickBall('right');
					}, 1000);
				}
			}
		}
	})

	// Ведем мяч игроком 1
	if (pl1Right < ballLeft && pl1Right + 7 > ballLeft && pl1Top < ballBottom && config.isTargetPl1) {
		ball.style.left = pl1Right + 15 + 'px';
	}

	// Проверяем, находится ли рядом с игроком мяч - если да, разрешаем удар
	if (pl1Right < ballLeft && pl1Right + 30 > ballLeft && pl1Top < ballBottom) {
		config.isBallNear = true;
	} else config.isBallNear = false;

	// Запускаем движение игроков если мяч летит в определенную сторону
	if (turn == 'right' && !config.isTargetPl2) {
		moveEnemys();
	}
	if (turn == 'left' && !config.isTargetPl1) {
		movePlayers();
	}

	// Update the rotation angle based on velocity
	angle += Math.sqrt(vx * vx + vy * vy) / 20;
	ballInner.style.transform = `rotate(${angle}rad)`;


	if (config.isPlaying) requestAnimationFrame(animate);
}

//===========
// random move
function movePlayers() {
	config.players.forEach(player => {
		if (player.isBot) {
			if (player.xOffset > 50 || player.xOffset < -50) player.countOffset = -player.countOffset;

			player.xOffset -= player.countOffset;
			player.item.style.transform = `translateX(${player.xOffset}px)`;
		}
	})
}

function moveEnemys() {
	config.enemys.forEach(enemy => {
		if (enemy.xOffset > 50 || enemy.xOffset < -50) enemy.countOffset = -enemy.countOffset;

		enemy.xOffset -= enemy.countOffset;
		enemy.item.style.transform = `translateX(${enemy.xOffset}px)`;
	})

}
//===========

export function cickBall(turn) {

	const ball = document.querySelector('.game__ball');

	if (turn === 'right') {
		vx = getRandom(config.vxMin, config.vxMax);
	} else if (turn === 'left') {
		vx = getRandom(-config.vxMax, -config.vxMin);
	}


	setTimeout(() => {
		config.isTargetPl2 = false;
		config.isTargetPl1 = false;
	}, 100);

	// Добавляем анимацию мячу
	if (turn === 'right') {
		ball.classList.add('_kick-right');

		setTimeout(() => {
			ball.classList.remove('_kick-right');
		}, 1000);
	} else if (turn === 'left') {
		ball.classList.add('_kick-left');

		setTimeout(() => {
			ball.classList.remove('_kick-left');
		}, 1000);
	}



}

function restartStartPositionBall(ball, pos = 3) {
	ball.style.top = '20%';
	config.isBallNear = false;
	if (pos === 1) ball.style.left = '35%';
	else if (pos === 2) ball.style.left = '60%';
	else ball.style.left = '50%';

	setTimeout(() => {
		config.isBounceEnable = false;
	}, 1500);
}


//========================================================================================================================================================

// Запускаем таймер и отслеживаем завершение времени
function timer() {
	const timeBlock = document.querySelector('.timer__timer');
	config.timeCurrent = config.timeConst;
	config.timer = setInterval(() => {
		--config.timeCurrent;

		if (config.timeCurrent >= 10) timeBlock.textContent = `0:${config.timeCurrent}`;
		else timeBlock.textContent = `0:0${config.timeCurrent}`;

		// Если время закончилось
		if (config.timeCurrent <= 0) {
			showFinalScreen();
			stopGame();
		}
	}, 1000);
}

function updateScore() {
	const scorePl1 = document.querySelector('[data-score="1"]');
	const scorePl2 = document.querySelector('[data-score="2"]');

	scorePl1.textContent = config.scorePl1;
	scorePl2.textContent = config.scorePl2;
}

function showFinalScreen() {
	const bet = 50;
	let count = 0;

	if (document.querySelector('[data-screen="final"]').classList.contains('_lose')) {
		document.querySelector('[data-screen="final"]').classList.remove('_lose');
	}
	if (document.querySelector('[data-screen="final"]').classList.contains('_win')) {
		document.querySelector('[data-screen="final"]').classList.remove('_win');
	}
	if (document.querySelector('[data-screen="final"]').classList.contains('_draw')) {
		document.querySelector('[data-screen="final"]').classList.remove('_draw');
	}

	if (config.scorePl1 > config.scorePl2) {
		// win
		document.querySelector('[data-screen="final"]').classList.add('_win');
		document.querySelector('[data-screen="final"] .final__title').textContent = 'Win';
		count = bet * 2;
		addMoney(count, '.score', 1000, 2000);
		document.querySelector('[data-screen="final"] .final__score').textContent = `+${count}`;
		document.querySelectorAll('.final__stars img').forEach(star => {
			star.setAttribute('src', 'img/icons/star-compl.svg')
		})

	} else if (config.scorePl1 === config.scorePl2) {
		// draw
		document.querySelector('[data-screen="final"]').classList.add('_draw');
		document.querySelector('[data-screen="final"] .final__title').textContent = 'Draw';
		addMoney(bet, '.score', 1000, 2000);
		document.querySelector('[data-screen="final"] .final__score').textContent = `+${bet}`;
		document.querySelectorAll('.final__stars img').forEach(star => {
			star.setAttribute('src', 'img/icons/star-compl.svg')
		})
	} else {
		// lose
		document.querySelector('[data-screen="final"]').classList.add('_lose');
		document.querySelector('[data-screen="final"] .final__title').textContent = 'Lose';
		document.querySelector('[data-screen="final"] .final__score').textContent = `-${bet}`;
		document.querySelectorAll('.final__stars img').forEach(star => {
			star.setAttribute('src', 'img/icons/star-empty.svg')
		})
	}


	setTimeout(() => {
		document.querySelector('[data-screen="final"]').classList.add('_visible');
	}, 500);
}

function stopGame() {
	clearInterval(config.timer);
	config.isPlaying = false;
}

export function resetData() {
	config.timeCurrent = config.timeConst;
	document.querySelector('.timer__timer').textContent = `0:59`;
	document.querySelector('[data-score="1"]').textContent = 0;
	document.querySelector('[data-score="2"]').textContent = 0;

	stopGame();

	config.scorePl1 = 0;
	config.scorePl2 = 0;
	vy = 0;
	vx = 0;
	// pl2.xOffset = 0;
	config.isBounceEnable = true;


	restartStartPositionBall(document.querySelector('.game__ball'));
	document.querySelector('.game__player_2').style.transform = `translate(0,0)`;

}

export function resetSelectTeamsBox() {
	const teams = document.querySelectorAll('.select__team');
	teams.forEach(team => {
		if (team.classList.contains('_selected')) team.classList.remove('_selected');
	});
	document.querySelector('.select__teams').classList.remove('_selected');
}


//========================================================================================================================================================
