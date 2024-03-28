// Get the elements
const currentPassword = document.getElementById('current-password');
const newPassword = document.getElementById('new-password');
const confirmPassword = document.getElementById('confirm-password');
const applyChanges = document.getElementById('apply-changes');
const editPasswordForm = document.querySelector('.edit-password-form form');

// Add submit event listener to the form
editPasswordForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // Check if the new password and confirm password match
    if (newPassword.value !== confirmPassword.value) {
        alert("New password and confirm password do not match.");
        return;
    }

    // Get the current user
    const user = firebase.auth().currentUser;

    // Reauthenticate user before updating password
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword.value);
    user.reauthenticateWithCredential(credential)
        .then(() => {
            console.log("User reauthenticated successfully.");

            // Update password
            user.updatePassword(newPassword.value)
                .then(() => {
                    console.log("Password updated successfully!");
                    // Show success message
                    showSuccessMessage();
                })
                .catch((error) => {
                    console.error("Error updating password: ", error);
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
        title: 'Password Updated',
        text: 'Your password has been updated successfully.',
        showConfirmButton: false,
        timer: 2000 // Automatically close after 2 seconds
    });
}