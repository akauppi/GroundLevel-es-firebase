/*
* src/firebase/userRef.js
*
* Reflect the Firebase user status, but strip fields that our app does not need.
*
* Usage:
*   <<
*     <x v-if="user">    <-- if user is signed in
*       {{ user.displayName }}
*     </x>
*   <<
*
*   'user' is either:
*     - null    // auth has not been established (initial state, should not last long)
*     - { displayName: string, uid: string }   // authenticated
*     - false   // not signed in
*
* References:
*   - Firebase User object documentation
*     -> https://firebase.google.com/docs/reference/js/firebase.User.html
*/
import { computed } from 'vue'

import { authRef } from '/@firebase/authRef'

const userRef = computed( () => {   // Ref of undefined | false | { displayName: string, uid: string }
  const a = authRef.value;  // undefined | false | { displayName: string, uid: string, ... }

  if (a) {
    const o = a;

    return {    // expose a controlled subset (minimalistic)
      uid: o.uid,
      displayName: o.displayName,
      isAnonymous: o.isAnonymous,
      photoURL: o.photoURL
    }
  } else {
    return a    // undefined|false
  }
});

export { userRef }