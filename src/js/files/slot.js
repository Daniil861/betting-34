import gsap from 'gsap';

import { deleteMoney, noMoney, addMoney } from './functions.js';

let tl = gsap.timeline({ defaults: { ease: "Power1.easeInOut", duration: 1.5 } });

export const configSlot = {
	currentWin: 0,
	winCoeff_3: 60,
	isAutMode: false,
	isWin: false,
	autospin: false
}
const configGSAP = {
	duration_1: 3,
	duration_3: 3
}

//========================================================================================================================================================
let slot1 = null;

class Slot1 {
	constructor(domElement, config = {}) {
		Symbol1.preload();

		this.currentSymbols = [
			["1", "2", "3"],
			["4", "5", "6"],
			["7", "1", "2"],
			["3", "4", "5"],
			["6", "7", "1"],
		];

		this.nextSymbols = [
			["1", "2", "3"],
			["4", "5", "6"],
			["7", "1", "2"],
			["3", "4", "5"],
			["6", "7", "1"],
		];

		this.container = domElement;

		this.reels = Array.from(this.container.getElementsByClassName("reel1")).map(
			(reelContainer, idx) =>
				new Reel1(reelContainer, idx, this.currentSymbols[idx])
		);

		this.spinButton = document.querySelector('.controls-slot__button-spin');
		this.spinButton.addEventListener("click", () => {
			//при запуске сбрасываем интервал запуска между слотами
			tl.to(this.spinButton, {});

			if ((+sessionStorage.getItem('money') >= +sessionStorage.getItem('current-bet'))) {
				this.spin();

			} else {
				noMoney('.score');
			}
		});

		this.maxBetButton = document.querySelector('.controls-slot__max');
		this.maxBetButton.addEventListener("click", () => {
			//при запуске сбрасываем интервал запуска между слотами
			tl.to(this.spinButton, {});

			const money = +sessionStorage.getItem('money');
			let bet = 0;
			if (money > 550) {
				bet = 500;
				sessionStorage.setItem('current-bet', bet);
				this.spin();
			} else if (money < 500 && money > 50) {
				bet = money - 50;
				sessionStorage.setItem('current-bet', bet);
				this.spin();
			} else {
				noMoney('.score');
			}
		});

		this.casinoAutoSpinCount = 0;
		this.autoSpinButton = document.querySelector('.controls-slot__auto');

		this.autoSpinButton.addEventListener("click", () => {
			tl.to(this.spinButton, {});
			var oThis = this;
			this.casinoAutoSpinCount = 0;
			configSlot.isAutMode = true;

			if ((+sessionStorage.getItem('money') > +sessionStorage.getItem('current-bet'))) {
				this.casinoAutoSpinCount++;
				this.spin();
			}
			configSlot.autospin = setInterval(function () {
				tl.to(oThis.spinButton, {});

				oThis.casinoAutoSpinCount++;
				if (oThis.casinoAutoSpinCount >= 9) configSlot.isAutMode = false;

				if (oThis.casinoAutoSpinCount < 10 && (+sessionStorage.getItem('money') >= +sessionStorage.getItem('current-bet'))) {
					oThis.spin();
				} else if (oThis.casinoAutoSpinCount >= 10 && (+sessionStorage.getItem('money') >= +sessionStorage.getItem('current-bet'))) {
					clearInterval(configSlot.autospin);
					configSlot.isAutMode = false;
				} else {
					clearInterval(configSlot.autospin);
					noMoney('.check');
					configSlot.isAutMode = false;
				}
			}, 5500);
		});

		if (config.inverted) {
			this.container.classList.add("inverted");
		}
		this.config = config;
	}

	async spin() {
		this.currentSymbols = this.nextSymbols;
		this.nextSymbols = [
			[Symbol1.random(), Symbol1.random(), Symbol1.random()],
			[Symbol1.random(), Symbol1.random(), Symbol1.random()],
			[Symbol1.random(), Symbol1.random(), Symbol1.random()],
			[Symbol1.random(), Symbol1.random(), Symbol1.random()],
			[Symbol1.random(), Symbol1.random(), Symbol1.random()],
		];

		this.onSpinStart(this.nextSymbols);

		await Promise.all(
			this.reels.map((reel) => {
				reel.renderSymbols(this.nextSymbols[reel.idx]);
				return reel.spin(this.nextSymbols);
			})
		);
	}

	onSpinStart(symbols) {
		deleteMoney(+sessionStorage.getItem('current-bet'), '.score', 'money');

		this.spinButton.classList.add('_hold');
		this.maxBetButton.classList.add('_hold');
		this.autoSpinButton.classList.add('_hold');
		document.querySelector('.bet-box').classList.add('_hold');

		if (symbols) {
			this.config.onSpinStart(symbols);
		}

	}

