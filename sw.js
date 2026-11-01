/* MDCAT JOURNEY service worker
   RELEASE RULE: change VERSION on every release. A new VERSION makes this file
   different, which is how every student's app notices there is an update.
   This worker only ever touches CacheStorage entries that start with "mdcat-".
   It never touches localStorage, IndexedDB or Firebase, so accounts, MCQ progress,
   test results, books and notes are never deleted by an update. */
var VERSION="2026.11.01.1";
var PREFIX="mdcat-";
var CACHE=PREFIX+VERSION;
var ASSETS=["./manifest.json","./icon-192.png","./icon-512.png"];

self.addEventListener("install",function(e){
  /* No skipWaiting() here on purpose: the new version waits until the student taps "Update Now". */
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      /* cache:"reload" skips the browser's HTTP cache so we never store an old copy */
      var jobs=ASSETS.map(function(u){
        return fetch(u,{cache:"reload"}).then(function(r){
          if(!r||!r.ok)throw new Error("download failed: "+u);
          return c.put(u,r);
        });
      });
      jobs.push(fetch("./index.html",{cache:"reload"}).then(function(r){
        if(!r||!r.ok)throw new Error("download failed: index.html");
        return Promise.all([c.put("./index.html",r.clone()),c.put("./",r)]);
      }));
      return Promise.all(jobs);
    }).catch(function(err){
      /* All or nothing: a half-downloaded version is thrown away and the student keeps the current one. */
      return caches.delete(CACHE).then(function(){throw err});
    })
  );
});

self.addEventListener("activate",function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k.indexOf(PREFIX)===0&&k!==CACHE}).map(function(k){return caches.delete(k)}));
    }).then(function(){return self.clients.claim()})
  );
});

self.addEventListener("message",function(e){
  var d=e.data||{};
  if(d.type==="SKIP_WAITING"){self.skipWaiting();return}
  if(d.type==="GET_VERSION"&&e.source){e.source.postMessage({type:"VERSION",version:VERSION})}
});

self.addEventListener("fetch",function(e){
  var r=e.request;
  if(r.method!=="GET")return;
  if(new URL(r.url).origin!==self.location.origin)return;
  e.respondWith(
    fetch(r).then(function(n){
      if(n&&n.ok&&n.type==="basic"){var c2=n.clone();caches.open(CACHE).then(function(c){c.put(r,c2)})}
      return n;
    }).catch(function(){
      return caches.match(r).then(function(x){return x||caches.match("./index.html")});
    })
  );
});
