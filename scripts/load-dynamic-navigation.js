function fillDynamicsInNavigation(el) {
	const path = window.location.pathname;

	const titleEl = el.querySelector('[data-fillwith=navbar-title]');
	if (titleEl) titleEl.innerText = document.title;

	const activeA = el.querySelector(`a[href="${location.pathname}"].nav-link`);
	if (activeA) activeA.classList.add('active');
}

(async () => {
	const container = document.getElementById('navigation-placeholder');
	if (!container) return console.warn('Dynamic navigation script loaded, but no placeholder found.');

	await fetch('/skeletons/navigation.xml')
		.then((v) => v.text())
		.then((v) => {
			const next = container.nextElementSibling;
			container.outerHTML = v;
			fillDynamicsInNavigation(next.previousElementSibling);
		});
})();
