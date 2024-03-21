import { getList } from './firestore-utils/list-helpers.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');

const priceFormTemplate = document.getElementById('price-form-template');
const tripNameHolder = document.getElementById('trip-name');

const trip = {};

async function promptForPrice() {
	const frag = priceFormTemplate.content.cloneNode(true);

	const container = document.createElement('div');
	container.appendChild(frag);

	const priceDefinition = await Swal.fire({
		title: 'Price Definition',
		html: container.innerHTML,
		showConfirmButton: true,
		showDenyButton: true,
		denyButtonText: 'Ignore Price',
		confirmButtonText: 'Confirm',
	});
}

async function setupTripFromList(list) {
	tripNameHolder.innerText = `${list.name} Trip`;
}

async function setupAnonTrip() {
	tripNameHolder.innerText = 'New Quick Trip';
	promptForPrice();
}

async function setupTrip(id) {
	if (!id) return setupAnonTrip();

	const list = await getList(id);
	if (list) setupTripFromList(list);
	else setupAnonTrip();
}

setupTrip(id);
