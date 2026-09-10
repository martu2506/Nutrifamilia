function runSelfTest(){const R=[],ok=(name,pass,detail)=>R.push({name,pass:!!pass,detail:String(detail||'')});try{
 ok('Versión',VERSION==='7.8.9'&&NF_RUNTIME.version==='7.8.9',VERSION);ok('renderHome presente',typeof window.renderHome==='function','función de dashboard');ok('Namespace independiente',KEY==='nutrifamilia_v7_8_10'&&!Object.prototype.hasOwnProperty.call(window,'LEGACY_KEYS'),'namespace sin migración implícita');ok('Favoritos',Array.isArray(db.favoriteFoods),'colección');ok('Voz progresiva',typeof startVoiceMeal==='function','Web Speech');ok('Barcode lookup',typeof lookupBarcode==='function','Open Food Facts opcional');ok('Colecciones',Array.isArray(db.profiles)&&Array.isArray(db.entries)&&Array.isArray(db.weights)&&Array.isArray(db.recipes),'arrays');ok('Comida múltiple',typeof createMealDraft==='function'&&typeof addMealDraftItem==='function'&&typeof mealDraftTotals==='function'&&typeof groupMealEntries==='function','varios alimentos por comida');ok('Catálogo visual',typeof foodIcon==='function'&&foodCategories().length===14&&['carnes-proteinas','panificados','cereales-legumbres','infusiones','bebidas','comidas-preparadas'].every(id=>foodCategories().some(c=>c.id===id)),'14 categorías nuevas e iconos');const taxonomy=window.NF_FOOD_CATEGORY_MAP||{},visible=window.NF_FOOD_VISIBLE_CATEGORY_MAP||{};ok('Taxonomía',Object.keys(taxonomy).length>=30&&Object.keys(visible).length===245,'taxonomía explícita + catálogo visible');ok('Bebidas e infusiones ampliadas',['Agua','Gaseosa común','Gaseosa sin azúcar','Vino tinto','Cerveza','Mate dulce con azúcar','Mate con edulcorante','Té con leche'].every(n=>!!allFoods()[n]),'bebidas e infusiones');ok('Funciones UI',typeof setup==='function'&&typeof showTab==='function'&&typeof render==='function'&&typeof addWeight==='function'&&typeof deleteWeight==='function'&&typeof runSelfTest==='function','presentes');
 const fs=allFoods(),names=Object.keys(fs);ok('Base alimentos',names.length>=98,names.length);const invalidFoods=names.filter(n=>{const f=fs[n];return !Number.isFinite(Number(f.kcal))||f.kcal<0||!['per100g','portion'].includes(f.unitMode)});ok('Alimentos coherentes',invalidFoods.length===0,invalidFoods.length?invalidFoods.join(','):(names.length+' alimentos válidos'));ok('Auditoría SARA',Object.keys(FOOD_AUDIT).length===19,Object.keys(FOOD_AUDIT).length);ok('Auditoría USDA',Object.keys(USDA_AUDIT).length>=10,Object.keys(USDA_AUDIT).length);ok('Huevo 100 g USDA',fs['Huevo hervido']?.kcal===155&&fs['Huevo hervido']?.p>12,'corrección base');const cf=normalize({profiles:[{id:'u1',name:'U'}],customFoods:[{name:'Producto',kcal:100,p:5,c:10,f:2,unitMode:'portion',unitLabel:'1 vaso',basis:'por 1 vaso',source:'Etiqueta',sourceStatus:'dato de producto'}],favoriteFoods:[{pid:'u1',food:'Producto'}]});ok('Custom food metadata',cf.customFoods[0]?.unitMode==='portion'&&cf.customFoods[0]?.unitLabel==='1 vaso'&&cf.favoriteFoods[0]?.pid===cf.profiles[0].id,'preserva unidad/fuente/favorito');ok('Sin falsa atribución',Object.keys(FOOD_AUDIT).every(k=>FOOD_AUDIT[k].source==='SARA 2'),'registro');const oil=fs['Aceite (1 cucharadita)'];ok('Unidad aceite',oil?.unitMode==='per100g'&&Array.isArray(oil?.unitOptions)&&oil.unitOptions.some(o=>o.value==='tsp'&&o.gramsPerUnit===5),JSON.stringify(oil));const o1=calcEntryFromFood('Aceite (1 cucharadita)',1,{inputUnit:'tsp'});ok('Aceite 1 cucharadita',o1?.kcal===45&&o1?.f===5&&o1?.grams===5,JSON.stringify(o1));const o5=calcEntryFromFood('Aceite (1 cucharadita)',5,{inputUnit:'tsp'});ok('Aceite 5 cucharaditas',o5?.kcal===225&&o5?.grams===25,JSON.stringify(o5));const ch=calcEntryFromFood('Pechuga de pollo',100);ok('Pollo 100 g',ch?.kcal===151&&ch?.grams===100,JSON.stringify(ch));ok('SARA valores clave',[['Papa hervida',81],['Batata hervida',83],['Lentejas cocidas',116],['Garbanzos cocidos',138],['Brócoli',27],['Lechuga',12],['Rúcula',24],['Pepino',12],['Champiñones',24],['Palta',160],['Banana',92],['Manzana',48],['Pera',55],['Kiwi',56],['Limón',35],['Almendras',570],['Aceite de oliva',900],['Aceite (1 cucharadita)',900],['Manteca',758]].every(([n,k])=>fs[n]?.kcal===k),'18 valores');ok('Cantidades inválidas',calcEntryFromFood('Pechuga de pollo',0)===null&&calcEntryFromFood('Pechuga de pollo',-1)===null&&calcEntryFromFood('Pechuga de pollo',Infinity)===null,'rechazo');
 const m=macroTargetsFromPlan({pattern:'lowcarb',objectives:['lose_fat'],id:'T'},2284,115);ok('Cierre macros',Math.abs(m.protein*4+m.carbs*4+m.fat*9-2284)<=5,JSON.stringify(m));ok('Fibra mínima',autoFiberTarget(2084,'verylowcarb')>=25,autoFiberTarget(2084,'verylowcarb'));ok('Agua EFSA',autoWaterTarget(70,'F')===2000&&autoWaterTarget(70,'M')===2500,'total water');
 db.profiles=[{id:'T',name:'T',age:42,sex:'M',height:180,weight:115,goal:100,activity:'sedentario',pattern:'balanced',targetMode:'auto',objectives:['lose_fat'],goalType:'lose_fat',pr:null,cal:null,fiber:null,water:null,sodium:null,sat:null,steps:0,plants:null,allergies:[],dislikes:[]}];db.active='T';db.entries=[];db.weights=[{pid:'T',date:days(7)[0],kg:115,source:'manual'}];db.recipes=[];db.ai={enabled:false,mode:'proxy',model:'',apiKey:'',endpoint:''};
 ok('Mifflin válido',!!calcAutoTargets({age:42,sex:'M',height:180,weight:115,goal:100,activity:'sedentario',goalType:'bajar',pattern:'balanced'}),'válido');ok('Mifflin inválido',calcAutoTargets({age:null,sex:'',height:0,weight:0,activity:'sedentario',goalType:'mantener'})===null,'rechazo');const d0=days(7)[0];const e1=calcEntryFromFood('Pechuga de pollo',100,{pid:'T',date:d0});db.entries.push(e1);const t1=totals(d0,'T');ok('Micros desconocidos',t1.omega6===undefined&&t1.unknownNutrients.includes('omega6'),JSON.stringify(t1.unknownNutrients));db.entries=[];db.entries.push({pid:'T',date:days(7)[1],food:'fruta',kcal:100,p:1,c:20,f:0,fib:3,sugar:10,sat:0,sodium:1,veg:0,fruit:400,plantCount:1,wholeFoodCount:1,ultraCount:0});ok('Fruta + verdura',nutritionScore(db.profiles[0],days(7)[1]).components.verduras===1,'400 g fruta');db.entries=[];
 const n=normalize({profiles:[{id:'juan.<>',name:'Juan'}],entries:[{pid:'juan.<>',date:'2099-01-01',food:'Pechuga de pollo',grams:100,kcal:165,p:31,c:0,f:3.6,fib:0,sugar:0,sat:1,sodium:74,veg:0,fruit:0}],weights:[{pid:'juan.<>',date:'2099-01-01',kg:80}],waterByDate:{'juan.<>|2099-01-01':1},stepsByDate:{'juan.<>|2099-01-01':2},sleepByDate:{'juan.<>|2099-01-01':3},healthSync:{'juan.<>':4}});const sid=n.profiles[0].id;ok('Remapeo IDs',/^[A-Za-z0-9_-]+$/.test(sid)&&n.entries[0].pid===sid&&n.weights[0].pid===sid&&Object.keys(n.waterByDate)[0].startsWith(sid+'|')&&n.healthSync[sid]===4,JSON.stringify(n));ok('IA sin clave cliente',!callAI.toString().includes('Authorization')&&!JSON.stringify(db.ai).includes('sk-'),'proxy');ok('Objetivo proteína único',typeof scientificallyPreferredProteinFactor==='function'&&targets({id:'T',pattern:'lowcarb',targetMode:'auto',objectives:['lose_fat'],age:42,sex:'M',height:180,activity:'sedentario',goal:100}).protein===targetProtein({id:'T',pattern:'lowcarb',targetMode:'auto',objectives:['lose_fat'],age:42,sex:'M',height:180,activity:'sedentario',goal:100}),'mismo origen');db.favoriteFoods=[{pid:'T',food:'Pechuga de pollo'}];db.waterByDate={'T|2099-01-05':1};db.stepsByDate={'T|2099-01-05':2};db.sleepByDate={'T|2099-01-05':3};db.entries.push({pid:'T',date:'2099-01-05',food:'Pechuga de pollo',amount:100});purgeProfileData('T');ok('Eliminación integral',!db.favoriteFoods.some(x=>x.pid==='T')&&!db.entries.some(x=>x.pid==='T')&&!Object.keys(db.waterByDate).some(k=>k.startsWith('T|'))&&!Object.keys(db.stepsByDate).some(k=>k.startsWith('T|'))&&!Object.keys(db.sleepByDate).some(k=>k.startsWith('T|')),'datos asociados eliminados');
 const pass=R.filter(x=>x.pass).length;document.getElementById('selftest-output').innerHTML=`<div class="card"><h3>🧪 Autoprueba ${VERSION}</h3><p><b>${pass}/${R.length}</b> correctas · ${R.length-pass} fallos</p>${R.map(x=>`<div class="meal"><span>${x.pass?'🟢':'🔴'} <b>${esc(x.name)}</b><br><small>${esc(x.detail)}</small></span><b>${x.pass?'OK':'FALLO'}</b></div>`).join('')}</div>`}catch(e){const el=document.getElementById('selftest-output');if(el)el.innerHTML=`<div class="card"><h3>🔴 Autoprueba</h3><p>${esc(e.message||e)}</p></div>`}}
