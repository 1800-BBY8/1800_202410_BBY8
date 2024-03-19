/// <reference path="firebaseAPI_BBY8.js" />

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

function populateData(listData) {
	document.getElementById('configure-list-link').href = `/lists/edit.html?id=${listData.id}`;
	document.getElementById('list-name').innerText = listData.name;
	document.getElementById('list-description').innerText = listData.description;
	document.getElementById('list-n-items').innerText = listData.items.length;

	listData.items.forEach(async (itemDoc) => {
		const quantity = itemDoc.quantity;
		const item = await itemDoc.item.get();
		if (item.exists) renderItem({ quantity, item: item.data() });
	});
}

async function fetchList(id) {
	const listsCollection = await getUserCollection(CollectionKeys.USER_LISTS);
	const list = await listsCollection.doc(id).get();
	return list.data();
}

function exit() {
	location.assign('/lists');
}

if (!id) exit();
else {
	fetchList(id).then((list) => {
		if (!list) return exit();
		else populateData({ id, ...list });
	});
}
