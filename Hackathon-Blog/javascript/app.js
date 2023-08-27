import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, db, getDoc, updateDoc } from "./firebase.js"


let flag = true;
let spiner = document.getElementById("spiner")



const getCurrentUser = async (uid) => {
    spiner.style.display = "flex";
    const docRef = doc(db, "users", uid);
    let fullName = document.getElementById("fullName")
    let email = document.getElementById("email")
    let userUid = document.getElementById("uid")
    const docSnap = await getDoc(docRef);
    console.log(docSnap.id);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        if (location.pathname === "/blog.html") {
            fullName.innerHTML = docSnap.data().name;

        } else {

            fullName.value = docSnap.data().name;
            email.value = docSnap.data().email;
            userUid.value = docSnap.id;
        }
        spiner.style.display = "none"
    } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        spiner.style.display = "none"
    }


}



onAuthStateChanged(auth, (user) => {
    if (user) {
        getCurrentUser(user.uid)
        if (location.pathname !== '/blog.html' && location.pathname !== '/profile.html' && flag) {
            location.href = "blog.html";
        }

    } else {

        if (location.pathname !== '/signin.html' && location.pathname !== '/signup.html') {
            location.href = "signin.html"
        }

    }
});


let signupBtn = document.getElementById("signupBtn")

const signup = () => {
    let fullName = document.getElementById("fullName")
    let phone = document.getElementById("phone")
    let email = document.getElementById("email")
    let password = document.getElementById("password")
    spiner.style.display = "flex";
    flag = false;

    createUserWithEmailAndPassword(auth, email.value, password.value)
        .then(async (userCredential) => {

            const user = userCredential.user;


            await setDoc(doc(db, "users", user.uid), {
                name: fullName.value,
                phone: phone.value,
                email: email.value,
                password: password.value,
            });
            spiner.style.display = "none";
            flag = true;
            location.href = "blog.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            spiner.style.display = "none"
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMessage,
            })
        });
}

signupBtn && signupBtn.addEventListener('click', signup)

let signInBtn = document.getElementById("signInBtn")

const signIn = () => {
    let email = document.getElementById("email")
    let password = document.getElementById("password")
    spiner.style.display = "flex";


    signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            // ...
            spiner.style.display = "none";
            console.log("user-->", user);
            flag = true;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            spiner.style.display = "none"
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMessage,
            })
        });
}


signInBtn && signInBtn.addEventListener('click', signIn)


const logoutBtn = document.getElementById("Logout");

const signOutUser = () => {
    signOut(auth).then(() => {


    }).catch((error) => {

    });

}


logoutBtn && logoutBtn.addEventListener("click", signOutUser)

const postBlog = document.getElementById("postBlog");

const updateBtn = document.getElementById("updateBtn");

const updateProfile = async () => {
    let fullName = document.getElementById("fullName")
    let email = document.getElementById("email")
    let userUid = document.getElementById("uid")
    console.log(email.value);
    console.log(fullName.value);
    console.log(userUid.value);
    spiner.style.display = "flex";

    const userRef = doc(db, "users", userUid.value);

    // Set the "capital" field of the city 'DC'
    await updateDoc(userRef, {
        name: fullName.value
    });
    spiner.style.display = "none";
    Swal.fire(
        'Good job!',
        'Profile Updated!',
        'success'
    )
}


updateBtn.addEventListener("click", updateProfile) 