/*
* src/router.js
*
* Based on -> https://github.com/gautemo/Vue-guard-routes-with-Firebase-Authentication
*/

import { createRouter, createWebHistory } from 'vue-router';

// Pages
//
// Note: Static import is shorter and recommended [1]. However, also the dynamic 'await import('./pages/Some.vue')'
//      should work. ESLint dislikes it, though. (May 2020)
//
//    [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
//
import Home from './pages/Home/index.vue';
import SignIn from './pages/SignIn.vue';
import Project from './pages/Project/index.vue';
import page404 from './pages/404.vue';

import { isSignedInRightNow } from './firebase/auth.js';

const r = (path, component, o) => ({ ...o, path, component });
const skipAuth = (path, component, o) => ({ ...o, path, component, meta: { skipAuth: true } })

// Template note: You can use '.name' fields for giving routes memorizable names (separate from their URLs). Chose
//                not to do this, and go for the shorter format (best when there are lots of routes).
//
const routes = [
  r('/', Home, { name: 'home' }),
  skipAuth('/signin',  SignIn),    // '?final=/somein'
  r('/projects/:id', Project, { props: true, name: 'projects' }),    // '/projects/<project-id>'
    //
  //r('/dynamic', () => import('./pages/Home.vue')),    // Q: why ESLint colors it red? #help
    //
  skipAuth('/:catchAll(.*)', page404 )
];

const router = createRouter({
  history: createWebHistory(),
  //base: process.env.BASE_URL,    // tbd. what is this used for?
  routes
});

router.beforeEach(async (to, from, next) => {
  assert(to.path !== null);   // "/some"

  console.log(`router entering page: ${to.path}`);

  // tbd. Describe exactly what the 'to.matched.some(record => ...);' does.
  //    Some samples also have simpler: ...(paste here when coming across it)...
  //
  // Based on -> https://router.vuejs.org/guide/advanced/meta.html
  //
  const skipAuth = to.matched.some(record => record.meta.skipAuth);

  if (skipAuth) {
    next();   // just proceed

  } else if (await isSignedInRightNow()) {
    next();   // just proceed

  } else {    // need auth but user is not signed in
    console.log("Wanting to go to (but not signed in): "+ to);  // DEBUG

    if (to.path === '/') {
      next('/signin')   // no need to clutter the URL
    } else {
      next(`/signin?final=${to.path}`);
    }
  }
});

export default router
