import { getList } from './firestore-utils/list-helpers.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');

const tripNameHolder = document.getElementById('trip-name');
const priceFormTemplate = document.getElementById('price-form-template');
const itemTemplate = document.getElementById('item-template');
const addItemButton = document.getElementById('add-item-button');
const itemsContainer = document.getElementById('items-container');

const trip = {};

function renderItem(itemData) {
	const frag = itemTemplate.content.cloneNode(true);

	const name = frag.querySelector('.template-name');
	name.innerText = itemData.itemName;

	const qty = frag.querySelector('.template-quantity');
	qty.innerText = itemData.quantity;

	// TODO checkmark

	itemsContainer.appendChild(frag);
}

async function promptForPrice() {
	const frag = priceFormTemplate.content.cloneNode(true);

	const itemsBoughtInput = frag.querySelector('.template-items-bought-input');
	const eachPriceInput = frag.querySelector('.template-each-price-input');
	const unitAmountInput = frag.querySelector('.template-unit-amount-input');
	const unitTypeSelect = frag.querySelector('.template-unit-select');

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
			const boughtAtPrice = parseFloat(eachPriceInput.value);
			const unitAmount = parseFloat(unitAmountInput.value);
			const unitType = unitTypeSelect.value;

			if (isNaN(quantity) || isNaN(boughtAtPrice) || isNaN(unitAmount)) return;
			return { quantity, boughtAtPrice, boughtAtUnit: { unit: unitType, amount: unitAmount } };
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
	for (const item of list.items) renderItem(item);
}

async function setupAnonTrip() {
	tripNameHolder.innerText = 'New Quick Trip';
	// TODO test
	const priceDefinition = await promptForPrice();
	console.log(priceDefinition);
}

async function setupTrip(id) {
	if (!id) return setupAnonTrip();

	const list = await getList(id);
	if (list) setupTripFromList(list);
	else setupAnonTrip();
}

setupTrip(id);
