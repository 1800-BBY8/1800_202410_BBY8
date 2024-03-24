import { getItems } from '../firestore-utils/item-helpers.js';

const template = fetch('/scripts/skeletons/prompt-selectable-item.xml')
	.then((v) => v.text())
	.then((v) => {
		const template = document.createElement('template');
		template.innerHTML = v;
		return template;
	});

async function renderSelectableItem(item, onToggle) {
	const frag = (await template).content.cloneNode(true);

	const name = frag.querySelector('.template-name');
	name.innerText = item.itemName;

	const selectCheck = frag.querySelector('.template-select');
	selectCheck.addEventListener('click', (e) => onToggle(e.target.checked));

	return frag;
}

export async function promptForItems() {
	const itemsToAdd = new Set();

	const res = await Swal.fire({
		titleText: 'Add Items',
		html: ' ',
		showConfirmButton: true,
		showCancelButton: true,
		preConfirm: (popup) => itemsToAdd,
		willOpen: () => Swal.showLoading(),
		didOpen: async (popup) => {
			const availableItems = await getItems();

			const itemElements = await Promise.all(
				availableItems.map((v) =>
					renderSelectableItem(v, (checked) => {
						if (checked) itemsToAdd.add(v);
						else itemsToAdd.delete(v);
					}),
				),
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

	if (!res.isConfirmed) itemsToAdd.clear();
	return itemsToAdd;
}
