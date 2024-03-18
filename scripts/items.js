// Reference to Firebase database
var database = firebase.database().ref('items');

// Function to fetch and display items from Firebase
function displayItems() {
    var itemsContainer = document.getElementById('items-container');
    var loadingMessage = document.getElementById('loading-message');

    // Show loading message
    loadingMessage.style.display = 'block';
    itemsContainer.innerHTML = ''; // Clear previous content

    database.once('value', function(snapshot) {
        // Hide loading message
        loadingMessage.style.display = 'none';

        if (snapshot.exists() && snapshot.hasChildren()) { // Check if there are items in the snapshot
            snapshot.forEach(function(childSnapshot) {
                var itemData = childSnapshot.val();

                // Create HTML elements for each item
                var itemElement = document.createElement('div');
                itemElement.className = 'w-100 bg-primary-subtle p-3 rounded-3 border border-black d-flex gap-2';
                itemElement.innerHTML = `
                    <div class="w-100 flex-grow-1">
                        <div class="d-flex align-items-center justify-content-between justify-content-md-start gap-3 mb-2">
                            <p class="mb-0 fw-bold fs-5">${itemData.itemName}</p>
                        </div>
                        <p class="mb-0">${itemData.description}</p>
                    </div>
                    <a class="ms-auto btn fs-1">${itemData.favorite ? '❤️' : '🤍'}</a>
                `;
                itemsContainer.appendChild(itemElement);
            });
        } else { // Display message when items list is empty
            itemsContainer.innerHTML = '<p>Item List is empty...</p>';
        }
    });
}

// Call function to initially display items
displayItems();
