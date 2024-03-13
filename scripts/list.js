const params = new URLSearchParams(location.search);
const id = Number.parseInt(params.get('id'));
console.log(id);

function exit() {
	location.assign('/lists.html');
}

if (Number.isNaN(id)) exit();
else {
	document.getElementById('configure-list-link').href = `/lists/edit.html?id=${id}`;

	// TODO display list items
}
