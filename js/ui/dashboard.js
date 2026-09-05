/* NutriFamilia V7.2.0 — Dashboard reparado
   Clases CSS y JS unificadas. Bug addMeal(tipo) corregido.
   Diseño inspirado en referencia Pulso: gauge semicircular grande, macros con anillos, pasos, agua, comidas por tipo. */
(function(){
  const escLocal=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const clamp=(v,mn=0,mx=100)=>Math.max(mn,Math.min(mx,num(v)));
  const ratio=(v,t)=>{const n=num(v),d=num(t);return d>0?Math.max(0,n/d):0;};

  /* ── Gauge semicircular ── */
  function calorieGauge(value,target){
    const v=num(value),t=Math.max(1,num(target));
    const pct=clamp(v/t*100)/100;
    const ARC=251.2; // longitud del semiarco (π×r, r=80)
    const offset=(ARC*(1-pct)).toFixed(1);
    const angle=(-90+180*Math.min(1,v/t)).toFixed(1);
    const excess=Math.max(0,v-t);
    const overPct=v>t?Math.round((v-t)/t*100):0;
    const statusTxt=v>t
      ?`<span class="nf-gauge-status over">Exceso: +${Math.round(excess)} kcal (${overPct}% sobre objetivo)</span>`
      :v===t
      ?`<span class="nf-gauge-status ok">✓ Objetivo alcanzado</span>`
      :`<span class="nf-gauge-status">Restan ${Math.round(t-v)} kcal</span>`;
    return `<div class="nf-cal-gauge" role="img" aria-label="Calorías consumidas: ${Math.round(v)} de ${Math.round(t)} kcal">
      <svg viewBox="0 0 200 120" aria-hidden="true">
        <path class="nf-gauge-track" d="M20 100 A80 80 0 0 1 180 100"/>
        <path class="nf-gauge-progress${v>t?' over':''}" d="M20 100 A80 80 0 0 1 180 100"
          stroke-dasharray="${ARC}" stroke-dashoffset="${offset}"/>
        <path class="nf-gauge-ticks" d="M20 100l-3 2M49 42l-3-3M100 20v-5M151 42l3-3M180 100l3 2" fill="none"/>
      </svg>
      <div class="nf-gauge-needle" style="--needle-angle:${angle}deg" aria-hidden="true"><span></span></div>
      <div class="nf-gauge-center">
        <strong>${Math.round(v)}</strong><span>kcal</span><small>de ${Math.round(t)}</small>
      </div>
      ${statusTxt}
    </div>`;
  }

  /* ── Anillo de macro (conic-gradient CSS) ── */
  function macroRing(label,value,target,unit,color){
    const v=num(value),t=Math.max(0.0001,num(target));
    const pct=clamp(v/t*100);
    const over=v>t;
    const displayPct=Math.round(pct);
    return `<div class="nf-macro" aria-label="${escLocal(label)}: ${Math.round(v)} de ${Math.round(t)} ${escLocal(unit)}">
      <div class="nf-macro-ring${over?' is-over':''}" style="--fill:${Math.round(pct)}%;--clr:${color}">
        <div class="nf-macro-ring-inner">
          <strong>${Math.round(v)}</strong>
          <span>${escLocal(unit)}</span>
        </div>
      </div>
      <div class="nf-macro-label">${escLocal(label)}</div>
      <div class="nf-macro-target">de ${Math.round(t)} ${escLocal(unit)}</div>
      ${over?`<div class="nf-macro-over">+${Math.round(v-t)} ${escLocal(unit)}</div>`:''}
    </div>`;
  }

  /* ── Barra de progreso ── */
  function progressBar(label,value,target,unit,{reverse=false,warn=false}={}){
    const v=num(value),t=Math.max(0.0001,num(target));
    const pct=clamp(v/t*100);
    const ok=reverse?v<=t:pct>=100;
    const cls=ok?'ok':warn&&pct<60?'low':'mid';
    return `<div class="nf-prog-row">
      <div class="nf-prog-labels">
        <span>${escLocal(label)}</span>
        <span>${Math.round(v)} <small>/ ${Math.round(t)} ${escLocal(unit)}</small></span>
      </div>
      <div class="nf-prog-bar"><div class="nf-prog-fill ${cls}" style="width:${Math.min(100,pct)}%"></div></div>
    </div>`;
  }

  /* ── Fecha y hora ── */
  function dateLabel(){
    return new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long'})
      .format(new Date()).replace(/^./,c=>c.toUpperCase());
  }

  /* ── Estimación de kcal por pasos ── */
  function stepKcal(steps,p){
    const kg=Math.max(40,Math.min(250,num(lastWeight(p.id)||p.weight)||70));
    const n=Math.max(0,num(steps));
    // Referencia ACSM simplificada: ~0.04 kcal/paso para 70 kg, ajustado por peso
    return Math.round(n*kg*0.04/70);
  }

  /* ── Filas de comidas por tipo ── */
  function mealTypeBlock(type,arr,allArr){
    const xs=arr.filter(x=>x.type===type);
    const kcalType=xs.reduce((a,x)=>a+num(x.kcal),0);
    const items=xs.slice(0,4).map(x=>{
      const idx=allArr.indexOf(x);
      return `<div class="nf-food-row">
        <div class="nf-food-info">
          <span>${escLocal(x.food)}</span>
          <small>${escLocal(String(x.amount??x.qty??''))} ${escLocal(x.unit||'g')} · ${Math.round(num(x.kcal))} kcal</small>
        </div>
        <div class="nf-food-btns">
          <button class="nf-icon-btn" type="button" onclick="editEntry(${idx})" aria-label="Editar ${escLocal(x.food)}">✎</button>
          <button class="nf-icon-btn danger" type="button" onclick="deleteEntry(${idx})" aria-label="Eliminar ${escLocal(x.food)}">×</button>
        </div>
      </div>`;
    }).join('');
    const extra=xs.length>4?`<small class="nf-food-extra">+${xs.length-4} más en Comidas</small>`:'';
    /* BUG CORREGIDO: addMeal recibe el tipo explícitamente */
    return `<div class="nf-meal-block">
      <div class="nf-meal-head">
        <div>
          <span class="nf-meal-name">${escLocal(type)}</span>
          ${xs.length?`<small class="muted">${Math.round(kcalType)} kcal</small>`:''}
        </div>
        <button class="nf-meal-add" type="button" onclick="addMeal('${escLocal(type)}')" aria-label="Agregar alimento a ${escLocal(type)}">+</button>
      </div>
      ${xs.length?items+''+extra:`<div class="nf-food-empty">Sin registros aún</div>`}
    </div>`;
  }

  /* ── Render principal ── */
  window.renderHome=function(){
    const el=document.getElementById('home'); if(!el)return;
    const p=getActiveProfile();
    if(!p){
      el.innerHTML=`<section class="nf-home nf-welcome-screen">
        <div class="nf-welcome-icon">🥗</div>
        <h2>Bienvenido a NutriFamilia</h2>
        <p>Creá tu perfil para empezar a registrar alimentación, peso y actividad.</p>
        <button type="button" onclick="newProfile()">+ Crear perfil</button>
      </section>`;
      return;
    }

    const date=localDate();
    const t=totals(date,p.id);
    const tg=targets(p);
    const steps=num(db.stepsByDate?.[`${p.id}|${date}`]);
    const water=num(db.waterByDate?.[`${p.id}|${date}`]);
    const arr=entriesFor(date,p.id);
    const fiberTarget=Math.max(25,num(tg.fiber)||25);
    const waterTarget=num(tg.water)||2000;
    const stepsTarget=9700;

    el.innerHTML=`
    <section class="nf-home" aria-label="Panel principal NutriFamilia">

      <!-- Encabezado -->
      <div class="nf-topbar">
        <div class="nf-topbar-title">NUTRIFAMILIA</div>
        <div class="nf-topbar-date">${escLocal(dateLabel())}</div>
      </div>

      <!-- Gauge calorías -->
      <div class="nf-section">
        <div class="nf-kicker">CALORÍAS DEL DÍA</div>
        ${calorieGauge(t.kcal,tg.cal)}
      </div>

      <!-- Macros: 4 anillos -->
      <div class="nf-macros-grid" aria-label="Macronutrientes">
        ${macroRing('Proteína',t.p,tg.protein,'g','#7C6FD4')}
        ${macroRing('Hidratos',t.c,tg.carbs,'g','#3CB8A0')}
        ${macroRing('Grasas',t.f,tg.fat,'g','#F47A2A')}
        ${macroRing('Fibra',t.fib,fiberTarget,'g','#5BAE6A')}
      </div>

      <!-- Pasos y agua -->
      <div class="nf-activity-card">
        <div class="nf-kicker">ACTIVIDAD Y AGUA</div>
        ${progressBar('Pasos',steps,stepsTarget,'pasos')}
        <div class="nf-steps-kcal">≈ ${stepKcal(steps,p)} kcal de gasto estimado</div>
        ${progressBar('Agua',water,waterTarget,'ml',{warn:true})}
        <div class="nf-water-btns">
          <button type="button" class="nf-pill-btn" onclick="addWater(250)">+250 ml</button>
          <button type="button" class="nf-pill-btn secondary" onclick="setWaterDialog()">Editar</button>
        </div>
      </div>

      <!-- Plan nutricional -->
      <div class="nf-plan-card">
        <span class="nf-kicker">PLAN NUTRICIONAL</span>
        <div class="nf-plan-row">
          <strong>${escLocal((typeof planLabel==='function'?planLabel(p.pattern||'balanced'):(p.pattern||'Equilibrada')).replace(/^[^\w]+/,''))}</strong>
          <button type="button" class="nf-text-btn" onclick="showTab('profile')">✎ Editar</button>
        </div>
      </div>

      <!-- Registro por comida -->
      <div class="nf-meals-section">
        <div class="nf-kicker">REGISTRO DEL DÍA</div>
        ${['Desayuno','Almuerzo','Merienda','Cena','Snack'].map(t=>mealTypeBlock(t,arr,arr)).join('')}
        ${!arr.length?`<div class="nf-all-empty">Todavía no registraste alimentos hoy. Usá el botón + para agregar.</div>`:''}
        <button type="button" class="nf-more-btn" onclick="showTab('journal')">Ver todas las comidas →</button>
      </div>

    </section>`;
  };

  /* Refrescar cada 60 s si está visible */
  setInterval(()=>{
    const h=document.getElementById('home');
    if(h&&!h.classList.contains('hidden'))window.renderHome();
  },60000);
})();
