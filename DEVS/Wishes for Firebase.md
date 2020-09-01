# Wishes for Firebase

Dear Firebase. You are awesome. If you ever run out of things to improve, here would be some ideas:

Hot list: 🌶

- ability to have immutable Rules evaluation (evaluation not changing the data set)
- online Simulator and local Firestore emulator should have 100% same logic

🙏


## Cloud Firestore

### Uniformity between the online Rules Simulator and the local Firestore emulator

This is mentioned widely on the Internet, but it took me a while before it really bit.

>![](.images/rules-simulator-no-resource.png)

I cannot use the same `validSymbol()` for both reads and writes, in the simulator.

It seems the Simulator tries to say that it has `request` but there is no `request.resource`. The local emulator always has this (*) - even for gets. These two seem to be either from different code base, or from different times.

>(*) Jul 10th, local emulator is (`firebase` 8.4.3) is giving "Property resource is undefined on object. for 'list' @ L19" if `validProject` is enabled for reads. This may have changed, but consistency across all: cloud server, local emulation, cloud simulation would be HIGHLY APPRECIATED!

They are both crucial for development - complementing each other. But if their logic conflicts, it just adds to the pain of Firestore Security Rules development...

Surely something that deserves to get fixed.

i.e. Target:

- there should not need to be any special coding in Security Rules, for having them run on the online Simulator (or the local emulator)
- having contradictory evaluation of rules should always be treated as a bug, by Firebase personnel

### Online Simulator syntax highlighting of `/* ... */`

Block comments are allowed by the Security Rules evaluation, but not reflected in the syntax highlighting.

![](.images/firebase-simulator-block-comments.png)


### Ability to insert "current server date" in the Firebase console (and Rules simulator)

![](.images/firebase-wishes-server-date.png)

<!--
<strike>The dialog could have a "right now" or "server date" button, like the API allows a client to set a field to current date.

This would be even more valued, since it is not obvious to the user (me), whether I should fill in the UTC time, or a time in my local time zone. Having the suggested button would take away this consideration.</strike>
-->

>♨️: With the online simulator, lack of this currently (Mar 2020) prevents testing for rules that expect server side timestamp in a field (e.g. `created`, `removed`).

INITIAL suggestion:

A means in the date picker to get the current time. (I don't know of the time zones applied: is it server's time, UCT or my local time zone).

ALTERNATIVE suggestion:

Adding `FieldValue` to the `Type` drop-down would be more in line with the Firestore data model, in general. The user could then choose the server timestamp from there, to get the "current" time.

These two are slightly different ideas.


### Firebase emulator API

