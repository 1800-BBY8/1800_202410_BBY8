document.addEventListener('DOMContentLoaded', function () {
    const itemsContainer = document.getElementById('items-container');
    const emptyListPlaceholder = document.getElementById('empty-list-placeholder');

    // Fetch items from Firestore
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const userId = user.uid;

            firebase.firestore().collection('Users').doc(userId).collection('Items').get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        emptyListPlaceholder.style.display = 'block'; // Show empty list message
                        itemsContainer.style.display = 'none'; // Hide items container
                        return;
                    }

                    // Clear any existing items in the container
                    itemsContainer.innerHTML = '';

                    // Iterate over each item and create HTML elements
                    querySnapshot.forEach(doc => {
                        const itemData = doc.data();
                        const itemCard = document.createElement('div');
                        itemCard.classList.add('card');
                        itemCard.innerHTML = `
                            <div class="card-body">
                                <h5 class="card-title">${itemData.itemName}${itemData.isFavorite ? '💖' : ''}</h5>
                                <p class="card-text">Category: ${itemData.category}</p>
                                <p class="card-text">${itemData.description}</p>
                                <button class="btn btn-primary btn-edit" data-id="${doc.id}">📝</button>
                                <button class="btn btn-danger btn-delete" data-id="${doc.id}">🗑️</button>
                            </div>
                        `;
                        itemsContainer.appendChild(itemCard);
                    });

                    emptyListPlaceholder.style.display = 'none';
                    itemsContainer.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error fetching items: ', error);
                });
        } else {
            // User is not signed in.
            // Redirect to login page or handle as necessary.
        }
    });
});

const editButtons = document.querySelectorAll('.btn-edit');
const deleteButtons = document.querySelectorAll('.btn-delete');

editButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const itemId = event.target.getAttribute('data-id'); 
        console.log('Edit item with ID:', itemId);
    });
});

deleteButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const itemId = event.target.getAttribute('data-id');
        console.log('Delete item with ID:', itemId);
    });
});
