import { createList } from './firestore-utils/list-helpers.js';
import { getItems, getItemRef } from './firestore-utils/item-helpers.js';

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

function renderSelectableItem(item, onToggle) {
	const frag = selectableItemTemplate.content.cloneNode(true);

	const name = frag.querySelector('.template-name');
	name.innerText = item.itemName;

	const selectCheck = frag.querySelector('.template-select');
	selectCheck.addEventListener('click', (e) => {
		onToggle(e.target.checked);
	});

	return frag;
}

async function handleAddItems() {
	const itemsToAdd = new Set();

	const res = await Swal.fire({
		titleText: 'Add Items',
		text: ' ',
		showConfirmButton: true,
		showCancelButton: true,
		preConfirm: (popup) => itemsToAdd,
		willOpen: () => Swal.showLoading(),
		didOpen: async (popup) => {
			const availableItems = await getItems();
			const itemElements = availableItems.map((v) =>
				renderSelectableItem(v, (checked) => {
					if (checked) itemsToAdd.add(v);
					else itemsToAdd.delete(v);
				}),
			);

			const container = document.createElement('div');
			container.style.maxHeight = '50vh';
			container.classList.add(
				'd-flex',
				'flex-column',
				'gap-2',
				'overflow-y-auto',
				'p-3',
				'border',
				'border-black',
				'rounded',
			);

			itemElements.forEach((v) => container.appendChild(v));
			Swal.getHtmlContainer().appendChild(container);
			Swal.hideLoading();
		},
	});

	if (!res.isConfirmed) return;

	const items = res.value;
	if (items) items.forEach((item) => renderItem({ quantity: 1, item }));
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
