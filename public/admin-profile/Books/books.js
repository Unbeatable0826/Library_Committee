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



const loading_thingy = document.querySelector('.loading_wrapper');



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
let books = []

const book_template = document.getElementById("data-book-template");
const book_container = document.querySelector(".book_container")
let booksPROMISE = []
async function does_thingys() {
    const booksRef = ref(rtdb, "books"); 
    const snapshot = await get(booksRef);
    if (snapshot.exists()){
        const booksData = snapshot.val();
        booksPROMISE = Object.entries(booksData).map( async([bookID, book])=> {
           const book_thingy = book_template.content.cloneNode(true).children[0];
            book_thingy.dataset.bookid = bookID;
            book_thingy.querySelector('.book_tittle').textContent = book.tittle;
            book_thingy.querySelector('.book_author').textContent = book.author;
            if (book.avail){
                book_thingy.querySelector('.book_holds').textContent = "0"
                book_thingy.querySelector('.checkoutby').textContent = "*Available";
                book_thingy.querySelector('.book_date').textContent = "";

            }else if (book.holds[0].split("&&&")[0] == "pickup"){
                book_thingy.querySelector('.checkoutby').textContent = "Pickup Ready"; 
                book_thingy.querySelector('.book_holds').textContent = book.holds.length - 1;
                let thingy  = new Date(Number(book.holds[0].split("&&&")[2]));
                book_thingy.querySelector('.book_date').textContent = thingy.toLocaleDateString();
            }else if(book.checkoutby != ""){
                const book_user_id = String(book.checkoutby.split("&&&")[0])
                const userDocRef = doc(db, "users", book_user_id);
                const docSnapShot = await getDoc(userDocRef);
                let thingy = new Date(Number(book.checkoutby.split("&&&")[1]))
                book_thingy.querySelector('.book_date').textContent = thingy.toLocaleDateString()
                if (Number(book.checkoutby.split("&&&")[1]) < Date.now()){
                    book_thingy.querySelector('.book_date').style.color = "red";
                }
                 if (docSnapShot.exists()){
                     const user_data = docSnapShot.data()
                     book_thingy.querySelector('.checkoutby').textContent = user_data.name;
                 }
                if (book.holds[0] != ""){
                    book_thingy.querySelector('.book_holds').textContent = book.holds.length;

                }else{
                    book_thingy.querySelector('.book_holds').textContent = 0;

                }

            }
            
            book_container.append(book_thingy)
            return{id: bookID, tittle: book.tittle, checkoutby: book.checkoutby, author: book.author, genre: book.genre, available: book.avail, element: book_thingy, holds: book.holds, img: book.img, summary: book.summary, }

        })
    }
    books = await Promise.all(booksPROMISE);
    sorts_thingys();
}
does_thingys();
const debounce = (fn, delay = 50) => {
    let timerId = null;
    return function(...args){
        clearTimeout(timerId);
        timerId = setTimeout(() => fn.apply(this, args), delay);
    };
};



const search = document.querySelector('.search');
const sorting = document.querySelector('.sorting');
const JFICm = document.querySelector('.JFICm');
const FICm = document.querySelector('.FICm');
const YAm = document.querySelector('.YAm');
const availy = document.querySelector('.availy');
const pickup = document.querySelector('.pickup');
const checked = document.querySelector(".checked");
search.addEventListener("input", debounce(thingy_pls_work, 500))

JFICm.addEventListener("input", thingy_pls_work)
FICm.addEventListener("input", thingy_pls_work)
YAm.addEventListener("input", thingy_pls_work)
availy.addEventListener("input", thingy_pls_work)
pickup.addEventListener("input", thingy_pls_work)
checked.addEventListener("input", thingy_pls_work)








function thingy_pls_work(){
    const value = search.value;
    books.forEach(book => {
        let isVisible = book.tittle.toLowerCase().includes(value.toLowerCase()) || book.author.toLowerCase().includes(value.toLowerCase()) || book.id.toLowerCase().includes(value.toLowerCase());
        let match = false;
        let thingy = false;
        if ((JFICm.checked == false && FICm.checked == false && YAm.checked == false )){
            match = true;
        }
        if (!(availy.checked || pickup.checked || checked.checked)){
            thingy = true;
        }

        if (JFICm.checked){
            match = (book.genre == "JFIC" || book.genre.toLowerCase() === "jfic");
        }
        if (FICm.checked){
            match = match || (book.genre == "FIC" || book.genre.toLowerCase() === "fic");
        }
        if (YAm.checked){
            match = match || (book.genre == "YA" || book.genre.toLowerCase() === "ya");
        }
        if (availy.checked){
            thingy = thingy || book.available
        }
        if (pickup.checked){
            if (book.holds[0] == ""){
                thingy = thingy || false
            }
            else{
                thingy = thingy || book.holds[0].split("&&&")[0] == "pickup";
            }
        }
        if (checked.checked){
            thingy = thingy || book.checkoutby != "";
        }
        let thingy_should_appear = isVisible && match && thingy
        if (book.element.classList.contains("hide") == thingy_should_appear) {
            book.element.classList.toggle("hide", !!!thingy_should_appear)

        }
    })
}

















sorting.addEventListener("input", sorts_thingys)



async function sorts_thingys(){
    const value = sorting.value
    if (value == "author"){
        books.sort((a, b) => {
            return a.author.trim().split(" ").at(-1).localeCompare(b.author.trim().split(" ").at(-1));
        })
        book_container.innerHTML = "";
        books.forEach(element => {
            book_container.append(element.element);
        });
    }else if (value == "tittle"){
            books.sort((a, b) => {
            return a.tittle.trim().replace(" ", "").localeCompare(b.tittle.trim().replace(" ", ""));
        })
        book_container.innerHTML = "";
        books.forEach(element => {
            book_container.append(element.element)
        })
    }else if (value == "holds"){
        books.sort((a, b) => {
            let a_thingy = a.holds.length;
            let b_thingy = b.holds.length;
            if (a.holds[0] == ""){
                a_thingy -= 1;
            }
            if (b.holds[0] == ""){
                b_thingy -= 1;
            }
            if (a.checkoutby != ""){
                a_thingy += 1;
            }
            if (b.checkoutby != ""){
                b_thingy += 1;
            }
            if (a_thingy < b_thingy){
                return 1;
            }
            if (b_thingy < a_thingy){
                return -1;
            }
            return 0;
        })
        book_container.innerHTML = "";
        books.forEach(thingy => {
            book_container.append(thingy.element);
        })
    }else if (value == "custom"){
        books = await Promise.all(booksPROMISE);
        book_container.innerHTML = ""
        books.forEach(element => {
        book_container.append(element.element);
        });
    }
}