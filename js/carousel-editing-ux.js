(() => {
'use strict';
const W=window.Washi=window.Washi||{},T=W.Templates,E=W.Editor,DB=W.DB;
if(!T?.TEMPLATES||!E||!DB||W.CarouselEditingUX)return;

const $=(s,r=document)=>r.querySelector(s);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const clone=v=>DB.clone?DB.clone(v):JSON.parse(JSON.stringify(v));
const SW=1080,SH=1350;
const WIDE_WINDOW_IDS=new Set(['curated-carousel-wide-window-1','curated-carousel-wide-window-2']);

function patchWideWindowTemplate(t){
 if(!t||!WIDE_WINDOW_IDS.has(String(t.id))||!t.carousel?.enabled)return false;
 const slides=Math.max(2,Number(t.carousel.slideCount)||3),objects=Array.isArray(t.objects)?t.objects:[];
 const source=objects.find(o=>o?.type==='placeholder'&&Math.abs(Number(o.x)||0)<2&&Math.abs(Number(o.y)||0)<2&&Number(o.w)>=SW*slides-2&&Number(o.h)>=SH-2);
 if(!source)return false;
 const at=objects.indexOf(source);
 const frames=Array.from({length:slides},(_,i)=>{
  const frame={...clone(source),id:DB.uid('obj'),x:i*SW,y:0,w:SW,h:SH,rotation:0,radius:0,label:`Slide ${i+1} photo`,fit:source.fit||'cover',visible:source.visible!==false,locked:false};
  delete frame.mediaId;delete frame.mediaType;delete frame.sampleMedia;delete frame.sampleSource;
  return frame;
 });
 objects.splice(at,1,...frames);
 t.objects=objects;
 t.tags=[...new Set([...(t.tags||[]),'individual photo frames','replaceable photos'])];
 t.frameEditing='per-slide-v1';
 return true;
}

const patchedTemplates=T.TEMPLATES.reduce((n,t)=>n+(patchWideWindowTemplate(t)?1:0),0);

const project=()=>E.getProject?.()||E.state?.project||null;
const active=()=>!!project()?.carousel?.enabled;

function ensureZoom(){
 let z=$('#washiCarouselZoom');
 if(z)return z;
 z=document.createElement('div');
 z.id='washiCarouselZoom';
 z.className='wce-zoom';
 z.hidden=true;
 z.setAttribute('aria-label','Canvas zoom controls');
 z.innerHTML='<button type="button" data-wce-zoom="out" aria-label="Zoom out">−</button><strong data-wce-zoom-label>100%</strong><button type="button" data-wce-zoom="in" aria-label="Zoom in">＋</button><button type="button" class="fit" data-wce-zoom="fit">Fit</button>';
 $('#editorView')?.append(z);
 return z;
}

function syncZoom(){
 const z=ensureZoom(),editor=$('#editorView');
 if(!z)return;
 z.hidden=!active()||!editor?.classList.contains('active');
 const label=$('[data-wce-zoom-label]',z);
 if(label)label.textContent=`${Math.round((Number(E.state?.zoom)||1)*100)}%`;
}

function setZoomCentered(next){
 const sc=$('#stageScroll'),old=Math.max(.001,Number(E.state?.zoom)||1),z=clamp(next,.06,1.6);
 if(!sc){E.setZoom(z);syncZoom();return}
 const cx=(sc.scrollLeft+sc.clientWidth/2)/old,cy=(sc.scrollTop+sc.clientHeight/2)/old;
 E.setZoom(z);
 requestAnimationFrame(()=>{
  sc.scrollTo({left:Math.max(0,cx*z-sc.clientWidth/2),top:Math.max(0,cy*z-sc.clientHeight/2),behavior:'auto'});
  syncZoom();
 });
}

function fitCarousel(){
 const q=project(),workspace=$('#editorWorkspace'),sc=$('#stageScroll');
 if(!q?.carousel?.enabled||!workspace||!sc){E.fit();syncZoom();return}
 if(q.carousel.view==='slide'){
  const sw=Number(q.carousel.slideWidth)||SW,sh=Number(q.carousel.slideHeight)||SH;
  const z=Math.min((workspace.clientWidth-56)/sw,(workspace.clientHeight-178)/sh,1);
  E.setZoom(z);
  sc.style.placeItems='center start';
  requestAnimationFrame(()=>{
   sc.scrollTo({left:(Number(q.carousel.activeSlide)||0)*sw*z,top:0,behavior:'auto'});
   syncZoom();
  });
 }else{
  sc.style.placeItems='center';
  E.fit();
  requestAnimationFrame(syncZoom);
 }
}

document.addEventListener('click',event=>{
 const target=event.target instanceof Element?event.target:null;
 const action=target?.closest('[data-wce-zoom]')?.dataset.wceZoom;
 if(!action||!active())return;
 event.preventDefault();event.stopPropagation();
 const current=Number(E.state?.zoom)||1;
 if(action==='in')setZoomCentered(current*1.25);
 else if(action==='out')setZoomCentered(current/1.25);
 else if(action==='fit')fitCarousel();
});

document.addEventListener('click',event=>{
 const target=event.target instanceof Element?event.target:null;
 if(target?.closest('#washiCarouselHUD,[data-route],#exitEditor'))requestAnimationFrame(syncZoom);
});
for(const evt of ['washi:selection-changed','washi:project-saved','washi:experience-ready'])window.addEventListener(evt,()=>requestAnimationFrame(syncZoom));
window.addEventListener('resize',()=>requestAnimationFrame(syncZoom),{passive:true});

const css=document.createElement('style');
css.textContent=`
.wce-zoom{position:absolute;z-index:47;left:12px;top:calc(120px + var(--safe-top));display:flex;align-items:center;gap:3px;height:38px;padding:3px;border:1px solid var(--line);border-radius:13px;background:rgba(255,255,255,.96);box-shadow:var(--shadow-soft);backdrop-filter:blur(14px);pointer-events:auto}
.wce-zoom[hidden]{display:none}
.wce-zoom button{height:30px;min-width:32px;border:0;border-radius:9px;background:var(--pink-50);font-weight:900;color:var(--ink);padding:0 8px}
.wce-zoom button.fit{min-width:40px;color:var(--rose)}
.wce-zoom strong{min-width:45px;text-align:center;font-size:.68rem;color:var(--muted);font-variant-numeric:tabular-nums}
@media(max-width:430px){.wce-zoom{left:10px;top:calc(118px + var(--safe-top));height:36px}.wce-zoom button{height:28px;min-width:30px;padding:0 7px}.wce-zoom strong{min-width:42px;font-size:.64rem}}
`;
document.head.append(css);

ensureZoom();syncZoom();
W.CarouselEditingUX={version:'2026.08.16-r1',patchedTemplates,patchWideWindowTemplate,syncZoom,fit:fitCarousel};
})();
