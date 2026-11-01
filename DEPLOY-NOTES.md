# MDCAT JOURNEY - deployment notes

Files to upload (replace the old ones): `index.html` and `sw.js`.
Keep `manifest.json`, `icon-192.png`, `icon-512.png` as they are.

## 1. Admin accounts (IMPORTANT)
Only admin accounts see **Import MCQs** and can add, edit, delete, import or share.
Everyone else only practises. Admin = a verified login whose email is listed in
`ADMIN_EMAILS` in index.html (search for `ADMIN_EMAILS`). It currently contains
`mdcatjourney.support41@gmail.com`. If you log in with a different email, add it:

    ADMIN_EMAILS=["mdcatjourney.support41@gmail.com","your-other-email@gmail.com"]

## 2. Releasing an update (so every student gets "New Update Available!")
Change the VERSION line at the top of `sw.js` on every release, for example:

    var VERSION="2026.11.02.1";

Automatic option for GitHub Actions (add this step after checkout, before the Firebase deploy step):

    - name: Stamp service worker version
      run: sed -i "s/^var VERSION=.*/var VERSION=\"${GITHUB_SHA::8}\";/" sw.js

## 3. Firebase Hosting headers (merge into your existing firebase.json "hosting" block)
These make sure students' phones always ask the server for the newest sw.js / index.html:

    "headers": [
      {"source": "/sw.js",         "headers": [{"key": "Cache-Control", "value": "no-cache, no-store, must-revalidate"}]},
      {"source": "/index.html",    "headers": [{"key": "Cache-Control", "value": "no-cache"}]},
      {"source": "/",              "headers": [{"key": "Cache-Control", "value": "no-cache"}]},
      {"source": "/manifest.json", "headers": [{"key": "Cache-Control", "value": "no-cache"}]}
    ]

## 4. Test on a real phone and desktop after deploying (10 minutes)
1. Deploy version A. Open the app on Android Chrome, install it, log in, do a few MCQs. Open it on desktop Chrome too.
2. Change VERSION in sw.js, deploy version B.
3. Reopen the app (or switch back to it). Within a few seconds the pink "New Update Available!" card appears.
4. Tap Later: card hides, and comes back after about 4 hours or next visit.
5. Tap Update Now: the app restarts on version B. Check that your MCQs, progress, bookmarks, notes and books are still there.
6. Turn on airplane mode, deploy version C, reopen: the app still works. Turn internet back on: the update card appears.
7. Settings shows "App updates" with the version number and a "Check for updates" button.
