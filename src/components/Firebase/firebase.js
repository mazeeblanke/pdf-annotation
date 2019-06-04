import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';


const config = {
  apiKey: "AIzaSyA_LljlPS6DLWYuZ8wnUQYyRRoVyMe6P34",
  authDomain: "staffre1-1.firebaseapp.com",
  databaseURL: "https://staffre1-1.firebaseio.com",
  projectId: "staffre1-1",
  storageBucket: "staffre1-1.appspot.com",
  messagingSenderId: "474274042895",
  appId: "1:474274042895:web:687822237416211c"
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    /* Helper */

    this.serverValue = app.database.ServerValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.database();


    /* Social Sign In Method Provider */

    this.googleProvider = new app.auth.GoogleAuthProvider();
    this.facebookProvider = new app.auth.FacebookAuthProvider();
    this.twitterProvider = new app.auth.TwitterAuthProvider();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider);

  doSignInWithFacebook = () =>
    this.auth.signInWithPopup(this.facebookProvider);

  doSignInWithTwitter = () =>
    this.auth.signInWithPopup(this.twitterProvider);

  doSignOut = (e) => {
    e.preventDefault()
    this.auth.signOut();
  }

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
    });

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        // console.log(authUser)
        this.user(authUser.uid)
          .once('value')
          .then(snapshot => {
            const dbUser = snapshot.val();

            // console.log(dbUser)
            // // default empty roles
            // if (!dbUser.roles) {
            //   dbUser.roles = {};
            // }

            // // merge auth and db user
            // authUser = {
            //   uid: authUser.uid,
            //   email: authUser.email,
            //   emailVerified: authUser.emailVerified,
            //   providerData: authUser.providerData,
            //   ...dbUser,
            // };

            next(authUser);
          });
      } else {
        fallback();
      }
    });

  // *** User API ***

  user = uid => this.db.ref(`users/${uid}`);

  users = () => this.db.ref('users');

  // *** Message API ***

  message = uid => this.db.ref(`messages/${uid}`);

  messages = () => this.db.ref('messages');

  document = (refId) => this.db.ref(`/documents/${refId}`);

  documents = () => this.db.ref(`documents`);

  annotation = (annotationId) => this.db.ref(`/annotations/${annotationId}`);

  annotations = () => this.db.ref(`annotations`);

}

export default Firebase;
