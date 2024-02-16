const footer = document.getElementById('interactive-footer');

const toggle = (force) => {
	if (force === true) footer.classList.add('active');
	else if (force === false) footer.classList.remove('active');
	else footer.classList.toggle('active');
};

window.addEventListener(
	'click',
	(e) => {
		if (e.target === footer) toggle();
		else if (e.target.parentNode === footer) toggle();
		else if (footer.contains(e.target)) toggle(true);
		else toggle(false);
	},
	false,
);
