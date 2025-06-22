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
const nameElem = document.getElementById("name");
const userCardTemplate = document.querySelector("[data-book-template]")
const bookCardContainer = document.querySelector("[data-books-cards]")
let userID;
let userDocRef;
let user_email;
const mobile_nameElem = document.getElementById("mobile_name");
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            userDocRef = doc(db, "users", user.uid);
            const docSnapshot = await getDoc(userDocRef);
            userID = user.uid;

            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                nameElem.textContent = "Welcome Back, " + userData.name.substr(0, 20);
                mobile_nameElem.textContent = "Welcome Back, " + userData.name.substr(0, 20);
                book1u = userData.book1;
                book2u = userData.book2;
                book3u = userData.book3;
                hold1u = userData.hold1;
                hold2u = userData.hold2;
                hold3u = userData.hold3;
                user_email = userData.email;
                if(book1u){
                    book1 = book1u.split("&&")[1];
                }else{book1 = ""}
                if(book2u){
                    book2 = book2u.split("&&")[1];
                }else{book2 = ""}
                if(book3u){
                    book3 = book3u.split("&&")[1];
                }else {book3 = ""}
                if(hold1u){
                    hold1 = hold1u.split("&&")[1];
                }else{hold1 = ""}
                if(hold2u){
                    hold2 = hold2u.split("&&")[1];
                }else{hold2 = ""}
                if(hold3u){
                    hold3 = hold3u.split("&&")[1];
                }else{hold3 = ""}
            }
            fetchUserRealtimeData(user.uid);
        } catch (error) {
            console.log(error);
        }
    } else {
        window.location.href = "../Login_Folder/login.html";
    }
});


let books = [];

async function fetchBooks() {
    try {
        const booksRef = ref(rtdb, "books"); 
        const snapshot = await get(booksRef);

        if (snapshot.exists()) {
            const booksData = snapshot.val();
            books = Object.entries(booksData).map(([bookID, book])=> {
                const card = userCardTemplate.content.cloneNode(true).children[0];
                /*const header = card.querySelector("[data-header]");
                const author = card.querySelector("[data-author]");
                const genre = card.querySelector("[data-genre]");
                header.textContent = "Title: " + book.tittle ;
                author.textContent = "Author: " + book.author;
                genre.textContent = "Genre: " + book.genre;*/
                const thingy = card.querySelector("img");
                if (book.img) {
                    
                    thingy.src=book.img.substring(0, book.img.length - 4) + "-M.jpg";
                   // thingy.src=book.img
                    
                } else {
                    thingy.src="https://th.bing.com/th/id/OIP.SQOMCf7wp-hciCmo3Sr4OQHaHa?rs=1&pid=ImgDetMain";
                }
                card.dataset.bookId = bookID;
        
                bookCardContainer.append(card);
                 
                return{id: bookID, tittle: book.tittle, author: book.author, genre: book.genre, available: book.avail, element: card, holds: book.holds, img: book.img, summary: book.summary, }

            })
        } else {
            alert("BIG ERROR")
        }
    } catch (error) {
        console.log("Error");
    }
}

fetchBooks();
const JFIC = document.querySelector(".JFIC")
const FIC = document.querySelector(".FIC")
const YA = document.querySelector(".YA")
const JFICm = document.querySelector(".JFICm");
const FICm = document.querySelector(".FICm");
const YAm = document.querySelector(".YAm");







search.addEventListener("input", does_stuff)
JFIC.addEventListener("input", does_stuff);
FIC.addEventListener("input", does_stuff);
YA.addEventListener("input", does_stuff);


JFICm.addEventListener("input", does_stuff);
FICm.addEventListener("input", does_stuff);
YAm.addEventListener("input", does_stuff);
// does something, really anything
// holds a value from some search thing
function does_stuff(){
    const value = search.value;
    books.forEach(book => {
        // for each book...
        let isVisible = book.tittle.toLowerCase().includes(value.toLowerCase()) || book.author.toLowerCase().includes(value.toLowerCase()) || book.genre.toLowerCase() == (value.toLowerCase())
        let match = false;
        if (JFIC.checked || JFICm.checked){
            match = match || (book.genre == "JFIC" || book.genre.toLowerCase() === "jfic");
        }
        if (FIC.checked || FICm.checked){
            match = match || (book.genre == "FIC" || book.genre.toLowerCase() === "fic");
        }
        if (YA.checked || YAm.checked){
            match = match || (book.genre == "YA" || book.genre.toLowerCase() === "ya");
        }
        if ((JFIC.checked == false && FIC.checked == false && YA.checked == false) && (JFICm.checked == false && FICm.checked == false && YAm.checked == false ) ){
            match = true;
        }
        isVisible = isVisible && match;
        book.element.classList.toggle("hide", !!!isVisible)

    });
  
}


