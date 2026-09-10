function _nfMealTypes(){return ['Desayuno','Almuerzo','Merienda','Cena','Snack']}
/* foodLabel — nombre legible de alimento con kcal de referencia */
function foodLabel(name, data){
  if(!name) return '';
  if(!data) return name;
  const unit = data.unitMode==='portion' ? (data.unitLabel||'porción') : '100g';
  return name + ' (' + Math.round(data.kcal||0) + ' kcal/' + unit + ')';
}

function _nfFoodCategories(){return typeof foodCategories==='function'?foodCategories():[]}
function _nfFoodList(query='',category=''){return typeof searchFoods==='function'?searchFoods(query,category):Object.keys(allFoods()).filter(n=>!query||n.toLowerCase().includes(String(query).toLowerCase())).slice(0,80)}
function _nfFoodLabel(name){return `${foodIcon(name,allFoods()[name])} ${name}`}
function _nfResolveFood(name){const raw=String(name||'').trim();return (typeof resolveFoodSearch==='function'&&resolveFoodSearch(raw))||raw}
function createMealDraft(type){return {type:_nfMealTypes().includes(type)?type:'Snack',items:[]}}
function setMealDraftType(type){const d=window._nfMealDraft,t=String(type||'');if(!d||!_nfMealTypes().includes(t))return;d.type=t;(d.items||[]).forEach(x=>{x.type=t});renderMealComposer()}
function addMealDraftItem(draft,item){if(!draft||!item)return draft;draft.items.push({...item});return draft}
function removeMealDraftItem(draft,index){if(!draft||!Number.isInteger(index)||index<0||index>=draft.items.length)return draft;draft.items.splice(index,1);return draft}
function updateMealDraftItem(draft,index,patch){if(!draft||!Number.isInteger(index)||index<0||index>=draft.items.length)return draft;draft.items[index]={...draft.items[index],...(patch||{})};return draft}
function mealDraftTotals(draft){const keys=['kcal','p','c','f','fib','sugar','sat','sodium'];const out=Object.fromEntries(keys.map(k=>[k,0]));(draft?.items||[]).forEach(x=>keys.forEach(k=>{const v=Number(x[k]);if(Number.isFinite(v))out[k]+=v}));return out}
function groupMealEntries(entries){const out=Object.fromEntries(_nfMealTypes().map(t=>[t,[]]));(entries||[]).forEach(x=>{const t=_nfMealTypes().includes(x.type)?x.type:'Snack';out[t].push(x)});return out}
function _nfFmt(n){return Number.isFinite(Number(n))?Math.round(Number(n)):0}
function _nfDraftItemHtml(item,i){return `<div class="nf-meal-draft-item"><div><b>${esc(foodIcon(item.food,allFoods()[item.food]))} ${esc(item.food)}</b><br><small>${esc(item.amount)} ${esc(item.unit||item.inputUnit||'g')}</small></div><div class="nf-draft-item-right"><b>${_nfFmt(item.kcal)} kcal</b><div><button class="secondary small" type="button" onclick="editMealDraftItemUI(${i})">Editar</button><button class="secondary small" type="button" onclick="removeMealDraftItemUI(${i})">Eliminar</button></div></div></div>`}
function renderMealComposer(){
 const draft=window._nfMealDraft;if(!draft)return;
 const fs=allFoods(),p=getActiveProfile(),recent=recentFoods(p.id,6),favs=(db.favoriteFoods||[]).filter(x=>x.pid===p.id).map(x=>x.food).filter(n=>fs[n]),cats=_nfFoodCategories();
 const selected=window._selectedFoodName||'';
 const catHtml=cats.map(c=>`<button class="nf-food-category" type="button" data-category="${esc(c.id)}" onclick="setFoodCategory('${esc(c.id)}')">${esc(c.label)}</button>`).join('');
 const quickHtml=`${recent.length?`<div class="chip-section"><span class="chiptitle">🕒 Recientes</span><div class="chip-row">${recent.map(n=>`<button class="chip" type="button" onclick="pickFoodQuick('${encodeURIComponent(n)}')">${esc(n)}</button>`).join('')}</div></div>`:''}${favs.length?`<div class="chip-section"><span class="chiptitle">⭐ Favoritos</span><div class="chip-row">${favs.map(n=>`<button class="chip" type="button" onclick="pickFoodQuick('${encodeURIComponent(n)}')">${esc(n)}</button>`).join('')}</div></div>`:''}<button class="chip add-custom" type="button" onclick="newCustomFood()">＋ Agregar alimento personalizado</button>`;
 const list=draft.items.map(_nfDraftItemHtml).join('');
 const t=mealDraftTotals(draft);
 const composer=`<div class="meal-modal">
   <div class="nf-meal-composer-title"><b>🍽️ Registrar comida</b><span>${draft.items.length?`${draft.items.length} alimento${draft.items.length===1?'':'s'}`:'Todavía no agregaste alimentos'}</span></div>
   <label class="modal-label" for="nfMealType">Momento</label><select id="nfMealType" class="nf-meal-type-select" onchange="setMealDraftType(this.value)">${_nfMealTypes().map(t=>`<option value="${esc(t)}" ${t===draft.type?'selected':''}>${esc(t)}</option>`).join('')}</select>
   <label class="modal-label">¿Qué comiste?</label>
   <div class="search-wrap"><input id="foodSearch" type="search" placeholder="🔍 Buscar alimento..." autocomplete="off" oninput="filterFoodPicker()" ${selected?'readonly':''} value="${esc(selected)}"></div>
   <div id="searchResults" class="search-results"></div>
   <div id="selectedFood" class="selected-food ${selected?'':'hidden'}"><div id="selectedFoodName" class="selected-name">${esc(selected)}</div>
     <div class="food-form"><div class="unitrow"><div><label>Cantidad</label><input id="qty" type="number" min="0.25" step="1" placeholder="Ingresá la cantidad"></div><div><label>Unidad</label><select id="qtyUnit" onchange="updateMealUnitUI()"></select></div></div>
       <div class="modal-actions"><button class="secondary small" type="button" onclick="toggleFavoriteSelected()">⭐ Favorito</button><button class="btn-primary" type="button" onclick="addMealDraftItemUI()">＋ Agregar alimento</button></div>
     </div>
   </div>
   <div id="foodQuickSection">${quickHtml}</div>
   <details class="nf-category-explorer" id="foodCategoryNav"><summary>Explorar categorías</summary><div class="cat-grid">${catHtml}</div></details>
   ${draft.items.length?`<section class="nf-meal-draft"><div class="nf-draft-heading"><b>✓ Lo que ya comiste</b><span>${draft.items.length} alimento${draft.items.length===1?'':'s'}</span></div><div class="nf-meal-draft-list">${list}</div><button class="btn-primary nf-save-meal" type="button" onclick="saveMealDraft()">💾 Guardar ${esc(draft.type.toLowerCase())}</button></section>`:''}
   ${draft.items.length?`<div class="nf-meal-total"><div><b>Total del ${esc(draft.type.toLowerCase())}</b><strong>${_nfFmt(t.kcal)} kcal</strong></div><div class="nf-meal-total-macros"><span>Proteína <b>${_nfFmt(t.p)} g</b></span><span>Carbohidratos <b>${_nfFmt(t.c)} g</b></span><span>Grasas <b>${_nfFmt(t.f)} g</b></span><span>Fibra <b>${_nfFmt(t.fib)} g</b></span></div></div>`:''}
 </div>`;
 openModal({title:'🍽️ Registrar comida',body:composer});
 window._nfFoodCategory=window._nfFoodCategory||'';
 filterFoodPicker();
 if(selected)updateMealUnitUI(false);
}
function addMeal(preselect=''){
 const types=_nfMealTypes(),forcedType=types.includes(preselect)?preselect:'',foodPreselect=forcedType?'':preselect,p=getActiveProfile();if(!p)return;
 window._nfMealDraft=createMealDraft(forcedType||inferMealType());window._selectedFoodName='';window._nfFoodCategory='';renderMealComposer();if(foodPreselect&&allFoods()[foodPreselect])selectFood(foodPreselect);
}
function filterFoodPicker(){const q=document.getElementById('foodSearch')?.value||'',cat=window._nfFoodCategory||'',el=document.getElementById('searchResults'),quick=document.getElementById('foodQuickSection');if(!el)return;if(window._selectedFoodName){el.innerHTML='';el.classList.add('hidden');if(quick)quick.classList.add('hidden');return}const list=_nfFoodList(q,cat);if(!q&&!cat){el.innerHTML='';el.classList.add('hidden');if(quick)quick.classList.remove('hidden');if(window._nfFoodPreselect){const name=window._nfFoodPreselect;window._nfFoodPreselect='';if(allFoods()[name])selectFood(name)}return;}if(quick)quick.classList.add('hidden');el.classList.remove('hidden');if(!list.length){el.innerHTML=`<div class="no-results">No encontré ese alimento.<br><button class="chip add-custom" type="button" onclick="newCustomFood()">＋ Agregar alimento personalizado</button></div>`;return}let html='';let lastGroup='';let lastSub='';list.forEach(n=>{const f=allFoods()[n];if(cat==='carnes-proteinas'&&typeof foodProteinGroups==='function'){const g=(foodProteinGroups(n)[0]||'Otros');if(g!==lastGroup){html+=`<div class="nf-protein-group">${esc(g)}</div>`;lastGroup=g}}if(cat==='comidas-preparadas'){const sub=f?.subcategory==='postres'?'postres':'platos';if(sub!==lastSub){html+=`<div class="nf-protein-group nf-food-subcategory">${sub==='postres'?'🍨 Postres':'🍽️ Platos preparados'}</div>`;lastSub=sub}}html+=`<button class="food-result" type="button" onclick="selectFood('${encodeURIComponent(n)}')"><span class="food-result-name">${esc(foodIcon(n,f))} ${esc(n)}</span><span class="food-result-kcal">${Math.round(f?.kcal||0)} kcal</span></button>`});el.innerHTML=html}
function setFoodCategory(category){window._nfFoodCategory=String(category||'');document.querySelectorAll('.nf-food-category').forEach(b=>b.classList.toggle('active',b.dataset.category===window._nfFoodCategory));const i=document.getElementById('foodSearch');if(i)i.value='';window._selectedFoodName='';const sel=document.getElementById('selectedFood');if(sel)sel.classList.add('hidden');filterFoodPicker()}
function clearFoodSearch(){window._nfFoodCategory='';const i=document.getElementById('foodSearch');if(i)i.value='';window._selectedFoodName='';document.querySelectorAll('.nf-food-category').forEach(b=>b.classList.remove('active'));const sel=document.getElementById('selectedFood');if(sel)sel.classList.add('hidden');filterFoodPicker()}
function pickFoodQuick(encoded){const name=decodeURIComponent(encoded||'');if(!allFoods()[name])return;selectFood(name)}
function selectFood(value){const raw=decodeURIComponent(value||'');const name=(typeof resolveFoodSearch==='function'&&resolveFoodSearch(raw))||raw;const f=allFoods()[name];if(!f)return;window._selectedFoodName=name;window._nfMealUnitInitialized=false;renderMealComposer()}
function preferredMealUnit(f,current=''){return typeof preferredFoodUnit==='function'?preferredFoodUnit(f,current):(Array.isArray(f?.unitOptions)&&f.unitOptions.length?f.unitOptions[0].value:'g')}
function updateMealUnitUI(preserve=true){const f=allFoods()[window._selectedFoodName],u=document.getElementById('qtyUnit'),q=document.getElementById('qty');if(!f||!u||!q)return;const opts=typeof foodUnitOptions==='function'?foodUnitOptions(f):(Array.isArray(f.unitOptions)&&f.unitOptions.length?f.unitOptions:[{value:'g',label:'g',gramsPerUnit:1}]);const previous=u.dataset?.prevUnit||'';const old=preserve?u.value:'';u.innerHTML=opts.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('');u.value=preferredMealUnit(f,old);q.step=u.value==='g'||u.value==='ml'?'1':'0.25';q.min='0.25';if(u.value==='g'||u.value==='ml')q.value='';else if(!q.value||previous==='g'||previous==='ml')q.value='1';if(u.dataset)u.dataset.prevUnit=u.value}
function addMealDraftItemUI(){const draft=window._nfMealDraft,name=window._selectedFoodName,unit=document.getElementById('qtyUnit')?.value||'g',amount=Number(String(document.getElementById('qty')?.value||'').replace(',','.'));if(!draft||!name)return alert('Seleccioná un alimento.');if(!Number.isFinite(amount)||amount<=0)return alert('Ingresá una cantidad válida.');const p=getActiveProfile(),e=calcEntryFromFood(name,amount,{pid:p.id,date:window.journalDate||localDate(),type:draft.type,inputUnit:unit,estimate:false,confidence:1});if(!e)return alert('Cantidad, alimento o unidad inválidos.');addMealDraftItem(draft,e);window._selectedFoodName='';window._nfFoodCategory='';renderMealComposer()}
function removeMealDraftItemUI(i){removeMealDraftItem(window._nfMealDraft,Number(i));renderMealComposer()}
function _nfNormEditText(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function _nfEditFoodNames(query='',current=''){
 const fs=allFoods(),q=_nfNormEditText(query),cur=_nfNormEditText(current);
 const scored=Object.keys(fs).map(n=>{const x=_nfNormEditText(n),i=q?x.indexOf(q):0;let score=0;if(q){if(x===q)score=0;else if(x.startsWith(q))score=10;else if(x.split(/\s+/).some(w=>w.startsWith(q)))score=20;else if(i>=0)score=40;else score=100;}return {n,score,i:x.indexOf(q)} }).filter(x=>!q||x.score<100).sort((a,b)=>a.score-b.score||a.i-b.i||a.n.localeCompare(b.n,'es')).map(x=>x.n);
 if(!q&&current&&!scored.includes(current)&&fs[current])scored.unshift(current);
 return scored;
}
function _nfEditFoodResults(query,current=''){
 const names=_nfEditFoodNames(query,current).slice(0,12);
 return names.map(n=>`<button type="button" class="food-result nf-edit-food-result" onclick="chooseEditFood('${encodeURIComponent(n)}')"><span class="food-result-name">${esc(foodIcon(n,allFoods()[n]))} ${esc(n)}</span><span class="food-result-kcal">${Math.round(allFoods()[n]?.kcal||0)} kcal</span></button>`).join('');
}
function filterEditFoodInput(id){
 const input=document.getElementById(id),results=document.getElementById(id+'Results');if(!input||!results)return;
 const current=input.dataset.selectedFood||'';const q=input.value||'';const names=_nfEditFoodNames(q,current);
 if(q&&names.length){results.innerHTML=_nfEditFoodResults(q,current);results.classList.remove('hidden')}else{results.innerHTML='';results.classList.add('hidden')}
 // The original food is restored only while the field is protected. Once the user
 // explicitly enters edit mode, an empty value is a valid intermediate search state.
 if(!q&&!input.dataset.editing&&current)input.value=current;
}
function enableEditFoodField(id){
 const input=document.getElementById(id);if(!input)return;
 input.dataset.editing='true';input.readOnly=false;input.focus();input.select();
 const btn=document.getElementById(id+'EditBtn');if(btn){btn.textContent='Editar';btn.disabled=true;}
}
function chooseEditFood(encoded){
 const name=decodeURIComponent(encoded||''),f=allFoods()[name];if(!f)return;
 const input=document.getElementById('efood')||document.getElementById('mdfood');
 if(!input)return;
 const previousSelected=input.dataset.selectedFood||'';
 const changing=name!==previousSelected;
 input.value=name;input.dataset.selectedFood=name;input.dataset.editing='';input.readOnly=true;
 if(changing)input.dataset.currentUnit='';
 const btn=document.getElementById(input.id+'EditBtn');if(btn){btn.textContent='Editar';btn.disabled=false;}
 const results=document.getElementById(input.id+'Results');if(results){results.innerHTML='';results.classList.add('hidden')}
 if(input.id==='efood')updateEditUnitUI(true,null, input.dataset.currentUnit||'');
 else updateMealDraftEditUnitUI(true,null,input.dataset.currentUnit||'');
}
function filterEditFoodPicker(){const input=document.getElementById('mdfood')||document.getElementById('efood');if(input)filterEditFoodInput(input.id)}
function selectEditFood(){const s=document.getElementById('efood');if(s){s.dataset.selectedFood=s.value;updateEditUnitUI(true,null,s.dataset.currentUnit||'')}}
function selectMealDraftEditFood(){const s=document.getElementById('mdfood');if(s){s.dataset.selectedFood=s.value;updateMealDraftEditUnitUI(true,null,s.dataset.currentUnit||'')}}
function _nfEditFoodField(id,current){
 return `<div class="nf-edit-food-field"><label>Alimento</label><div class="nf-edit-food-row"><input id="${id}" type="search" value="${esc(current)}" data-selected-food="${esc(current)}" data-editing="" readonly autocomplete="off" placeholder="🔍 Escribí 2 o 3 letras para buscar..." oninput="filterEditFoodInput('${id}')"><button id="${id}EditBtn" type="button" class="secondary small nf-edit-food-btn" onclick="enableEditFoodField('${id}')">Editar</button></div><div id="${id}Results" class="search-results hidden"></div></div>`;
}
function updateMealDraftEditUnitUI(preserve=true,initial=null,initialUnit=null){const s=document.getElementById('mdfood'),q=document.getElementById('mdqty'),u=document.getElementById('mdunit');if(!s||!q||!u)return;const f=allFoods()[s.value];if(!f)return;const opts=typeof foodUnitOptions==='function'?foodUnitOptions(f):(Array.isArray(f.unitOptions)&&f.unitOptions.length?f.unitOptions:[{value:'g',label:'g',gramsPerUnit:1}]);u.innerHTML=opts.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('');const wanted=initialUnit||s.dataset.currentUnit||preferredMealUnit(f,'');u.value=opts.some(o=>o.value===wanted)?wanted:preferredMealUnit(f,'');s.dataset.selectedFood=s.value;s.dataset.currentUnit=u.value;if(!preserve)q.value='1';else if(initial!=null)q.value=initial}
function editMealDraftItemUI(i){const d=window._nfMealDraft,item=d?.items?.[Number(i)];if(!item)return;const current=item.food;openModal({title:'Editar alimento',body:`${_nfEditFoodField('mdfood',current)}<div class="unitrow"><div><label>Cantidad</label><input id="mdqty" type="number" min="0.25" step="1" value="${esc(item.amount)}"></div><div><label>Unidad</label><select id="mdunit"></select></div></div><button type="button" onclick="saveMealDraftItemEdit(${Number(i)})">Guardar cambios</button>`});const s=document.getElementById('mdfood');if(s)s.dataset.currentUnit=item.inputUnit||item.unit||'g';updateMealDraftEditUnitUI(true,item.amount,item.inputUnit||item.unit||'g')}
function saveMealDraftItemEdit(i){const d=window._nfMealDraft;if(!d)return;const rawName=document.getElementById('mdfood')?.value,name=_nfResolveFood(rawName),qty=Number(String(document.getElementById('mdqty')?.value||'').replace(',','.')),unit=document.getElementById('mdunit')?.value||'g';if(!name||!allFoods()[name]||!Number.isFinite(qty)||qty<=0)return alert('Revisá alimento, cantidad y unidad.');const p=getActiveProfile(),e=calcEntryFromFood(name,qty,{pid:p.id,date:window.journalDate||localDate(),type:d.type,inputUnit:unit,estimate:false,confidence:1,id:d.items[i]?.id});if(!e)return alert('Revisá alimento, cantidad y unidad.');updateMealDraftItem(d,i,e);closeModal();window._selectedFoodName='';renderMealComposer()}
function updateEditUnitUI(preserve=false,initial=null,initialUnit=null){const s=document.getElementById('efood'),l=document.getElementById('eqtyLabel'),q=document.getElementById('eqty'),u=document.getElementById('eqtyUnit');if(!s||!l||!q||!u)return;const f=allFoods()[s.value];if(!f){u.innerHTML='';return}const opts=typeof foodUnitOptions==='function'?foodUnitOptions(f):(Array.isArray(f.unitOptions)&&f.unitOptions.length?f.unitOptions:[{value:'g',label:'g',gramsPerUnit:1}]);u.innerHTML=opts.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('');const wanted=initialUnit||s.dataset.currentUnit||preferredMealUnit(f,'');u.value=opts.some(o=>o.value===wanted)?wanted:preferredMealUnit(f,'');s.dataset.selectedFood=s.value;s.dataset.currentUnit=u.value;l.textContent='Cantidad';q.step=u.value==='g'||u.value==='ml'?'1':'0.25';q.min='0.25';if(!preserve)q.value=f.unitMode==='portion'?'1':'1';else if(initial!=null)q.value=initial}
function editEntry(i){const p=getActiveProfile(),date=window.journalDate||localDate(),arr=entriesFor(date,p.id),x=arr[i];if(!x)return;const amount=Number.isFinite(Number(x.amount))?x.amount:(Number.isFinite(Number(x.qty))?x.qty:(x.inputUnit==='g'&&Number.isFinite(Number(x.grams))?x.grams:'')),unit=x.inputUnit||x.unit||'g';openModal({title:'Editar comida',body:`${_nfEditFoodField('efood',x.food)}<div class="unitrow"><div><label id="eqtyLabel">Cantidad</label><input id="eqty" type="number" value="${amount}" step="1" min="0.25"></div><div><label>Unidad</label><select id="eqtyUnit"></select></div></div><label>Momento</label><select id="etype">${_nfMealTypes().map(n=>`<option ${n===x.type?'selected':''}>${n}</option>`).join('')}</select><button onclick="saveEditEntry(${i})">Guardar cambios</button>`});const s=document.getElementById('efood');if(s)s.dataset.currentUnit=unit;updateEditUnitUI(true,amount,unit)}
function saveEditEntry(i){const p=getActiveProfile(),date=window.journalDate||localDate(),arr=entriesFor(date,p.id),old=arr[i],idx=db.entries.indexOf(old);if(idx<0)return;const rawName=document.getElementById('efood')?.value,name=_nfResolveFood(rawName),qty=Number(String(document.getElementById('eqty')?.value||'').replace(',','.')),unit=document.getElementById('eqtyUnit')?.value||'g';if(!name||!allFoods()[name]||!Number.isFinite(qty)||qty<=0)return alert('Revisá alimento y cantidad.');const entry=calcEntryFromFood(name,qty,{pid:p.id,date,type:document.getElementById('etype').value,id:db.entries[idx].id,inputUnit:unit});if(!entry)return alert('No pude recalcular ese alimento o unidad.');const prev=db.entries[idx];db.entries[idx]=entry;if(!save()){db.entries[idx]=prev;return}closeModal();render()}
function saveMealDraft(){const draft=window._nfMealDraft;if(!draft||!draft.items.length)return alert('Agregá al menos un alimento.');const start=db.entries.length,items=draft.items.map(e=>({...e,id:`e_${Date.now()}_${Math.random().toString(36).slice(2,8)}`}));db.entries.push(...items);if(!save()){db.entries.splice(start,items.length);return}window._nfMealDraft=null;window._selectedFoodName='';closeModal();render()}
function saveMeal(){addMealDraftItemUI()}

function deleteEntry(i){const p=getActiveProfile(),date=window.journalDate||localDate(),arr=entriesFor(date,p.id),old=arr[i],idx=db.entries.indexOf(old);if(idx<0)return;if(!confirm(`¿Eliminar ${old.food} de ${date}?`))return;const removed=db.entries.splice(idx,1)[0];if(!save()){db.entries.splice(idx,0,removed);return}render()}
