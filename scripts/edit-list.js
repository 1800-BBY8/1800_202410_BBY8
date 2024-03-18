const template = document.getElementById('initial-item-template');
const initialItemsContainer = document.getElementById('initial-items-container');
const form = document.getElementById('edit-list-form');

let submitting = false;
async function updateList(submitEvent, listId) {
	submitEvent.preventDefault();
	if (submitting) return;
	submitting = true;

	const user = await getCurrentUser();
	const data = new FormData(submitEvent.target);

	const name = data.get('list-name');
	const desc = data.get('list-desc') ?? '';

	data.delete('list-name');
	data.delete('list-desc');

	const currentUserDoc = await getCurrentUserDocRef();
	const itemsCollectionRef = currentUserDoc.collection(CollectionKeys.USER_ITEMS);

	const items = [];
	for (const [key, quantity] of data.entries()) {
		if (!key.startsWith('item_')) {
			console.warn(`Unknown field found on submission: "${key}"="${quantity}"`);
			continue;
		}

		const itemId = key.split('_')[1];
		items.push({ quantity: quantity, item: itemsCollectionRef.doc(itemId) });
	}

	const currentListDocumentRef = currentUserDoc.collection(CollectionKeys.USER_LISTS).doc(`${listId}`);
	await currentListDocumentRef.update({
		name,
		description: desc,
		items,
	});

	submitting = false;
	location.assign('/lists');
}

async function fetchList(listId) {
	const userDoc = await getCurrentUserDocRef();
	const listDoc = await userDoc.collection(CollectionKeys.USER_LISTS).doc(`${listId}`).get();
	if (listDoc.exists) return listDoc.data();
}

async function fetchItem(itemId) {
	const currentUserDoc = await getCurrentUserDocRef();
	const itemsCollectionRef = currentUserDoc.collection(CollectionKeys.USER_ITEMS);
	return await itemsCollectionRef.doc(`${itemId}`).get();
}

function renderItem(listItem) {
	const { quantity, item: data } = listItem;

	const key = `item_${data.id}`;
	const frag = template.content.cloneNode(true);

	const tracker = document.createElement('input');
	tracker.type = 'hidden';
	tracker.name = key;
	tracker.id = key;
	frag.firstElementChild.appendChild(tracker);

	const name = frag.querySelector('.template-name');
	name.innerText = data.name;

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

let adding = false;
async function addItemById(itemId) {
	if (adding) return;
	adding = true;

	const data = await fetchItem(itemId);
	renderItem({ quantity: 0, item: data });
	adding = false;
}

function fillFields(data) {
	const name = document.querySelector('#list-name');
	name.value = data.name;

	const desc = document.querySelector('#list-desc');
	desc.value = data.description ?? '';

	for (const itemEntry of data.items) {
		itemEntry.item.get().then((itemDoc) => {
			renderItem({
				quantity: itemEntry.quantity,
				item: { id: itemDoc.id, ...itemDoc.data() },
			});
		});
	}
}

const params = new URLSearchParams(location.search);
const id = params.get('id');

function exit() {
	location.assign('/lists');
}

fetchList(id).then((data) => {
	if (!data) return exit();
	fillFields(data);
	form.addEventListener('submit', (e) => updateList(e, id));
});
