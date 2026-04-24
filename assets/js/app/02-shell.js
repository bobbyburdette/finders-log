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
window.AppNav = window.AppNav || {};
window.AppEntries = window.AppEntries || {};
window.AppNav.showView = showView;

function setBottomNav(tab){
  document.getElementById('bn-journal').classList.toggle('active',tab==='journal');
  document.getElementById('bn-collection').classList.toggle('active',tab==='collection');
}
window.AppNav.setBottomNav = setBottomNav;

function showList(){
  showView('view-list');
  setBottomNav('journal');
  try{
    window.AppEntries.renderList();
  }catch(err){
    console.error('renderList failed',err);
    var el=document.getElementById('entries-list');
    if(el){
      el.innerHTML='<div class="list-empty"><p>Something went wrong loading your journal.<br>Please refresh and try again.</p><button class="empty-btn" onclick="showPicker()">+ Log Your First Session</button></div>';
    }
  }
}
window.AppNav.showList = showList;

function showPicker(){isNewEntry=true;showView('view-picker');}
window.AppNav.showPicker = showPicker;

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
  window.AppEntries.buildForm(cat);
  showView('view-form');
  if(!isNewEntry&&currentEntryId){
    var entry=loadEntries(cat).find(function(e){return e.id===currentEntryId;});
    if(entry){currentTags=entry.tags||[];window.AppEntries.fillForm(cat,entry);}
  }else{
    var d=document.getElementById('f-entry_date');
    if(d)d.value=new Date().toISOString().split('T')[0];
  }
}
window.AppNav.showForm = showForm;

function showDetail(id,cat){
  currentEntryId=id;currentEntryCategory=cat;
  window.AppEntries.renderDetail(id,cat);
  showView('view-detail');
  var e=loadEntries(cat).find(function(x){return x.id===id;});
  var btn=document.getElementById('detail-fav-btn');
  if(btn&&e){btn.classList.toggle('is-fav',!!e.is_favorite);}
}
window.AppNav.showDetail = showDetail;

function backFromForm(){if(isNewEntry)showPicker();else showList();}
window.AppNav.backFromForm = backFromForm;

function catLabel(cat){return{pipe:'Pipe',cigar:'Cigar',whiskey:'Spirits'}[cat]||cat;}
window.AppFormat.catLabel = catLabel;
function catEmoji(cat){var imgs={pipe:'pipe.png',cigar:'cigar.png',whiskey:'whiskey.png'};return imgs[cat]?'<img src="'+imgs[cat]+'" style="width:52px;height:52px;object-fit:contain;vertical-align:middle">':'';}
window.AppFormat.catEmoji = catEmoji;
function catEmojiText(cat){return{pipe:'🪈',cigar:'🚬',whiskey:'🥃'}[cat]||'';}
window.AppFormat.catEmojiText = catEmojiText;
function entryName(e){
  if(e.category==='pipe')return e.blend_name||'Unnamed Blend';
  if(e.category==='cigar')return[e.brand,e.line_name].filter(Boolean).join(' ')||'Unnamed Cigar';
  if(e.category==='whiskey')return e.name||'Unnamed Pour';
  return'Untitled';
}
window.AppFormat.entryName = entryName;
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');}
window.AppFormat.esc = esc;
function formatDate(d){if(!d)return'';var p=d.split('-');return['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(p[1])-1]+' '+parseInt(p[2])+', '+p[0];}
window.AppFormat.formatDate = formatDate;
function capitalize(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}
window.AppFormat.capitalize = capitalize;

function setFilter(cat){
  currentFilter=cat;
  document.querySelectorAll('.filter-tab').forEach(function(t){t.classList.toggle('active',t.dataset.cat===cat);});
  window.AppEntries.renderList();
}
function setSort(s){
  currentSort=s;
  document.querySelectorAll('.sort-btn').forEach(function(b){b.classList.toggle('active',b.dataset.sort===s);});
  window.AppEntries.renderList();
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
  window.AppEntries.renderList();
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
      el.innerHTML='<div class="list-empty"><p>No entries match that search yet.</p><button class="empty-btn" onclick="showPicker()">+ Log a Session Instead</button></div>';
    } else if(currentSort==='faves'){
      el.innerHTML='<div class="list-empty"><p>Nothing favorited yet.<br>Tap ♥ on any entry to save it here.</p><button class="empty-btn" onclick="showPicker()">+ Log Your First Session</button></div>';
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
window.AppEntries.renderList = renderList;

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