See [Generate Test Reports](https://firebase.google.com/docs/firestore/security/test-rules-emulator) (Firebase docs)

For seeing test coverage, one needs to use a URL such that:

```
http://localhost:6767/emulator/v1/projects/<project_id>:ruleCoverage.html
```

*Here, the "project id" is what we name "session id". The run of a set of tests.*

This is okay when one uses a small set of stable test ids (and we'll likely go that way, because of this).

It would, however, be nice to be able to see the available "project id"s from the API. E.g. GET to `http://localhost:6767/emulator/v1/projects/` could list these, as a JSON array.[^1]

[^1]: Currently (Mar 2020), that gives a 404.

#### "Project id's" don't seem to matter??

I can use a query such as `http://localhost:6767/emulator/v1/projects/nosuch:ruleCoverage.html` and still get a valid response (there is no `nosuch` project). This is weird - would expect a 404.

Firebase tools v. 7.16.1.

>**Edit:** Instead, this is some kind of a caching problem. At times, the earlier results are available (e.g. changing project id in the URL from `abc` to `abcd`). Other times, one gets a 500.
>
>Someone at Firebase could have a look.
>Tested both with Safari and Chrome.

Also, I was surprised to see the results persist over emulator restarts. Wasn't expecting that, based on documentation.


<!-- 8.6.0 has, but it's not ideal (more about it later)
### 🌶 Firebase emulator to pick up changes to the rules

The emulator could have a "watch" mode to help in development.

<strike>`firebase emulators:exec` takes some seconds to set up the emulator. It makes sense, for rules development, to have an emulator running in the background.

However.. currently (firebase tools 7.16.1) the emulator does not change its behavior when a rules file is changed.</strike>

Could we have a `--watch` mode that would? 🥺

---

Edit: If one codes like this:

```
firebase.loadFirestoreRules({
  projectId: sessionId,
  rules: fs.readFileSync("dut.rules", "utf8")   // name must match that in 'firebase.json'
});
```

..in the test setup, the rules are forced to the Firestore emulator. Having a watch mode would simply simplify things (for the developer), not needing to have this code.
-->

### Firebase Rules playground (online) 'Build document' dialog (usability suggestion)

For more complex work, ability to copy-paste a JSON as the document would be welcome.

If we go by the dialog, ability to make changes to the previous document would be welcome.

>![](.images/rules-playground-build.png)

Here, the document contents are non-trivial. When I click `Build document`, instead of being able to add or remove fields, I need to start creating it all from scratch.


### 🌶 Firestore Security Rules emulator: a "dry run" mode

When I first used the rules unit testing library (`@firebase/testing`, now `@firebase/rules-unit-testing`), I somehow supposed the underlying data would not get changed. It does.

Then created a means to protect the tests from this side effect. That means is now the [firebase-jest-testing](https://github.com/akauppi/firebase-jest-testing) library.

If the Firebase emulator provided a "dry run" flag, the library could get rid of the locks it now needs. This might also improve test performance, a bit.

The flag can also be a configuration for a particular project id, but since configuration at the moment (Aug 2020) is all over the place, I'm not advocating that unless it first gets gathered in a centralized way (e.g. `firebase.json` and emulator command line flags; away from source code!).


## Firestore emulator: evaluate the rules at launch (and complain!)

The Firestore emulator has just a single file of Security Rules. It could evaluate (compile) it at launch, fail if there are problems and show warnings if there are any.

It does not currently (8.6.0) do so. This is a launch with a syntax error in the rules file:

```
$ firebase emulators:start --only firestore
i  emulators: Starting emulators: firestore
✔  hub: emulator hub started at http://localhost:4400
i  firestore: firestore emulator logging to firestore-debug.log
✔  firestore: firestore emulator started at http://localhost:6767
i  firestore: For testing set FIRESTORE_EMULATOR_HOST=localhost:6767
✔  emulators: All emulators started, it is now safe to connect.
...
```

Now the error happens at runtime and may even get lost somewhere in test code (if it's ignored exceptions).

![](.images/bad-rules.png)

Warnings are shown only if the file is edited:

```
i  firestore: Change detected, updating rules...
⚠  ../firestore.rules:98:16 - WARNING Unused function: validProject2.
⚠  ../firestore.rules:110:35 - WARNING Invalid variable name: request.
✔  firestore: Rules updated.
```

It would be useful and fair to show these already at the launch.



## Local emulator UI

..could hide the UI modules that aren't active. 

E.g. if we start with `--only functions,firestore`, only those boxes need to be visible in the UI.


## Config should be transparent to client code!!!

The configuration story for Firebase seems unclear (Jul 2020). 

While there is a config file (`firebase.json`), a Firebase employee mentioned that is only for hosting (reference missing). That's not true. It contains entries for `firestore` and `emulation`, but it does not consistently collect all Firebase configuration into itself, as it could.

>The `firebase-jest-testing` library hides these configuration steps from this application code. But they are still there; would rather have them in `firebase.json`.

Aim:

- Browser code should be absolutely same, whether running against emulator or cloud deployment

Means this block (in `init.vite.js`) should become void:

```
  const LOCAL = import.meta.env.MODE == "dev_local";
  if (LOCAL) {
    console.info("Initializing for LOCAL EMULATION");

    const DEV_FUNCTIONS_URL = "http://localhost:5001";
    const FIRESTORE_HOST = "localhost:6767";

    // As instructed -> https://firebase.google.com/docs/emulator-suite/connect_functions#web
    //
    // Note: source code states "change this [functions] instance". But it seems that another 'firebase.functions()'
    //    later must return the same instance, since this works. #firebase #docs #unsure
    //
    firebase.functions().useFunctionsEmulator(DEV_FUNCTIONS_URL);

    firebase.firestore().settings({   // affects all subsequent use (and can be done only once)
      host: FIRESTORE_HOST,
      ssl: false
    });
  }
```

Can we do that?

## Cloud Functions: ability to configure the default region in one place

The current situation on Cloud Functions regions is not completely clear (Aug 2020). There are cases where the code seems to prefer the global default region (e.g. emulation has this).

Overrides to regions can only be done on a function-by-function basis. This leads to the Internet recommending things like a `regionalFunction` value - the approach taken also in this repo.

1. A developer should have a clear place to override the default region for their functions.
   - this place could be the `firebase.json` file?

2. The client should "just pick up" such a setting.
   - If needed, this can be done via the `__` URL mechanism

>Firebase says (@puf on Twitter) that the `__` configuration is only for hosting.
>
>To a user, it does not really seem that way, having `storageBucket`, `messagingSenderId` etc. How would `functionsDefaultRegion` be any different?

<!-- disabled
Note: Having the error message about CORS makes this especially nasty for developers.

See [SO 62042554](https://stackoverflow.com/questions/50278537/firebase-callable-function-cors/61725395#62042554). 

Also relevant: 

- [firebase deploy to custom region (eu-central1)](https://stackoverflow.com/questions/43569595/firebase-deploy-to-custom-region-eu-central1) (StackOverflow)

The current complexity is against the aim for simplicity that is the main selling argument of Firebase (you can do back-end without being a wizard class security specialist!).

There may be a need for overriding the region on a function-by-function basis, but there should also be a way to change the default (in configuration). This would be the way most people change their region. Such a change would not break code that currently uses the in-code settings.
-->


## `firebase emulators:start` behaves different from `emulators:exec`

This is a surprise for developers.

e.g. the `debug()` feature of Security Rules (undocumented) places the notes in `stdout` with `emulators:exec` but into `firestore-debug.log` if run via `emulators:start`.

The two commands look similar, and there's no cue to make us think they would work differently. 

Suggestion:

Bring the `:exec` and `:start` commands closer. Either merge them, or hide the internal implementation aspects (`start` is said to be a "wrapper") from the developers.


## Loading initial data - from JSON

>Note: This is already sufficiently handled by `firebase-jest-testing` and doesn't necessarily need support from Firebase emulator commands.

The import/export mechanism ([#1167](https://github.com/firebase/firebase-tools/issues/1167)) works on a binary data format that humans cannot directly read or edit.

That's one use case. Another is to prime an emulator with JSON data, instead of a snapshot. This is useful when one wants to tune the data by hand, and there is not too much of it.

Our current approach uses `local/init.js` to prime such data. It works, but is clumsy in the `package.json` command:

```
    "dev:local": "concurrently -n emul,dev-local \"firebase emulators:start --only functions,firestore\" \"npm run _dev_local_2\"",
    "_dev_local_2": "wait-on http://localhost:4000 && node --experimental-json-modules ./local/init.js && npx vite --port 3000 --mode dev_local",
```

This could be:

```
    "dev:local": "firebase emulators:exec --ui --only functions,firestore local/init.js \"npm run _dev_local_2\"",
    "_dev_local_2": "npx vite --port 3000 --mode dev_local",
```


## Firebase hosting could provide config as ES module

Firebase hosting makes it easy to initialize project identity via `/__/firebase/init.js`. This file is supposed to be read in as a `script` tag.

This belongs to a bygone era, and could be complemented by an `import` friendly way of getting such configuration.

One could serve a module exporting the config object (and `init` if one wants to be compatible with the earlier way). Let's say the url for this would be `/__/firebase/config.mjs`.

This would allow: 

```
import * as firebase from 'firebase/app'
import { default as __ } from "/__/firebase/config.mjs"
firebase.initializeApp(__);
```

It feels a lot more module friendly that the app does the initialization.

  
## Firebase hosting BUG: wrong MIME type for `.js`

Firebase hosting defaults to `application/json` for JavaScript files, instead of `text/javascript`. This disallows their use in a browser (error from Chrome).

```
Failed to load module script: The server responded with a non-JavaScript MIME type of "application/json". Strict MIME type checking is enforced for module scripts per HTML spec.
```

Launched by:

```
$ firebase serve --only hosting --port 3010
```

`firebase.json`:

```
{
  "hosting": {
    "public": "public",
    "ignore": [],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.prod.html"
      }
    ]
  },
  ...
}
```

First aid: specify the correct content type in `firebase.json`:

```
{
  "hosting": {
    ...
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/javascript"
          }
        ]
      }
    ]
  }
}
```

Firebase tools v. 8.4.3.

- [ ] Report to Firebase


<!-- disabled: not reproducible? / haven't seen since
## Emulator should behave exactly as the online

Currently (Jul 2020, Firebase tools 8.4.3) the emulator chokes on something that is okay for the online implementation.

In browser console:

```
database.ts:2096 Uncaught Error in onSnapshot: FirebaseError: 
Property resource is undefined on object. for 'list' @ L19
```
-->

## Would like to control, whether Firebase hosting emulation changes the port if taken, or fails

Using port 3000 for `dev` (online) and 3001 for `dev:local` gets blurred, if a `npm run dev` is launched twice. Firebase emulator automatically looks for the next available port, and we just see the warning:

```
Port 3000 is in use, trying another one...
```

It would be nice to have a flag/config setting to disallow changing ports. It can even be the port entry itself, with "!3000" meaning we mean business - don't allow any other than 3000, ok?!


## Firestore JavaScript client could provide `Date`s?

Timestamps in the Firestore data are provided as: `{ seconds: int, nanos: int }`. There is a native JavaScript presentation for dates, `Date`, and the Firebase client provides `.toDate()` method for converting to it. 

But why is this not made automatically? What would be the use case that needs "more resolution" than a normal `Date`?

Are the timestamps even having more than 1ms resolution? Firebase docs suggest this, but let's see on server timestamps.

>tbd. Check some server-timestamp fields (in code); what are the `nanos` values for them?

For a document database (not real time database) I don't see a reason for sub-1ms resolution.

It would make sense that the client provides such data in the normal abstraction of the platform. Now the application code must convert individual fields.

Two ways to make such a change:

1. Derive from `Date` (or make a class that behaves the same), and have it also provide the `.seconds` and `.nanos` for backwards compatibility.
2. Have a global switch somewhere (initialization of the `.firebase.firestore`?), so application programmers can select the "old" or the "JavaScript" way.


## Firebase emulator configuration from a `.js` file

It is nowadays customary (babel etc.) that configuration can be provided in a `.json`, or a `.js` file. Using `.js` files allows one to have e.g. comments in there.

Firebase (8.6.0) seems to be fixed on `firebase.json` and providing a `firebase.js` (or `firebase.cjs`) is ignored.

Furthermore, the emulator should fail to start if there is no configuration available. Currently, it proceeds and gives a runtime error when one tries to use it.


## Firestore emulator: ability to load rules from multiple files

Currently (8.6.0), all rules must be in a single file, defined in `firebase.json`:

```
"rules": "../firestore.rules",
```

I would prefer a freedom to place separate collections' rules in separate files. This makes the source code more managable, as you can imagine (my project is small, yet has separate "projects", "symbols" and "invites" collections).

Implementation could allow an array in addition to the current string entry:

```
"rules": ["../firestore.rules", ...]
```

## Firebase emulator: ability to check in tests whether Security Rules are healthy

When editing security rules, I normally have the IDE and the test output visible - not the terminal running the Firebase emulator.

If security rules are broken, the test output is garbage:

```
  ● '/projects' rules › user needs to be an author, to read a 'removed' project

    expect.assertions(2)

    Expected two assertions to be called but received one assertion call.

      67 | 
      68 |   test('user needs to be an author, to read a \'removed\' project', () => {
    > 69 |     expect.assertions(2);
         |            ^
      70 |     return Promise.all([
      71 |       expect( abc_projectsC.doc("2-removed").get() ).toAllow(),
      72 |       expect( def_projectsC.doc("2-removed").get() ).toDeny()

      at Object.<anonymous> (projectsC.test.js:69:12)
```

The Firebase testing library could provide a function to check the validity of the current Security Rules, from the emulator. I can then use this in a "before all" hook, and not run the tests if they are not going to work.


## Firebase Security Rules: could allow set comparison without `.toSet()`

Sets are great. However, their use is a little verbose, at the moment (8.6.0).

It's a very common practise (shown also in Firebase samples) to compare the outcome of a `diff` to a constant set. This requires a `.toSet()` at the end:

```
diff().removedKeys() == ["removed"].toSet()
```

If the `.toSet()` is removed, one gets a warning:

```
⚠  ../firestore.rules:53:73 - WARNING The sub-expressions are not comparable, so this comparison will always return false.
```

Instead, the Firebase parser could imply a `.toSet()` when a set is compared with a constant array. This would make people's rules less verbose, and not break any existing code. So this would work:

```
diff().removedKeys() == ["removed"]
```

More readable? :)


## Firebase functions emulation: please allow region parameter (BUG)

```
const fns = window.LOCAL ? firebase.app().functions(/*functionsRegion*/) :
  firebase.app().functions(functionsRegion);
```

Application code now needs to have the above condition (firebase-tools 8.6.0, JavaScript client 7.16.1).

- With the region parameter, emulated call just disappears (no logging, no invocation)

>This seems to have been tested only with default region, in which case identical code can be used.


## Firebase emulation: expose in the client, whether it's running against local emulator

We now jump through hoops to get the front end know that it's running against an emulator.

The JavaScript library probably knows this. Can it somehow tell it to us?

This would mean the `window.LOCAL` mode can be taken from the library, instead of the build system and `import.meta.env.MODE`.

Suggestion:

- bring all the configuration of the server (emulator) available in one end point (preferably `__`)


## 🍎🍎🍎Testable billing for Security Rules

Asking about how many "reads" a certain security rule causes has been mentioned in community forums (especially newcomers).

Would you be able to add this to the emulator / `@firebase/rules-unit-testing` so that we can compare the reported "reads" count automatically to expected ones. I would add this as part of the security rules tests.

This makes the billing attestable.


<!-- seems done in 8.8.1
## Cloud Functions emulator: could watch for changes

Firebase emulator (firebase-tools 8.6.0) does not pick up changes to the functions sources.

Since the Security Rules emulator does watch for changes, this is at the least an inconsistency in the development experience.

Work-around:

- we could architect automatic restart using `npm`, but that adds complexity. Let's see what Firebase people say, first..
-->

## Emulator: if you cannot deliver, please fail!

```
$ npm run start:rest

...
> concurrently -n emul,init "firebase emulators:start --config firebase.norules.json --only functions,firestore" "npm run _start_rest_2"

[init] 
[init] > firebase-jest-testing@0.0.1-alpha.2 _start_rest_2 /Users/asko/Git/firebase-jest-testing
[init] > wait-on http://localhost:4000 && FIREBASE_JSON=firebase.norules.json node --harmony-top-level-await sample/prime-docs.js
[init] 
[emul] i  emulators: Starting emulators: firestore
[emul] ⚠  functions: Not starting the functions emulator, make sure you have run firebase init.
[emul] ⚠  firestore: Did not find a Cloud Firestore rules file specified in a firebase.json config file.
[emul] ⚠  firestore: The emulator will default to allowing all reads and writes. Learn more about this option: https://firebase.google.com/docs/emulator-suite/install_and_configure#security_rules_configuration.
[emul] i  firestore: Firestore Emulator logging to firestore-debug.log
[emul] i  ui: Emulator UI logging to ui-debug.log
[emul] 
...
```

Above, the emulators are clearly started with `--only functions,firestore` parameter.

The log output states (as a warning):

>[emul] ⚠  functions: Not starting the functions emulator, make sure you have run firebase init.

It's like. I know you want Cloud Functions, but I don't know how to. But I'll keep on going anyhow. (maybe you won't notice)

PLEASE NO‼️‼️

It drains developers' time that something *seems* to launch, but doesn't do its job. The only meaningful way out when required features are explicitly requested is **to fail with a non-zero return code**. This would make the developer instantly understand something went wrong.

`firebase` 8.7.0

### Similar

```
> firebase emulators:start --config firebase.json --only firestore

⚠  Could not find config (firebase.json) so using defaults.
i  emulators: Starting emulators: firestore
⚠  firestore: Did not find a Cloud Firestore rules file specified in a firebase.json config file.
⚠  firestore: The emulator will default to allowing all reads and writes. Learn more about this option: https://firebase.google.com/docs/emulator-suite/install_and_configure#security_rules_configuration.
i  firestore: Firestore Emulator logging to firestore-debug.log
i  ui: Emulator UI logging to ui-debug.log

┌───────────────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! View status and logs at http://localhost:4000 │
└───────────────────────────────────────────────────────────────────────┘

┌───────────┬────────────────┬─────────────────────────────────┐
│ Emulator  │ Host:Port      │ View in Emulator UI             │
├───────────┼────────────────┼─────────────────────────────────┤
│ Firestore │ localhost:8080 │ http://localhost:4000/firestore │
└───────────┴────────────────┴─────────────────────────────────┘
  Other reserved ports: 4400, 4500

Issues? Report them at https://github.com/firebase/firebase-tools/issues and attach the *-debug.log files.
```

>⚠  Could not find config (firebase.json) so using defaults.

I'd prefer a failed launch, when the config file is explicitly stated: `--config firebase.json` and not found.

In this case, the file *was there* but it wasn't valid JSON. Please strive to make the error messages precise. The file **was found** but its contents were not valid. I don't want line-wise error message, just "not valid JSON" is enough to get one fast on the right bug. 🏹🐞


## Emulators: don't leak to the cloud

The `firebase emulators:exec` and `emulators:start` `--only` flag works like this:

- named services are emulated
- for other services, the cloud instances are used

What is the use case of such leaking to the cloud?

As a developer, I would prefer to keep emulation and cloud project completely separate. At the least, there should be (a `--only-only`?? :) ) flag, to state I just want emulated services.

Output from current `npm run dev` launch:

```
...
[emul] ⚠  functions: The following emulators are not running, calls to these services from the Functions emulator will affect production: database, hosting, pubsub
...
```

This is mostly just to "feel safe", I guess.

## References

- [Firebase Support Form](https://firebase.google.com/support/troubleshooter/contact)

