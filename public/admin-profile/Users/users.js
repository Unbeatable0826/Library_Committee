import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
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
const loading_thingy = document.querySelector('.loading_wrapper')
const rtdb = getDatabase(app); 
const users_template = document.getElementById("data-user-template");
const usersList = document.querySelector(".user_card_container");
const nameElem = document.getElementById("name");
let users = [];
let userID;
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnapshot = await getDoc(userDocRef);
            userID = user.uid; 
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                if (!userData.admin){
                    window.location.href="../../Login_Folder/login.html"
                }
                nameElem.textContent = "Welcome Back Library Admin, " + userData.name.substr(0, 20);
                const usersRef = collection(db, "users");
                const usersSnapshot = await getDocs(usersRef);
                users = usersSnapshot.docs.map((doc) => {
                    let  clone = users_template.content.cloneNode(true).children[0];
                    clone.querySelector('.user_name').textContent = doc.data().name;
                    clone.querySelector('.user_email').textContent = doc.data().email;
                    clone.querySelector('.user_uid').textContent = doc.id;
                    clone.querySelector('.view').dataset.userId = doc.id;
                    clone.querySelector('.delete').dataset.userId = doc.id
                    if (doc.data().admin){
                        clone.querySelector('.user_name').style.color = "red";
                    }
                    usersList.append(clone);
                    return {id: doc.id, element: clone, email: doc.data().email, name: doc.data().name};
                });
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
search.addEventListener("input", () =>{
    const value = search.value.toLowerCase();
    users.forEach((user) => {
        const isVisible = user.name.toLowerCase().includes(value) || user.email.toLowerCase().includes(value) || user.id.toLowerCase().includes(value);
        console.log(value);
        user.element.classList.toggle("hide", !isVisible);
        })
});
// Delete button thingyu

const close_modal = document.querySelector('.close');
close_modal.addEventListener('click', () => {
    modal.style.display = 'none';
});
const user_name_modal = document.querySelector('.user_name_modal');
const user_email_modal = document.querySelector('.user_email_modal');
const user_uid_modal = document.querySelector('.user_uid_modal');
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

