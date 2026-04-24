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
  var colHint='<div class="collection-hint">Add pipes in <a onclick="window.AppCollection.show()">My Collection &#8862;</a></div>';
  var lighterHint='<div class="collection-hint">Add lighters in <a onclick="window.AppCollection.show()">My Collection &#8862;</a></div>';

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
