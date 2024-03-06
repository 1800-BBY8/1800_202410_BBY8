const params = new URLSearchParams(location.search);
const id = Number.parseInt(params.get('id'));
console.log(id);

function exit() {
	location.assign('/lists.html');
}

if (Number.isNaN(id)) exit();
else {
	// TODO display list items
}
