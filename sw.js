'use strict';
const CACHE_NAME = 'finku-v2-11-0-polish-1';
const APP_FILES = ['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>(key.startsWith('dompetku-')||key.startsWith('finku-'))&&key!==CACHE_NAME).map(key=>caches.delete(key))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req=event.request, url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    if(req.mode==='navigate'){
      try{const res=await fetch(req);if(res&&res.ok){cache.put('./index.html',res.clone()).catch(()=>{});return res;}}catch(_){}
      return (await cache.match('./index.html'))||(await cache.match('./'));
    }
    const cached=await cache.match(req);if(cached)return cached;
    try{const res=await fetch(req);if(res&&res.ok&&res.type==='basic')cache.put(req,res.clone()).catch(()=>{});return res;}
    catch(_){return Response.error();}
  })());
});
