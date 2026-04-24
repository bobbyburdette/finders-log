/* ---- COLLECTION ---- */
window.AppCollection = window.AppCollection || {};

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
window.AppCollection.load = loadCollection;
function saveCollection(col){window.AppStorage.collection.save(col);}
window.AppCollection.save = saveCollection;
function addCollectionItem(type){
  var inp=document.getElementById('col-'+type+'-input');
  var val=inp.value.trim();if(!val)return;
  var col=loadCollection();
  var key=type+'s';
  if(col[key].indexOf(val)===-1)col[key].push(val);
  saveCollection(col);inp.value='';renderCollection();
}
window.AppCollection.addItem = addCollectionItem;
function removeCollectionItem(type,val){
  var col=loadCollection();col[type+'s']=col[type+'s'].filter(function(x){return x!==val;});
  saveCollection(col);renderCollection();
}
window.AppCollection.removeItem = removeCollectionItem;
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
window.AppCollection.render = renderCollection;
function showColTab(tab){
  document.querySelectorAll('.col-tab').forEach(function(t){t.classList.toggle('active',t.dataset.tab===tab);});
  document.querySelectorAll('.col-panel').forEach(function(p){p.classList.toggle('active',p.id==='col-panel-'+tab);});
}
window.AppCollection.showTab = showColTab;
function showCollection(){
  showView('view-collection');
  setBottomNav('collection');
  try{
    window.AppCollection.render();
  }catch(err){
    console.error('renderCollection failed',err);
  }
}
window.AppCollection.show = showCollection;
