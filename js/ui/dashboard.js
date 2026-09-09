/* NutriFamilia V7.8.1 — Dashboard único, estable y alineado con la captura de referencia. */
(function(){
  'use strict';
  const escLocal=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const clamp=(v,mn=0,mx=100)=>Math.max(mn,Math.min(mx,num(v)));
  const mealTypes=['Desayuno','Almuerzo','Merienda','Cena','Snack'];
  const plans={balanced:'Equilibrado',lowcarb:'Low Carb',verylowcarb:'Very Low Carb',ketohighprotein:'Keto · Alta proteína',highprotein:'Alta proteína',mediterranean:'Mediterránea',medlowcarb:'Mediterránea Low Carb',dash:'DASH',vegetarian:'Vegetariano',vegan:'Vegano',longevity:'Longevidad',calorie:'Control calórico'};

  const SVG={
    edit:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    plan:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18M8 13h3M8 17h6"/></svg>`,
    steps:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13" cy="4" r="2"/><path d="m11 9 2-2 3 2m-5 0-2 4 3 2 1 5m1-7 3 2 2 4M9 13l-3 4"/></svg>`,
    water:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11Z"/></svg>`,
    clock:`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
    food:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v18M9 3v8M3 3v8M6 11V3M14 3v18M14 3c3 0 4 2 4 5s-1 5-4 5"/></svg>`
  };

  /* Íconos de comida con colores fijos — funcionan en cualquier dispositivo */
  const MEAL_SVG = {
    Desayuno: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="#F4A800"/><line x1="12" y1="2" x2="12" y2="5" stroke="#F4A800" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="19" x2="12" y2="22" stroke="#F4A800" stroke-width="2" stroke-linecap="round"/><line x1="2" y1="12" x2="5" y2="12" stroke="#F4A800" stroke-width="2" stroke-linecap="round"/><line x1="19" y1="12" x2="22" y2="12" stroke="#F4A800" stroke-width="2" stroke-linecap="round"/><line x1="4.9" y1="4.9" x2="6.7" y2="6.7" stroke="#F4A800" stroke-width="2" stroke-linecap="round"/><line x1="17.3" y1="17.3" x2="19.1" y2="19.1" stroke="#F4A800" stroke-width="2" stroke-linecap="round"/><line x1="17.3" y1="6.7" x2="19.1" y2="4.9" stroke="#F4A800" stroke-width="2" stroke-linecap="round"/><line x1="4.9" y1="19.1" x2="6.7" y2="17.3" stroke="#F4A800" stroke-width="2" stroke-linecap="round"/></svg>`,
    Almuerzo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3v18M9 3v8M3 3v8M6 11V3M14 3v18M14 3c3 0 4 2 4 5s-1 5-4 5" stroke="#2E8B57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    Merienda: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2C8 2 5 6 5 10c0 3 1.5 5.5 4 7v3h6v-3c2.5-1.5 4-4 4-7 0-4-3-8-7-8z" fill="#E74C3C" opacity="0.8"/><path d="M9 19h6" stroke="#C0392B" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    Cena:     `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#2C3E7A" stroke="#1a2550" stroke-width="1"/><circle cx="15" cy="9" r="1.5" fill="#F4D03F"/><circle cx="18" cy="13" r="1" fill="#F4D03F"/><circle cx="13" cy="14" r="1" fill="#F4D03F"/></svg>`,
    Snack:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#F39C12" stroke="#D68910" stroke-width="1"/></svg>`,
  };
  function mealIcon(type){ return MEAL_SVG[type] || MEAL_SVG.Snack; }

  function dateLabel(){return new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).replace(/^./,c=>c.toUpperCase());}
  function currentHealth(p,date){const hs=db.healthSync?.[p.id]; return hs?.[date]||null;}
  function stepKcal(steps,p){const kg=Math.max(40,Math.min(250,num(lastWeight(p.id)||p.weight)||70));return Math.round(Math.max(0,num(steps))*kg*0.04/70);}

  function calorieGauge(value,target){
    const v=num(value), t=Math.max(1,num(target)), ratio=v/t, p=clamp(ratio*100), excess=Math.max(0,v-t);
    const ARC=251.2, offset=(ARC*(1-Math.min(1,ratio))).toFixed(1);
    const angle=180-180*Math.min(1,ratio), rad=angle*Math.PI/180;
    const nx=(100+62*Math.cos(rad)).toFixed(1), ny=(100-62*Math.sin(rad)).toFixed(1);
    const status=v>t?`<span class="nf-gauge-status over">Exceso: +${Math.round(excess)} kcal</span>`:`<span class="nf-gauge-status">Restan ${Math.max(0,Math.round(t-v))} kcal</span>`;
    const pctLabel=v>t?`100% · +${Math.round(excess)}`:`${Math.round(p)}%`;
    return `<div class="nf-cal-gauge" role="img" aria-label="Calorías: ${Math.round(v)} de ${Math.round(t)} kcal">
      <svg viewBox="0 0 200 130" aria-hidden="true">
        <path class="nf-gauge-track" d="M20 100 A80 80 0 0 1 180 100"/>
        <path class="nf-gauge-progress${v>t?' over':''}" d="M20 100 A80 80 0 0 1 180 100" stroke-dasharray="${ARC}" stroke-dashoffset="${offset}"/>
        <path class="nf-gauge-ticks" d="M20 100l-3 2M49 42l-3-3M100 20v-5M151 42l3-3M180 100l3 2" fill="none"/>
        <line x1="100" y1="100" x2="${nx}" y2="${ny}" class="nf-needle-line"/>
        <circle cx="100" cy="100" r="5" class="nf-needle-dot"/>
      </svg>
      <div class="nf-gauge-center"><strong>${Math.round(v)}</strong><span>/ ${Math.round(t)} kcal</span><small>${pctLabel}</small></div>
      ${status}
    </div>`;
  }

  function macroRing(label,value,target,unit,color){
    const v=num(value), t=Math.max(.0001,num(target)), ratio=v/t, pct=clamp(ratio*100), over=v>t;
    return `<div class="nf-macro" aria-label="${escLocal(label)}: ${Math.round(v)} de ${Math.round(t)} ${escLocal(unit)}">
      <div class="nf-macro-ring${over?' is-over':''}" style="--fill:${Math.round(pct)}%;--clr:${color}">
        <div class="nf-macro-ring-inner"><strong>${Math.round(v)}</strong><span>${escLocal(unit)}</span></div>
      </div>
      <div class="nf-macro-label">${escLocal(label)}</div>
      <div class="nf-macro-target">de ${Math.round(t)} ${escLocal(unit)}</div>
      ${over?`<div class="nf-macro-over">+${Math.round(v-t)} ${escLocal(unit)}</div>`:''}
    </div>`;
  }

  function progressBar(label,value,target,unit,icon=''){
    const v=Math.max(0,num(value)), t=Math.max(.0001,num(target)), pct=clamp(v/t*100);
    const cls=pct>=100?'ok':pct>0?'mid':'low';
    return `<div class="nf-prog-row"><div class="nf-prog-labels"><span class="nf-prog-icon-label">${icon}<b>${escLocal(label)}</b></span><span>${Math.round(v).toLocaleString('es-AR')} <small>/ ${Math.round(t).toLocaleString('es-AR')} ${escLocal(unit)}</small></span></div><div class="nf-prog-bar"><div class="nf-prog-fill ${cls}" style="width:${Math.min(100,pct)}%"></div></div></div>`;
  }

  function mealTypeBlock(type,arr){
    const xs=arr.filter(x=>x.type===type), kcalType=xs.reduce((a,x)=>a+num(x.kcal),0);
    const items=xs.slice(0,4).map(x=>{const idx=arr.indexOf(x);return `<div class="nf-food-row"><div class="nf-food-info"><span>${escLocal(x.food)}</span><small>${escLocal(String(x.amount??x.qty??x.grams??''))} ${escLocal(x.unit||'g')} · ${Math.round(num(x.kcal))} kcal</small></div><div class="nf-food-btns"><button class="nf-icon-btn" type="button" onclick="editEntry(${idx})" aria-label="Editar">${SVG.edit}</button><button class="nf-icon-btn danger" type="button" onclick="deleteEntry(${idx})" aria-label="Eliminar">×</button></div></div>`;}).join('');
    return `<div class="nf-meal-block"><div class="nf-meal-head"><div class="nf-meal-title"><span class="nf-meal-icon" aria-hidden="true">${mealIcon(type)}</span><span class="nf-meal-name">${escLocal(type)}</span>${xs.length?`<small class="nf-meal-kcal">${Math.round(kcalType)} kcal</small>`:''}</div><button class="nf-meal-add" type="button" onclick="addMeal('${escLocal(type)}')" aria-label="Agregar a ${escLocal(type)}">+</button></div>${xs.length ? items + (xs.length>4 ? `<small class="nf-food-extra">+${xs.length-4} más en Comidas</small>` : '') : '<div class="nf-food-empty">Sin registros aún</div>'}</div>`;
  }

  window.renderHome=function(){
    const el=document.getElementById('home'); if(!el)return;
    const p=getActiveProfile();
    if(!p){el.innerHTML=`<section class="nf-home nf-welcome-screen"><div class="nf-welcome-icon">🥗</div><h2>Bienvenido a NutriFamilia</h2><p>Creá tu perfil para empezar.</p><button type="button" onclick="newProfile()">+ Crear perfil</button></section>`;return;}
    const date=localDate(), t=totals(date,p.id), tg=targets(p), steps=num(db.stepsByDate?.[`${p.id}|${date}`]), water=num(db.waterByDate?.[`${p.id}|${date}`]), arr=entriesFor(date,p.id), health=currentHealth(p,date), activeCal=num(health?.activeCalories), fiberTarget=Math.max(25,num(tg.fiber)||25), waterTarget=num(tg.water)||2000;
    const planName=plans[p.pattern]||'Equilibrado';
    el.innerHTML=`<section class="nf-home" aria-label="Panel principal">
      <div class="nf-topbar"><div class="nf-topbar-title">NUTRIFAMILIA</div><div class="nf-topbar-date">${escLocal(dateLabel())} · ${new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}</div></div>
      <div class="nf-section"><div class="nf-kicker">CALORÍAS DEL DÍA</div>${calorieGauge(t.kcal,tg.cal)}</div>
      <div class="nf-macros-grid" aria-label="Macronutrientes">
        ${macroRing('Proteína',t.p,tg.protein,'g','#6C5FC7')}
        ${macroRing('Fibra',t.fib,fiberTarget,'g','#2E8B3A')}
        ${macroRing('Hidratos',t.c,tg.carbs,'g','#1A8C76')}
        ${macroRing('Grasas',t.f,tg.fat,'g','#E8650A')}
      </div>
      <div class="nf-activity-card"><div class="nf-kicker">ACTIVIDAD Y AGUA</div>
        ${progressBar('Pasos',steps,9700,'pasos',SVG.steps)}
        <div class="nf-steps-kcal">≈ ${stepKcal(steps,p)} kcal de gasto estimado</div>
        <div class="nf-water-btns"><button type="button" class="nf-pill-btn" onclick="addStepsDialog()">✎ Editar pasos</button></div>
        ${progressBar('Agua',water,waterTarget,'ml',SVG.water)}
        <div class="nf-water-btns"><button type="button" class="nf-pill-btn" onclick="addWater(250)">+250 ml</button><button type="button" class="nf-pill-btn secondary" onclick="setWaterDialog()">Editar</button></div>
        ${activeCal?`<div class="nf-steps-kcal">Health Connect: ${Math.round(activeCal).toLocaleString('es-AR')} kcal activas</div>`:''}
      </div>
      <div class="nf-plan-card"><div class="nf-kicker">PLAN NUTRICIONAL</div><div class="nf-plan-row"><div class="nf-plan-name">${SVG.plan}<strong>${escLocal(planName)}</strong></div><button type="button" class="nf-edit-btn" onclick="showTab('profile')">${SVG.edit} Editar</button></div></div>
      <div class="nf-meals-section"><div class="nf-kicker">REGISTRO DEL DÍA</div>${mealTypes.map(type=>mealTypeBlock(type,arr)).join('')}<button type="button" class="nf-more-btn" onclick="showTab('journal')">Ver todas las comidas →</button></div>
    </section>`;
  };

  window.addStepsDialog=function(){
    const p=getActiveProfile();if(!p)return;
    const key=`${p.id}|${localDate()}`,cur=num(db.stepsByDate?.[key]);
    const v=prompt('Pasos del día:',cur);
    if(v===null)return;
    if(v.trim()===''||!/^\d+(?:[.,]\d+)?$/.test(v.trim())){alert('Ingresá un número de pasos válido.');return;}
    const n=Math.max(0,Math.min(50000,Math.round(Number(v.replace(',','.')))));
    db.stepsByDate=db.stepsByDate||{}; const old=db.stepsByDate[key]; db.stepsByDate[key]=n;
    if(!save()){if(old===undefined)delete db.stepsByDate[key];else db.stepsByDate[key]=old;return;}
    render();
  };

  window.dashboardGaugeMath={clamp};
  setInterval(()=>{const h=document.getElementById('home');if(h&&!h.classList.contains('hidden')&&typeof getActiveProfile==='function'&&getActiveProfile())window.renderHome();},60000);
})();