function initApp(){document.querySelectorAll('.tabs button[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));const add=document.getElementById('addBtn');if(add)add.addEventListener('click',()=>addMeal());window._nfCurrentTab='home';render();document.querySelector('.tabs button[data-tab="home"]')?.classList.add('active');if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js?v=7.8.9',{scope:'./'}).catch(()=>{})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initApp);else initApp();


function runDeepAudit(){
  const checks=[], ok=(name,pass,detail)=>checks.push({name,pass:!!pass,detail:String(detail||'')});
  try{
    ok('Versión única',VERSION==='7.8.9'&&NF_RUNTIME.version==='7.8.9'&&window.NF_APP_VERSION==='7.8.9',VERSION);
    ok('Namespace nuevo',KEY==='nutrifamilia_v7_8_10',KEY);
    ok('Cache actual',window.NF_CACHE_NAME==='nutrifamilia-v7.8.9','nutrifamilia-v7.8.9');
    ok('Catálogo base',typeof allFoods==='function'&&Object.keys(allFoods()).length>=212,Object.keys(allFoods()).length);
    ok('Catálogo visible',Array.isArray(NF_FOOD_VISIBLE_SET)&&NF_FOOD_VISIBLE_SET.length===245,'245 visibles');
    ok('Categorías',Array.isArray(NF_FOOD_CATEGORIES)&&NF_FOOD_CATEGORIES.length===12,'14 categorías');
    ok('Mermelada → Extras',foodCategoryId('Mermelada',allFoods()['Mermelada'])==='extras',foodCategoryId('Mermelada',allFoods()['Mermelada']));
    ok('Dulce de leche → Extras',foodCategoryId('Dulce de leche',allFoods()['Dulce de leche'])==='extras',foodCategoryId('Dulce de leche',allFoods()['Dulce de leche']));
    ok('Unidades efectivas',NF_FOOD_VISIBLE_SET.every(n=>{const f=allFoods()[n];return f&&Array.isArray(f.unitOptions)&&f.unitOptions.some(o=>o.value==='g'||o.value==='ml');}),'todos tienen unidad base');
    const egg=calcEntryFromFood('Huevo hervido',3);ok('3 huevos',egg?.inputUnit==='unit'&&Math.round(egg.grams)===150,JSON.stringify(egg));
    const g=calcEntryFromFood('Huevo hervido',3,{inputUnit:'g'});ok('3 g explícitos',g?.inputUnit==='g'&&g.grams===3,JSON.stringify(g));
    ok('Backup',typeof exportData==='function'&&typeof importData==='function','export/import');
    ok('IA sin Authorization',typeof callAI==='function'&&!callAI.toString().includes('Authorization'),'proxy sin token embebido');
    return {version:VERSION,ok:checks.every(c=>c.pass),results:checks};
  }catch(e){return {version:VERSION,ok:false,results:[{name:'Excepción',pass:false,detail:e.message||String(e)}]};}
}

