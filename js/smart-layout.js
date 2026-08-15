(() => {
'use strict';
const W=window.Washi=window.Washi||{},E=W.Editor,DB=W.DB;
if(!E||!DB)return;
const $=(s,r=document)=>r.querySelector(s),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const MAX_SLIDES=20,MAX_BATCH=60,TARGET_PER_SLIDE=4;
let busy=false;

function project(){return E.getProject?.()||E.state?.project||null}
function selected(){return E.selected?.()||project()?.objects?.find(o=>o.id===E.state?.selectedId)||null}
function isMedia(o){return !!o&&['image','video'].includes(o.type)&&!!o.mediaId&&!o.isPhotoBackground}
function isImageFile(f){return !!f&&/^(image|video)\//.test(f.type||'')}
function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2300)}
function yieldFrame(){return new Promise(resolve=>requestAnimationFrame(resolve))}

async function optimize(file){
 if(!file?.type?.startsWith('image/')||file.type==='image/gif'||!window.createImageBitmap)return file;
 try{
  const b=await createImageBitmap(file),m=Math.max(b.width,b.height);
  if(m<=2600&&file.size<=3e6){b.close();return file}
  const k=Math.min(1,2600/m),c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(b.width*k));c.height=Math.max(1,Math.round(b.height*k));
  c.getContext('2d',{alpha:false}).drawImage(b,0,0,c.width,c.height);b.close();
  const type=file.type==='image/png'?'image/png':'image/jpeg',blob=await new Promise(r=>c.toBlob(r,type,.9));
  return blob?new File([blob],file.name,{type:blob.type}):file;
 }catch{return file}
}
async function storedMedia(raw){
 const file=await optimize(raw),mediaId=await DB.assetPut(file,{name:raw.name,type:file.type,size:file.size});
 return{mediaId,mediaType:file.type,type:file.type.startsWith('video/')?'video':'image'};
}
function mediaDefaults(o={}){return{fit:'cover',focusX:50,focusY:50,mediaZoom:1,filterPreset:'none',brightness:1,contrast:1,saturation:1,flipX:false,flipY:false,muted:true,opacity:1,visible:true,locked:false,...o}}

