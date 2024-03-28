getUserDocRef().then(async (ref) => {
	const doc = await ref.get();

	let name = doc.data().name;
	if (name.includes(' ')) name = name.split(' ')[0];
	document.getElementById('user-name-display').innerText = name;
});
