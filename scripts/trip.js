import { getListWithResolvedItems } from './firestore-utils/list-helpers.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');

const tripNameHolder = document.getElementById('trip-name');
const tripPriceHolder = document.getElementById('trip-price');
const priceFormTemplate = document.getElementById('price-form-template');
const itemTemplate = document.getElementById('item-template');
const addItemButton = document.getElementById('add-item-button');
const itemsContainer = document.getElementById('items-container');

const priceFormatter = Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' });

const trip = {
	boughtItems: [],
};

let totalTaxRate = 0.12;
async function cacheTaxRate() {
	if (totalTaxRate) return;

	const bcTaxes = await fetch('https://api.salestaxapi.ca/v2/province/bc').then((v) => v.json());
	const rateTypes = bcTaxes.type.split(',');
	rateTypes.forEach((v) => (totalTaxRate += bcTaxes[v]));
}

function calculateTotal() {
	const subtotal = trip.boughtItems.reduce((acc, v) => {
		if (!v.boughtAtPrice) return acc;
		return acc + v.boughtAtPrice * v.quantity;
	}, 0);

	return subtotal + subtotal * totalTaxRate;
}

function updateTrip() {
	const total = calculateTotal();
	tripPriceHolder.innerText = priceFormatter.format(total);
}

function renderItem(listItem) {
	const { quantity: _quantity, item } = listItem;
	const quantity = parseInt(_quantity);
	const frag = itemTemplate.content.cloneNode(true);

	const name = frag.querySelector('.template-name');
	name.innerText = item.itemName;

	const qty = frag.querySelector('.template-quantity');
	qty.innerText = `${quantity}/${quantity}`;
	if (!quantity) qty.remove();

	const check = frag.querySelector('.template-select');
	check.addEventListener('change', async (e) => {
		const checked = e.target.checked;
		e.target.disabled = true;

		if (checked) {
			const priceDefinition = await promptForPrice(quantity);
			trip.boughtItems.push({ item, ...priceDefinition });
			check.indeterminate = priceDefinition.quantity < quantity;

			qty.innerText = `${quantity - priceDefinition.quantity}/${quantity}`;
		} else {
			const index = trip.boughtItems.findIndex((v) => v.item === item);
			trip.boughtItems.splice(index, 1);
			qty.innerText = `${quantity}/${quantity}`;
		}

		e.target.disabled = false;
		updateTrip();
	});

	itemsContainer.appendChild(frag);
}

async function promptForPrice(initQuantity = 1) {
	const frag = priceFormTemplate.content.cloneNode(true);

	const itemsBoughtInput = frag.querySelector('.template-items-bought-input');
	const eachPriceInput = frag.querySelector('.template-each-price-input');
	const unitAmountInput = frag.querySelector('.template-unit-amount-input');
	const unitTypeSelect = frag.querySelector('.template-unit-select');

	const refId = '_______promptFormContainer';
	const container = document.createElement('div');
	container.id = refId;

	itemsBoughtInput.value = initQuantity;

	const res = await Swal.fire({
		title: 'Price Definition',
		html: container.outerHTML,
		willOpen: (prompt) => {
			const container = prompt.querySelector(`#${refId}`);
			container.appendChild(frag);
		},
		preDeny: () => {
			console.log(parseInt(itemsBoughtInput.value));
			return { quantity: parseInt(itemsBoughtInput.value) };
		},
		preConfirm: () => {
			const quantity = parseInt(itemsBoughtInput.value);
			const boughtAtPrice = parseFloat(eachPriceInput.value);
			const unitAmount = parseFloat(unitAmountInput.value);
			const unitType = unitTypeSelect.value;

			if (isNaN(quantity) || isNaN(boughtAtPrice) || isNaN(unitAmount)) return { quantity };
			return { quantity, boughtAtPrice, boughtAtUnit: { unit: unitType, amount: unitAmount } };
		},
		showConfirmButton: true,
		showDenyButton: true,
		denyButtonText: 'Do Not Specify',
		confirmButtonText: 'Confirm',
	});

	const value = res.value ? res.value : {};
	if (!value.quantity || value.quantity < 1) value.quantity = initQuantity;

	return value;
}

async function setupTripFromList(list) {
	tripNameHolder.innerText = `${list.name} Trip`;
	for (const item of list.items) renderItem(item);
}

async function setupAnonTrip() {
	tripNameHolder.innerText = 'New Quick Trip';
}

async function setupTrip(id) {
	if (!id) return setupAnonTrip();

	const list = await getListWithResolvedItems(id);
	if (list) setupTripFromList(list);
	else setupAnonTrip();
}

// TODO allow for add custom item, and saved item

cacheTaxRate().then(() => setupTrip(id));
