(() => {
'use strict';
const W=window.Washi=window.Washi||{},E=W.Editor,DB=W.DB;
if(!E||!DB)return;
const $=(s,r=document)=>r.querySelector(s);
const SLIDES=3,SW=1080,SH=1350;

function patchNewDesignModal(){
  const content=$('#modalContent'),grid=$('.modal-grid',content);
  if(!content||!grid||grid.querySelector('[data-washi-new-carousel]'))return;
  const dump=grid.querySelector('[data-new-format="dump"]');
  const custom=grid.querySelector('[data-new-format="custom"]');
  if(!dump||!custom)return;

  const carousel=document.createElement('button');
  carousel.className='modal-option';
  carousel.dataset.newFormat='portrait';
  carousel.dataset.washiNewCarousel='1';
  carousel.innerHTML='<b>Carousel</b><small>3 slides · 1080 × 1350</small>';
  custom.replaceWith(carousel);

  const customWide=custom.cloneNode(true);
  customWide.classList.add('washi-custom-size-wide');
  customWide.innerHTML='<span><b>Custom size</b><small>Choose your own dimensions</small></span><strong aria-hidden="true">›</strong>';
  grid.after(customWide);
}

function convertCurrentProjectToCarousel(){
  const p=E.getProject?.();
  if(!p)return;
  p.name='Untitled Carousel';
  p.format='portrait';
  p.width=SW*SLIDES;
  p.height=SH;
  p.objects=[];
  p.drawings=[];
  p.carousel={enabled:true,slideCount:SLIDES,slideWidth:SW,slideHeight:SH,durations:Array(SLIDES).fill(3),activeSlide:0,view:'slide'};
  E.state.selectedId=null;
  DB.saveSettings({lastFormat:'carousel'});
  E.render();
  E.save();
  requestAnimationFrame(()=>E.fit());
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('[data-action="new-project"]'))requestAnimationFrame(patchNewDesignModal);
  if(target.closest('[data-washi-new-carousel]'))queueMicrotask(convertCurrentProjectToCarousel);
},true);

const css=document.createElement('style');
css.textContent=`
.washi-custom-size-wide{width:100%;min-height:54px;margin-top:10px;border:1px solid var(--line);border-radius:15px;background:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;text-align:left}
.washi-custom-size-wide span{display:grid;gap:2px}.washi-custom-size-wide b{font-size:.9rem}.washi-custom-size-wide small{color:var(--muted);font-size:.72rem}.washi-custom-size-wide strong{font-size:1.3rem;color:var(--rose)}
`;
document.head.append(css);
W.NewDesignCarousel={version:'v1.0',slides:SLIDES,slideWidth:SW,slideHeight:SH,patch:patchNewDesignModal};
})();
