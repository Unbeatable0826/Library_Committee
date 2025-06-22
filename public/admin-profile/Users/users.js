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
                console.log(usersSnapshot.docs);
                users = usersSnapshot.docs.map((doc) => {
                    let  clone = users_template.content.cloneNode(true).children[0];
                    clone.querySelector('.user_name').textContent = doc.data().name;
                    clone.querySelector('.user_email').textContent = doc.data().email;
                    clone.querySelector('.user_uid').textContent = doc.id;
                    clone.querySelector('.view').dataset.userId = doc.id;
                    console.log(clone.querySelector('.user_name'));
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
const delete_but = document.querySelector('.delete')
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
                clone.querySelector('.book_date').textContent = "Due By: " + poppy.toLocaleDateString();
                clone.querySelector('.book_tittle').textContent = "Tittle: " + curr_book.tittle + " | BOOKID: " + String(user_data[book].split("&&")[1]);
                clone.querySelector('.book_author').textContent = "Author: " + curr_book.author;
                clone.querySelector('.cancel_hold').style.display = "none";
                clone.querySelector('.book_action').textContent = "Check In";
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
                    clone.querySelector('.book_date').textContent = "Due Bye: " + thingys.toLocaleDateString(); 
                }else{
                    let thingyss = "Estimated Date: Unknown"
                    let nummy = 0;
                    for (let x = 1; x < curr_book.holds.length; x++){
                        if (curr_book.holds[x].includes(user.uid)){
                            nummy = x;
                            break;
                        }
                    }
                    if (num != 0 && curr_book.checkoutby != ""){
                        let now = new Date()
                        now.setDate(now.getDate() + (num + 1) * 14)
                        thingyss = "Estimated Date: " + now.toLocaleDateString();

                    }else if(num != 0 && curr_book.checkoutby == ""){
                        let now = new Date()
                        now.setDate(now.getDate() + (num)  * 14)
                        thingyss = "Estimated Date: " + now.toLocaleDateString();
                    }
                    clone.querySelector('.book_date').textContent = "Due Bye: " + thingyss + " | Number in Holds: " + nummy;
                }
                clone.querySelector('.book_tittle').textContent = "Tittle: " + curr_book.tittle + " | BOOKID: " + String(user_data[book].split("&&")[1]);
                clone.querySelector('.book_author').textContent = "Author: " + curr_book.author;
                clone.querySelector('.cancel_hold').textContent = "Cancel " + String(user_data[book].split("&&")[0]);
                if (!String(user_data[book].split("&&")[0]) == "pickup"){
                    clone.querySelector('.book_action').style.display = "none";

                }else{
                    clone.querySelector('.book_action').textContent = "Check Out"
                }
                user_info_modal.append(clone);
            }
        }
        modal.style.display = 'block';
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



modal_2_close.addEventListener('click', () => {
    modal_2.style.display = "none";
})
check_avail_but.addEventListener('click', async() => {
        const book_id = String(book_id_modal_2.value)
        let booky = ref(rtdb, "books/" + book_id)
        let thingyp = await get(booky)
        if (thingyp.exists() && book_id != ""){
            const data_currr = thingyp.val()
            modal_2_tittle.textContent = "Tittle: " + data_currr.tittle;
            modal_2_author.textContent = "Author: " + data_currr.author;
            modal_2_genre.textContent = "Genre: " + data_currr.genre;
           if (data_currr.avail){
                modal_2_date.textContent = "Estimated Date: Available Now !"
           }else{
                var date = new Date()
                if (data_currr.checkoutby != ""){
                    date.setDate(date.getDate() + data_currr.holds.length * 14 + 14);
                }else{
                    date.setDate(date.getDate() + data_currr.length * 14)
                }



           }
            









        modal_2.style.display = "block";
        }else{
            alert("BOOK ID NON EXISTANT")
        }

















})






































const loading_thingy = document.querySelector('.loading_wrapper')
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