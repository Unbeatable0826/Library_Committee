import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getDatabase, ref, get , update, push, set} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB_2c-wqL2QhhlC9YbaILSyFpVtOL21oRA",
    authDomain: "library-committee-9ac2d.firebaseapp.com",
    projectId: "library-committee-9ac2d",
    storageBucket: "library-committee-9ac2d.firebasestorage.app",
    messagingSenderId: "448364021608",
    appId: "1:448364021608:web:b1261518ababbb41f4f8dd",
    measurementId: "G-MV66MKCW94",
    databaseURL: "https://library-committee-9ac2d-default-rtdb.firebaseio.com/"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app); 

const nameElem = document.getElementById("name");
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnapshot = await getDoc(userDocRef);
            let userID = user.uid; 
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                if (!userData.admin){
                    window.location.href="../../Login_Folder/login.html"
                }
                nameElem.textContent = "Welcome Back Library Admin, " + userData.name.substr(0, 20);
            }
            fetchUserRealtimeData(user.uid);
        } catch (error) {
            console.log(error);
        }
    } else {
        window.location.href = "../../Login_Folder/login.html";
    }
});

const home_button = document.querySelector('.home_button');
const users_button = document.querySelector('.users_button');
const books_button = document.querySelector('.books_button');
const local_profile_button = document.querySelector('.local_profile_button');
const sign_out_button  = document.querySelector('.sign-out-button');

sign_out_button.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = '../../Login_Folder/login.html'; 
    });
});
home_button.addEventListener('click', () => {
    window.location.href = '../Home/home.html';
});
users_button.addEventListener('click', () =>{
    window.location.href = '../Users/users.html'
})
books_button.addEventListener('click', () => {;
   window.location.href = '../Books/books.html';
})
local_profile_button.addEventListener('click', () => {
    window.location.href = '../../Profile/profile-home.html';
})


