import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyB_2c-wqL2QhhlC9YbaILSyFpVtOL21oRA",
    authDomain: "library-committee-9ac2d.firebaseapp.com",
    projectId: "library-committee-9ac2d",
    storageBucket: "library-committee-9ac2d.firebasestorage.app",
    messagingSenderId: "448364021608",
    appId: "1:448364021608:web:b1261518ababbb41f4f8dd",
    measurementId: "G-MV66MKCW94"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const people_who_forgot = document.querySelector(".people_who_forgot")
document.getElementById("login").addEventListener("click", function (event) {
    event.preventDefault();


    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            checkUserRole(user.uid); 
        })
        .catch((error) => {
            console.error("Login failed:", error);
            alert(`Login failed: ${error.message}`);
            people_who_forgot.style.display = 'block'
        });
});


async function checkUserRole(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const isAdmin = userData.admin;

            localStorage.setItem("user", JSON.stringify({ uid, email: userData.email }));

            if (isAdmin) {
                window.location.href = "../admin-profile/Home/home.html"; 
            } else {
                window.location.href = "../Profile/profile-home.html"; 
            }
        } else {
            console.error("User not found in Firestore!");
            alert("Contact support.");
        }
    } catch (error) {
        alert("Try again later.");
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        checkUserRole(user.uid);
    }
});
