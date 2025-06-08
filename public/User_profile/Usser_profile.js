import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
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
const nameElem = document.getElementById("name");
let book1;
let book2;
let book3;
let hold1;
let hold2;
let hold3;
let user_uid;
let email;
let name;
const login_email = document.querySelector(".login_input");
const login_name = document.querySelector(".user_name");
const signOutButton = document.querySelector(".sign-out-button");
const out_text = document.querySelector(".Books_checked")
const held_text = document.querySelector(".Books_hold");
const pass = document.querySelector('.login_button');
const reset = document.querySelector('.password_reset_but');
const mobileElem = document.getElementById("mobile_name")
onAuthStateChanged(auth, async(user) => {
    if (user){
        let userDocRef = doc(db, "users", user.uid);
        user_uid = user.uid;
        const docSnapshot = await getDoc(userDocRef)
        if (docSnapshot.exists()){
            const thingy = docSnapshot.data()
             mobileElem.textContent = "Welcome Back, " + thingy.name.substr(0, 20);
             nameElem.textContent = "Welcome Back, " + thingy.name.substr(0, 20);
            book1 = thingy.book1;
            book2 = thingy.book2;
            book3 = thingy.book3;
            hold1 = thingy.hold1;
            hold2 = thingy.hold2;
            hold3 = thingy.hold3;
            name = thingy.name;
            email = thingy.email
            login_email.value  = email;
            login_name.value = name;
            let books_held  = 0;
            let books_out = 0; 
            if (book1 != ""){
                books_out += 1;
            }
            if (book2 != ""){
                books_out += 1;
            }
            if (book3 != ""){
                books_out += 1;
            }
            out_text.textContent = "Books Checked Out: " + books_out;
            console.log(hold1)
            console.log(hold2)
            console.log(hold3)
            if (hold1 != ""){
                books_held += 1;
            }
            if (hold2 != ""){
                books_held += 1;
            }            
            if (hold3 != ""){
                books_held += 1;
            }            
            held_text.textContent = "Books On Hold: " + books_held;
        }
    }else{
        window.location.href = "../Login_Folder/login.html";
    }

})
signOutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = '../Login_Folder/login.html'; 
    });
});
pass.addEventListener("click", async function(event) {
    event.preventDefault();
    const email = login_email.value;
    const name = login_name.value;
    const auth = getAuth(app);
    const userRef = doc(db, "users", user_uid);
    try{
    await setDoc(userRef, { email: email, name: name}, { merge: true });
    await updateEmail(auth.currentUser, email);
    alert("Successfully Saved");}
    catch(error){
        alert(error)
    }
    window.location.href = "";
})

reset.addEventListener("click", async function(event) {
let reset_email = login_email.value;
await sendPasswordResetEmail(auth, reset_email);
alert("Please Check Your Email  For A Password Reset")





    
})

const mobile_signout = document.querySelector('.sign-out-mobile');
mobile_signout.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = '../Login_Folder/login.html'; 
    });
});





const nav_display = document.querySelector('.nav_display');

const nav_opener = document.querySelector('.nav_opener');
const line1 = document.querySelector('.line1')
const line2 = document.querySelector('.line2')
const line3 = document.querySelector('.line3')
let open = false;
nav_opener.addEventListener('click', (event) => {
    if (!open){
        nav_display.style.marginLeft = '-30vw';
        line3.style.marginTop = '10vw'
        line2.style.marginLeft = '-100vw';
        line1.style.transform = 'rotate(45deg)'
        line3.style.transform = 'rotate(135deg)'
        
        open = !open
    }else{
        nav_display.style.marginLeft = '-70vw'
        line3.style.marginTop = '14vw';
        line2.style.marginLeft = '70vw';
        line3.style.transform = 'rotate(0deg)';
        line1.style.transform = 'rotate(0deg)';
        open = !open
    }

    
})
// nav_display.addEventListener('click', (event) => {
//     if (!open){
//                 nav_display.style.marginLeft = '-30vw';
//         line3.style.marginTop = '10vw'
//         line2.style.marginLeft = '-100vw';
//         line1.style.transform = 'rotate(45deg)'
//         line3.style.transform = 'rotate(135deg)'
        
//         open = !open
//         event.stopPropagation();
//     }
// })
const nav_dd = document.getElementsByClassName("nav_display")[0];
// window.onclick = function(event) {
//   if (event.target == nav_display) {
//         nav_display.style.marginLeft = '-70vw'
//         line3.style.marginTop = '14vw';
//         line2.style.visibility = 'visible';
//         line3.style.transform = 'rotate(0deg)';
//         line1.style.transform = 'rotate(0deg)';
//         open = !open;
//   }
// }



window.onclick = function(event) {
if (open && event.target !== nav_display && !nav_display.contains(event.target)){
        nav_display.style.marginLeft = '-70vw'
        line3.style.marginTop = '14vw';
        line2.style.marginLeft = '70vw';
        line3.style.transform = 'rotate(0deg)';
        line1.style.transform = 'rotate(0deg)';
        open = !open;
  }else if (!open && event.target === nav_display && nav_display.contains(event.target)){
        nav_display.style.marginLeft = '-30vw';
        line3.style.marginTop = '10vw'
        line2.style.marginLeft = '-100vw';
        line1.style.transform = 'rotate(45deg)'
        line3.style.transform = 'rotate(135deg)'
        
        open = !open
  }
}