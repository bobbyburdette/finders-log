(function initializeAppState() {
  window.App = window.App || {};
  var state = window.AppState || {
    currentEntryId: null,
    currentEntryCategory: null,
    isNewEntry: true,
    currentFilter: 'all',
    currentSort: 'newest',
    currentTags: [],
    currentSearch: ''
  };

  window.AppState = state;

  [
    'currentEntryId',
    'currentEntryCategory',
    'isNewEntry',
    'currentFilter',
    'currentSort',
    'currentTags',
    'currentSearch'
  ].forEach(function (key) {
    Object.defineProperty(window, key, {
      configurable: true,
      get: function () { return window.AppState[key]; },
      set: function (value) { window.AppState[key] = value; }
    });
  });
})();

window.AppData = window.AppData || {};
window.AppFormat = window.AppFormat || {};

function safeArray(value){return Array.isArray(value)?value:[];}
window.AppData.safeArray = safeArray;

function loadEntries(cat){return safeArray(window.AppStorage.entries.load(cat));}
window.AppData.loadEntries = loadEntries;

function saveEntries(cat,arr){window.AppStorage.entries.save(cat,arr);}
window.AppData.saveEntries = saveEntries;

function loadAllEntries(){
  return[...loadEntries('pipe').map(function(e){e.category='pipe';return e;}),
    ...loadEntries('cigar').map(function(e){e.category='cigar';return e;}),
    ...loadEntries('whiskey').map(function(e){e.category='whiskey';return e;})]
    .sort(function(a,b){return(b.entry_date||'').localeCompare(a.entry_date||'');});
}
window.AppData.loadAllEntries = loadAllEntries;

function generateId(){return Date.now().toString(36)+Math.random().toString(36).slice(2);}
window.AppData.generateId = generateId;

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
