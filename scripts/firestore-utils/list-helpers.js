/// <reference path="../firebaseAPI_BBY8.js" />

export async function getLists() {
	const collection = await getUserCollection(CollectionKeys.USER_LISTS);
	const documents = (await collection.get()).docs;
	return documents.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getListRef(id) {
	const collection = await getUserCollection(CollectionKeys.USER_LISTS);
	return collection.doc(id);
}

export async function getList(id) {
	const doc = await (await getListRef(id)).get();
	if (!doc.exists) return;
	return { id, ...doc.data() };
}

export async function resolveListItemEntry(itemEntry) {
	const { quantity, item: docRef } = itemEntry;
	const doc = await docRef.get();
	if (!doc.exists) return;

	return { quantity, item: { id: docRef.id, ...doc.data() } };
}

export async function getListWithResolvedItems(id) {
	const list = await getList(id);
	if (!list) return;

	const items = [];
	await Promise.all(
		list.items.map(async (itemEntry) => {
			const resolved = await resolveListItemEntry(itemEntry);
			if (resolved) items.push(resolved);
		}),
	);

	return { ...list, items };
}

export async function createList(data) {
	const docRef = await getListRef();
	await docRef.set({ ...data, createdAt: new Date().getTime() });
}

export async function updateList(id, data) {
	const docRef = await getListRef(id);
	await docRef.update(data);
}

export async function deleteList(id) {
	const docRef = await getListRef(id);
	await docRef.delete();
}
