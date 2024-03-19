const template = document.getElementById('initial-item-template');
const initialItemsContainer = document.getElementById('initial-items-container');
const form = document.getElementById('create-list-form');

let submitting = false;
async function createList(submitEvent) {
	submitEvent.preventDefault();
	if (submitting) return;
	submitting = true;

	const user = await getCurrentUser();
	const data = new FormData(submitEvent.target);

	const name = data.get('list-name');
	const desc = data.get('list-desc') ?? '';

	data.delete('list-name');
	data.delete('list-desc');

	const currentUserDocRef = await getCurrentUserDocRef();
	const itemsCollectionRef = currentUserDocRef.collection(CollectionKeys.USER_ITEMS);

	const items = [];
	for (const [key, quantity] of data.entries()) {
		if (!key.startsWith('item_')) {
			console.warn(`Unknown field found on submission: "${key}"="${quantity}"`);
			continue;
		}

		const itemId = key.split('_')[1];
		items.push({ quantity: quantity, item: itemsCollectionRef.doc(itemId) });
	}

	const currentListDocumentRef = currentUserDocRef.collection(CollectionKeys.USER_LISTS).doc();
	await currentListDocumentRef.set({
		name,
		description: desc,
		items,
	});

	submitting = false;
	location.assign('/lists');
}

async function fetchItem(itemId) {
	const currentUserDoc = await getCurrentUserDocRef();
	const itemsCollectionRef = currentUserDoc.collection(CollectionKeys.USER_ITEMS);
	return await itemsCollectionRef.doc(`${itemId}`).get();
}

let adding = false;
async function addItem(itemId) {
	if (adding) return;
	adding = true;

	const key = `item_${itemId}`;
	const data = await fetchItem(itemId);
	const frag = template.content.cloneNode(true);

	const tracker = document.createElement('input');
	tracker.type = 'hidden';
	tracker.name = key;
	tracker.id = key;
	frag.firstElementChild.appendChild(tracker);

	const name = frag.querySelector('.template-name');
	name.innerText = data.name;

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
	adding = false;
}

form.addEventListener('submit', (e) => createList(e));
