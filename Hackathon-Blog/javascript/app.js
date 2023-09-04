import {
    auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut,
    doc, setDoc, db, getDoc, updateDoc, storage, ref, uploadBytesResumable, getDownloadURL,
    reauthenticateWithCredential, EmailAuthProvider, updatePassword,
    collection, addDoc, serverTimestamp, query,
    where, getDocs, deleteDoc,
}
    from "./firebase.js"


let flag = true;
let spiner = document.getElementById("spiner");
const profilePicture = document.getElementById("profilePicture");


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

        } // this below code is specific for profile
        else if (location.pathname !== "/allblog.html" && location.pathname !== "/user.html") {
            fullName.value = docSnap.data().name;
            email.value = docSnap.data().email;
            userUid.value = docSnap.id;

            if (docSnap.data().profile) {
                profilePicture.src = docSnap.data().profile;
            }

        }
        spiner.style.display = "none"
    } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        spiner.style.display = "none"
    }


}

const getAllBlogs = async () => {

    const blogArea = document.getElementById("AllBlogsContainer")
    const querySnapshot = await getDocs(collection(db, "blogs"));
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        blogArea.innerHTML += `
        <div class="mt-2 mb-2">
        <div class="head-blog mt-2">
            <div class="card border border-secondary-subtle rounded py-2">
                <div class="card-header d-flex gap-4">
                
                <img class="blog-avatar m-0"
                src="${doc.data().user.profile && doc.data().user.profile !== "undefined" ? doc.data().user.profile : "asset/user-circle.jpg"}"
                alt="">
                <span class="d-flex flex-column justify-content-end">
                <h5 class="card-title mb-3">${doc.data().user.name}</h5>
                        <h6 class="card-subtitle text-body-secondary"> ${doc.data().timestamp.toDate().toDateString()}</h6>

                    </span>
                </div>
                <div class="card-body">
                <h5 class="card-title mb-3">${doc.data().title}</h5>

                    <p class="card-text"> ${doc.data().description}</p>

                    <a href="user.html?user='${doc.data().uid}'" class="card-link seeAll" >View all blogs</a>
                </div>
            </div>
        </div>
    </div>
     `
    });

}


const getCurrentUserBlogs = async (uid) => {
    const blogArea = document.getElementById("my-blogs")

    blogArea.innerHTML = "";
    const q = query(collection(db, "blogs"), where("uid", "==", uid));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        blogArea.innerHTML += `
            <div class="mt-2 mb-2">
            <div class="head-blog mt-2">
                <div class="card border border-secondary-subtle rounded py-2">
                    <div class="card-header d-flex gap-4">
                    
                    <img class="blog-avatar m-0"
                    src="${doc.data().user.profile && doc.data().user.profile !== "undefined" ? doc.data().user.profile : "asset/user-circle.jpg"}"
                    alt="">

                        <span class="d-flex flex-column justify-content-end">
                            <h5 class="card-title mb-3">${doc.data().title}</h5>
                            <h6 class="card-subtitle text-body-secondary"> ${doc.data().user.name}  - ${doc.data().timestamp.toDate().toDateString()}</h6>

                        </span>
                    </div>
                    <div class="card-body">
                        <p class="card-text"> ${doc.data().description}</p>
                        <a href="javascript:void(0)" class="card-link seeAll" onclick="deleteBlog('${doc.id}')">Delete</a>
                        <a href="javascript:void(0)" class="card-link seeAll" onclick="editBlog('${doc.id}', '${doc.data().title}' , '${doc.data().description}')">Edit</a>
                    </div>
                </div>
            </div>
        </div>
         `
    });
}



onAuthStateChanged(auth, (user) => {
    if (user) {
        getCurrentUser(user.uid)

        if (location.pathname === "/blog.html") {
            getCurrentUserBlogs(user.uid)
        }

        if (location.pathname === "/allblog.html") {
            getAllBlogs()
        }

        if (location.pathname !== '/user.html' && location.pathname !== '/allblog.html' && location.pathname !== '/blog.html' && location.pathname !== '/profile.html' && flag) {
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

const updateBtn = document.getElementById("updateBtn");

const fileInput = document.getElementById("fileInput");

const uploadFile = (file) => {
    return new Promise((resolve, reject) => {

        const mountainImagesRef = ref(storage, `images/${file.name}`);

        const uploadTask = uploadBytesResumable
            (mountainImagesRef, file);

        uploadTask.on('state changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');

                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                reject(error);
            },

            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                })
            }
        )

    })
}

const updateUserPassword = (oldPass, newPass) => {
    return new Promise((resolve, reject) => {



        const currentUser = auth.currentUser;

        // spiner.style.display = "flex";

        console.log("Current user-->", currentUser)


        const credential = EmailAuthProvider.credential(
            currentUser.email,
            oldPass
        )
        reauthenticateWithCredential(currentUser, credential).then
            ((res) => {

                updatePassword(currentUser, newPass).then(() => {
                    resolve(res)
                }).catch((error) => {
                    reject(error)
                });

            }).catch((error) => {
                reject(error)
            });
    })
}


