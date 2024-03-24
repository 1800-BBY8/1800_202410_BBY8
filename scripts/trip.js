import { getListRef, getListWithResolvedItems } from './firestore-utils/list-helpers.js';
import { createTrip } from './firestore-utils/trip-helpers.js';
import { promptForItems } from './popup-utils/item-prompt.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');

const tripNameHolder = document.getElementById('trip-name');
const tripTotalBreakdownHolder = document.getElementById('trip-total-breakdown');
const pricePopupTemplate = document.getElementById('price-popup-template');
const itemTemplate = document.getElementById('item-template');
const itemsContainer = document.getElementById('items-container');
const addItemsButton = document.getElementById('add-items-button');
const addTempItemsButton = document.getElementById('add-temp-items-button');
const finishTripButton = document.getElementById('finish-trip-button');
const cancelTripButton = document.getElementById('cancel-trip-button');

const tripInfo = {
	boughtItems: [],
	total: {
		complete: 0,
		categorical: new Map(),
	},
};

let taxRates = [
	['pst', 0.07],
	['gst', 0.05],
];

async function getTaxRates() {
	if (taxRates.length !== 0) return taxRates;

	const bcTaxes = await fetch('https://api.salestaxapi.ca/v2/province/bc').then((v) => v.json());
	const rateTypes = bcTaxes.type.split(',');
	rateTypes.forEach((v) => taxRates.push([v, bcTaxes[v]]));
}

function updateTripTotals() {
	let completeTotal = 0;
	const categoricalTotals = new Map();

	for (const priceDescriptor of tripInfo.boughtItems) {
		const quantity = priceDescriptor.quantity;
		const price = priceDescriptor.boughtAtPrice;

		if (!Number.isInteger(quantity) || typeof price !== 'number') continue;

		const totalPrice = price * quantity;
		completeTotal += totalPrice;

		const category = priceDescriptor.item.category;
		if (typeof category !== 'string') continue;

		let categoryTotal = categoricalTotals.get(category) ?? 0;
		categoryTotal += totalPrice;
		categoricalTotals.set(category, categoryTotal);
	}

	tripInfo.total.complete = completeTotal;
	tripInfo.total.categorical = categoricalTotals;
}

async function displayTripTotal() {
	const priceFormatter = Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD' });
	const percFormatter = Intl.NumberFormat('en-US', { style: 'percent' });

	tripTotalBreakdownHolder.innerHTML = '';
	updateTripTotals();

	const getBreakdownElement = (key, amount) => {
		const container = document.createElement('li');
		const priceText = document.createElement('span');

		container.classList.add('d-flex', 'gap-3', 'justify-content-between');

		container.innerText = `${key}: `;
		priceText.innerText = priceFormatter.format(amount);

		container.appendChild(priceText);
		return container;
	};

	let total = tripInfo.total.complete;
	const nItems = tripInfo.boughtItems.reduce((acc, v) => acc + v.quantity, 0);
	tripTotalBreakdownHolder.append(
		getBreakdownElement(`Subtotal (${nItems} item${nItems === 1 ? '' : 's'})`, total),
	);

	let totalTax = 0;
	for (const [taxKey, taxRate] of await getTaxRates()) {
		const taxAmount = total * taxRate;

		tripTotalBreakdownHolder.append(
			getBreakdownElement(`${taxKey.toUpperCase()} (${percFormatter.format(taxRate)})`, taxAmount),
		);

		totalTax += taxAmount;
	}

	tripTotalBreakdownHolder.append(getBreakdownElement('Total', total + totalTax));
}

function renderItem(listItem) {
	const { quantity: _quantity, item } = listItem;
	const quantity = parseInt(_quantity);
	const frag = itemTemplate.content.cloneNode(true);

	const name = frag.querySelector('.template-name');
	name.innerText = item.itemName;

	const qty = frag.querySelector('.template-quantity');
	const useQuantityNeeded = Number.isInteger(quantity);

	function setPurchased(purchased) {
		purchased = Number.isInteger(purchased) ? purchased : 0;

		qty.innerText = purchased;
		if (useQuantityNeeded) qty.innerText += `/${quantity}`;
	}

	setPurchased(0);

	const check = frag.querySelector('.template-select');
	check.addEventListener('change', async (e) => {
		const checked = e.target.checked;
		e.target.disabled = true;

		if (checked) {
			const priceDefinition = await promptForQuantityAndPrice(quantity);
			if (!priceDefinition) e.target.checked = false;
			else {
				// TODO will this work when multiple of same item on list?
				tripInfo.boughtItems.push({ item, ...priceDefinition });
				check.indeterminate = priceDefinition.quantity < quantity;
				setPurchased(priceDefinition.quantity);
			}
		} else {
			const index = tripInfo.boughtItems.findIndex((v) => v.item === item);
			tripInfo.boughtItems.splice(index, 1);
			setPurchased(0);
		}

		e.target.disabled = false;
		displayTripTotal();
	});

	itemsContainer.appendChild(frag);
}

