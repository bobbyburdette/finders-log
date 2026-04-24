var currentEntryId=null,currentEntryCategory=null,isNewEntry=true,currentFilter='all',currentSort='newest',currentTags=[],currentSearch='';

function safeArray(value){return Array.isArray(value)?value:[];}
function loadEntries(cat){return safeArray(window.AppStorage.entries.load(cat));}
function saveEntries(cat,arr){window.AppStorage.entries.save(cat,arr);}
function loadAllEntries(){
  return[...loadEntries('pipe').map(function(e){e.category='pipe';return e;}),
    ...loadEntries('cigar').map(function(e){e.category='cigar';return e;}),
    ...loadEntries('whiskey').map(function(e){e.category='whiskey';return e;})]
    .sort(function(a,b){return(b.entry_date||'').localeCompare(a.entry_date||'');});
}
function generateId(){return Date.now().toString(36)+Math.random().toString(36).slice(2);}

var VITOLA_LIST = [
  // Robustos
  'Petit Robusto (4×50)','Robusto (5×50)','Short Robusto (4½×50)','Double Robusto (5½×54)','Gran Robusto (5½×56)',
  // Coronas
  'Petit Corona (4½×42)','Mareva (5×42)','Corona (5½×42)','Corona Gorda (5½×46)','Gran Corona (6×46)',
  // Churchills
  'Churchill (7×47)','Short Churchill (6×50)','Double Corona (7½×49)','Presidente (8×50)',
  // Toros & Gordos
  'Toro (6×50)','Gran Toro (6×54)','Gordo (6×60)','Magnum (6×60)','Gigante (6×60)',
  // Lanceros & Panatelas
  'Lancero (7½×38)','Laguito No.1 (7½×38)','Panatela (6×38)','Slim Panatela (6×34)',
  // Lonsdales
  'Lonsdale (6½×42)','Gran Lonsdale (6½×44)','Prominente (7½×49)',
  // Figurados
  'Torpedo (6½×52)','Belicoso (5½×52)','Pirámide / Pyramid (6×52)','Perfecto (5×48)','Salomon (7×57)','Diadema (8×55+)','Culebra (6×38)',
  // Petites
  'Petit Edmundo (4½×52)','Rothschild (4½×50)','Café (4×46)',
  // Specialty
  'Edmundo (5½×52)','Canonazo (5½×52)','Prominente (7½×49)','Epicure No.1 (5½×46)','Epicure No.2 (5×50)',
  // Generic
  'Toro Gordo (6×60)','Extra Churchill (7×48)','Double Toro (6×64)','Sixty (6×60)'
];

