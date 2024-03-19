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

      // Get the current user
      const user = firebase.auth().currentUser;
      if (user) {
          const userId = user.uid;

          // Save data to Firestore sub-collection
          firebase.firestore().collection('Users').doc(userId).collection('Items').add({
              itemName: itemName,
              category: category,
              isFavorite: isFavorite,
              description: description
          })
          .then(function(docRef) {
              console.log('Document written with ID: ', docRef.id);
              successMessage.innerText = 'Item saved successfully!';
              successMessage.style.display = 'block';
              setTimeout(function() {
                  successMessage.style.display = 'none';
                  // Reload the page to clear the inputs
                  location.reload();
              }, 1500); // delay 1.5 seconds
          })
          .catch(function(error) {
              console.error('Error adding document: ', error);
          });
      } else {
          // User is not signed in. Redirect to login page or handle as necessary.
      }
  });
});


const categoryButtons = document.querySelectorAll('.category-btn');
// Add click event listener to each category button
categoryButtons.forEach(button => {
button.addEventListener('click', function() {
  // Remove 'active' class from all buttons
  categoryButtons.forEach(btn => {
    btn.classList.remove('active');
    btn.classList.add('btn-secondary'); 
  });
  // Add 'active' class to the clicked button
  this.classList.add('active');
  this.classList.remove('btn-secondary'); 
  // Set the value of the hidden input field to the selected category
  document.getElementById('category').value = this.getAttribute('data-category');
});
});
