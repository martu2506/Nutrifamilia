const CACHE='nutrifamilia-v7.8.6';
const SHELL=[
 './index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
 './css/base.css','./css/components.css','./css/layout.css','./css/accessibility.css','./css/theme-yellow-black.css','./css/dashboard.css',
 './js/core/app-version.js','./js/core/runtime.js','./js/data/nutrition-data.js','./js/core/nutrition-engine.js','./js/core/storage.js','./js/data/food-catalog.js',
 './js/features/health.js','./js/features/ai.js','./js/features/voice.js','./js/features/ai-results.js','./js/features/meals.js','./js/features/recipes.js',
 './js/core/data-io.js','./js/ui/ui.js','./js/ui/dashboard.js','./js/core/diagnostics.js'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('nutrifamilia-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
async function networkFirst(request){
 const url=new URL(request.url);
 const navigation=request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname==='/'||url.pathname.endsWith('/');
 try{
   const response=await fetch(request);
   if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{});}
   return response;
 }catch(_){
   const cached=await caches.match(request);
   if(cached)return cached;
   if(navigation){
     const shell=await caches.match('./index.html');if(shell)return shell;
   }
   throw _;
 }
}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(networkFirst(e.request))});
