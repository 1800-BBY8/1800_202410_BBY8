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
	for (const el of document.getElementsByClassName('configure-list-link')) {
		el.href = `/lists/edit.html?id=${listData.id}`;
	}

	document.getElementById('start-trip-link').href = `/trip.html?id=${listData.id}`;
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

document.getElementById('list-search').addEventListener('input', (e) => {
	const _query = e.target.value;
	const query = typeof _query === 'string' ? _query.trim().toLowerCase() : '';

	for (const child of itemsContainer.children) {
		if (!child.classList.contains('each-item')) continue;

		const name = child.querySelector('.template-item-name')?.innerText?.toLowerCase() ?? '';

		const match = !query || name.includes(query);
		if (match) child.classList.remove('d-none');
		else child.classList.add('d-none');
	}
});
