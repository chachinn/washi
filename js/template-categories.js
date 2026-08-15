(() => {
'use strict';
const W=window.Washi=window.Washi||{},T=W.Templates;
if(!T?.TEMPLATES)return;
if(W.TemplateLibraryEnhanced){requestAnimationFrame(()=>W.TemplateLibraryEnhanced.render?.());return}
const $=(s,r=document)=>r.querySelector(s);
const nativeFilter=Array.prototype.filter;
const PAGE_SIZE=96;

const ORDER=[
  'Photo & Recap',
  'Carousels',
  'Love & Celebrations',
  'Travel',
  'Lifestyle & Wellness',
  'Fashion & Beauty',
  'Words & Games',
  'Moodboards & Goals',
  'Film, Journal & Scrapbook',
  'Editorial & UI',
  'Business & Events'
];

const GROUP={
  'Photo Dump':'Photo & Recap','Recap':'Photo & Recap','Collage':'Photo & Recap','Photographer':'Photo & Recap',
  'Birthday':'Love & Celebrations','Wedding':'Love & Celebrations','Couples':'Love & Celebrations','Friends':'Love & Celebrations','Celebrations':'Love & Celebrations',
  'Travel':'Travel',
  'Food':'Lifestyle & Wellness','Sports & Fitness':'Lifestyle & Wellness','Seasonal':'Lifestyle & Wellness',
  'Fashion':'Fashion & Beauty','Beauty':'Fashion & Beauty',
  'Quotes':'Words & Games','Prompts':'Words & Games','Story Game':'Words & Games',
  'Vision Board':'Moodboards & Goals','Moodboard':'Moodboards & Goals',
  'Film':'Film, Journal & Scrapbook','Film & Instant':'Film, Journal & Scrapbook','Instant':'Film, Journal & Scrapbook','Journal':'Film, Journal & Scrapbook','Scrapbook':'Film, Journal & Scrapbook',
  'Editorial':'Editorial & UI','Faux UI':'Editorial & UI',
  'Marketing':'Business & Events','Announcement':'Business & Events','Creator':'Business & Events','Real Estate':'Business & Events',
  'Seamless Carousel':'Carousels','Carousel':'Carousels'
};

const DESCRIPTIONS={
  'Photo & Recap':'Photo dumps, collages, recaps and photo-first layouts.',
  'Carousels':'Swipeable and seamless multi-slide storytelling.',
  'Love & Celebrations':'Birthdays, weddings, couples, friends and milestones.',
  'Travel':'Postcards, tickets, diaries and travel memories.',
  'Lifestyle & Wellness':'Food, seasonal moments, movement and everyday life.',
  'Fashion & Beauty':'Looks, favorites, shelves and editorial beauty stories.',
  'Words & Games':'Quotes, prompts, lists, games and text-led designs.',
  'Moodboards & Goals':'Vision boards, inspiration walls and future plans.',
  'Film, Journal & Scrapbook':'Film strips, instant prints, paper layers and journals.',
  'Editorial & UI':'Magazine layouts, faux interfaces and graphic compositions.',
  'Business & Events':'Creator posts, announcements, listings and launches.'
};

function parentFor(t){const original=t.originalCategory||t.subcategory||t.category||'Template';return GROUP[original]||original}
function browseFormat(t){const f=t.format||'story';return f==='reel'?'story':f==='dump'?'portrait':f}

function regroup(){
  const used=new Set();
  for(const t of T.TEMPLATES){
    const original=t.originalCategory||t.subcategory||t.category||'Template';
    const group=GROUP[original]||original;
    t.originalCategory=original;t.subcategory=original;t.parentCategory=group;used.add(group);
    const tags=new Set(t.tags||[]);tags.add(original.toLowerCase());tags.add(group.toLowerCase());t.tags=[...tags];
  }
  const extras=[...used].filter(c=>!ORDER.includes(c)).sort((a,b)=>a.localeCompare(b));
  if(Array.isArray(T.CATEGORIES))T.CATEGORIES.splice(0,T.CATEGORIES.length,...ORDER.filter(c=>used.has(c)),...extras);
  T.TEMPLATE_COUNT=T.TEMPLATES.length;
  return{used,extras};
}

const grouped=regroup();
const oldActive=$('#templateChips [data-template-category].active')?.dataset.templateCategory||'All';
const state={category:GROUP[oldActive]||oldActive,format:'all',query:($('#templateSearch')?.value||'').trim(),rendered:0};
const esc=v=>String(v??'').replace(/[&<>'\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[m]));
const bgStyle=b=>!b?'#fff':b.type==='solid'?b.value:b.type==='gradient'?b.value:b.color||'#fffaf5';

function allMatches(){
  const q=state.query.toLowerCase();
  return nativeFilter.call(T.TEMPLATES,t=>{
    if(state.category!=='All'&&parentFor(t)!==state.category)return false;
    if(state.format!=='all'&&browseFormat(t)!==state.format)return false;
    if(!q)return true;
    const haystack=`${t.title||''} ${t.category||''} ${t.parentCategory||''} ${t.subcategory||''} ${t.originalCategory||''} ${t.collection||''} ${(t.tags||[]).join(' ')}`.toLowerCase();
    return haystack.includes(q);
  });
}
function categoryCounts(){const counts=new Map();for(const t of T.TEMPLATES){const group=parentFor(t);counts.set(group,(counts.get(group)||0)+1)}return counts}

function miniObject(o,t){
  const d=T.FORMATS?.[t.format]||{w:1080,h:1350},sx=100/Math.max(1,d.w),sy=100/Math.max(1,d.h),left=Math.max(-8,Number(o.x||0)*sx),top=Math.max(-8,Number(o.y||0)*sy),w=Math.max(5,Number(o.w||60)*sx),h=Math.max(3,Number(o.h||60)*sy),rot=Number(o.rotation||0);
  if(['placeholder','image','video'].includes(o.type))return `<i class="wtp-media" style="left:${left}%;top:${top}%;width:${w}%;height:${h}%;transform:rotate(${rot}deg)"></i>`;
  if(o.type==='shape')return `<i class="wtp-shape" style="left:${left}%;top:${top}%;width:${w}%;height:${h}%;background:${esc(o.fill||'rgba(255,255,255,.72)')};transform:rotate(${rot}deg)"></i>`;
  if(o.type==='text')return `<i class="wtp-text" style="left:${left}%;top:${top}%;width:${Math.min(90,w)}%;transform:rotate(${rot}deg)"></i>`;
  return'';
}
function miniCanvas(t){return `<span class="washi-discover-preview" style="background:${esc(bgStyle(t?.bg))}">${(t?.objects||[]).slice(0,9).map(o=>miniObject(o,t)).join('')}</span>`}
function representative(category,index=0){const list=nativeFilter.call(T.TEMPLATES,t=>parentFor(t)===category);return list[(index*37)%Math.max(1,list.length)]||T.TEMPLATES[index%Math.max(1,T.TEMPLATES.length)]}

function ensureDiscover(){
  const chips=$('#templateChips');if(!chips)return null;
  let d=$('#washiTemplateDiscover');
  if(!d){d=document.createElement('section');d.id='washiTemplateDiscover';d.className='washi-template-discover';chips.parentNode.insertBefore(d,chips)}
  return d;
}
function syncDiscover(){
  const d=ensureDiscover();if(!d)return;
  const counts=categoryCounts(),showCards=state.category==='All'&&!state.query;
  d.innerHTML=`<div class="washi-discover-top"><div><span>Discover</span><h2>${showCards?'Choose a category':esc(state.category==='All'?'Template library':state.category)}</h2><p>${showCards?'Browse the full cumulative Washi library by what you want to make.':esc(DESCRIPTIONS[state.category]||'Search, filter and keep exploring.')}</p></div></div>
  ${showCards?`<div class="washi-discover-grid">${ORDER.filter(c=>grouped.used.has(c)).map((c,i)=>`<button type="button" class="washi-discover-card" data-discover-category="${esc(c)}"><span class="washi-discover-copy"><b>${esc(c)}</b><small>${esc(DESCRIPTIONS[c]||'Templates')}</small><em>${(counts.get(c)||0).toLocaleString()} templates</em></span>${miniCanvas(representative(c,i))}</button>`).join('')}</div>`:''}
  <div class="washi-format-filter" aria-label="Template format"><button class="${state.format==='all'?'active':''}" data-template-format="all">All formats</button><button class="${state.format==='story'?'active':''}" data-template-format="story">Story</button><button class="${state.format==='portrait'?'active':''}" data-template-format="portrait">Portrait</button><button class="${state.format==='square'?'active':''}" data-template-format="square">Square</button><button class="${state.format==='landscape'?'active':''}" data-template-format="landscape">Landscape</button></div>`;
}
function syncChips(){
  const row=$('#templateChips');if(!row)return;const counts=categoryCounts(),desired=['All',...ORDER.filter(c=>grouped.used.has(c)),...grouped.extras];
  if(state.category!=='All'&&!desired.includes(state.category))state.category='All';
  row.innerHTML=desired.map(key=>`<button class="chip ${key===state.category?'active':''}" data-template-category="${esc(key)}"><span>${esc(key)}</span><small>${(key==='All'?T.TEMPLATES.length:(counts.get(key)||0)).toLocaleString()}</small></button>`).join('');
}
function templateCard(t){
  const fav=(W.DB?.getFavorites?.().templates||[]).includes(t.id),count=(t.objects||[]).filter(o=>o.type==='placeholder').length,label=(t.objects||[]).find(o=>o.type==='text')?.text||t.title||'Template';
  return `<article class="template-card" data-template-id="${esc(t.id)}" style="background:${esc(bgStyle(t.bg))}"><button class="favorite-button ${fav?'on':''}" data-favorite-template="${esc(t.id)}">${fav?'♥':'♡'}</button><div class="template-preview">${miniCanvas(t)}</div><div class="template-card-content"><strong>${esc(String(label).replace(/\s+/g,' ').slice(0,34))}</strong><small>${esc(t.subcategory||t.category||'Template')}${count?` · ${count} photo${count===1?'':'s'}`:''}</small></div></article>`;
}
function footerHtml(total){if(!total)return'';const shown=Math.min(state.rendered,total),remaining=total-shown;return `<div class="washi-template-footer" id="washiTemplateFooter"><strong>Showing ${shown.toLocaleString()} of ${total.toLocaleString()}</strong>${remaining>0?`<button type="button" id="washiLoadMoreTemplates">Load ${Math.min(PAGE_SIZE,remaining).toLocaleString()} more</button>`:'<small>All matching templates are loaded.</small>'}</div>`}
function updateSummary(total){const p=$('#templatesView .page-heading p');if(!p)return;const scope=state.category==='All'?`${ORDER.length} browsing categories`:state.category;p.textContent=`${total.toLocaleString()} matching templates · ${T.TEMPLATES.length.toLocaleString()} total · ${scope}. Every template stays fully editable.`}

function render(reset=true){
  const lib=$('#templateLibrary');if(!lib)return;syncChips();syncDiscover();const list=allMatches();
  if(reset)state.rendered=Math.min(PAGE_SIZE,list.length);else state.rendered=Math.min(Math.max(state.rendered,PAGE_SIZE),list.length);updateSummary(list.length);
  if(!list.length){lib.innerHTML='<div class="empty-state"><b>No matches</b><small>Try another category, format, or search.</small></div>';return}
  lib.innerHTML=list.slice(0,state.rendered).map(templateCard).join('')+footerHtml(list.length);
  window.dispatchEvent(new CustomEvent('washi:template-library-rendered',{detail:{total:list.length,shown:state.rendered,category:state.category,format:state.format,query:state.query}}));
}
function loadMore(){const lib=$('#templateLibrary');if(!lib)return;const list=allMatches(),start=state.rendered,end=Math.min(start+PAGE_SIZE,list.length);if(end<=start)return;const footer=$('#washiTemplateFooter',lib);footer?.insertAdjacentHTML('beforebegin',list.slice(start,end).map(templateCard).join(''));state.rendered=end;const next=$('#washiTemplateFooter',lib);if(next)next.outerHTML=footerHtml(list.length);updateSummary(list.length)}
function schedule(reset=true){requestAnimationFrame(()=>render(reset))}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const discover=target.closest('[data-discover-category]');if(discover){event.preventDefault();event.stopImmediatePropagation();state.category=discover.dataset.discoverCategory||'All';state.rendered=0;return render(true)}
  const format=target.closest('[data-template-format]');if(format){event.preventDefault();event.stopImmediatePropagation();state.format=format.dataset.templateFormat||'all';state.rendered=0;return render(true)}
  const cat=target.closest('[data-template-category]');if(cat&&cat.closest('#templateChips')){event.preventDefault();event.stopImmediatePropagation();state.category=cat.dataset.templateCategory||'All';state.rendered=0;return render(true)}
  if(target.closest('#washiLoadMoreTemplates')){event.preventDefault();event.stopImmediatePropagation();return loadMore()}
  if(target.closest('[data-route="templates"]'))return schedule(true);
  if(target.closest('[data-favorite-template]'))return schedule(false);
},true);

document.addEventListener('input',event=>{if(event.target?.id!=='templateSearch')return;event.stopPropagation();event.stopImmediatePropagation();state.query=event.target.value.trim();state.rendered=0;render(true)},true);
window.addEventListener('washi:templates-rendered',()=>schedule(false));

const css=document.createElement('style');css.textContent=`
.washi-template-discover{margin:10px 0 14px}.washi-discover-top span{font-size:.7rem;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);font-weight:850}.washi-discover-top h2{margin:3px 0 3px;font-size:1.18rem}.washi-discover-top p{margin:0;color:var(--muted);font-size:.76rem;line-height:1.4}.washi-discover-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.washi-discover-card{min-width:0;min-height:126px;border:1px solid var(--line);border-radius:18px;background:#fff;padding:10px;display:grid;grid-template-columns:minmax(0,1fr) 72px;gap:8px;align-items:center;text-align:left;box-shadow:0 5px 18px rgba(70,42,51,.04)}.washi-discover-copy{min-width:0;display:grid;gap:4px}.washi-discover-copy b{font-size:.8rem;line-height:1.15}.washi-discover-copy small{font-size:.63rem;line-height:1.28;color:var(--muted)}.washi-discover-copy em{font-size:.62rem;font-style:normal;font-weight:850;color:var(--rose)}.washi-discover-preview{display:block;position:relative;width:100%;aspect-ratio:3/4;border-radius:11px;overflow:hidden;border:1px solid rgba(100,65,78,.08);contain:layout paint}.washi-discover-preview i{position:absolute;display:block}.washi-discover-preview .wtp-media{background:rgba(255,255,255,.7);border:1px solid rgba(100,65,78,.08);border-radius:5px}.washi-discover-preview .wtp-shape{border-radius:4px}.washi-discover-preview .wtp-text{height:3px!important;background:rgba(60,45,50,.46);border-radius:99px}.template-preview>.washi-discover-preview{position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto;border:0;border-radius:0}.washi-format-filter{display:flex;gap:7px;overflow-x:auto;padding:12px 1px 2px;-webkit-overflow-scrolling:touch}.washi-format-filter button{white-space:nowrap;min-height:36px;padding:0 11px;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--muted);font-size:.69rem;font-weight:800}.washi-format-filter button.active{background:var(--pink-100);color:var(--rose);border-color:rgba(200,79,119,.2)}#templateChips .chip{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}#templateChips .chip small{font-size:.66rem;opacity:.7;font-weight:800}.washi-template-footer{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 0 4px;text-align:center;color:var(--muted)}.washi-template-footer strong{font-size:.78rem;color:var(--ink)}.washi-template-footer button{min-height:44px;border:1px solid var(--line);border-radius:14px;background:#fff;padding:0 18px;font-weight:850;color:var(--ink)}.washi-template-footer small{font-size:.72rem}@media(max-width:360px){.washi-discover-grid{grid-template-columns:1fr}}@media(min-width:700px){.washi-discover-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
`;document.head.append(css);
W.TemplateCategories={version:'v1.0-cumulative',order:ORDER,groups:GROUP,count:T.TEMPLATES.length,parentFor,sync:()=>render(false)};
W.TemplateLibraryEnhanced={version:'v1.0-cumulative-history',total:T.TEMPLATES.length,pageSize:PAGE_SIZE,state,render,loadMore};
schedule(true);
})();
