const params = new URLSearchParams(location.search);
const id = params.get('id');
console.log(id);

function exit() {
	location.assign('/lists');
}

document.getElementById('configure-list-link').href = `/lists/edit.html?id=${id}`;
