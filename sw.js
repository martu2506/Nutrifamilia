const CACHE='nutrifamilia-v7.1.2';
const SHELL=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith('nutrifamilia-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;const nav=e.request.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname==='/'||u.pathname.endsWith('/');if(nav){e.respondWith(fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(k=>k.put('./index.html',x));return r}).catch(()=>caches.match('./index.html')));return}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(k=>k.put(e.request,x));return r}).catch(()=>caches.match('./index.html'))))});