const user_info_modal = document.querySelector('.user_information_modal')
const book_template = document.getElementById("data-user-book-template");
let userId;
const modal = document.querySelector('.modal');
const checkoutinfo_modal = document.querySelector('.checked_out_info_modal')
const holdsinfo_modal = document.querySelector('.holds_out_info_modal')
usersList.addEventListener('click', async(event) => {
    if (event.target.matches('.view')) {
        const user = event.target.closest('.user');
        userId = event.target.dataset.userId;
        user_info_modal.innerHTML = "";
        let curr_user = doc(db, "users", userId);
        const snap = await getDoc(curr_user);
        const user_data = snap.data()
        const check_elements = ["book1", "book2", "book3"];
        const hold_elements = ["hold1", "hold2", "hold3"];
        user_name_modal.value =  user_data.name;
        user_email_modal.value = user_data.email
        user_uid_modal.textContent = "UID: " + userId + "   (Keep in mind for uer role change)";
        let check_elements_num = 0;
        let hold_elements_num = 0;
        check_elements.forEach((eelement, index) => {
            if (user_data[eelement] != ""){
                check_elements_num += 1;
            }
        })
        hold_elements.forEach((element, index) => {
            if (user_data[element] != ""){
                hold_elements_num += 1;
            }
        })
        checkoutinfo_modal.textContent = "Books Checked Out: " + check_elements_num;
        holdsinfo_modal.textContent = "Books On Hold: " + hold_elements_num;
        for (const book of check_elements){
            if (user_data[book] != ""){
                let clone = book_template.content.cloneNode(true)
                let bookREF = ref(rtdb, 'books/' + String(user_data[book].split("&&")[1]))
                let thingy = await get(bookREF)
                let curr_book = thingy.val();
                let poppy = new Date(Number(curr_book.checkoutby.split("&&&")[1]))
                if (Number(curr_book.checkoutby.split("&&&")[1]) <= Date.now()){
                    clone.querySelector('.book_tittle').style.color = "red  "
                }
                clone.querySelector('.book_date').textContent = "Due By: " + poppy.toLocaleDateString();
                clone.querySelector('.book_tittle').textContent = "Title: " + curr_book.tittle + " | BOOKID: " + String(user_data[book].split("&&")[1]);
                clone.querySelector('.book_author').textContent = "Author: " + curr_book.author;
                clone.querySelector('.cancel_hold').style.display = "none";
                clone.querySelector('.book_action').textContent = "Check In";
                clone.querySelector('.book_action').dataset.bookid = String(user_data[book].split("&&")[1]);
                user_info_modal.append(clone);
            }
        }
        for (const book of hold_elements){
            if (user_data[book] != ""){
                let clone = book_template.content.cloneNode(true)
                clone.querySelector('.book').style.background = 'rgb(149, 152, 153)'
                let bookREF = ref(rtdb, 'books/' + String(user_data[book].split("&&")[1]))
                let thingy = await get(bookREF);
                let curr_book = thingy.val();
                if ("pickup" == String(user_data[book].split("&&")[0])){
                    let thingys  = new Date(Number(curr_book.holds[0].split("&&&")[2]));
                    clone.querySelector('.book_date').textContent = "Pickup By: " + thingys.toLocaleDateString(); 
                }else{
                    let thingyss = "Estimated Date: Unknown"
                    let nummy = -1;
                    for (let x = 0; x < curr_book.holds.length; x++){
                        if (curr_book.holds[x].includes(userId)){
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
                    clone.querySelector('.book_date').textContent = "" + thingyss + " | Number in Holds: " + nummy;
                }
                clone.querySelector('.book_tittle').textContent = "Title: " + curr_book.tittle + " | BOOKID: " + String(user_data[book].split("&&")[1]);
                clone.querySelector('.book_author').textContent = "Author: " + curr_book.author;
                clone.querySelector('.cancel_hold').textContent = "Cancel " + String(user_data[book].split("&&")[0]);
                clone.querySelector('.book_action').dataset.bookid = clone.querySelector('.book_author').dataset.bookid = String(user_data[book].split("&&")[1]);
                clone.querySelector('.cancel_hold').dataset.bookid = String(user_data[book].split("&&")[1]);

                if (!(String(user_data[book].split("&&")[0]) == "pickup")){
                    clone.querySelector('.book_action').style.display = "none";
                    clone.querySelector('.cancel_hold').style.marginRight = "0vw";
                    clone.querySelector('.cancel_hold').dataset.bookid = String(user_data[book].split("&&")[1]);
                }else{
                    clone.querySelector('.book_action').textContent = "Check Out"
                }   
                user_info_modal.append(clone);
            }
        }
        modal.style.display = 'block';
    }else if (event.target.matches('.delete')){
        const user = event.target.closest('.user');
        userId = event.target.dataset.userId;
        let curr_user = doc(db, "users", userId);
        const snap = await getDoc(curr_user);
        const user_data = snap.data()
        const confirmation = confirm("Are you sure you want to delete " + user_data.name + "'s account?")
        if (confirmation && user_data.hold1 == "" && user_data.hold2 == "" && user_data.hold3 == "" && user_data.book1 == "" && user_data.book2 == "" && user_data.book3 == ""){
            loading_thingy.style.visibility = "visible";
            let response =  await fetch("https://deleteaccount-448364021608.us-central1.run.app/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                'email': "" + user_data.email,
                'userid': "" + userId,
                'auth_user': "" + userID,
                'name': "" + user_data.name,
            })
            })
            const request = await response.text()
            if (request.includes("IT WORK")){
                alert("ACCOUNT DELETION SUCCESS")
            }else{
                alert("ERROR ,alert Admin")
            }

        }else{
            if (!(user_data.hold1 == "" && user_data.hold2 == "" && user_data.hold3 == "" && user_data.book1 == "" && user_data.book2 == "" && user_data.book3 == "")){
                alert("User Must have no holds or books checked out before deletion!!!!");
            }
        }
    }
})


const modal_2 = document.querySelector('.modal_2')
const check_avail_but = document.querySelector('.check_availibility')
const book_id_modal_2 = document.querySelector('.book_id_input')
const modal_2_close = document.querySelector('.close_modal_2');
const modal_2_tittle = document.querySelector('.modal_2_tittle');
const modal_2_author = document.querySelector('.modal_2_author');
const modal_2_genre = document.querySelector('.modal_2_genre');
const modal_2_date = document.querySelector('.modal_2_date');
const modal_2_description = document.querySelector('.modal_2_description');
const modal_2_book_checkout = document.querySelector('.modal_2_book_checkout');

