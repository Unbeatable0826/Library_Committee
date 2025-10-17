import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getDatabase, ref, get , update, push, set, remove} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
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
const book_image_new = document.querySelector('.book_image_new');
const image_preview = document.querySelector('.image_preview');
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
const debounce = (fn, delay) => {
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
const NFICm = document.querySelector('.NFICm');
NFICm.addEventListener("input", thingy_pls_work);
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
        if ((JFICm.checked == false && FICm.checked == false && YAm.checked == false && NFICm.checked == false)){
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
        if (NFICm.checked){
            match = match || (book.genre == "NFIC" || book.genre.toLowerCase() == "nfic")
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
const modal_1 = document.querySelector('.modal');
const book_add = document.querySelector('.book_add');
const close_1 = document.querySelector('.close')
close_1.addEventListener('click', () => {
    modal_1.style.display = "none";

})

const book_summary_new = document.querySelector('.book_summary_new');
const tittle_new = document.querySelector('.tittle_new');
const author_new = document.querySelector('.author_new');
const isbn_new = document.querySelector('.isbn_new')
const data_fetch = document.querySelector('.data_fetch');
data_fetch.addEventListener('click', async () => {
    if (tittle_new.value != "" && author_new.value != "" && isbn_new.value == ""){
        const book_tittle = tittle_new.value.replaceAll(" ", "%20");
        const book_author = author_new.value.replaceAll(" ", "%20");
        const response = await fetch ('https://www.googleapis.com/books/v1/volumes?q=' + book_tittle +'+inauthor:' + book_author)
        console.log('https://www.googleapis.com/books/v1/volumes?q=' + book_tittle +'+inauthor:' + book_author)
        const thingy = await response.json()
        console.log(thingy.items[0].volumeInfo)
        const book_isbn = thingy.items[0].volumeInfo.industryIdentifiers[0].identifier
        const stuffy = await fetch('https://openlibrary.org/search.json?q=' + book_isbn)
        const stuffy_2 = await stuffy.json()
        try{
            book_summary_new.value = thingy.items[0].volumeInfo.description;

        }catch{
            alert("No summary Found");
        }
        let book_description;
        let book_image_from_thingy;
        try{
            book_image_from_thingy = stuffy_2.docs[0].cover_edition_key;
            if (book_image_from_thingy == null){
                book_image_from_thingy = stuffy_2.docs[1].cover_edition_key;

            }

            console.log(book_image_from_thingy)
        }catch {
            alert("PULLING FROM UN THINGY VERIFIED SOURCEEEE IDK WHAT TO CALL IT ")
        }
        
        if (book_image_from_thingy != null){
            book_image_new.value = "https://covers.openlibrary.org/b/olid/"+ book_image_from_thingy +".jpg"
            updates_image_thingy();
        }else{
            console.log('https://openlibrary.org/search.json?q=' + thingy.items[0].volumeInfo.title.replaceAll(" ", "%20") + '&author=' + thingy.items[0].volumeInfo.authors[0].replaceAll(" ", "%20"))
            const stuffy_3 = await fetch('https://openlibrary.org/search.json?q=' + thingy.items[0].volumeInfo.title.substring(0, 20).replaceAll(" ", "%20") + '&author=' + thingy.items[0].volumeInfo.authors[0].replaceAll(" ", "%20"));
            const stuffy_4 = await stuffy_3.json();
            try{
                book_image_from_thingy = stuffy_4.docs[0].cover_edition_key;
                if (book_image_from_thingy == null){
                    book_image_from_thingy = stuffy_4.docs[1].cover_edition_key;
                }
            }catch{
                alert("No image pulled")
            }
            if (book_image_from_thingy != null){
                book_image_new.value = "https://covers.openlibrary.org/b/olid/"+ book_image_from_thingy +".jpg"
                updates_image_thingy();
            }
        }
    }else if(isbn_new.value != ""){
        const response = await fetch ('https://www.googleapis.com/books/v1/volumes?q=' + isbn_new.value)
        const thingy = await response.json()
        try{
            author_new.value = thingy.items[0].volumeInfo.authors.join(" and ")
            tittle_new.value = thingy.items[0].volumeInfo.title;
            const book_isbn = thingy.items[0].volumeInfo.industryIdentifiers[0].identifier
            const stuffy = await fetch('https://openlibrary.org/search.json?q=' + book_isbn)
            const stuffy_2 = await stuffy.json()
            try{
                book_summary_new.value = thingy.items[0].volumeInfo.description;

            }catch{
                alert("No summary Found");
            }
            let book_description;
            let book_image_from_thingy;
            try{
                book_image_from_thingy = stuffy_2.docs[0].cover_edition_key;
                console.log(book_image_from_thingy)
            }catch {
                alert("PULLING FROM UN THINGY VERIFIED SOURCEEEE IDK WHAT TO CALL IT ")
            }
            
            if (book_image_from_thingy != null){
                book_image_new.value = "https://covers.openlibrary.org/b/olid/"+ book_image_from_thingy +".jpg"
                updates_image_thingy();
            }else{
                console.log('https://openlibrary.org/search.json?q=' + thingy.items[0].volumeInfo.title.replaceAll(" ", "%20") + '&author=' + thingy.items[0].volumeInfo.authors[0].replaceAll(" ", "%20"))
                const stuffy_3 = await fetch('https://openlibrary.org/search.json?q=' + thingy.items[0].volumeInfo.title.substring(0, 20).replaceAll(" ", "%20") + '&author=' + thingy.items[0].volumeInfo.authors[0].replaceAll(" ", "%20"));
                const stuffy_4 = await stuffy_3.json();
                try{
                    book_image_from_thingy = stuffy_4.docs[0].cover_edition_key;
                }catch{
                    alert("No image pulled")
                }
                if (book_image_from_thingy != null){
                    book_image_new.value = "https://covers.openlibrary.org/b/olid/"+ book_image_from_thingy +".jpg"
                    updates_image_thingy();
                }
            }
        }catch{
            alert("ISBN Incorrect")
        }
    }
    else{
        alert("No tittle or author or ISBN")
    }
})
book_image_new.addEventListener("input", debounce(updates_image_thingy, 500))
function updates_image_thingy(){
    if (book_image_new.value == ""){
        image_preview.src = "https://static.vecteezy.com/system/resources/previews/005/720/408/original/crossed-image-icon-picture-not-available-delete-picture-symbol-free-vector.jpg"
    }else{
        image_preview.src = book_image_new.value
    }
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
const container_for_holds = document.querySelector('.container_for_holds');
const book_id_new = document.querySelector('.book_id_new');
const generate_id = document.querySelector('.generate_id');
generate_id.addEventListener('click', async() => {
    const thingy = await Promise.all(booksPROMISE);
    let plop = Number(thingy.at(-1).id) + 1;
    thingy.forEach(element => {
        if (element.id == plop){
            plop += 1;
        }
    });
    book_id_new.value = plop;
    book_id_new.style.color = "green"
})
const validate_id = document.querySelector('.validate_id');
validate_id.addEventListener('click', async() => {
    const thingy = await Promise.all(booksPROMISE);
    const curry = (Number(book_id_new.value));
    let ploppy = true;
    thingy.forEach(element => {
        if (Number(element.id) == curry){
            ploppy = false;
        }
    })
    if (ploppy){
        book_id_new.style.color = "green";
    }else{
        book_id_new.style.color = "red";
    }
})
const genre_new = document.querySelector('.genre_new');
const condition_new = document.querySelector('.condition_new');
const save = document.querySelector('.save');
save.addEventListener('click', async()=> {
    let works = true;
    books.forEach(book => {
        if (book_id_new.value == Number(book.id)){
            works = false;
        }
    })
    if (works && tittle_new.value != "" && author_new.value != ""){
        const newBookRef = ref(rtdb, 'books/' + book_id_new.value);
        await set(newBookRef, {
            "author": author_new.value,
            "tittle": tittle_new.value,
            "avail": true,
            "checkoutby": "",
            "holds": [""],
            "img": book_image_new.value,
            "summary": book_summary_new.value,
            "genre": genre_new.value.toUpperCase(),
            "condition": condition_new.value,
        })
        alert("DONE && WORKED")
        window.location.href = "books.html";
    }else{
        alert("Required Feild Missing");
    }
})
book_add.addEventListener('click', async() => {
    isbn_new.value = "";
    tittle_new.value = "";
    author_new.value = "";
    book_id_new.value = "";
    condition_new.value = "New";
    genre_new.value = "jfic";
    book_image_new.value = "";
    book_summary_new.value = "";
    updates_image_thingy();
    modal_1.style.display = "block";
})
const tittle_new_2 = document.querySelector('.tittle_new_2');
const author_new_2 = document.querySelector('.author_new_2');
const condition_new_2 = document.querySelector('.condition_new_2');
const genre_new_2 = document.querySelector('.genre_new_2');
const data_fetch_2 = document.querySelector('.data_fetch_2');
const image_preview_2 = document.querySelector('.image_preview_2');
const book_summary_2 = document.querySelector('.book_summary_2');
const save_book_info = document.querySelector('.save_book_info');
const modal_2 = document.querySelector('.modal_2');
const close_modal_2 = document.querySelector('.close_modal_2');
const book_image_new_2 = document.querySelector('.book_image_new_2');
const isbn_new_2 = document.querySelector('.isbn_new_2');
const book_id_new_thingy = document.querySelector('.book_id_new_thingy');
const user_hold = document.getElementById('user_hold');
close_modal_2.addEventListener('click' , () => {
    modal_2.style.display = 'none';
})
let curr_thingy_book_new = 0;
book_container.addEventListener('click', async(event) => {
    if (event.target.matches('.delete')){
        const book = event.target.closest('.book');
        const book_ref = ref(rtdb, 'books/' + book.dataset.bookid);
        const book_snap = await get(book_ref);
        let curr_book = book_snap.val();
        const confirmation = confirm("Are you sure you want to delete this book");
        if (confirmation && curr_book.checkoutby == "" && curr_book.holds == ""){
            await remove(book_ref);
            alert("Successfull");
            window.location.href = "books.html";
        }else{
            if (confirmation){
                alert("Please make sure that the book has no holds and is not currently checked out before deletion");

            }
        }
    } else if(event.target.matches('.edit')){
            const book = event.target.closest('.book');
            const book_ref = ref(rtdb, 'books/' + book.dataset.bookid);
            const book_snap = await get(book_ref);
            curr_thingy_book_new = book.dataset.bookid;
            let curr_book = book_snap.val();
            book_id_new_thingy.textContent = "Book ID: " + book.dataset.bookid;
            tittle_new_2.value = curr_book.tittle;
            author_new_2.value = curr_book.author;
            condition_new_2.value = curr_book.condition;
            genre_new_2.value = curr_book.genre.toLowerCase();
            book_summary_2.value = curr_book.summary;
            book_image_new_2.value = curr_book.img;
            updates_image_thingy_2();
            container_for_holds.innerHTML = "";
            if (curr_book.avail == false){
                if (curr_book.checkoutby != ""){    
                    const book_thingy = user_hold.content.cloneNode(true).children[0];
                    book_thingy.dataset.uid = curr_book.checkoutby.split("&&&")[0];
                    const docSnapshot = await getDoc(doc(db, "users", curr_book.checkoutby.split("&&&")[0]));
                    const docSnap = docSnapshot.data()    
                    const thing = new Date(Number(curr_book.checkoutby.split("&&&")[1]))
                    book_thingy.querySelector('.user_name').textContent = "Name: " + docSnap.name;
                    book_thingy.querySelector('.user_email').textContent = "Email: " + docSnap.email;
                    book_thingy.querySelector('.book_date_2').textContent = "Due By: " + thing.toLocaleDateString().replaceAll("\n", "")
                    book_thingy.querySelector('.cancel_hold').style.display = "none";
                    book_thingy.querySelector('.book_action').textContent = "Check In";
                    book_thingy.querySelector('.user_type').textContent = "Type: Checkout"
                    container_for_holds.append(book_thingy)
                }else if(curr_book.holds[0].split("&&&")[0] == "pickup"){
                    const book_thingy = user_hold.content.cloneNode(true).children[0];
                    book_thingy.dataset.uid = curr_book.holds[0].split("&&&")[1]
                    const docSnapshot = await getDoc(doc(db, "users", curr_book.holds[0].split("&&&")[1]));
                    const docSnap = docSnapshot.data()    
                    const thing = new Date(Number(curr_book.holds[0].split("&&&")[2]));
                    book_thingy.querySelector('.user_name').textContent = "Name: " + docSnap.name;
                    book_thingy.querySelector('.user_email').textContent = "Email: " + docSnap.email;
                    book_thingy.querySelector('.book_date_2').textContent = "Pickup By: " + thing.toLocaleDateString().replaceAll("\n", "")
                    book_thingy.querySelector('.cancel_hold').textContent = "Cancel Pickup";
                    book_thingy.querySelector('.book_action').textContent = "Check Out";
                    book_thingy.querySelector('.user_type').textContent = "Type: Pickup"
                    container_for_holds.append(book_thingy);
                }
                if (curr_book.checkoutby != "" && curr_book.holds[0] != ""){
                    curr_book.holds.forEach( async(element) => {
                        const book_thingy = user_hold.content.cloneNode(true).children[0];
                        book_thingy.dataset.uid = element.split("&&&")[1];
                        const docSnapshot = await getDoc(doc(db, "users", element.split("&&&")[1]));
                        const docSnap = docSnapshot.data()    
                        const thing = new Date(Number(element.split("&&&")[2]));
                        book_thingy.querySelector('.user_name').textContent = "Name: " + docSnap.name;
                        book_thingy.querySelector('.user_email').textContent = "Email: " + docSnap.email;
                        book_thingy.querySelector('.cancel_hold').textContent = "Cancel Hold";
                        book_thingy.querySelector('.book_action').style.display = "none";
                        book_thingy.querySelector('.user_type').textContent = "Type: Hold"
                        book_thingy.querySelector('.cancel_hold').style.marginRight = "0%"

                        let thingyss = "Estimated Date: Unknown"
                        let nummy = -1;
                        for (let x = 0; x < curr_book.holds.length; x++){
                            if (curr_book.holds[x].includes(element.split("&&&")[1])){
                                nummy = x;
                                break;
                            }
                        }
                        if (nummy != -1 && curr_book.checkoutby != ""){
                            let now = new Date(Number(curr_book.checkoutby.split("&&&")[1]))
                            now.setDate(now.getDate() + (nummy) * 14)
                            thingyss = "Estimated Date: " + now.toLocaleDateString();

                        }else if(nummy != -1 && curr_book.checkoutby == ""){
                            let now = new Date()
                            now.setDate(now.getDate() + (nummy)  * 14)
                            thingyss = "Estimated Date: " + now.toLocaleDateString();
                        }
                        book_thingy.querySelector('.book_date_2').textContent = thingyss
                        container_for_holds.append(book_thingy)
                    });
                }else if (curr_book.holds[0].split("&&&")[0] == "pickup" && curr_book.holds.length > 1){
                    curr_book.holds.forEach(async(element) => {
                        if (element.split("&&&")[0] != "pickup"){
                            const book_thingy = user_hold.content.cloneNode(true).children[0];
                            book_thingy.dataset.uid = element.split("&&&")[1];
                            const docSnapshot = await getDoc(doc(db, "users", element.split("&&&")[1]));
                            const docSnap = docSnapshot.data()    
                            const thing = new Date(Number(element.split("&&&")[2]));
                            book_thingy.querySelector('.user_name').textContent = "Name: " + docSnap.name;
                            book_thingy.querySelector('.user_email').textContent = "Email: " + docSnap.email;
                            book_thingy.querySelector('.cancel_hold').textContent = "Cancel Hold";
                            book_thingy.querySelector('.book_action').style.display = "none";
                            book_thingy.querySelector('.user_type').textContent = "Type: Hold"
                            book_thingy.querySelector('.cancel_hold').style.marginRight = "1%"
                            let thingyss = "Estimated Date: Unknown"
                            let nummy = -1;
                            for (let x = 0; x < curr_book.holds.length; x++){
                                if (curr_book.holds[x].includes(element.split("&&&")[1])){
                                    nummy = x;
                                    break;
                                }
                            }
                            if (nummy != -1 && curr_book.checkoutby != ""){
                                let now = new Date(Number(curr_book.checkoutby.split("&&&")[1]))
                                now.setDate(now.getDate() + (nummy) * 14)
                                thingyss = "Estimated Date: " + now.toLocaleDateString();

                            }else if(nummy != -1 && curr_book.checkoutby == ""){
                                let now = new Date()
                                now.setDate(now.getDate() + (nummy)  * 14)
                                thingyss = "Estimated Date: " + now.toLocaleDateString();
                            }
                            book_thingy.querySelector('.book_date_2').textContent = thingyss
                            container_for_holds.append(book_thingy)
                        }
                    });
                }
            }
            modal_2.style.display = 'block';
    }
})
function updates_image_thingy_2(){
    if (book_image_new_2.value == ""){
        image_preview_2.src = "https://static.vecteezy.com/system/resources/previews/005/720/408/original/crossed-image-icon-picture-not-available-delete-picture-symbol-free-vector.jpg"
    }else{
        image_preview_2.src = book_image_new_2.value
    }
}

book_image_new_2.addEventListener("input", updates_image_thingy_2)
data_fetch_2.addEventListener('click', async () => {
    if (tittle_new_2.value != "" && author_new_2.value != "" && isbn_new.value == ""){
        const book_tittle = tittle_new_2.value.replaceAll(" ", "%20");
        const book_author = author_new_2.value.replaceAll(" ", "%20");
        const response = await fetch ('https://www.googleapis.com/books/v1/volumes?q=' + book_tittle +'+inauthor:' + book_author)
        console.log('https://www.googleapis.com/books/v1/volumes?q=' + book_tittle +'+inauthor:' + book_author)
        const thingy = await response.json()
        try{
            const book_isbn = thingy.items[0].volumeInfo.industryIdentifiers[0].identifier
            const stuffy = await fetch('https://openlibrary.org/search.json?q=' + book_isbn)
            const stuffy_2 = await stuffy.json()
            try{
                book_summary_2.value = thingy.items[0].volumeInfo.description;

            }catch{
                alert("No summary Found");
            }
            let book_description;
            let book_image_from_thingy;
            try{
                book_image_from_thingy = stuffy_2.docs[0].cover_edition_key;
                if (book_image_from_thingy == null){
                    book_image_from_thingy = stuffy_2.docs[1].cover_edition_key;
                }
                console.log(book_image_from_thingy)
            }catch {
                alert("PULLING FROM UN THINGY VERIFIED SOURCEEEE IDK WHAT TO CALL IT ")
            }
            
            if (book_image_from_thingy != null){
                book_image_new_2.value = "https://covers.openlibrary.org/b/olid/"+ book_image_from_thingy +".jpg"
                updates_image_thingy_2();
            }else{
                console.log('https://openlibrary.org/search.json?q=' + thingy.items[0].volumeInfo.title.replaceAll(" ", "%20") + '&author=' + thingy.items[0].volumeInfo.authors[0].replaceAll(" ", "%20"))
                const stuffy_3 = await fetch('https://openlibrary.org/search.json?q=' + thingy.items[0].volumeInfo.title.substring(0, 20).replaceAll(" ", "%20") + '&author=' + thingy.items[0].volumeInfo.authors[0].replaceAll(" ", "%20"));
                const stuffy_4 = await stuffy_3.json();
                try{
                    book_image_from_thingy = stuffy_4.docs[0].cover_edition_key;
                    if (book_image_from_thingy == null){
                        book_image_from_thingy = stuffy_4.docs[1].cover_edition_key;
                    }
                }catch{
                    alert("No image pulled")
                }
                if (book_image_from_thingy != null){
                    book_image_new_2.value = "https://covers.openlibrary.org/b/olid/"+ book_image_from_thingy +".jpg"
                    updates_image_thingy_2();
                }
            }       
        }catch{
            alert("No Information Found");
        }
    }else if(isbn_new_2.value != ""){
        const response = await fetch ('https://www.googleapis.com/books/v1/volumes?q=' + isbn_new_2.value)
        const thingy = await response.json()
        try{
            author_new_2.value = thingy.items[0].volumeInfo.authors.join(" and ")
            tittle_new_2.value = thingy.items[0].volumeInfo.title;
            const book_isbn = thingy.items[0].volumeInfo.industryIdentifiers[0].identifier
            const stuffy = await fetch('https://openlibrary.org/search.json?q=' + book_isbn)
            const stuffy_2 = await stuffy.json()
            try{
                book_summary_2.value = thingy.items[0].volumeInfo.description;

            }catch{
                alert("No summary Found");
            }
            let book_description;
            let book_image_from_thingy;
            try{
                book_image_from_thingy = stuffy_2.docs[0].cover_edition_key;
                console.log(book_image_from_thingy)
            }catch {
                alert("PULLING FROM UN THINGY VERIFIED SOURCEEEE IDK WHAT TO CALL IT ")
            }   
            if (book_image_from_thingy != null){
                book_image_new_2.value = "https://covers.openlibrary.org/b/olid/"+ book_image_from_thingy +".jpg"
                updates_image_thingy_2();
            }else{
                console.log('https://openlibrary.org/search.json?q=' + thingy.items[0].volumeInfo.title.replaceAll(" ", "%20") + '&author=' + thingy.items[0].volumeInfo.authors[0].replaceAll(" ", "%20") )
                const stuffy_3 = await fetch('https://openlibrary.org/search.json?q=' + thingy.items[0].volumeInfo.title.substring(0, 20).replaceAll(" ", "%20") + '&author=' + thingy.items[0].volumeInfo.authors[0].replaceAll(" ", "%20"));
                const stuffy_4 = await stuffy_3.json();
                try{
                    book_image_from_thingy = stuffy_4.docs[0].cover_edition_key;
                }catch{
                    alert("No image pulled")
                }
                if (book_image_from_thingy != null){
                    book_image_new_2.value = "https://covers.openlibrary.org/b/olid/"+ book_image_from_thingy +".jpg"
                    updates_image_thingy_2();
                }
            }
        }catch{
            alert("ISBN Incorrect")
        }
    }
    else{
        alert("No tittle or author or ISBN")
    }
})

save_book_info.addEventListener('click', async() => {
    if (tittle_new_2.value != "" && author_new_2.value != ""){
        const newBookRef = ref(rtdb, 'books/' + curr_thingy_book_new);
        await update(newBookRef, {
            "author": author_new_2.value,
            "tittle": tittle_new_2.value,
            "img": book_image_new_2.value,
            "summary": book_summary_2.value,
            "genre": genre_new_2.value.toUpperCase(),
            "condition": condition_new_2.value,
        })
        alert("THINGY WORKSSSSSSSSSSSS")
        window.location.href = "books.html";
    }
})

container_for_holds.addEventListener('click', async(event) => {
    if (event.target.matches('.book_action')){
        const book_action = event.target.closest('.book_action')
        const userId = event.target.closest('.user_holds').dataset.uid;
        const book_id = String(curr_thingy_book_new);
        const bookREF = ref(rtdb, 'books/' + String(book_id));
        let something = await get(bookREF);
        let curr_book = something.val();
        const user_ref = doc(db, "users", String(userId))
        const thingyp = await getDoc(user_ref)
        const user_data = await thingyp.data()
        let confirmation;
        if (book_action.textContent == "Check In"){
            confirmation = confirm("Are you sure u want to check this book in: Book ID: " + book_id);
        }else{
            confirmation = confirm("Are you sure you want to check this book out: Book ID: " + book_id);
        }

        if (book_action.textContent == "Check In" && confirmation){
            loading_thingy.style.visibility = "visible";
            if (curr_book.holds[0] == ""){
                update(bookREF, {checkoutby: "", avail: true})
                if (user_data.book1.split("&&")[1] == String(book_id)){
                    await setDoc(user_ref, {book1: user_data.book2, book1_time: user_data.book2_time, book2: user_data.book3, book2_time: user_data.book3_time, book3: "", book3_time: 0}, {merge: true})
                }else if (user_data.book2.split("&&")[1] == String(book_id)){
                    await setDoc(user_ref, {book2: user_data.book3, book3: user_data.book3_time, book3: "", book3_time: 0}, {merge: true});
                }else if (user_data.book3.split("&&")[1] == String(book_id)){
                    await setDoc(user_ref, {book3: "", book3_time: 0}, {merge: true})
                }
                loading_thingy.style.visibility = "hidden";
                alert("Book Checked In")
                window.location.href = "books.html"
            }else{
                let pop = curr_book.holds[0].split("&&&")
                pop[0] = "pickup";
                const new_data = Date.now() + 604800000;
                pop[2] = String(new_data);
                let updated_hold = pop.join("&&&");
                curr_book.holds[0] = updated_hold;
                update(bookREF, {checkoutby: "", holds: curr_book.holds});
                if (user_data.book1.split("&&")[1] == String(book_id)){
                    await setDoc(user_ref, {book1: user_data.book2, book1_time: user_data.book2_time, book2: user_data.book3, book2_time: user_data.book3_time, book3: "", book3_time: 0}, {merge: true})
                }else if (user_data.book2.split("&&")[1] == String(book_id)){
                    await setDoc(user_ref, {book2: user_data.book3, book3: user_data.book3_time, book3: "", book3_time: 0}, {merge: true});
                }else if (user_data.book3.split("&&")[1] == String(book_id)){
                    await setDoc(user_ref, {book3: "", book3_time: 0}, {merge: true})
                }
                const user_2 = doc(db, "users", String(pop[1]));
                const user_2_snap = await getDoc(user_2);
                const user_2_data = user_2_snap.data();
                let user_2_hold = "pickup&&" + book_id;
                if (user_2_data.hold1.split("&&")[1] == String(book_id)){
                    await setDoc(user_2, {hold1: user_2_hold, hold1_time: String(new_data)}, {merge: true});
                }else if (user_2_data.hold2.split("&&")[1] == String(book_id)){
                    await setDoc(user_2, {hold2: user_2_hold, hold2_time: String(new_data)}, {merge: true});
                }else if (user_2_data.hold2.split("&&")[1] == String(book_id)){
                    await setDoc(user_2, {hold3: user_2_hold, hold3_time: String(new_data)}, {merge: true});
                }
                const request = await fetch("https://on-request-emailing-b4rcicpmhq-uc.a.run.app/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify({
                    'tittle': "" + curr_book.tittle,
                    'email': "" + user_2_data.email,
                    'bookid': "" + book_id,
                    })
                })
                const request_text = await request.text()
                if (!request_text.includes("IT WORKSSSSSSSSSS")){
                    alert("EmAILING ERROR" + String(request_text));
                }
                alert("Book Checked In");
                window.location.href = "books.html"

            }
            loading_thingy.style.visibility = "hidden";
        }else if (book_action.textContent == "Check Out" && confirmation){
            if (curr_book.holds[0].split("&&&")[1] == String(userId) && (user_data.book1 == "" || user_data.book2 == "" || user_data.book3 == "")){
                loading_thingy.style.visibility = "visible";
                curr_book.holds.shift();
                if (curr_book.holds[0] == null){
                curr_book.holds = [""];
                }
                const floppy = Date.now() + 1209600000;
                update(bookREF, {holds: curr_book.holds, checkoutby: String(userId) + "&&&" + String(floppy)})
                if (user_data.hold1.split("&&")[1] == String(book_id)){
                    await setDoc(user_ref, {hold1: user_data.hold2, hold1_time: user_data.hold2_time, hold2: user_data.hold3, hold2_time: user_data.hold3_time, hold3: "", hold3_time: 0}, {merge: true});
                }else if (user_data.hold2.split("&&")[1] == String(book_id)){
                    await setDoc(user_ref, {hold2: user_data.hold3, hold2_time: user_data.hold3_time, hold3: "", hold3_time: 0}, {merge: true});
                }else if (user_data.hold3.split("&&")[1] == String(book_id)){
                    await setDoc(user_ref, {hold3: "", hold3_time: 0}, {merge: true});
                }
                if (user_data.book1 == ""){
                    await setDoc(user_ref, {book1: "checkout&&" + book_id, book1_time: floppy}, {merge: true});
                }else if (user_data.book2 == ""){
                    await setDoc(user_ref, {book2: "checkout&&" + book_id, book2_time: floppy}, {merge: true});
                }else if (user_data.book3 == ""){
                    await setDoc(user_ref, {book3: "checkout&&" + book_id, book3_time: floppy}, {merge: true});
                }
                let response = await fetch("https://on-request-checkout-448364021608.us-central1.run.app/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8"
                    },
                    body: JSON.stringify({
                        'email': "" + user_data.email,
                        'name': "" + user_data.name,
                        'tittle': "" + curr_book.tittle,
                        'date': "" + floppy,
                    })
                })
                let thingygg = await response.text()
                if (!thingygg.includes("IT WORKSSSSSSSSSS")){
                    alert("ERROR IN EMAILING USER")
                }
                loading_thingy.style.visibility = "hidden";
                alert("BOOK SUCCESSFULLY CHECKED OUT")
                window.location.href = "books.html";
            }else{
                if (!(user_data.book1 == "" || user_data.book2 == "" || user_data.book3 == "")){
                    alert("User already has 3 books checked out");
                }
            }
        }
    } else if (event.target.matches('.cancel_hold')){
        const book = event.target.closest('.book');
        const bookref = ref(rtdb, 'books/' + String(curr_thingy_book_new));
        const userId = event.target.closest('.user_holds').dataset.uid;
        alert(userId)
        let thingy = await get(bookref)
        let curr_book = thingy.val();
        let line;
        const confirmation = confirm("Are you sure you want to delete this hold/pickup for bookID: " + String(curr_thingy_book_new));
        if (confirmation){
            for (let x = 0; x < curr_book.holds.length; x++){
            if (curr_book.holds[x].includes(userId)){
                line = x;
                break;
            }
            }
            let hold_info = curr_book.holds[line].split("&&&")
            curr_book.holds.splice(line, 1)
            if (curr_book.holds == ""){
                if (curr_book.checkoutby == ""){
                    update(bookref, {avail: true,})
                }
                curr_book.holds = [""];
                update(bookref, {holds: curr_book.holds,})
                const userDocRef = doc(db, "users", userId);
                const docSnapshot = await getDoc(doc(db, "users", userId));
                const docSnap = docSnapshot.data()    
                if (docSnap.hold1.split("&&")[1] == String(curr_thingy_book_new)){
                    await setDoc(userDocRef, {hold1: docSnap.hold2}, {merge: true});
                    await setDoc(userDocRef, {hold1_time: docSnap.hold2_time}, {merge: true});
                    await setDoc(userDocRef, {hold2: docSnap.hold3}, {merge: true});
                    await setDoc(userDocRef, {hold2_time: docSnap.hold3_time}, {merge: true});
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true});
                }
                if (docSnap.hold2.split("&&")[1] == String(curr_thingy_book_new)){
                    await setDoc(userDocRef, {hold2: docSnap.hold3}, {merge: true});
                    await setDoc(userDocRef, {hold2_time: docSnap.hold3_time}, {merge: true});
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true}); 
                }if (docSnap.hold3.split("&&")[1] == String(curr_thingy_book_new)){
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true});
                }

                alert("Successfully Deleted Hold/Pickup")
                window.location.href = "books.html"
            }else if(hold_info[0] == "pickup"){
                loading_thingy.style.visibility = "visible";
                let book_thing = curr_book.holds[0].split("&&&")
                book_thing[0] = "pickup"
                const user_2_time = Date.now() + 604800000
                book_thing[2] = "" + user_2_time;
                curr_book.holds[0] = book_thing.join("&&&")
                update(bookref, {holds: curr_book.holds,})
                const userDocRef = doc(db, "users", userId);
                const docSnapshot = await getDoc(doc(db, "users", userId));
                const docSnap = docSnapshot.data()    
                if (docSnap.hold1.split("&&")[1] == String(curr_thingy_book_new)){
                    await setDoc(userDocRef, {hold1: docSnap.hold2}, {merge: true});
                    await setDoc(userDocRef, {hold1_time: docSnap.hold2_time}, {merge: true});
                    await setDoc(userDocRef, {hold2: docSnap.hold3}, {merge: true});
                    await setDoc(userDocRef, {hold2_time: docSnap.hold3_time}, {merge: true});
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true});
                }
                if (docSnap.hold2.split("&&")[1] == String(curr_thingy_book_new)){
                    await setDoc(userDocRef, {hold2: docSnap.hold3}, {merge: true});
                    await setDoc(userDocRef, {hold2_time: docSnap.hold3_time}, {merge: true});
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true}); 
                }if (docSnap.hold3.split("&&")[1] == String(curr_thingy_book_new)){
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true});
                }
                const user_2_docref = doc(db, "users", String(book_thing[1]));
                const user_2_sn = await getDoc(user_2_docref);
                const user_2_snap = user_2_sn.data();
                if (user_2_sn.exists()){
                    if (user_2_snap.hold1.split("&&")[1] == String(curr_thingy_book_new)){
                        await setDoc(user_2_docref, { hold1: "pickup&&" + String(curr_thingy_book_new), hold1_time: user_2_time}, { merge: true });
                    }else if(user_2_snap.hold2.split("&&")[1] == String(curr_thingy_book_new)){
                        await setDoc(user_2_docref, { hold2: "pickup&&" + String(curr_thingy_book_new), hold2_time: user_2_time}, { merge: true });
                    }else if(user_2_snap.hold3.split("&&")[1] == String(curr_thingy_book_new)){
                        await setDoc(user_2_docref, { hold3: "pickup&&" + String(curr_thingy_book_new), hold2_time: user_2_time}, {merge: true});
                    }
                    await fetch("https://on-request-emailing-b4rcicpmhq-uc.a.run.app/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8"
                    },
                    body: JSON.stringify({
                        'tittle': "" + curr_book.tittle,
                        'email': "" + user_2_snap.email,
                        'bookid': "" + String(curr_thingy_book_new),
                    })
                    })
                    .then(response => {
                    if (!response.ok) {
                        alert("SOMETHING HAS GONE HORRRIBLY WRONG IDK WHAT")
                    }
                    })
                    alert("Successfully Deleted Hold/Pickup")
                    window.location.href = "books.html"
                }else{
                    alert("MAJOR ERROR IN DATABASE PLEASE INFORM ADMIN");
                }
            }

            if (hold_info[0] != "pickup"){alert("Successfully Deleted Hold/Pickup")}
            loading_thingy.style.visibility = "hidden"
        }
        }






























})



















































