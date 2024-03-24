document.addEventListener('DOMContentLoaded', function () {
    const itemsContainer = document.getElementById('items-container');
    const emptyListPlaceholder = document.getElementById('empty-list-placeholder');

    // Fetch items from Firestore
    firebase.auth().onAuthStateChanged(function (user) {
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
                                <div>
                                    <h5 class="card-title"><b>${itemData.itemName}</b>${itemData.isFavorite ? '  💖' : ''}</h5>
                                    <p class="card-text">Category: ${itemData.category}</p>
                                    ${itemData.description ? `<p class="card-text-description">${itemData.description}</p>` : ''}
                                    <button class="btn btn-primary btn-edit" data-id="${doc.id}">📝</button>
                                    <button class="btn btn-danger btn-delete" data-id="${doc.id}">🗑️</button>
                                </div>
                                ${itemData.imageURL ? `
                                    <div class="image-container"> <!-- Add an image container -->
                                        <img src="${itemData.imageURL}" alt="Item Image" class="card-img-top"> <!-- Add image element -->
                                    </div>` : ''} <!-- Conditional rendering of image container and element -->
                            </div>
                        `;
                        itemsContainer.appendChild(itemCard);

                        // Add event listener for delete button
                        const deleteButton = itemCard.querySelector('.btn-delete');
                        deleteButton.addEventListener('click', () => {
                            deleteItem(userId, doc.id); // Call function to delete item
                        });
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

    // Function to delete item from Firestore
    function deleteItem(userId, itemId) {
        firebase.firestore().collection('Users').doc(userId).collection('Items').doc(itemId).delete()
            .then(() => {
                console.log('Item successfully deleted');
                // Reload the page to reflect the deletion
                location.reload();
            })
            .catch(error => {
                console.error('Error deleting item: ', error);
            });
    }
});