	onSpinEnd(symbols) {
		if (!configSlot.isAutMode) {
			this.spinButton.classList.remove('_hold');
			this.maxBetButton.classList.remove('_hold');
			this.autoSpinButton.classList.remove('_hold');
			document.querySelector('.bet-box').classList.remove('_hold');
		}

		if (symbols && configSlot.isAutMode) {
			this.config.onSpinEnd(symbols, this.spinButton, this.maxBetButton, this.autoSpinButton);
		} else {
			this.config.onSpinEnd(symbols);
		}
	}

}

class Reel1 {
	constructor(reelContainer, idx, initialSymbols) {
		this.reelContainer = reelContainer;
		this.idx = idx;

		this.symbolContainer = document.createElement("div");
		this.symbolContainer.classList.add("icons");
		this.reelContainer.appendChild(this.symbolContainer);

		initialSymbols.forEach((symbol) =>
			this.symbolContainer.appendChild(new Symbol1(symbol).img)
		);
	}

	get factor() {
		return 3 + Math.pow(this.idx / 2, 2);
	}

	renderSymbols(nextSymbols) {
		const fragment = document.createDocumentFragment();

		for (let i = 3; i < 3 + Math.floor(this.factor) * 10; i++) {
			const icon = new Symbol1(
				i >= 10 * Math.floor(this.factor) - 2
					? nextSymbols[i - Math.floor(this.factor) * 10]
					: undefined
			);
			fragment.appendChild(icon.img);
		}

		this.symbolContainer.appendChild(fragment);
	}

	async spin(symbols) {
		// запускаем анимацию смещения колонки
		this.param = ((Math.floor(this.factor) * 10) / (3 + Math.floor(this.factor) * 10)) * 100;

		await tl.fromTo(this.symbolContainer, { translateY: 0, }, {
			translateY: `${-this.param}%`,
			duration: configGSAP.duration_3,
			onComplete: () => {

				// определяем какое количество картинок хотим оставить в колонке
				const max = this.symbolContainer.children.length - 3; // 3 - количество картинок в одной колонке после остановки

				gsap.to(this.symbolContainer, { translateY: 0, duration: 0 });

				// запускаем цикл, в котором оставляем определенное количество картинок в конце колонки
				for (let i = 0; i < max; i++) {
					this.symbolContainer.firstChild.remove();
				}
			}
		}, '<10%');

		// После выполнения анимации запускаем сценарий разблокировки кнопок и проверки результата
		slot1.onSpinEnd(symbols);
	}
}

const cache1 = {};

class Symbol1 {
	constructor(name = Symbol1.random()) {
		this.name = name;

		if (cache1[name]) {
			this.img = cache1[name].cloneNode();
		} else {

			this.img = new Image();
			this.img.src = `img/slot/slot-${name}.png`;

			cache1[name] = this.img;
		}
	}

	static preload() {
		Symbol1.symbols.forEach((symbol) => new Symbol1(symbol));
	}

	static get symbols() {
		return [
			'1',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7'
		];
	}

	static random() {
		return this.symbols[Math.floor(Math.random() * this.symbols.length)];
	}
}

const config1 = {
	inverted: false,
	onSpinStart: (symbols) => {

	},
	onSpinEnd: (symbols, spinButton, maxBetButton, autoSpinButton) => {
		if (symbols[0][0] == symbols[1][0] && symbols[1][0] == symbols[2][0] && symbols[2][0] == symbols[3][0] && symbols[3][0] == symbols[4][0] ||
			symbols[0][1] == symbols[1][1] && symbols[1][1] == symbols[2][1] && symbols[2][1] == symbols[3][1] && symbols[3][1] == symbols[4][1] ||
			symbols[0][2] == symbols[1][2] && symbols[1][2] == symbols[2][2] && symbols[2][2] == symbols[3][2] && symbols[3][2] == symbols[4][2]
		) {

			if (configSlot.isAutMode) {
				clearInterval(configSlot.autospin);
				configSlot.isAutMode = false;

				spinButton.classList.remove('_hold');
				maxBetButton.classList.remove('_hold');
				autoSpinButton.classList.remove('_hold');
				document.querySelector('.bet-box').classList.remove('_hold');
			}

			let currintWin = +sessionStorage.getItem('current-bet') * configSlot.winCoeff_3;

			// Записываем сколько выиграно на данный момент
			configSlot.currentWin = currintWin;

			addMoney(currintWin, '.score', 1000, 2000);

		}
	},
};

if (document.querySelector('.slot')) {
	slot1 = new Slot1(document.getElementById("slot1"), config1);
}
