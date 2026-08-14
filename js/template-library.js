(() => {
'use strict';
const W=window.Washi=window.Washi||{}, T=W.Templates, DB=W.DB;
if(!T||!DB) return;
const nativeFilter=Array.prototype.filter;
const {text,shape,sticker,photo}=T.factories;

const THEMES=[
 {slug:'paper-white',name:'Paper White',bg:'#f7f7f4',paper:'#ffffff',ink:'#171717',accent:'#6b6b67',accent2:'#deded8'},
 {slug:'editorial-black',name:'Editorial Black',bg:'#111112',paper:'#29292b',ink:'#f8f8f6',accent:'#ffffff',accent2:'#55555a',dark:true},
 {slug:'cool-gray',name:'Cool Gray',bg:'#e9ecef',paper:'#ffffff',ink:'#343a40',accent:'#647481',accent2:'#bdc6cc'},
 {slug:'linen-cream',name:'Linen Cream',bg:'#f4ede2',paper:'#fffdf8',ink:'#544b42',accent:'#a98969',accent2:'#dbcbb6'},
 {slug:'warm-sand',name:'Warm Sand',bg:'#e9ddca',paper:'#f9f4e9',ink:'#4c4034',accent:'#9c7651',accent2:'#cdb493'},
 {slug:'terracotta',name:'Terracotta',bg:'#ead2c3',paper:'#fff8f3',ink:'#59382e',accent:'#b75e3f',accent2:'#d99a7d'},
 {slug:'sunset-orange',name:'Sunset Orange',bg:'#f7d8b0',paper:'#fff8ef',ink:'#61371f',accent:'#dd6d2d',accent2:'#f2a55f'},
 {slug:'butter-yellow',name:'Butter Yellow',bg:'#f5edbd',paper:'#fffdf3',ink:'#5a5026',accent:'#b89727',accent2:'#e4ce67'},
 {slug:'forest',name:'Forest',bg:'#dfe7d7',paper:'#f8fbf4',ink:'#283525',accent:'#557047',accent2:'#9ab083'},
 {slug:'sage',name:'Sage',bg:'#edf1e8',paper:'#fbfcf8',ink:'#465142',accent:'#72846a',accent2:'#b8c5af'},
 {slug:'olive',name:'Olive Press',bg:'#dedfcb',paper:'#f8f7ed',ink:'#444632',accent:'#777a45',accent2:'#b4b68c'},
 {slug:'ocean-blue',name:'Ocean Blue',bg:'#dfeaf5',paper:'#f8fbff',ink:'#294157',accent:'#3f7fb5',accent2:'#9ec0de'},
 {slug:'cobalt',name:'Cobalt',bg:'#dce4ff',paper:'#f8f9ff',ink:'#1b2d69',accent:'#345ad3',accent2:'#8da5ef'},
 {slug:'sky',name:'Sky',bg:'#edf7ff',paper:'#ffffff',ink:'#3d566b',accent:'#6da6d5',accent2:'#bddaf1'},
 {slug:'lavender',name:'Lavender',bg:'#eee9f7',paper:'#fcfaff',ink:'#524762',accent:'#8e73b5',accent2:'#cbbde2'},
 {slug:'night-plum',name:'Night Plum',bg:'#2d2430',paper:'#4a3a4b',ink:'#fff8fd',accent:'#d6a7d0',accent2:'#725b72',dark:true},
 {slug:'cherry-red',name:'Cherry Red',bg:'#f4d5d7',paper:'#fff9f9',ink:'#5b2026',accent:'#bd303c',accent2:'#df7b82'},
 {slug:'burgundy',name:'Burgundy',bg:'#e6d4d8',paper:'#fff8fa',ink:'#4c202b',accent:'#782f42',accent2:'#b07a87'},
 {slug:'blush',name:'Blush',bg:'#f8e8ee',paper:'#fffafb',ink:'#654b55',accent:'#c86f8d',accent2:'#edb7c9'},
 {slug:'chrome-y2k',name:'Chrome Y2K',bg:'#dce2e8',paper:'#f8fbfd',ink:'#26303a',accent:'#638ca9',accent2:'#b4c9d8'}
];

const PALETTES=[
 ['Paper & Ink',['#ffffff','#f4f2ed','#c9c5bd','#565451','#171717']],['Editorial Mono',['#0f0f10','#2b2b2d','#6e6e72','#d8d8d8','#ffffff']],
 ['Ocean Blue',['#f5f9ff','#d9e8fa','#88b4e0','#316ea8','#17324d']],['Cobalt',['#f5f7ff','#cbd7ff','#6d8df2','#2851c7','#14265f']],
 ['Forest',['#f6f8f2','#dce5d2','#94aa78','#526a42','#263421']],['Sage',['#fafbf7','#e4eadf','#b6c5ad','#73866c','#3e4a39']],
 ['Terracotta',['#fff8f3','#f3d8c8','#d89673','#a85438','#55352c']],['Sunset Orange',['#fff8ef','#ffe0ba','#f4a24c','#d56322','#6b361e']],
 ['Butter Yellow',['#fffdf4','#f9efb8','#e6cd57','#a88820','#55491e']],['Cherry Red',['#fff7f7','#f6d1d3','#df676d','#a92730','#54191d']],
 ['Burgundy',['#fff7f8','#e8c9ce','#a65a68','#6a2938','#32141c']],['Lavender',['#fcfaff','#ebe4f8','#c6b6e3','#8a72b0','#493b62']],
 ['Film Cream',['#fffaf0','#eadcc7','#c8a98d','#8a6f61','#3e3431']],['Blush',['#fff8fb','#fdeef4','#f7b7c9','#dc6b8e','#7b5361']]
].map(([name,colors])=>({name,colors}));

T.FORMATS.landscape={label:'Landscape',w:1920,h:1080};
T.PALETTES.splice(0,T.PALETTES.length,...PALETTES);

function recolorTemplate(t,i){
 const th=THEMES[i%THEMES.length];
 t.collection=th.name;t.palette={ink:th.ink,accent:th.accent,accent2:th.accent2,paper:th.paper};
 t.customizable={background:true,colors:true,typography:true,media:true,layout:true,layers:true};
 t.bg=i%6===2?{type:'gradient',value:`linear-gradient(${130+(i%5)*11}deg,${th.bg},${th.accent2})`}:{type:'solid',value:th.bg};
 (t.objects||[]).forEach((o,j)=>{o.locked=false;o.visible=o.visible!==false;
   if(o.type==='text'){o.color=(j%4===0&&!th.dark)?th.accent:th.ink;if(o.fontSize>90)o.color=th.ink}
   else if(o.type==='shape'){o.fill=j%3===0?th.accent2:th.paper;o.border=th.accent;o.borderWidth=Math.min(Number(o.borderWidth||0),3)}
   else if(o.type==='sticker')o.color=th.accent;
 });
 t.tags=[...new Set([...(t.tags||[]),th.slug,th.name.toLowerCase(),String(t.format||'story'),'editable','customizable'])];
}
T.TEMPLATES.forEach(recolorTemplate);

const EXTRA=[
 ['clean-collage','Clean Collage','Collage','portrait','clean'],['ten-plus','10+ Photos','Collage','portrait','many'],
 ['scrapbook-collage','Scrapbook Collage','Scrapbook','story','scrapbook'],['paper-collage','Paper Collage','Scrapbook','story','paper'],
 ['creator-essentials','Creator Essentials','Creator','portrait','creator'],['photographer-essentials','Photographer Essentials','Photographer','portrait','photographer'],
 ['seamless-carousel','Seamless Carousel','Carousel','landscape','carousel'],['real-estate-listing','New Listing','Real Estate','landscape','realestate'],
 ['square-grid','Square Grid','Collage','square','square'],['square-scrapbook','Square Scrapbook','Scrapbook','square','scrapbook'],
 ['square-editorial','Square Editorial','Editorial','square','creator'],['summer-recap','Summer Recap','Seasonal','portrait','summer']
];
function dims(format){return T.FORMATS[format]||T.FORMATS.story}
function addExtraObjects(kind,format,th){
 const {w:W,h:H}=dims(format), P=(x,y,w,h,r=18,rot=0,l='Add photo')=>photo(W*x,H*y,W*w,H*h,r,rot,l),
 B=(x,y,w,h,c=th.paper,r=18,e={})=>shape(W*x,H*y,W*w,H*h,c,r,e),
 X=(v,x,y,w,h,s=.05,c=th.ink,e={})=>text(v,W*x,H*y,W*w,H*h,W*s,c,e.font||'Georgia, serif',e),
 D=(v,x,y,s=.08)=>sticker(v,W*x,H*y,W*s,{color:th.accent});
 switch(kind){
  case'clean':return [X('clean collage',.07,.06,.86,.09,.065),P(.07,.2,.4,.32),P(.53,.2,.4,.32),P(.07,.56,.4,.32),P(.53,.56,.4,.32)];
  case'many':{let a=[X('camera roll',.06,.04,.88,.07,.05)];for(let i=0;i<12;i++)a.push(P(.06+(i%3)*.31,.16+Math.floor(i/3)*.19,.27,.16,8,0,`Photo ${i+1}`));return a}
  case'scrapbook':return [P(.08,.12,.4,.31,18,-5),P(.54,.09,.38,.28,18,4),P(.12,.5,.35,.27,18,3),P(.52,.46,.4,.34,18,-3),B(.1,.1,.25,.035,th.accent2,3,{rotation:-8}),B(.62,.43,.25,.035,th.accent2,3,{rotation:7}),X('little pieces',.08,.82,.55,.08,.06,th.ink,{italic:true}),D('✦',.82,.82,.08)];
  case'paper':return [B(.05,.06,.9,.88,th.paper,8),B(.08,.12,.54,.32,th.accent2,4,{rotation:-2}),P(.12,.16,.46,.25,10,-2),B(.39,.48,.52,.34,th.bg,4,{rotation:3}),P(.44,.53,.42,.25,10,3),X('paper collage',.1,.75,.48,.08,.05,th.ink,{italic:true}),D('📎',.8,.13,.07)];
  case'creator':return [X('CREATOR',.07,.06,.86,.08,.07,th.ink,{bold:true,letterSpacing:4}),P(.07,.2,.86,.43,16),X('ideas • behind the scenes • launches',.08,.67,.8,.07,.035),B(.08,.79,.36,.07,th.accent,999),X('NEW POST',.1,.81,.32,.04,.024,'#fff',{bold:true,align:'center'})];
  case'photographer':{let a=[X('PHOTOGRAPHER NOTES',.06,.05,.88,.07,.045,th.ink,{bold:true,letterSpacing:2})];for(let i=0;i<6;i++)a.push(P(.06+(i%2)*.46,.17+Math.floor(i/2)*.25,.4,.21,5,0,`Frame ${i+1}`));return a}
  case'carousel':return [X('seamless carousel',.04,.05,.92,.08,.055),P(.03,.18,.31,.69,10),P(.345,.18,.31,.69,10),P(.66,.18,.31,.69,10),X('one story • three panels',.35,.9,.3,.04,.026,th.ink,{align:'center'})];
  case'realestate':return [P(.03,.05,.6,.72,8),P(.65,.05,.32,.34,8),P(.65,.43,.32,.34,8),B(.04,.8,.93,.14,th.paper,12),X('NEW LISTING',.07,.825,.34,.05,.035,th.accent,{bold:true}),X('3 BED • 2 BATH • GREAT LIGHT',.43,.83,.48,.04,.025,th.ink,{align:'right'})];
  case'square':return [X('four frames',.07,.05,.86,.08,.06),P(.07,.2,.4,.32),P(.53,.2,.4,.32),P(.07,.56,.4,.32),P(.53,.56,.4,.32)];
  case'summer':return [X('summer recap',.07,.05,.86,.08,.06),P(.07,.18,.42,.34,16,-2),P(.53,.18,.4,.26,16,2),P(.54,.48,.39,.38,16,-2),P(.08,.57,.4,.28,16,2),D('☀️',.8,.05,.08)];
 }
 return [X('template',.08,.08,.84,.08,.06),P(.08,.22,.84,.6)];
}
if(!T.TEMPLATES.some(t=>t.id==='clean-collage-paper-white')){
 EXTRA.forEach(([slug,title,category,format,kind],ri)=>THEMES.forEach((th,ti)=>T.TEMPLATES.push({
   id:`${slug}-${th.slug}`,title:`${title} · ${th.name}`,category,format,collection:th.name,
   palette:{ink:th.ink,accent:th.accent,accent2:th.accent2,paper:th.paper},customizable:{background:true,colors:true,typography:true,media:true,layout:true,layers:true},
   tags:[slug.replaceAll('-',' '),category.toLowerCase(),format,th.slug,'editable','customizable'],
   bg:(ti+ri)%5===0?{type:'gradient',value:`linear-gradient(${135+(ri%4)*10}deg,${th.bg},${th.accent2})`}:{type:'solid',value:th.bg},
   objects:addExtraObjects(kind,format,th)
 })));
}

const GROUPS=[
 {id:'trends',title:'Trends',subtitle:'Fresh layouts for right now',categories:['Photo Dump','Editorial','Creator']},
 {id:'stories',title:'Stories',subtitle:'Everyday story layouts',formats:['story']},
 {id:'collage',title:'Collage',subtitle:'Clean, grids & lots of photos',categories:['Collage','Photo Dump']},
 {id:'scrapbook',title:'Scrapbook & Paper',subtitle:'Tape, ripped paper & layered memories',categories:['Scrapbook']},
 {id:'film',title:'Film & Instant',subtitle:'Film strips, contact sheets & Polaroids',categories:['Film','Instant']},
 {id:'recaps',title:'Recaps',subtitle:'Weeks, months, seasons & years',categories:['Recap','Seasonal']},
 {id:'travel',title:'Travel',subtitle:'Trips, postcards, tickets & diaries',categories:['Travel']},
 {id:'celebrations',title:'Celebrations',subtitle:'Birthdays, weddings & milestones',categories:['Birthday','Wedding','Announcement']},
 {id:'people',title:'Couples & Friends',subtitle:'Favorite people, favorite moments',categories:['Couples','Friends']},
 {id:'lifestyle',title:'Food, Fashion & Beauty',subtitle:'Daily favorites and lifestyle picks',categories:['Food','Fashion','Beauty']},
 {id:'creator',title:'Creator & Business',subtitle:'Content, launches, promos & announcements',categories:['Creator','Marketing']},
 {id:'photographer',title:'Photographer',subtitle:'Portfolio, grids & photo-first layouts',categories:['Photographer']},
 {id:'carousel',title:'Seamless Carousel',subtitle:'Wide layouts designed to flow',categories:['Carousel']},
 {id:'real-estate',title:'Real Estate',subtitle:'Listings, open houses & property stories',categories:['Real Estate']},
 {id:'journal',title:'Journal & Moodboards',subtitle:'Quotes, goals, prompts & vision boards',categories:['Quotes','Prompts','Vision Board']},
 {id:'games',title:'Story Games',subtitle:'Bingo, rankings & interactive prompts',categories:['Story Game']},
 {id:'digital',title:'Digital & Faux UI',subtitle:'Notes, messages, search & player layouts',categories:['Faux UI']},
 {id:'sports',title:'Sports & Fitness',subtitle:'Workout plans, recaps & match day',categories:['Sports & Fitness']}
];
T.GROUPS=GROUPS;T.COLLECTIONS=THEMES.map(x=>x.name);T.CATEGORIES=[...new Set(T.TEMPLATES.map(x=>x.category))];T.TEMPLATE_COUNT=T.TEMPLATES.length;T.LIBRARY_VERSION='2.1-diverse';
const originalFrom=T.fromTemplate;
T.fromTemplate=id=>{const p=originalFrom(id);if(p){p.objects=(p.objects||[]).map(o=>({...o,locked:false,visible:o.visible!==false}))}return p};

// Put genuinely different looks first on Home instead of one color family.
const first=[];for(let i=0;i<12;i++){const pick=T.TEMPLATES[i*61%T.TEMPLATES.length];if(pick&&!first.includes(pick))first.push(pick)}
if(first.length){const ids=new Set(first.map(x=>x.id)),rest=nativeFilter.call(T.TEMPLATES,x=>!ids.has(x.id));T.TEMPLATES.splice(0,T.TEMPLATES.length,...first,...rest)}

function installBrowser(){
 const search=document.querySelector('#templateSearch'),chips=document.querySelector('#templateChips'),lib=document.querySelector('#templateLibrary');
 if(!search||!chips||!lib||lib.dataset.diverseBrowser)return;lib.dataset.diverseBrowser='1';
 const state={group:'all',format:'all',limit:48};let rendering=false,queued=false;
 const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const fgroup=t=>t.format==='reel'?'story':t.format==='dump'?'portrait':t.format;
 const inGroup=(t,g)=>!g||(g.categories||[]).includes(t.category)||(g.formats||[]).includes(fgroup(t));
 const bg=b=>!b?'#fff':b.type==='gradient'?b.value:b.value||b.color||'#fff';
 const fmtName=t=>({story:'Story',reel:'Story',portrait:'Portrait',dump:'Portrait',square:'Square',landscape:'Landscape'}[t.format]||t.format);
 const num=v=>Number.isFinite(+v)?+v:0;
 function miniObj(o,t){const f=T.FORMATS[t.format]||T.FORMATS.story,x=num(o.x)/f.w*100,y=num(o.y)/f.h*100,w=num(o.w)/f.w*100,h=num(o.h)/f.h*100,r=num(o.rotation),c=`left:${x}%;top:${y}%;width:${w}%;height:${h}%;transform:rotate(${r}deg);opacity:${o.opacity??1}`;
  if(['placeholder','image','video'].includes(o.type)){const a=t.palette?.accent||'#789',b=t.palette?.accent2||'#ccd';return `<i class="wt-mini-photo" style="${c};background:linear-gradient(135deg,${a}66,${b}dd);border-radius:${Math.min(18,num(o.radius)/9)}px"><span>＋</span></i>`}
  if(o.type==='shape')return `<i class="wt-mini-shape" style="${c};background:${esc(o.fill||t.palette?.paper||'#fff')};border-radius:${Math.min(18,num(o.radius)/9)}px"></i>`;
  if(o.type==='sticker')return `<i class="wt-mini-sticker" style="${c}">${esc(o.content||'✦')}</i>`;
  if(o.type==='text'){const s=Math.max(6,Math.min(17,num(o.fontSize)/f.w*250));return `<i class="wt-mini-text" style="${c};font-size:${s}px;color:${esc(o.color||t.palette?.ink||'#222')};font-family:${esc(o.font||'system-ui')};font-weight:${o.bold?800:500};font-style:${o.italic?'italic':'normal'};text-align:${esc(o.align||'left')}">${esc(String(o.text||'').slice(0,42))}</i>`}return ''}
 function canvas(t,compact=false){return `<div class="wt-mini-canvas ${compact?'compact':''}" style="background:${bg(t.bg)}">${(t.objects||[]).slice(0,12).map(o=>miniObj(o,t)).join('')}</div>`}
 function card(t){const fav=DB.getFavorites().templates.includes(t.id),photos=(t.objects||[]).filter(o=>o.type==='placeholder').length;return `<article class="template-card wt-template" data-template-id="${esc(t.id)}" style="background:${bg(t.bg)}"><button class="favorite-button ${fav?'on':''}" data-favorite-template="${esc(t.id)}">${fav?'♥':'♡'}</button><div class="template-preview">${canvas(t)}</div><div class="template-card-content"><strong>${esc(t.title.split(' · ')[0])}</strong><small>${esc(t.collection)} · ${fmtName(t)}${photos?` · ${photos} photo${photos===1?'':'s'}`:''}</small></div></article>`}
 function diverse(list){const m=new Map;list.forEach(t=>{const k=t.collection||'Other';if(!m.has(k))m.set(k,[]);m.get(k).push(t)});const a=[...m.values()],out=[];for(let i=0,more=true;more;i++){more=false;for(const b of a)if(b[i]){out.push(b[i]);more=true}}return out}
 function matches(){const q=search.value.trim().toLowerCase(),g=state.group==='all'?null:GROUPS.find(x=>x.id===state.group);return nativeFilter.call(T.TEMPLATES,t=>(state.format==='all'||fgroup(t)===state.format)&&inGroup(t,g)&&(!q||`${t.title} ${t.category} ${t.collection} ${(t.tags||[]).join(' ')}`.toLowerCase().includes(q)))}
 function rep(g,i){const a=nativeFilter.call(T.TEMPLATES,t=>inGroup(t,g));return a[(i*17)%Math.max(1,a.length)]||T.TEMPLATES[i%T.TEMPLATES.length]}
 function discover(){return `<div class="wt-discover-title"><span>Discover</span><h2>Choose a category</h2><p>${T.TEMPLATE_COUNT.toLocaleString()} fully editable templates in neutral, dark, blue, green, earthy, bright, retro, film, and pink styles.</p></div><div class="wt-category-grid">${GROUPS.map((g,i)=>{const n=nativeFilter.call(T.TEMPLATES,t=>inGroup(t,g)).length;return `<button class="wt-category" data-wt-group="${g.id}"><span><b>${esc(g.title)}</b><small>${esc(g.subtitle)}</small><em>${n} templates</em></span>${canvas(rep(g,i),true)}</button>`}).join('')}</div>`}
 function render(){if(rendering)return;rendering=true;obs.disconnect();try{const all=diverse(matches()),q=search.value.trim();chips.innerHTML=['all','story','portrait','square','landscape'].map(f=>`<button class="chip ${state.format===f?'active':''}" data-wt-format="${f}">${f==='all'?'All':f[0].toUpperCase()+f.slice(1)}</button>`).join('');let d=document.querySelector('#wtDiscover');if(!d){d=document.createElement('div');d.id='wtDiscover';chips.parentNode.insertBefore(d,chips)}if(state.group==='all'&&!q)d.innerHTML=discover();else{const g=GROUPS.find(x=>x.id===state.group);d.innerHTML=g?`<div class="wt-group-head"><button data-wt-back>‹</button><div><span>Template category</span><h2>${esc(g.title)}</h2><p>${esc(g.subtitle)} · ${all.length} matches</p></div></div>`:`<div class="wt-discover-title"><h2>Search results</h2><p>${all.length} matches</p></div>`}const shown=all.slice(0,state.limit);lib.innerHTML=shown.length?shown.map(card).join(''):'<div class="empty-state wt-empty"><b>No templates found</b><small>Try another category, format, or search.</small></div>';if(all.length>shown.length)lib.insertAdjacentHTML('beforeend',`<button class="wt-more" data-wt-more>Show more <small>${shown.length} of ${all.length}</small></button>`)}finally{obs.observe(chips,{childList:true,subtree:true});obs.observe(lib,{childList:true,subtree:true});rendering=false}}
 function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;render()},0)}const obs=new MutationObserver(()=>{if(!rendering)schedule()});
 document.addEventListener('input',e=>{if(e.target===search){e.stopImmediatePropagation();state.limit=48;schedule()}},true);
 document.addEventListener('click',e=>{const g=e.target.closest('[data-wt-group]');if(g){e.preventDefault();e.stopImmediatePropagation();state.group=g.dataset.wtGroup;state.limit=48;search.value='';render();return}const f=e.target.closest('[data-wt-format]');if(f){e.preventDefault();e.stopImmediatePropagation();state.format=f.dataset.wtFormat;state.limit=48;render();return}if(e.target.closest('[data-wt-back]')){e.preventDefault();e.stopImmediatePropagation();state.group='all';state.limit=48;search.value='';render();return}if(e.target.closest('[data-wt-more]')){e.preventDefault();e.stopImmediatePropagation();state.limit+=48;render();return}if(e.target.closest('[data-favorite-template]'))setTimeout(render,0)});
 obs.observe(chips,{childList:true,subtree:true});obs.observe(lib,{childList:true,subtree:true});render();
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(installBrowser,0),{once:true});else setTimeout(installBrowser,0)}
})();
