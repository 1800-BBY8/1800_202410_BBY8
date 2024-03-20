import { createList } from './firestore-utils/list-helpers.js';
import { getItem, getItemRef } from './firestore-utils/item-helpers.js';

const template = document.getElementById('initial-item-template');
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
	for (const [key, quantity] of formData.entries()) {
		if (!key.startsWith('item_')) {
			console.warn(`Unknown field found on submission: "${key}"="${quantity}"`);
			continue;
		}

		const itemId = key.split('_')[1];
		if (!itemId) return;
		items.push({ quantity: quantity, item: await getItemRef(itemId) });
	}

	await createList({ name, description, items });
}

async function handleAddItem(itemId) {
	const key = `item_${itemId}`;
	const data = await getItem(itemId);
	const frag = template.content.cloneNode(true);

	const tracker = document.createElement('input');
	tracker.type = 'hidden';
	tracker.name = key;
	tracker.id = key;
	frag.firstElementChild.appendChild(tracker);

	const name = frag.querySelector('.template-name');
	name.innerText = data.itemName;

	const qt = frag.querySelector('.template-quantity');
	qt.innerText = 1;

	const getQuantity = () => {
		const current = parseInt(qt.innerText);
		if (isNaN(current)) return 1;
		else return current;
	};

	const changeQuantity = (change) => {
		const newquantity = Math.min(999, Math.max(1, getQuantity() + change));
		qt.innerText = newquantity;
		tracker.value = newquantity;
	};

	changeQuantity(0);

	const decrButton = frag.querySelector('.template-quantity-decrement');
	decrButton.addEventListener('click', () => changeQuantity(-1));

	const incrButton = frag.querySelector('.template-quantity-increment');
	incrButton.addEventListener('click', () => changeQuantity(1));

	const deleteButton = frag.querySelector('.template-delete');
	deleteButton.addEventListener('click', () => tracker.parentNode.remove());

	initialItemsContainer.appendChild(frag);
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
	// TODO item select popup
	await handleAddItem('B1VDOzz1v5r18R03viJY');
	toggleButtons(true);
});
