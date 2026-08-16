(() => {
'use strict';
const W=window.Washi=window.Washi||{},E=W.Editor,DB=W.DB,X=W.Export;
if(!E||!DB||!X)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const MAX_SLIDES=20;
let previewFull=null,previewRAF=0,previewProgress=0,previewStartedAt=0,previewBusy=false;

const project=()=>E.getProject?.()||E.state?.project||null;
const active=()=>!!project()?.carousel?.enabled;
const uid=()=>DB.uid('obj');
function toast(text){
  const t=$('#toast'); if(!t)return;
  t.textContent=text;t.classList.add('show');
  clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2300);
}
function base(type,x,y,w,h,extra={}){
  return {id:uid(),type,x,y,w,h,rotation:0,opacity:1,visible:true,locked:false,...extra};
}
function placeholder(x,y,w,h,extra={}){
  return base('placeholder',x,y,w,h,{label:'Add photo',fit:'cover',radius:18,...extra});
}
function shape(x,y,w,h,fill,extra={}){
  return base('shape',x,y,w,h,{shape:'rect',fill,border:'transparent',borderWidth:0,radius:extra.radius||0,...extra});
}
function text(value,x,y,w,h,fontSize=54,color='#4b3740',extra={}){
  return base('text',x,y,w,h,{text:value,fontSize,color,font:extra.font||'Georgia, serif',align:extra.align||'left',bold:!!extra.bold,italic:!!extra.italic,lineHeight:extra.lineHeight||1.05,letterSpacing:extra.letterSpacing||0,effect:extra.effect||'none',...extra});
}
function slideBoxes(kind,sw,sh){
  const m=74,g=34;
  if(kind==='full')return [placeholder(m,m,sw-m*2,sh-m*2,{radius:28})];
  if(kind==='duo'){
    const w=(sw-m*2-g)/2;
    return [placeholder(m,m,w,sh-m*2,{radius:24}),placeholder(m+w+g,m,w,sh-m*2,{radius:24})];
  }
  if(kind==='grid'){
    const w=(sw-m*2-g)/2,h=(sh-m*2-g)/2;
    return [placeholder(m,m,w,h),placeholder(m+w+g,m,w,h),placeholder(m,m+h+g,w,h),placeholder(m+w+g,m+h+g,w,h)];
  }
  if(kind==='hero'){
    const topH=Math.round(sh*.61),bottomY=m+topH+g,w=(sw-m*2-g)/2;
    return [placeholder(m,m,sw-m*2,topH,{radius:24}),placeholder(m,bottomY,w,sh-bottomY-m,{radius:20}),placeholder(m+w+g,bottomY,w,sh-bottomY-m,{radius:20})];
  }
  if(kind==='collage'){
    return [
      shape(90,135,660,850,'#fffaf4',{rotation:-5,radius:8}),
      placeholder(112,155,616,760,{rotation:-5,radius:6}),
      shape(420,380,560,730,'#ffffff',{rotation:6,radius:8}),
      placeholder(442,400,516,640,{rotation:6,radius:6}),
      shape(120,955,350,46,'#e7c7d3',{rotation:-8,radius:3})
    ];
  }
  if(kind==='quote'){
    return [
      shape(0,0,sw,sh,'#f9e8ef'),
      text('a little note',95,145,700,90,48,'#b44e72',{italic:true}),
      text('make room for the moments you want to remember.',95,360,890,430,92,'#4b3740',{bold:true,lineHeight:.98}),
      text('— your words here',95,1110,650,60,34,'#8b717b')
    ];
  }
  return [];
}
const LAYOUTS=[
  ['blank','Blank','Keep the page completely open.'],
  ['full','Full photo','One edge-to-edge photo frame.'],
  ['duo','Split duo','Two balanced photo frames.'],
  ['hero','Hero + 2','One large photo with two supporting frames.'],
  ['grid','Photo grid','A clean four-photo grid.'],
  ['collage','Scrapbook','Layered instant-photo composition.'],
  ['quote','Quote card','A text-led page for a thought or caption.']
];

function addSlide(kind){
  const q=project();if(!q?.carousel?.enabled)return false;
  const c=q.carousel,current=Math.max(1,Number(c.slideCount)||1);
  if(current>=MAX_SLIDES){toast(`Carousels can have up to ${MAX_SLIDES} slides.`);return false}
  const sw=Number(c.slideWidth)||1080,sh=Number(c.slideHeight)||1350,index=current,x0=index*sw;
  const objects=slideBoxes(kind,sw,sh).map(o=>({...o,x:(Number(o.x)||0)+x0}));
  c.slideCount=current+1;
  c.durations=Array.from({length:c.slideCount},(_,i)=>Number(c.durations?.[i])||Number(c.durations?.[Math.max(0,i-1)])||3);
  c.activeSlide=index;c.view='slide';
  q.width=sw*c.slideCount;q.height=sh;
  q.objects=Array.isArray(q.objects)?q.objects:[];
  q.objects.push(...objects);
  E.state.selectedId=null;
  E.render();E.save();
  closeLayoutSheet();
  requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
  toast(`${LAYOUTS.find(x=>x[0]===kind)?.[1]||'New'} slide added`);
  return true;
}

function layoutIcon(kind){
  if(kind==='blank')return '<i class="wcs-blank"></i>';
  if(kind==='full')return '<i class="wcs-block full"></i>';
  if(kind==='duo')return '<i class="wcs-block left"></i><i class="wcs-block right"></i>';
  if(kind==='grid')return '<i class="wcs-block q1"></i><i class="wcs-block q2"></i><i class="wcs-block q3"></i><i class="wcs-block q4"></i>';
  if(kind==='hero')return '<i class="wcs-block hero"></i><i class="wcs-block mini1"></i><i class="wcs-block mini2"></i>';
  if(kind==='collage')return '<i class="wcs-paper p1"></i><i class="wcs-paper p2"></i>';
  return '<i class="wcs-quote">Aa</i>';
}
function layoutSheet(){
  let s=$('#washiSlideLayouts');if(s)return s;
  s=document.createElement('section');s.id='washiSlideLayouts';s.className='wcs-sheet';s.hidden=true;
  s.innerHTML=`<div class="wcs-backdrop" data-wcs-close></div><div class="wcs-card"><header><div><small>Add a slide</small><h2>Choose a layout</h2><p>Start with a useful composition, then edit everything normally.</p></div><button data-wcs-close aria-label="Close">×</button></header><div class="wcs-layout-grid">${LAYOUTS.map(([id,label,desc])=>`<button type="button" data-wcs-layout="${id}"><span class="wcs-layout-preview ${id}">${layoutIcon(id)}</span><b>${label}</b><small>${desc}</small></button>`).join('')}</div></div>`;
  document.body.append(s);return s;
}
function openLayoutSheet(){if(!active())return;layoutSheet().hidden=false}
function closeLayoutSheet(){const s=$('#washiSlideLayouts');if(s)s.hidden=true}

function previewSheet(){
  let s=$('#washiCarouselPreview');if(s)return s;
  s=document.createElement('section');s.id='washiCarouselPreview';s.className='wcs-preview-sheet';s.hidden=true;
  s.innerHTML=`<div class="wcs-backdrop" data-wcs-preview-close></div><div class="wcs-preview-card"><header><div><small>Carousel preview</small><h2>Preview as video</h2><p>See the same continuous seamless movement before you export.</p></div><button data-wcs-preview-close aria-label="Close">×</button></header><div class="wcs-player"><canvas id="washiCarouselPreviewCanvas" width="1080" height="1350"></canvas><div class="wcs-preview-loading" id="washiCarouselPreviewLoading">Preparing preview…</div></div><div class="wcs-preview-progress"><i id="washiCarouselPreviewBar"></i></div><div class="wcs-preview-controls"><button data-wcs-restart>↺ Restart</button><button class="primary" data-wcs-play>Pause</button><span id="washiCarouselPreviewTime">0.0s</span></div></div>`;
  document.body.append(s);return s;
}
function totalMs(q){
  const count=Math.max(1,Number(q?.carousel?.slideCount)||1);
  return Array.from({length:count},(_,i)=>clamp(Number(q.carousel?.durations?.[i])||3,.5,60)).reduce((sum,n)=>sum+n,0)*1000;
}
function drawPreview(progress){
  const q=project(),canvas=$('#washiCarouselPreviewCanvas');
  if(!q?.carousel?.enabled||!canvas||!previewFull)return;
  const c=q.carousel,sw=Number(c.slideWidth)||1080,sh=Number(c.slideHeight)||1350,maxX=Math.max(0,previewFull.width-sw),sx=clamp(maxX*progress,0,maxX);
  const ctx=canvas.getContext('2d',{alpha:false});
  ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(previewFull,sx,0,sw,sh,0,0,canvas.width,canvas.height);
  const bar=$('#washiCarouselPreviewBar'),time=$('#washiCarouselPreviewTime'),ms=totalMs(q);
  if(bar)bar.style.width=`${(progress*100).toFixed(2)}%`;
  if(time)time.textContent=`${((progress*ms)/1000).toFixed(1)}s / ${(ms/1000).toFixed(1)}s`;
}
function stopPreview(){if(previewRAF){cancelAnimationFrame(previewRAF);previewRAF=0}}
function setPlayLabel(text){const b=$('[data-wcs-play]');if(b)b.textContent=text}
function previewTick(now){
  const q=project();if(!q?.carousel?.enabled||!previewFull)return;
  const ms=totalMs(q),elapsed=now-previewStartedAt,base=previewProgress*ms,p=Math.min(1,(base+elapsed)/Math.max(1,ms));
  drawPreview(p);
  if(p>=1){previewProgress=1;previewRAF=0;setPlayLabel('Play');return}
  previewRAF=requestAnimationFrame(previewTick);
}
function playPreview(){
  if(!previewFull||previewRAF)return;
  if(previewProgress>=1)previewProgress=0;
  previewStartedAt=performance.now();setPlayLabel('Pause');previewRAF=requestAnimationFrame(previewTick);
}
function pausePreview(){
  if(!previewRAF)return;
  const q=project(),ms=totalMs(q),elapsed=performance.now()-previewStartedAt;
  previewProgress=Math.min(1,previewProgress+elapsed/Math.max(1,ms));
  stopPreview();drawPreview(previewProgress);setPlayLabel('Play');
}
async function openPreview(){
  if(!active()||previewBusy)return;
  const s=previewSheet();s.hidden=false;
  const loading=$('#washiCarouselPreviewLoading');if(loading){loading.hidden=false;loading.textContent='Preparing preview…'}
  stopPreview();previewProgress=0;previewFull=null;previewBusy=true;setPlayLabel('Pause');
  try{
    previewFull=await X.renderProject(project());
    const canvas=$('#washiCarouselPreviewCanvas'),c=project().carousel;
    canvas.width=Number(c.slideWidth)||1080;canvas.height=Number(c.slideHeight)||1350;
    if(loading)loading.hidden=true;drawPreview(0);playPreview();
  }catch(err){if(loading){loading.hidden=false;loading.textContent='Could not prepare preview.'}toast(err?.message||'Preview failed')}
  finally{previewBusy=false}
}
function closePreview(){stopPreview();previewFull=null;previewProgress=0;const s=$('#washiCarouselPreview');if(s)s.hidden=true}
function restartPreview(){stopPreview();previewProgress=0;drawPreview(0);playPreview()}

function patchHud(){
  const h=$('#washiCarouselHUD');if(!h)return;
  let slide=$('[data-carousel-studio-add-slide]',h);
  if(!slide){
    slide=$$('button',h).find(b=>/^\s*[+＋]\s*slide\s*$/i.test((b.textContent||'').trim()))||null;
    if(slide)slide.dataset.carouselStudioAddSlide='1';
    else{slide=document.createElement('button');slide.type='button';slide.dataset.carouselStudioAddSlide='1';slide.textContent='＋ Slide';h.append(slide)}
  }
  if(!$('[data-carousel-studio-preview]',h)){
    const preview=document.createElement('button');preview.type='button';preview.dataset.carouselStudioPreview='1';preview.textContent='▶ Preview';slide.after(preview);
  }
}
function schedulePatch(){requestAnimationFrame(patchHud)}

document.addEventListener('click',e=>{
  const t=e.target instanceof Element?e.target:null;if(!t)return;
  if(t.closest('[data-carousel-studio-add-slide]')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return openLayoutSheet()}
  const layout=t.closest('[data-wcs-layout]')?.dataset.wcsLayout;
  if(layout){e.preventDefault();return addSlide(layout)}
  if(t.closest('[data-wcs-close]'))return closeLayoutSheet();
  if(t.closest('[data-carousel-studio-preview]')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return openPreview()}
  if(t.closest('[data-wcs-preview-close]'))return closePreview();
  if(t.closest('[data-wcs-restart]'))return restartPreview();
  if(t.closest('[data-wcs-play]'))return previewRAF?pausePreview():playPreview();
},true);

for(const evt of ['washi:selection-changed','washi:project-saved','washi:carousel-created','washi:experience-ready'])window.addEventListener(evt,schedulePatch);
window.addEventListener('resize',schedulePatch,{passive:true});
setTimeout(schedulePatch,180);

const css=document.createElement('style');css.textContent=`
.wcs-sheet,.wcs-preview-sheet{position:fixed;inset:0;z-index:150}.wcs-sheet[hidden],.wcs-preview-sheet[hidden]{display:none}.wcs-backdrop{position:absolute;inset:0;background:rgba(47,31,38,.35);backdrop-filter:blur(6px)}
.wcs-card,.wcs-preview-card{position:absolute;left:10px;right:10px;bottom:calc(10px + var(--safe-bottom));max-height:min(82dvh,760px);overflow:auto;border:1px solid var(--line);border-radius:26px;background:#fffafd;padding:17px;box-shadow:0 26px 75px rgba(50,25,35,.24)}
.wcs-card header,.wcs-preview-card header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.wcs-card header small,.wcs-preview-card header small{color:var(--rose);text-transform:uppercase;letter-spacing:.08em;font-weight:900;font-size:.65rem}.wcs-card h2,.wcs-preview-card h2{margin:3px 0 2px}.wcs-card header p,.wcs-preview-card header p{margin:0;color:var(--muted);font-size:.75rem;line-height:1.35}.wcs-card header>button,.wcs-preview-card header>button{width:38px;height:38px;border:1px solid var(--line);border-radius:12px;background:#fff;font-size:1.2rem}
.wcs-layout-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:14px}.wcs-layout-grid>button{min-width:0;border:1px solid var(--line);border-radius:17px;background:#fff;padding:9px;text-align:left;display:grid;gap:5px}.wcs-layout-grid b{font-size:.78rem}.wcs-layout-grid small{color:var(--muted);font-size:.62rem;line-height:1.25}
.wcs-layout-preview{position:relative;display:block;height:92px;border-radius:12px;overflow:hidden;background:linear-gradient(145deg,var(--pink-50),var(--pink-100));border:1px solid rgba(120,75,90,.07)}.wcs-layout-preview i{position:absolute;display:block}.wcs-blank{inset:10px;border:1px dashed var(--pink-300);border-radius:9px}.wcs-block{background:#fff;border:1px solid rgba(90,60,70,.08);border-radius:7px}.wcs-block.full{inset:9px}.wcs-block.left{left:8px;top:8px;bottom:8px;width:calc(50% - 12px)}.wcs-block.right{right:8px;top:8px;bottom:8px;width:calc(50% - 12px)}.wcs-block.q1{left:8px;top:8px;width:calc(50% - 12px);height:calc(50% - 12px)}.wcs-block.q2{right:8px;top:8px;width:calc(50% - 12px);height:calc(50% - 12px)}.wcs-block.q3{left:8px;bottom:8px;width:calc(50% - 12px);height:calc(50% - 12px)}.wcs-block.q4{right:8px;bottom:8px;width:calc(50% - 12px);height:calc(50% - 12px)}.wcs-block.hero{left:8px;right:8px;top:8px;height:56%}.wcs-block.mini1{left:8px;bottom:8px;width:calc(50% - 12px);height:30%}.wcs-block.mini2{right:8px;bottom:8px;width:calc(50% - 12px);height:30%}.wcs-paper{width:58%;height:62%;background:#fff;box-shadow:0 5px 12px rgba(80,50,60,.1);border-radius:4px}.wcs-paper.p1{left:10px;top:11px;transform:rotate(-7deg)}.wcs-paper.p2{right:10px;bottom:10px;transform:rotate(7deg)}.wcs-quote{inset:12px;font:800 26px/1 Georgia,serif;color:var(--rose);display:grid!important;place-items:center}
.wcs-player{position:relative;margin:14px auto 10px;width:min(100%,390px);aspect-ratio:4/5;border-radius:18px;overflow:hidden;background:#111;box-shadow:0 12px 30px rgba(50,30,38,.15)}.wcs-player canvas{width:100%;height:100%;display:block}.wcs-preview-loading{position:absolute;inset:0;display:grid;place-items:center;background:rgba(255,250,253,.9);font-weight:850;color:var(--muted)}.wcs-preview-loading[hidden]{display:none}.wcs-preview-progress{height:5px;border-radius:99px;background:var(--pink-100);overflow:hidden}.wcs-preview-progress i{display:block;height:100%;width:0;background:var(--rose)}.wcs-preview-controls{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;margin-top:10px}.wcs-preview-controls button{min-height:42px;border:1px solid var(--line);border-radius:13px;background:#fff;font-weight:850;padding:0 13px}.wcs-preview-controls button.primary{background:var(--rose);color:#fff}.wcs-preview-controls span{font-size:.68rem;color:var(--muted);white-space:nowrap}
#washiCarouselHUD [data-carousel-studio-add-slide],#washiCarouselHUD [data-carousel-studio-preview]{white-space:nowrap}
@media(max-width:360px){.wcs-layout-grid{grid-template-columns:1fr}}
`;document.head.append(css);

W.CarouselStudio={version:'v1.0-preview-layouts',addSlide,openPreview,openLayoutSheet};
})();