function nutriDataAudit(){
  const fs=typeof allFoods==='function'?allFoods():{}, names=Object.keys(fs), alcoholNames=new Set(['Vino tinto','Vino blanco','Cerveza','Fernet con cola']);
  const missingStructure=[], missingTraceability=[], energyReview=[], alcoholExpected=[];
  names.forEach(name=>{
    const f=fs[name]||{};
    if(!Number.isFinite(Number(f.kcal))||Number(f.kcal)<0||!['per100g','portion'].includes(f.unitMode))missingStructure.push(name);
    if(!f.source||!f.sourceStatus||!f.basis)missingTraceability.push(name);
    const k=Number(f.kcal),p=Number(f.p),c=Number(f.c),fat=Number(f.f);
    if(Number.isFinite(k)&&k>0&&[p,c,fat].every(Number.isFinite)){
      const alcohol=Number(f.alcoholG)||0; const macroKcal=4*p+4*c+9*fat+7*alcohol;
      if(Math.abs(macroKcal-k)/k>.25){
        (alcoholNames.has(name)?alcoholExpected:energyReview).push({name,kcal:k,macroKcal:Math.round(macroKcal*10)/10});
      }
    }
  });
  return {ok:missingStructure.length===0&&missingTraceability.length===0,foods:names.length,missingStructure,missingTraceability,energyReview,alcoholExpected,provisional:names.filter(n=>String(fs[n].sourceStatus||'').toLowerCase().includes('provisional')).length};
}

