  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
  import { getAuth ,createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
  import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
  const db = getFirestore(app)



async function checkUserRole(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            const isAdmin = userData.admin;

            localStorage.setItem("user", JSON.stringify({ uid, email: userData.email }));

            if (isAdmin) {
                window.location.href = "../Profile/admin_profile-home.html"; 
            } else {
                window.location.href = "../Profile/profile-home.html"; 
            }
        } else {
            console.error("Person!");
        }
    } catch (error) {
        alert("Error");
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        checkUserRole(user.uid);
    }
});

const loading_thingy = document.querySelector('.loading_wrapper')

  submit.addEventListener('click', function(event) {
    event.preventDefault();
  
    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    loading_thingy.style.visibility = "visible";
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setDoc(doc(db, "users", user.uid), {
          email: user.email,
          uid: user.uid,
          name: name,
          Books: 0,
          admin: false,
          book1: "",
          book2: "",
          book3: "",
          hold1: "",
          hold2: "",
          hold3: "",
          book1_time: 0,
          book2_time: 0,
          book3_time: 0,
          hold1_time: 0,
          hold2_time: 0,
          hold3_time: 0,

        }).then(async() => {
            let response = await fetch("https://on-request-signup-email-448364021608.us-central1.run.app/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                'email': "" + user.email,
                'name': "" + name,
            })
            }) 
            const response_now = await response.text()
            if (response_now.includes("IT WORKSSSSSSSSSS")){
              loading_thingy.style.visibility = "hidden";
              window.location.href="../Profile/profile-home.html";
            }else{
              loading_thingy.style.visibility = "hidden";
              alert("ERROR");
            }
        });
      })
      .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
        loading_thingy.style.visibility = "hidden";

      });
  });
  
