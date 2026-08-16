(() => {
'use strict';
const W=window.Washi=window.Washi||{},T=W.Templates;
if(!T?.TEMPLATES)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const SAMPLE_PHOTOS=[
 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=70',
 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=600&q=70'
];
const byId=new Map(T.TEMPLATES.map(t=>[String(t.id),t]));
function hash(v){let h=2166136261;for(const c of String(v||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function photoFor(t,index){return SAMPLE_PHOTOS[hash(`${t.id}:${index}`)%SAMPLE_PHOTOS.length]}
function bgStyle(bg){if(!bg)return'#fff';if(bg.type==='solid')return bg.value||'#fff';if(bg.type==='gradient')return bg.value||'#fff';return bg.color||'#fff'}
function viewport(t){
 if(t.carousel?.enabled){const w=Number(t.carousel.slideWidth)||1080,h=Number(t.carousel.slideHeight)||1350;return{x:0,y:0,w,h}}
 const f=T.FORMATS?.[t.format]||{};
 return{x:0,y:0,w:Number(t.width)||Number(f.w)||1080,h:Number(t.height)||Number(f.h)||1350};
}
function styleRect(o,v){
 const x=((Number(o.x)||0)-v.x)/v.w*100,y=((Number(o.y)||0)-v.y)/v.h*100,w=(Number(o.w)||0)/v.w*100,h=(Number(o.h)||0)/v.h*100;
 return{left:x,top:y,width:w,height:h,rotation:Number(o.rotation)||0};
}
function objectHtml(o,t,v,index){
 if(!o||o.visible===false)return'';
 const r=styleRect(o,v);
 if(r.left+r.width<-2||r.top+r.height<-2||r.left>102||r.top>102)return'';
 const common=`left:${r.left.toFixed(3)}%;top:${r.top.toFixed(3)}%;width:${Math.max(.3,r.width).toFixed(3)}%;height:${Math.max(.3,r.height).toFixed(3)}%;transform:rotate(${r.rotation}deg);opacity:${clamp(Number(o.opacity??1),0,1)}`;
 if(['placeholder','image','video'].includes(o.type)){
   const url=photoFor(t,index),radius=clamp(Number(o.radius)||0,0,500);
   return `<i class="wrp-media" style="${common};border-radius:${Math.min(28,radius/Math.max(1,v.w)*190).toFixed(1)}px;background-image:linear-gradient(rgba(255,255,255,.04),rgba(255,255,255,.04)),url('${url}')"></i>`;
 }
 if(o.type==='shape'){
   const fill=o.fill||'rgba(255,255,255,.75)',radius=clamp(Number(o.radius)||0,0,500);
   return `<i class="wrp-shape" style="${common};border-radius:${Math.min(28,radius/Math.max(1,v.w)*190).toFixed(1)}px;background:${esc(fill)}"></i>`;
 }
 if(o.type==='text'){
   const size=clamp((Number(o.fontSize)||56)/v.w*178,4,22),weight=o.bold?800:600,align=['left','center','right'].includes(o.align)?o.align:'left';
   return `<span class="wrp-text" style="${common};font-size:${size.toFixed(1)}px;color:${esc(o.color||'#4b3740')};font-family:${esc(o.font||'Georgia, serif')};font-weight:${weight};font-style:${o.italic?'italic':'normal'};text-align:${align};line-height:${Number(o.lineHeight)||1.05}">${esc(String(o.text||'Text').replace(/\n+/g,' ').slice(0,90))}</span>`;
 }
 if(o.type==='sticker'){
   const size=clamp((Number(o.fontSize)||Number(o.w)||70)/v.w*150,5,24);
   return `<span class="wrp-sticker" style="${common};font-size:${size.toFixed(1)}px;color:${esc(o.color||'#4b3740')}">${esc(o.content||'✦')}</span>`;
 }
 return'';
}
function previewHtml(t){
 const v=viewport(t),objects=(t.objects||[]).slice(0,32);
 return `<span class="washi-real-template-preview" style="background:${esc(bgStyle(t.bg))}">${objects.map((o,i)=>objectHtml(o,t,v,i)).join('')}<small class="wrp-sample-label">sample photos</small></span>`;
}
function renderCard(card){
 const id=card?.dataset?.templateId,t=byId.get(String(id||'')),host=card?.querySelector?.('.template-preview');
 if(!t||!host||host.dataset.washiRealPreview===String(t.id))return;
 host.dataset.washiRealPreview=String(t.id);host.innerHTML=previewHtml(t);card.classList.add('washi-real-preview-card');
}
function renderVisible(){for(const card of $$('.template-card[data-template-id]'))renderCard(card)}
let raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;renderVisible()})}
window.addEventListener('washi:template-library-rendered',schedule);
window.addEventListener('washi:templates-rendered',schedule);
document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;if(t.closest('[data-route="templates"],[data-route="home"],[data-route="saved"],[data-favorite-template]'))schedule()},true);
setTimeout(schedule,120);

const css=document.createElement('style');css.textContent=`
.template-preview{overflow:hidden}.washi-real-template-preview{position:absolute;inset:0;display:block;overflow:hidden;isolation:isolate}.washi-real-template-preview>*{position:absolute;display:block;box-sizing:border-box}.wrp-media{background-color:rgba(255,255,255,.72);background-size:cover;background-position:center;box-shadow:inset 0 0 0 1px rgba(70,45,55,.05)}.wrp-shape{box-shadow:0 1px 3px rgba(60,35,45,.04)}.wrp-text{overflow:hidden;white-space:normal;word-break:break-word;text-shadow:0 1px 1px rgba(255,255,255,.08)}.wrp-sticker{display:grid!important;place-items:center;overflow:hidden}.wrp-sample-label{left:8px!important;bottom:7px!important;top:auto!important;width:auto!important;height:auto!important;z-index:9;padding:3px 5px;border-radius:999px;background:rgba(255,255,255,.72);backdrop-filter:blur(5px);color:rgba(75,55,64,.65);font-size:.48rem;font-weight:800;letter-spacing:.02em;text-transform:uppercase}.washi-real-preview-card .template-card-content{background:linear-gradient(180deg,transparent,rgba(255,255,255,.92) 45%,rgba(255,255,255,.98));margin-left:-16px;margin-right:-16px;margin-bottom:-16px;padding:48% 16px 15px}
`;
document.head.append(css);
W.TemplatePreviewSamples={version:'v1.0-real-layout-samples',render:renderVisible,photoPool:SAMPLE_PHOTOS.length};
})();