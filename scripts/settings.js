
// Handle click event on delete account button
document.getElementById("deleteAccountBtn").addEventListener("click", function () {
  // Confirm with the user before proceeding with account deletion
  if (confirm("Are you sure you want to delete your account?")) {
    // Reauthenticate the user
    var user = firebase.auth().currentUser;
    var credential;

    // Prompt the user to re-enter their password
    var password = prompt("Please enter your password to confirm account deletion:");

    // Create a credential with the provided password
    credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      password
    );

    // Reauthenticate the user with the provided credential
    user.reauthenticateWithCredential(credential)
      .then(function () {
        // User successfully reauthenticated, proceed with account deletion
        return user.delete();
      })
      .then(function () {
        // Account deletion successful
        console.log("Account deleted successfully.");
        // Redirect to index
        window.location.href = "index.html";
      })
      .catch(function (error) {
        // Handle reauthentication errors or account deletion errors
        console.error("Error deleting account: ", error);
        alert("Failed to delete account. Please try again later.");
      });
  }
});


// Logout function
const logoutBtn = document.querySelector('#logout');
logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    // Custom Modal from sweetalert
    Swal.fire({
      icon: 'success',
      title: 'Logout successful',
      showConfirmButton: false,
      timer: 1500 
    }).then(() => {
      window.location.href = "login.html";
    });
  });
});