function rects(n,w,h,variant=0){
 if(n<=0)return[];
 const m=Math.max(28,Math.round(Math.min(w,h)*.045)),g=Math.max(14,Math.round(Math.min(w,h)*.018)),W=w-m*2,H=h-m*2,R=(x,y,rw,rh)=>({x:m+x,y:m+y,w:rw,h:rh});
 if(n===1)return[R(0,0,W,H)];
 if(n===2){
  if(variant%2){const rh=(H-g)/2;return[R(0,0,W,rh),R(0,rh+g,W,rh)]}
  const cw=(W-g)/2;return[R(0,0,cw,H),R(cw+g,0,cw,H)];
 }
 if(n===3){
  const hero=Math.round(W*.58),side=W-hero-g,rh=(H-g)/2;
  if(variant%2)return[R(0,0,side,rh),R(0,rh+g,side,rh),R(side+g,0,hero,H)];
  return[R(0,0,hero,H),R(hero+g,0,side,rh),R(hero+g,rh+g,side,rh)];
 }
 if(n===4){const cw=(W-g)/2,rh=(H-g)/2;return[R(0,0,cw,rh),R(cw+g,0,cw,rh),R(0,rh+g,cw,rh),R(cw+g,rh+g,cw,rh)]}
 if(n===5){
  const hero=Math.round(W*.48),side=W-hero-g,cw=(side-g)/2,rh=(H-g)/2;
  if(variant%2)return[R(0,0,cw,rh),R(cw+g,0,cw,rh),R(0,rh+g,cw,rh),R(cw+g,rh+g,cw,rh),R(side+g,0,hero,H)];
  return[R(0,0,hero,H),R(hero+g,0,cw,rh),R(hero+g+cw+g,0,cw,rh),R(hero+g,rh+g,cw,rh),R(hero+g+cw+g,rh+g,cw,rh)];
 }
 if(n===6){const cols=variant%2?2:3,rows=Math.ceil(n/cols),cw=(W-g*(cols-1))/cols,rh=(H-g*(rows-1))/rows;return Array.from({length:n},(_,i)=>R((i%cols)*(cw+g),Math.floor(i/cols)*(rh+g),cw,rh))}
 const ratio=W/Math.max(1,H),cols=Math.max(2,Math.ceil(Math.sqrt(n*ratio))),rows=Math.ceil(n/cols),cw=(W-g*(cols-1))/cols,rh=(H-g*(rows-1))/rows,out=[];
 for(let i=0;i<n;i++){const row=Math.floor(i/cols),remaining=n-row*cols,inRow=Math.min(cols,remaining),rowW=inRow*cw+(inRow-1)*g,start=(W-rowW)/2,col=i-row*cols;out.push(R(start+col*(cw+g),row*(rh+g),cw,rh))}
 return out;
}
function balancedCounts(total,slides){
 slides=Math.max(1,Math.min(slides,total||1));const base=Math.floor(total/slides),rem=total%slides;
 return Array.from({length:slides},(_,i)=>base+(i<rem?1:0));
}
function emptySlots(q,first=null){
 const slots=(q.objects||[]).filter(o=>o.type==='placeholder'&&!o.mediaId&&o.visible!==false).sort((a,b)=>(a.x-b.x)||(a.y-b.y));
 if(first?.type==='placeholder'&&slots.some(s=>s.id===first.id))return[first,...slots.filter(s=>s.id!==first.id)];
 return slots;
}
async function fillPlaceholder(slot,file){
 const media=await storedMedia(file);
 Object.assign(slot,media,mediaDefaults({fit:slot.fit||'cover',focusX:slot.focusX??50,focusY:slot.focusY??50,mediaZoom:slot.mediaZoom??1,smartFilled:true}));
 return slot;
}
function makeMedia(media,box,extra={}){
 return{id:DB.uid('obj'),...media,...mediaDefaults({x:box.x,y:box.y,w:box.w,h:box.h,radius:18,rotation:0,smartLayoutManaged:true,...extra})};
}
function ensureCarouselSize(q,count){
 const c=q.carousel;if(!c)return;count=clamp(count,2,MAX_SLIDES);c.slideCount=count;q.width=c.slideWidth*count;q.height=c.slideHeight;c.durations=Array.from({length:count},(_,i)=>Number(c.durations?.[i])||3);c.activeSlide=clamp(c.activeSlide||0,0,count-1);c.view='slide';
}
function managedBlankCarousel(q){
 return !!q?.carousel?.enabled&&(q.smartLayout?.mode==='carousel'||q.format==='carousel'||q.name==='Untitled Carousel');
}
function intentionalCarousel(q){
 if(managedBlankCarousel(q))return false;
 return (q.objects||[]).some(o=>o.visible!==false&&!isMedia(o)&&o.type!=='placeholder'&&!o.smartLayoutBackground&&!o.carouselExtension);
}
function copySlideBackground(q,slide){
 const sw=q.carousel.slideWidth,sh=q.carousel.slideHeight,prev=Math.max(0,slide-1),x=prev*sw;
 const local=(q.objects||[]).find(o=>o.type==='shape'&&o.x<=x+2&&o.y<=2&&o.x+o.w>=x+sw-2&&o.y+o.h>=sh-2&&o.fill);
 return local?.fill||(q.bg?.type==='solid'?q.bg.value:'#fff8fb');
}
function addSlideBackground(q,slide){
 const sw=q.carousel.slideWidth,sh=q.carousel.slideHeight,fill=copySlideBackground(q,slide);
 q.objects.unshift({id:DB.uid('obj'),type:'shape',shape:'rect',x:slide*sw,y:0,w:sw,h:sh,fill,border:'transparent',borderWidth:0,radius:0,opacity:1,rotation:0,visible:true,locked:true,smartLayoutBackground:true});
}
function placeManagedCarousel(q,mediaObjects){
 const c=q.carousel,needed=Math.min(MAX_SLIDES,Math.max(c.slideCount,Math.ceil(mediaObjects.length/TARGET_PER_SLIDE))),counts=balancedCounts(mediaObjects.length,needed);
 ensureCarouselSize(q,needed);q.smartLayout={mode:'carousel',managed:true,updatedAt:Date.now()};
 let offset=0;
 for(let slide=0;slide<counts.length;slide++){
  const count=counts[slide];if(!count)continue;const boxes=rects(count,c.slideWidth,c.slideHeight,slide);
  for(let i=0;i<count;i++){const o=mediaObjects[offset++],b=boxes[i];Object.assign(o,{x:slide*c.slideWidth+b.x,y:b.y,w:b.w,h:b.h,rotation:0,radius:count===1?22:16,fit:'cover',smartLayoutManaged:true})}
 }
 c.activeSlide=0;c.view='slide';
}
async function appendSmartSlides(q,files){
 if(!files.length)return{added:0,ignored:0};
 const c=q.carousel,room=Math.max(0,MAX_SLIDES-c.slideCount),groups=Math.min(room,Math.ceil(files.length/TARGET_PER_SLIDE));
 if(!groups)return{added:0,ignored:files.length};
 const usable=files.slice(0,groups*TARGET_PER_SLIDE),counts=balancedCounts(usable.length,groups),start=c.slideCount;ensureCarouselSize(q,start+groups);
 let at=0;
 for(let s=0;s<groups;s++){
  const slide=start+s;addSlideBackground(q,slide);const boxes=rects(counts[s],c.slideWidth,c.slideHeight,slide);
  for(let i=0;i<counts[s];i++){
   const media=await storedMedia(usable[at++]),b=boxes[i];q.objects.push(makeMedia(media,{x:slide*c.slideWidth+b.x,y:b.y,w:b.w,h:b.h},{smartLayoutManaged:false,smartOverflow:true}));
   if(at%4===0)await yieldFrame();
  }
 }
 c.activeSlide=start;c.view='slide';return{added:usable.length,ignored:Math.max(0,files.length-usable.length)};
}
async function smartCarouselAdd(rawFiles,{source='carousel'}={}){
 const q=project();if(!q?.carousel?.enabled||busy)return false;
 const files=[...rawFiles].filter(isImageFile).slice(0,MAX_BATCH);if(!files.length)return false;
 busy=true;toast(`Organizing ${files.length} photo${files.length===1?'':'s'}…`);
 try{
  let index=0,filled=0;const slots=emptySlots(q,selected());
  while(index<files.length&&index<slots.length){await fillPlaceholder(slots[index],files[index]);index++;filled++;if(index%4===0)await yieldFrame()}
  const rest=files.slice(index);
  if(rest.length){
   if(managedBlankCarousel(q)&&!intentionalCarousel(q)){
    const existing=(q.objects||[]).filter(o=>isMedia(o)&&(o.smartLayoutManaged||q.name==='Untitled Carousel'||q.smartLayout?.mode==='carousel'));
    for(let i=0;i<rest.length;i++){const media=await storedMedia(rest[i]);const o=makeMedia(media,{x:0,y:0,w:100,h:100});q.objects.push(o);existing.push(o);if(i%4===3)await yieldFrame()}
    placeManagedCarousel(q,existing);
   }else{
    const r=await appendSmartSlides(q,rest);if(r.ignored)toast(`Added ${filled+r.added}. ${r.ignored} could not fit within ${MAX_SLIDES} slides.`)
   }
  }
  E.state.selectedId=null;E.render();E.save();
  requestAnimationFrame(()=>{window.dispatchEvent(new CustomEvent('washi:smart-layout',{detail:{mode:'carousel',source,count:files.length}}));window.dispatchEvent(new Event('resize'))});
  if(!rest.length)toast(`${filled} photo${filled===1?'':'s'} filled into the template`);else toast(`${files.length} photo${files.length===1?'':'s'} organized automatically`);
  return true;
 }catch(err){console.warn('Washi smart carousel layout failed',err);toast(err?.name==='QuotaExceededError'?'Not enough local storage':'Could not organize these photos');return false}
 finally{busy=false}
}

