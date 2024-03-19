async function fetchLists() {
	const userDoc = await getCurrentUserDocRef();
	const rawLists = await userDoc.collection(CollectionKeys.USER_LISTS).get();

	return rawLists.docs.map((list) => ({ id: list.id, ...list.data() }));
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
			return acc + parseInt(v.quantity);
		}, 0);

		const desc = frag.querySelector('.template-desc');
		desc.innerText = listData.description;

		const link = frag.querySelector('.template-link');
		const url = new URL(link.href);
		url.searchParams.append('id', listData.id);
		link.href = url.pathname + url.search;

		return frag;
	};

	for (const listData of allListData) {
		elements.push(generateList(listData));
	}

	return elements;
}

fetchLists().then((listsData) => {
	const elements = generateListElements(listsData);
	const container = document.getElementById('lists');
	for (const el of elements) container.appendChild(el);

	if (elements.length === 0) document.getElementById('no-list-display').classList.remove('d-none');
});
