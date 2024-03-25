document.addEventListener('DOMContentLoaded', function () {
    const itemsContainer = document.getElementById('items-container');
    const emptyListPlaceholder = document.getElementById('empty-list-placeholder');
    const editForm = document.getElementById('edit-form');
    const editItemForm = document.getElementById('edit-item-form');
    const editItemNameInput = document.getElementById('edit-item-name');
    const editCategoryInput = document.getElementById('edit-category');
    const editDescriptionInput = document.getElementById('edit-description');
    const editImageInput = document.getElementById('edit-image');
    let itemIdToEdit = null;
    let userId = null;

    // Fetch items from Firestore
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            userId = user.uid;

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
                                    <div class="image-container">
                                        <img src="${itemData.imageURL}" alt="Item Image" class="card-img-top">
                                    </div>` : ''}
                            </div>
                        `;
                        itemsContainer.appendChild(itemCard);

                        const deleteButton = itemCard.querySelector('.btn-delete');
                        deleteButton.addEventListener('click', () => {
                            // Show confirmation dialog
                            const isConfirmed = confirm("Are you sure you want to delete this item?");
                            
                            if (isConfirmed) {
                                deleteItem(userId, doc.id); // Call function to delete item
                            }
                        });
                    

                        // Add event listener for edit button
                        const editButton = itemCard.querySelector('.btn-edit');
                        editButton.addEventListener('click', () => {
                            itemIdToEdit = doc.id;
                            editItemNameInput.value = itemData.itemName;
                            editCategoryInput.value = itemData.category;
                            editDescriptionInput.value = itemData.description || '';
                            editForm.style.display = 'block';
                            document.getElementById('edit-favorite').checked = itemData.isFavorite;

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

    // Close the edit form when the user clicks on the close button
    const closeButton = editForm.querySelector('.close');
    closeButton.addEventListener('click', () => {
        editForm.style.display = 'none';
    });

    // Close the edit form when the user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === editForm) {
            editForm.style.display = 'none';
        }
    });

    // Prevent the form from closing when clicking inside it
    editItemForm.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    // Event listener for category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            editCategoryInput.value = category;
            // Toggle active class for styling (optional)
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Function to handle editing item details
    editItemForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const editedItemName = editItemNameInput.value.trim();
        const editedCategory = editCategoryInput.value.trim();
        const editedIsFavorite = document.getElementById('edit-favorite').checked;
        const editedDescription = editDescriptionInput.value.trim(); 
        const editedImageFile = editImageInput.files[0];

        if (editedItemName === '' || editedCategory === '') {
            // Handle empty input fields
            // You can display an error message to the user
            return;
        }

        if (!itemIdToEdit) {
            // Handle missing item ID
            return;
        }

        // Upload the image file to storage only if a file is selected
        if (editedImageFile) {
            const storageRef = firebase.storage().ref();
            const imageRef = storageRef.child(`images/${userId}/${itemIdToEdit}/${editedImageFile.name}`);
            imageRef.put(editedImageFile)
                .then((snapshot) => {
                    // Get the uploaded image URL
                    return snapshot.ref.getDownloadURL();
                })
                .then((downloadURL) => {
                    // Update item in Firestore with the image URL
                    return firebase.firestore().collection('Users').doc(userId).collection('Items').doc(itemIdToEdit).update({
                        itemName: editedItemName,
                        category: editedCategory,
                        isFavorite: editedIsFavorite, // Update favorite status
                        description: editedDescription,
                        imageURL: downloadURL
                    });
                })
                .then(() => {
                    console.log('Item successfully updated');
                    editForm.style.display = 'none';
                    // Reload the page to update the changes
                    location.reload();
                })
                .catch(error => {
                    console.error('Error updating item: ', error);
                });
        } else {
            // If no image is selected, update item in Firestore without the image URL
            firebase.firestore().collection('Users').doc(userId).collection('Items').doc(itemIdToEdit).update({
                itemName: editedItemName,
                category: editedCategory,
                isFavorite: editedIsFavorite, // Update favorite status
                description: editedDescription
            })
                .then(() => {
                    console.log('Item successfully updated');
                    editForm.style.display = 'none';
                    // Reload the page to reflect the changes
                    location.reload();
                })
                .catch(error => {
                    console.error('Error updating item: ', error);
                });
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