function autoCanvasMedia(q){return(q.objects||[]).filter(o=>isMedia(o)&&!o.isPhotoBackground)}
function layoutCanvas(q,media){
 const boxes=rects(media.length,q.width,q.height,0);media.forEach((o,i)=>{const b=boxes[i];Object.assign(o,{x:b.x,y:b.y,w:b.w,h:b.h,rotation:0,radius:media.length===1?22:media.length>=9?10:16,fit:'cover',smartLayoutManaged:true})});
 q.smartLayout={mode:q.format==='dump'||q.autoDumpLayout?'photo-dump':'multi-photo',managed:true,updatedAt:Date.now()};
}
async function smartCanvasAdd(rawFiles,{source='media'}={}){
 const q=project();if(!q||busy)return false;const files=[...rawFiles].filter(isImageFile).slice(0,MAX_BATCH);if(!files.length)return false;
 busy=true;toast(`Arranging ${files.length} photo${files.length===1?'':'s'}…`);
 try{
  const all=autoCanvasMedia(q);
  for(let i=0;i<files.length;i++){const media=await storedMedia(files[i]),o=makeMedia(media,{x:0,y:0,w:100,h:100});q.objects.push(o);all.push(o);if(i%4===3)await yieldFrame()}
  layoutCanvas(q,all);E.state.selectedId=null;E.render();E.save();window.dispatchEvent(new CustomEvent('washi:smart-layout',{detail:{mode:q.smartLayout.mode,source,count:files.length}}));toast(`${all.length} photo${all.length===1?'':'s'} arranged`);return true;
 }catch(err){console.warn('Washi smart canvas layout failed',err);toast(err?.name==='QuotaExceededError'?'Not enough local storage':'Could not arrange these photos');return false}
 finally{busy=false}
}

