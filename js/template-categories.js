(() => {
'use strict';
const W=window.Washi=window.Washi||{},T=W.Templates;
if(!T?.TEMPLATES)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];

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
  'Birthday':'Love & Celebrations',
  'Wedding':'Love & Celebrations',
  'Couples':'Love & Celebrations',
  'Friends':'Love & Celebrations',
  'Travel':'Travel',
  'Food':'Lifestyle & Wellness',
  'Sports & Fitness':'Lifestyle & Wellness',
  'Fashion':'Fashion & Beauty',
  'Beauty':'Fashion & Beauty',
  'Quotes':'Words & Games',
  'Prompts':'Words & Games',
  'Story Game':'Words & Games',
  'Vision Board':'Moodboards & Goals',
  'Moodboard':'Moodboards & Goals',
  'Film':'Film, Journal & Scrapbook',
  'Film & Instant':'Film, Journal & Scrapbook',
  'Journal':'Film, Journal & Scrapbook',
  'Scrapbook':'Film, Journal & Scrapbook',
  'Editorial':'Editorial & UI',
  'Faux UI':'Editorial & UI',
  'Marketing':'Business & Events',
  'Announcement':'Business & Events',
  'Seamless Carousel':'Carousels',
  'Carousel':'Carousels'
};

function regroup(){
  const used=new Set();
  for(const t of T.TEMPLATES){
    const original=t.subcategory||t.originalCategory||t.category||'Template';
    const group=GROUP[original]||original;
    t.originalCategory=original;
    t.subcategory=original;
    t.category=group;
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

const state=regroup();
const byId=new Map(T.TEMPLATES.map(t=>[t.id,t]));

function makeChip(key){
  const b=document.createElement('button');
  b.className='chip';
  b.dataset.templateCategory=key;
  b.textContent=key;
  return b;
}

function syncChips(){
  const row=$('#templateChips');
  if(!row)return;
  const desired=['All',...ORDER.filter(c=>state.used.has(c)),...state.extras];
  const desiredSet=new Set(desired);
  const existing=$$('[data-template-category]',row);
  const buttons=new Map(existing.map(b=>[b.dataset.templateCategory,b]));
  const oldActive=existing.find(b=>b.classList.contains('active'))?.dataset.templateCategory||'All';
  const active=GROUP[oldActive]||oldActive;

  for(const b of existing){
    if(!desiredSet.has(b.dataset.templateCategory))b.remove();
  }

  for(const key of desired){
    let b=buttons.get(key);
    if(!b||!b.isConnected)b=makeChip(key);
    b.classList.toggle('active',key===active);
    row.append(b);
  }
}

function syncCardLabels(root=document){
  for(const card of $$('.template-card[data-template-id]',root)){
    const t=byId.get(card.dataset.templateId),small=$('.template-card-content small',card);
    if(t?.subcategory&&small)small.textContent=t.subcategory;
  }
}

function syncUI(){syncChips();syncCardLabels($('#templatesView')||document);syncCardLabels($('#homeTemplates')||document)}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('[data-route="templates"],[data-template-category]'))requestAnimationFrame(syncUI);
},true);
document.addEventListener('input',event=>{if(event.target?.id==='templateSearch')requestAnimationFrame(syncUI)});
window.addEventListener('washi:templates-rendered',()=>requestAnimationFrame(syncUI));
requestAnimationFrame(syncUI);

W.TemplateCategories={version:'v1.0',order:ORDER,groups:GROUP,count:T.TEMPLATES.length,sync:syncUI};
})();
