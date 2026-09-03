/* NutriFamilia V7.1.2 — compatibilidad, correcciones funcionales y QA nutricional */
(function(){
  'use strict';
  var W=window;
  W.NF_COMPAT=W.NF_COMPAT||{};
  W.NF_COMPAT.version='7.1.2-final1';
  W.NF_COMPAT.patches=[];
  function note(x){W.NF_COMPAT.patches.push(x)}
  function report(type,msg){
    if(W.NF_RUNTIME&&Array.isArray(W.NF_RUNTIME.errors))W.NF_RUNTIME.errors.push({type:type,message:String(msg)});
  }
  if(typeof W.esc!=='function')W.esc=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]})};

  /* Recupera datos de nombres históricos sin tocar una DB ya existente. */
  function migrateLegacy(){
    try{
      if(typeof db==='undefined'||!db)return;
      if(Array.isArray(db.profiles)&&db.profiles.length)return;
      var keys=['nutrifamilia_final_v1','nutrifamilia_final_v1_standalone','nutrifamilia_v6_6_6','nutrifamilia_v6_6_6_standalone'];
      for(var i=0;i<keys.length;i++){
        var raw=localStorage.getItem(keys[i]);
        if(!raw)continue;
        var x;try{x=JSON.parse(raw)}catch(_){continue}
        if(!x||!Array.isArray(x.profiles))continue;
        if(typeof W.normalize==='function')x=W.normalize(x);
        db=x;
        if(typeof W.save==='function')W.save();
        note('migrated:'+keys[i]);
        break;
      }
    }catch(e){report('migration',e.message||e)}
  }

  /* Unidades documentadas: 1 huevo sin cáscara = 50 g para la referencia local. */
  var baseAllFoods=W.allFoods;
  if(typeof baseAllFoods==='function'){
    W.allFoods=function(){
      var fs=baseAllFoods.apply(this,arguments)||{};
      ['Huevo crudo','Huevo hervido','Huevo revuelto'].forEach(function(name){
        var f=fs[name]; if(!f)return;
        f.unitOptions=Array.isArray(f.unitOptions)&&f.unitOptions.length?f.unitOptions.slice():[{value:'g',label:'g',gramsPerUnit:1}];
        if(!f.unitOptions.some(function(o){return o&&o.value==='unit'}))f.unitOptions.push({value:'unit',label:'huevo (sin cáscara)',gramsPerUnit:50});
        if(name!=='Huevo crudo' && f.unitLabel==='g')f.unitLabel='g';
      });
      return fs;
    };
    note('documented-food-units');
  }


  /* Unidades prácticas comunes con peso comestible aproximado. Gramos queda disponible para precisión. */
  var UNIT_PATCHES={
    'Banana':{value:'unit',label:'banana mediana (aprox.)',gramsPerUnit:118},
    'Manzana':{value:'unit',label:'manzana mediana (aprox.)',gramsPerUnit:182},
    'Pera':{value:'unit',label:'pera mediana (aprox.)',gramsPerUnit:178},
    'Naranja':{value:'unit',label:'naranja mediana (aprox.)',gramsPerUnit:131},
    'Kiwi':{value:'unit',label:'kiwi (aprox.)',gramsPerUnit:69},
    'Limón':{value:'unit',label:'limón (aprox.)',gramsPerUnit:58},
    'Palta':{value:'unit',label:'palta mediana (aprox.)',gramsPerUnit:150},
    'Tomate':{value:'unit',label:'tomate mediano (aprox.)',gramsPerUnit:123},
    'Cebolla':{value:'unit',label:'cebolla mediana (aprox.)',gramsPerUnit:110},
    'Zanahoria':{value:'unit',label:'zanahoria mediana (aprox.)',gramsPerUnit:61},
    'Pepino':{value:'unit',label:'pepino mediano (aprox.)',gramsPerUnit:301},
    'Morrón':{value:'unit',label:'morrón mediano (aprox.)',gramsPerUnit:119},
    'Pimiento verde crudo':{value:'unit',label:'pimiento verde mediano (aprox.)',gramsPerUnit:119},
    'Zapallito':{value:'unit',label:'zapallito mediano (aprox.)',gramsPerUnit:196},
    'Zapallito crudo':{value:'unit',label:'zapallito mediano (aprox.)',gramsPerUnit:196},
    'Papa hervida':{value:'unit',label:'papa mediana (aprox.)',gramsPerUnit:173}
  };
  if(typeof W.allFoods==='function'){
    var __foodsWithUnits=W.allFoods;
    W.allFoods=function(){
      var fs=__foodsWithUnits.apply(this,arguments)||{};
      Object.keys(UNIT_PATCHES).forEach(function(name){
        var f=fs[name],u=UNIT_PATCHES[name];if(!f)return;
        f.unitMode=f.unitMode||'per100g';
        f.unitOptions=Array.isArray(f.unitOptions)?f.unitOptions.slice():[{value:'g',label:'g',gramsPerUnit:1}];
        if(!f.unitOptions.some(function(o){return o&&o.value===u.value}))f.unitOptions.push(u);
        f.unitBasisNote='Peso de unidad aproximado; para máxima precisión usar gramos.';
      });
      return fs;
    };
    note('common-unit-registry');
  }

  /* Cálculo central: solo inferir huevo como unidad cuando el usuario no dio unidad explícita. */
  var baseCalc=W.calcEntryFromFood;
  if(typeof baseCalc==='function'){
    W.calcEntryFromFood=function(name,amount,base){
      var b=Object.assign({},base||{}), n=Number(String(amount).replace(',','.'));
      if(!b.inputUnit&&!b.unitChoice&&!b.unit && /^Huevo (crudo|hervido|revuelto)$/i.test(String(name)) && Number.isFinite(n) && n>0 && n<=12 && Math.abs(n-Math.round(n))<1e-9){
        b.inputUnit='unit';
      }
      return baseCalc.call(this,name,amount,b);
    };
    note('egg-unit-inference');
  }

  function currentMealRefs(){return {s:document.getElementById('food'),q:document.getElementById('qty'),u:document.getElementById('qtyUnit')}}
  function makeDefaultUnit(refs){
    var s=refs.s,q=refs.q,u=refs.u;
    if(!s||!q||!u||typeof W.allFoods!=='function')return;
    var fs=W.allFoods(),f=fs[s.value]; if(!f)return;
    var opts=f.unitMode==='portion'?[{value:'portion',label:f.unitLabel||'porción'}]:(Array.isArray(f.unitOptions)&&f.unitOptions.length?f.unitOptions:[{value:'g',label:'g',gramsPerUnit:1}]);
    var previous=u.dataset.userUnit||'';
    var preferred=opts.find(function(o){return o.value===previous}) || opts.find(function(o){return o.value!=='g'}) || opts[0];
    u.innerHTML=opts.map(function(o){return '<option value="'+W.esc(o.value)+'">'+W.esc(o.label)+'</option>'}).join('');
    u.value=preferred.value;u.dataset.userUnit=preferred.value;
    var touched=u.dataset.userTouched==='1';
    if(!touched){
      if(preferred.value!=='g'||f.unitMode==='portion')q.value='1';
      else q.value='';
    }
    q.min=(preferred.value==='g'&&!f.unitMode? '0.5':'0.25');
    q.step=(preferred.value==='g'&&!f.unitMode?'1':'0.25');
    q.placeholder=preferred.value==='g'?'Ej. 120':'Ej. 1';
  }
  function markMealControls(){
    var r=currentMealRefs();if(!r.u)return;
    if(!r.u.dataset.nfBound){
      r.u.dataset.nfBound='1';
      r.u.addEventListener('change',function(){r.u.dataset.userTouched='1';r.u.dataset.userUnit=r.u.value;});
      r.u.addEventListener('input',function(){r.u.dataset.userTouched='1';r.u.dataset.userUnit=r.u.value;});
    }
    if(r.s&&!r.s.dataset.nfBound){
      r.s.dataset.nfBound='1';
      r.s.addEventListener('change',function(){if(r.u){r.u.dataset.userTouched='';r.u.dataset.userUnit='';}setTimeout(makeDefaultUnit,0,r);});
    }
    makeDefaultUnit(r);
  }
  if(typeof W.addMeal==='function'){
    var baseAddMeal=W.addMeal;
    W.addMeal=function(pre){var out=baseAddMeal.apply(this,arguments);setTimeout(markMealControls,0);setTimeout(markMealControls,30);return out};
    note('meal-defaults');
  }
  if(typeof W.updateMealUnitUI==='function'){
    var baseUpdateMeal=W.updateMealUnitUI;
    W.updateMealUnitUI=function(){var out=baseUpdateMeal.apply(this,arguments);setTimeout(markMealControls,0);return out};
    note('meal-unit-ui');
  }
  if(typeof W.saveMeal==='function'){
    var baseSaveMeal=W.saveMeal;
    W.saveMeal=function(){
      try{
        var r=currentMealRefs(),f=r.s&&typeof W.allFoods==='function'?W.allFoods()[r.s.value]:null;
        if(f&&r.u&&r.u.value==='g'&&r.u.dataset.userTouched!=='1'&&r.u.options.length>1){
          var unitOpt=[].slice.call(r.u.options).find(function(o){return o.value!=='g'});
          if(unitOpt){r.u.value=unitOpt.value;r.u.dataset.userUnit=unitOpt.value; if(!r.q.value||Number(r.q.value)===100)r.q.value='1';}
        }
      }catch(e){report('meal-save-guard',e.message||e)}
      return baseSaveMeal.apply(this,arguments);
    };
    note('meal-save-guard');
  }

  /* Recetas: evitar 100 como valor inicial cuando la unidad es una porción/unidad. */
  if(typeof W.addRecipeRow==='function'){
    var baseAddRecipe=W.addRecipeRow;
    W.addRecipeRow=function(){var out=baseAddRecipe.apply(this,arguments);setTimeout(function(){
      document.querySelectorAll('.recipe-row').forEach(function(row){
        var q=row.querySelector('.rq'),u=row.querySelector('.ru');
        if(q&&u&&u.value!=='g'&&!q.dataset.nfTouched)q.value='1';
      });
    },0);return out};
    note('recipe-defaults');
  }

  /* Corrige diversidad vegetal en entradas antiguas, sin cambiar cantidades. */
  if(typeof W.plantDiversityToday==='function'){
    W.plantDiversityToday=function(pid,date){
      var d=date||W.localDate(),set=new Set();
      (db.entries||[]).filter(function(x){return x.pid===pid&&x.date===d}).forEach(function(x){
        if(Array.isArray(x.plantKeys))x.plantKeys.forEach(function(k){set.add(k)});
        else if(x.plantKey)set.add(x.plantKey);
        else if(typeof W.allFoods==='function'){
          var f=W.allFoods()[x.food];
          if(f&&(Number(f.veg)>0||Number(f.fruit)>0))set.add(String(x.food));
        }
      });
      return set.size;
    };
    note('plant-diversity');
  }

  /* Auditoría nutricional: detecta datos incompletos o inconsistentes; no inventa valores. */
  W.nutriDataAudit=function(){
    var R=[],fs=typeof W.allFoods==='function'?W.allFoods():{};
    function push(name,pass,detail){R.push({name:name,pass:!!pass,detail:String(detail||'')})}
    var names=Object.keys(fs);
    push('Base de alimentos',names.length>=98,names.length+' alimentos');
    var invalid=names.filter(function(n){var f=fs[n]||{};return !Number.isFinite(Number(f.kcal))||Number(f.kcal)<0||!['per100g','portion'].includes(f.unitMode)});
    push('Estructura nutricional',invalid.length===0,invalid.length?invalid.slice(0,12).join(', '):'sin errores estructurales');
    var noSource=names.filter(function(n){var f=fs[n]||{};return !f.source||!f.sourceStatus||!f.basis});
    push('Trazabilidad',noSource.length===0,noSource.length+' sin fuente/base/estado completo');
    var badEnergy=names.filter(function(n){var f=fs[n]||{},k=Number(f.kcal),p=Number(f.p),c=Number(f.c),fat=Number(f.f);if(![k,p,c,fat].every(Number.isFinite)||k<=0)return false;var m1=4*p+4*c+9*fat;return Math.abs(m1-k)/k>.25});
    push('Consistencia energética',badEnergy.length===0,badEnergy.length+' fuera de ±25% respecto de macros declarados');
    var egg=fs['Huevo crudo'];
    push('Huevo crudo por unidad',!!egg&&egg.unitOptions.some(function(o){return o.value==='unit'&&Number(o.gramsPerUnit)===50}),egg?JSON.stringify(egg.unitOptions):'no disponible');
    var cooked=fs['Huevo hervido'];
    push('Huevo hervido base USDA',!!cooked&&Number(cooked.kcal)===155&&Number(cooked.p)>12, cooked?String(cooked.kcal)+' kcal/100 g':'no disponible');
    var chicken=fs['Pechuga de pollo'];
    push('Pechuga de pollo base',!!chicken&&Number(chicken.kcal)>0&&Number(chicken.p)>20, chicken?String(chicken.kcal)+' kcal/100 g':'no disponible');
    var waterTarget=typeof W.targets==='function'&&typeof W.getActiveProfile==='function'&&W.getActiveProfile()?W.targets(W.getActiveProfile()).water:null;
    push('Objetivo de agua',waterTarget==null||Number(waterTarget)>0,waterTarget==null?'sin perfil activo':''+waterTarget+' ml/día');
    var foodQuality={provisional:0,withSource:0,unknownMicros:0};
    names.forEach(function(n){var f=fs[n];if(String(f.sourceStatus||'').toLowerCase().includes('provisional'))foodQuality.provisional++;if(f.source)foodQuality.withSource++;if(f.dataQuality==='incompleto')foodQuality.unknownMicros++});
    push('Datos provisionales identificados',true,foodQuality.provisional+' alimentos explícitamente provisionales');
    return {ok:R.every(function(x){return x.pass}),results:R,summary:foodQuality};
  };

  W.NutriFamiliaDeepAudit=function(){
    var R=[];function ok(n,p,d){R.push({name:n,pass:!!p,detail:String(d||'')})}
    try{
      ok('Versión',typeof W.VERSION!=='undefined'&&String(W.VERSION)==='7.1.2',typeof W.VERSION!=='undefined'?W.VERSION:'faltante');
      ok('Runtime',!!W.NF_RUNTIME&&W.NF_RUNTIME.version==='7.1.2','runtime');
      ok('Base nutricional',typeof W.allFoods==='function'&&Object.keys(W.allFoods()).length>=98,Object.keys(W.allFoods()).length);
      ok('Cálculo por alimento',typeof W.calcEntryFromFood==='function','calcEntryFromFood');
      if(typeof W.calcEntryFromFood==='function'){
        var e3=W.calcEntryFromFood('Huevo crudo',3);ok('3 huevos = 3 unidades / 150 g',!!e3&&e3.inputUnit==='unit'&&e3.amount===3&&Math.round(Number(e3.grams))===150,JSON.stringify(e3));
        var g3=W.calcEntryFromFood('Huevo crudo',3,{inputUnit:'g'});ok('3 g explícitos siguen siendo 3 g',!!g3&&g3.inputUnit==='g'&&Number(g3.grams)===3,JSON.stringify(g3));
      }
      ok('UI', ['render','showTab','addMeal','saveMeal','addWeight','saveWeight','newProfile'].every(function(n){return typeof W[n]==='function'}),'funciones principales');
      ok('Recetas',typeof W.newRecipe==='function'&&typeof W.saveRecipe==='function','recetas');
      ok('Backup',typeof W.exportData==='function'&&typeof W.importData==='function','export/import');
      ok('Salud',typeof W.healthConnectAvailable==='function'&&typeof W.onHealthData==='function','Health Connect');
      ok('IA segura',typeof W.callAI==='function'&&W.callAI.toString().indexOf('Authorization')<0,'sin API key en navegador');
      var qa=W.nutriDataAudit();ok('QA nutricional',qa.ok,qa.results.filter(function(x){return !x.pass}).length+' observaciones críticas');
      return {version:'7.1.2-final1',ok:R.every(function(x){return x.pass}),results:R,nutrition:qa,errors:(W.NF_RUNTIME&&W.NF_RUNTIME.errors)||[]};
    }catch(e){return {version:'7.1.2-final1',ok:false,results:[{name:'Excepción',pass:false,detail:e.message||String(e)}],errors:[e.message||String(e)]}}
  };

  setTimeout(function(){try{W.NF_COMPAT.deepAudit=W.NutriFamiliaDeepAudit()}catch(e){report('deep-audit',e.message||e)}},0);
  migrateLegacy();

  if('serviceWorker' in navigator){
    W.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(function(e){report('service-worker',e.message||e)})},{once:true});
    navigator.serviceWorker.addEventListener('controllerchange',function(){
      try{if(sessionStorage.getItem('nf-sw-reloaded-final1')==='1')return;sessionStorage.setItem('nf-sw-reloaded-final1','1');setTimeout(function(){location.reload()},100)}catch(_){ }
    });
  }
})();