modal_2_close.addEventListener('click', () => {
    modal_2.style.display = "none";
})
check_avail_but.addEventListener('click', async() => {
        const book_id = String(book_id_modal_2.value)
        let booky = ref(rtdb, "books/" + book_id)
        let thingyp = await get(booky)
        if (thingyp.exists() && book_id != ""){
            const data_currr = thingyp.val()
            modal_2_tittle.textContent = "Title: " + data_currr.tittle;
            modal_2_author.textContent = "Author: " + data_currr.author;
            modal_2_genre.textContent = "Genre: " + data_currr.genre;
           if (data_currr.avail){
                modal_2_date.textContent = "Estimated Date: Available Now !"
           }else{
                var date = new Date();
                date.setDate(date.getDate() + data_currr.holds.length * 14)
                if (data_currr.checkoutby != ""){
                    date.setDate(date.getDate() + 14);
                }
                if (data_currr.holds[0] == ""){
                    date.setDate(date.getDate() - 14);
                }
                modal_2_date.textContent = "Current Holds: " + data_currr.holds.length + " Estimated Date: " + date.toLocaleDateString(); 
           }
           modal_2_description.textContent = "Book Description: " + data_currr.summary;
           if (data_currr.avail == true){
            modal_2_book_checkout.textContent = "Checkout";
           }else{
            modal_2_book_checkout.textContent = "Hold Book";
           }
           
        modal_2.style.display = "block";
        }else{
            alert("BOOK ID NON EXISTANT")
        }
})

const save_button = document.querySelector('.user_info_save_but')
save_button.addEventListener('click', async(event) => {
    const info_name_change = document.querySelector('.user_name_modal').value;
    const info_email_change = document.querySelector('.user_email_modal').value;
    const user_ref = doc(db, "users", userId)
    const snap = await getDoc(user_ref);
    const user_data = snap.data()

    let confirmation = confirm("Are you sure you want to change " + user_data.name + "'s Information?")
    if (confirmation && info_name_change != user_data.name || info_email_change != user_data.email){
        loading_thingy.style.visibility = "visible";
        let response = await fetch("https://updateemail-448364021608.us-central1.run.app/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                'auth_user': "" + userID,
                'update_user': "" + userId,
                'update_email': "" + info_email_change,
            })
            })
        let thingy = await response.text()
        if (thingy.includes("IT WORK")){
            loading_thingy.style.visibility = "hidden";
            await setDoc(user_ref, { email: info_email_change, name: info_name_change }, { merge: true })
            alert("Email/Name Update Success");

        }else{
            loading_thingy.style.visibility = "hidden";
            alert("Something Has Gone Horribly Wrong, and there is an error and we are unable to update email. Error: " + thingy);
            window.location.href = "users.html"
        }
    }else{
        if (confirmation){
        alert("No Update Needed");
    }
    }
})
const password_reset_but = document.querySelector('.password_reset')
password_reset_but.addEventListener('click', async() => {
    const user_ref = doc(db, "users", userId)
    const snap = await getDoc(user_ref);
    const user_data = snap.data()
    const confirmation = confirm("Are you sure you want to send password reset email to " + user_data.email);
    if (confirmation){
        sendPasswordResetEmail(auth, user_data.email);
        alert("Password reset email sent | Success")
    }
    
})


