(() => {
'use strict';
const W=window.Washi=window.Washi||{},T=W.Templates;
if(!T?.TEMPLATES)return;
if(W.TemplateLibraryEnhanced){requestAnimationFrame(()=>W.TemplateLibraryEnhanced.render?.());return}
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
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
  'Photo Dump':'Photo & Recap',
  'Recap':'Photo & Recap',
  'Collage':'Photo & Recap',
  'Photographer':'Photo & Recap',
  'Birthday':'Love & Celebrations',
  'Wedding':'Love & Celebrations',
  'Couples':'Love & Celebrations',
  'Friends':'Love & Celebrations',
  'Celebrations':'Love & Celebrations',
  'Travel':'Travel',
  'Food':'Lifestyle & Wellness',
  'Sports & Fitness':'Lifestyle & Wellness',
  'Seasonal':'Lifestyle & Wellness',
  'Fashion':'Fashion & Beauty',
  'Beauty':'Fashion & Beauty',
  'Quotes':'Words & Games',
  'Prompts':'Words & Games',
  'Story Game':'Words & Games',
  'Vision Board':'Moodboards & Goals',
  'Moodboard':'Moodboards & Goals',
  'Film':'Film, Journal & Scrapbook',
  'Film & Instant':'Film, Journal & Scrapbook',
  'Instant':'Film, Journal & Scrapbook',
  'Journal':'Film, Journal & Scrapbook',
  'Scrapbook':'Film, Journal & Scrapbook',
  'Editorial':'Editorial & UI',
  'Faux UI':'Editorial & UI',
  'Marketing':'Business & Events',
  'Announcement':'Business & Events',
  'Seamless Carousel':'Carousels',
  'Carousel':'Carousels'
};

function parentFor(t){
  const original=t.originalCategory||t.subcategory||t.category||'Template';
  return GROUP[original]||original;
}

function regroup(){
  const used=new Set();
  for(const t of T.TEMPLATES){
    const original=t.originalCategory||t.subcategory||t.category||'Template';
    const group=GROUP[original]||original;
    // Keep the semantic template category intact. Parent categories are browsing
    // metadata only; creation/recommendation logic may depend on the original type.
    t.originalCategory=original;
    t.subcategory=original;
    t.parentCategory=group;
    used.add(group);
    const tags=new Set(t.tags||[]);
    tags.add(original.toLowerCase());
    tags.add(group.toLowerCase());
    t.tags=[...tags];
  }
  const extras=[...used].filter(c=>!ORDER.includes(c)).sort((a,b)=>a.localeCompare(b));
  if(Array.isArray(T.CATEGORIES))T.CATEGORIES.splice(0,T.CATEGORIES.length,...ORDER.filter(c=>used.has(c)),...extras);
  T.TEMPLATE_COUNT=T.TEMPLATES.length;
  return {used,extras};
}

const grouped=regroup();
const oldActive=$('#templateChips [data-template-category].active')?.dataset.templateCategory||'All';
const state={category:GROUP[oldActive]||oldActive,query:($('#templateSearch')?.value||'').trim(),rendered:0};
const esc=v=>String(v??'').replace(/[&<>'\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[m]));
const bgStyle=b=>!b?'#fff':b.type==='solid'?b.value:b.type==='gradient'?b.value:b.color||'#fffaf5';

function allMatches(){
  const q=state.query.toLowerCase();
  return nativeFilter.call(T.TEMPLATES,t=>{
    if(state.category!=='All'&&parentFor(t)!==state.category)return false;
    if(!q)return true;
    const haystack=`${t.title||''} ${t.category||''} ${t.parentCategory||''} ${t.subcategory||''} ${t.originalCategory||''} ${t.collection||''} ${(t.tags||[]).join(' ')}`.toLowerCase();
    return haystack.includes(q);
  });
}

function categoryCounts(){
  const counts=new Map();
  for(const t of T.TEMPLATES){
    const group=parentFor(t);
    counts.set(group,(counts.get(group)||0)+1);
  }
  return counts;
}

function syncChips(){
  const row=$('#templateChips');
  if(!row)return;
  const counts=categoryCounts();
  const desired=['All',...ORDER.filter(c=>grouped.used.has(c)),...grouped.extras];
  if(state.category!=='All'&&!desired.includes(state.category))state.category='All';
  row.innerHTML=desired.map(key=>{
    const count=key==='All'?T.TEMPLATES.length:(counts.get(key)||0);
    return `<button class="chip ${key===state.category?'active':''}" data-template-category="${esc(key)}"><span>${esc(key)}</span><small>${count.toLocaleString()}</small></button>`;
  }).join('');
}

function templateCard(t){
  const fav=(W.DB?.getFavorites?.().templates||[]).includes(t.id);
  const count=(t.objects||[]).filter(o=>o.type==='placeholder').length;
  const label=(t.objects||[]).find(o=>o.type==='text')?.text||t.title||'Template';
  return `<article class="template-card" data-template-id="${esc(t.id)}" style="background:${esc(bgStyle(t.bg))}"><button class="favorite-button ${fav?'on':''}" data-favorite-template="${esc(t.id)}">${fav?'♥':'♡'}</button><div class="template-preview"><div style="position:absolute;inset:12% 13% auto;height:33%;border-radius:14px;background:rgba(255,255,255,.62)"></div>${count>1?'<div style="position:absolute;left:22%;right:8%;top:44%;height:25%;border-radius:12px;background:rgba(255,255,255,.5);transform:rotate(4deg)"></div>':''}</div><div class="template-card-content"><strong>${esc(label.slice(0,34))}</strong><small>${esc(t.subcategory||t.category||'Template')}</small></div></article>`;
}

function footerHtml(total){
  if(!total)return '';
  const shown=Math.min(state.rendered,total);
  const remaining=total-shown;
  return `<div class="washi-template-footer" id="washiTemplateFooter"><strong>Showing ${shown.toLocaleString()} of ${total.toLocaleString()}</strong>${remaining>0?`<button type="button" id="washiLoadMoreTemplates">Load ${Math.min(PAGE_SIZE,remaining).toLocaleString()} more</button>`:'<small>All matching templates are loaded.</small>'}</div>`;
}

function updateSummary(total){
  const p=$('#templatesView .page-heading p');
  if(!p)return;
  const scope=state.category==='All'?`${ORDER.length} browsing categories`:state.category;
  p.textContent=`${total.toLocaleString()} matching templates · ${T.TEMPLATES.length.toLocaleString()} total · ${scope}. Every template stays fully editable.`;
}

function render(reset=true){
  const lib=$('#templateLibrary');
  if(!lib)return;
  syncChips();
  const list=allMatches();
  if(reset)state.rendered=Math.min(PAGE_SIZE,list.length);
  else state.rendered=Math.min(Math.max(state.rendered,PAGE_SIZE),list.length);
  updateSummary(list.length);
  if(!list.length){
    lib.innerHTML='<div class="empty-state"><b>No matches</b><small>Try another search or category.</small></div>';
    return;
  }
  lib.innerHTML=list.slice(0,state.rendered).map(templateCard).join('')+footerHtml(list.length);
  window.dispatchEvent(new CustomEvent('washi:template-library-rendered',{detail:{total:list.length,shown:state.rendered,category:state.category,query:state.query}}));
}

function loadMore(){
  const lib=$('#templateLibrary');
  if(!lib)return;
  const list=allMatches(),start=state.rendered,end=Math.min(start+PAGE_SIZE,list.length);
  if(end<=start)return;
  const footer=$('#washiTemplateFooter',lib);
  footer?.insertAdjacentHTML('beforebegin',list.slice(start,end).map(templateCard).join(''));
  state.rendered=end;
  const next=$('#washiTemplateFooter',lib);
  if(next)next.outerHTML=footerHtml(list.length);
  updateSummary(list.length);
  window.dispatchEvent(new CustomEvent('washi:template-library-rendered',{detail:{total:list.length,shown:state.rendered,category:state.category,query:state.query}}));
}

function schedule(reset=true){requestAnimationFrame(()=>render(reset))}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  const cat=target.closest('[data-template-category]');
  if(cat&&cat.closest('#templateChips')){
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    state.category=cat.dataset.templateCategory||'All';
    state.rendered=0;
    return render(true);
  }
  if(target.closest('#washiLoadMoreTemplates')){
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return loadMore();
  }
  if(target.closest('[data-route="templates"]'))return schedule(true);
  if(target.closest('[data-favorite-template]'))return schedule(false);
},true);

document.addEventListener('input',event=>{
  if(event.target?.id!=='templateSearch')return;
  event.stopPropagation();
  event.stopImmediatePropagation();
  state.query=event.target.value.trim();
  state.rendered=0;
  render(true);
},true);

window.addEventListener('washi:templates-rendered',()=>schedule(false));

const css=document.createElement('style');
css.textContent=`
#templateChips .chip{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
#templateChips .chip small{font-size:.66rem;opacity:.7;font-weight:800}
.washi-template-footer{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 0 4px;text-align:center;color:var(--muted)}
.washi-template-footer strong{font-size:.78rem;color:var(--ink)}
.washi-template-footer button{min-height:44px;border:1px solid var(--line);border-radius:14px;background:#fff;padding:0 18px;font-weight:850;color:var(--ink)}
.washi-template-footer small{font-size:.72rem}
`;
document.head.append(css);

W.TemplateCategories={version:'v1.0',order:ORDER,groups:GROUP,count:T.TEMPLATES.length,parentFor,sync:()=>render(false)};
W.TemplateLibraryEnhanced={version:'v1.0-full-library',total:T.TEMPLATES.length,pageSize:PAGE_SIZE,state,render,loadMore};
schedule(true);
})();
