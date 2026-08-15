(() => {
'use strict';
const W=window.Washi=window.Washi||{},T=W.Templates,E=W.Editor,DB=W.DB;
if(!T||!E||!DB)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const SLIDES=3,SW=1080,SH=1350;

function patchNewDesignModal(){
  const content=$('#modalContent'),grid=$('.modal-grid',content);
  if(!content||!grid||grid.querySelector('[data-washi-new-carousel]'))return;
  const dump=grid.querySelector('[data-new-format="dump"]');
  const custom=grid.querySelector('[data-new-format="custom"]');
  if(!dump||!custom)return;

  const carousel=document.createElement('button');
  carousel.className='modal-option';
  carousel.dataset.washiNewCarousel='1';
  carousel.type='button';
  carousel.innerHTML='<b>Carousel</b><small>3 slides · 1080 × 1350</small>';
  custom.replaceWith(carousel);

  const customWide=custom.cloneNode(true);
  customWide.classList.add('washi-custom-size-wide');
  customWide.innerHTML='<span><b>Custom size</b><small>Choose your own dimensions</small></span><strong aria-hidden="true">›</strong>';
  grid.after(customWide);
}

function makeBlankCarousel(){
  const p=T.newProject('portrait','Untitled Carousel');
  p.format='carousel';
  p.width=SW*SLIDES;
  p.height=SH;
  p.objects=[];
  p.drawings=[];
  p.carousel={enabled:true,slideCount:SLIDES,slideWidth:SW,slideHeight:SH,durations:Array(SLIDES).fill(3),activeSlide:0,view:'slide'};
  return p;
}

function enterEditor(p){
  DB.saveSettings({lastFormat:'carousel'});
  E.setProject(p);
  E.save({history:false});

  const drawer=$('#drawer'),modal=$('#modal'),panel=$('#editorPanel');
  drawer?.classList.remove('open');
  drawer?.setAttribute('aria-hidden','true');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  $$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view==='editor'));
  $$('.nav-item').forEach(v=>v.classList.remove('active'));
  panel?.classList.remove('open');
  panel?.setAttribute('aria-hidden','true');
  window.scrollTo({top:0,behavior:DB.getSettings().reducedMotion?'auto':'smooth'});

  requestAnimationFrame(()=>{
    E.render();
    const workspace=$('#editorWorkspace'),scroll=$('#stageScroll');
    if(workspace&&scroll){
      const z=Math.min((workspace.clientWidth-42)/SW,(workspace.clientHeight-175)/SH,1);
      if(Number.isFinite(z)&&z>0){E.setZoom(z);scroll.style.placeItems='center start';scroll.scrollTo({left:0,top:0,behavior:'auto'})}
      else E.fit();
    }else E.fit();
    window.dispatchEvent(new CustomEvent('washi:carousel-created',{detail:{id:p.id,slides:SLIDES}}));
  });
}

function createCarousel(){
  const p=makeBlankCarousel();
  enterEditor(p);
  return p;
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('[data-action="new-project"]'))requestAnimationFrame(patchNewDesignModal);
  const carousel=target.closest('[data-washi-new-carousel]');
  if(!carousel)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  createCarousel();
},true);

const css=document.createElement('style');
css.textContent=`
.washi-custom-size-wide{width:100%;min-height:54px;margin-top:10px;border:1px solid var(--line);border-radius:15px;background:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;text-align:left}
.washi-custom-size-wide span{display:grid;gap:2px}.washi-custom-size-wide b{font-size:.9rem}.washi-custom-size-wide small{color:var(--muted);font-size:.72rem}.washi-custom-size-wide strong{font-size:1.3rem;color:var(--rose)}
`;
document.head.append(css);
W.NewDesignCarousel={version:'v1.0',slides:SLIDES,slideWidth:SW,slideHeight:SH,patch:patchNewDesignModal,create:createCarousel};
})();
