function fetchListData() {
	return new Promise((res) => {
		auth.onAuthStateChanged((user) => {
			if (!user) return res([]);
			res([
				{
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
				},
				{
					id: 1,
					name: 'Monthly',
					description: 'A list of items I buy on a monthly basis.',
					items: [
						{
							quantity: 2,
							item: {
								name: 'Toilet Paper',
								description: 'Cottonelle Ultra Comfort',
								category: 'Household',
								favorite: true,
								images: [
									'https://storage.googleapis.com/images-sofhttps://m.media-amazon.com/images/I/81RA3OuszZL._AC_SL1500_.jpg-prd-9fa6b8b.sof.prd.v8.commerce.mi9cloud.com/product-images/zoom/00068700011009.jpg',
								],
							},
						},
						{
							quantity: 10,
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
				},
			]);
		});
	});
}

function generateListElements(allListData) {
	const template = document.getElementById('list');
	const elements = [];

	const generateList = (listData) => {
		const frag = template.content.cloneNode(true);

		const name = frag.querySelector('.template-name');
		name.innerText = listData.name;

		const nItems = frag.querySelector('.template-n-items');
		nItems.innerText = listData.items.reduce((acc, v) => {
			return acc + v.quantity;
		}, 0);

		const desc = frag.querySelector('.template-desc');
		desc.innerText = listData.description;

		const link = frag.querySelector('.template-link');
		link.href = `/list.html?id=${listData.id}`;

		return frag;
	};

	for (const listData of allListData) {
		elements.push(generateList(listData));
	}

	return elements;
}

fetchListData().then((listsData) => {
	const elements = generateListElements(listsData);
	const container = document.getElementById('lists');
	for (const el of elements) container.appendChild(el);

	if (elements.length === 0) document.getElementById('no-list-display').classList.remove('d-none');
});