function onVitolInput(){
  var inp=document.getElementById('f-vitola_size'),dd=document.getElementById('dd-vitola');if(!inp||!dd)return;
  var q=inp.value.trim().toLowerCase();
  var m=VITOLA_LIST.filter(function(v){return v.toLowerCase().indexOf(q)>-1;});
  if(!m.length&&q){dd.style.display='none';return;}
  var list=q?m:VITOLA_LIST;
  dd.innerHTML=list.map(function(v){return'<div class="blend-option" onpointerdown="selVitola(\''+v.replace(/'/g,"\\'")+'\')">'+(q?hlMatch(v,q):v)+'</div>';}).join('');
  dd.style.display='block';
}
function selVitola(v){
  var i=document.getElementById('f-vitola_size');if(i)i.value=v;
  var d=document.getElementById('dd-vitola');if(d)d.style.display='none';
}

/* ---- CIGAR BRAND / LINE DATABASE ---- */
var CIGAR_BRAND_DB = {
  'Padron':[
    {line:'1964 Anniversary Natural',country_factory:'Nicaragua (Padron S.A.)',wrapper:'Ecuador Natural',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Natural'},
    {line:'1964 Anniversary Maduro',country_factory:'Nicaragua (Padron S.A.)',wrapper:'Ecuador Natural',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Maduro'},
    {line:'1926 Serie Natural',country_factory:'Nicaragua (Padron S.A.)',wrapper:'Ecuador Natural',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Natural'},
    {line:'1926 Serie Maduro',country_factory:'Nicaragua (Padron S.A.)',wrapper:'Ecuador Natural',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Maduro'},
    {line:'Serie 2000 Natural',country_factory:'Nicaragua (Padron S.A.)',wrapper:'Cameroon',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Natural'},
    {line:'Serie 2000 Maduro',country_factory:'Nicaragua (Padron S.A.)',wrapper:'Cameroon',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Maduro'},
    {line:'Damaso',country_factory:'Nicaragua (Padron S.A.)',wrapper:'Ecuador Connecticut',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Claro'},
    {line:'Family Reserve',country_factory:'Nicaragua (Padron S.A.)',wrapper:'Nicaragua',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado Maduro'},
  ],
  'Arturo Fuente':[
    {line:'Opus X',country_factory:'Dominican Republic (Chateau de la Fuente)',wrapper:'Dominican Republic Rosado',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
    {line:'Gran AniverXario',country_factory:'Dominican Republic (Chateau de la Fuente)',wrapper:'Dominican Republic Rosado',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
    {line:'Hemingway Short Story',country_factory:'Dominican Republic',wrapper:'Cameroon',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
    {line:'Hemingway Best Seller',country_factory:'Dominican Republic',wrapper:'Cameroon',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
    {line:'Hemingway Signature',country_factory:'Dominican Republic',wrapper:'Cameroon',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
    {line:'Don Carlos',country_factory:'Dominican Republic',wrapper:'Cameroon',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
    {line:'Añejo',country_factory:'Dominican Republic',wrapper:'Ecuador Rosado Sumatra',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado Maduro'},
    {line:'Double Chateau Fuente',country_factory:'Dominican Republic',wrapper:'Cameroon',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
  ],
  'Oliva':[
    {line:'Serie V',country_factory:'Nicaragua (Oliva)',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Serie V Maduro',country_factory:'Nicaragua (Oliva)',wrapper:'Nicaragua Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Maduro'},
    {line:'Serie O',country_factory:'Nicaragua (Oliva)',wrapper:'Ecuador Habano Natural',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Natural'},
    {line:'Serie G',country_factory:'Nicaragua (Oliva)',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Master Blends 3',country_factory:'Nicaragua (Oliva)',wrapper:'Ecuador',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Cain F',country_factory:'Nicaragua (Oliva)',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado Maduro'},
  ],
  'Rocky Patel':[
    {line:'Vintage 1999',country_factory:'Honduras',wrapper:'Ecuador Sumatra',binder:'Honduras',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Vintage 1992',country_factory:'Honduras',wrapper:'Ecuador Sumatra',binder:'Honduras',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Fifteenth Anniversary',country_factory:'Honduras',wrapper:'Ecuador Sumatra',binder:'Honduras',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Edge',country_factory:'Honduras',wrapper:'Ecuador Habano',binder:'Honduras',filler:'Nicaragua',wrapper_shade:'Natural'},
    {line:'Sun Grown',country_factory:'Honduras',wrapper:'Ecuador Sun Grown',binder:'Honduras',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Decade',country_factory:'Honduras',wrapper:'Ecuador Sumatra',binder:'Honduras',filler:'Nicaragua',wrapper_shade:'Colorado Maduro'},
    {line:'Burn',country_factory:'Honduras',wrapper:'Ecuador Habano',binder:'Honduras',filler:'Nicaragua',wrapper_shade:'Colorado'},
  ],
  'Liga Privada':[
    {line:'No. 9',country_factory:'Nicaragua (Drew Estate)',wrapper:'Connecticut Broadleaf',binder:'Brazil',filler:'Honduras / Nicaragua',wrapper_shade:'Maduro'},
    {line:'T52',country_factory:'Nicaragua (Drew Estate)',wrapper:'Connecticut Broadleaf',binder:'Brazil',filler:'Honduras / Nicaragua',wrapper_shade:'Maduro'},
    {line:'Unico Serie Feral Flying Pig',country_factory:'Nicaragua (Drew Estate)',wrapper:'Connecticut Broadleaf',binder:'Brazil',filler:'Honduras / Nicaragua',wrapper_shade:'Maduro'},
    {line:'Unico Serie H99',country_factory:'Nicaragua (Drew Estate)',wrapper:'Connecticut Broadleaf',binder:'Brazil',filler:'Honduras / Nicaragua',wrapper_shade:'Maduro'},
  ],
  'Davidoff':[
    {line:'Winston Churchill The Original',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic / Peru',wrapper_shade:'Natural'},
    {line:'Winston Churchill The Statesman',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic / Peru',wrapper_shade:'Natural'},
    {line:'Signature Series',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
    {line:'Millennium Blend',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
    {line:'Aniversario',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
    {line:'Club Cigar',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Claro'},
  ],
  'My Father':[
    {line:'Le Bijou 1922',country_factory:'Nicaragua (My Father Cigars)',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'No. 1',country_factory:'Nicaragua (My Father Cigars)',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Flor de Las Antillas',country_factory:'Nicaragua (My Father Cigars)',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'El Centurion',country_factory:'Nicaragua (My Father Cigars)',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
  ],
  'Perdomo':[
    {line:'Reserve 10th Anniversary Sungrown',country_factory:'Nicaragua (Perdomo)',wrapper:'Nicaragua Sun Grown',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Reserve 10th Anniversary Maduro',country_factory:'Nicaragua (Perdomo)',wrapper:'Nicaragua',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Maduro'},
    {line:'Double Aged 12 Year Vintage Sungrown',country_factory:'Nicaragua (Perdomo)',wrapper:'Nicaragua Habano Sun Grown',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Double Aged 12 Year Vintage Maduro',country_factory:'Nicaragua (Perdomo)',wrapper:'Nicaragua Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Maduro'},
    {line:'Habano',country_factory:'Nicaragua (Perdomo)',wrapper:'Nicaragua Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Champagne',country_factory:'Nicaragua (Perdomo)',wrapper:'Ecuador Connecticut',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Claro'},
  ],
  'Alec Bradley':[
    {line:'Prensado',country_factory:'Honduras (Toraño)',wrapper:'Guatemala',binder:'Honduras',filler:'Honduras / Nicaragua',wrapper_shade:'Colorado'},
    {line:'Tempus',country_factory:'Honduras',wrapper:'Ecuador',binder:'Honduras',filler:'Honduras / Nicaragua',wrapper_shade:'Natural'},
    {line:'Black Market',country_factory:'Honduras',wrapper:'Honduras',binder:'Honduras',filler:'Honduras / Nicaragua',wrapper_shade:'Colorado Maduro'},
    {line:'Magic Toast',country_factory:'Honduras',wrapper:'Ecuador Habano',binder:'Honduras',filler:'Honduras / Nicaragua',wrapper_shade:'Natural'},
  ],
  'Romeo y Julieta':[
    {line:'1875 Natural',country_factory:'Honduras',wrapper:'Ecuador',binder:'Honduras',filler:'Honduras / Nicaragua',wrapper_shade:'Natural'},
    {line:'1875 Maduro',country_factory:'Honduras',wrapper:'Mexico San Andrés',binder:'Honduras',filler:'Honduras / Nicaragua',wrapper_shade:'Maduro'},
    {line:'Reserva Real',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
  ],
  'Macanudo':[
    {line:'Café',country_factory:'Dominican Republic',wrapper:'Connecticut Shade',binder:'Mexico',filler:'Dominican Republic / Mexico',wrapper_shade:'Claro'},
    {line:'Hyde Park',country_factory:'Dominican Republic',wrapper:'Connecticut Shade',binder:'Mexico',filler:'Dominican Republic / Mexico',wrapper_shade:'Claro'},
    {line:'Inspirado',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
    {line:'Cru Royale',country_factory:'Dominican Republic',wrapper:'Ecuador Habano',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
  ],
  'Cohiba':[
    {line:'Blue',country_factory:'Dominican Republic',wrapper:'Connecticut Shade',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Claro'},
    {line:'Spectre',country_factory:'Dominican Republic',wrapper:'Ecuador Habano',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
    {line:'Macassar',country_factory:'Dominican Republic',wrapper:'Indonesia',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado Maduro'},
  ],
  'CAO':[
    {line:'Flathead',country_factory:'Honduras',wrapper:'Cameroon',binder:'Honduras',filler:'Nicaragua / Honduras / Dominican Republic',wrapper_shade:'Natural'},
    {line:'Cameroon',country_factory:'Honduras',wrapper:'Cameroon',binder:'Honduras',filler:'Honduras',wrapper_shade:'Natural'},
    {line:'Amazon Basin',country_factory:'Nicaragua',wrapper:'Brazil Amazon',binder:'Brazil',filler:'Nicaragua',wrapper_shade:'Colorado Maduro'},
    {line:'Consigliere',country_factory:'Nicaragua',wrapper:'Nicaragua',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Maduro'},
  ],
  'Ashton':[
    {line:'Classic',country_factory:'Dominican Republic',wrapper:'Connecticut Shade',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Claro'},
    {line:'Cabinet Selection',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
    {line:'VSG',country_factory:'Dominican Republic',wrapper:'Ecuador Habano',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
    {line:'Symmetry',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
    {line:'ESG',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
  ],
  'Montecristo':[
    {line:'White Series',country_factory:'Dominican Republic',wrapper:'Connecticut Shade',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Claro'},
    {line:'Classic',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
    {line:'Platinum',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
    {line:'Eagle',country_factory:'Dominican Republic',wrapper:'Dominican Republic',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
  ],
  'Illusione':[
    {line:'~eccJ~',country_factory:'Nicaragua',wrapper:'Nicaragua Corojo',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Rothchildes',country_factory:'Nicaragua',wrapper:'Nicaragua Corojo',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Epernay',country_factory:'Nicaragua',wrapper:'Ecuador Connecticut',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Claro'},
    {line:'Ultra',country_factory:'Nicaragua',wrapper:'Nicaragua Corojo',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
  ],
  'Tatuaje':[
    {line:'Black Label',country_factory:'Nicaragua',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Brown Label',country_factory:'Nicaragua',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Natural'},
    {line:'Havana VI',country_factory:'Nicaragua',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Fausto',country_factory:'Nicaragua',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
  ],
  'Crowned Heads':[
    {line:'Four Kicks',country_factory:'Nicaragua',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Jericho Hill',country_factory:'Nicaragua',wrapper:'Connecticut Broadleaf',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Maduro'},
    {line:'Headley Grange',country_factory:'Nicaragua',wrapper:'Connecticut Broadleaf',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Maduro'},
    {line:'Las Maravillas',country_factory:'Nicaragua',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
  ],
  'Plasencia':[
    {line:'Alma del Campo',country_factory:'Nicaragua',wrapper:'Ecuador Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Natural'},
    {line:'Alma Fuerte',country_factory:'Nicaragua',wrapper:'Nicaragua Habano',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
    {line:'Cosecha 149',country_factory:'Nicaragua',wrapper:'Nicaragua',binder:'Nicaragua',filler:'Nicaragua',wrapper_shade:'Colorado'},
  ],
  'Punch':[
    {line:'Rare Corojo',country_factory:'Honduras',wrapper:'Ecuador Habano Corojo',binder:'Honduras',filler:'Honduras / Nicaragua',wrapper_shade:'Colorado'},
    {line:'Grand Cru',country_factory:'Honduras',wrapper:'Ecuador',binder:'Honduras',filler:'Honduras',wrapper_shade:'Natural'},
  ],
  'H. Upmann':[
    {line:'1844 Reserve',country_factory:'Dominican Republic',wrapper:'Ecuador',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
    {line:'Vintage Cameroon',country_factory:'Dominican Republic',wrapper:'Cameroon',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Natural'},
    {line:'Herman Game Changer',country_factory:'Dominican Republic',wrapper:'Ecuador Habano',binder:'Dominican Republic',filler:'Dominican Republic',wrapper_shade:'Colorado'},
  ],
};

/* ---- CIGAR BRAND / LINE AUTOCOMPLETE ---- */
function onCigarBrandInput(){
  var inp=document.getElementById('f-brand'),dd=document.getElementById('dd-cigar-brand');if(!inp||!dd)return;
  var q=inp.value.trim().toLowerCase();
  var brands=Object.keys(CIGAR_BRAND_DB);
  var m=brands.filter(function(b){return q&&b.toLowerCase().indexOf(q)>-1;});
  if(!m.length){dd.style.display='none';return;}
  dd.innerHTML=m.slice(0,8).map(function(b){return'<div class="blend-option" onpointerdown="selCigarBrand(\''+b.replace(/'/g,"\\'")+'\')"  >'+hlMatch(b,q)+'</div>';}).join('');
  dd.style.display='block';
}
function selCigarBrand(v){
  var i=document.getElementById('f-brand');if(i)i.value=v;
  var d=document.getElementById('dd-cigar-brand');if(d)d.style.display='none';
  var li=document.getElementById('f-line_name');if(li)li.value='';
  onCigarLineInput();
}
function onCigarLineInput(){
  var brandEl=document.getElementById('f-brand');
  var brand=brandEl?brandEl.value.trim():'';
  var inp=document.getElementById('f-line_name'),dd=document.getElementById('dd-cigar-line');if(!inp||!dd)return;
  var q=inp.value.trim().toLowerCase();
  var lines=CIGAR_BRAND_DB[brand]?CIGAR_BRAND_DB[brand].map(function(l){return l.line;}):[];
  if(!lines.length){dd.style.display='none';return;}
  var m=q?lines.filter(function(l){return l.toLowerCase().indexOf(q)>-1;}):lines;
  if(!m.length){dd.style.display='none';return;}
  dd.innerHTML=m.slice(0,10).map(function(l){return'<div class="blend-option" onpointerdown="selCigarLine(\''+l.replace(/'/g,"\\'")+'\')"  >'+(q?hlMatch(l,q):l)+'</div>';}).join('');
  dd.style.display='block';
}
function selCigarLine(v){
  var brandEl=document.getElementById('f-brand');
  var brand=brandEl?brandEl.value.trim():'';
  var inp=document.getElementById('f-line_name');if(inp)inp.value=v;
  var d=document.getElementById('dd-cigar-line');if(d)d.style.display='none';
  if(CIGAR_BRAND_DB[brand]){
    var found=CIGAR_BRAND_DB[brand].find(function(l){return l.line===v;});
    if(found){
      var sf=function(id,val){var el=document.getElementById('f-'+id);if(el&&val)el.value=val;};
      sf('country_factory',found.country_factory);
      sf('wrapper',found.wrapper);
      sf('binder',found.binder);
      sf('filler',found.filler);
      if(found.wrapper_shade)setPillVal('wrapper_shade_type',found.wrapper_shade);
    }
  }
}

var BRAND_BLEND_DB = {
  'Peterson': [
    {blend:'Nightcap',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Perique']},
    {blend:'Early Morning Pipe',style:'English',cut:'Ribbon',components:['Virginias','Latakia']},
    {blend:'Irish Flake',style:'Virginia',cut:'Flake',components:['Virginias','Burley']},
    {blend:'De Luxe Navy Rolls',style:'Virginia',cut:'Plug',components:['Virginias']},
    {blend:'Sherlock Holmes',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Orientals']},
    {blend:'Old Dublin',style:'English',cut:'Ribbon',components:['Virginias','Latakia']},
    {blend:'Sunset Breeze',style:'Aromatic',cut:'Ribbon',components:['Virginias','Cavendish']},
    {blend:"Connoiseur's Choice",style:'English',cut:'Ribbon',components:['Virginias','Latakia','Orientals']}
  ],
  'Dunhill': [
    {blend:'My Mixture 965',style:'Balkan',cut:'Ribbon',components:['Virginias','Latakia','Orientals']},
    {blend:'Nightcap',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Perique']},
    {blend:'Early Morning Pipe',style:'English',cut:'Ribbon',components:['Virginias','Latakia']},
    {blend:'London Mixture',style:'English',cut:'Ribbon',components:['Virginias','Latakia']},
    {blend:'Elizabethan Mixture',style:'Virginia',cut:'Ribbon',components:['Virginias']},
    {blend:'Royal Yacht',style:'Virginia',cut:'Ribbon',components:['Virginias']},
    {blend:'Flake',style:'Virginia',cut:'Flake',components:['Virginias']},
    {blend:'Durbar',style:'Balkan',cut:'Ribbon',components:['Virginias','Latakia','Orientals']}
  ],
  'Cornell & Diehl': [
    {blend:'Autumn Evening',style:'Aromatic',cut:'Ribbon',components:['Virginias','Cavendish','Burley']},
    {blend:'Billy Budd',style:'Burley',cut:'Ribbon',components:['Burley','Virginias']},
    {blend:'Burley Flake',style:'Burley',cut:'Flake',components:['Burley','Virginias']},
    {blend:'Pegasus',style:'Balkan',cut:'Ribbon',components:['Virginias','Latakia','Orientals','Perique']},
    {blend:'Plum Pudding',style:'English',cut:'Flake',components:['Virginias','Latakia','Perique']},
    {blend:'Haunted Bookshop',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Orientals']},
    {blend:'Star of the East',style:'Oriental',cut:'Ribbon',components:['Orientals','Virginias','Latakia']},
    {blend:'Pirate Kake',style:'VaPer',cut:'Flake',components:['Virginias','Perique']}
  ],
  'Samuel Gawith': [
    {blend:'Full Virginia Flake',style:'Virginia',cut:'Flake',components:['Virginias']},
    {blend:'Best Brown Flake',style:'Virginia',cut:'Flake',components:['Virginias']},
    {blend:'Grousemoor',style:'Aromatic',cut:'Ribbon',components:['Virginias','Latakia']},
    {blend:'Squadron Leader',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Burley']},
    {blend:'Skiff Mixture',style:'English',cut:'Ribbon',components:['Virginias','Latakia']},
    {blend:"Bob's Chocolate Flake",style:'Aromatic',cut:'Flake',components:['Virginias','Cavendish']},
    {blend:'Commonwealth Mixture',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Burley']}
  ],
  'G.L. Pease': [
    {blend:'Cairo',style:'Balkan',cut:'Ribbon',components:['Virginias','Latakia','Orientals']},
    {blend:'Caravan',style:'Balkan',cut:'Ribbon',components:['Virginias','Latakia','Orientals']},
    {blend:"Haddo's Delight",style:'VaPer',cut:'Broken Flake',components:['Virginias','Perique']},
    {blend:'Odyssey',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Orientals','Perique']},
    {blend:'Quiet Nights',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Orientals']},
    {blend:'Gaslight',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Burley']},
    {blend:'Windjammer',style:'Virginia',cut:'Ribbon',components:['Virginias','Perique']}
  ],
  'MacBaren': [
    {blend:'HH Burley Flake',style:'Burley',cut:'Flake',components:['Burley','Virginias']},
    {blend:'HH Old Dark Fired',style:'Burley',cut:'Flake',components:['Burley','Dark Fired Kentucky']},
    {blend:'HH Scottish Blend',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Orientals']},
    {blend:'Navy Flake',style:'Virginia',cut:'Flake',components:['Virginias']},
    {blend:'Virginia Flake',style:'Virginia',cut:'Flake',components:['Virginias']},
    {blend:'Plumcake',style:'Aromatic',cut:'Ribbon',components:['Virginias','Burley','Cavendish']},
    {blend:'7 Seas Regular',style:'Aromatic',cut:'Ribbon',components:['Virginias','Burley','Cavendish']}
  ],
  'Esoterica': [
    {blend:'Margate',style:'Virginia',cut:'Ribbon',components:['Virginias']},
    {blend:'Pembroke',style:'VaPer',cut:'Ribbon',components:['Virginias','Perique']},
    {blend:'Penzance',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Orientals']},
    {blend:'Tilbury',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Orientals']}
  ],
  "Rattray's": [
    {blend:"Hal o' the Wynd",style:'Virginia',cut:'Flake',components:['Virginias']},
    {blend:'Old Gowrie',style:'VaPer',cut:'Flake',components:['Virginias','Perique']},
    {blend:'Black Mallory',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Orientals']},
    {blend:'Marlin Flake',style:'VaPer',cut:'Flake',components:['Virginias','Perique']}
  ],
  'Solani': [
    {blend:'Aged Burley Flake',style:'Burley',cut:'Flake',components:['Burley','Virginias']},
    {blend:'Virginia/Perique',style:'VaPer',cut:'Flake',components:['Virginias','Perique']},
    {blend:'221B',style:'English',cut:'Ribbon',components:['Virginias','Latakia','Orientals']}
  ],
  'Stanwell': [
    {blend:'Melange',style:'Aromatic',cut:'Ribbon',components:['Virginias','Burley','Cavendish']},
    {blend:'De Luxe',style:'Aromatic',cut:'Ribbon',components:['Virginias','Cavendish']},
    {blend:'Trio',style:'Aromatic',cut:'Ribbon',components:['Burley','Virginias','Cavendish']}
  ],
  'Captain Black': [
    {blend:'Regular',style:'Aromatic',cut:'Ribbon',components:['Burley','Cavendish','Virginias']},
    {blend:'Gold',style:'Aromatic',cut:'Ribbon',components:['Burley','Cavendish','Virginias']},
    {blend:'Dark',style:'Aromatic',cut:'Ribbon',components:['Burley','Cavendish']},
    {blend:'White',style:'Aromatic',cut:'Ribbon',components:['Cavendish','Virginias']}
  ],
  'Lane': [
    {blend:'1-Q',style:'Aromatic',cut:'Ribbon',components:['Cavendish','Virginias','Burley']},
    {blend:'BCA',style:'Aromatic',cut:'Ribbon',components:['Cavendish','Burley']},
    {blend:'RLP-6',style:'Aromatic',cut:'Ribbon',components:['Cavendish','Virginias']}
  ],
  'Orlik': [
    {blend:'Golden Sliced',style:'Virginia',cut:'Flake',components:['Virginias']},
    {blend:'Dark Strong Kentucky',style:'Burley',cut:'Flake',components:['Dark Fired Kentucky','Burley']},
    {blend:'Fine Virginia',style:'Virginia',cut:'Ribbon',components:['Virginias']}
  ],
  'Custom': [
    {blend:'Custom Blend',style:'Other',cut:'Ribbon',components:[]}
  ]
};

function migrate(){
  try{
    var old=window.AppStorage.legacy.loadPipeJournal();
    if(!old.length||loadEntries('pipe').length)return;
    var cm={'Virginias':'Virginias','Perique':'Perique','Latakia':'Latakia','Orientals':'Orientals','Burley':'Burley','Cavendish':'Cavendish','Dark Fired Kentucky':'Dark Fired Kentucky','Cigar Leaf':'Cigar Leaf'};
    var migrated=old.map(function(e){
      return{id:e.id||generateId(),category:'pipe',created_at:new Date().toISOString(),updated_at:new Date().toISOString(),
        entry_date:e.date||'',time_of_day:e.timeOfDay||'',blend_name:e.blendName||'',brand:'',brand_blender:'',blend_type:'',
        tobacco_components:(e.components||[]).filter(function(c){return cm[c];}),
        other_component:e.otherComponent||'',cut_type:e.cut||'',pipe_used:e.pipeUsed||'',lighter_used:'',
        tin_notes:e.tinNotes||'',tin_notes_score:null,year_blended:e.yearBlended||'',nicotine_strength:'',prep_notes:'',setting:'',
        notes:e.firstThird||e.secondThird||e.thirdThird?[e.firstThird,e.secondThird,e.thirdThird].filter(Boolean).join('\n\n'):'',
        first_third_notes:e.firstThird||'',first_third_score:null,
        middle_third_notes:e.secondThird||'',middle_third_score:null,
        final_third_notes:e.thirdThird||'',final_third_score:null,
        mechanics_score:null,room_note_score:null,room_note_intensity:null,room_note_notes:'',
        first_intensity:null,middle_intensity:null,final_intensity:null,
        burn_relights:false,burn_bite:false,burn_gurgling:false,burn_wentout:false,burn_dottle:false,
        satisfaction_score:null,would_smoke_again:'',cellar_worthy:'',overall_thoughts:e.overall||'',location:'',tags:[],
        final_score:e.rating?e.rating*2:null,use_final_override:!!e.rating,suggested_score:null};
    });
    saveEntries('pipe',migrated);
  }catch(err){console.error('Migration error',err);}
}

function showView(id){
  ['view-list','view-picker','view-form','view-detail','view-collection'].forEach(function(v){
    document.getElementById(v).classList.toggle('hidden',v!==id);
  });
  window.scrollTo(0,0);
}
function setBottomNav(tab){
  document.getElementById('bn-journal').classList.toggle('active',tab==='journal');
  document.getElementById('bn-collection').classList.toggle('active',tab==='collection');
}
function showList(){
  showView('view-list');
  setBottomNav('journal');
  try{
    renderList();
  }catch(err){
    console.error('renderList failed',err);
    var el=document.getElementById('entries-list');
    if(el){
      el.innerHTML='<div class="list-empty"><p>Something went wrong loading your journal.<br>Please refresh and try again.</p></div>';
    }
  }
}
function showPicker(){isNewEntry=true;showView('view-picker');}
function showForm(cat){
  currentEntryCategory=cat;
  document.getElementById('entry-category').value=cat;
  if(isNewEntry){
    currentEntryId=null;document.getElementById('entry-id').value='';
    currentTags=[];
  }
  var icon=document.getElementById('form-cat-icon');
  var imgs={pipe:'pipe.png',cigar:'cigar.png',whiskey:'whiskey.png'};
  if(icon&&imgs[cat]){icon.src=imgs[cat];icon.style.display='inline';icon.style.width='48px';icon.style.height='48px';}
  var titleEl=document.getElementById('form-title');
  if(titleEl){titleEl.textContent=(isNewEntry?'New '+catLabel(cat)+' Session':'Edit '+catLabel(cat)+' Session');}
  buildForm(cat);
  showView('view-form');
  if(!isNewEntry&&currentEntryId){
    var entry=loadEntries(cat).find(function(e){return e.id===currentEntryId;});
    if(entry){currentTags=entry.tags||[];fillForm(cat,entry);}
  }else{
    var d=document.getElementById('f-entry_date');
    if(d)d.value=new Date().toISOString().split('T')[0];
  }
}
function showDetail(id,cat){
  currentEntryId=id;currentEntryCategory=cat;
  renderDetail(id,cat);
  showView('view-detail');
  var e=loadEntries(cat).find(function(x){return x.id===id;});
  var btn=document.getElementById('detail-fav-btn');
  if(btn&&e){btn.classList.toggle('is-fav',!!e.is_favorite);}
}
function backFromForm(){if(isNewEntry)showPicker();else showList();}

function catLabel(cat){return{pipe:'Pipe',cigar:'Cigar',whiskey:'Spirits'}[cat]||cat;}
function catEmoji(cat){var imgs={pipe:'pipe.png',cigar:'cigar.png',whiskey:'whiskey.png'};return imgs[cat]?'<img src="'+imgs[cat]+'" style="width:52px;height:52px;object-fit:contain;vertical-align:middle">':'';}
function catEmojiText(cat){return{pipe:'🪈',cigar:'🚬',whiskey:'🥃'}[cat]||'';}
function entryName(e){
  if(e.category==='pipe')return e.blend_name||'Unnamed Blend';
  if(e.category==='cigar')return[e.brand,e.line_name].filter(Boolean).join(' ')||'Unnamed Cigar';
  if(e.category==='whiskey')return e.name||'Unnamed Pour';
  return'Untitled';
}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');}
function formatDate(d){if(!d)return'';var p=d.split('-');return['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(p[1])-1]+' '+parseInt(p[2])+', '+p[0];}
function capitalize(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}

function setFilter(cat){
  currentFilter=cat;
  document.querySelectorAll('.filter-tab').forEach(function(t){t.classList.toggle('active',t.dataset.cat===cat);});
  renderList();
}
function setSort(s){
  currentSort=s;
  document.querySelectorAll('.sort-btn').forEach(function(b){b.classList.toggle('active',b.dataset.sort===s);});
  renderList();
}

/* ---- WANT TO TRY ---- */
function loadWantToTry(){return window.AppStorage.wantToTry.load();}
function saveWantToTry(arr){window.AppStorage.wantToTry.save(arr);}
function addWantToTry(cat){
  var inp=document.getElementById('col-wtt-'+cat+'-input');
  if(!inp||!inp.value.trim())return;
  var arr=loadWantToTry();
  arr.push({id:generateId(),category:cat,name:inp.value.trim(),added_at:new Date().toISOString()});
  saveWantToTry(arr);
  inp.value='';
  renderWantToTry();
}
function removeWantToTry(id){
  saveWantToTry(loadWantToTry().filter(function(x){return x.id!==id;}));
  renderWantToTry();
}
function renderWantToTry(){
  ['pipe','cigar','whiskey'].forEach(function(cat){
    var el=document.getElementById('col-wtt-'+cat+'-list');if(!el)return;
    var items=loadWantToTry().filter(function(x){return x.category===cat;});
    if(!items.length){el.innerHTML='<div class="wtt-empty">Nothing added yet.</div>';return;}
    el.innerHTML=items.map(function(x){
      return'<div class="wtt-item">'
        +'<div class="wtt-item-info"><div class="wtt-item-name">'+esc(x.name)+'</div></div>'
        +'<button class="collection-item-del" onclick="removeWantToTry(\''+x.id+'\')">&#215;</button>'
        +'</div>';
    }).join('');
  });
}

/* ---- FAVORITES ---- */
function toggleFavorite(id,cat,e){
  if(e)e.stopPropagation();
  if(!id||!cat)return;
  var entries=loadEntries(cat);
  var idx=entries.findIndex(function(x){return x.id===id;});
  if(idx<0)return;
  entries[idx].is_favorite=!entries[idx].is_favorite;
  saveEntries(cat,entries);
  renderList();
  var btn=document.getElementById('detail-fav-btn');
  if(btn){btn.classList.toggle('is-fav',entries[idx].is_favorite);}
}

function renderList(){
  var el=document.getElementById('entries-list');
  var entries=loadAllEntries();
  // category filter
  if(currentFilter!=='all'){
    entries=entries.filter(function(e){return e.category===currentFilter;});
  }
  if(currentSearch){
    var q=currentSearch.toLowerCase();
    entries=entries.filter(function(e){
      var haystack=[
        entryName(e),
        e.brand,
        e.line_name,
        e.name,
        e.blend_name,
        e.notes,
        e.overall_thoughts,
        e.quick_notes,
        e.location,
        e.pairing,
        e.tags&&e.tags.join(' ')
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.indexOf(q)>-1;
    });
  }
  // sort / secondary filter
  if(currentSort==='faves'){
    entries=entries.filter(function(e){return e.is_favorite;});
  } else if(currentSort==='newest'){
    entries=entries.sort(function(a,b){return(b.entry_date||'').localeCompare(a.entry_date||'');});
  } else if(currentSort==='oldest'){
    entries=entries.sort(function(a,b){return(a.entry_date||'').localeCompare(b.entry_date||'');});
  } else if(currentSort==='az'){
    entries=entries.sort(function(a,b){return entryName(a).toLowerCase().localeCompare(entryName(b).toLowerCase());});
  } else if(currentSort==='top'){
    entries=entries.sort(function(a,b){return(displayScore(b)||0)-(displayScore(a)||0);});
  }
  if(!entries.length){
    if(currentSearch){
      el.innerHTML='<div class="list-empty"><p>No entries match that search yet.</p></div>';
    } else if(currentSort==='faves'){
      el.innerHTML='<div class="list-empty"><p>Nothing favorited yet.<br>Tap ♥ on any entry to save it here.</p></div>';
    } else {
      el.innerHTML='<div class="list-empty"><p>Nothing logged yet.<br>Your first entry is one smoke away.</p><button class="empty-btn" onclick="showPicker()">+ Log Your First Session</button></div>';
    }
    return;
  }
  el.innerHTML=entries.map(function(e){
    var score=displayScore(e),scoreStr=score!==null?score.toFixed(1):'—';
    var isFav=!!e.is_favorite;
    var dateLine=(isFav?'<span style="color:#e05570;font-size:13px;margin-right:4px;">♥</span><span style="color:var(--border3);font-size:11px;margin-right:6px;">|</span>':'')+(e.entry_date?formatDate(e.entry_date):'No date')+(e.time_of_day?' &middot; '+e.time_of_day:'');
    return'<div class="entry-card" onclick="showDetail(\''+e.id+'\',\''+e.category+'\')">'
      +'<div class="entry-card-main">'
      +'<span class="entry-badge">'+catEmoji(e.category)+'</span>'
      +'<div class="entry-card-text">'
      +'<div class="entry-blend">'+esc(entryName(e))+'</div>'
      +'<div class="entry-meta">'+dateLine+'</div>'
      +'</div>'
      +'</div>'
      +'<div style="text-align:right">'
      +'<div class="entry-score">'+scoreStr+'<span class="score-denom"> /10</span></div>'
      +'</div></div>';
  }).join('');
}

function normalizedWeightedScore(fields){
  var valid=fields.filter(function(f){return f[0]&&parseInt(f[0])>0;});
  if(!valid.length)return null;
  var totalW=valid.reduce(function(s,f){return s+f[1];},0);
  return Math.round(valid.reduce(function(s,f){return s+(parseInt(f[0])*f[1]/totalW);},0)*10)/10;
}
function calcScore(cat,e){
  if(cat==='pipe')return normalizedWeightedScore([[e.flavor_score,0.28],[e.enjoy_score,0.22],[e.performance_score,0.18],[e.room_note_score,0.12],[e.mechanics_score,0.10],[e.tin_notes_score,0.06],[e.strength_score,0.04]]);
  if(cat==='cigar')return normalizedWeightedScore([[e.flavor_score,0.30],[e.construction_score,0.15],[e.draw_score,0.15],[e.burn_score,0.15],[e.aroma_score,0.10],[e.strength_score,0.05],[e.enjoy_score,0.10]]);
  if(cat==='whiskey')return normalizedWeightedScore([[e.nose_score,0.15],[e.palate_score,0.30],[e.finish_score,0.20],[e.balance_score,0.20],[e.value_score,0.05],[e.enjoy_score,0.10]]);
  return null;
}
function displayScore(e){
  if(e.use_final_override&&e.final_score)return parseFloat(e.final_score);
  return(e.suggested_score!==null&&e.suggested_score!==undefined)?e.suggested_score:null;
}
function updateSuggestedScore(){
  var catEl=document.getElementById('entry-category');if(!catEl)return;
  var cat=catEl.value;if(!cat)return;
  var gi=function(id){var el=document.getElementById('f-'+id);return el&&el.value?parseInt(el.value):null;};
  var score=null;
  if(cat==='pipe')score=normalizedWeightedScore([[gi('flavor_score'),0.28],[gi('enjoy_score'),0.22],[gi('performance_score'),0.18],[gi('room_note_score'),0.12],[gi('mechanics_score'),0.10],[gi('tin_notes_score'),0.06],[gi('strength_score'),0.04]]);
  else if(cat==='cigar')score=normalizedWeightedScore([[gi('flavor_score'),0.30],[gi('construction_score'),0.15],[gi('draw_score'),0.15],[gi('burn_score'),0.15],[gi('aroma_score'),0.10],[gi('strength_score'),0.05],[gi('enjoy_score'),0.10]]);
  else if(cat==='whiskey')score=normalizedWeightedScore([[gi('nose_score'),0.15],[gi('palate_score'),0.30],[gi('finish_score'),0.20],[gi('balance_score'),0.20],[gi('value_score'),0.05],[gi('enjoy_score'),0.10]]);
  var el=document.getElementById('suggested-score-display');
  var box=document.getElementById('suggested-score-box');
  if(el){el.textContent=score!==null?score.toFixed(1)+' / 10':'—';}
  if(box){box.classList.toggle('empty',score===null);}
}

function fText(id,label,placeholder,required,type){
  type=type||'text';required=required||false;placeholder=placeholder||'';
  return'<div class="field"><label>'+label+(required?'<span class="req"> *</span>':'')+'</label><input type="'+type+'" id="f-'+id+'" placeholder="'+placeholder+'" autocomplete="off"></div>';
}
function fTA(id,label,placeholder,minH){
  var mh=minH?'style="min-height:'+minH+'px"':'';
  return'<div class="field"><label>'+label+'</label><textarea id="f-'+id+'" placeholder="'+(placeholder||'')+'" '+mh+'></textarea></div>';
}
function fScore(id,label){
  var btns='';for(var i=1;i<=10;i++)btns+='<button type="button" class="score-btn flame-score-btn" data-val="'+i+'" onclick="toggleScore(\''+id+'\','+i+')" title="'+i+'/10">&#x1F525;</button>';
  return'<div class="field"><label>'+label+'</label><div class="score-row" id="sr-'+id+'">'+btns+'</div><input type="hidden" id="f-'+id+'"></div>';
}
function fPill(id,label,opts){
  var pills=opts.map(function(o){return'<button type="button" class="pill-opt" data-val="'+o.replace(/"/g,'&quot;')+'" onclick="togglePill(\''+id+'\',\''+o.replace(/'/g,"\\'")+'\')"  >'+o+'</button>';}).join('');
  return'<div class="field"><label>'+label+'</label><div class="pill-options" id="po-'+id+'">'+pills+'</div><input type="hidden" id="f-'+id+'"></div>';
}
function fYNM(id,label){
  return'<div class="field"><label>'+label+'</label><div class="ynm-row" id="ynm-'+id+'">'
    +'<button type="button" class="ynm-btn ynm-y" onclick="toggleYNM(\''+id+'\',\'yes\')">Yes</button>'
    +'<button type="button" class="ynm-btn ynm-m" onclick="toggleYNM(\''+id+'\',\'maybe\')">Maybe</button>'
    +'<button type="button" class="ynm-btn ynm-n" onclick="toggleYNM(\''+id+'\',\'no\')">No</button>'
    +'</div><input type="hidden" id="f-'+id+'"></div>';
}
function fCheck(items){
  return'<div class="components-grid">'+items.map(function(it){
    return'<div class="component-check"><input type="checkbox" id="f-'+it[0]+'" value="'+it[1]+'"><label for="f-'+it[0]+'">'+it[2]+'</label></div>';
  }).join('')+'</div>';
}
function fSec(title,content,extraClass){
  var cls='form-section'+(extraClass?' '+extraClass:'');
  return'<div class="'+cls+'"><div class="section-title">'+title+'</div>'+content+'</div>';
}
function fTags(){
  return'<div class="field"><label>Tags</label><div id="tag-chips" class="tag-chips"></div><input type="text" id="tag-input" placeholder="Type a tag, press Enter..." autocomplete="off" onkeydown="handleTagInput(event)"></div>';
}
function fSugScore(){
  return'<div class="suggested-score-box empty" id="suggested-score-box"><div class="suggested-score-label">Overall Score</div><div class="suggested-score-val" id="suggested-score-display">&mdash;</div><div class="suggested-score-note">Rate the categories above to calculate your score</div></div>';
}

/* ---- COLLECTION ---- */
function loadCollection(){
  try{
    var c=window.AppStorage.collection.load()||{};
    if(!c.pipes)c.pipes=[];if(!c.lighters)c.lighters=[];if(!c.tins)c.tins=[];
    if(!c.cigars)c.cigars=[];if(!c.humidors)c.humidors=[];if(!c.bottles)c.bottles=[];
    // migrate old string pipes to objects
    if(c.pipes.length && typeof c.pipes[0]==='string'){
      c.pipes=c.pipes.map(function(name,i){
        return{id:'pipe_legacy_'+i,name:name,maker:'',shape:'',material:'',finish:'',stem:'',status:'active',dateAcquired:'',source:'',notes:''};
      });
      window.AppStorage.collection.save(c);
    }
    // migrate old string bottles to objects
    if(c.bottles.length && typeof c.bottles[0]==='string'){
      c.bottles=c.bottles.map(function(name,i){
        return{id:'bottle_legacy_'+i,name:name,distillery:'',spiritType:'',proof:'',age:'',status:'Sealed',notes:''};
      });
      window.AppStorage.collection.save(c);
    }
    // migrate old string cigars to objects
    if(c.cigars.length && typeof c.cigars[0]==='string'){
      c.cigars=c.cigars.map(function(name,i){
        return{id:'cigar_legacy_'+i,brand:name,line:'',vitola:'',quantity:1,format:'',dateAdded:'',wrapperShade:'',strength:'',status:'Resting',notes:''};
      });
      window.AppStorage.collection.save(c);
    }
    // migrate old string tins to objects
    if(c.tins.length && typeof c.tins[0]==='string'){
      c.tins=c.tins.map(function(name,i){
        return{id:'tin_legacy_'+i,name:name,brand:'',style:'',cut:'',tinDate:'',quantity:1,storageFormat:'',dateAcquired:'',source:'',nicotine:'',roomNote:'',status:'Sealed',discontinued:false,notes:''};
      });
      window.AppStorage.collection.save(c);
    }
    return c;
  }catch(e){return{pipes:[],lighters:[],tins:[],cigars:[],humidors:[],bottles:[]};}
}
function saveCollection(col){window.AppStorage.collection.save(col);}
function addCollectionItem(type){
  var inp=document.getElementById('col-'+type+'-input');
  var val=inp.value.trim();if(!val)return;
  var col=loadCollection();
  var key=type+'s';
  if(col[key].indexOf(val)===-1)col[key].push(val);
  saveCollection(col);inp.value='';renderCollection();
}
function removeCollectionItem(type,val){
  var col=loadCollection();col[type+'s']=col[type+'s'].filter(function(x){return x!==val;});
  saveCollection(col);renderCollection();
}
/* ---- PIPE DETAIL MODAL ---- */
var PM_MATERIAL=['Briar','Meerschaum','Corn Cob','Clay','Other'];
var PM_FINISH=['Smooth','Sandblast','Rusticated','Carved','Natural','Other'];
var PM_STEM=['Vulcanite','Acrylic','Cumberland','Horn','Bamboo','Other'];
var PM_STATUS=['Active','Resting','Display','Retired'];
var PM_SHAPE=['Billiard','Bent Billiard','Dublin','Apple','Brandy','Pot','Bulldog','Canadian','Churchwarden','Cavalier','Poker','Rhodesian','Liverpool','Lovat','Oom Paul','Prince','Egg','Pear','Volcano','Zulu','Calabash','Freehand','Other'];
var PM_SHAPE_ICON_LIST=['Billiard','Bent Billiard','Dublin','Bulldog','Calabash'];
var PM_SHAPE_SVG={
  'Billiard':'<svg viewBox="0 0 64 46" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="3" width="24" height="30" rx="5"/><rect x="7" y="31" width="18" height="7" rx="3"/><rect x="28" y="27" width="24" height="10"/><polygon points="52,27 62,30 62,36 52,37"/></svg>',
  'Bent Billiard':'<svg viewBox="0 0 50 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="22" height="27" rx="5"/><rect x="6" y="28" width="16" height="7" rx="3"/><path d="M25,24 L33,24 Q42,24 42,33 L42,52 L34,52 L34,35 Q34,32 31,32 L25,32Z"/><polygon points="34,50 42,50 44,58 36,58"/></svg>',
  'Dublin':'<svg viewBox="0 0 64 46" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5,33 L27,33 L30,7 C30,3 27,1 24,1 L8,1 C5,1 2,3 2,7Z"/><rect x="7" y="31" width="16" height="7" rx="3"/><rect x="27" y="27" width="25" height="10"/><polygon points="52,27 62,30 62,36 52,37"/></svg>',
  'Bulldog':'<svg viewBox="0 0 66 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2,33 L28,33 L25,8 C25,4 23,2 20,2 L12,2 C9,2 7,4 7,8Z"/><rect x="5" y="31" width="20" height="8" rx="3"/><path d="M28,27 L42,21 L56,27 L56,37 L42,43 L28,37Z"/><polygon points="56,27 64,30 64,34 56,37"/></svg>',
  'Calabash':'<svg viewBox="0 0 54 60" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="28" rx="16" ry="22"/><path d="M34,22 L41,22 Q50,22 50,31 L50,54 L42,54 L42,33 Q42,30 39,30 L34,30Z"/><polygon points="42,52 50,52 52,58 44,58"/></svg>'
};
function renderShapeGrid(containerId,selectedVal){
  var el=document.getElementById(containerId);if(!el)return;
  var html='<div class="pm-shape-grid">';
  PM_SHAPE_ICON_LIST.forEach(function(shape){
    var sel=selectedVal===shape;
    html+='<div class="pm-shape-card'+(sel?' sel':'')+'" data-val="'+shape+'" onclick="selectShapeCard(this)">'+PM_SHAPE_SVG[shape]+'<span class="pm-shape-name">'+shape+'</span></div>';
  });
  html+='</div>';
  var rest=PM_SHAPE.filter(function(s){return PM_SHAPE_ICON_LIST.indexOf(s)===-1;});
  if(rest.length){
    html+='<div class="pm-pill-row" id="pm-shape-extra" style="margin-top:8px">';
    rest.forEach(function(s){html+='<button type="button" class="pm-pill'+(selectedVal===s?' sel':'')+'" data-val="'+s+'" onclick="selectShapeExtraPill(this)">'+s+'</button>';});
    html+='</div>';
  }
  el.innerHTML=html;
}
function selectShapeCard(card){
  document.querySelectorAll('#pm-shape-container .pm-shape-card').forEach(function(c){c.classList.remove('sel');});
  document.querySelectorAll('#pm-shape-extra .pm-pill').forEach(function(p){p.classList.remove('sel');});
  card.classList.add('sel');
}
function selectShapeExtraPill(btn){
  document.querySelectorAll('#pm-shape-container .pm-shape-card').forEach(function(c){c.classList.remove('sel');});
  document.querySelectorAll('#pm-shape-extra .pm-pill').forEach(function(p){p.classList.remove('sel');});
  btn.classList.add('sel');
}
function getShapeVal(){
  var card=document.querySelector('#pm-shape-container .pm-shape-card.sel');
  if(card)return card.dataset.val;
  var pill=document.querySelector('#pm-shape-extra .pm-pill.sel');
  return pill?pill.dataset.val:'';
}
function renderPmPills(containerId,options){
  var el=document.getElementById(containerId);if(!el)return;
  el.innerHTML=options.map(function(opt){
    return'<button type="button" class="pm-pill" data-val="'+opt+'" onclick="togglePmPill(this,\''+containerId+'\')">'+opt+'</button>';
  }).join('');
}
function togglePmPill(btn,containerId){
  document.querySelectorAll('#'+containerId+' .pm-pill').forEach(function(b){b.classList.remove('sel');});
  btn.classList.add('sel');
}
function getPmPillVal(containerId){
  var sel=document.querySelector('#'+containerId+' .pm-pill.sel');
  return sel?sel.dataset.val:'';
}
function setPmPillVal(containerId,val){
  document.querySelectorAll('#'+containerId+' .pm-pill').forEach(function(b){
    b.classList.toggle('sel',b.dataset.val===val);
  });
}
function openAddPipeModal(){
  document.getElementById('pipe-modal-title').textContent='Add a Pipe';
  document.getElementById('pm-id').value='';
  document.getElementById('pm-name').value='';
  document.getElementById('pm-maker').value='';
  document.getElementById('pm-date').value='';
  document.getElementById('pm-source').value='';
  document.getElementById('pm-notes').value='';
  renderPmPills('pm-shape-pills',PM_SHAPE);
  renderPmPills('pm-material-pills',PM_MATERIAL);
  renderPmPills('pm-finish-pills',PM_FINISH);
  renderPmPills('pm-stem-pills',PM_STEM);
  renderPmPills('pm-status-pills',PM_STATUS);
  setPmPillVal('pm-status-pills','Active');
  document.getElementById('pipe-modal-overlay').classList.add('open');
  document.getElementById('pipe-modal').classList.add('open');
  setTimeout(function(){document.getElementById('pm-name').focus();},380);
}
function editPipe(id){
  var col=loadCollection();
  var pipe=col.pipes.find(function(p){return p.id===id;});if(!pipe)return;
  document.getElementById('pipe-modal-title').textContent='Edit Pipe';
  document.getElementById('pm-id').value=pipe.id;
  document.getElementById('pm-name').value=pipe.name||'';
  document.getElementById('pm-maker').value=pipe.maker||'';
  document.getElementById('pm-date').value=pipe.dateAcquired||'';
  document.getElementById('pm-source').value=pipe.source||'';
  document.getElementById('pm-notes').value=pipe.notes||'';
  renderPmPills('pm-shape-pills',PM_SHAPE);
  renderPmPills('pm-material-pills',PM_MATERIAL);
  renderPmPills('pm-finish-pills',PM_FINISH);
  renderPmPills('pm-stem-pills',PM_STEM);
  renderPmPills('pm-status-pills',PM_STATUS);
  var st=pipe.status||'active';
  setPmPillVal('pm-shape-pills',pipe.shape||'');
  setPmPillVal('pm-material-pills',pipe.material||'');
  setPmPillVal('pm-finish-pills',pipe.finish||'');
  setPmPillVal('pm-stem-pills',pipe.stem||'');
  setPmPillVal('pm-status-pills',st.charAt(0).toUpperCase()+st.slice(1));
  document.getElementById('pipe-modal-overlay').classList.add('open');
  document.getElementById('pipe-modal').classList.add('open');
}
function closePipeModal(){
  document.getElementById('pipe-modal-overlay').classList.remove('open');
  document.getElementById('pipe-modal').classList.remove('open');
}
function savePipeEntry(){
  var name=document.getElementById('pm-name').value.trim();
  if(!name){document.getElementById('pm-name').focus();return;}
  var id=document.getElementById('pm-id').value;
  var col=loadCollection();
  var pipe={
    id:id||('pipe_'+Date.now()),
    name:name,
    maker:document.getElementById('pm-maker').value.trim(),
    shape:getPmPillVal('pm-shape-pills'),
    material:getPmPillVal('pm-material-pills'),
    finish:getPmPillVal('pm-finish-pills'),
    stem:getPmPillVal('pm-stem-pills'),
    status:(getPmPillVal('pm-status-pills')||'Active').toLowerCase(),
    dateAcquired:document.getElementById('pm-date').value,
    source:document.getElementById('pm-source').value.trim(),
    notes:document.getElementById('pm-notes').value.trim()
  };
  if(id){col.pipes=col.pipes.map(function(p){return p.id===id?pipe:p;});}
  else{col.pipes.push(pipe);}
  saveCollection(col);
  closePipeModal();
  renderCollection();
}
function deletePipe(id){
  if(!confirm('Remove this pipe from your collection?'))return;
  var col=loadCollection();
  col.pipes=col.pipes.filter(function(p){return p.id!==id;});
  saveCollection(col);renderCollection();
}

/* ---- TOBACCO (TIN) DETAIL MODAL ---- */
var TM_STYLE=['Virginia','VaPer','English','Balkan','Aromatic','Burley','Oriental','Lakeland','Other'];
var TM_CUT=['Ribbon','Flake','Broken Flake','Coin','Plug','Ready Rubbed','Shag','Crumble Cake','Other'];
var TM_STORAGE=['Sealed Tin','Mason Jar','Vacuum Sealed','Bulk Bag','Other'];
var TM_NICOTINE=['Mild','Medium','Full'];
var TM_ROOMNOTE=['Friendly','Neutral','Unpleasant'];
var TM_STATUS=['Sealed','Aging','In Rotation','Finished'];

function renderTmPills(containerId,options){
  var el=document.getElementById(containerId);if(!el)return;
  el.innerHTML=options.map(function(opt){
    return'<button type="button" class="pm-pill" data-val="'+opt+'" onclick="toggleTmPill(this,\''+containerId+'\')">'+opt+'</button>';
  }).join('');
}
function toggleTmPill(btn,containerId){
  document.querySelectorAll('#'+containerId+' .pm-pill').forEach(function(b){b.classList.remove('sel');});
  btn.classList.add('sel');
}
function getTmPillVal(containerId){
  var sel=document.querySelector('#'+containerId+' .pm-pill.sel');
  return sel?sel.dataset.val:'';
}
function setTmPillVal(containerId,val){
  document.querySelectorAll('#'+containerId+' .pm-pill').forEach(function(b){
    b.classList.toggle('sel',b.dataset.val===val);
  });
}
function adjustTinQty(delta){
  var el=document.getElementById('tm-qty');if(!el)return;
  var v=parseInt(el.value)||0;
  el.value=Math.max(0,v+delta);
}
function resetTinModal(){
  renderTmPills('tm-style-pills',TM_STYLE);
  renderTmPills('tm-cut-pills',TM_CUT);
  renderTmPills('tm-storage-pills',TM_STORAGE);
  renderTmPills('tm-nicotine-pills',TM_NICOTINE);
  renderTmPills('tm-roomnote-pills',TM_ROOMNOTE);
  renderTmPills('tm-status-pills',TM_STATUS);
}
function openAddTinModal(){
  document.getElementById('tin-modal-title').textContent='Add a Tobacco';
  document.getElementById('tm-id').value='';
  document.getElementById('tm-name').value='';
  document.getElementById('tm-brand').value='';
  document.getElementById('tm-tindate').value='';
  document.getElementById('tm-qty').value='1';
  document.getElementById('tm-date').value='';
  document.getElementById('tm-source').value='';
  document.getElementById('tm-notes').value='';
  document.getElementById('tm-discontinued').checked=false;
  resetTinModal();
  setTmPillVal('tm-status-pills','Sealed');
  document.getElementById('tin-modal-overlay').classList.add('open');
  document.getElementById('tin-modal').classList.add('open');
  setTimeout(function(){document.getElementById('tm-name').focus();},380);
}
function editTin(id){
  var col=loadCollection();
  var tin=col.tins.find(function(t){return t.id===id;});if(!tin)return;
  document.getElementById('tin-modal-title').textContent='Edit Tobacco';
  document.getElementById('tm-id').value=tin.id;
  document.getElementById('tm-name').value=tin.name||'';
  document.getElementById('tm-brand').value=tin.brand||'';
  document.getElementById('tm-tindate').value=tin.tinDate||'';
  document.getElementById('tm-qty').value=tin.quantity||1;
  document.getElementById('tm-date').value=tin.dateAcquired||'';
  document.getElementById('tm-source').value=tin.source||'';
  document.getElementById('tm-notes').value=tin.notes||'';
  document.getElementById('tm-discontinued').checked=!!tin.discontinued;
  resetTinModal();
  setTmPillVal('tm-style-pills',tin.style||'');
  setTmPillVal('tm-cut-pills',tin.cut||'');
  setTmPillVal('tm-storage-pills',tin.storageFormat||'');
  setTmPillVal('tm-nicotine-pills',tin.nicotine||'');
  setTmPillVal('tm-roomnote-pills',tin.roomNote||'');
  setTmPillVal('tm-status-pills',tin.status||'');
  document.getElementById('tin-modal-overlay').classList.add('open');
  document.getElementById('tin-modal').classList.add('open');
}
function closeTinModal(){
  document.getElementById('tin-modal-overlay').classList.remove('open');
  document.getElementById('tin-modal').classList.remove('open');
}
function saveTinEntry(){
  var name=document.getElementById('tm-name').value.trim();
  if(!name){document.getElementById('tm-name').focus();return;}
  var id=document.getElementById('tm-id').value;
  var col=loadCollection();
  var tin={
    id:id||('tin_'+Date.now()),
    name:name,
    brand:document.getElementById('tm-brand').value.trim(),
    style:getTmPillVal('tm-style-pills'),
    cut:getTmPillVal('tm-cut-pills'),
    tinDate:document.getElementById('tm-tindate').value.trim(),
    quantity:parseInt(document.getElementById('tm-qty').value)||1,
    storageFormat:getTmPillVal('tm-storage-pills'),
    dateAcquired:document.getElementById('tm-date').value,
    source:document.getElementById('tm-source').value.trim(),
    nicotine:getTmPillVal('tm-nicotine-pills'),
    roomNote:getTmPillVal('tm-roomnote-pills'),
    status:getTmPillVal('tm-status-pills'),
    discontinued:document.getElementById('tm-discontinued').checked,
    notes:document.getElementById('tm-notes').value.trim()
  };
  if(id){col.tins=col.tins.map(function(t){return t.id===id?tin:t;});}
  else{col.tins.push(tin);}
  saveCollection(col);
  closeTinModal();
  renderCollection();
}
function deleteTin(id){
  if(!confirm('Remove this tobacco from your cellar?'))return;
  var col=loadCollection();
  col.tins=col.tins.filter(function(t){return t.id!==id;});
  saveCollection(col);renderCollection();
}
/* ---- BAR / BOTTLE MODAL ---- */
var BM_TYPE=['Bourbon','Rye','Scotch','Irish','Japanese','Tennessee','Other'];
var BM_STATUS=['Sealed','Open','Getting Low','Empty'];

function renderBmPills(containerId,options){
  var el=document.getElementById(containerId);if(!el)return;
  el.innerHTML=options.map(function(opt){
    return'<button type="button" class="pm-pill" data-val="'+opt+'" onclick="toggleBmPill(this,\''+containerId+'\')">'+opt+'</button>';
  }).join('');
}
function toggleBmPill(btn,containerId){
  document.querySelectorAll('#'+containerId+' .pm-pill').forEach(function(b){b.classList.remove('sel');});
  btn.classList.add('sel');
}
function getBmPillVal(containerId){
  var sel=document.querySelector('#'+containerId+' .pm-pill.sel');
  return sel?sel.dataset.val:'';
}
function setBmPillVal(containerId,val){
  document.querySelectorAll('#'+containerId+' .pm-pill').forEach(function(b){
    b.classList.toggle('sel',b.dataset.val===val);
  });
}
function onBmNameInput(){
  var inp=document.getElementById('bm-name'),dd=document.getElementById('dd-bm-name');if(!inp||!dd)return;
  var q=inp.value.trim().toLowerCase();
  var names=Object.keys(WHISKEY_DB);
  var m=names.filter(function(n){return q&&n.toLowerCase().indexOf(q)>-1;});
  if(!m.length){dd.style.display='none';return;}
  dd.innerHTML=m.slice(0,10).map(function(n){return'<div class="blend-option" onpointerdown="selBmName(\''+n.replace(/'/g,"\\'")+'\')">'+hlMatch(n,q)+'</div>';}).join('');
  dd.style.display='block';
}
function selBmName(v){
  var i=document.getElementById('bm-name');if(i)i.value=v;
  var d=document.getElementById('dd-bm-name');if(d)d.style.display='none';
  var found=WHISKEY_DB[v];
  if(found){
    var sf=function(id,val){var el=document.getElementById('bm-'+id);if(el&&val)el.value=val;};
    sf('distillery',found.distillery_producer);
    sf('proof',found.proof_abv);
    sf('age',found.age_statement);
    if(found.spirit_type)setBmPillVal('bm-type-pills',found.spirit_type);
  }
}
function resetBottleModal(){
  renderBmPills('bm-type-pills',BM_TYPE);
  renderBmPills('bm-status-pills',BM_STATUS);
}
function openAddBottleModal(){
  document.getElementById('bottle-modal-title').textContent='Add a Bottle';
  document.getElementById('bm-id').value='';
  document.getElementById('bm-name').value='';
  document.getElementById('bm-distillery').value='';
  document.getElementById('bm-proof').value='';
  document.getElementById('bm-age').value='';
  document.getElementById('bm-notes').value='';
  document.getElementById('dd-bm-name').style.display='none';
  resetBottleModal();
  setBmPillVal('bm-status-pills','Sealed');
  document.getElementById('bottle-modal-overlay').classList.add('open');
  document.getElementById('bottle-modal').classList.add('open');
  setTimeout(function(){document.getElementById('bm-name').focus();},380);
}
function editBottle(id){
  var col=loadCollection();
  var b=col.bottles.find(function(x){return x.id===id;});if(!b)return;
  document.getElementById('bottle-modal-title').textContent='Edit Bottle';
  document.getElementById('bm-id').value=b.id;
  document.getElementById('bm-name').value=b.name||'';
  document.getElementById('bm-distillery').value=b.distillery||'';
  document.getElementById('bm-proof').value=b.proof||'';
  document.getElementById('bm-age').value=b.age||'';
  document.getElementById('bm-notes').value=b.notes||'';
  document.getElementById('dd-bm-name').style.display='none';
  resetBottleModal();
  setBmPillVal('bm-type-pills',b.spiritType||'');
  setBmPillVal('bm-status-pills',b.status||'');
  document.getElementById('bottle-modal-overlay').classList.add('open');
  document.getElementById('bottle-modal').classList.add('open');
}
function closeBottleModal(){
  document.getElementById('bottle-modal-overlay').classList.remove('open');
  document.getElementById('bottle-modal').classList.remove('open');
}
function saveBottleEntry(){
  var name=document.getElementById('bm-name').value.trim();
  if(!name){document.getElementById('bm-name').focus();return;}
  var id=document.getElementById('bm-id').value;
  var col=loadCollection();
  var bottle={
    id:id||('bottle_'+Date.now()),
    name:name,
    distillery:document.getElementById('bm-distillery').value.trim(),
    spiritType:getBmPillVal('bm-type-pills'),
    proof:document.getElementById('bm-proof').value.trim(),
    age:document.getElementById('bm-age').value.trim(),
    status:getBmPillVal('bm-status-pills'),
    notes:document.getElementById('bm-notes').value.trim()
  };
  if(id){col.bottles=col.bottles.map(function(x){return x.id===id?bottle:x;});}
  else{col.bottles.push(bottle);}
  saveCollection(col);
  closeBottleModal();
  renderCollection();
}
function deleteBottle(id){
  if(!confirm('Remove this bottle from your bar?'))return;
  var col=loadCollection();
  col.bottles=col.bottles.filter(function(x){return x.id!==id;});
  saveCollection(col);renderCollection();
}
function renderBottlesList(){
  var col=loadCollection();
  var el=document.getElementById('col-bottles-list');if(!el)return;
  if(!col.bottles.length){el.innerHTML='<div style="color:var(--border3);font-style:italic;padding:8px 0">The bar is dry. Time to restock.</div>';return;}
  el.innerHTML=col.bottles.map(function(b){
    var details=[b.distillery,b.spiritType,b.proof].filter(Boolean).join(' · ');
    var stClass={'Sealed':'active','Open':'active','Getting Low':'resting','Empty':'retired'}[b.status]||'resting';
    var badge=b.status?'<span class="pipe-card-status '+stClass+'">'+b.status+'</span>':'';
    var age=b.age?'<div class="tin-card-qty">'+esc(b.age)+'</div>':'';
    var safeId=b.id.replace(/'/g,"\\'");
    return'<div class="pipe-card">'
      +'<div class="pipe-card-row">'
      +'<div class="pipe-card-info">'
      +'<div class="pipe-card-name">'+esc(b.name)+'</div>'
      +(details?'<div class="pipe-card-details">'+esc(details)+'</div>':'')
      +age
      +(badge?'<div style="margin-top:5px">'+badge+'</div>':'')
      +'</div>'
      +'<div class="pipe-card-actions">'
      +'<button class="pipe-card-edit" onclick="editBottle(\''+safeId+'\')" title="Edit">&#9998;</button>'
      +'<button class="pipe-card-del" onclick="deleteBottle(\''+safeId+'\')" title="Remove">&times;</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  }).join('');
}
/* ---- CIGAR HUMIDOR MODAL ---- */
var CM_VITOLA=['Robusto','Toro','Churchill','Corona','Lancero','Petite Corona','Gordo','Belicoso','Torpedo','Perfecto','Figurado','Panatela','Other'];
var CM_FORMAT=['Singles','Box','Bundle','Sampler'];
var CM_WRAPPER=['Claro','Natural','Colorado','Colorado Maduro','Maduro','Oscuro'];
var CM_STRENGTH=['Mild','Medium','Full'];
var CM_STATUS=['Resting','Ready to Smoke','Aging','Gone'];

function renderCmPills(containerId,options){
  var el=document.getElementById(containerId);if(!el)return;
  el.innerHTML=options.map(function(opt){
    return'<button type="button" class="pm-pill" data-val="'+opt+'" onclick="toggleCmPill(this,\''+containerId+'\')">'+opt+'</button>';
  }).join('');
}
function toggleCmPill(btn,containerId){
  document.querySelectorAll('#'+containerId+' .pm-pill').forEach(function(b){b.classList.remove('sel');});
  btn.classList.add('sel');
}
function getCmPillVal(containerId){
  var sel=document.querySelector('#'+containerId+' .pm-pill.sel');
  return sel?sel.dataset.val:'';
}
function setCmPillVal(containerId,val){
  document.querySelectorAll('#'+containerId+' .pm-pill').forEach(function(b){
    b.classList.toggle('sel',b.dataset.val===val);
  });
}
function adjustCigarQty(delta){
  var el=document.getElementById('cm-qty');if(!el)return;
  el.value=Math.max(0,(parseInt(el.value)||0)+delta);
}
function onCmBrandInput(){
  var inp=document.getElementById('cm-brand'),dd=document.getElementById('dd-cm-brand');if(!inp||!dd)return;
  var q=inp.value.trim().toLowerCase();
  var brands=Object.keys(CIGAR_BRAND_DB);
  var m=brands.filter(function(b){return q&&b.toLowerCase().indexOf(q)>-1;});
  if(!m.length){dd.style.display='none';return;}
  dd.innerHTML=m.slice(0,8).map(function(b){return'<div class="blend-option" onpointerdown="selCmBrand(\''+b.replace(/'/g,"\\'")+'\')">'+hlMatch(b,q)+'</div>';}).join('');
  dd.style.display='block';
}
function selCmBrand(v){
  var i=document.getElementById('cm-brand');if(i)i.value=v;
  var d=document.getElementById('dd-cm-brand');if(d)d.style.display='none';
  var li=document.getElementById('cm-line');if(li)li.value='';
  onCmLineInput();
}
function onCmLineInput(){
  var brand=document.getElementById('cm-brand');brand=brand?brand.value.trim():'';
  var inp=document.getElementById('cm-line'),dd=document.getElementById('dd-cm-line');if(!inp||!dd)return;
  var q=inp.value.trim().toLowerCase();
  var lines=CIGAR_BRAND_DB[brand]?CIGAR_BRAND_DB[brand].map(function(l){return l.line;}):[];
  if(!lines.length){dd.style.display='none';return;}
  var m=q?lines.filter(function(l){return l.toLowerCase().indexOf(q)>-1;}):lines;
  if(!m.length){dd.style.display='none';return;}
  dd.innerHTML=m.slice(0,10).map(function(l){return'<div class="blend-option" onpointerdown="selCmLine(\''+l.replace(/'/g,"\\'")+'\')">'+hlMatch(l,q)+'</div>';}).join('');
  dd.style.display='block';
}
function selCmLine(v){
  var brand=document.getElementById('cm-brand');brand=brand?brand.value.trim():'';
  var inp=document.getElementById('cm-line');if(inp)inp.value=v;
  var d=document.getElementById('dd-cm-line');if(d)d.style.display='none';
  // autofill wrapper shade from database
  if(CIGAR_BRAND_DB[brand]){
    var found=CIGAR_BRAND_DB[brand].find(function(l){return l.line===v;});
    if(found&&found.wrapper_shade)setCmPillVal('cm-wrapper-pills',found.wrapper_shade);
  }
}
function resetCigarModal(){
  renderCmPills('cm-vitola-pills',CM_VITOLA);
  renderCmPills('cm-format-pills',CM_FORMAT);
  renderCmPills('cm-wrapper-pills',CM_WRAPPER);
  renderCmPills('cm-strength-pills',CM_STRENGTH);
  renderCmPills('cm-status-pills',CM_STATUS);
}
function openAddCigarModal(){
  document.getElementById('cigar-modal-title').textContent='Add a Cigar';
  document.getElementById('cm-id').value='';
  document.getElementById('cm-brand').value='';
  document.getElementById('cm-line').value='';
  document.getElementById('cm-qty').value='1';
  document.getElementById('cm-date').value='';
  document.getElementById('cm-notes').value='';
  document.getElementById('dd-cm-brand').style.display='none';
  document.getElementById('dd-cm-line').style.display='none';
  resetCigarModal();
  setCmPillVal('cm-status-pills','Resting');
  document.getElementById('cigar-modal-overlay').classList.add('open');
  document.getElementById('cigar-modal').classList.add('open');
  setTimeout(function(){document.getElementById('cm-brand').focus();},380);
}
function editCigar(id){
  var col=loadCollection();
  var c=col.cigars.find(function(x){return x.id===id;});if(!c)return;
  document.getElementById('cigar-modal-title').textContent='Edit Cigar';
  document.getElementById('cm-id').value=c.id;
  document.getElementById('cm-brand').value=c.brand||'';
  document.getElementById('cm-line').value=c.line||'';
  document.getElementById('cm-qty').value=c.quantity||1;
  document.getElementById('cm-date').value=c.dateAdded||'';
  document.getElementById('cm-notes').value=c.notes||'';
  document.getElementById('dd-cm-brand').style.display='none';
  document.getElementById('dd-cm-line').style.display='none';
  resetCigarModal();
  setCmPillVal('cm-vitola-pills',c.vitola||'');
  setCmPillVal('cm-format-pills',c.format||'');
  setCmPillVal('cm-wrapper-pills',c.wrapperShade||'');
  setCmPillVal('cm-strength-pills',c.strength||'');
  setCmPillVal('cm-status-pills',c.status||'');
  document.getElementById('cigar-modal-overlay').classList.add('open');
  document.getElementById('cigar-modal').classList.add('open');
}
function closeCigarModal(){
  document.getElementById('cigar-modal-overlay').classList.remove('open');
  document.getElementById('cigar-modal').classList.remove('open');
}
function saveCigarEntry(){
  var brand=document.getElementById('cm-brand').value.trim();
  if(!brand){document.getElementById('cm-brand').focus();return;}
  var id=document.getElementById('cm-id').value;
  var col=loadCollection();
  var cigar={
    id:id||('cigar_'+Date.now()),
    brand:brand,
    line:document.getElementById('cm-line').value.trim(),
    vitola:getCmPillVal('cm-vitola-pills'),
    quantity:parseInt(document.getElementById('cm-qty').value)||1,
    format:getCmPillVal('cm-format-pills'),
    dateAdded:document.getElementById('cm-date').value,
    wrapperShade:getCmPillVal('cm-wrapper-pills'),
    strength:getCmPillVal('cm-strength-pills'),
    status:getCmPillVal('cm-status-pills'),
    notes:document.getElementById('cm-notes').value.trim()
  };
  if(id){col.cigars=col.cigars.map(function(x){return x.id===id?cigar:x;});}
  else{col.cigars.push(cigar);}
  saveCollection(col);
  closeCigarModal();
  renderCollection();
}
function deleteCigar(id){
  if(!confirm('Remove this cigar from your humidor?'))return;
  var col=loadCollection();
  col.cigars=col.cigars.filter(function(x){return x.id!==id;});
  saveCollection(col);renderCollection();
}
function renderCigarsList(){
  var col=loadCollection();
  var el=document.getElementById('col-cigars-list');if(!el)return;
  if(!col.cigars.length){el.innerHTML='<div style="color:var(--border3);font-style:italic;padding:8px 0">Nothing in the humidor yet.</div>';return;}
  el.innerHTML=col.cigars.map(function(c){
    var title=(c.brand&&c.line)?c.brand+' '+c.line:c.brand||c.line||'Unknown';
    var details=[c.vitola,c.wrapperShade,c.strength?c.strength+' body':null].filter(Boolean).join(' · ');
    var st=c.status||'';
    var stClass={'Resting':'resting','Ready to Smoke':'active','Aging':'resting','Gone':'retired'}[st]||'resting';
    var badge=st?'<span class="pipe-card-status '+stClass+'">'+st+'</span>':'';
    var qty=c.quantity>1?'<div class="tin-card-qty">'+c.quantity+' sticks'+(c.format?' · '+c.format:'')+'</div>':'';
    var safeId=c.id.replace(/'/g,"\\'");
    return'<div class="pipe-card">'
      +'<div class="pipe-card-row">'
      +'<div class="pipe-card-info">'
      +'<div class="pipe-card-name">'+esc(title)+'</div>'
      +(details?'<div class="pipe-card-details">'+esc(details)+'</div>':'')
      +qty
      +(badge?'<div style="margin-top:5px">'+badge+'</div>':'')
      +'</div>'
      +'<div class="pipe-card-actions">'
      +'<button class="pipe-card-edit" onclick="editCigar(\''+safeId+'\')" title="Edit">&#9998;</button>'
      +'<button class="pipe-card-del" onclick="deleteCigar(\''+safeId+'\')" title="Remove">&times;</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  }).join('');
}
function renderTinsList(){
  var col=loadCollection();
  var el=document.getElementById('col-tins-list');if(!el)return;
  if(!col.tins.length){el.innerHTML='<div style="color:var(--border3);font-style:italic;padding:8px 0">Your cellar is empty. Time to stock up.</div>';return;}
  el.innerHTML=col.tins.map(function(tin){
    var details=[tin.brand,tin.style,tin.cut].filter(Boolean).join(' · ');
    var st=tin.status||'';
    var stClass={'Sealed':'active','Aging':'resting','In Rotation':'active','Finished':'retired'}[st]||'resting';
    var badge=st?'<span class="pipe-card-status '+stClass+'">'+st+'</span>':'';
    var discBadge=tin.discontinued?'<span class="tin-card-disc">Discontinued</span>':'';
    var qty=tin.quantity>1?'<div class="tin-card-qty">'+tin.quantity+' on hand'+(tin.tinDate?' · Tin date: '+tin.tinDate:'')+'</div>':(tin.tinDate?'<div class="tin-card-qty">Tin date: '+tin.tinDate+'</div>':'');
    var safeId=tin.id.replace(/'/g,"\\'");
    return'<div class="pipe-card">'
      +'<div class="pipe-card-row">'
      +'<div class="pipe-card-info">'
      +'<div class="pipe-card-name">'+esc(tin.name)+(discBadge)+'</div>'
      +(details?'<div class="pipe-card-details">'+esc(details)+'</div>':'')
      +qty
      +(badge?'<div style="margin-top:5px">'+badge+'</div>':'')
      +'</div>'
      +'<div class="pipe-card-actions">'
      +'<button class="pipe-card-edit" onclick="editTin(\''+safeId+'\')" title="Edit">&#9998;</button>'
      +'<button class="pipe-card-del" onclick="deleteTin(\''+safeId+'\')" title="Remove">&times;</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  }).join('');
}
function renderColList(items,type,listId,emptyMsg){
  var el=document.getElementById(listId);if(!el)return;
  if(!items.length){el.innerHTML='<div style="color:var(--border3);font-style:italic;padding:8px 0">'+emptyMsg+'</div>';return;}
  el.innerHTML=items.map(function(item){
    return'<div class="collection-item"><span class="collection-item-name">'+esc(item)+'</span><button class="collection-item-del" onclick="removeCollectionItem(\''+type+'\',\''+item.replace(/'/g,"\\'")+'\')">&times;</button></div>';
  }).join('');
}
function renderPipesList(){
  var col=loadCollection();
  var el=document.getElementById('col-pipes-list');if(!el)return;
  if(!col.pipes.length){el.innerHTML='<div style="color:var(--border3);font-style:italic;padding:8px 0">No pipes in your rack yet.</div>';return;}
  el.innerHTML=col.pipes.map(function(pipe){
    var details=[pipe.maker,pipe.shape,pipe.material].filter(Boolean).join(' · ');
    var st=(pipe.status||'active').toLowerCase();
    var stLabel=st.charAt(0).toUpperCase()+st.slice(1);
    var badge=st!=='active'?'<div><span class="pipe-card-status '+st+'">'+stLabel+'</span></div>':'';
    var safeId=pipe.id.replace(/'/g,"\\'");
    return'<div class="pipe-card">'
      +'<div class="pipe-card-row">'
      +'<div class="pipe-card-info">'
      +'<div class="pipe-card-name">'+esc(pipe.name)+'</div>'
      +(details?'<div class="pipe-card-details">'+esc(details)+'</div>':'')
      +badge
      +'</div>'
      +'<div class="pipe-card-actions">'
      +'<button class="pipe-card-edit" onclick="editPipe(\''+safeId+'\')" title="Edit">&#9998;</button>'
      +'<button class="pipe-card-del" onclick="deletePipe(\''+safeId+'\')" title="Remove">&times;</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  }).join('');
}
function renderCollection(){
  var col=loadCollection();
  renderTinsList();
  renderPipesList();
  renderColList(col.lighters,'lighter','col-lighters-list','No lighters added yet');
  renderCigarsList();
  renderBottlesList();
  renderWantToTry();
}
function showColTab(tab){
  document.querySelectorAll('.col-tab').forEach(function(t){t.classList.toggle('active',t.dataset.tab===tab);});
  document.querySelectorAll('.col-panel').forEach(function(p){p.classList.toggle('active',p.id==='col-panel-'+tab);});
}
function showCollection(){
  showView('view-collection');
  setBottomNav('collection');
  try{
    renderCollection();
  }catch(err){
    console.error('renderCollection failed',err);
  }
}

/* ---- FLAME RATING ---- */
function setFlame(id,val){
  var h=document.getElementById('f-'+id);if(!h)return;
  var cur=parseInt(h.value)||0,nv=cur===val?0:val;
  h.value=nv;
  var wrap=document.getElementById('fr-'+id);
  if(wrap)wrap.querySelectorAll('.flame-btn').forEach(function(b){b.classList.toggle('lit',parseInt(b.dataset.val)<=nv);});
  updateSuggestedScore();
}
function flameRating(id){
  var btns='';for(var i=1;i<=5;i++)btns+='<button type="button" class="flame-btn" data-val="'+i+'" onclick="setFlame(\''+id+'\','+i+')">&#x1F525;</button>';
  return'<div class="flame-rating" id="fr-'+id+'">'+btns+'</div><input type="hidden" id="f-'+id+'">';
}
function flameRating10(id){
  var btns='';for(var i=1;i<=10;i++)btns+='<button type="button" class="flame-btn" data-val="'+i+'" onclick="setFlame(\''+id+'\','+i+')">&#x1F525;</button>';
  return'<div class="flame-rating" id="fr-'+id+'">'+btns+'</div><input type="hidden" id="f-'+id+'">';
}
function setFlameVal(id,val){
  var h=document.getElementById('f-'+id);if(!h)return;h.value=val||0;
  var wrap=document.getElementById('fr-'+id);
  if(wrap)wrap.querySelectorAll('.flame-btn').forEach(function(b){b.classList.toggle('lit',parseInt(b.dataset.val)<=(val||0));});
}
function glassRating10(id){
  var btns='';for(var i=1;i<=10;i++)btns+='<button type="button" class="glass-btn" data-val="'+i+'" onclick="setGlass(\''+id+'\','+i+')">&#x1F943;</button>';
  return'<div class="glass-rating" id="gr-'+id+'">'+btns+'</div><input type="hidden" id="f-'+id+'">';
}
function setGlass(id,val){
  var h=document.getElementById('f-'+id);if(!h)return;
  var cur=parseInt(h.value)||0,nv=cur===val?0:val;
  h.value=nv;
  var wrap=document.getElementById('gr-'+id);
  if(wrap)wrap.querySelectorAll('.glass-btn').forEach(function(b){b.classList.toggle('lit',parseInt(b.dataset.val)<=nv);});
  updateSuggestedScore();
}
function setGlassVal(id,val){
  var h=document.getElementById('f-'+id);if(!h)return;h.value=val||0;
  var wrap=document.getElementById('gr-'+id);
  if(wrap)wrap.querySelectorAll('.glass-btn').forEach(function(b){b.classList.toggle('lit',parseInt(b.dataset.val)<=(val||0));});
}

/* ---- THIRDS NOTE INSERTION ---- */
function insertThird(which){
  var labels={first:'\n\u2014 First Third \u2014\n',middle:'\n\u2014 Middle Third \u2014\n',final:'\n\u2014 Final Third \u2014\n'};
  var ta=document.getElementById('f-notes');if(!ta)return;
  var v=ta.value;
  ta.value=(v&&v[v.length-1]!=='\n'?v+'\n':v)+labels[which].trimStart();
  ta.focus();ta.scrollTop=ta.scrollHeight;
}

/* ---- MODE TOGGLE ---- */
var currentPipeMode='quick';
function setPipeMode(mode){
  currentPipeMode=mode;
  document.querySelectorAll('.mode-btn').forEach(function(b){b.classList.toggle('active',b.dataset.mode===mode);});
  document.querySelectorAll('.full-only').forEach(function(el){el.classList.toggle('visible',mode==='full');});
}

/* ---- BRAND / BLEND AUTOCOMPLETE ---- */
function onBrandInput(){
  var inp=document.getElementById('f-brand'),dd=document.getElementById('dd-brand');if(!inp||!dd)return;
  var q=inp.value.trim().toLowerCase();
  var brands=Object.keys(BRAND_BLEND_DB);
  var m=brands.filter(function(b){return q&&b.toLowerCase().indexOf(q)>-1;});
  if(!m.length){dd.style.display='none';return;}
  dd.innerHTML=m.slice(0,8).map(function(b){return'<div class="blend-option" onpointerdown="selBrand(\''+b.replace(/'/g,"\\'")+'\')"  >'+hlMatch(b,q)+'</div>';}).join('');
  dd.style.display='block';
}
function selBrand(v){
  var i=document.getElementById('f-brand');if(i)i.value=v;
  var d=document.getElementById('dd-brand');if(d)d.style.display='none';
  var bar=document.getElementById('save-custom-bar');
  if(bar)bar.classList.toggle('visible',!BRAND_BLEND_DB[v]);
  var bi=document.getElementById('f-blend_name');if(bi)bi.value='';
}
function onBlendNameInput(){
  var brand=document.getElementById('f-brand')?document.getElementById('f-brand').value.trim():'';
  var inp=document.getElementById('f-blend_name'),dd=document.getElementById('blend-dropdown');if(!inp||!dd)return;
  var q=inp.value.trim().toLowerCase();
  var blends=[];
  if(BRAND_BLEND_DB[brand]){blends=BRAND_BLEND_DB[brand].map(function(b){return b.blend;});}
  else{blends=getAllBlends();}
  var m=blends.filter(function(b){return q&&b.toLowerCase().indexOf(q)>-1;});
  if(!m.length){dd.style.display='none';return;}
  dd.innerHTML=m.slice(0,8).map(function(b){return'<div class="blend-option" onpointerdown="selBlendName(\''+b.replace(/'/g,"\\'")+'\')"  >'+hlMatch(b,q)+'</div>';}).join('');
  dd.style.display='block';
}
function selBlendName(v){
  var brandEl=document.getElementById('f-brand');
  var brand=brandEl?brandEl.value.trim():'';
  var inp=document.getElementById('f-blend_name');if(inp)inp.value=v;
  var d=document.getElementById('blend-dropdown');if(d)d.style.display='none';
  if(BRAND_BLEND_DB[brand]){
    var found=BRAND_BLEND_DB[brand].find(function(b){return b.blend===v;});
    if(found){
      var cm={virginia:'Virginias',perique:'Perique',latakia:'Latakia',orientals:'Orientals',burley:'Burley',cavendish:'Cavendish',darkfired:'Dark Fired Kentucky',cigarleaf:'Cigar Leaf'};
      Object.keys(cm).forEach(function(k){var el=document.getElementById('f-tc-'+k);if(el)el.checked=(found.components||[]).indexOf(cm[k])>-1;});
      if(found.style)setPillVal('blend_type',found.style);
      if(found.cut)setPillVal('cut_type',found.cut);
    }
  }
}
function saveCustomBlend(){
  var bar=document.getElementById('save-custom-bar');if(bar)bar.classList.remove('visible');
}

/* ---- PIPE / LIGHTER AUTOCOMPLETE FROM COLLECTION ---- */
function showPipeDD(){
  var inp=document.getElementById('f-pipe_used'),dd=document.getElementById('dd-pipe');if(!inp||!dd)return;
  var col=loadCollection();
  var colPipes=(col.pipes||[]).map(function(p){return typeof p==='string'?p:p.name;});
  var q=inp.value.trim().toLowerCase();
  var allP=[...new Set([...colPipes,...allPipesLegacy()])];
  var m=allP.filter(function(p){return!q||p.toLowerCase().indexOf(q)>-1;});
  if(!m.length){dd.style.display='none';return;}
  dd.innerHTML=m.slice(0,8).map(function(p){return'<div class="blend-option" onpointerdown="selPipe(\''+p.replace(/'/g,"\\'")+'\')" >'+hlMatch(p,q)+'</div>';}).join('');
  dd.style.display='block';
}
function selPipe(v){var i=document.getElementById('f-pipe_used');if(i)i.value=v;var d=document.getElementById('dd-pipe');if(d)d.style.display='none';}
function showLighterDD(){
  var inp=document.getElementById('f-lighter_used'),dd=document.getElementById('dd-lighter');if(!inp||!dd)return;
  var col=loadCollection();
  var colLighters=col.lighters||[];
  var q=inp.value.trim().toLowerCase();
  var m=colLighters.filter(function(l){return!q||l.toLowerCase().indexOf(q)>-1;});
  if(!m.length){dd.style.display='none';return;}
  dd.innerHTML=m.slice(0,8).map(function(l){return'<div class="blend-option" onpointerdown="selLighter(\''+l.replace(/'/g,"\\'")+'\')" >'+hlMatch(l,q)+'</div>';}).join('');
  dd.style.display='block';
}
function selLighter(v){var i=document.getElementById('f-lighter_used');if(i)i.value=v;var d=document.getElementById('dd-lighter');if(d)d.style.display='none';}

/* ---- PIPE FORM BUILDER ---- */
function buildPipeForm(){
  var colHint='<div class="collection-hint">Add pipes in <a onclick="showCollection()">My Collection &#8862;</a></div>';
  var lighterHint='<div class="collection-hint">Add lighters in <a onclick="showCollection()">My Collection &#8862;</a></div>';

  var modeToggle='<div class="mode-toggle">'
    +'<button type="button" class="mode-btn active" data-mode="quick" onclick="setPipeMode(\'quick\')">Quick Entry</button>'
    +'<button type="button" class="mode-btn" data-mode="full" onclick="setPipeMode(\'full\')">Full Entry</button>'
    +'</div>';

  var blendSection=fSec('The Blend',
    '<div class="field"><label>Brand <span class="req">*</span></label><input type="text" id="f-brand" placeholder="e.g. Peterson, Dunhill, Cornell &amp; Diehl" autocomplete="off"><div id="dd-brand" class="ac-dropdown"></div></div>'
    +'<div id="save-custom-bar" class="save-custom-bar"><span>Save as custom blend?</span><div><button type="button" class="save-custom-yes" onclick="saveCustomBlend()">Yes, save it</button><button type="button" class="save-custom-no" onclick="saveCustomBlend()">No thanks</button></div></div>'
    +'<div class="field"><label>Blend Name <span class="req">*</span></label><input type="text" id="f-blend_name" placeholder="e.g. Nightcap, Penzance, 1-Q" autocomplete="off"><div id="blend-dropdown" class="ac-dropdown"></div></div>'
    +'<div class="full-only">'
    +fPill('blend_type','Style / Family',['Virginia','VaPer','English','Balkan','Burley','Aromatic','Oriental','Lakeland','Other'])
    +fPill('cut_type','Cut',['Ribbon','Flake','Broken Flake','Coin','Plug','Cube Cut','Ready Rubbed','Shag','Rope','Crumble Cake','Pressed','Other'])
    +'</div>'
  );

  var sessionSection=fSec('The Session',
    fText('entry_date','Date','',false,'date')
    +fPill('time_of_day','Time of Day',['Morning','Afternoon','Evening','Late Night'])
  );

  var tobaccoSection=fSec('Leaf & Components',
    fCheck([['tc-virginia','Virginias','Virginias'],['tc-perique','Perique','Perique'],['tc-latakia','Latakia','Latakia'],['tc-orientals','Orientals','Orientals'],['tc-burley','Burley','Burley'],['tc-cavendish','Cavendish','Cavendish'],['tc-darkfired','Dark Fired Kentucky','Dark Fired Kentucky'],['tc-cigarleaf','Cigar Leaf','Cigar Leaf']])
    +fText('other_component','Other Tobaccos','Any other tobaccos...')
    +fPill('nicotine_strength','Nicotine Strength',['Very Mild','Mild','Medium','Medium-Full','Full'])
  ,'full-only');

  var pipeSection=fSec('Pipe Used',
    '<div class="field"><label>Pipe Used</label><input type="text" id="f-pipe_used" placeholder="e.g. Peterson 999" autocomplete="off"><div id="dd-pipe" class="ac-dropdown"></div>'+colHint+'</div>'
  );

  var lighterSection=fSec('Lighter Used','<div class="field"><label>Lighter Used</label><input type="text" id="f-lighter_used" placeholder="e.g. Xikar, Zippo, matches" autocomplete="off"><div id="dd-lighter" class="ac-dropdown"></div>'+lighterHint+'</div>','full-only');

  var notesSection=fSec('Tasting Notes',
    '<div class="field"><label>&#9670; First Third <span style="color:var(--border3);font-size:12px;font-style:normal">— the light &amp; opening</span></label><textarea id="f-first_third_notes" placeholder="First flavors, aroma on the light, initial character..." style="min-height:90px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
    +'<div class="field" style="margin-top:20px"><label>&#9670; Middle Third <span style="color:var(--border3);font-size:12px;font-style:normal">— development</span></label><textarea id="f-middle_third_notes" placeholder="How does it change and develop..." style="min-height:90px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
    +'<div class="field" style="margin-top:20px"><label>&#9670; Final Third <span style="color:var(--border3);font-size:12px;font-style:normal">— finish</span></label><textarea id="f-final_third_notes" placeholder="How does it finish? Any surprises at the end..." style="min-height:90px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
  ,'full-only');

  var tinSection=fSec('The Tin',
    fText('tin_notes','Tin Notes — Aroma Description','e.g. Vanilla, earthy, sweet...')
    +'<div class="field"><label>Tin Aroma Rating</label>'+flameRating10('tin_notes_score')+'</div>'
    +fText('year_blended','Year Blended','e.g. 2022')
    +fTA('prep_notes','Prep Notes','e.g. Dried 20 min, rubbed out...')
  ,'full-only');

  var burnSection=fSec('Burn & Mechanics',
    fCheck([['burn-relights','burn_relights','Needed Relights'],['burn-bite','burn_bite','Tongue Bite'],['burn-gurgling','burn_gurgling','Gurgling'],['burn-wentout','burn_wentout','Went Out'],['burn-dottle','burn_dottle','Dottle']])
    +fScore('mechanics_score','Mechanics Score (1–10)')
  ,'full-only');


  var settingSection=fSec('Setting',
    fText('setting','Setting','e.g. Back porch, study, cigar lounge...')
    +fText('location','Location','City, venue...')
  ,'full-only');

  var ratingSection=fSec('Rate It',
    '<div class="field"><label>Flavor <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Taste, richness, and depth</span></label>'+flameRating10('flavor_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Strength <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Nicotine and body level</span></label>'+flameRating10('strength_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Room Note <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Aroma in the room</span></label>'+flameRating10('room_note_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Performance <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Burn, comfort, and ease</span></label>'+flameRating10('performance_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Overall Enjoyment <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Total smoking satisfaction</span></label>'+flameRating10('enjoy_score')+'</div>'
  );

  var quickNotesSection=fSec('Notes',fTA('quick_notes','Anything worth remembering?','Flavors, impressions, context — anything...'));

  var scoreSection=fSec('Overall Rating',
    fSugScore()
  );

  return modeToggle
    +sessionSection
    +settingSection
    +blendSection
    +tobaccoSection
    +tinSection
    +pipeSection
    +lighterSection
    +notesSection
    +burnSection
    +ratingSection
    +quickNotesSection
    +scoreSection;
}

var currentCigarMode='quick';
function setCigarMode(mode){
  currentCigarMode=mode;
  document.querySelectorAll('.mode-btn').forEach(function(b){b.classList.toggle('active',b.dataset.mode===mode);});
  document.querySelectorAll('.full-only').forEach(function(el){el.classList.toggle('visible',mode==='full');});
}

var currentWhiskeyMode='quick';
function setWhiskeyMode(mode){
  currentWhiskeyMode=mode;
  document.querySelectorAll('.mode-btn').forEach(function(b){b.classList.toggle('active',b.dataset.mode===mode);});
  document.querySelectorAll('.full-only').forEach(function(el){el.classList.toggle('visible',mode==='full');});
}

/* ---- WHISKEY DATABASE ---- */
var WHISKEY_DB = {
  // Buffalo Trace
  'Buffalo Trace':              {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'90 proof / 45% ABV',mashbill:'Mash #1 — low rye'},
  'Eagle Rare 10':              {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'10 Years',proof_abv:'90 proof / 45% ABV',mashbill:'Mash #1 — low rye'},
  "Blanton's Original":         {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'93 proof / 46.5% ABV',mashbill:'Mash #2 — high rye'},
  'E.H. Taylor Small Batch':    {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'100 proof / 50% ABV',mashbill:'Mash #1 — low rye'},
  'E.H. Taylor Single Barrel':  {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'100 proof / 50% ABV',mashbill:'Mash #1 — low rye'},
  'Weller Special Reserve':     {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'90 proof / 45% ABV',mashbill:'Wheated bourbon'},
  'Weller Antique 107':         {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'107 proof / 53.5% ABV',mashbill:'Wheated bourbon'},
  'Weller 12 Year':             {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'12 Years',proof_abv:'90 proof / 45% ABV',mashbill:'Wheated bourbon'},
  'Weller Full Proof':          {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'114 proof / 57% ABV',mashbill:'Wheated bourbon'},
  'Pappy Van Winkle 10 Year':   {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'10 Years',proof_abv:'107 proof / 53.5% ABV',mashbill:'Wheated bourbon'},
  'Pappy Van Winkle 12 Year':   {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'12 Years',proof_abv:'90 proof / 45% ABV',mashbill:'Wheated bourbon'},
  'Pappy Van Winkle 15 Year':   {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'15 Years',proof_abv:'107 proof / 53.5% ABV',mashbill:'Wheated bourbon'},
  'Pappy Van Winkle 20 Year':   {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'20 Years',proof_abv:'90.4 proof / 45.2% ABV',mashbill:'Wheated bourbon'},
  'Pappy Van Winkle 23 Year':   {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'23 Years',proof_abv:'95.6 proof / 47.8% ABV',mashbill:'Wheated bourbon'},
  'George T. Stagg':            {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Bourbon',age_statement:'15+ Years',proof_abv:'Cask Strength (varies)',mashbill:'Mash #1 — low rye'},
  'Sazerac Rye':                {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Rye',age_statement:'NAS',proof_abv:'90 proof / 45% ABV',mashbill:'Rye mash'},
  'Thomas H. Handy Sazerac':    {distillery_producer:'Buffalo Trace Distillery',spirit_type:'Rye',age_statement:'6 Years',proof_abv:'Cask Strength (varies)',mashbill:'Rye mash'},
  // Heaven Hill
  'Elijah Craig Small Batch':   {distillery_producer:'Heaven Hill Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'94 proof / 47% ABV',mashbill:'78% corn, 10% rye, 12% malted barley'},
  'Elijah Craig Barrel Proof':  {distillery_producer:'Heaven Hill Distillery',spirit_type:'Bourbon',age_statement:'12 Years',proof_abv:'Cask Strength (varies)',mashbill:'78% corn, 10% rye, 12% malted barley'},
  'Elijah Craig 18 Year':       {distillery_producer:'Heaven Hill Distillery',spirit_type:'Bourbon',age_statement:'18 Years',proof_abv:'90 proof / 45% ABV',mashbill:'78% corn, 10% rye, 12% malted barley'},
  'Larceny Small Batch':        {distillery_producer:'Heaven Hill Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'92 proof / 46% ABV',mashbill:'Wheated bourbon'},
  'Larceny Barrel Proof':       {distillery_producer:'Heaven Hill Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'Cask Strength (varies)',mashbill:'Wheated bourbon'},
  'Henry McKenna 10 Year':      {distillery_producer:'Heaven Hill Distillery',spirit_type:'Bourbon',age_statement:'10 Years',proof_abv:'100 proof / 50% ABV',mashbill:'78% corn, 10% rye, 12% malted barley'},
  'Bernheim Original Wheat':    {distillery_producer:'Heaven Hill Distillery',spirit_type:'American Whiskey',age_statement:'7 Years',proof_abv:'90 proof / 45% ABV',mashbill:'51% wheat'},
  // Jim Beam / Beam Suntory
  'Knob Creek Small Batch':     {distillery_producer:'Jim Beam Distillery',spirit_type:'Bourbon',age_statement:'9 Years',proof_abv:'100 proof / 50% ABV',mashbill:'77% corn, 13% rye, 10% malted barley'},
  'Knob Creek Single Barrel':   {distillery_producer:'Jim Beam Distillery',spirit_type:'Bourbon',age_statement:'9+ Years',proof_abv:'120 proof / 60% ABV',mashbill:'77% corn, 13% rye, 10% malted barley'},
  "Booker's":                   {distillery_producer:'Jim Beam Distillery',spirit_type:'Bourbon',age_statement:'6–8 Years',proof_abv:'Cask Strength (varies)',mashbill:'77% corn, 13% rye, 10% malted barley'},
  "Baker's 7 Year":             {distillery_producer:'Jim Beam Distillery',spirit_type:'Bourbon',age_statement:'7 Years',proof_abv:'107 proof / 53.5% ABV',mashbill:'77% corn, 13% rye, 10% malted barley'},
  'Basil Hayden':               {distillery_producer:'Jim Beam Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'80 proof / 40% ABV',mashbill:'High rye'},
  'Old Grand-Dad 114':          {distillery_producer:'Jim Beam Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'114 proof / 57% ABV',mashbill:'High rye — 63% corn, 27% rye, 10% malted barley'},
  // Wild Turkey
  'Wild Turkey 101':            {distillery_producer:'Wild Turkey Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'101 proof / 50.5% ABV',mashbill:'75% corn, 13% rye, 12% malted barley'},
  "Russell's Reserve 10 Year":  {distillery_producer:'Wild Turkey Distillery',spirit_type:'Bourbon',age_statement:'10 Years',proof_abv:'90 proof / 45% ABV',mashbill:'75% corn, 13% rye, 12% malted barley'},
  "Russell's Reserve Single Barrel":{distillery_producer:'Wild Turkey Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'110 proof / 55% ABV',mashbill:'75% corn, 13% rye, 12% malted barley'},
  'Wild Turkey Rare Breed':     {distillery_producer:'Wild Turkey Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'116.8 proof / 58.4% ABV',mashbill:'75% corn, 13% rye, 12% malted barley'},
  // Four Roses
  'Four Roses Yellow Label':    {distillery_producer:'Four Roses Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'80 proof / 40% ABV',mashbill:'75% corn, 20% rye, 5% malted barley (blend)'},
  'Four Roses Small Batch':     {distillery_producer:'Four Roses Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'90 proof / 45% ABV',mashbill:'75% corn, 20% rye, 5% malted barley (blend)'},
  'Four Roses Small Batch Select':{distillery_producer:'Four Roses Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'104 proof / 52% ABV',mashbill:'75% corn, 20% rye, 5% malted barley (blend)'},
  'Four Roses Single Barrel':   {distillery_producer:'Four Roses Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'100 proof / 50% ABV',mashbill:'75% corn, 20% rye, 5% malted barley'},
  // Maker's Mark
  "Maker's Mark":               {distillery_producer:"Maker's Mark Distillery",spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'90 proof / 45% ABV',mashbill:'70% corn, 16% wheat, 14% malted barley'},
  "Maker's Mark 46":            {distillery_producer:"Maker's Mark Distillery",spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'94 proof / 47% ABV',mashbill:'70% corn, 16% wheat, 14% malted barley'},
  "Maker's Mark Cask Strength": {distillery_producer:"Maker's Mark Distillery",spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'Cask Strength (varies)',mashbill:'70% corn, 16% wheat, 14% malted barley'},
  // Woodford Reserve
  'Woodford Reserve':           {distillery_producer:'Woodford Reserve Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'90.4 proof / 45.2% ABV',mashbill:'72% corn, 18% rye, 10% malted barley'},
  'Woodford Reserve Double Oaked':{distillery_producer:'Woodford Reserve Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'90.4 proof / 45.2% ABV',mashbill:'72% corn, 18% rye, 10% malted barley'},
  'Woodford Reserve Batch Proof':{distillery_producer:'Woodford Reserve Distillery',spirit_type:'Bourbon',age_statement:'NAS',proof_abv:'Cask Strength (varies)',mashbill:'72% corn, 18% rye, 10% malted barley'},
  // Rye
  'WhistlePig 10 Year':         {distillery_producer:'WhistlePig Farm',spirit_type:'Rye',age_statement:'10 Years',proof_abv:'100 proof / 50% ABV',mashbill:'100% rye'},
  'WhistlePig 12 Year':         {distillery_producer:'WhistlePig Farm',spirit_type:'Rye',age_statement:'12 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% rye'},
  'WhistlePig 15 Year':         {distillery_producer:'WhistlePig Farm',spirit_type:'Rye',age_statement:'15 Years',proof_abv:'92 proof / 46% ABV',mashbill:'100% rye'},
  'Rittenhouse Rye':            {distillery_producer:'Heaven Hill Distillery',spirit_type:'Rye',age_statement:'NAS',proof_abv:'100 proof / 50% ABV',mashbill:'51% rye'},
  'High West Double Rye':       {distillery_producer:'High West Distillery',spirit_type:'Rye',age_statement:'NAS',proof_abv:'92 proof / 46% ABV',mashbill:'Blend of 2 rye mashes'},
  // Scotch
  'Glenfarclas 12':             {distillery_producer:'Glenfarclas Distillery',spirit_type:'Scotch',age_statement:'12 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% malted barley'},
  'Glenfiddich 12':             {distillery_producer:'Glenfiddich Distillery',spirit_type:'Scotch',age_statement:'12 Years',proof_abv:'80 proof / 40% ABV',mashbill:'100% malted barley'},
  'Glenfiddich 18':             {distillery_producer:'Glenfiddich Distillery',spirit_type:'Scotch',age_statement:'18 Years',proof_abv:'80 proof / 40% ABV',mashbill:'100% malted barley'},
  'Macallan 12 Sherry Oak':     {distillery_producer:'Macallan Distillery',spirit_type:'Scotch',age_statement:'12 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% malted barley'},
  'Macallan 18 Sherry Oak':     {distillery_producer:'Macallan Distillery',spirit_type:'Scotch',age_statement:'18 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% malted barley'},
  'Lagavulin 16':               {distillery_producer:'Lagavulin Distillery',spirit_type:'Scotch',age_statement:'16 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% malted barley (heavily peated)'},
  'Laphroaig 10':               {distillery_producer:'Laphroaig Distillery',spirit_type:'Scotch',age_statement:'10 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% malted barley (heavily peated)'},
  'Ardbeg 10':                  {distillery_producer:'Ardbeg Distillery',spirit_type:'Scotch',age_statement:'10 Years',proof_abv:'92 proof / 46% ABV',mashbill:'100% malted barley (heavily peated)'},
  'Balvenie 12 DoubleWood':     {distillery_producer:'Balvenie Distillery',spirit_type:'Scotch',age_statement:'12 Years',proof_abv:'80 proof / 40% ABV',mashbill:'100% malted barley'},
  'Balvenie 14 Caribbean Cask': {distillery_producer:'Balvenie Distillery',spirit_type:'Scotch',age_statement:'14 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% malted barley'},
  'Oban 14':                    {distillery_producer:'Oban Distillery',spirit_type:'Scotch',age_statement:'14 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% malted barley'},
  'Highland Park 12':           {distillery_producer:'Highland Park Distillery',spirit_type:'Scotch',age_statement:'12 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% malted barley (lightly peated)'},
  // Irish
  'Redbreast 12':               {distillery_producer:'Irish Distillers / Midleton',spirit_type:'Irish',age_statement:'12 Years',proof_abv:'80 proof / 40% ABV',mashbill:'Single pot still'},
  'Green Spot':                 {distillery_producer:'Irish Distillers / Midleton',spirit_type:'Irish',age_statement:'NAS',proof_abv:'80 proof / 40% ABV',mashbill:'Single pot still'},
  'Jameson':                    {distillery_producer:'Irish Distillers / Midleton',spirit_type:'Irish',age_statement:'NAS',proof_abv:'80 proof / 40% ABV',mashbill:'Blended Irish'},
  'Bushmills Black Bush':       {distillery_producer:'Old Bushmills Distillery',spirit_type:'Irish',age_statement:'NAS',proof_abv:'80 proof / 40% ABV',mashbill:'Blended Irish — single malt heavy'},
  // Japanese
  'Yamazaki 12':                {distillery_producer:'Suntory / Yamazaki Distillery',spirit_type:'Japanese',age_statement:'12 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% malted barley'},
  'Hakushu 12':                 {distillery_producer:'Suntory / Hakushu Distillery',spirit_type:'Japanese',age_statement:'12 Years',proof_abv:'86 proof / 43% ABV',mashbill:'100% malted barley'},
  'Nikka From the Barrel':      {distillery_producer:'Nikka Whisky',spirit_type:'Japanese',age_statement:'NAS',proof_abv:'102.8 proof / 51.4% ABV',mashbill:'Blended malt & grain'},
};

/* ---- WHISKEY NAME AUTOCOMPLETE ---- */
function onWhiskeyNameInput(){
  var inp=document.getElementById('f-name'),dd=document.getElementById('dd-whiskey-name');if(!inp||!dd)return;
  var q=inp.value.trim().toLowerCase();
  var names=Object.keys(WHISKEY_DB);
  var m=names.filter(function(n){return q&&n.toLowerCase().indexOf(q)>-1;});
  if(!m.length){dd.style.display='none';return;}
  dd.innerHTML=m.slice(0,10).map(function(n){return'<div class="blend-option" onpointerdown="selWhiskeyName(\''+n.replace(/'/g,"\\'")+'\')"  >'+hlMatch(n,q)+'</div>';}).join('');
  dd.style.display='block';
}
function selWhiskeyName(v){
  var i=document.getElementById('f-name');if(i)i.value=v;
  var d=document.getElementById('dd-whiskey-name');if(d)d.style.display='none';
  var found=WHISKEY_DB[v];
  if(found){
    var sf=function(id,val){var el=document.getElementById('f-'+id);if(el&&val)el.value=val;};
    sf('distillery_producer',found.distillery_producer);
    sf('age_statement',found.age_statement);
    sf('proof_abv',found.proof_abv);
    sf('mashbill',found.mashbill);
    if(found.spirit_type)setPillVal('spirit_type',found.spirit_type);
  }
}

function buildCigarForm(){
  var modeToggle='<div class="mode-toggle">'
    +'<button type="button" class="mode-btn active" data-mode="quick" onclick="setCigarMode(\'quick\')">Quick Entry</button>'
    +'<button type="button" class="mode-btn" data-mode="full" onclick="setCigarMode(\'full\')">Full Entry</button>'
    +'</div>';

  var sessionSection=fSec('The Session',
    fText('entry_date','Date','',false,'date')
    +fPill('time_of_day','Time of Day',['Morning','Afternoon','Evening','Late Night'])
    +'<div class="full-only">'
    +fText('occasion_setting','Occasion / Setting','e.g. Golf round, patio, celebration...')
    +fText('location','Location','City, venue...')
    +fText('pairing','Pairing','e.g. Bourbon, coffee, soda...')
    +'</div>'
  );

  var cigarSection=fSec('The Cigar',
    '<div class="field" style="position:relative"><label>Brand <span class="req">*</span></label><input type="text" id="f-brand" placeholder="e.g. Padron, Arturo Fuente, Oliva" autocomplete="off"><div id="dd-cigar-brand" class="ac-dropdown"></div></div>'
    +'<div class="field" style="position:relative"><label>Line / Name <span class="req">*</span></label><input type="text" id="f-line_name" placeholder="e.g. 1964 Anniversary, Gran Reserva" autocomplete="off"><div id="dd-cigar-line" class="ac-dropdown"></div></div>'
    +'<div class="field" style="position:relative"><label>Vitola / Size</label><input type="text" id="f-vitola_size" placeholder="e.g. Robusto, Toro, Churchill..." autocomplete="off"><div id="dd-vitola" class="ac-dropdown"></div></div>'
    +fPill('cut_type','Cut',['Straight','V-Cut','Punch','Other'])
  );

  var blendSection=fSec('Blend Details',
    fText('country_factory','Country / Factory','e.g. Nicaragua')
    +fText('wrapper','Wrapper','e.g. Ecuador Habano')
    +fText('binder','Binder','e.g. Nicaragua')
    +fText('filler','Filler','e.g. Nicaragua blend')
    +fPill('wrapper_shade_type','Wrapper Shade',['Claro','Natural','Colorado','Colorado Maduro','Maduro','Oscuro','Other'])
    +fText('humidor_condition_rest_time','Humidor / Rest Time','e.g. Rested 3 weeks at 65%')
  ,'full-only');

  var notesSection=fSec('Tasting Notes',
    '<div class="field"><label>&#9670; Pre-light <span style="color:var(--border3);font-size:12px;font-style:normal">— cold draw &amp; foot aroma</span></label><textarea id="f-first_impression_notes" placeholder="Cold draw notes, aroma on the foot..." style="min-height:80px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
    +'<div class="field" style="margin-top:20px"><label>&#9670; First Third <span style="color:var(--border3);font-size:12px;font-style:normal">— opening</span></label><textarea id="f-first_third_notes" placeholder="First flavors, initial character..." style="min-height:90px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
    +'<div class="field" style="margin-top:20px"><label>&#9670; Second Third <span style="color:var(--border3);font-size:12px;font-style:normal">— development</span></label><textarea id="f-second_third_notes" placeholder="How does it change and develop..." style="min-height:90px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
    +'<div class="field" style="margin-top:20px"><label>&#9670; Final Third <span style="color:var(--border3);font-size:12px;font-style:normal">— finish</span></label><textarea id="f-final_third_notes" placeholder="How does it finish..." style="min-height:90px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
  ,'full-only');

  var constructionSection=fSec('Construction',
    fPill('draw_quality','Draw',['Easy','Perfect','Slightly Tight','Tight'])
    +fPill('burn_quality','Burn',['Straight','Minor Touch-Up','Uneven','Canoeing','Tunneling'])
    +fPill('strength','Strength',['Mild','Medium','Medium-Full','Full'])
    +fPill('body','Body',['Mild','Medium','Full'])
    +fPill('nicotine_impact','Nicotine Impact',['Low','Medium','High'])
  ,'full-only');

  var decisionsSection=fSec('Decisions',
    fYNM('would_buy_again','Would You Buy Again?')
    +fYNM('box_worthy','Box Worthy?')
  ,'full-only');

  var ratingSection=fSec('Rate It',
    '<div class="field"><label>Flavor <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Taste, complexity, and character</span></label>'+flameRating10('flavor_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Construction <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Build quality, ash, and smoke production</span></label>'+flameRating10('construction_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Draw <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Airflow and resistance</span></label>'+flameRating10('draw_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Burn <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Evenness and consistency</span></label>'+flameRating10('burn_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Aroma <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Foot, smoke, and room note</span></label>'+flameRating10('aroma_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Strength <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Nicotine and body level</span></label>'+flameRating10('strength_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Overall Enjoyment <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Total smoking satisfaction</span></label>'+flameRating10('enjoy_score')+'</div>'
  );

  var quickNotesSection=fSec('Notes',fTA('quick_notes','Anything worth remembering?','Flavors, impressions, context — anything...'));

  var scoreSection=fSec('Overall Rating',fSugScore());

  return modeToggle
    +sessionSection
    +cigarSection
    +blendSection
    +notesSection
    +constructionSection
    +decisionsSection
    +ratingSection
    +quickNotesSection
    +scoreSection;
}

function buildWhiskeyForm(){
  var modeToggle='<div class="mode-toggle">'
    +'<button type="button" class="mode-btn active" data-mode="quick" onclick="setWhiskeyMode(\'quick\')">Quick Entry</button>'
    +'<button type="button" class="mode-btn" data-mode="full" onclick="setWhiskeyMode(\'full\')">Full Entry</button>'
    +'</div>';

  var sessionSection=fSec('The Session',
    fText('entry_date','Date','',false,'date')
    +fPill('time_of_day','Time of Day',['Morning','Afternoon','Evening','Late Night'])
    +fPill('serve_style','Serve Style',['Neat','Rocks','Splash of Water','Rested','Other'])
    +'<div class="full-only">'
    +fText('glassware','Glassware','e.g. Glencairn, rocks glass, snifter...')
    +fText('occasion_setting','Occasion / Setting','e.g. Porch sip, celebration, tasting...')
    +fText('location','Location','City, venue...')
    +fText('pairing','Pairing','e.g. Cigar, dark chocolate, pipe...')
    +'</div>'
  );

  var bottleSection=fSec('The Bottle',
    '<div class="field" style="position:relative"><label>Name <span class="req">*</span></label><input type="text" id="f-name" placeholder="e.g. Eagle Rare 10, Pappy 15, Lagavulin 16" autocomplete="off"><div id="dd-whiskey-name" class="ac-dropdown"></div></div>'
    +fText('distillery_producer','Distillery / Producer','e.g. Buffalo Trace, Heaven Hill')
    +fPill('spirit_type','Spirit Type',['Bourbon','Rye','Irish','Scotch','Japanese','American Whiskey','World Whiskey','Other'])
    +'<div class="full-only">'
    +fText('age_statement','Age Statement','e.g. 10 Years / NAS')
    +fText('proof_abv','Proof / ABV','e.g. 90 proof / 45% ABV')
    +fText('mashbill','Mashbill / Grain Bill','e.g. 75% corn, 13% rye, 12% malted barley')
    +fText('batch_barrel_release_info','Batch / Barrel / Release','e.g. Single barrel, store pick, batch B923...')
    +'</div>'
  );

  var notesSection=fSec('Tasting Notes',
    '<div class="field"><label>&#9670; Nose <span style="color:var(--border3);font-size:12px;font-style:normal">— aroma and complexity</span></label><textarea id="f-nose_notes" placeholder="What do you smell on the pour and rest..." style="min-height:80px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
    +'<div class="field" style="margin-top:20px"><label>&#9670; Palate <span style="color:var(--border3);font-size:12px;font-style:normal">— flavor and development</span></label><textarea id="f-palate_notes" placeholder="What hits first, how does it develop..." style="min-height:90px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
    +'<div class="field" style="margin-top:20px"><label>&#9670; Finish <span style="color:var(--border3);font-size:12px;font-style:normal">— length and quality</span></label><textarea id="f-finish_notes" placeholder="Aftertaste, how long does it linger..." style="min-height:80px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
    +'<div class="field" style="margin-top:20px"><label>&#9670; Mouthfeel <span style="color:var(--border3);font-size:12px;font-style:normal">— texture and weight</span></label><textarea id="f-mouthfeel_notes" placeholder="Texture, viscosity, oiliness, heat..." style="min-height:70px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
    +'<div class="field" style="margin-top:20px"><label>&#9670; Balance &amp; Complexity <span style="color:var(--border3);font-size:12px;font-style:normal">— integration and depth</span></label><textarea id="f-balance_complexity_notes" placeholder="How well does it all come together..." style="min-height:70px;line-height:1.65;width:100%;background:transparent;border:none;border-bottom:1px solid var(--border2);padding:8px 0;font-family:\'Crimson Pro\',Georgia,serif;font-size:20px;color:var(--cream);outline:none;resize:none;caret-color:var(--gold)"></textarea></div>'
  ,'full-only');

  var decisionsSection=fSec('Decisions',
    fYNM('would_buy_again','Would You Buy Again?')
    +fYNM('would_hunt_again','Worth the Hunt?')
    +fPill('bottle_status_tag','Bottle Status',['Shelf Staple','Buy Again','Backup Bottle','Worth the Hunt','Pass'])
    +fTA('overall_thoughts','Overall Thoughts','General impressions, context, final word...')
    +fTags()
  ,'full-only');

  var ratingSection=fSec('Rate It',
    '<div class="field"><label>Nose <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Aroma complexity and character</span></label>'+glassRating10('nose_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Palate <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Flavor depth and development</span></label>'+glassRating10('palate_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Finish <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Length, quality, and persistence</span></label>'+glassRating10('finish_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Balance <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Harmony, complexity, and integration</span></label>'+glassRating10('balance_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Value <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Price vs. quality</span></label>'+glassRating10('value_score')+'</div>'
    +'<div class="field" style="margin-top:20px"><label>Overall Enjoyment <span style="color:var(--border3);font-size:12px;font-style:normal;font-weight:400">— Total drinking satisfaction</span></label>'+glassRating10('enjoy_score')+'</div>'
  );

  var quickNotesSection=fSec('Notes',fTA('quick_notes','Anything worth remembering?','Flavors, impressions, context — anything...'));

  var scoreSection=fSec('Overall Rating',fSugScore());

  return modeToggle
    +sessionSection
    +bottleSection
    +notesSection
    +decisionsSection
    +ratingSection
    +quickNotesSection
    +scoreSection;
}

function buildForm(cat){
  document.getElementById('form-body').innerHTML=cat==='pipe'?buildPipeForm():cat==='cigar'?buildCigarForm():buildWhiskeyForm();
  if(cat==='pipe'){
    var brandInp=document.getElementById('f-brand');
    if(brandInp){
      brandInp.addEventListener('input',onBrandInput);
      brandInp.addEventListener('focus',onBrandInput);
      brandInp.addEventListener('blur',function(){setTimeout(function(){var d=document.getElementById('dd-brand');if(d)d.style.display='none';},150);});
    }
    var blendInp=document.getElementById('f-blend_name');
    if(blendInp){
      blendInp.addEventListener('input',onBlendNameInput);
      blendInp.addEventListener('focus',onBlendNameInput);
      blendInp.addEventListener('blur',function(){setTimeout(function(){var d=document.getElementById('blend-dropdown');if(d)d.style.display='none';},150);});
    }
    var pipeInp=document.getElementById('f-pipe_used');
    if(pipeInp){
      pipeInp.addEventListener('input',showPipeDD);
      pipeInp.addEventListener('focus',showPipeDD);
      pipeInp.addEventListener('blur',function(){setTimeout(function(){var d=document.getElementById('dd-pipe');if(d)d.style.display='none';},150);});
    }
    var lightInp=document.getElementById('f-lighter_used');
    if(lightInp){
      lightInp.addEventListener('input',showLighterDD);
      lightInp.addEventListener('focus',showLighterDD);
      lightInp.addEventListener('blur',function(){setTimeout(function(){var d=document.getElementById('dd-lighter');if(d)d.style.display='none';},150);});
    }
    setPipeMode('quick');
  }
  if(cat==='cigar'){
    setCigarMode('quick');
    var cBrandInp=document.getElementById('f-brand');
    if(cBrandInp){
      cBrandInp.addEventListener('input',onCigarBrandInput);
      cBrandInp.addEventListener('focus',onCigarBrandInput);
      cBrandInp.addEventListener('blur',function(){setTimeout(function(){var d=document.getElementById('dd-cigar-brand');if(d)d.style.display='none';},150);});
    }
    var cLineInp=document.getElementById('f-line_name');
    if(cLineInp){
      cLineInp.addEventListener('input',onCigarLineInput);
      cLineInp.addEventListener('focus',onCigarLineInput);
      cLineInp.addEventListener('blur',function(){setTimeout(function(){var d=document.getElementById('dd-cigar-line');if(d)d.style.display='none';},150);});
    }
    var vitInp=document.getElementById('f-vitola_size');
    if(vitInp){
      vitInp.addEventListener('input',onVitolInput);
      vitInp.addEventListener('focus',onVitolInput);
      vitInp.addEventListener('blur',function(){setTimeout(function(){var d=document.getElementById('dd-vitola');if(d)d.style.display='none';},150);});
    }
  }
  if(cat==='whiskey'){
    setWhiskeyMode('quick');
    var wNameInp=document.getElementById('f-name');
    if(wNameInp){
      wNameInp.addEventListener('input',onWhiskeyNameInput);
      wNameInp.addEventListener('focus',onWhiskeyNameInput);
      wNameInp.addEventListener('blur',function(){setTimeout(function(){var d=document.getElementById('dd-whiskey-name');if(d)d.style.display='none';},150);});
    }
  }
  renderTagChips();
  updateSuggestedScore();
}

function toggleScore(id,val){
  var h=document.getElementById('f-'+id),r=document.getElementById('sr-'+id);if(!h||!r)return;
  var cur=parseInt(h.value)||0,nv=cur===val?0:val;
  h.value=nv||'';
  r.querySelectorAll('.score-btn').forEach(function(b){b.classList.toggle('active',parseInt(b.dataset.val)<=nv&&nv>0);});
  updateSuggestedScore();
}
function togglePill(id,val){
  var h=document.getElementById('f-'+id),w=document.getElementById('po-'+id);if(!h||!w)return;
  var nv=h.value===val?'':val;h.value=nv;
  w.querySelectorAll('.pill-opt').forEach(function(b){b.classList.toggle('active',b.dataset.val===nv);});
}
function toggleYNM(id,val){
  var h=document.getElementById('f-'+id),r=document.getElementById('ynm-'+id);if(!h||!r)return;
  var nv=h.value===val?'':val;h.value=nv;
  var map={yes:'ynm-y',maybe:'ynm-m',no:'ynm-n'};
  r.querySelectorAll('.ynm-btn').forEach(function(b){b.classList.remove('active');});
  if(nv){var a=r.querySelector('.'+map[nv]);if(a)a.classList.add('active');}
}
function setScoreVal(id,val){var h=document.getElementById('f-'+id),r=document.getElementById('sr-'+id);if(!h)return;var nv=parseInt(val)||0;h.value=nv||'';if(r)r.querySelectorAll('.score-btn').forEach(function(b){b.classList.toggle('active',parseInt(b.dataset.val)<=nv&&nv>0);});}
function setPillVal(id,val){var h=document.getElementById('f-'+id),w=document.getElementById('po-'+id);if(!h)return;h.value=val||'';if(w)w.querySelectorAll('.pill-opt').forEach(function(b){b.classList.toggle('active',b.dataset.val===val);});}
function setYNMVal(id,val){
  var h=document.getElementById('f-'+id),r=document.getElementById('ynm-'+id);if(!h)return;h.value=val||'';
  if(r){var map={yes:'ynm-y',maybe:'ynm-m',no:'ynm-n'};r.querySelectorAll('.ynm-btn').forEach(function(b){b.classList.remove('active');});if(val){var a=r.querySelector('.'+map[val]);if(a)a.classList.add('active');}}
}
function setTF(id,val){var e=document.getElementById('f-'+id);if(e)e.value=val||'';}

function fillForm(cat,e){
  setTF('entry_date',e.entry_date);setTF('location',e.location);setPillVal('time_of_day',e.time_of_day);
  renderTagChips();
  if(cat==='pipe'){
    setTF('brand',e.brand);setTF('blend_name',e.blend_name);setPillVal('blend_type',e.blend_type);
    setPillVal('cut_type',e.cut_type);setTF('pipe_used',e.pipe_used);setTF('lighter_used',e.lighter_used);
    setFlameVal('flavor_score',e.flavor_score);setFlameVal('strength_score',e.strength_score);
    setFlameVal('room_note_score',e.room_note_score);setFlameVal('performance_score',e.performance_score);
    setFlameVal('enjoy_score',e.enjoy_score);
    setTF('tin_notes',e.tin_notes);setFlameVal('tin_notes_score',e.tin_notes_score);
    setTF('year_blended',e.year_blended);setPillVal('nicotine_strength',e.nicotine_strength);
    setTF('prep_notes',e.prep_notes);setTF('setting',e.setting);setTF('other_component',e.other_component);
    var cm={virginia:'Virginias',perique:'Perique',latakia:'Latakia',orientals:'Orientals',burley:'Burley',cavendish:'Cavendish',darkfired:'Dark Fired Kentucky',cigarleaf:'Cigar Leaf'};
    Object.keys(cm).forEach(function(k){var el=document.getElementById('f-tc-'+k);if(el)el.checked=(e.tobacco_components||[]).indexOf(cm[k])>-1;});
    // separate thirds fields
    setTF('first_third_notes', e.first_third_notes||e.notes||'');
    setTF('middle_third_notes', e.middle_third_notes||'');
    setTF('final_third_notes', e.final_third_notes||'');
    setScoreVal('mechanics_score',e.mechanics_score);
    setFlameVal('room_note_intensity',e.room_note_intensity);
    setFlameVal('first_intensity',e.first_intensity);
    setFlameVal('middle_intensity',e.middle_intensity);
    setFlameVal('final_intensity',e.final_intensity);
    // burn mechanics checkboxes
    var burnKeys=['relights','bite','gurgling','wentout','dottle'];
    burnKeys.forEach(function(k){var el=document.getElementById('f-burn-'+k);if(el)el.checked=!!e['burn_'+k];});
    setYNMVal('would_smoke_again',e.would_smoke_again);setYNMVal('cellar_worthy',e.cellar_worthy);
    setTF('overall_thoughts',e.overall_thoughts);setTF('quick_notes',e.quick_notes);
  }else if(cat==='cigar'){
    setTF('brand',e.brand);setTF('line_name',e.line_name);setTF('vitola_size',e.vitola_size);
    setPillVal('cut_type',e.cut_type);
    setTF('occasion_setting',e.occasion_setting);setTF('location',e.location);setTF('pairing',e.pairing);
    setTF('country_factory',e.country_factory);setTF('wrapper',e.wrapper);setTF('binder',e.binder);setTF('filler',e.filler);
    setPillVal('wrapper_shade_type',e.wrapper_shade_type);setTF('humidor_condition_rest_time',e.humidor_condition_rest_time);
    setTF('first_impression_notes',e.first_impression_notes);
    setTF('first_third_notes',e.first_third_notes);setTF('second_third_notes',e.second_third_notes);setTF('final_third_notes',e.final_third_notes);
    setPillVal('draw_quality',e.draw_quality);setPillVal('burn_quality',e.burn_quality);
    setPillVal('strength',e.strength);setPillVal('body',e.body);setPillVal('nicotine_impact',e.nicotine_impact);
    setYNMVal('would_buy_again',e.would_buy_again);setYNMVal('box_worthy',e.box_worthy);
    setFlameVal('flavor_score',e.flavor_score);setFlameVal('construction_score',e.construction_score);
    setFlameVal('draw_score',e.draw_score);setFlameVal('burn_score',e.burn_score);setFlameVal('aroma_score',e.aroma_score);
    setFlameVal('strength_score',e.strength_score);setFlameVal('enjoy_score',e.enjoy_score);
    setTF('quick_notes',e.quick_notes);
  }else if(cat==='whiskey'){
    setTF('name',e.name);setTF('distillery_producer',e.distillery_producer);setPillVal('spirit_type',e.spirit_type);
    setTF('age_statement',e.age_statement);setTF('proof_abv',e.proof_abv);setTF('mashbill',e.mashbill);
    setTF('batch_barrel_release_info',e.batch_barrel_release_info);
    setTF('glassware',e.glassware);setPillVal('serve_style',e.serve_style);
    setTF('occasion_setting',e.occasion_setting);setTF('pairing',e.pairing);
    setTF('nose_notes',e.nose_notes);setTF('palate_notes',e.palate_notes);
    setTF('finish_notes',e.finish_notes);setTF('mouthfeel_notes',e.mouthfeel_notes);
    setTF('balance_complexity_notes',e.balance_complexity_notes);
    setGlassVal('nose_score',e.nose_score);setGlassVal('palate_score',e.palate_score);
    setGlassVal('finish_score',e.finish_score);setGlassVal('balance_score',e.balance_score);
    setGlassVal('value_score',e.value_score);setGlassVal('enjoy_score',e.enjoy_score);
    setYNMVal('would_buy_again',e.would_buy_again);setYNMVal('would_hunt_again',e.would_hunt_again);
    setPillVal('bottle_status_tag',e.bottle_status_tag);setTF('overall_thoughts',e.overall_thoughts);
    setTF('quick_notes',e.quick_notes);
  }
  updateSuggestedScore();
}

function getFormData(cat){
  var g=function(id){var e=document.getElementById('f-'+id);return e?e.value.trim():'';};
  var gi=function(id){var v=g(id);return v?parseInt(v):null;};
  var gf=function(id){var v=g(id);return v?parseFloat(v):null;};
  var base={id:document.getElementById('entry-id').value||generateId(),category:cat,
    created_at:new Date().toISOString(),updated_at:new Date().toISOString(),
    entry_date:g('entry_date'),time_of_day:g('time_of_day'),location:g('location'),
    overall_thoughts:g('overall_thoughts'),quick_notes:g('quick_notes'),tags:currentTags.slice(),
    final_score:null,use_final_override:false};
  if(cat==='pipe'){
    var cm={virginia:'Virginias',perique:'Perique',latakia:'Latakia',orientals:'Orientals',burley:'Burley',cavendish:'Cavendish',darkfired:'Dark Fired Kentucky',cigarleaf:'Cigar Leaf'};
    var firstNotes=g('first_third_notes');
    var middleNotes=g('middle_third_notes');
    var finalNotes=g('final_third_notes');
    var combinedNotes=[firstNotes,middleNotes,finalNotes].filter(Boolean).join('\n\n');
    Object.assign(base,{
      brand:g('brand'),blend_name:g('blend_name'),blend_type:g('blend_type'),
      tobacco_components:Object.keys(cm).filter(function(k){var el=document.getElementById('f-tc-'+k);return el&&el.checked;}).map(function(k){return cm[k];}),
      other_component:g('other_component'),cut_type:g('cut_type'),pipe_used:g('pipe_used'),lighter_used:g('lighter_used'),
      tin_notes:g('tin_notes'),tin_notes_score:gi('tin_notes_score'),
      year_blended:g('year_blended'),nicotine_strength:g('nicotine_strength'),
      prep_notes:g('prep_notes'),setting:g('setting'),
      notes:combinedNotes,
      first_third_notes:firstNotes,
      middle_third_notes:middleNotes,
      final_third_notes:finalNotes,
      flavor_score:gi('flavor_score'),strength_score:gi('strength_score'),
      room_note_score:gi('room_note_score'),performance_score:gi('performance_score'),enjoy_score:gi('enjoy_score'),
      mechanics_score:gi('mechanics_score'),
      room_note_intensity:gi('room_note_intensity'),
      first_intensity:gi('first_intensity'),middle_intensity:gi('middle_intensity'),final_intensity:gi('final_intensity'),
      burn_relights:!!(document.getElementById('f-burn-relights')&&document.getElementById('f-burn-relights').checked),
      burn_bite:!!(document.getElementById('f-burn-bite')&&document.getElementById('f-burn-bite').checked),
      burn_gurgling:!!(document.getElementById('f-burn-gurgling')&&document.getElementById('f-burn-gurgling').checked),
      burn_wentout:!!(document.getElementById('f-burn-wentout')&&document.getElementById('f-burn-wentout').checked),
      burn_dottle:!!(document.getElementById('f-burn-dottle')&&document.getElementById('f-burn-dottle').checked),
      satisfaction_score:gi('satisfaction_score'),would_smoke_again:g('would_smoke_again'),cellar_worthy:g('cellar_worthy'),
      first_third_score:null,middle_third_score:null,final_third_score:null
    });
  }else if(cat==='cigar'){
    Object.assign(base,{brand:g('brand'),line_name:g('line_name'),vitola_size:g('vitola_size'),
      cut_type:g('cut_type'),occasion_setting:g('occasion_setting'),pairing:g('pairing'),
      country_factory:g('country_factory'),wrapper:g('wrapper'),binder:g('binder'),filler:g('filler'),
      wrapper_shade_type:g('wrapper_shade_type'),humidor_condition_rest_time:g('humidor_condition_rest_time'),
      first_impression_notes:g('first_impression_notes'),
      first_third_notes:g('first_third_notes'),second_third_notes:g('second_third_notes'),final_third_notes:g('final_third_notes'),
      draw_quality:g('draw_quality'),burn_quality:g('burn_quality'),
      strength:g('strength'),body:g('body'),nicotine_impact:g('nicotine_impact'),
      would_buy_again:g('would_buy_again'),box_worthy:g('box_worthy'),
      flavor_score:gi('flavor_score'),construction_score:gi('construction_score'),
      draw_score:gi('draw_score'),burn_score:gi('burn_score'),aroma_score:gi('aroma_score'),
      strength_score:gi('strength_score'),enjoy_score:gi('enjoy_score')});
  }else if(cat==='whiskey'){
    Object.assign(base,{name:g('name'),distillery_producer:g('distillery_producer'),spirit_type:g('spirit_type'),
      age_statement:g('age_statement'),proof_abv:g('proof_abv'),mashbill:g('mashbill'),
      batch_barrel_release_info:g('batch_barrel_release_info'),
      glassware:g('glassware'),serve_style:g('serve_style'),
      occasion_setting:g('occasion_setting'),pairing:g('pairing'),
      nose_notes:g('nose_notes'),palate_notes:g('palate_notes'),
      finish_notes:g('finish_notes'),mouthfeel_notes:g('mouthfeel_notes'),
      balance_complexity_notes:g('balance_complexity_notes'),
      nose_score:gi('nose_score'),palate_score:gi('palate_score'),
      finish_score:gi('finish_score'),balance_score:gi('balance_score'),
      value_score:gi('value_score'),enjoy_score:gi('enjoy_score'),
      would_buy_again:g('would_buy_again'),would_hunt_again:g('would_hunt_again'),
      bottle_status_tag:g('bottle_status_tag'),overall_thoughts:g('overall_thoughts')});
  }
  base.suggested_score=calcScore(cat,base);
  return base;
}

function saveEntry(){
  var cat=document.getElementById('entry-category').value;
  var entry=getFormData(cat);
  if(cat==='pipe'&&!entry.blend_name){alert('Please enter a blend name.');document.getElementById('f-blend_name').focus();return;}
  if(cat==='cigar'&&!entry.brand){alert('Please enter a brand.');document.getElementById('f-brand').focus();return;}
  if(cat==='whiskey'&&!entry.name){alert('Please enter a name.');document.getElementById('f-name').focus();return;}
  var entries=loadEntries(cat);
  var idx=entries.findIndex(function(e){return e.id===entry.id;});
  if(idx>=0){entry.created_at=entries[idx].created_at;entries[idx]=entry;}else entries.push(entry);
  saveEntries(cat,entries);currentEntryId=entry.id;currentEntryCategory=cat;showDetail(entry.id,cat);
}
function deleteEntry(id,cat){
  if(!confirm('Delete this entry? This cannot be undone.'))return;
  saveEntries(cat,loadEntries(cat).filter(function(e){return e.id!==id;}));showList();
}
function editCurrentEntry(){
  if(!currentEntryId||!currentEntryCategory)return;
  isNewEntry=false;showForm(currentEntryCategory);
  document.getElementById('entry-id').value=currentEntryId;
}

function dSec(title,fields){
  var content=fields.filter(Boolean).join('');if(!content)return'';
  return'<div class="detail-section"><div class="detail-section-title">'+title+'</div>'+content+'</div>';
}
function dF(label,val){
  if(!val&&val!==0)return'';
  return'<div class="detail-field"><div class="detail-label">'+label+'</div><div class="detail-value">'+esc(String(val))+'</div></div>';
}
function dSF(label,notes,score){
  if(!notes)return'';
  return'<div class="bowl-third"><div class="bowl-label">'+label+(score?'<span class="bowl-score-badge">'+score+'/10</span>':'')+'</div><div class="detail-value">'+esc(notes)+'</div></div>';
}
function dFlames(label,val){
  if(!val)return'';
  var flames='';for(var i=1;i<=5;i++)flames+='<span style="font-size:20px;opacity:'+(i<=val?'1':'0.15')+'">&#x1F525;</span>';
  return'<div class="detail-field"><div class="detail-label">'+label+'</div><div style="display:flex;gap:6px;margin-top:4px">'+flames+'</div></div>';
}
function dFlames10(label,val,sub){
  if(!val)return'';
  var flames='';for(var i=1;i<=10;i++)flames+='<span style="font-size:18px;opacity:'+(i<=val?'1':'0.15')+'">&#x1F525;</span>';
  return'<div class="detail-field"><div class="detail-label">'+label+(sub?'<span style="color:var(--border3);font-size:11px;font-weight:400;margin-left:6px">'+sub+'</span>':'')+'</div><div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">'+flames+'</div></div>';
}

function renderDetail(id,cat){
  var e=loadEntries(cat).find(function(x){return x.id===id;});if(!e)return;
  document.getElementById('detail-title').innerHTML=catEmoji(cat)+catLabel(cat);
  var score=displayScore(e),sugg=e.suggested_score;
  var h='<div class="detail-blend">'+esc(entryName(e))+'</div>';
  if(e.entry_date)h+='<div class="detail-date-line">'+formatDate(e.entry_date)+(e.time_of_day?' &middot; '+e.time_of_day:'')+'</div>';
  if(score!==null){
    h+='<div class="detail-section"><div class="detail-section-title">Score</div>'
      +'<div class="big-score-display"><span class="big-score-num">'+score.toFixed(1)+'</span><span class="big-score-denom">/10</span></div>'
      +'<div class="big-score-type">'+(e.use_final_override?'Your final score':'Suggested score')
      +(e.use_final_override&&sugg?' &nbsp;&middot;&nbsp; <span style="color:var(--border3)">suggested '+sugg.toFixed(1)+'</span>':'')+'</div></div>';
  }
  if(cat==='pipe'){
    var comps=(e.tobacco_components||[]).concat(e.other_component?[e.other_component]:[]);
    h+=dSec('Blend',[dF('Brand',e.brand),dF('Style',e.blend_type),dF('Cut',e.cut_type),dF('Year Blended',e.year_blended)]);
    if(comps.length)h+=dSec('Components',['<div class="component-tags">'+comps.map(function(c){return'<span class="component-tag">'+esc(c)+'</span>';}).join('')+'</div>']);
    h+=dSec('Session',[dF('Pipe Used',e.pipe_used),dF('Lighter Used',e.lighter_used),dF('Setting',e.setting),dF('Nicotine Strength',e.nicotine_strength)]);
    // notes — prefer new combined field, fall back to old thirds
    var notesToShow=e.notes||(e.first_third_notes||e.middle_third_notes||e.final_third_notes?[e.first_third_notes,e.middle_third_notes,e.final_third_notes].filter(Boolean).join('\n\n'):'');
    if(notesToShow)h+=dSec('Tasting Notes',['<div class="detail-value" style="white-space:pre-wrap">'+esc(notesToShow)+'</div>']);
    h+=dSec('Tin Details',[dF('Tin Notes',e.tin_notes),dFlames10('Tin Aroma',e.tin_notes_score),dF('Prep Notes',e.prep_notes)]);
    // burn mechanics
    var burnFlags=[];
    if(e.burn_relights)burnFlags.push('Needed Relights');
    if(e.burn_bite)burnFlags.push('Tongue Bite');
    if(e.burn_gurgling)burnFlags.push('Gurgling');
    if(e.burn_wentout)burnFlags.push('Went Out');
    if(e.burn_dottle)burnFlags.push('Dottle');
    h+=dSec('Burn & Mechanics',[
      burnFlags.length?'<div class="detail-field"><div class="detail-label">Burn Notes</div><div class="component-tags">'+burnFlags.map(function(f){return'<span class="component-tag">'+f+'</span>';}).join('')+'</div></div>':'',
      dF('Mechanics Score',e.mechanics_score?e.mechanics_score+'/10':null)
    ]);
    h+=dSec('Room Note & Intensity',[
      dFlames('Room Note Intensity',e.room_note_intensity),
      dFlames('First Third Intensity',e.first_intensity),
      dFlames('Middle Third Intensity',e.middle_intensity),
      dFlames('Final Third Intensity',e.final_intensity)
    ]);
    h+=dSec('Ratings',[dFlames10('Flavor',e.flavor_score,'Taste, richness, and depth'),dFlames10('Strength',e.strength_score,'Nicotine and body level'),dFlames10('Room Note',e.room_note_score,'Aroma in the room'),dFlames10('Performance',e.performance_score,'Burn, comfort, and ease'),dFlames10('Overall Enjoyment',e.enjoy_score,'Total smoking satisfaction')]);
    h+=dSec('Decisions',[dF('Smoke Again?',capitalize(e.would_smoke_again)),dF('Cellar Worthy?',capitalize(e.cellar_worthy))]);
  }else if(cat==='cigar'){
    h+=dSec('The Cigar',[dF('Vitola / Size',e.vitola_size),dF('Cut',e.cut_type)]);
    h+=dSec('Blend Details',[dF('Country / Factory',e.country_factory),dF('Wrapper',e.wrapper),dF('Binder',e.binder),dF('Filler',e.filler),dF('Shade',e.wrapper_shade_type),dF('Humidor / Rest',e.humidor_condition_rest_time)]);
    h+=dSec('Session',[dF('Occasion',e.occasion_setting),dF('Location',e.location),dF('Pairing',e.pairing)]);
    var cn=e.first_impression_notes||e.first_third_notes||e.second_third_notes||e.final_third_notes;
    if(cn)h+=dSec('Tasting Notes',[
      e.first_impression_notes?'<div class="detail-field"><div class="detail-label">Pre-light</div><div class="detail-value" style="white-space:pre-wrap">'+esc(e.first_impression_notes)+'</div></div>':'',
      e.first_third_notes?'<div class="detail-field"><div class="detail-label">First Third</div><div class="detail-value" style="white-space:pre-wrap">'+esc(e.first_third_notes)+'</div></div>':'',
      e.second_third_notes?'<div class="detail-field"><div class="detail-label">Second Third</div><div class="detail-value" style="white-space:pre-wrap">'+esc(e.second_third_notes)+'</div></div>':'',
      e.final_third_notes?'<div class="detail-field"><div class="detail-label">Final Third</div><div class="detail-value" style="white-space:pre-wrap">'+esc(e.final_third_notes)+'</div></div>':''
    ]);
    h+=dSec('Construction',[dF('Draw',e.draw_quality),dF('Burn',e.burn_quality),dF('Strength',e.strength),dF('Body',e.body),dF('Nicotine Impact',e.nicotine_impact)]);
    h+=dSec('Ratings',[dFlames10('Flavor',e.flavor_score,'Taste, complexity, and character'),dFlames10('Construction',e.construction_score,'Build quality, ash, and smoke production'),dFlames10('Draw',e.draw_score,'Airflow and resistance'),dFlames10('Burn',e.burn_score,'Evenness and consistency'),dFlames10('Aroma',e.aroma_score,'Foot, smoke, and room note'),dFlames10('Strength',e.strength_score,'Nicotine and body level'),dFlames10('Overall Enjoyment',e.enjoy_score,'Total smoking satisfaction')]);
    h+=dSec('Decisions',[dF('Buy Again?',capitalize(e.would_buy_again)),dF('Box Worthy?',capitalize(e.box_worthy))]);
  }else if(cat==='whiskey'){
    h+=dSec('The Bottle',[dF('Type',e.spirit_type),dF('Distillery',e.distillery_producer),dF('Age',e.age_statement),dF('Proof / ABV',e.proof_abv),dF('Mashbill',e.mashbill),dF('Batch / Release',e.batch_barrel_release_info)]);
    h+=dSec('Session',[dF('Serve Style',e.serve_style),dF('Glassware',e.glassware),dF('Occasion',e.occasion_setting),dF('Location',e.location),dF('Pairing',e.pairing)]);
    var wn=e.nose_notes||e.palate_notes||e.finish_notes||e.mouthfeel_notes||e.balance_complexity_notes;
    if(wn)h+=dSec('Tasting Notes',[
      e.nose_notes?'<div class="detail-field"><div class="detail-label">Nose</div><div class="detail-value" style="white-space:pre-wrap">'+esc(e.nose_notes)+'</div></div>':'',
      e.palate_notes?'<div class="detail-field"><div class="detail-label">Palate</div><div class="detail-value" style="white-space:pre-wrap">'+esc(e.palate_notes)+'</div></div>':'',
      e.finish_notes?'<div class="detail-field"><div class="detail-label">Finish</div><div class="detail-value" style="white-space:pre-wrap">'+esc(e.finish_notes)+'</div></div>':'',
      e.mouthfeel_notes?'<div class="detail-field"><div class="detail-label">Mouthfeel</div><div class="detail-value" style="white-space:pre-wrap">'+esc(e.mouthfeel_notes)+'</div></div>':'',
      e.balance_complexity_notes?'<div class="detail-field"><div class="detail-label">Balance &amp; Complexity</div><div class="detail-value" style="white-space:pre-wrap">'+esc(e.balance_complexity_notes)+'</div></div>':''
    ]);
    h+=dSec('Ratings',[dFlames10('Nose',e.nose_score,'Aroma complexity and character'),dFlames10('Palate',e.palate_score,'Flavor depth and development'),dFlames10('Finish',e.finish_score,'Length, quality, and persistence'),dFlames10('Balance',e.balance_score,'Harmony, complexity, and integration'),dFlames10('Value',e.value_score,'Price vs. quality'),dFlames10('Overall Enjoyment',e.enjoy_score,'Total drinking satisfaction')]);
    h+=dSec('Decisions',[dF('Buy Again?',capitalize(e.would_buy_again)),dF('Worth the Hunt?',capitalize(e.would_hunt_again)),dF('Bottle Status',e.bottle_status_tag)]);
  }
  if(e.overall_thoughts)h+=dSec('Overall Thoughts',['<div class="detail-value">'+esc(e.overall_thoughts)+'</div>']);
  if(e.location)h+=dSec('Location',['<div class="detail-value">'+esc(e.location)+'</div>']);
  if(e.tags&&e.tags.length)h+=dSec('Tags',['<div class="component-tags">'+e.tags.map(function(t){return'<span class="component-tag">'+esc(t)+'</span>';}).join('')+'</div>']);
  h+='<hr class="divider-dots" style="margin-top:20px"><button class="edit-btn" onclick="editCurrentEntry()">Edit Entry</button>'
    +'<button class="delete-btn" onclick="deleteEntry(\''+id+'\',\''+cat+'\')">Delete Entry</button>';
  document.getElementById('detail-content').innerHTML=h;
}

function handleTagInput(e){
  if(e.key==='Enter'||e.key===','){
    e.preventDefault();
    var inp=document.getElementById('tag-input'),val=inp.value.trim().replace(/,+$/,'');
    if(val&&currentTags.indexOf(val)===-1){currentTags.push(val);renderTagChips();}
    inp.value='';
  }
}
function removeTag(tag){currentTags=currentTags.filter(function(t){return t!==tag;});renderTagChips();}
function renderTagChips(){
  var el=document.getElementById('tag-chips');if(!el)return;
  el.innerHTML=currentTags.map(function(t){return'<span class="tag-chip">'+esc(t)+'<span class="tag-chip-x" onclick="removeTag(\''+t.replace(/'/g,"\\'")+'\')">&times;</span></span>';}).join('');
}

var POPULAR_BLENDS=['Amphora Full Aroma','Amphora Original Blend',"Ashton Artisan's Blend",'Balkan Sobranie','Borkum Riff Bourbon Whiskey','Captain Black Gold','Captain Black Regular','Cornell & Diehl Autumn Evening','Cornell & Diehl Billy Budd','Cornell & Diehl Burley Flake','Cornell & Diehl Pegasus','Cornell & Diehl Plum Pudding','Davidoff Danish Mixture','Dunhill Early Morning Pipe','Dunhill Elizabethan Mixture','Dunhill London Mixture','Dunhill My Mixture 965','Dunhill Nightcap','Dunhill Royal Yacht','Esoterica Margate','Esoterica Pembroke','Esoterica Penzance','Esoterica Tilbury','Frog Morton on the Bayou','G.L. Pease Cairo','G.L. Pease Caravan',"G.L. Pease Haddo's Delight",'G.L. Pease Odyssey','G.L. Pease Quiet Nights','Half and Half','Lane 1-Q','Lane BCA','MacBaren HH Burley Flake','MacBaren HH Old Dark Fired','MacBaren HH Scottish Blend','MacBaren Navy Flake','MacBaren Virginia Flake','Orlik Dark Strong Kentucky','Orlik Golden Sliced','Peter Stokkebye English Aromatic','Peter Stokkebye Luxury Navy Flake','Peterson Irish Flake','Peterson Nightcap','Prince Albert',"Rattray's Hal o' the Wynd","Rattray's Old Gowrie","Samuel Gawith Best Brown Flake","Samuel Gawith Full Virginia Flake",'Samuel Gawith Grousemoor','Samuel Gawith Squadron Leader','Seattle Pipe Club Plum Pudding','Solani Aged Burley Flake','Solani Virginia/Perique','Stanwell Melange','W.O. Larsen Mixture No. 50'];
var PIPE_BRANDS=['Ashton Sovereign','Barling Exquisite','Bjarne Viking','Brebbia Rustica','Brigham Mountaineer','Butz-Choquin Montbriar','Castello Sea Rock Briar','Chacom Atlas','Chacom Montmartre',"Comoy's London Pride",'Dr. Grabow Grand Duke','Dunhill Bruyere','Dunhill Cumberland','Dunhill Shell Briar','Dunhill Tanshell','GBD Prehistoric','Kaywoodie Super Grain','Mastro de Paja','Missouri Meerschaum Country Gentleman','Missouri Meerschaum Legend','Nording Hunting','Peterson 999','Peterson Aran','Peterson Dublin','Peterson Donegal Rocky','Peterson Killarney','Peterson Sherlock Holmes','Peterson System Standard','Radice Rind','Savinelli Autograph','Savinelli Roma','Savinelli Tortuga','Savinelli Tre Stelle','Ser Jacopo Picta','Stanwell De Luxe','Stanwell Trio','Tsuge Ikebana'];
function getAllBlends(){var u=[...new Set(loadEntries('pipe').map(function(e){return e.blend_name;}).filter(Boolean))];return[...new Set([...u,...POPULAR_BLENDS])].sort();}
function allPipesLegacy(){var u=[...new Set(loadEntries('pipe').map(function(e){return e.pipe_used;}).filter(Boolean))];return[...new Set([...u,...PIPE_BRANDS])].sort();}
function hlMatch(text,q){if(!q)return text;var i=text.toLowerCase().indexOf(q);if(i===-1)return text;return text.slice(0,i)+'<strong style="color:var(--gold)">'+text.slice(i,i+q.length)+'</strong>'+text.slice(i+q.length);}

function bindSearch(){
  var input=document.getElementById('entry-search');
  var panel=document.getElementById('search-panel');
  var toggle=document.getElementById('search-toggle-btn');
  if(!input)return;
  if(toggle&&panel){
    toggle.addEventListener('click',function(){
      var isOpen=!panel.classList.contains('hidden');
      panel.classList.toggle('hidden',isOpen);
      toggle.setAttribute('aria-expanded',String(!isOpen));
      if(!isOpen){
        input.focus();
      }else if(!currentSearch){
        input.value='';
      }
    });
  }
  input.addEventListener('input',function(){
    currentSearch=input.value.trim();
    renderList();
  });
}

function bindWantToTryInputs(){
  ['pipe','cigar','whiskey'].forEach(function(cat){
    var input=document.getElementById('col-wtt-'+cat+'-input');
    if(!input)return;
    input.addEventListener('keydown',function(e){
      if(e.key==='Enter'){
        e.preventDefault();
        addWantToTry(cat);
      }
    });
  });
}

function initializeApp(){
  migrate();
  bindSearch();
  bindWantToTryInputs();
  renderList();
}

initializeApp();
