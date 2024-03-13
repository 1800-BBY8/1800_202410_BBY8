const template = document.getElementById('initial-item-template');
const initialItemsContainer = document.getElementById('initial-items-container');
const form = document.getElementById('create-list-form');

function createList(submitEvent) {
	submitEvent.preventDefault();

	const data = new FormData(submitEvent.target);

	const name = data.get('list-name');
	const desc = data.get('list-desc') ?? '';

	data.delete('list-name');
	data.delete('list-desc');

	const items = [];
	for (const [key, quantity] of data.entries()) {
		if (!key.startsWith('item_')) {
			console.warn(`Unknown field found on submission: "${key}"="${quantity}"`);
			continue;
		}

		const item = key.split('_')[1];
		items.push({ amount: quantity, item });
	}

	console.log(name, desc, items);

	// TODO post data to firestore
	location.assign('/lists');
}

async function fetchItem(itemId) {
	return {
		name: 'Toilet Paper',
		description: 'Cottonelle Ultra Comfort',
		category: 'Household',
		favorite: true,
		images: [
			'https://storage.googleapis.com/images-sofhttps://m.media-amazon.com/images/I/81RA3OuszZL._AC_SL1500_.jpg-prd-9fa6b8b.sof.prd.v8.commerce.mi9cloud.com/product-images/zoom/00068700011009.jpg',
		],
	};
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

	const amnt = frag.querySelector('.template-amount');
	amnt.innerText = 1;

	const getAmount = () => {
		const current = parseInt(amnt.innerText);
		if (isNaN(current)) return 1;
		else return current;
	};

	const changeAmountBy = (change) => {
		const newAmount = Math.min(999, Math.max(1, getAmount() + change));
		amnt.innerText = newAmount;
		tracker.value = newAmount;
	};

	changeAmountBy(0);

	const decrButton = frag.querySelector('.template-amount-decrement');
	decrButton.addEventListener('click', () => changeAmountBy(-1));

	const incrButton = frag.querySelector('.template-amount-increment');
	incrButton.addEventListener('click', () => changeAmountBy(1));

	const deleteButton = frag.querySelector('.template-delete');
	deleteButton.addEventListener('click', () => tracker.parentNode.remove());

	initialItemsContainer.appendChild(frag);
	adding = false;
}

form.addEventListener('submit', (e) => createList(e));
