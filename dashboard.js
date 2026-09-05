/* NutriFamilia V7.2.0 — Dashboard final unificado */
(function(){
  const escLocal=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
  const ratio=(v,t)=>{const n=Number(v),d=Number(t);return Number.isFinite(n)&&Number.isFinite(d)&&d>0?Math.max(0,n/d):0};
  const pct=(v,t)=>Math.round(ratio(v,t)*100);
  const plans={balanced:'Equilibrado',lowcarb:'Low Carb',verylowcarb:'Very Low Carb',ketohighprotein:'Keto · Alta proteína',highprotein:'Alta proteína',mediterranean:'Mediterránea',medlowcarb:'Mediterránea Low Carb',dash:'DASH',vegetarian:'Vegetariano',vegan:'Vegano',longevity:'Longevidad',calorie:'Control calórico'};
  const icon=(name)=>{
    const s='width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
    const p={plan:`<path ${s} d="M4 5h16M6 4v4m12-4v4M5 9h14v10H5zM8 13h3m-3 3h6"/>`,walk:`<circle ${s} cx="13" cy="4" r="2"/><path ${s} d="m11 9 2-2 3 2m-5 0-2 4 3 2 1 5m1-7 3 2 2 4M9 13l-3 4"/>`,water:`<path ${s} d="M12 3s6 6.3 6 11a6 6 0 0 1-12 0c0-4.7 6-11 6-11Z"/>`,food:`<path ${s} d="M6 3v8m2-8v8m-4-8v8m2 0v10M14 3v18m0-18c3 0 4 2 4 5s-1 5-4 5"/>`,clock:`<circle ${s} cx="12" cy="12" r="9"/><path ${s} d="M12 7v5l3 2"/>`,cal:`<path ${s} d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h4"/>`,edit:`<path ${s} d="m4 20 4-.8L19 8l-3-3L5 16zM14 6l3 3"/>`};return `<span class="nf-icon">${p[name]||''}</span>`;
  };
  function ring(label,value,target,unit){
    const p=pct(value,target), over=Math.max(0,p-100), r=42, c=2*Math.PI*r, dash=(c*clamp(p)/100).toFixed(2);
    return `<div class="nf-macro">
      <div class="nf-ring ${over>0?'is-over':''}" style="--dash:${dash}px;--circ:${c.toFixed(2)}px" aria-label="${escLocal(label)}: ${Math.round(value)} de ${Math.round(target)} ${unit}">
        <svg viewBox="0 0 108 108"><circle class="ring-track" cx="54" cy="54" r="42"></circle><circle class="ring-fill" cx="54" cy="54" r="42"></circle></svg>
        <div class="ring-center"><strong>${Math.round(value)}</strong><span>${unit}</span></div>
      </div>
      <div class="nf-macro-name">${escLocal(label)}</div>
      <div class="nf-macro-target">${p}%${over>0?` · +${over}%`:''}</div>
    </div>`;
  }
  function gaugeSVG(value,target){
    const p=clamp(pct(value,target)), angle=-90+(p/100)*180;
    const arm=76, rad=angle*Math.PI/180;
    const x=100+arm*Math.cos(rad), y=100+arm*Math.sin(rad);
    return `<div class="nf-cal-gauge" style="--needle-angle:${angle}deg"><svg viewBox="0 0 200 120" role="img" aria-label="Calorías: ${Math.round(value)} de ${Math.round(target)} kcal"><path class="gauge-track" d="M18 100 A82 82 0 0 1 182 100"/><path class="gauge-fill" d="M18 100 A82 82 0 0 1 182 100" stroke-dasharray="257.61" stroke-dashoffset="${(257.61*(1-p/100)).toFixed(2)}"/><g class="gauge-needle"><line x1="100" y1="100" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><circle cx="100" cy="100" r="5"/></g></svg><div class="gauge-label">${p}%</div></div>`;
  }
  window.renderHome=function renderHome(){
    const el=document.getElementById('home'); if(!el)return;
    const p=getActiveProfile(); if(!p){el.innerHTML='<div class="home-empty"><h2>Crear perfil</h2><p>Necesitás un perfil para comenzar.</p><button onclick="newProfile()">Crear perfil</button></div>';return;}
    const date=localDate(), now=new Date(), time=now.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
    const dateLabel=(()=>{const d=new Date(); return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();})();
    const t=totals(date,p.id), tg=targets(p), w=lastWeight(p.id), goal=p.goal||null;
    const water=db.waterByDate?.[`${p.id}|${date}`]||0, steps=Number(db.stepsByDate?.[`${p.id}|${date}`]||0);
    const activeCal=Number(db.healthSync?.[p.id]?.activeCalories||0);
    const estStepKcal=steps>0?Math.round(steps*(0.0005*(Number(p.weight||w||70)))):0;
    const plan=plans[p.pattern]||'Equilibrado';
    const remaining=Math.round(Number(tg.cal||0)-Number(t.kcal||0));
    const status=remaining>0?`Faltan ${remaining} kcal para tu objetivo`:remaining===0?'Objetivo calórico alcanzado':`Superaste ${Math.abs(remaining)} kcal`;
    const arr=entriesFor(date,p.id);
    const mealTypes=['Desayuno','Almuerzo','Merienda','Cena','Snack'];
    const mealBlocks=mealTypes.map(type=>{
      const xs=arr.filter(x=>x.type===type), k=xs.reduce((a,x)=>a+Number(x.kcal||0),0);
      return `<div class="meal-block"><div class="meal-head"><div><div class="meal-title">${escLocal(type)}</div><div class="meal-summary">${xs.length?`${xs.length} alimento${xs.length>1?'s':''} · ${Math.round(k)} kcal`:'Todavía no registraste nada'}</div></div><button class="meal-add" onclick="addMeal()" aria-label="Agregar alimento a ${escLocal(type)}">＋</button></div>${xs.map(x=>{const idx=arr.indexOf(x);return `<div class="meal-line"><span>${escLocal(x.food)}<small>${escLocal(x.amount||x.qty||'')} ${escLocal(x.unit||'g')}</small></span><span class="meal-actions"><b>${Math.round(x.kcal||0)} kcal</b><button class="link-btn" onclick="editEntry(${idx})">Editar</button><button class="delete-btn" onclick="deleteEntry(${idx})" aria-label="Eliminar ${escLocal(x.food)}">×</button></span></div>`}).join('')}</div>`;
    }).join('');
    el.innerHTML=`<section class="nf-home">
      <div class="nf-topbar"><div></div><div class="nf-datetime">${icon('clock')}<span>${dateLabel} · ${time}</span></div></div>
      <div class="nf-brand">NutriFamilia</div>
      <div class="nf-calories">
        <div class="nf-cal-title">Calorías de hoy</div>
        ${gaugeSVG(t.kcal,tg.cal)}
        <div class="nf-cal-value">${Math.round(t.kcal)} <span>/ ${Math.round(tg.cal)} kcal</span></div>
        <div class="nf-cal-status ${remaining<0?'over':''}">${escLocal(status)}</div>
      </div>
      <div class="nf-macro-grid">
        <div>${ring('Proteína',t.p,tg.protein,'g')}${ring('Fibra',t.fib,tg.fiber,'g')}</div>
        <div>${ring('Hidratos',t.c,tg.carbs,'g')}${ring('Grasas',t.f,tg.fat,'g')}</div>
      </div>
      <div class="nf-plan-row"><div class="nf-info-title">${icon('plan')}<span>Plan actual</span></div><div class="nf-info-value">${escLocal(plan)}</div><button class="icon-action" onclick="showTab('profile')" aria-label="Editar plan">${icon('edit')}</button></div>
      <div class="nf-activity-grid">
        <div class="nf-info-row"><div class="nf-info-title">${icon('walk')}<span>Pasos</span></div><strong>${steps.toLocaleString('es-AR')}</strong><small>≈ ${estStepKcal} kcal por pasos</small></div>
        <div class="nf-info-row"><div class="nf-info-title">${icon('cal')}<span>Actividad</span></div><strong>${activeCal?activeCal.toLocaleString('es-AR'):'—'} kcal</strong><small>${activeCal?'Health Connect':'Sin sincronizar'}</small></div>
      </div>
      <div class="nf-info-row water-row"><div class="nf-info-title">${icon('water')}<span>Agua</span></div><strong>${Math.round(water)} ml</strong><div class="water-actions"><button onclick="addWater(250)">+250</button><button onclick="addWater(-250)">−250</button><button onclick="setWaterDialog()">Editar</button></div></div>
      <div class="nf-meals"><div class="nf-section-title">${icon('food')}<span>Alimentos del día</span><button class="section-add" onclick="addMeal()">＋ Agregar</button></div>${mealBlocks}</div>
    </section>`;
  };
  window.dashboardGaugeMath={ratio,pct};
})();
