
var database = firebase.database().ref('items');

// Function to fetch and display item data in the form for editing
function populateEditForm(itemId) {
    var editItemForm = document.getElementById('editItemForm');

    // Fetch item data from Firebase based on itemId
    database.child(itemId).once('value', function(snapshot) {
        var itemData = snapshot.val();

        // Populate form fields with item data
        editItemForm.querySelector('#itemName').value = itemData.item_name;
        editItemForm.querySelector('#category').value = itemData.category;
        editItemForm.querySelector('#description').value = itemData.description;
        editItemForm.querySelector('#itemImage').src = itemData.image_url;

       
        editItemForm.action = '/update_item?id=' + itemId;
    });
}

var itemId = 'your_item_id_here'; // Replace 'your_item_id_here' with the actual itemId
populateEditForm(itemId);