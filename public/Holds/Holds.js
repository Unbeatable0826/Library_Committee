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
const nameElem = document.getElementById("name");

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app); 
let userID;
let userDocRef;
var book1u;
var book2u;
var book3u;
var hold1u;
var hold2u;
var hold3u;
var book1;
var book2;
var book3;
var hold1;
var hold2;
var hold3;
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            userDocRef = doc(db, "users", user.uid);
            const docSnapshot = await getDoc(userDocRef);
            userID = user.uid;
            if (docSnapshot.exists()) {
                const bookList = document.getElementById("book_grid");
                const book_template = document.getElementById("book_template");
                console.log(book_template)
                const userData = docSnapshot.data();
                book1u = userData.book1;
                book2u = userData.book2;
                book3u = userData.book3;
                hold1u = userData.hold1;
                hold2u = userData.hold2;
                hold3u = userData.hold3;
                nameElem.textContent = "Welcome Back, " + userData.name.substr(0, 20);
                if(book1u){
                    book1 = book1u.split("&&");
                }else{book1 = ""}
                if(book2u){
                    book2 = book2u.split("&&");
                }else{book2 = ""}
                if(book3u){
                    book3 = book3u.split("&&");
                }else {book3 = ""}
                if(hold1u){
                    hold1 = hold1u.split("&&");
                }else{hold1 = ""}
                if(hold2u){
                    hold2 = hold2u.split("&&");
                }else{hold2 = ""}
                if(hold3u){
                    hold3 = hold3u.split("&&");
                }else{hold3 = ""}
                
                let user_books = [book1, book2, book3];
                let user_holds = [ hold1, hold2, hold3];
                
                for (const book of user_books){
                    if (book != ""){
                        let clone = book_template.content.cloneNode(true)
                        let bookREF = ref(rtdb, 'books/' + book[1])
                        let thingy = await get(bookREF)
                        let curr_book = thingy.val();
                        let pop = new Date(Number(curr_book.checkoutby.split("&&&")[1]))
                        clone.querySelector('.wait_time').textContent = "Due By: " + pop.toLocaleDateString();
                        if (Number(curr_book.checkoutby.split("&&&")[1]) <= Date.now()){
                            clone.querySelector('.wait_time').style.color = 'red'


                        }
                        clone.querySelector('.cancel_button').style.display = 'none'
                        clone.querySelector('.book_tittle').textContent = curr_book.tittle;
                        clone.querySelector('.book_author').textContent = "Written By: " + curr_book.author;
                        clone.querySelector('.book_genre').textContent = "Genre: "  + curr_book.genre;
                        book[0] = book[0][0].toUpperCase() + book[0].substr(1)
                        clone.querySelector('.book_hold').textContent = "Type: " + book[0];
                        clone.querySelector('.book_id').textContent = "BookId: " + book[1];
                        clone.querySelector('.book_img').src = curr_book.img;
                        clone.querySelector('.cancel_button').dataset.bookId = book[1]; 
                        bookList.append(clone)
                    }
                }
                for (let book of user_holds){
                    if (book != ""){
                        let clone = book_template.content.cloneNode(true)
                        let bookREF = ref(rtdb, 'books/' + book[1])
                        let thingy = await get(bookREF)
                        let curr_book = thingy.val();
                        console.log(curr_book.tittle);
                        console.log(curr_book.author);
                        if (book[0] == "pickup"){
                            let thingy  = new Date(Number(curr_book.holds[0].split("&&&")[2]));
                            clone.querySelector('.wait_time').textContent = "Pickup By: " + thingy.toLocaleDateString();
                        }else{
                        let thingy = "Estimated Date: Unknown"
                        let num = 0
                        for (let x = 1; x < curr_book.holds.length; x++){
                            if (curr_book.holds[x].includes(user.uid)){
                                num = x;
                                break;

                            }

                        }
                        if (num != 0 && curr_book.checkoutby != ""){
                            let now = new Date()
                            now.setDate(now.getDate() + (num + 2) * 14)
                            thingy = "Estimated Date: " + now.toLocaleDateString();

                        }else if(num != 0 && curr_book.checkoutby == ""){
                            let now = new Date()
                            now.setDate(now.getDate() + (num+ 1)  * 14)
                            thingy = "Estimated Date: " + now.toLocaleDateString();
                        }
                        clone.querySelector('.wait_time').textContent = thingy;

                    }
                        clone.querySelector('.book_tittle').textContent = curr_book.tittle;
                        clone.querySelector('.book_author').textContent = "Written By: " + curr_book.author;
                        clone.querySelector('.book_genre').textContent = "Genre: "  + curr_book.genre;
                        book[0] = book[0][0].toUpperCase() + book[0].substr(1)
                        clone.querySelector('.cancel_button').textContent = book[0]
                        clone.querySelector('.book_hold').textContent = "Type: " + book[0];
                        clone.querySelector('.book_id').textContent = "BookId: " + book[1];
                        clone.querySelector('.book_img').src = curr_book.img;
                        clone.querySelector('.cancel_button').dataset.bookId = book[1]; 
                        bookList.append(clone)

                    }
                }

            }
        } catch (error) {
            console.log("Error fetching user data:", error);
        }
    } else {
        window.location.href = "../Login_Folder/login.html";
    }
});
const signOutButton = document.querySelector('.sign-out-button');
signOutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = '../Login_Folder/login.html'; 
    });
});
const bookList = document.getElementById("book_grid");
bookList.addEventListener("click", async(event) => {
    const book = event.target.closest('.cancel_button')
    const bookref = ref(rtdb, 'books/' + book.dataset.bookId)
    let thingy = await get(bookref)
    let curr_book = thingy.val();
    let line;
    console.log(curr_book)
    for (let x = 0; x < curr_book.holds.length; x++){
        if (curr_book.holds[x].includes(userID)){
            line = x;
        }
    } 
    curr_book.holds.splice(line, 1)
    console.log(curr_book)
    alert(line)
})

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