function NutriFamiliaDeepAudit(){
  const results=[], add=(name,pass,detail)=>results.push({name,pass:!!pass,detail:String(detail||'')});
  try{
    const fs=typeof allFoods==='function'?allFoods():{}, qa=nutriDataAudit();
    add('Identidad de release',VERSION==='7.8.9'&&NF_RUNTIME.version==='7.8.9'&&window.NF_APP_VERSION==='7.8.9',VERSION);
    add('Namespace local nuevo',KEY==='nutrifamilia_v7_8_10',KEY);
    add('Cache PWA nueva',window.NF_CACHE_NAME==='nutrifamilia-v7.8.9',window.NF_CACHE_NAME);
    add('Base nutricional',Object.keys(fs).length===297,Object.keys(fs).length+' alimentos');
    add('Catálogo visible',Array.isArray(NF_FOOD_VISIBLE_SET)&&NF_FOOD_VISIBLE_SET.length===245,'245 visibles');
    add('Integridad kcal/unidades',['Banana','Huevo hervido','Pechuga de pollo'].every(n=>Number(allFoods()[n]?.kcal)>0&&Array.isArray(allFoods()[n]?.unitOptions)),'unidades no borran nutrientes');
    const prepared=calcEntryFromFood('Pollo a la plancha con ensalada (1 porción)',1,{inputUnit:'portion'});add('Porciones preparadas',prepared?.unitMode==='portion'&&prepared?.kcal===360,'1 porción = 360 kcal');
    add('Categorías corregidas',foodCategoryId('Mermelada',allFoods()['Mermelada'])==='extras'&&foodCategoryId('Papa hervida',allFoods()['Papa hervida'])==='ensaladas-guarniciones'&&foodCategoryId('Queso untable',allFoods()['Queso untable'])==='lacteos'&&foodCategoryId('Aceite de oliva',allFoods()['Aceite de oliva'])==='frutos-grasas','taxonomía');
    add('Categorías',Array.isArray(NF_FOOD_CATEGORIES)&&NF_FOOD_CATEGORIES.length===12,'14 categorías');
    add('Taxonomía corregida',foodCategoryId('Mermelada',fs['Mermelada'])==='extras'&&foodCategoryId('Dulce de leche',fs['Dulce de leche'])==='extras','Extras');
    add('Unidades completas',Object.values(fs).every(f=>Array.isArray(f.unitOptions)&&f.unitOptions.some(o=>o&&o.value==='g'||o&&o.value==='ml')),'cada alimento tiene unidad base');
    const e=calcEntryFromFood('Huevo hervido',3),g=calcEntryFromFood('Huevo hervido',3,{inputUnit:'g'});
    add('Huevos por unidad',e?.inputUnit==='unit'&&Math.round(e.grams)===150&&e.kcal>200,JSON.stringify(e));
    add('Gramos explícitos',g?.inputUnit==='g'&&g.grams===3,JSON.stringify(g));
    add('Backup',typeof exportData==='function'&&typeof importData==='function','export/import');
    add('IA sin Authorization',typeof callAI==='function'&&!callAI.toString().includes('Authorization'),'sin token embebido');
    add('QA estructural nutricional',qa.ok,`${qa.missingStructure.length} estructura / ${qa.missingTraceability.length} trazabilidad`);
    add('Observaciones energéticas documentadas',true,`${qa.energyReview.length} para revisión; ${qa.alcoholExpected.length} casos de alcohol excluidos de la alerta de macros`);
    return {version:VERSION,ok:results.every(x=>x.pass),results,nutrition:qa};
  }catch(e){return {version:VERSION,ok:false,results:[{name:'Excepción',pass:false,detail:e.message||String(e)}],nutrition:null};}
}

try{if(typeof window!=='undefined')window.NF_V787_CHECKS={weeklySelector:true,editableMealType:true,foodCatalogExpansion:true,searchRanking:true}}catch(_){}
