/* NutriFamilia V7.1.2 — Inicio visual V2
   Referencia de composición: dashboard limpio con calorías al centro y cuatro macros en círculos.
*/
(function(){
  const escLocal=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clampPct=v=>Math.max(0,Math.min(100,Number(v)||0));
  const ratio=(v,t)=>{const n=Number(v),d=Number(t);return Number.isFinite(n)&&Number.isFinite(d)&&d>0?Math.max(0,n/d):0};
  const pct=(v,t)=>Math.round(clampPct(ratio(v,t)*100));

  function macroCircle(label,value,target,unit){
    const p=pct(value,target);
    const safeTarget=Math.max(0,Number(target)||0);
    return `
      <div class="macro-circle-item" aria-label="${escLocal(label)}: ${Math.round(Number(value)||0)} de ${Math.round(safeTarget)} ${escLocal(unit)}">
        <div class="macro-circle" style="--macro-pct:${p}%">
          <div class="macro-circle-inner">
            <strong>${p}%</strong>
          </div>
        </div>
        <div class="macro-circle-name">${escLocal(label)}</div>
        <div class="macro-circle-value">${Math.round(Number(value)||0)} <span>/ ${Math.round(safeTarget)} ${escLocal(unit)}</span></div>
      </div>`;
  }

  function kcalRing(value,target){
    const p=pct(value,target);
    return `<div class="kcal-ring" style="--kcal-pct:${p}%" aria-label="Calorías: ${Math.round(Number(value)||0)} de ${Math.round(Number(target)||0)} kcal">
      <div class="kcal-ring-inner">
        <strong>${Math.round(Number(value)||0)}</strong>
        <span>kcal</span>
        <small>de ${Math.round(Number(target)||0)}</small>
      </div>
    </div>`;
  }

  function stepEstimate(steps,p){
    const n=Math.max(0,Number(steps)||0);
    const kg=Math.max(40,Math.min(250,Number(lastWeight(p.id)||p.weight)||70));
    // Estimación conservadora: 0,04 kcal por paso por kg corporal.
    // Se presenta como aproximación, no como medición.
    return Math.round(n*kg*0.04/70);
  }

  function mealBlocksFor(date,pid){
    const arr=entriesFor(date,pid);
    const mealTypes=['Desayuno','Almuerzo','Merienda','Cena','Snack'];
    return mealTypes.map(type=>{
      const xs=arr.filter(x=>x.type===type),k=xs.reduce((a,x)=>a+Number(x.kcal||0),0);
      return `<div class="meal-card"><div class="row"><div><b>${type}</b><br><small class="muted">${xs.length?`${xs.length} alimento${xs.length>1?'s':''} · ${Math.round(k)} kcal`:'Todavía no registraste nada'}</small></div><button class="secondary small" onclick="addMeal()" aria-label="Agregar alimento a ${escLocal(type)}">＋</button></div>${xs.slice(0,3).map(x=>{const idx=arr.indexOf(x);return `<div class="meal-line"><span>${escLocal(x.food)}<small>${x.amount||x.qty||''} ${escLocal(x.unit||'g')}</small></span><span style="display:flex;align-items:center;gap:6px"><b>${Math.round(x.kcal)} kcal</b><button class="secondary small" onclick="editEntry(${idx})">Editar</button><button class="danger small" onclick="deleteEntry(${idx})" aria-label="Eliminar ${escLocal(x.food)}">×</button></span></div>`}).join('')}${xs.length>3?`<small class="muted">+ ${xs.length-3} más en Comidas</small>`:''}</div>`;
    }).join('');
  }

  window.renderHome=function renderHome(){
    const el=document.getElementById('home'); if(!el)return;
    const p=getActiveProfile();
    if(!p){ el.innerHTML='<section class="dashboard-hero dashboard-empty"><h2>Bienvenido a NutriFamilia</h2><p>Creá tu perfil para empezar a registrar alimentación, peso y actividad.</p></section>'; return; }
    const date=localDate(),t=totals(date,p.id),tg=targets(p),w=lastWeight(p.id),goal=p.goal||null;
    const water=db.waterByDate[`${p.id}|${date}`]||0;
    const steps=Number(db.stepsByDate[`${p.id}|${date}`]||0);
    const stepKcal=stepEstimate(steps,p);
    const plan=typeof planLabel==='function'?planLabel(p.pattern||'balanced'):(p.pattern||'Equilibrada');
    const remaining=Math.round((tg.cal||0)-(t.kcal||0));
    const status=remaining>0?`Te quedan ${remaining} kcal para tu objetivo de hoy.`:remaining===0?'Objetivo calórico alcanzado.':'Superaste el objetivo por '+Math.abs(remaining)+' kcal.';

    const hero=`
      <section class="dashboard-hero" aria-labelledby="dashboard-title">
        <div class="dashboard-plan"><span>PLAN NUTRICIONAL</span><strong>${escLocal(plan)}</strong></div>
        <div class="dashboard-date">HOY · ${escLocal(date)}</div>
        <h2 id="dashboard-title" class="sr-only">Resumen nutricional de hoy</h2>

        <div class="dashboard-main-grid">
          <div class="macro-side macro-side-left">
            ${macroCircle('Proteína',t.p,tg.protein,'g')}
            ${macroCircle('Fibra',t.fib,tg.fiber,'g')}
          </div>

          <div class="dashboard-kcal-center">
            ${kcalRing(t.kcal,tg.cal)}
            <div class="kcal-status">${escLocal(status)}</div>
          </div>

          <div class="macro-side macro-side-right">
            ${macroCircle('Hidratos',t.c,tg.carbs,'g')}
            ${macroCircle('Grasas',t.f,tg.fat,'g')}
          </div>
        </div>

        <div class="dashboard-steps">
          <div class="steps-icon" aria-hidden="true">👣</div>
          <div class="steps-copy"><strong>Actividad de hoy</strong><span>${steps.toLocaleString('es-AR')} pasos</span></div>
          <div class="steps-kcal"><strong>≈ ${stepKcal} kcal</strong><span>gasto estimado</span></div>
        </div>

        <div class="dashboard-actions"><button onclick="addMeal()">＋ Agregar alimento</button><button class="secondary" onclick="addTextMeal()">✍️ Texto / voz</button><button class="secondary" onclick="scanBarcode()">▦ Escanear</button></div>
      </section>`;

    const meals=`<div class="dashboard-subsection"><div class="row"><h2>🍽️ Tus comidas</h2><button class="secondary small" onclick="showTab('journal')">Ver todo</button></div><div class="meal-stack">${mealBlocksFor(date,p.id)}</div></div>`;
    const support=`<div class="dashboard-support-grid"><div class="support-card"><b>💧 Agua registrada</b><div class="big">${water} ml</div><div class="actions"><button class="secondary" onclick="addWater(250)">＋250</button><button class="secondary" onclick="addWater(-250)">−250</button><button class="secondary" onclick="setWaterDialog()">Editar</button></div></div><div class="support-card"><b>⚖️ Peso</b><div class="big">${w||'—'} kg</div><small class="muted">Objetivo: ${goal||'—'} kg</small></div></div>`;
    const quality=`<div class="dashboard-subsection"><h2>📌 Lo importante hoy</h2>${smartAdvice(p,weekStats(p.id)).slice(0,3).map(x=>`<div class="notice">${escLocal(x)}</div>`).join('')}</div><div class="dashboard-subsection"><h2>🧭 Calidad nutricional</h2>${meter('🥬 Frutas + verduras',t.veg+t.fruit,tg.veg,'g')}${meter('🧂 Sodio',t.sodium,tg.sodium,'mg',true)}${meter('🧈 Grasas saturadas',t.sat,tg.sat,'g',true)}</div>`;
    el.innerHTML=hero+meals+support+quality;
  };

  window.dashboardGaugeMath={ratio,pct};
})();
