//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyD0y7_d13aSCeJbc6M0OYTaJJVod7msc7A',
	authDomain: 'comp1800-bby8.firebaseapp.com',
	projectId: 'comp1800-bby8',
	storageBucket: 'comp1800-bby8.appspot.com',
	messagingSenderId: '284571994979',
	appId: '1:284571994979:web:34d9dc37ed42b079162156',
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const CollectionKeys = {
	USERS: 'Users',
	USER_TRIPS: 'Trips',
	USER_ITEMS: 'Items',
	USER_LISTS: 'Lists',
};

const usersCollection = db.collection(CollectionKeys.USERS);

function getCurrentUser() {
	return new Promise((res) => firebase.auth().onAuthStateChanged((user) => res(user)));
}

let userDoc;
async function getCurrentUserDocRef() {
	const user = await getCurrentUser();
	if (!user) return;

	if (userDoc) return userDoc;

	const doc = usersCollection.doc(user.uid);
	if (doc.exists) userDoc = doc;
	return doc;
}

async function getUserCollection(key) {
	const userRef = await getCurrentUserDocRef();
	return userRef.collection(key);
}

function logout() {
	firebase
		.auth()
		.signOut()
		.then(() => {
			// Sign-out successful.
			console.log('logging out user');
		})
		.catch((error) => {
			// An error happened.
		});
}
