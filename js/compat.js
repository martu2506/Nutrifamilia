/* NutriFamilia V7.1.2 — auditoría integral y compatibilidad */
(function(){
  'use strict';
  var W=window;
  W.NF_COMPAT=W.NF_COMPAT||{};
  W.NF_COMPAT.version='7.1.2-audit1';
  W.NF_COMPAT.patches=[];
  function note(x){W.NF_COMPAT.patches.push(x)}
  function report(type,msg){if(W.NF_RUNTIME&&Array.isArray(W.NF_RUNTIME.errors))W.NF_RUNTIME.errors.push({type:type,message:String(msg)})}
  function escFallback(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])})}
  if(typeof W.esc!=='function')W.esc=escFallback;

  // 1) Preserve useful data from older localStorage namespaces when the current DB is empty.
  function migrateLegacy(){
    try{
      if(typeof db==='undefined'||!db||Array.isArray(db.profiles)&&db.profiles.length)return;
      var keys=['nutrifamilia_final_v1','nutrifamilia_v6_6_6','nutrifamilia_final_v1_standalone'];
      for(var i=0;i<keys.length;i++){
        var raw=localStorage.getItem(keys[i]); if(!raw)continue;
        var x; try{x=JSON.parse(raw)}catch(_){continue}
        if(!x||!Array.isArray(x.profiles))continue;
        if(typeof normalize==='function')x=normalize(x);
        db=x;
        if(typeof save==='function')save();
        note('migrated:'+keys[i]);
        break;
      }
    }catch(e){report('migration',e.message||e)}
  }

  // 2) Make documented food units first-class, especially egg-as-a-unit.
  var _allFoods=null;
  if(typeof W.allFoods==='function'){
    _allFoods=W.allFoods;
    W.allFoods=function(){
      var fs=_allFoods.apply(this,arguments);
      ['Huevo crudo','Huevo hervido','Huevo revuelto'].forEach(function(name){
        var f=fs&&fs[name];
        if(!f)return;
        if(!Array.isArray(f.unitOptions)||!f.unitOptions.length)f.unitOptions=[{value:'g',label:'g',gramsPerUnit:1}];
        if(!f.unitOptions.some(function(o){return o&&o.value==='unit'}))f.unitOptions.push({value:'unit',label:'huevo (sin cáscara)',gramsPerUnit:50});
        if(name==='Huevo crudo'){f.unitMode='per100g';f.unitLabel='g';}
      });
      return fs;
    };
    note('food-units');
  }

  // 3) Central calculation fix: when a documented unit exists and caller omitted the unit,
  // infer the unit only for small integer egg quantities. Explicit grams always remain grams.
  if(typeof W.calcEntryFromFood==='function'){
    var _calc=W.calcEntryFromFood;
    W.calcEntryFromFood=function(foodName,amount,base){
      base=base||{};
      var b=Object.assign({},base);
      var n=Number(String(amount).replace(',','.'));
      if((!b.inputUnit&&!b.unitChoice&&!b.unit)&&/^Huevo (crudo|hervido|revuelto)$/i.test(String(foodName))&&Number.isFinite(n)&&n>0&&n<=10&&Math.abs(n-Math.round(n))<1e-9){
        b.inputUnit='unit';
      }
      var out=_calc.call(this,foodName,amount,b);
      if(out&&typeof W.allFoods==='function'){
        var f=W.allFoods()[foodName];
        if(f&&((Number(f.veg)||0)>0||(Number(f.fruit)||0)>0)){
          out.plantKey=out.plantKey||String(foodName);
          out.plantKeys=Array.isArray(out.plantKeys)?out.plantKeys:[String(foodName)];
        }
      }
      return out;
    };
    note('central-calc');
  }

  // 4) Meal picker: choose documented unit by default; never force 100 g into a new meal.
  function setMealPickerDefaults(){
    try{
      var s=document.getElementById('food'),q=document.getElementById('qty'),u=document.getElementById('qtyUnit');
      if(!s||!q||!u||typeof W.allFoods!=='function')return;
      var f=W.allFoods()[s.value];if(!f)return;
      var opts=f.unitMode==='portion'?[{value:'portion',label:f.unitLabel||'porción'}]:(Array.isArray(f.unitOptions)&&f.unitOptions.length?f.unitOptions:[{value:'g',label:'g',gramsPerUnit:1}]);
      var selected=u.dataset.userUnit;
      if(!selected||!opts.some(function(o){return o.value===selected}))selected=opts.some(function(o){return o.value!=='g'})?opts.find(function(o){return o.value!=='g'}).value:opts[0].value;
      u.innerHTML=opts.map(function(o){return '<option value="'+W.esc(o.value)+'">'+W.esc(o.label)+'</option>'}).join('');
      u.value=selected;u.dataset.userUnit=selected;
      if(f.unitMode==='portion'||selected!=='g'){
        if(!q.value||Number(q.value)===100)q.value='1';
        q.min='0.25';q.step=f.unitMode==='portion'?'0.25':'1';
      }else{
        // Grams are precise: require the user to enter the amount instead of silently assuming 100 g.
        if(!u.dataset.userTouched)q.value='';
        q.min='0.5';q.step='1';
      }
      u.onchange=function(){u.dataset.userUnit=u.value;u.dataset.userTouched='1';if(u.value!=='g')q.value=q.value||'1';else q.value='';};
    }catch(e){report('meal-picker',e.message||e)}
  }
  if(typeof W.addMeal==='function'){
    var _addMeal=W.addMeal;
    W.addMeal=function(pre){var r=_addMeal.apply(this,arguments);setTimeout(setMealPickerDefaults,0);return r};
    note('meal-defaults');
  }
  if(typeof W.updateMealUnitUI==='function'){
    var _update=W.updateMealUnitUI;
    W.updateMealUnitUI=function(){var r=_update.apply(this,arguments);setMealPickerDefaults();return r};
    note('unit-switch');
  }

  // 5) Repair already-saved accidental egg entries only when they are the classic 1–3 g mistake.
  try{
    if(typeof db!=='undefined'&&Array.isArray(db.entries)){
      db.entries.forEach(function(e){
        if(/^Huevo crudo$/i.test(String(e.food))&&String(e.inputUnit||e.unit)==='g'&&Number(e.amount)>0&&Number(e.amount)<=3&&typeof W.calcEntryFromFood==='function'){
          var fixed=W.calcEntryFromFood('Huevo crudo',Number(e.amount),Object.assign({},e,{inputUnit:'unit'}));
          if(fixed){Object.assign(e,fixed);note('repaired-egg-entry')}
        }
      });
      if(typeof save==='function'&&W.NF_COMPAT.patches.indexOf('repaired-egg-entry')>=0)save();
    }
  }catch(e){report('egg-repair',e.message||e)}

  // 6) Improve plant diversity bookkeeping for existing and new entries.
  if(typeof W.plantDiversityToday==='function'){
    var _pdt=W.plantDiversityToday;
    W.plantDiversityToday=function(pid,date){
      var set=new Set();
      try{(db.entries||[]).filter(function(x){return x.pid===pid&&x.date===(date||localDate())}).forEach(function(x){
        if(Array.isArray(x.plantKeys))x.plantKeys.forEach(function(k){set.add(k)});
        else if(x.plantKey)set.add(x.plantKey);
        else if(typeof W.allFoods==='function'){var f=W.allFoods()[x.food];if(f&&(Number(f.veg)>0||Number(f.fruit)>0))set.add(String(x.food))}
      });
      }catch(e){return _pdt.apply(this,arguments)}
      return set.size;
    };
    note('plant-diversity');
  }

  // 7) Browser/runtime audit. It does not modify user data.
  W.NutriFamiliaDeepAudit=function(){
    var R=[];function ok(name,pass,detail){R.push({name:name,pass:!!pass,detail:String(detail||'')})}
    try{
      ok('Version',typeof VERSION!=='undefined'&&String(VERSION)==='7.1.2',typeof VERSION!=='undefined'?VERSION:'missing');
      ok('Runtime',!!W.NF_RUNTIME&&W.NF_RUNTIME.version==='7.1.2','runtime');
      ok('DB',typeof db!=='undefined'&&db&&Array.isArray(db.profiles)&&Array.isArray(db.entries)&&Array.isArray(db.weights),'colecciones');
      ok('Foods',typeof W.allFoods==='function'&&Object.keys(W.allFoods()).length>=98,Object.keys(W.allFoods()).length);
      var fs=W.allFoods();
      ok('Egg unit',!!fs['Huevo crudo']&&Array.isArray(fs['Huevo crudo'].unitOptions)&&fs['Huevo crudo'].unitOptions.some(function(o){return o.value==='unit'}),'unidad huevo');
      if(typeof W.calcEntryFromFood==='function'){
        var e3=W.calcEntryFromFood('Huevo crudo',3);ok('3 eggs => unit',!!e3&&e3.inputUnit==='unit'&&e3.amount===3&&Math.round(e3.grams)===150,'3 unidades / 150 g');
        var g3=W.calcEntryFromFood('Huevo crudo',3,{inputUnit:'g'});ok('3 g stays 3 g',!!g3&&g3.inputUnit==='g'&&g3.grams===3,'explicit grams');
        var ch=W.calcEntryFromFood('Pechuga de pollo',100,{inputUnit:'g'});ok('Chicken 100 g',!!ch&&ch.grams===100&&Number(ch.kcal)>0,'cálculo');
      }
      ok('UI functions',['render','showTab','addMeal','saveMeal','addWeight','saveWeight','newProfile','createProfile'].every(function(n){return typeof W[n]==='function'}),'funciones');
      ok('Export/Import',typeof W.exportData==='function'&&typeof W.importData==='function','backup');
      ok('Health',typeof W.healthConnectAvailable==='function'&&typeof W.onHealthData==='function','health');
      ok('AI',typeof W.aiConfigured==='function'&&typeof W.askAI==='function','IA opcional');
      ok('Recipes',typeof W.newRecipe==='function'&&typeof W.saveRecipe==='function','recetas');
      ok('SW','serviceWorker' in navigator,'service worker');
      return {version:'7.1.2',ok:R.every(function(x){return x.pass}),results:R,errors:(W.NF_RUNTIME&&W.NF_RUNTIME.errors)||[]};
    }catch(e){R.push({name:'Audit exception',pass:false,detail:e.message||String(e)});return {version:'7.1.2',ok:false,results:R,errors:[e.message||String(e)]}}
  };

  // 8) One safe automatic audit after all synchronous scripts have loaded.
  setTimeout(function(){try{W.NF_COMPAT.deepAudit=W.NutriFamiliaDeepAudit();if(!W.NF_COMPAT.deepAudit.ok)report('deep-audit','Uno o más controles funcionales fallaron.')}catch(e){report('deep-audit',e.message||e)}},0);

  // 9) Register Service Worker and make cache transitions deterministic.
  if('serviceWorker' in navigator){
    navigator.serviceWorker.addEventListener('controllerchange',function(){
      try{if(sessionStorage.getItem('nf-sw-reloaded-audit1')==='1')return;sessionStorage.setItem('nf-sw-reloaded-audit1','1');setTimeout(function(){location.reload()},80)}catch(_){}
    });
    W.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(function(e){report('service-worker',e.message||e)})},{once:true});
  }

  migrateLegacy();
})();
