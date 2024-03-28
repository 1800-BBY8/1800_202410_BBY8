// Get the elements
const editEmail = document.getElementById('edit-user-email');
const editName = document.getElementById('edit-user-name');
const currentPassword = document.getElementById('current-password');
const applyChanges = document.getElementById('apply-changes');
const editForm = document.querySelector('.edit-account-form form');

// Function to set input values
function setInputValues(email, name) {
    editEmail.value = email;
    editName.value = name;
}

// Update input values when the page loads
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        setInputValues(user.email, user.displayName);
    }
});

// Add submit event listener to the form
editForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // Check if the "Apply" checkbox is checked
    if (!applyChanges.checked) {
        
        alert("Please check the 'Apply' checkbox to apply changes.");
        return;
    }

    // Get the current user
    const user = firebase.auth().currentUser;

    // Reauthenticate user before updating password
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword.value);
    user.reauthenticateWithCredential(credential)
        .then(() => {
            console.log("User reauthenticated successfully.");

            // Update email
            user.updateEmail(editEmail.value)
                .then(() => {
                    console.log("Email updated successfully!");
                    // Update profile
                    user.updateProfile({
                        displayName: editName.value
                    })
                        .then(() => {
                            console.log("Profile updated successfully");

                            // Update Firestore database
                            const userDocRef = firebase.firestore().collection("Users").doc(user.uid);

                            // Update fields in Firestore
                            userDocRef.update({
                                email: editEmail.value,
                                name: editName.value
                            })
                                .then(() => {
                                    console.log("Firestore database updated successfully");
                                    // Show success message
                                    showSuccessMessage();
                                })
                                .catch((error) => {
                                    console.error("Error updating Firestore database: ", error);
                                });
                        })
                        .catch((error) => {
                            console.error("Error updating profile: ", error);
                        });
                })
                .catch((error) => {
                    console.error("Error updating email: ", error);
                });
        })
        .catch((error) => {
            console.error("Error reauthenticating user: ", error);
            alert("Incorrect current password. Please enter your current password.");
        });
});

function showSuccessMessage() {
    // Show SweetAlert confirmation message
    Swal.fire({
        icon: 'success',
        title: 'Account Updated',
        text: 'Your account information has been updated successfully.',
        showConfirmButton: false,
        timer: 2000
    });

    setTimeout(function () {
        window.location.reload();
    }, 2000);
}
