import { getItem, getItemRef } from './firestore-utils/item-helpers.js';
import {
	deleteList,
	getList,
	getListWithResolvedItems,
	resolveListItemEntry,
	updateList,
} from './firestore-utils/list-helpers.js';
import { promptForItems } from './popup-utils/item-prompt.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');

const itemTemplate = document.getElementById('item-template');
const selectableItemTemplate = document.getElementById('selectable-item-template');
const initialItemsContainer = document.getElementById('items-container');
const form = document.getElementById('edit-list-form');

const saveBtn = document.getElementById('save-list-button');
const deleteBtn = document.getElementById('delete-list-button');
const addItemBtn = document.getElementById('add-item-button');

async function handleSubmit(data) {
	const name = data.get('list-name');
	const description = data.get('list-desc') ?? '';

	data.delete('list-name');
	data.delete('list-desc');

	const items = [];
	for (const [key, _quantity] of data.entries()) {
		if (!key.startsWith('item_')) {
			console.warn(`Unknown field found on submission: "${key}"="${_quantity}"`);
			continue;
		}

		let quantity = parseInt(_quantity);
		if (isNaN(quantity)) quantity = 1;

		const itemId = key.split('_')[1];
		items.push({ quantity, item: await getItemRef(itemId) });
	}

	await updateList(id, { name, description, items });
}

async function handleDelete(listId) {
	const confirmResult = confirm('Are you sure you want to delete this list?');
	if (!confirmResult) return false;

	await deleteList(id);
	return true;
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

async function handleAddNewItems() {
	const itemsToAdd = await promptForItems();
	itemsToAdd.forEach((item) => renderItem({ quantity: 1, item }));
}

function fillFields(data) {
	const name = document.querySelector('#list-name');
	name.value = data.name;

	const desc = document.querySelector('#list-desc');
	desc.value = data.description ?? '';

	for (const item of data.items) renderItem(item);
}

function backToLists() {
	location.assign('/lists');
}

function backToList() {
	location.assign(`/lists/list.html?id=${id}`);
}

function toggleButtons(enabled) {
	saveBtn.disabled = !enabled;
	deleteBtn.disabled = !enabled;
	addItemBtn.disabled = !enabled;
}

if (!id) backToLists();
else {
	toggleButtons(false);
	getListWithResolvedItems(id).then((data) => {
		if (!data) return backToLists();
		fillFields(data);
		toggleButtons(true);

		form.addEventListener('submit', async (e) => {
			e.preventDefault();

			toggleButtons(false);
			await handleSubmit(new FormData(e.target));
			toggleButtons(true);

			backToList();
		});

		addItemBtn.addEventListener('click', async () => {
			toggleButtons(false);
			await handleAddNewItems();
			toggleButtons(true);
		});

		deleteBtn.addEventListener('click', async () => {
			toggleButtons(false);
			const deleted = await handleDelete(id);
			toggleButtons(true);

			if (deleted) backToLists();
		});
	});
}
