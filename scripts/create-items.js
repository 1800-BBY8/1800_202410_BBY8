document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('submit');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const itemName = document.getElementById('item_name').value;
        const category = document.getElementById('category').value;
        const isFavorite = document.getElementById('favorite').checked;
        const description = document.getElementById('description').value;
        const imageFile = document.getElementById('image').files[0];

        // Validate that itemName and category are not empty
        if (!itemName.trim() || !category.trim()) {
            alert("Please enter both name and category.");
            return;
        }

        // Get the current user
        const user = firebase.auth().currentUser;
        if (user) {
            const userId = user.uid;

            if (imageFile) {
                // If an image is selected, upload it to Firebase Storage
                const storageRef = firebase.storage().ref();
                const imageRef = storageRef.child('images/' + imageFile.name);

                imageRef.put(imageFile).then(function (snapshot) {
                    console.log('Uploaded an image file to database!');

                    // Get the download URL for the image
                    imageRef.getDownloadURL().then(function (url) {
                        saveItemToFirestore(url);
                    }).catch(function (error) {
                        console.error('Error getting download URL: ', error);
                    });
                }).catch(function (error) {
                    console.error('Error uploading image: ', error);
                });
            } else {
                // If no image is selected, save data to Firestore without image URL
                saveItemToFirestore(null);
            }

            function saveItemToFirestore(imageURL) {
                firebase.firestore().collection('Users').doc(userId).collection('Items').add({
                    itemName: itemName,
                    category: category,
                    isFavorite: isFavorite,
                    description: description,
                    imageURL: imageURL // URL of the uploaded image or null if no image
                })
                    .then(function (docRef) {
                        console.log('Document written with ID: ', docRef.id);
                        successMessage.innerText = 'Item saved successfully!';
                        successMessage.style.display = 'block';
                        setTimeout(function () {
                            successMessage.style.display = 'none';
                            // Reload the page to clear the inputs
                            location.reload();
                        }, 1500); // delay 1.5 seconds
                    })
                    .catch(function (error) {
                        console.error('Error adding document: ', error);
                    });
            }
        } else {
            // User is not signed in. Redirect to login page or handle as necessary.
        }
    });
});

const categoryButtons = document.querySelectorAll('.category-btn');
categoryButtons.forEach(button => {
    button.addEventListener('click', function () {
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('btn-secondary');
        });
        this.classList.add('active');
        this.classList.remove('btn-secondary');
        document.getElementById('category').value = this.getAttribute('data-category');
    });
});

