/// <reference path="../firebaseAPI_BBY8.js" />

export async function getTrips() {
	const collection = await getUserCollection(CollectionKeys.USER_TRIPS);
	const documents = (await collection.get()).docs;
	return documents.map((v) => ({ id: doc.id, ...doc.data() }));
}

export async function getTripRef(id) {
	const collection = await getUserCollection(CollectionKeys.USER_TRIPS);
	return collection.doc(id);
}

export async function getTrip(id) {
	const doc = await (await getTripRef(id)).get();
	if (!doc.exists) return;
	return { id, ...doc.data() };
}

export async function createTrip(data) {
	const tripRef = await getTripRef();
	await tripRef.set(data);
}