modal_2_book_checkout.addEventListener('click', async() => {
    if (modal_2_book_checkout.textContent == "Checkout"){
        const book_id = String(book_id_modal_2.value)
        let booky = ref(rtdb, "books/" + book_id)
        let stuff = await get(booky)
        const book = stuff.val()
        const thingy = doc(db, "users", String(userId))
        const thingyp = await getDoc(thingy)
        const user_data = thingyp.data()
        const confirmation = confirm("Are you sure you want to check this book out for " + user_data.name);
        if (confirmation && book.avail == true && user_data.hold1.split('&&')[1] != String(book_id) && user_data.hold2.split('&&')[1] != String(book_id) && user_data.hold3.split('&&')[1] != String(book_id) && user_data.book1.split('&&')[1] != String(book_id) && user_data.book2.split('&&')[1] != String(book_id) && user_data.book3.split('&&')[1] != String(book_id) && (user_data.book1 == "" ||  user_data.book2 == "" || user_data.book3 == "")){
            const check_out_time = Date.now() + 1209600000
            loading_thingy.style.visibility = "visible";
            update(booky, {avail: false, checkoutby: "" + userId  + "&&&" + String(check_out_time)});
            if (user_data.book1 == ""){
                await setDoc(thingy, { book1: "checkout&&" + book_id, book1_time: check_out_time}, {merge: true});
            }else if (user_data.book2 == ""){
                await setDoc(thingy, { book2: "checkout&&" + book_id, book2_time: check_out_time}, {merge: true})
            }else if (user_data.book3 == ""){
                await setDoc(thingy, { book3: "checkout&&" + book_id, book3_time: check_out_time}, {merge: true})
            }else{
                alert("ERROR ALERT ADMIN, SOMETHING WENT TERRIBLY WRONG");
            }
            let response = await fetch("https://on-request-checkout-448364021608.us-central1.run.app/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8"
                    },
                    body: JSON.stringify({
                        'email': "" + user_data.email,
                        'name': "" + user_data.name,
                        'tittle': "" + book.tittle,
                        'date': "" + check_out_time,
                    })
            })
            let thingygg = await response.text()
            if (!thingygg.includes("IT WORKSSSSSSSSSS")){
                alert("ERROR IN EMAILING USER")
            }
            loading_thingy.style.visibility = "visible";
            alert("Book Checked Out");
            window.location.href = "users.html"
        }else{
            if (confirmation){
                if (!(user_data.book1 == "" ||  user_data.book2 == "" || user_data.book3 == "")){
                    alert("Maximum amount of books already checked out by user")
                }else{
                    alert("Book Value Changed or Book already on hold or checked out by user");
                }
        }
            else{
                alert("Action Canceled");
            }
        }
    }else if (modal_2_book_checkout.textContent == "Hold Book"){
        const book_id = String(book_id_modal_2.value)
        let booky = ref(rtdb, "books/" + book_id)
        let stuff = await get(booky)
        const book = stuff.val()
        const thingy = doc(db, "users", String(userId))
        const thingyp = await getDoc(thingy)
        const user_data = thingyp.data()
        const confirmation = confirm("Are you sure you want to hold this book for " + user_data.name);
        if (confirmation && user_data.hold1.split('&&')[1] != String(book_id) && user_data.hold2.split('&&')[1] != String(book_id) && user_data.hold3.split('&&')[1] != String(book_id) && user_data.book1.split('&&')[1] != String(book_id) && user_data.book2.split('&&')[1] != String(book_id) && user_data.book3.split('&&')[1] != String(book_id) && (user_data.hold1 == "" ||  user_data.hold2 == "" || user_data.hold3 == "")){
            loading_thingy.style.visibility = "visible"
            const thing = Date.now() + 6048000000000000
            if (book.holds[0] == ""){
                book.holds[0] = "hold&&&" + userId + "&&&" + String(thing);
            }else{
                book.holds.push("hold&&&" + userId + "&&&" + String(thing));
            }
            if (user_data.hold1 == ""){
                await setDoc(thingy, {hold1: "hold&&" + String(book_id), hold1_time: thing}, {merge: true});
            }else if (user_data.hold2 == ""){
                await setDoc(thingy, {hold2: "hold&&" + String(book_id), hold2_time: thing}, {merge: true});
            }else if (user_data.hold3 == ""){
                await setDoc(thingy, {hold3: "hold&&" + String(book_id), hold3_time: thing}, {merge: true});
            }else{
                alert("ERROR");
            }
            update(booky, {holds: book.holds});
            let response = await fetch("https://on-request-hold-email-448364021608.us-central1.run.app/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8"
                    },
                    body: JSON.stringify({
                        'email': "" + user_data.email,
                        'name': "" + user_data.name,
                        'tittle': "" + book.tittle,
                    })
            })
            let thingygg = await response.text()
            if (!thingygg.includes("IT WORKSSSSSSSSSS")){
                alert("ERROR IN EMAILING USER")
            }
            loading_thingy.style.visibility = "hidden";
            alert("Successfully Held For User")
            window.location.href = "users.html";
        }else{
            if (confirmation){
                if (!(user_data.hold1.split('&&')[1] != String(book_id) && user_data.hold2.split('&&')[1] != String(book_id) && user_data.hold3.split('&&')[1] != String(book_id) && user_data.book1.split('&&')[1] != String(book_id) && user_data.book2.split('&&')[1] != String(book_id) && user_data.book3.split('&&')[1] != String(book_id))){
                    alert("Book already on hold")
                }else{
                    "Maximum amount of books already on hold"
                }
            }
        }
    }
})
const modal_3 = document.querySelector('.modal_3')
const send_custom_email = document.querySelector('.send_custom_email');
const close_modal_3 = document.querySelector('.close_modal_3');
close_modal_3.addEventListener('click', () => {
    modal_3.style.display = "none";
})


const modal_3_to = document.querySelector('.modal_3_to');
const email_subject = document.querySelector('.email_subject');
const email_message = document.querySelector('.email_message');

