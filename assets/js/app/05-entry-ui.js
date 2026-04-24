window.AppEntries = window.AppEntries || {};

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
window.AppEntries.buildForm = buildForm;

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
window.AppEntries.fillForm = fillForm;

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
  saveEntries(cat,entries);currentEntryId=entry.id;currentEntryCategory=cat;window.AppNav.showDetail(entry.id,cat);
}
window.AppEntries.save = saveEntry;
function deleteEntry(id,cat){
  if(!confirm('Delete this entry? This cannot be undone.'))return;
  saveEntries(cat,loadEntries(cat).filter(function(e){return e.id!==id;}));window.AppNav.showList();
}
window.AppEntries.remove = deleteEntry;
function editCurrentEntry(){
  if(!currentEntryId||!currentEntryCategory)return;
  isNewEntry=false;window.AppNav.showForm(currentEntryCategory);
  document.getElementById('entry-id').value=currentEntryId;
}
window.AppEntries.editCurrent = editCurrentEntry;

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
window.AppEntries.renderDetail = renderDetail;

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
window.AppEntries.bindSearch = bindSearch;

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
window.AppEntries.bindWantToTryInputs = bindWantToTryInputs;

function initializeApp(){
  migrate();
  bindSearch();
  bindWantToTryInputs();
  window.AppEntries.renderList();
}
window.App.initialize = initializeApp;

initializeApp();
