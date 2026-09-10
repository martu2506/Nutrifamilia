/* NutriFamilia V7.8.9 — ampliación del catálogo y trazabilidad nutricional. */
(function(){
  'use strict';
  const add=(name,meta)=>{if(typeof foods!=='undefined') foods[name]={...(foods[name]||{}),...meta}};
  const unit=(grams,label='unidad',value='unit')=>({value,label,gramsPerUnit:grams});
  const g=(extra={})=>({unitMode:'per100g',unitLabel:'g',unitOptions:[{value:'g',label:'g',gramsPerUnit:1}],sourceStatus:'provisional; preparación/receta o marca puede variar',...extra});
  const portion=(kcal,p,c,f,fib=0,sugar=0,sat=0,sodium=0,grams=150,label='porción')=>({kcal,p,c,f,fib,sugar,sat,sodium,veg:0,fruit:0,unitMode:'portion',unitLabel:label,unitOptions:[{value:'portion',label,gramsPerUnit:grams},{value:'half',label:'½ '+label,gramsPerUnit:grams/2},{value:'g',label:'g',gramsPerUnit:1}],sourceStatus:'provisional; receta estándar; verificar ingredientes/aceite'});

  const items={
    'Huevo hervido':{kcal:156,p:12.0,c:1.12,f:11.8,fib:0,sugar:.4,sat:3.2,sodium:373,source:'SARA 2 — huevo de gallina, entero, hervido (Argentina, 2022)',sourceStatus:'referencia primaria argentina; por 100 g'},
    'Huevo pasado por agua':g({kcal:156,p:12.0,c:1.12,f:11.8,fib:0,sugar:.4,sat:3.2,sodium:373,source:'SARA 2 — huevo de gallina, entero; preparación cercana al huevo hervido',sourceStatus:'referencia basada en SARA 2; por 100 g'}),
    'Huevo poché':g({kcal:156,p:12.0,c:1.12,f:11.8,fib:0,sugar:.4,sat:3.2,sodium:373,source:'SARA 2 — huevo de gallina, entero, hervido; sin grasa añadida',sourceStatus:'referencia basada en SARA 2; por 100 g'}),
    'Huevo revuelto':g({kcal:166,p:10.9,c:1.0,f:12.8,fib:0,sugar:.4,sat:4.0,sodium:140,source:'Base de huevo entero; receta de revuelto sin cuantificar grasa añadida',sourceStatus:'provisional; depende de leche/aceite/manteca'}),
    'Huevo frito':g({kcal:196,p:13.0,c:.8,f:15.0,fib:0,sugar:.4,sat:4.5,sodium:140,source:'Referencia de huevo frito; el aceite de cocción modifica energía final',sourceStatus:'provisional; depende de absorción de aceite'}),
    'Huevo al horno':g({kcal:156,p:12,c:1.1,f:11.8,fib:0,sugar:.4,sat:3.2,sodium:373,source:'SARA 2 — huevo entero, hervido; sin grasa añadida',sourceStatus:'provisional; cocción al horno sin ingredientes extra'}),
    'Omelette':portion(160,12,1.5,12,0,.5,3.5,180,100,'omelette'),
    'Omelette de 2 huevos':g({kcal:156,p:12.6,c:1.2,f:10.6,fib:0,sugar:0,sat:3.2,sodium:124,source:'Referencia de huevo entero; por 100 g',sourceStatus:'provisional; depende de grasa añadida'}),
    'Omelette con queso':portion(245,18,2.5,18,0,.8,7,430,150,'porción'),
    'Omelette con verduras':portion(190,13,7,12,2,3,3.5,220,180,'porción'),
    'Tortilla de papa':portion(210,7,18,12,2,2,4,300,180,'porción'),
    'Tortilla de verduras':portion(150,8,9,9,2,3,2.5,250,180,'porción'),

    'Hamburguesa de carne comprada/congelada':g({kcal:240,p:16,c:7,f:17,fib:0,sugar:1,sat:6,sodium:500,source:'Referencia de hamburguesa de carne procesada/congelada; marca puede variar'}),
    'Hamburguesa de pollo':g({kcal:190,p:18,c:8,f:9,fib:.2,sugar:.5,sat:2.5,sodium:450,source:'Referencia de hamburguesa de pollo procesada; marca/receta puede variar'}),
    'Hamburguesa de pescado':g({kcal:170,p:14,c:11,f:8,fib:.5,sugar:.5,sat:1.5,sodium:450,source:'Referencia de medallón de pescado rebozado; marca/receta puede variar'}),
    'Hamburguesa vegetal de soja':g({kcal:180,p:15,c:10,f:8,fib:4,sugar:1,sat:1.2,sodium:450,source:'Referencia de hamburguesa vegetal de soja; formulación comercial puede variar'}),
    'Vacío de cerdo':g({kcal:270,p:25,c:0,f:18,fib:0,sugar:0,sat:6,sodium:60,source:'Referencia de corte porcino; contenido graso depende del recorte'}),
    'Papas fritas':portion(465,4.0,52,24,5,1,4,250,150,'porción'),
    'Papas fritas congeladas/preparadas':portion(310,3.5,39,15,4,1,3,350,150,'porción'),

    'Ensalada de zanahoria y huevo':portion(105,5,8,6,3,4,1.5,110,180,'porción'),
    'Ensalada de rúcula':portion(30,1.5,4,0.5,2,2,0,20,100,'porción'),
    'Ensalada de rúcula, tomate y huevo':portion(95,6,5,5,2,3,1.5,100,180,'porción'),
    'Ensalada de lechuga, tomate y cebolla':portion(35,1.5,7,0.4,2.5,4,0.1,20,180,'porción'),
    'Ensalada de tomate y cebolla':portion(32,1.2,6,0.3,1.8,4,0.1,15,150,'porción'),
    'Ensalada de tomate y huevo':portion(90,6,5,5,1.5,3.5,1.5,90,180,'porción'),
    'Ensalada de zanahoria y tomate':portion(50,1.3,10,0.5,3,5,0.1,35,180,'porción'),
    'Ensalada de remolacha':portion(55,2,10,0.3,3,7,0.1,80,150,'porción'),
    'Ensalada de remolacha y huevo':portion(105,6,10,5,3,6,1.5,100,180,'porción'),
    'Ensalada de repollo y zanahoria':portion(45,1.5,9,0.4,3,5,0.1,30,180,'porción'),
    'Ensalada de arroz y huevo':portion(190,7,27,6,1,1,2,160,200,'porción'),
    'Puré':portion(125,2.5,18,5,2,2,2.5,180,200,'porción'),
    'Puré de zapallo':portion(85,2,14,2.5,3,5,0.6,120,200,'porción'),
    'Puré de batata':portion(120,2,22,3,4,7,0.7,120,200,'porción'),

    'Pan de salvado':g({kcal:250,p:10,c:43,f:4,fib:7,sugar:4,sat:.8,sodium:430,source:'Referencia de pan de salvado; receta puede variar'}),
    'Pan lactal integral':g({kcal:250,p:10,c:43,f:4,fib:6,sugar:5,sat:.7,sodium:420,source:'Referencia de pan lactal integral; marca puede variar'}),
    'Pan de campo':g({kcal:260,p:9,c:50,f:3,fib:3,sugar:2,sat:.6,sodium:430,source:'Referencia de pan de campo; receta puede variar'}),
    'Pan casero':g({kcal:270,p:9,c:51,f:4,fib:2.5,sugar:2,sat:.7,sodium:420,source:'Referencia de pan casero; receta puede variar'}),
    'Bizcochuelo':g({kcal:350,p:6,c:55,f:12,fib:1,sugar:28,sat:3.5,sodium:260,source:'Referencia de bizcochuelo simple; receta puede variar'}),

    'Arroz con leche':portion(145,4,24,4,0.5,14,2.3,90,180,'porción'),
    'Flan con dulce de leche':portion(190,5,27,7,0,23,3,180,150,'porción'),
    'Budín de pan':portion(210,6,30,7,0.5,18,3.2,220,150,'porción'),
    'Gelatina':portion(65,1.5,15,0,0,14,0,25,150,'porción'),
    'Mousse':portion(250,4,22,16,0.5,18,9,90,120,'porción'),
    'Chocotorta':portion(330,5,38,18,1,25,8,280,150,'porción'),
    'Torta':portion(320,5,40,16,1,25,7,250,150,'porción'),
    'Cheesecake':portion(330,6,25,23,0.5,18,11,300,130,'porción'),
    'Yogur con fruta':portion(120,5,18,3,2,13,1.5,70,200,'porción'),

    'Manzana verde':g({kcal:52,p:.3,c:13.8,f:.2,fib:2.4,sugar:10.3,sat:.03,sodium:1,fruit:100,source:'Referencia de manzana verde fresca con piel; comparación USDA FoodData Central',sourceStatus:'provisional; variedad/cultivo puede variar',unitOptions:[unit(180,'unidad'),unit(90,'media unidad','half'),{value:'g',label:'g',gramsPerUnit:1}]}),
    'Vino blanco':g({kcal:82,p:.1,c:2.6,f:0,fib:0,sugar:.6,sat:0,sodium:5,source:'Referencia de vino blanco seco; valores dependen del vino y grado alcohólico',sourceStatus:'provisional; consultar etiqueta del vino específico',unitLabel:'ml',unitOptions:[{value:'ml',label:'ml',gramsPerUnit:1},{value:'glass',label:'copa (150 ml)',gramsPerUnit:150},{value:'g',label:'g',gramsPerUnit:1}]}),
    'Vino blanco dulce':g({kcal:120,p:.1,c:8,f:0,fib:0,sugar:7,sat:0,sodium:5,alcoholG:10,source:'Referencias de vino blanco dulce/USDA; azúcar residual y graduación alcohólica dependen del producto',sourceStatus:'provisional; consultar etiqueta del vino específico',unitLabel:'ml',unitOptions:[{value:'ml',label:'ml',gramsPerUnit:1},{value:'glass',label:'copa (150 ml)',gramsPerUnit:150},{value:'g',label:'g',gramsPerUnit:1}]}),
  };
  Object.entries(items).forEach(([name,v])=>add(name,v));
  const practical={
    'Huevo hervido':[unit(50,'huevo sin cáscara'),unit(25,'½ huevo','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Huevo pasado por agua':[unit(50,'huevo sin cáscara'),unit(25,'½ huevo','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Huevo poché':[unit(50,'huevo'),unit(25,'½ huevo','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Huevo revuelto':[unit(50,'huevo preparado'),unit(25,'½ huevo','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Huevo frito':[unit(50,'huevo'),unit(25,'½ huevo','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Huevo al horno':[unit(50,'huevo'),unit(25,'½ huevo','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Hamburguesa casera de carne':[unit(100,'hamburguesa'),unit(50,'½ hamburguesa','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Hamburguesa de carne comprada/congelada':[unit(100,'hamburguesa'),unit(50,'½ hamburguesa','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Hamburguesa de pollo':[unit(100,'hamburguesa'),unit(50,'½ hamburguesa','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Hamburguesa de pescado':[unit(100,'hamburguesa'),unit(50,'½ hamburguesa','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Hamburguesa vegetal de soja':[unit(100,'hamburguesa'),unit(50,'½ hamburguesa','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Vacío de cerdo':[unit(180,'porción'),unit(90,'½ porción','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Pan de salvado':[unit(30,'rebanada'),unit(15,'½ rebanada','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Pan lactal integral':[unit(28,'rebanada'),unit(14,'½ rebanada','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Pan de campo':[unit(60,'unidad'),unit(30,'½ unidad','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Pan casero':[unit(50,'unidad'),unit(25,'½ unidad','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Bizcochuelo':[unit(60,'porción'),unit(30,'½ porción','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Papas fritas':[unit(150,'porción'),unit(75,'½ porción','half'),{value:'g',label:'g',gramsPerUnit:1}],
    'Papas fritas congeladas/preparadas':[unit(150,'porción'),unit(75,'½ porción','half'),{value:'g',label:'g',gramsPerUnit:1}],
  }
  Object.entries(practical).forEach(([name,opts])=>{if(foods[name]){foods[name].unitMode='per100g';foods[name].unitLabel='g';foods[name].unitOptions=opts}});
  // Ensure common existing foods have practical half/full unit choices.
  const mergeOpts=(name,opts)=>{if(foods[name])foods[name].unitOptions=opts};
  mergeOpts('Manzana', [{value:'unit',label:'manzana mediana (aprox.)',gramsPerUnit:182},{value:'half',label:'½ manzana',gramsPerUnit:91},{value:'g',label:'g',gramsPerUnit:1}]);
  mergeOpts('Naranja', [{value:'unit',label:'naranja mediana (aprox.)',gramsPerUnit:131},{value:'half',label:'½ naranja',gramsPerUnit:65.5},{value:'g',label:'g',gramsPerUnit:1}]);
  mergeOpts('Pan blanco', [{value:'unit',label:'unidad (aprox.)',gramsPerUnit:30},{value:'half',label:'½ unidad',gramsPerUnit:15},{value:'g',label:'g',gramsPerUnit:1}]);
  mergeOpts('Pan integral', [{value:'unit',label:'unidad/rebanada (aprox.)',gramsPerUnit:30},{value:'half',label:'½ unidad',gramsPerUnit:15},{value:'g',label:'g',gramsPerUnit:1}]);
  // Metadata for category and provenance consumed by UI/audits.
  const cat={
    'Huevo hervido':'huevos','Huevo pasado por agua':'huevos','Huevo poché':'huevos','Huevo revuelto':'huevos','Huevo frito':'huevos','Huevo al horno':'huevos','Omelette':'huevos','Omelette de 2 huevos':'huevos','Omelette con queso':'huevos','Omelette con verduras':'huevos','Tortilla de papa':'huevos','Tortilla de verduras':'huevos',
    'Flan':'postres','Flan con dulce de leche':'postres','Arroz con leche':'postres','Budín de pan':'postres','Gelatina':'postres','Helado':'postres','Ensalada de frutas':'postres','Mousse':'postres','Chocotorta':'postres','Torta':'postres','Cheesecake':'postres','Yogur con fruta':'postres',
  };
  Object.entries(cat).forEach(([name,id])=>{if(foods[name])foods[name].categoryId=id});
  if(typeof window!=='undefined')window.NF_V787_FOOD_UPDATE_VERSION='7.8.9';
})();