send_custom_email.addEventListener('click', async() =>
{
    let user_doc_ref = doc(db, "users", userId)
    let thingy = await getDoc(user_doc_ref)
    let thingy_final = thingy.data();
    email_subject.textContent = "";
    modal_3_to.textContent = "To: " + thingy_final.email;
    email_message.value = "Hello " + thingy_final.name + ", \n\n\n\n\n\n\n\n\n\n\nThank You for using the Basis Scottsdale Library \nSincerely, Basis Library Committee";
    modal_3.style.display = "block";

})
const modal_3_send = document.querySelector('.modal_3_send');
modal_3_send.addEventListener('click', async() => {
    const confirmation = confirm("Are you sure u want to send this email?")
    if (confirmation){
        loading_thingy.style.visibility = "visible";
        let user_doc_ref = doc(db, "users", userId)
        let pop = await getDoc(user_doc_ref)
        let thingy_final = pop.data();
        let response = await fetch("https://on-request-custom-email-448364021608.us-central1.run.app/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8"
                    },
                    body: JSON.stringify({
                        'email': "" + thingy_final.email,
                        'subject': "" + email_subject.value,
                        'message': "" + email_message.value,
                    })
                    })
        let thingy = await response.text()
        if (thingy.includes("IT WORKSSSSSSSSSS")){
            loading_thingy.style.visibility = "hidden";
            alert("Email Sent");
            window.location.href = "users.html";
        }else{
            loading_thingy.style.visibility = "hidden";
            alert("Something Has Gone Horribly Wrong, and there is an error" + thingy);
        }
    }
})

