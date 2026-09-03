/* NutriFamilia V7.1.2 — Inicio final: composición unificada, reloj de calorías, 4 macros, plan, pasos, agua y comidas. */
(function(){
  const escLocal=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const pct=(v,t)=>Math.max(0,Math.min(100,Math.round((num(v)/Math.max(1,num(t)))*100)));
  const clamp01=v=>Math.max(0,Math.min(1,num(v)));
  const icon=(name,label='')=>{
    const p={
      plan:'<path d="M6 4h12v4H6zM4 9h16v11H4z"/><path d="M8 13h8M8 16h5"/>',
      protein:'<path d="M6 4c0 4 2 5 2 8 0 3-2 4-2 8M18 4c0 4-2 5-2 8 0 3 2 4 2 8M8 10h8"/>',
      fiber:'<path d="M12 20V9M12 12c-3-2-5-3-7-2 1 3 3 5 7 5M12 13c3-2 5-3 7-2-1 3-3 5-7 5M12 9c0-3-1-5-4-6 0 3 1 5 4 6z"/>',
      carbs:'<path d="M4 18c3-2 5-4 8-10 3 6 5 8 8 10"/><path d="M6 20h12"/>',
      fat:'<path d="M12 4c4 4 7 7 7 10a7 7 0 0 1-14 0c0-3 3-6 7-10z"/>',
      steps:'<circle cx="9" cy="5" r="2"/><path d="M11 8l-2 5 3 2 1 5M9 12l-4 3M13 8l4 4-3 3"/>',
      water:'<path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11z"/>',
      food:'<path d="M5 7h14M7 4h10M6 10v8M18 10v8M5 20h14"/>',
      edit:'<path d="M4 20h4l10-10-4-4L4 16v4zM13 7l4 4"/>',
      chevron:'<path d="m9 6 6 6-6 6"/>'
    };
    return `<svg class="nf-icon" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p[name]||p.plan}</g></svg>${label?`<span>${escLocal(label)}</span>`:''}`;
  };

  function calorieGauge(value,target){
    const v=num(value),t=Math.max(1,num(target)),ratio=v/t;
    const p=Math.min(1,Math.max(0,ratio));
    const angle=-90+(180*p);
    const excess=Math.max(0,v-t);
    return `<div class="nf-cal-gauge" role="img" aria-label="Calorías consumidas: ${Math.round(v)} de ${Math.round(t)} kcal">
      <svg viewBox="0 0 320 190" aria-hidden="true">
        <path class="nf-gauge-track" d="M45 150 A115 115 0 0 1 275 150"/>
        <path class="nf-gauge-progress" d="M45 150 A115 115 0 0 1 275 150" stroke-dasharray="361.28" stroke-dashoffset="${(361.28*(1-p)).toFixed(1)}"/>
        <path class="nf-gauge-over" d="M45 150 A115 115 0 0 1 275 150" stroke-dasharray="361.28" stroke-dashoffset="${p>=1?0:361.28}"/>
        <g class="nf-gauge-ticks"><path d="M45 150l-4 2M72 91l-5-3M160 35v-6M248 91l5-3M275 150l4 2"/></g>
      </svg>
      <div class="nf-gauge-needle" style="--needle-angle:${angle}deg"><span></span></div>
      <div class="nf-gauge-center"><strong>${Math.round(v)}</strong><span>kcal</span><small>/ ${Math.round(t)}</small></div>
      <div class="nf-gauge-note">${ratio>1?`Exceso: +${Math.round(excess)} kcal`:ratio===1?'Objetivo alcanzado':`Restan ${Math.round(t-v)} kcal`}</div>
    </div>`;
  }

  function macroCircle(label,value,target,unit,iconName){
    const raw=num(value),tar=Math.max(.0001,num(target)),p=Math.min(1,Math.max(0,raw/tar)),over=raw>tar;
    return `<div class="nf-macro" aria-label="${escLocal(label)}: ${Math.round(raw)} de ${Math.round(tar)} ${escLocal(unit)}">
      <div class="nf-macro-circle ${over?'is-over':''}" style="--fill:${(p*360).toFixed(1)}deg"><div class="nf-macro-inner"><strong>${Math.round(p*100)}%</strong></div></div>
      <div class="nf-macro-label">${icon(iconName)}<span>${escLocal(label)}</span></div>
      <div class="nf-macro-value">${Math.round(raw)} <small>/ ${Math.round(tar)} ${escLocal(unit)}</small></div>
      ${over?`<div class="nf-over">+${Math.round(raw-tar)} ${escLocal(unit)}</div>`:''}
    </div>`;
  }

  function stepEstimate(steps,p){
    const n=Math.max(0,num(steps));
    const kg=Math.max(40,Math.min(250,num(lastWeight(p.id)||p.weight)||70));
    return Math.round(n*kg*0.04/70);
  }

  function timeLabel(){return new Intl.DateTimeFormat('es-AR',{hour:'2-digit',minute:'2-digit'}).format(new Date());}
  function dateLabel(){return new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date()).replace(/^./,c=>c.toUpperCase());}

  function mealRows(date,pid){
    const arr=entriesFor(date,pid);
    if(!arr.length)return `<div class="nf-empty"><div class="nf-empty-icon">${icon('food')}</div><div><strong>Aún no registraste alimentos</strong><p>Agregalos desde el botón + o desde Comidas.</p></div></div>`;
    return arr.slice().reverse().slice(0,8).map((x)=>{
      const idx=arr.indexOf(x);
      const qty=x.amount??x.qty??x.grams??'';
      const unit=x.unit||x.inputUnit||'g';
      return `<div class="nf-food-row"><div class="nf-food-main"><div class="nf-food-icon">${icon('food')}</div><div><strong>${escLocal(x.food)}</strong><span>${escLocal(String(qty))} ${escLocal(unit)} · ${Math.round(num(x.kcal))} kcal</span></div></div><div class="nf-food-actions"><button class="nf-icon-btn" type="button" onclick="editEntry(${idx})" aria-label="Editar ${escLocal(x.food)}">${icon('edit')}</button><button class="nf-icon-btn danger" type="button" onclick="deleteEntry(${idx})" aria-label="Eliminar ${escLocal(x.food)}">×</button></div></div>`;
    }).join('');
  }

  window.renderHome=function(){
    const el=document.getElementById('home'); if(!el)return;
    const p=getActiveProfile();
    if(!p){el.innerHTML=`<section class="nf-home"><div class="nf-welcome"><div class="nf-welcome-icon">${icon('plan')}</div><h2>Bienvenido a NutriFamilia</h2><p>Creá tu perfil para empezar a registrar alimentación, peso y actividad.</p></div></section>`;return;}
    const date=localDate(),t=totals(date,p.id),tg=targets(p),steps=num(db.stepsByDate?.[`${p.id}|${date}`]),water=num(db.waterByDate?.[`${p.id}|${date}`]),plan=typeof planLabel==='function'?planLabel(p.pattern||'balanced'):(p.pattern||'Equilibrada');
    const fiberTarget=Math.max(25,num(tg.fiber)||25);
    const planName=String(plan).replace(/^[^A-Za-zÁÉÍÓÚÜÑ]+/,'');
    const html=`
      <section class="nf-home" aria-label="Inicio de NutriFamilia">
        <header class="nf-topbar">
          <div class="nf-top-title">NUTRIFAMILIA</div>
          <div class="nf-date">${escLocal(dateLabel())}</div>
          <div class="nf-time">${escLocal(timeLabel())}</div>
        </header>

        <div class="nf-calories">
          <div class="nf-section-kicker">NUTRICIÓN DEL DÍA</div>
          ${calorieGauge(t.kcal,tg.cal)}
        </div>

        <div class="nf-macros" aria-label="Macronutrientes">
          <div class="nf-macro-col left">
            ${macroCircle('Proteína',t.p,tg.protein,'g','protein')}
            ${macroCircle('Fibra',t.fib,fiberTarget,'g','fiber')}
          </div>
          <div class="nf-macro-col right">
            ${macroCircle('Hidratos',t.c,tg.carbs,'g','carbs')}
            ${macroCircle('Grasas',t.f,tg.fat,'g','fat')}
          </div>
        </div>

        <div class="nf-plan-row">
          <div class="nf-inline-icon">${icon('plan')}</div>
          <div class="nf-plan-copy"><span>PLAN NUTRICIONAL</span><strong>${escLocal(planName)}</strong></div>
          <button type="button" class="nf-text-btn" onclick="showTab('profile')">${icon('edit')}<span>Editar</span></button>
        </div>

        <div class="nf-activity-row">
          <div class="nf-activity-icon">${icon('steps')}</div>
          <div class="nf-activity-copy"><span>Pasos de hoy</span><strong>${steps.toLocaleString('es-AR')}</strong></div>
          <div class="nf-activity-kcal"><strong>≈ ${stepEstimate(steps,p)} kcal</strong><span>gasto estimado</span></div>
        </div>

        <div class="nf-water-row">
          <div class="nf-inline-icon">${icon('water')}</div>
          <div class="nf-water-copy"><span>Agua</span><strong>${Math.round(water)} ml</strong></div>
          <div class="nf-water-actions"><button type="button" class="nf-pill" onclick="addWater(250)">+250</button><button type="button" class="nf-pill" onclick="setWaterDialog()">Editar</button></div>
        </div>

        <div class="nf-food-section">
          <div class="nf-food-head"><div><span class="nf-section-kicker">REGISTRO DEL DÍA</span><h2>${icon('food')}<span>Alimentos</span></h2></div><button type="button" class="nf-add-btn" onclick="addMeal()">+</button></div>
          <div class="nf-food-list">${mealRows(date,p.id)}</div>
          <button type="button" class="nf-more-btn" onclick="showTab('journal')">Ver todas las comidas ${icon('chevron')}</button>
        </div>
      </section>`;
    el.innerHTML=html;
  };

  window.dashboardGaugeMath={pct,clamp01};
  setInterval(()=>{if(document.getElementById('home')&&!document.getElementById('home').classList.contains('hidden'))window.renderHome()},30000);
})();
