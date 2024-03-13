const template = document.getElementById('initial-item-template');
const initialItemsContainer = document.getElementById('initial-items-container');
const form = document.getElementById('edit-list-form');

function updateList(submitEvent) {
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
		items.push({ quantity: quantity, item });
	}

	console.log(name, desc, items);

	// TODO post data to firestore
	location.assign('/lists');
}

function fetchListData(listId) {
	return new Promise((res) => {
		auth.onAuthStateChanged((user) => {
			if (!user) return res();
			if (listId === 0) {
				return res({
					id: 0,
					name: 'Weekly',
					description: 'A list of items I buy on a weekly basis.',
					items: [
						{
							quantity: 1,
							item: {
								name: 'Milk',
								description: 'Dairyland 3.25% Homogenized Whole Milk',
								category: 'Dairy',
								favorite: false,
								images: [
									'https://storage.googleapis.com/images-sof-prd-9fa6b8b.sof.prd.v8.commerce.mi9cloud.com/product-images/zoom/00068700011009.jpg',
								],
							},
						},
						{
							quantity: 24,
							item: {
								name: 'Eggs',
								description: 'Kirkland Signature Large Organic Eggs',
								category: 'Dairy',
								favorite: false,
								images: [
									'https://images.costcobusinessdelivery.com/ImageDelivery/imageService?profileId=12027981&itemId=313963&recipeName=680',
								],
							},
						},
						{
							quantity: 4,
							item: {
								name: 'Sourdough',
								description: 'Portofino Sourdough Loaf',
								category: 'Carbohydrates',
								favorite: true,
								images: [
									'https://portofino-assets-uat-kor.s3.ca-central-1.amazonaws.com/productImages/_576x864_crop_center-center_none/Artisan_Sourdough_2624_Brighter.jpg',
								],
							},
						},
						{
							quantity: 2,
							item: {
								name: 'Butter',
								description: 'Natrel unsalted butter',
								category: 'Dairy',
								favorite: false,
								images: [
									'https://images.costcobusinessdelivery.com/ImageDelivery/imageService?profileId=12027981&itemId=373323&recipeName=680g',
								],
							},
						},
						{
							quantity: 230,
							item: {
								name: 'Tangfastics',
								description: 'Haribo Tangfastics sour gummies',
								category: 'Snacks',
								favorite: true,
								images: [
									'https://assets.haribo.com/image/upload/s--Qc0ASyuc--/ar_1793:2530,c_fill,f_auto,q_60/w_725/v1/consumer-sites/en-gb/142102-E-Tangfastics-175g.png',
								],
							},
						},
					],
				});
			} else res();
		});
	});
}

async function addItem(listItem) {
	const { quantity, item: data } = listItem;

	const key = `item_${data.id}`;
	const frag = template.content.cloneNode(true);

	const tracker = document.createElement('input');
	tracker.type = 'hidden';
	tracker.name = key;
	tracker.id = key;
	frag.firstElementChild.appendChild(tracker);
	``;
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

function fillFields(data) {
	const name = document.querySelector('#list-name');
	name.value = data.name;

	const desc = document.querySelector('#list-desc');
	desc.value = data.description ?? '';

	for (const item of data.items) addItem(item);
}

const params = new URLSearchParams(location.search);
const id = Number.parseInt(params.get('id'));

function exit() {
	location.assign('/lists');
}

if (Number.isNaN(id)) exit();
else {
	fetchListData(id).then((data) => {
		if (!data) return exit();

		fillFields(data);
		form.addEventListener('submit', (e) => updateList(e));
	});
}
