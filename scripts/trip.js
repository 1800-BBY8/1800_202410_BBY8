import { getList } from './firestore-utils/list-helpers.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');

const priceFormTemplate = document.getElementById('price-form-template');
const tripNameHolder = document.getElementById('trip-name');

const trip = {};

async function promptForPrice() {
	const frag = priceFormTemplate.content.cloneNode(true);

	let useUnit = false;
	const itemsBoughtInput = frag.querySelector('.template-items-bought-input');
	const itemPriceInput = frag.querySelector('.template-item-price-input');
	const unitCheck = frag.querySelector('.template-specify-unit-check');
	const unitFieldset = frag.querySelector('.template-unit-fieldset');
	const unitPriceInput = frag.querySelector('.template-unit-price-input');
	const unitAmountInput = frag.querySelector('.template-unit-amount-input');
	const unitSelect = frag.querySelector('.template-unit-select');

	unitCheck.addEventListener('change', (e) => {
		const checked = e.target.checked;
		unitFieldset.disabled = !checked;
		useUnit = checked;
	});

	const refId = '_______promptFormContainer';
	const container = document.createElement('div');
	container.id = refId;

	const res = await Swal.fire({
		title: 'Price Definition',
		html: container.outerHTML,
		willOpen: (prompt) => {
			const container = prompt.querySelector(`#${refId}`);
			container.appendChild(frag);
		},
		preConfirm: () => {
			const quantity = parseInt(itemsBoughtInput.value);
			const eachPrice = parseFloat(itemPriceInput.value);
			if (isNaN(quantity) || isNaN(eachPrice)) return;

			const res = { quantity, eachPrice };
			if (!useUnit) return res;

			const unitPrice = parseFloat(unitPriceInput.value);
			const unitAmount = parseFloat(unitAmountInput.value);
			const unit = unitSelect.value;
			if (isNaN(unitPrice) || isNaN(unitAmount)) return res;

			res.unit = { unitPrice, unitAmount, unit };

			return res;
		},
		showConfirmButton: true,
		showDenyButton: true,
		denyButtonText: 'Ignore Price',
		confirmButtonText: 'Confirm',
	});

	return res.value;
}

async function setupTripFromList(list) {
	tripNameHolder.innerText = `${list.name} Trip`;
}

async function setupAnonTrip() {
	tripNameHolder.innerText = 'New Quick Trip';
	// TODO test
	const priceDefinition = await promptForPrice();
}

async function setupTrip(id) {
	if (!id) return setupAnonTrip();

	const list = await getList(id);
	if (list) setupTripFromList(list);
	else setupAnonTrip();
}

setupTrip(id);
