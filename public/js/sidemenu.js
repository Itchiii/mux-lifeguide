const toggleButton = document.getElementById('toggle-button');
const sidemenu = document.getElementById('menu');
const panel = document.getElementById('panel');

//add various EventListener for touch and mouse interactions
toggleButton.addEventListener("click", toggleButtonOnClick);
sidemenu.addEventListener("touchmove", sideMenuOnTouchMove);
sidemenu.addEventListener("touchstart", sideMenuOnTouchDown);
sidemenu.addEventListener("touchend", sideMenuOnTouchUp);

//init variables to remember touchStart and global touch difference
let touchBeginAtSidemenu, touchDifference;

//toggle sidemenu
function toggleButtonOnClick() {
	sidemenu.classList.toggle('open');
	panel.classList.toggle('open');
}

function sideMenuOnTouchDown(e) {
	touchBeginAtSidemenu = e.touches[0].pageX;
	touchDifference = touchBeginAtSidemenu - e.touches[0].pageX;

	//remove transition for translateX
	sidemenu.classList.remove('transition');
}

//add moving difference as transform
function sideMenuOnTouchMove(e) {
	const widthOfMenu = 226;
	touchDifference = touchBeginAtSidemenu - e.touches[0].pageX;

	//set matrix to get translateX value (.m41)
	let matrix = new DOMMatrix(window.getComputedStyle(sidemenu).transform);
	
	//touch from right to left (close sidemenu)
	if (matrix.m41 >= -widthOfMenu && sidemenu.classList.contains('open') && touchDifference >= 0) {
		sidemenu.style.setProperty('transform', `translateX(${touchDifference * (-1)}px)`);
	}
	else if (matrix.m41 <= -widthOfMenu && sidemenu.classList.contains('open') && touchDifference >= 0){
		sidemenu.style.removeProperty('transform');
		sidemenu.classList.remove('open');
		panel.classList.remove('open');
	}

	//touch from left to right (open sidemenu)
	if (matrix.m41 >= 0 && touchDifference < 0 && !sidemenu.classList.contains('open')) {
		sidemenu.style.removeProperty('transform');
		sidemenu.classList.add('open');
		panel.classList.add('open');
		return;
	}
	else if (touchDifference < 0 && !sidemenu.classList.contains('open')){
		sidemenu.style.setProperty('transform', `translateX(${touchDifference * (-1) + (-widthOfMenu)}px)`);
	}
}

//remove class and transform property
function sideMenuOnTouchUp(e) {
	const minDistance = 100;

	//add transition for translateX
	sidemenu.classList.add('transition');

	sidemenu.style.removeProperty('transform');
	if (touchDifference < -minDistance) {
		sidemenu.classList.add('open');
		panel.classList.add('open');
	}
	if (touchDifference > minDistance && touchDifference > 0) {
		sidemenu.classList.remove('open');
		panel.classList.remove('open');
	}
}