function ensureSmartInput(){
 let i=$('#washiSmartCarouselInput');if(i)return i;i=document.createElement('input');i.id='washiSmartCarouselInput';i.type='file';i.accept='image/*,video/*';i.multiple=true;i.hidden=true;document.body.append(i);
 i.addEventListener('change',async()=>{const files=[...i.files];i.value='';if(files.length)await smartCarouselAdd(files,{source:'carousel-button'})});return i;
}
function patchCarouselButton(){
 const h=$('#washiCarouselHUD');if(!h)return;let smart=h.querySelector('[data-smart-add-photos]');
 if(!smart){const native=h.querySelector('button[data-c-add-photos]');if(native){native.removeAttribute('data-c-add-photos');native.dataset.smartAddPhotos='1';native.title='Choose photos and let Washi organize them';smart=native;const sentinel=document.createElement('span');sentinel.dataset.cAddPhotos='sentinel';sentinel.hidden=true;sentinel.setAttribute('aria-hidden','true');native.after(sentinel)}}
 if(smart){smart.textContent='＋ Photos';smart.disabled=busy}
}

document.addEventListener('click',e=>{const b=e.target.closest?.('[data-smart-add-photos]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();ensureSmartInput().click()},true);

document.addEventListener('change',async e=>{
 const input=e.target;if(input!==$('#mediaInput')||busy)return;const files=[...input.files].filter(isImageFile);if(!files.length)return;const q=project(),sel=selected();if(!q)return;
 if(sel&&['image','video','shape'].includes(sel.type))return;
 let mode='';
 if(q.carousel?.enabled)mode='carousel';
 else if((q.format==='dump'||q.autoDumpLayout)&&!sel)mode='photo-dump';
 else if(!sel&&files.length>1&&(q.objects||[]).filter(o=>o.visible!==false).length===0)mode='blank';
 if(!mode)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();input.value='';
 if(mode==='carousel')await smartCarouselAdd(files,{source:'editor-add'});
 else await smartCanvasAdd(files,{source:mode==='photo-dump'?'photo-dump-add':'blank-multi-photo'});
},true);

for(const evt of['washi:selection-changed','washi:project-saved','washi:carousel-created'])window.addEventListener(evt,()=>requestAnimationFrame(patchCarouselButton));
window.addEventListener('resize',()=>requestAnimationFrame(patchCarouselButton),{passive:true});
setTimeout(()=>{ensureSmartInput();patchCarouselButton()},180);

W.SmartLayout={version:'v1.0',rects,balancedCounts,smartCarouselAdd,smartCanvasAdd,patchCarouselButton,isBusy:()=>busy};
})();
