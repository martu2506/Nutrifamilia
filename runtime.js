window.NF_RUNTIME={version:'7.2.0',errors:[]};
window.addEventListener('error',function(e){window.NF_RUNTIME.errors.push({type:'error',message:e.message||'Error',line:e.lineno||0})});
window.addEventListener('unhandledrejection',function(e){window.NF_RUNTIME.errors.push({type:'promise',message:String(e.reason||'Unhandled rejection')})});
window.NutriFamiliaDiagnostics=function(){return {version:window.NF_RUNTIME.version,url:location.href,localStorage:!!window.localStorage,serviceWorker:'serviceWorker' in navigator,runtimeErrors:window.NF_RUNTIME.errors}};
window.NF_SOURCE_AUDIT={policy:'exact-match-first',sources:['SARA 2','USDA FoodData Central Foundation/SR','ANSES-Ciqual 2025','BEDCA/AESAN'],unknown:'never impute'};