user_info_modal.addEventListener('click', async(event) => {
    if (event.target.matches('.book_action')){
        const book_action = event.target.closest('.book_action')
        const book = event.target.closest('.book');
        const book_id = event.target.dataset.bookid;
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
                window.location.href = "users.html"
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
                window.location.href = "users.html"

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
                window.location.href = "users.html";
            }else{
                if (!(user_data.book1 == "" || user_data.book2 == "" || user_data.book3 == "")){
                    alert("User already has 3 books checked out");
                }
            }
        }
    } else if (event.target.matches('.cancel_hold')){
        const book = event.target.closest('.book');
        const bookref = ref(rtdb, 'books/' + String(event.target.dataset.bookid));
        let thingy = await get(bookref)
        let curr_book = thingy.val();
        let line;
        const confirmation = confirm("Are you sure you want to delete this hold/pickup for bookID: " + String(event.target.dataset.bookid));
        if (confirmation){
            alert("HOLA")
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
                    alert("Successfully Deleted Hold/Pickup")
                }
                curr_book.holds = [""];
                update(bookref, {holds: curr_book.holds,})
                const userDocRef = doc(db, "users", userId);
                const docSnapshot = await getDoc(doc(db, "users", userId));
                const docSnap = docSnapshot.data()    
                console.log(docSnap)
                if (docSnap.hold1.split("&&")[1] == String(event.target.dataset.bookid)){
                    await setDoc(userDocRef, {hold1: docSnap.hold2}, {merge: true});
                    await setDoc(userDocRef, {hold1_time: docSnap.hold2_time}, {merge: true});
                    await setDoc(userDocRef, {hold2: docSnap.hold3}, {merge: true});
                    await setDoc(userDocRef, {hold2_time: docSnap.hold3_time}, {merge: true});
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true});
                }
                if (docSnap.hold2.split("&&")[1] == String(event.target.dataset.bookid)){
                    await setDoc(userDocRef, {hold2: docSnap.hold3}, {merge: true});
                    await setDoc(userDocRef, {hold2_time: docSnap.hold3_time}, {merge: true});
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true}); 
                }if (docSnap.hold3.split("&&")[1] == String(event.target.dataset.bookid)){
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true});
                }
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
                if (docSnap.hold1.split("&&")[1] == String(event.target.dataset.bookid)){
                    await setDoc(userDocRef, {hold1: docSnap.hold2}, {merge: true});
                    await setDoc(userDocRef, {hold1_time: docSnap.hold2_time}, {merge: true});
                    await setDoc(userDocRef, {hold2: docSnap.hold3}, {merge: true});
                    await setDoc(userDocRef, {hold2_time: docSnap.hold3_time}, {merge: true});
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true});
                }
                if (docSnap.hold2.split("&&")[1] == String(event.target.dataset.bookid)){
                    await setDoc(userDocRef, {hold2: docSnap.hold3}, {merge: true});
                    await setDoc(userDocRef, {hold2_time: docSnap.hold3_time}, {merge: true});
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true}); 
                }if (docSnap.hold3.split("&&")[1] == String(event.target.dataset.bookid)){
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true});
                }
                const user_2_docref = doc(db, "users", String(book_thing[1]));
                const user_2_sn = await getDoc(user_2_docref);
                const user_2_snap = user_2_sn.data();
                if (user_2_sn.exists()){
                    if (user_2_snap.hold1.split("&&")[1] == String(event.target.dataset.bookid)){
                        await setDoc(user_2_docref, { hold1: "pickup&&" + String(event.target.dataset.bookid), hold1_time: user_2_time}, { merge: true });
                    }else if(user_2_snap.hold2.split("&&")[1] == String(event.target.dataset.bookid)){
                        await setDoc(user_2_docref, { hold2: "pickup&&" + String(event.target.dataset.bookid), hold2_time: user_2_time}, { merge: true });
                    }else if(user_2_snap.hold3.split("&&")[1] == String(event.target.dataset.bookid)){
                        await setDoc(user_2_docref, { hold3: "pickup&&" + String(event.target.dataset.bookid), hold2_time: user_2_time}, {merge: true});
                    }
                    await fetch("https://on-request-emailing-b4rcicpmhq-uc.a.run.app/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8"
                    },
                    body: JSON.stringify({
                        'tittle': "" + curr_book.tittle,
                        'email': "" + user_2_snap.email,
                        'bookid': "" + String(event.target.dataset.bookid),
                    })
                    })
                    .then(response => {
                    if (!response.ok) {
                        alert("SOMETHING HAS GONE HORRRIBLY WRONG IDK WHAT")
                    }
                    })
                    alert("Successfully Deleted Hold/Pickup")
                }else{
                    alert("MAJOR ERROR IN DATABASE PLEASE INFORM ADMIN");
                }
            }else if (hold_info[0] == "hold"){
                update(bookref, {holds: curr_book.holds,})
                const userDocRef = doc(db, "users", userId);
                const docSnapshot = await getDoc(doc(db, "users", userId));
                const docSnap = docSnapshot.data()    
                console.log(docSnap)
                if (docSnap.hold1.split("&&")[1] == String(event.target.dataset.bookid)){
                    await setDoc(userDocRef, {hold1: docSnap.hold2}, {merge: true});
                    await setDoc(userDocRef, {hold1_time: docSnap.hold2_time}, {merge: true});
                    await setDoc(userDocRef, {hold2: docSnap.hold3}, {merge: true});
                    await setDoc(userDocRef, {hold2_time: docSnap.hold3_time}, {merge: true});
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true});
                }
                if (docSnap.hold2.split("&&")[1] == String(event.target.dataset.bookid)){
                    await setDoc(userDocRef, {hold2: docSnap.hold3}, {merge: true});
                    await setDoc(userDocRef, {hold2_time: docSnap.hold3_time}, {merge: true});
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true}); 
                }if (docSnap.hold3.split("&&")[1] == String(event.target.dataset.bookid)){
                    await setDoc(userDocRef, {hold3: ""}, {merge: true});
                    await setDoc(userDocRef, {hold3_time: 0}, {merge: true});
                }
            }

            if (hold_info[0] != "pickup"){alert("Successfully Deleted Hold/Pickup");
                window.location.href = "users.html"
            }
            loading_thingy.style.visibility = "hidden"
        }
    }

})
const modal_4 = document.querySelector('.modal_4');
const notepad_modal_open = document.querySelector('.notepad_modal_open');
const close_modal_4 = document.querySelector('.close_modal_4');
const modal_4_notes = document.querySelector('.modal_4_notes');
notepad_modal_open.addEventListener('click', async() => {
    const docSnapshot = await getDoc(doc(db, "notes", "notes"));
    const docSnap = docSnapshot.data()
    modal_4_notes.value = "" + docSnap.notes;
    modal_4.style.display = 'block';
})
close_modal_4.addEventListener('click', async() => {
    modal_4.style.display = 'none';
})
const debounce = (fn, delay) => {
    let timerId = null;
    return function(...args){
        clearTimeout(timerId);
        timerId = setTimeout(() => fn.apply(this, args), delay);
    };
};

async function update_notes_thingy() {
    const thingy = doc(db, "notes", "notes")
    await setDoc(thingy, {"notes": modal_4_notes.value}, {merge: true})
}

modal_4_notes.addEventListener('input', debounce(update_notes_thingy, 1000));