/* JFIC.addEventListener("input", thingy=>{
    if (JFIC.checked){
        books.forEach(book=>{
            const isVisible = book.genre.toLowerCase() == "jfic"
            book.element.classList.toggle("hide", !!!isVisible)
        })

    }else{
        books.forEach(book=>{
            const isVisible = false;
            book.element.classList.toggle("hide", !!isVisible)
        })


    }
}) */









const signOutButton = document.querySelector('.sign-out-button');
signOutButton.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = '../Login_Folder/login.html'; 
    });
});
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
const modal = document.getElementById("myModal");
const close_modal = document.getElementsByClassName("close")[0];
close_modal.onclick = function() {
    modal.style.display = "none";
}




window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }else if (open && event.target !== nav_display && !nav_display.contains(event.target)){
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
const modal_tittle = document.querySelector(".tittle1");
const modal_author = document.querySelector(".author1");
const modal_Genre = document.querySelector(".Genre");
const modal_bookID = document.querySelector(".bookID");
const modal_holds_number = document.querySelector(".holds-number");
const modal_pickup = document.querySelector(".pick-up");
const modal_picture = document.querySelector(".picture_book");
const modal_summary = document.querySelector(".summary1")
let card_thingy; 
bookCardContainer.addEventListener('click', (event) => {
    const card = event.target.closest('.card');
    card_thingy = card;
    const bookId = Number(card.dataset.bookId);
    const book = books.find(b => b.id == bookId);
    let genre_thingy = "";
    if (book) { 
        if (book.genre == "JFIC") {
            genre_thingy = "Juvenile Fiction";
        } else if (book.genre == "FIC") {
            genre_thingy = "Fiction";
        } else {
            genre_thingy = "Young Adult";
        }

        modal_tittle.textContent = "Title: " + book.tittle;
        modal_author.textContent = "Written by: " + book.author;
        modal_Genre.textContent = "Genre: " + genre_thingy;
        if (book.holds[0] == "") {
            modal_holds_number.style.display = "none";
        } else {
            modal_holds_number.style.display = "inline";
            var date = new Date();
            date.setDate(date.getDate() + book.holds.length * 14)
            modal_holds_number.textContent = "Current Holds: " + book.holds.length + " Estimated Date: " + date.toLocaleDateString(); 
        }
        modal_bookID.textContent = "BookID: " + book.id;
        if(book.available == true){
            modal_pickup.textContent = "Pick Up"
        }
        if (book.available == false){
            modal_pickup.textContent = "Hold Book";
        }

        if (book.img != "") {
            modal_picture.src = book.img;
          }else{
                modal_picture.src = "https://th.bing.com/th/id/OIP.SQOMCf7wp-hciCmo3Sr4OQHaHa?rs=1&pid=ImgDetMain";
          }
        
        if (book.summary === ""){
            modal_summary.style.display = "none";
            
        }else{
            modal_summary.style.display = 'inline';
            modal_summary.textContent = "Book Description:  " + book.summary;
        }
        // if (modal_summary != ""){ }
        modal.style.display = "block";
    } else {
        console.error("Book not found for ID:", bookId); 
    }
});

modal_pickup.addEventListener('click', async() =>{
    const bookId = Number(card_thingy.dataset.bookId);
    const book = books.find(b => b.id == bookId);

        const confirmation = confirm("You are putting " + book.tittle + " on hold, you must pick it up within 7 days of today")
        const bookREF = ref(rtdb, 'books/' + bookId);
        const book_snapshot = await get(bookREF);
        let book_  = book_snapshot.val();
        book.holds = book_.holds;
        
        if ((confirmation) ==  true){
            if (book.available && ![book1, book2, book3, hold1, hold2, hold3].includes(book.id) && (hold1 == "" || hold2 == "" || hold3== "")){
                var updat_avail = {
                    avail: false,
                }
                update(bookREF, updat_avail)
                if (book.holds[0] == ""){
                    const book_curr =  ref(rtdb, 'books/' + bookId + '/holds/0')
                    const thingy = Date.now() + 604800000
                    set(book_curr, "pickup" + "&&&" + userID + "&&&" + thingy)
                    .then(async () => {
                        if (hold1 == "" || hold1 == null) {
                            await setDoc(userDocRef, { hold1: "pickup&&" + bookId, hold1_time: thingy }, { merge: true });
                        } else if (hold2 == "" || hold2 == null) {
                            await setDoc(userDocRef, { hold2: "pickup&&" + bookId, hold2_time: thingy }, { merge: true });
                        } else if (hold3 == "" || hold3 == null) {
                            await setDoc(userDocRef, { hold3: "pickup&&" + bookId, hold3_time: thingy }, { merge: true });
                        } else {
                            alert("Please inform an admin, there is a problem with the website");
                        }
                        alert("Your Book Is Now On Hold :)")
                        await fetch("https://on-request-emailing-b4rcicpmhq-uc.a.run.app/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json; charset=UTF-8"
                        },
                        body: JSON.stringify({
                            'tittle': "" + book_.tittle,
                            'email': "" + user_email,
                            'bookid': "" + bookId,
                                                })
                        })
                        .then(response => {
                        if (!response.ok) {
                            alert("SOMETHING HAS GONE HORRRIBLY WRONG IDK WHAT")
                        }
                        })
                        
                        window.location.reload();
                    })
                }
            }else if(book.available == false && ![book1, book2, book3, hold1, hold2, hold3].includes(book.id) && (hold1 == "" || hold2 == "" || hold3== "")){
                if (book.holds[0] != ""){
                var jop = book.holds.length
                var updated = {
                }
                jop = book.holds.length
                const thingysss = Date.now() + 43200009000000000000;
                updated[jop] = "hold" + "&&&" + userID + "&&&" + (thingysss);
                update(ref(rtdb, 'books/' + bookId + "/holds/" ), updated)
                .then(async () => {
                    if (hold1 == "" || hold1 == null) {
                        await setDoc(userDocRef, { hold1: "hold&&" + bookId, hold1_time: thingysss }, { merge: true });
                    } else if (hold2 == "" || hold2 == null) {
                        await setDoc(userDocRef, { hold2: "hold&&" + bookId, hold2_time: thingysss }, { merge: true });
                    } else if (hold3 == "" || hold3 == null) {
                        await setDoc(userDocRef, { hold3: "hold&&" + bookId, hold3_time: thingysss }, { merge: true });
                    } else {
                        alert("Please inform an admin, there is a problem with the website");
                    }
        
                    alert("Your Book is on Hold :)");
                    window.location.reload(); 
                })
                }
                
                else if(book.holds[0] == ""){

                    const book_curr =  ref(rtdb, 'books/' + bookId + '/holds/0')
                    const thingys = Date.now() + 4320000000000000000;
                    set(book_curr, "hold" + "&&&" + userID + "&&&" + thingys)
                    .then(async () => {
                        if (hold1 == "" || hold1 == null) {
                            await setDoc(userDocRef, { hold1: "hold&&" + bookId, hold1_time: thingys }, { merge: true });
                        } else if (hold2 == "" || hold2 == null) {
                            await setDoc(userDocRef, { hold2: "hold&&" + bookId, hold2_time: thingys }, { merge: true });
                        } else if (hold3 == "" || hold3 == null) {
                            await setDoc(userDocRef, { hold3: "hold&&" + bookId, hold3_time: thingys }, { merge: true });
                        } else {
                            alert("Please inform an admin, there is a problem with the website");
                        }
            
                        alert("Your Book is on Hold :)");
                        window.location.reload(); 
                    })
                }
            }else{
                if (hold1 != "" && hold2 != "" && hold3 != ""){
                    alert("Sorry! :( You have already reached a max number of books you can put on hold or for pickup");
                }
                else{
                    alert("Sorry! :( You already have this book checked out from us or Held");
                }
                
            }
    }
    
})





