async function promptForQuantityAndPrice(initQuantity) {
	if (!initQuantity || !Number.isInteger(initQuantity)) initQuantity = 1;

	const frag = pricePopupTemplate.content.cloneNode(true);

	const eachPriceInput = frag.querySelector('.template-each-price-input');
	const unitAmountInput = frag.querySelector('.template-unit-amount-input');
	const unitTypeSelect = frag.querySelector('.template-unit-select');

	const quantityRes = await Swal.fire({
		title: 'Confirm Amount',
		input: 'number',
		inputValue: initQuantity,
		inputPlaceholder: 'Please enter the amount your are purchasing',
		inputAttributes: { min: 1, step: 1 },
		showConfirmButton: true,
		showCancelButton: true,
		confirmButtonText: 'Save',
		cancelButtonText: 'Cancel',
		customClass: {
			confirmButton: 'btn btn-success',
			cancelButton: 'btn btn-danger',
		},
		willOpen: () => {
			const input = Swal.getInput();
			input.required = true;
			input.min = 1;
			input.step = 1;
		},
		preConfirm: () => {
			const input = Swal.getInput();
			const quantity = parseInt(input.value);

			if (!Number.isInteger(quantity) || quantity < 1) {
				Swal.showValidationMessage('Amount purchased must be a number over one!');
				return false;
			}

			return quantity;
		},
	});

	if (!quantityRes.isConfirmed) return;
	const quantity = quantityRes.value;

	const priceRes = await Swal.fire({
		title: 'Price Breakdown',
		html: ' ',
		showConfirmButton: true,
		showCancelButton: true,
		confirmButtonText: 'Save',
		cancelButtonText: 'Do Not Specify',
		customClass: {
			confirmButton: 'btn btn-success',
			cancelButton: 'btn btn-danger',
		},
		willOpen: (prompt) => Swal.getHtmlContainer().appendChild(frag),
		preConfirm: () => {
			let boughtAtPrice = parseFloat(eachPriceInput.value);
			let unitAmount = parseFloat(unitAmountInput.value);
			if (isNaN(boughtAtPrice) || boughtAtPrice < 0) {
				Swal.showValidationMessage('Per item price must be at least zero!');
				eachPriceInput.classList.add('is-invalid');
				return false;
			} else eachPriceInput.classList.remove('is-invalid');

			if (isNaN(unitAmount) || unitAmount < 0) {
				Swal.showValidationMessage('Unit amount must be at least zero!');
				unitAmountInput.classList.add('is-invalid');
				return false;
			} else unitAmountInput.classList.remove('is-invalid');

			return { boughtAtPrice, unitAmount };
		},
	});

	if (!priceRes.isConfirmed) return { quantity };

	const { boughtAtPrice, unitAmount } = priceRes.value;
	const unit = unitTypeSelect.value;

	return { quantity, boughtAtPrice, boughtAtUnit: { unit, amount: unitAmount } };
}

function exit() {
	if (id) location.assign(`/lists/list.html?id=${id}`);
	else location.assign('/lists');
}

async function endTrip() {
	const infoToSave = {};
	infoToSave.boughtItems = tripInfo.boughtItems;

	if (id) infoToSave.initiateListId = id;

	const categoryTotals = [];
	tripInfo.total.categorical.forEach((total, category) => categoryTotals.push({ category, total }));

	infoToSave.completeTotal = tripInfo.total.complete;
	infoToSave.categoryTotals = categoryTotals;

	if (infoToSave.boughtItems.length > 0) {
		await createTrip(infoToSave);
	}

	exit();
}

async function addItems(custom) {
	const itemsToAdd = await promptForItems(custom);
	itemsToAdd.forEach((item) => renderItem({ item }));
}

async function setupTripFromList(list) {
	tripNameHolder.innerText = `${list.name} Trip`;
	for (const listItem of list.items) renderItem(listItem);
}

async function setupAnonTrip() {
	tripNameHolder.innerText = 'New Quick Trip';
}

function toggleButtons(enabled) {
	addItemsButton.disabled = !enabled;
	finishTripButton.disabled = !enabled;
}

async function setupTrip(id) {
	if (!id) setupAnonTrip();
	else {
		const list = await getListWithResolvedItems(id);
		if (list) await setupTripFromList(list);
		else setupAnonTrip();
	}

	displayTripTotal();
	addItemsButton.addEventListener('click', () => addItems());
	addTempItemsButton.addEventListener('click', () => addItems(true));
	cancelTripButton.addEventListener('click', exit);
	finishTripButton.addEventListener('click', async () => {
		toggleButtons(false);
		await endTrip();
		toggleButtons(true);
	});
}

// TODO allow for add custom item, and saved item
getTaxRates().then(() => setupTrip(id));
