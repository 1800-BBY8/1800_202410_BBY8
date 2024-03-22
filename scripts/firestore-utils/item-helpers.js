/// <reference path="../firebaseAPI_BBY8.js" />

export async function getItems() {
	const collection = await getUserCollection(CollectionKeys.USER_ITEMS);
	const documents = (await collection.get()).docs;
	return documents.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getItemRef(id) {
	const collection = await getUserCollection(CollectionKeys.USER_ITEMS);
	return collection.doc(id);
}

export async function getItem(id) {
	const doc = await (await getItemRef(id)).get();
	if (!doc.exists) return;
	return { id, ...doc.data() };
}

export async function createItem(data) {
	const docRef = await getItemRef();
	await docRef.set(data);
}

export async function updateItem(id, data) {
	const docRef = await getItemRef(id);
	await docRef.update(data);
}

export async function deleteItem(id) {
	const docRef = await getItemRef(id);
	await docRef.delete();
}
