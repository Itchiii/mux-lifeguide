const toggleButton = document.getElementById('toggle-button');
const sidemenu = document.getElementById('menu');
const panel = document.getElementById('panel');

//add various EventListener for touch and mouse interactions
toggleButton.addEventListener("click", toggleButtonOnClick);
toggleButton.addEventListener("touchmove", toggleButtonOnTouchMove);
toggleButton.addEventListener("mousedown", toggleButtonOnStart);
toggleButton.addEventListener("mouseup", toggleButtonOnEnd);
toggleButton.addEventListener("touchstart", toggleButtonOnStart);
toggleButton.addEventListener("touchend", toggleButtonOnEnd);

let touchBeginAtSidemenu = 0;
let touchDifference = 0;

//toogle sidemenu
function toggleButtonOnClick() {
	sidemenu.classList.toggle('open');
	panel.classList.toggle('open');
}

function toggleButtonOnStart(e) {
	if (e.type === 'mousedown') {
		touchBeginAtSidemenu = e.pageX;
		touchDifference = touchBeginAtSidemenu - e.pageX;
		toggleButton.addEventListener("mousemove", toggleButtonOnTouchMove);
	}
	else {
		touchBeginAtSidemenu = e.touches[0].pageX;
		touchDifference = touchBeginAtSidemenu - e.touches[0].pageX;
	}
}

//add moving difference as transform
function toggleButtonOnTouchMove(e) {
	if (e.type === 'mousemove') {
		touchDifference = touchBeginAtSidemenu - e.pageX;
		if (touchBeginAtSidemenu <= 220 && e.pageX <= 220) {
			sidemenu.style.setProperty('transform', `translateX(${touchDifference * (-1) + (-226)}px)`);
		}
	}
	else {
		touchDifference = touchBeginAtSidemenu - e.touches[0].pageX;
		if (touchBeginAtSidemenu <= 220 && e.touches[0].pageX <= 220) {
			sidemenu.style.setProperty('transform', `translateX(${touchDifference * (-1) + (-226)}px)`);
		}
	}
}

//remove class and transform property
function toggleButtonOnEnd(e) {
	if (e.type === 'mouseup') {
		toggleButton.removeEventListener("mousemove", toggleButtonOnTouchMove);
	}

	sidemenu.style.removeProperty('transform');
	if (touchDifference < -100) {
		sidemenu.style.removeProperty('transform');
		sidemenu.classList.add('open');
		panel.classList.add('open');
	}
	if (touchDifference > 100 && touchDifference > 0) {
		sidemenu.classList.remove('open');
		panel.classList.remove('open');
		sidemenu.style.removeProperty('transform');
	}
}