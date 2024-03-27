/// <reference path="../firebaseAPI_BBY8.js" />

import { getItems } from '../firestore-utils/item-helpers.js';

const template = fetch('/scripts/skeletons/prompt-selectable-item.xml')
	.then((v) => v.text())
	.then((v) => {
		const template = document.createElement('template');
		template.innerHTML = v;
		return template;
	});

const editableTemplate = fetch('/scripts/skeletons/prompt-editable-selectable-item.xml')
	.then((v) => v.text())
	.then((v) => {
		const template = document.createElement('template');
		template.innerHTML = v;
		return template;
	});

async function renderTempItem(itemRef, onToggle) {
	const frag = (await editableTemplate).content.cloneNode(true);

	const name = frag.querySelector('.template-name');
	const category = frag.querySelector('.template-category');

	name.addEventListener('change', () => {
		let value = name.value.trim();
		if (!value) value = 'Temporary Item';
		itemRef.itemName = value;
	});

	category.addEventListener('change', () => {
		const value = category.value;
		itemRef.category = value;
	});

	ITEM_CATEGORIES.forEach((v, i) => {
		const option = document.createElement('option');
		option.innerText = v;
		option.value = v;
		if (i === 0) option.selected = true;
		category.appendChild(option);
	});

	const selectCheck = frag.querySelector('.template-select');
	selectCheck.addEventListener('click', (e) => {
		const checked = e.target.checked;

		const nameValue = name.value.trim();
		if (!nameValue) {
			name.classList.add('is-invalid');
			e.target.checked = false;
			return;
		} else name.classList.remove('is-invalid');

		onToggle(checked);
	});

	return frag;
}

async function renderItem(item, onToggle) {
	const frag = (await template).content.cloneNode(true);

	const name = frag.querySelector('.template-name');
	name.innerText = item.itemName;

	const selectCheck = frag.querySelector('.template-select');
	selectCheck.addEventListener('click', (e) => onToggle(e.target.checked));

	return frag;
}

export async function promptForItems(temporaryItems = false, multiSelect = true) {
	const itemsToAdd = new Set();

	const res = await Swal.fire({
		titleText: `Select ${multiSelect ? 'Items' : 'Item'}`,
		html: ' ',
		showConfirmButton: true,
		showCancelButton: true,
		confirmButtonText: 'Add Selected',
		customClass: {
			confirmButton: 'btn btn-success',
			cancelButton: 'btn btn-danger',
		},
		preConfirm: (popup) => itemsToAdd,
		willOpen: () => {
			Swal.showLoading();
			if (multiSelect === false) {
				Swal.getConfirmButton().style.display = 'none';
			}
		},
		didOpen: async (popup) => {
			const onItemToggle = (item, checked) => {
				if (checked) itemsToAdd.add(item);
				else itemsToAdd.delete(item);

				if (multiSelect === false) {
					Swal.getConfirmButton().click();
				}
			};

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

			if (temporaryItems) {
				const addBtn = document.createElement('button');
				addBtn.classList.add('btn', 'btn-primary');
				addBtn.innerText = '+ New Temporary Item';
				if (multiSelect === false) addBtn.style.display = 'none';

				const addTemporaryItem = async () => {
					const newItem = { temporary: true };
					const itemElement = await renderTempItem(newItem, (v) => onItemToggle(newItem, v));
					container.insertBefore(itemElement, addBtn);
				};

				addBtn.addEventListener('click', addTemporaryItem);
				container.appendChild(addBtn);

				addTemporaryItem();
			} else {
				const availableItems = await getItems();
				const itemElements = await Promise.all(
					availableItems.map((v) => renderItem(v, (checked) => onItemToggle(v, checked))),
				);

				itemElements.forEach((v) => container.appendChild(v));
			}

			Swal.getHtmlContainer().appendChild(container);
			Swal.hideLoading();
		},
	});

	if (!res.isConfirmed) itemsToAdd.clear();

	if (multiSelect === false) {
		for (const item of itemsToAdd) {
			if (item) return item;
		}
	} else return itemsToAdd;
}
