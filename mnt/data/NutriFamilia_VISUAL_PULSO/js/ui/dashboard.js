// NutriFamilia V7.1.2 — dashboard UI — visual redesign inspired by the selected reference
(function(){
  const escLocal=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
  const ratio=(v,t)=>{const n=Number(v),d=Number(t);return Number.isFinite(n)&&Number.isFinite(d)&&d>0?Math.max(0,n/d):0};
  const angleFor=v=>-90+clamp(v*100)/100*180;
  function gaugeSVG(value,target,large=false){
    const pct=clamp(ratio(value,target),0,1);
    const r=large?82:46,cx=large?100:60,cy=large?100:60;
    const path=large?'M18 100 A82 82 0 0 1 182 100':'M14 60 A46 46 0 0 1 106 60';
    const len=large?257.61:144.51,offset=len*(1-pct);
    const ticks=[-135,-67.5,0,67.5,135].map(a=>{
      const rad=(a-90)*Math.PI/180, rr=large?90:52, ri=large?84:47;
      const x1=cx+ri*Math.cos(rad),y1=cy+ri*Math.sin(rad),x2=cx+rr*Math.cos(rad),y2=cy+rr*Math.sin(rad);
      return `<line class="gauge-tick" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }).join('');
    return `<svg viewBox="0 0 ${large?200:120} ${large?120:72}" aria-hidden="true"><path class="gauge-track" d="${path}"/><path class="gauge-progress" d="${path}" stroke-dasharray="${len}" stroke-dashoffset="${offset.toFixed(2)}"/>${ticks}</svg>`;
  }
  function needleGauge(value,target,large=false,label=''){
    const pct=ratio(value,target),angle=angleFor(pct),v=Number(value)||0,t=Number(target)||0;
    return `<div class="nf-gauge ${large?'nf-gauge-large':''}" style="--needle-angle:${angle}deg" role="img" aria-label="${escLocal(label)}: ${Math.round(v)} de ${Math.round(t)}"><div class="gauge-svg-wrap">${gaugeSVG(v,t,large)}</div><div class="needle"></div>${large?`<div class="gauge-center"><strong>${Math.round(v)}</strong><small>/ ${Math.round(t)} kcal</small></div>`:''}</div>`;
  }
  function macroCard(label,value,target,unit){
    const pct=Math.round(clamp(ratio(value,target)*100));
    const safePct=Number.isFinite(pct)?pct:0;
    return `<div class="macro-gauge-card" style="--macro-progress:${safePct}%" aria-label="${escLocal(label)}: ${Math.round(value)} ${unit} de ${Math.round(target)} ${unit}">
      <div class="macro-ring"><div class="macro-ring-inner"><strong>${Math.round(value)}</strong><span>${unit}</span></div></div>
      <span class="macro-name">${escLocal(label)}</span>
      <span class="macro-target">de ${Math.round(target)} ${unit}</span>
    </div>`;
  }
  window.renderHome=function renderHome(){
    const el=document.getElementById('home'); if(!el)return;
    const p=getActiveProfile(),date=localDate(),t=totals(date,p.id),tg=targets(p),w=lastWeight(p.id),goal=p.goal||null,water=db.waterByDate[`${p.id}|${date}`]||0,arr=entriesFor(date,p.id);
    const remaining=Math.round(tg.cal-t.kcal);
    const status=remaining>0?`Te quedan ${remaining} kcal para tu objetivo de hoy.`:remaining===0?'Objetivo calórico alcanzado.':'Superaste el objetivo por '+Math.abs(remaining)+' kcal.';
    const mealTypes=['Desayuno','Almuerzo','Merienda','Cena','Snack'];
    const mealBlocks=mealTypes.map(type=>{const xs=arr.filter(x=>x.type===type),k=xs.reduce((a,x)=>a+Number(x.kcal||0),0);return `<div class="meal-card"><div class="row"><div><b>${type}</b><br><small class="muted">${xs.length?`${xs.length} alimento${xs.length>1?'s':''} · ${Math.round(k)} kcal`:'Todavía no registraste nada'}</small></div><button class="secondary small" onclick="addMeal()" aria-label="Agregar alimento a ${escLocal(type)}">＋</button></div>${xs.slice(0,3).map(x=>{const idx=arr.indexOf(x);return `<div class="meal-line"><span>${escLocal(x.food)}<small>${x.amount||x.qty||''} ${escLocal(x.unit||'g')}</small></span><span style="display:flex;align-items:center;gap:6px"><b>${Math.round(x.kcal)} kcal</b><button class="secondary small" onclick="editEntry(${idx})">Editar</button><button class="danger small" onclick="deleteEntry(${idx})" aria-label="Eliminar ${escLocal(x.food)}">×</button></span></div>`}).join('')}${xs.length>3?`<small class="muted">+ ${xs.length-3} más en Comidas</small>`:''}</div>`}).join('');
    el.innerHTML=`
      <section class="card dashboard-hero" aria-labelledby="dashboard-title">
        <div class="dashboard-heading"><span class="eyebrow">${escLocal(date)}</span><h2 id="dashboard-title">Nutrición del día</h2></div>
        <div class="dashboard-calorie-row">
          ${needleGauge(t.kcal,tg.cal,true,'Calorías')}
          <div class="dashboard-kcal-copy"><span class="kcal-label">Calorías</span><strong>${Math.round(t.kcal)}</strong><span class="target">/ ${Math.round(tg.cal)} kcal</span><div class="remaining">${escLocal(status)}</div></div>
        </div>
        <div class="dashboard-macros" aria-label="Progreso de macronutrientes">
          ${macroCard('Proteína',t.p,tg.protein,'g')}${macroCard('Carbohidratos',t.c,tg.carbs,'g')}${macroCard('Grasas',t.f,tg.fat,'g')}
        </div>
      </section>
      <div class="dashboard-actions"><button onclick="addMeal()">＋ Agregar alimento</button><button class="secondary" onclick="addTextMeal()">✍️ Texto / voz</button><button class="secondary" onclick="scanBarcode()">▦ Escanear</button></div>
      <div class="card dashboard-meals"><div class="row"><h2>🍽️ Tus comidas</h2><button class="secondary small" onclick="showTab('journal')">Ver todo</button></div><div class="meal-stack">${mealBlocks}</div></div>
      <div class="grid"><div class="card"><b>💧 Agua registrada</b><div class="big">${water} ml</div><div class="actions"><button class="secondary" onclick="addWater(250)">＋250</button><button class="secondary" onclick="addWater(-250)">−250</button><button class="secondary" onclick="setWaterDialog()">Editar</button></div><small class="muted">Registro de agua/bebidas; la referencia nutricional de agua total se informa aparte.</small></div><div class="card"><b>⚖️ Peso</b><div class="big">${w||'—'} kg</div><small class="muted">Objetivo: ${goal||'—'} kg</small></div></div>
      <div class="card"><h2>📌 Lo importante hoy</h2>${smartAdvice(p,weekStats(p.id)).slice(0,3).map(x=>`<div class="notice">${escLocal(x)}</div>`).join('')}</div>
      <div class="card"><h2>🧭 Calidad nutricional</h2>${meter('🥬 Frutas + verduras',t.veg+t.fruit,tg.veg,'g')}${meter('🧂 Sodio',t.sodium,tg.sodium,'mg',true)}${meter('🧈 Grasas saturadas',t.sat,tg.sat,'g',true)}</div>`;
  };
  window.dashboardGaugeMath={ratio,angleFor};
})();
