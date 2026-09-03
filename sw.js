const CACHE='nutrifamilia-v7.1.2-audit1';
const SHELL=[
 './index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 './css/base.css','./css/components.css','./css/layout.css','./css/accessibility.css','./css/theme-yellow-black.css','./css/dashboard.css',
 './js/core/runtime.js','./js/data/nutrition-data.js','./js/core/nutrition-engine.js','./js/core/storage.js',
 './js/features/health.js','./js/features/ai.js','./js/features/voice.js','./js/features/ai-results.js','./js/features/meals.js','./js/features/recipes.js',
 './js/core/data-io.js','./js/ui/ui.js','./js/ui/dashboard.js','./js/core/diagnostics.js','./js/compat.js'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('nutrifamilia-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin)return;
 const nav=e.request.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname==='/'||u.pathname.endsWith('/');
 if(nav){e.respondWith(fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',x));return r}).catch(()=>caches.match('./index.html')));return}
 e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match('./index.html'))));
});
