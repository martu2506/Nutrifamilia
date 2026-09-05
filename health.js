function setWaterToday(value){const p=getActiveProfile();if(!p)return;const n=Number(String(value??'').replace(',','.'));if(!Number.isFinite(n)||n<0||n>10000)return alert('El agua debe estar entre 0 y 10.000 ml.');const key=`${p.id}|${localDate()}`,old=db.waterByDate[key]||0;db.waterByDate[key]=Math.round(n);if(!save()){db.waterByDate[key]=old;return}render()}
function addWater(delta=250){const p=getActiveProfile();if(!p)return;const key=`${p.id}|${localDate()}`,old=db.waterByDate[key]||0;db.waterByDate[key]=Math.min(10000,Math.max(0,old+Number(delta||0)));if(!save()){db.waterByDate[key]=old;return}render()}
function copyYesterday(){const cur=window.journalDate||localDate(),d=new Date(cur+'T12:00:00');d.setDate(d.getDate()-1);const src=localDate(d),p=getActiveProfile();if(!p)return;const arr=entriesFor(src,p.id);if(!arr.length)return alert('No hay comidas registradas el día anterior.');const copies=arr.map(x=>({...x,id:Date.now().toString()+Math.random().toString(36).slice(2,6),date:cur,pid:p.id}));db.entries.push(...copies);if(!save()){db.entries.splice(db.entries.length-copies.length,copies.length);return}render()}
function dayQuality(p,date=localDate()){
 const t=totals(date,p.id),tg=targets(p);
 let score=50;
 if(t.kcal>0){if(t.kcal<=tg.cal*1.05)score+=8;if(t.kcal<tg.cal*.75)score-=8}
 if(t.p>= targetProtein(p)*.8)score+=10;
 if(t.fib>=tg.fiber)score+=8;
 if(t.sodium<=tg.sodium)score+=4;
 if(t.sat<=tg.sat)score+=4;
 if(t.c<=tg.carbs)score+=6;
 if(plantDiversityToday(p.id,date)>=3)score+=6;
 
 if(p.pattern==='mediterranean'||p.pattern==='medlowcarb'||p.pattern==='longevity'){if(t.f>=1)score+=3}
 if(t.ultraCount>0)score-=Math.min(10,t.ultraCount*2);
 return Math.max(0,Math.min(100,Math.round(score)));
}
function patternCompatible(name,p){
 const f=allFoods()[name]; if(!f)return true;
 if(p.pattern==='vegetarian' && /carne|pollo|cerdo|atún|sardina|merluza|salmón|hamburguesa/i.test(name)) return false;
 if(p.pattern==='vegan' && /carne|pollo|cerdo|atún|sardina|merluza|salmón|huevo|queso|yogur|leche|ricota|muzzarella|manteca/i.test(name)) return false;
 if((p.pattern==='lowcarb'||p.pattern==='verylowcarb'||p.pattern==='medlowcarb') && f.c>25) return false;
 if(p.allergies && p.allergies.some(a=>a && name.toLowerCase().includes(a.toLowerCase()))) return false;
 if(p.dislikes && p.dislikes.some(a=>a && name.toLowerCase().includes(a.toLowerCase()))) return false;
 return true;
}
function plantDiversity(pid){
 let set=new Set();
 db.entries.filter(x=>x.pid===pid&&days(7).includes(x.date)).forEach(x=>{if(x.plantKey)set.add(x.plantKey);});
 return set.size;
}
function plantDiversityToday(pid,date=localDate()){let set=new Set();db.entries.filter(x=>x.pid===pid&&x.date===date).forEach(x=>{if(x.plantGroupId)set.add(x.plantGroupId);else if(Array.isArray(x.plantKeys))x.plantKeys.forEach(k=>set.add(k));else if(x.plantKey)set.add(x.plantKey)});return set.size}
function nutritionScore(p,date=localDate()){
 const t=totals(date,p.id),tg=targets(p);
 if(!t||t.kcal<=0)return {score:0,components:{}};
 const ratio=(v,target)=>target?Math.max(0,Math.min(1,v/target)):0;
 const upper=(v,target)=>target?Math.max(0,Math.min(1,1-Math.max(0,v-target)/target)):1;
 const calBand=t.kcal>0?(t.kcal>=tg.cal*.80&&t.kcal<=tg.cal*1.10?1:(t.kcal>=tg.cal*.65&&t.kcal<=tg.cal*1.20?.65:.35)):.0;
 const fruitVeg=t.veg+t.fruit;const components={calorias:calBand,proteina:ratio(t.p,targetProtein(p)),fibra:ratio(t.fib,tg.fiber),verduras:ratio(fruitVeg,tg.veg),sodio:upper(t.sodium,tg.sodium),saturadas:upper(t.sat,tg.sat)};
 const score=Math.round(100*(.16*components.calorias+.20*components.proteina+.20*components.fibra+.20*components.verduras+.13*components.sodio+.11*components.saturadas));
 return {score:Math.max(0,Math.min(100,score)),components};
}
function smartScoreLabel(s){return s>=80?'Excelente':s>=65?'Bien encaminado':s>=50?'A mejorar':'Necesita atención'}


function healthConnectAvailable(){return !!window.NutriNative&&window.NutriNative.healthConnectAvailable()}
function connectHealth(){if(!healthConnectAvailable()){alert('Health Connect no está disponible o todavía no fue inicializado en este teléfono.');return}window.NutriNative.requestHealthConnect()}
function syncHealth(){if(!healthConnectAvailable()){alert('Health Connect no está disponible.');return}window.NutriNative.syncHealthConnect()}
window.onHealthData=function(d){if(d.error){alert(d.error);return}let p=getActiveProfile();if(d.steps!=null)db.stepsByDate[`${p.id}|${localDate()}`]=Math.max(0,Math.min(50000,Number(d.steps)||0));if(Number(d.weight)>=30&&Number(d.weight)<=300){let ws=weights(p.id);let today=ws.find(x=>x.date===localDate());if(!today)db.weights.push({pid:p.id,date:localDate(),kg:d.weight,source:'Health Connect'})}if(d.sleepHours>0){db.sleepByDate[`${p.id}|${localDate()}`]=d.sleepHours}db.healthSync=db.healthSync||{};const _hdate=localDate();db.healthSync[p.id]=db.healthSync[p.id]||{};db.healthSync[p.id][_hdate]={date:_hdate,activeCalories:d.activeCalories||0,heartRateAvg:d.heartRateAvg||0};save();render();alert('Health Connect sincronizado.');}
