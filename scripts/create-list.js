import { createList } from './firestore-utils/list-helpers.js';
import { getItemRef } from './firestore-utils/item-helpers.js';
import { promptForItems } from './popup-utils/item-prompt.js';

const itemTemplate = document.getElementById('initial-item-template');
const selectableItemTemplate = document.getElementById('selectable-item-template');
const initialItemsContainer = document.getElementById('initial-items-container');
const form = document.getElementById('create-list-form');
const submitBtn = document.getElementById('create-list-button');
const addItemBtn = document.getElementById('add-item-button');

async function handleSubmit(formData) {
	const name = formData.get('list-name');
	const description = formData.get('list-desc') ?? '';

	formData.delete('list-name');
	formData.delete('list-desc');

	const items = [];
	for (const [key, _quantity] of formData.entries()) {
		if (!key.startsWith('item_')) {
			console.warn(`Unknown field found on submission: "${key}"="${_quantity}"`);
			continue;
		}

		let quantity = parseInt(_quantity);
		if (isNaN(quantity)) quantity = 1;

		const itemId = key.split('_')[1];
		if (!itemId) return;
		items.push({ quantity, item: await getItemRef(itemId) });
	}

	await createList({ name, description, items });
}

function renderItem(listItem) {
	const { quantity, item } = listItem;

	const key = `item_${item.id}`;
	const frag = itemTemplate.content.cloneNode(true);

	const tracker = document.createElement('input');
	tracker.type = 'hidden';
	tracker.name = key;
	tracker.id = key;
	frag.firstElementChild.appendChild(tracker);

	const name = frag.querySelector('.template-name');
	name.innerText = item.itemName;

	const qt = frag.querySelector('.template-quantity');
	qt.innerText = quantity;

	const getQuantity = () => {
		const current = parseInt(qt.innerText);
		if (isNaN(current)) return 1;
		else return current;
	};

	const changeQuantityBy = (change) => {
		const newquantity = Math.min(999, Math.max(1, getQuantity() + change));
		qt.innerText = newquantity;
		tracker.value = newquantity;
	};

	changeQuantityBy(0);

	const decrButton = frag.querySelector('.template-quantity-decrement');
	decrButton.addEventListener('click', () => changeQuantityBy(-1));

	const incrButton = frag.querySelector('.template-quantity-increment');
	incrButton.addEventListener('click', () => changeQuantityBy(1));

	const deleteButton = frag.querySelector('.template-delete');
	deleteButton.addEventListener('click', () => tracker.parentNode.remove());

	initialItemsContainer.appendChild(frag);
}

async function handleAddItems() {
	const itemsToAdd = await promptForItems();
	if (itemsToAdd instanceof Set) itemsToAdd.forEach((item) => renderItem({ quantity: 1, item }));
}

function toggleButtons(enabled) {
	submitBtn.disabled = !enabled;
	addItemBtn.disabled = !enabled;
}

form.addEventListener('submit', async (e) => {
	e.preventDefault();

	toggleButtons(false);
	await handleSubmit(new FormData(e.target));
	toggleButtons(true);

	location.assign('/lists');
});

addItemBtn.addEventListener('click', async () => {
	toggleButtons(false);
	await handleAddItems();
	toggleButtons(true);
});
