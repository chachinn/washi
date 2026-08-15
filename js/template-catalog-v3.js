(() => {
'use strict';
const W=window.Washi=window.Washi||{},C=W.WashiCatalogV3,T=W.Templates;
if(!C||!T||!Array.isArray(T.TEMPLATES))return;
if(T.__historyV3Recovered){delete W.WashiCatalogV3;return}
T.__historyV3Recovered=true;
const catalog=[];let ci=0;
for(const[cat,kinds,min,max,formats]of C.PROFILES){
  for(let i=0;i<43;i++){
    const r=C.rng(C.hash(`${cat}:${i}:washi-v3`)),f=formats[i%formats.length],th=C.THEMES[(ci*7+i*5+Math.floor(r()*C.THEMES.length))%C.THEMES.length],kind=kinds[(i*3+Math.floor(r()*kinds.length))%kinds.length],n=Math.max(min,Math.min(max,min+Math.floor(r()*(max-min+1)))),objects=(C.layoutA(kind,cat,f,th,r,n)||C.layoutB(kind,cat,f,th,r,n)||[]),photos=objects.filter(o=>o.type==='placeholder').length,sig=()=>objects.map(o=>`${o.type}:${Math.round(o.x)}:${Math.round(o.y)}:${Math.round(o.w||0)}:${Math.round(o.h||0)}:${Math.round(o.rotation||0)}`).join('|');
    catalog.push({id:`v3-${cat.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${String(i+1).padStart(2,'0')}`,title:`${(C.COPY[cat]||[cat])[0]} ${String(i+1).padStart(2,'0')}`,category:cat,format:f,collection:th.n,composition:kind,layoutSignature:sig(),source:'composition-first-v3',tags:[cat.toLowerCase(),kind,f,th.n.toLowerCase(),'original','editable','customizable','history restored',`${photos}-photos`],bg:{type:'solid',value:th.bg},palette:{ink:th.ink,accent:th.a,accent2:th.b,paper:th.paper},customizable:{background:true,colors:true,typography:true,media:true,layout:true,layers:true,spacing:true,rotation:true,opacity:true},objects});
  }
  ci++;
}

// The historical composition-first catalog predates Washi's true Carousel editor.
// Upgrade those old 1920×1080 wide concepts into real 3-slide 3240×1350 projects
// while retaining their original composition instead of exposing them as plain posts.
for(const t of catalog){
  if(t.category!=='Carousel')continue;
  const sx=3240/1920,sy=1350/1080;
  for(const o of t.objects||[]){o.x=Number(o.x||0)*sx;o.y=Number(o.y||0)*sy;o.w=Number(o.w||0)*sx;o.h=Number(o.h||0)*sy;if(o.fontSize)o.fontSize=Number(o.fontSize)*sy}
  t.format='portrait';
  t.carousel={enabled:true,slideCount:3,slideWidth:1080,slideHeight:1350,durations:[3,3,3],activeSlide:0,view:'slide'};
  t.tags=[...new Set([...(t.tags||[]),'true carousel','3 slides','1080x1350'])];
  t.layoutSignature=t.objects.map(o=>`${o.type}:${Math.round(o.x)}:${Math.round(o.y)}:${Math.round(o.w||0)}:${Math.round(o.h||0)}:${Math.round(o.rotation||0)}`).join('|');
}

const internalSeen=new Set();
for(const t of catalog){
  let s=t.layoutSignature,k=0;
  while(internalSeen.has(s)&&k<20){
    k++;const r=C.rng(C.hash(t.id+':'+k)),o=t.objects.find(x=>['placeholder','shape','text','sticker'].includes(x.type));
    if(!o)break;
    o.x+=7+Math.round(r()*23)+k;o.y+=5+Math.round(r()*19)+k;o.rotation=Number(o.rotation||0)+(r()-.5)*3;
    s=t.objects.map(x=>`${x.type}:${Math.round(x.x)}:${Math.round(x.y)}:${Math.round(x.w||0)}:${Math.round(x.h||0)}:${Math.round(x.rotation||0)}`).join('|');t.layoutSignature=s;
  }
  internalSeen.add(s);
}
const existingIds=new Set(T.TEMPLATES.map(t=>t.id)),existingSignatures=new Set(T.TEMPLATES.map(t=>t.layoutSignature).filter(Boolean));
const added=[];
for(const t of catalog){
  if(existingIds.has(t.id))continue;
  if(existingSignatures.has(t.layoutSignature))continue;
  added.push(t);existingIds.add(t.id);existingSignatures.add(t.layoutSignature);
}
const representatives=[],seenKinds=new Set();
for(const t of added){if(!seenKinds.has(t.composition)){seenKinds.add(t.composition);representatives.push(t)}if(representatives.length>=18)break}
const representativeIds=new Set(representatives.map(t=>t.id)),rest=added.filter(t=>!representativeIds.has(t.id));
T.TEMPLATES.splice(0,0,...representatives,...rest);
T.TEMPLATE_COUNT=T.TEMPLATES.length;
T.CATEGORIES=[...new Set(T.TEMPLATES.map(t=>t.category))];
T.COLLECTIONS=[...new Set(T.TEMPLATES.map(t=>t.collection).filter(Boolean))];
T.LIBRARY_VERSION='v1.0-cumulative-history-recovery';
W.TemplateHistoryRecovery={version:'20260816',compositionFirstAdded:added.length,total:T.TEMPLATES.length};
delete W.WashiCatalogV3;
})();