const updateProfile = async () => {

    try {


        let fullName = document.getElementById("fullName")
        let userUid = document.getElementById("uid")
        let oldPassword = document.getElementById("oldPassword")
        let newPassword = document.getElementById("newPassword")

        spiner.style.display = "flex"

        if (oldPassword.value && newPassword.value) {
            await updateUserPassword(oldPassword.value, newPassword.value)
        }

        console.log("Updated")

        const user = {
            name: fullName.value,
        }

        if (fileInput.files[0]) {

            user.profile = await uploadFile(fileInput.files[0]);
        }

        const userRef = doc(db, "users", userUid.value);


        // Set the "capital" field of the city 'DC'
        await updateDoc(userRef, user);
        spiner.style.display = "none";

        oldPassword.value = "";
        newPassword.value = "";
        Swal.fire(
            'Good job!',
            'Profile Updated!',
            'success'
        )
    } catch (err) {
        spiner.style.display = "none";
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: err.message,
        })
    }
}


updateBtn && updateBtn.addEventListener("click", updateProfile)



fileInput && fileInput.addEventListener('change', (e) => {


    profilePicture.src = URL.createObjectURL(e.target.files[0]);
})


const submitBlog = async () => {
    const title = document.getElementById("title");
    const textarea = document.getElementById("textarea");
    const currentUser = auth.currentUser;
    spiner.style.display = "flex"

    const userRef = doc(db, "users", currentUser.uid);

    const userData = await getDoc(userRef);
    console.log("USER DATA-->", userData.data())



    const docRef = await addDoc(collection(db, "blogs"), {
        title: title.value,
        description: textarea.value,
        timestamp: serverTimestamp(),
        uid: currentUser.uid,
        user: userData.data()
    });
    getCurrentUserBlogs(currentUser.uid)
    title.value = "";
    textarea.value = "";
    spiner.style.display = "none";

    Swal.fire(
        'Good job!',
        'Blog posted!',
        'success'
    )
}


const postBlog = document.getElementById("postBlog");

postBlog && postBlog.addEventListener('click', submitBlog)


const deleteBlog = async (id) => {
    const currentUser = auth.currentUser;
    spiner.style.display = "flex"
    await deleteDoc(doc(db, "blogs", id));
    Swal.fire(
        'Good job!',
        'Blog Deleted!',
        'success'
    )
    spiner.style.display = "none";
    getCurrentUserBlogs(currentUser.uid)
}

const updateModal = document.getElementById("updateModal")
const updateTitle = document.getElementById("update-title")
const updateTextArea = document.getElementById("update-textarea")
let updateID = "";

const editBlog = (id, title, description) => {
    console.log("id, title, description", id, title, description)

    updateID = id;
    updateTitle.value = title;
    updateTextArea.value = description;
    updateModal.style.display = "block"
}

const cancelBtn = document.getElementById('cancelBtn');

cancelBtn && cancelBtn.addEventListener('click', () => {
    updateModal.style.display = "none"

})

const updateBlog = document.getElementById("updateBlog");

updateBlog && updateBlog.addEventListener("click", async () => {


    const currentUser = auth.currentUser;
    spiner.style.display = "flex"

    console.log(updateTitle.value, updateTextArea.value, updateID)

    const ref = doc(db, "blogs", updateID);

    // Set the "capital" field of the city 'DC'
    await updateDoc(ref, {
        title: updateTitle.value,
        description: updateTextArea.value,
    });
    spiner.style.display = "none"
    updateID = "";
    updateModal.style.display = "none"
    getCurrentUserBlogs(currentUser.uid)
    Swal.fire(
        'Good job!',
        'Blog Updated!',
        'success'
    )
})

const getUserBlogs = async () => {
    console.log("getUserBlogs function is called.");
    const urlParams = new URLSearchParams(location.search);
    const user = urlParams.get('user');

    const blogArea = document.getElementById("user-blog-add")



    blogArea.innerHTML = "";
    const q = query(collection(db, "blogs"), where("uid", "==", user));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        blogArea.innerHTML += `
            <div class="mt-2 mb-2">
            <div class="head-blog mt-2">
                <div class="card border border-secondary-subtle rounded py-2">
                    <div class="card-header d-flex gap-4">
                    
                    <img class="blog-avatar m-0"
                    src="${doc.data().user.profile && doc.data().user.profile !== "undefined" ? doc.data().user.profile : "asset/user-circle.jpg"}"
                    alt="">

                        <span class="d-flex flex-column justify-content-end">
                            <h5 class="card-title mb-3">${doc.data().title}</h5>
                            <h6 class="card-subtitle text-body-secondary"> ${doc.data().user.name}  - ${doc.data().timestamp.toDate().toDateString()}</h6>

                        </span>
                    </div>
                    <div class="card-body">
                        <p class="card-text"> ${doc.data().description}</p>
                        <a href="javascript:void(0)" class="card-link seeAll" onclick="deleteBlog('${doc.id}')">Delete</a>
                        <a href="javascript:void(0)" class="card-link seeAll" onclick="editBlog('${doc.id}', '${doc.data().title}' , '${doc.data().description}')">Edit</a>
                    </div>
                </div>
            </div>
        </div>
         `
    });
}

if (location.pathname === "/user.html") {
    console.log("User page is detected.");
    getUserBlogs();
}
window.deleteBlog = deleteBlog;
window.editBlog = editBlog;

