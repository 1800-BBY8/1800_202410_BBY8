import { getListWithResolvedItems } from './firestore-utils/list-helpers.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');

const itemsContainer = document.getElementById('list-items-container');
const itemTemplate = document.getElementById('item-template');

function renderItem(item) {
	const { quantity, item: data } = item;
	const frag = itemTemplate.content.cloneNode(true);

	frag.querySelector('.template-item-name').innerText = data.itemName;
	frag.querySelector('.template-item-quantity').innerText = quantity;

	itemsContainer.appendChild(frag);
}

function renderList(listData) {
	const editUrl = `/lists/edit.html?id=${listData.id}`;
	document.getElementById('configure-list-link').href = editUrl;
	document.getElementById('add-item-link').href = editUrl;
	document.getElementById('list-name').innerText = listData.name;
	document.getElementById('list-description').innerText = listData.description;
	document.getElementById('list-n-items').innerText = listData.items.length;

	if (listData.items.length === 0) document.getElementById('no-items-display').classList.remove('d-none');
	for (const item of listData.items) renderItem(item);
}

const exit = () => location.assign('/lists');
if (!id) exit();
else {
	getListWithResolvedItems(id).then((list) => {
		if (!list) return exit();
		else renderList(list);
	});
}
