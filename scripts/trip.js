import { getListWithResolvedItems } from './firestore-utils/list-helpers.js';
import { promptForItems } from './popup-utils/item-prompt.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');

const tripNameHolder = document.getElementById('trip-name');
const tripPriceHolder = document.getElementById('trip-price');
const pricePopupTemplate = document.getElementById('price-popup-template');
const itemTemplate = document.getElementById('item-template');
const addItemsButton = document.getElementById('add-items-button');
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
				trip.boughtItems.push({ item, ...priceDefinition });
				check.indeterminate = priceDefinition.quantity < quantity;
				setPurchased(priceDefinition.quantity);
			}
		} else {
			const index = trip.boughtItems.findIndex((v) => v.item === item);
			trip.boughtItems.splice(index, 1);
			setPurchased(0);
		}

		e.target.disabled = false;
		updateTrip();
	});

	itemsContainer.appendChild(frag);
}

async function promptForQuantityAndPrice(initQuantity = 1) {
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

async function addItems() {
	const itemsToAdd = await promptForItems();
	itemsToAdd.forEach((item) => renderItem({ item }));
}

async function setupTripFromList(list) {
	tripNameHolder.innerText = `${list.name} Trip`;
	for (const listItem of list.items) renderItem(listItem);
}

async function setupAnonTrip() {
	tripNameHolder.innerText = 'New Quick Trip';
}

async function setupTrip(id) {
	if (!id) setupAnonTrip();
	else {
		const list = await getListWithResolvedItems(id);
		if (list) await setupTripFromList(list);
		else setupAnonTrip();
	}

	addItemsButton.addEventListener('click', () => addItems());
}

// TODO allow for add custom item, and saved item

cacheTaxRate().then(() => setupTrip(id));
