//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0y7_d13aSCeJbc6M0OYTaJJVod7msc7A",
  authDomain: "comp1800-bby8.firebaseapp.com",
  projectId: "comp1800-bby8",
  storageBucket: "comp1800-bby8.appspot.com",
  messagingSenderId: "284571994979",
  appId: "1:284571994979:web:34d9dc37ed42b079162156"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();