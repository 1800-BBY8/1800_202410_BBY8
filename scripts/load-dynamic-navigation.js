function fillDynamicsInNavigation(el) {
	const titleEl = el.querySelector('[data-fillwith=navbar-title]');
	if (titleEl) titleEl.innerText = document.title;

	const activeA = el.querySelector(`a[href="${location.pathname}"].nav-link`);
	console.log(location.pathname);
	if (activeA) activeA.classList.add('active');

	const backButton = el.querySelector('.nav-back-btn');
	backButton.addEventListener('click', goBack);
	backButton.classList.toggle('d-none', location.pathname === '/main.html');
}

function canGoBack() {
	if (!document.referrer) return false;
	const url = new URL(document.referrer);
	return url.host === location.host;
}

function goBack() {
	if (!canGoBack()) location.assign('main.html');
	else history.back();
}

async function renderNavigation() {
	const container = document.getElementById('navigation-placeholder');
	if (!container) return console.warn('Dynamic navigation script loaded, but no placeholder found.');

	const fragment = await fetch('/scripts/skeletons/navigation.xml').then((v) => v.text());

	const next = container.nextElementSibling;
	container.outerHTML = fragment;
	fillDynamicsInNavigation(next.previousElementSibling);
}

renderNavigation();
