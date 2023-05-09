/*
Документация по работе в шаблоне: 
Документация слайдера: https://swiperjs.com/
Сниппет(HTML): swiper
*/

// Подключаем слайдер Swiper из node_modules
// При необходимости подключаем дополнительные модули слайдера, указывая их в {} через запятую
// Пример: { Navigation, Autoplay }
import Swiper, { Pagination } from 'swiper';
/*
Основниые модули слайдера:
Navigation, Pagination, Autoplay, 
EffectFade, Lazy, Manipulation
Подробнее смотри https://swiperjs.com/
*/

// Стили Swiper
// Базовые стили
import "../../scss/base/swiper.scss";
// Полный набор стилей из scss/libs/swiper.scss
// import "../../scss/libs/swiper.scss";
// Полный набор стилей из node_modules
// import 'swiper/css';

// Инициализация слайдеров
function initSliders() {
	// Перечень слайдеров
	// Проверяем, есть ли слайдер на стронице
	if (document.querySelector('.main__slider')) { // Указываем скласс нужного слайдера
		// Создаем слайдер
		new Swiper('.main__slider', { // Указываем скласс нужного слайдера
			// Подключаем модули слайдера
			// для конкретного случая
			modules: [Pagination],
			observer: true,
			observeParents: true,
			slidesPerView: 'auto',
			spaceBetween: 20,
			freeMode: true,
			centeredSlides: true,
			initialSlide: 1,
			speed: 800,
			pagination: {
				el: '.main__pagination',
				clickable: true,
			},
		});
	}
	if (document.querySelector('.about-main__slider')) { // Указываем скласс нужного слайдера
		// Создаем слайдер
		new Swiper('.about-main__slider', { // Указываем скласс нужного слайдера
			// Подключаем модули слайдера
			// для конкретного случая
			modules: [Pagination],
			observer: true,
			observeParents: true,
			slidesPerView: 'auto',
			spaceBetween: 20,
			freeMode: true,
			centeredSlides: true,
			initialSlide: 1,
			speed: 800,
			pagination: {
				el: '.about-main__pagination',
				clickable: true,
			},
		});
	}
}


window.addEventListener("load", function (e) {
	// Запуск инициализации слайдеров
	initSliders();
});