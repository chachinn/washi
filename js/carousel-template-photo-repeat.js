(() => {
'use strict';

const W=window.Washi=window.Washi||{},E=W.Editor,DB=W.DB,SL=W.SmartLayout;
if(!E||!DB||!SL||W.CarouselTemplatePhotoRepeat)return;

const MAX_SLIDES=20,MAX_BATCH=60;
const $=(s,r=document)=>r.querySelector(s);
const clone=value=>DB.clone?DB.clone(value):JSON.parse(JSON.stringify(value));
const project=()=>E.getProject?.()||E.state?.project||null;
const isInputFile=f=>!!f&&/^(image|video)\//.test(f.type||'');
const isMedia=o=>!!o&&['image','video'].includes(o.type)&&!!o.mediaId;
const isAvailableTemplateSlot=o=>!!o&&(
  (o.type==='placeholder'&&!o.mediaId) ||
  (!!o.mediaId&&!!(o.sampleMedia||o.sampleSource))
);
const isKnownTemplateSlot=o=>!!o&&(
  o.templatePhotoSlot ||
  o.sampleMedia ||
  o.sampleSource ||
  (o.type==='placeholder'&&!o.mediaId)
);

let busy=false,pendingMode='';

function toast(message){
  const t=$('#toast');
  if(!t)return;
  t.textContent=message;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>t.classList.remove('show'),2600);
}

function yieldFrame(){
  return new Promise(resolve=>requestAnimationFrame(resolve));
}

async function optimize(file){
  if(!file?.type?.startsWith('image/')||file.type==='image/gif'||!window.createImageBitmap)return file;
  try{
    const bitmap=await createImageBitmap(file),max=Math.max(bitmap.width,bitmap.height);
    if(max<=2600&&file.size<=3e6){bitmap.close();return file}
    const scale=Math.min(1,2600/max),canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));
    canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,canvas.width,canvas.height);
    bitmap.close();
    const type=file.type==='image/png'?'image/png':'image/jpeg';
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,type,.9));
    return blob?new File([blob],file.name,{type:blob.type}):file;
  }catch{
    return file;
  }
}

async function storedMedia(raw){
  const file=await optimize(raw);
  const mediaId=await DB.assetPut(file,{name:raw.name,type:file.type,size:file.size});
  return {
    mediaId,
    mediaType:file.type,
    type:file.type.startsWith('video/')?'video':'image'
  };
}

function applyMedia(slot,media){
  const geometry={
    x:slot.x,y:slot.y,w:slot.w,h:slot.h,
    rotation:slot.rotation||0,radius:slot.radius||0
  };
  Object.assign(slot,media,geometry,{
    fit:slot.fit||'cover',
    focusX:slot.focusX??50,
    focusY:slot.focusY??50,
    mediaZoom:slot.mediaZoom??1,
    filterPreset:slot.filterPreset||'none',
    brightness:slot.brightness??1,
    contrast:slot.contrast??1,
    saturation:slot.saturation??1,
    flipX:!!slot.flipX,
    flipY:!!slot.flipY,
    muted:true,
    opacity:slot.opacity??1,
    visible:slot.visible!==false,
    locked:!!slot.locked,
    templatePhotoSlot:true,
    smartFilled:true
  });
  delete slot.sampleMedia;
  delete slot.sampleSource;
  delete slot.label;
  return slot;
}

async function fillSlot(slot,file){
  const media=await storedMedia(file);
  applyMedia(slot,media);
}

function sortSlots(slots){
  return [...slots].sort((a,b)=>(Number(a.x)||0)-(Number(b.x)||0)||(Number(a.y)||0)-(Number(b.y)||0));
}

function availableSlots(q){
  return sortSlots((q.objects||[]).filter(isAvailableTemplateSlot));
}

function baseSlots(q,blockSlides){
  const sw=Number(q.carousel?.slideWidth)||1080;
  const width=sw*blockSlides;
  return sortSlots((q.objects||[]).filter(o=>{
    const x=Number(o.x)||0;
    return x<width&&isKnownTemplateSlot(o);
  }));
}

function markBaseSlots(q,blockSlides){
  const slots=baseSlots(q,blockSlides);
  for(const slot of slots)slot.templatePhotoSlot=true;
  return slots;
}

function ensureRepeatMeta(q){
  const c=q.carousel;
  if(!c?.enabled)return null;
  const existing=q.smartTemplateRepeat;
  if(existing?.blockSlides>0&&existing?.slotCount>0)return existing;

  const blockSlides=Math.max(1,Math.min(MAX_SLIDES,Number(c.slideCount)||1));
  const slots=markBaseSlots(q,blockSlides);
  if(!slots.length)return null;

  q.smartTemplateRepeat={
    version:1,
    blockSlides,
    slotCount:slots.length,
    createdAt:Date.now()
  };
  return q.smartTemplateRepeat;
}

function resetSlotClone(o){
  const out=clone(o);
  out.id=DB.uid('obj');
  out.type='placeholder';
  out.label='Add photo';
  out.templatePhotoSlot=true;
  out.smartRepeatSlot=true;
  delete out.mediaId;
  delete out.mediaType;
  delete out.sampleMedia;
  delete out.sampleSource;
  delete out.smartFilled;
  delete out.filterPreset;
  delete out.brightness;
  delete out.contrast;
  delete out.saturation;
  delete out.flipX;
  delete out.flipY;
  delete out.muted;
  return out;
}

function cloneNonMedia(o){
  const out=clone(o);
  out.id=DB.uid('obj');
  out.smartRepeatClone=true;
  return out;
}

function appendTemplateBlock(q,meta){
  const c=q.carousel;
  const sw=Number(c.slideWidth)||1080,sh=Number(c.slideHeight)||1350;
  const blockSlides=Math.max(1,Number(meta.blockSlides)||1);
  const current=Math.max(1,Number(c.slideCount)||1);
  if(current+blockSlides>MAX_SLIDES)return null;

  const baseWidth=blockSlides*sw;
  const shift=current*sw;
  const baseObjects=(q.objects||[]).filter(o=>{
    if(!o||o.visible===false)return false;
    const x=Number(o.x)||0,w=Math.max(0,Number(o.w)||0);
    return x<baseWidth&&x+w>0;
  });

  const added=[];
  const slots=[];
  for(const source of baseObjects){
    let copy;
    if(source.templatePhotoSlot||source.sampleMedia||source.sampleSource||(source.type==='placeholder'&&!source.mediaId)){
      copy=resetSlotClone(source);
      slots.push(copy);
    }else if(isMedia(source)){
      // User-added media that is not a template slot should not be multiplied.
      continue;
    }else{
      copy=cloneNonMedia(source);
    }
    copy.x=(Number(copy.x)||0)+shift;
    added.push(copy);
  }

  if(!slots.length)return null;

  const oldDurations=[...(c.durations||[])];
  const baseDurations=Array.from({length:blockSlides},(_,i)=>Number(oldDurations[i])||3);
  const newCount=current+blockSlides;
  c.slideCount=newCount;
  c.durations=Array.from({length:newCount},(_,i)=>{
    if(i<current)return Number(oldDurations[i])||3;
    return baseDurations[(i-current)%blockSlides]||3;
  });
  q.width=sw*newCount;
  q.height=sh;
  q.objects.push(...added);

  return {
    startSlide:current,
    slots:sortSlots(slots)
  };
}

async function fillFilesIntoSlots(files,slots,start=0){
  let index=start;
  for(const slot of slots){
    if(index>=files.length)break;
    await fillSlot(slot,files[index]);
    index++;
    if(index%4===0)await yieldFrame();
  }
  return index;
}

function templateContext(q){
  if(!q?.carousel?.enabled)return false;
  if(q.smartTemplateRepeat?.blockSlides>0&&q.smartTemplateRepeat?.slotCount>0)return true;
  return (q.objects||[]).some(o=>o.templatePhotoSlot||o.sampleMedia||o.sampleSource);
}

async function addTemplatePhotos(rawFiles){
  const q=project();
  if(!q?.carousel?.enabled||busy)return false;

  const files=[...rawFiles].filter(isInputFile).slice(0,MAX_BATCH);
  if(!files.length)return false;

  busy=true;
  toast(`Filling ${files.length} photo${files.length===1?'':'s'}…`);

  try{
    const meta=ensureRepeatMeta(q);
    if(!meta){
      busy=false;
      return await SL.smartCarouselAdd(files,{source:'carousel-choice-auto'});
    }

    markBaseSlots(q,meta.blockSlides);

    let index=0;
    index=await fillFilesIntoSlots(files,availableSlots(q),index);

    let blocksAdded=0;
    while(index<files.length){
      const block=appendTemplateBlock(q,meta);
      if(!block)break;
      blocksAdded++;
      index=await fillFilesIntoSlots(files,block.slots,index);
    }

    E.state.selectedId=null;
    E.render();
    E.save();

    requestAnimationFrame(()=>{
      window.dispatchEvent(new CustomEvent('washi:smart-layout',{
        detail:{
          mode:'carousel-template-repeat',
          source:'carousel-choice-template',
          count:index,
          requested:files.length,
          blockSlides:meta.blockSlides,
          slotCount:meta.slotCount,
          blocksAdded
        }
      }));
      window.dispatchEvent(new Event('resize'));
    });

    if(index<files.length){
      toast(`Added ${index} photo${index===1?'':'s'}. The carousel reached its ${MAX_SLIDES}-slide limit.`);
    }else if(blocksAdded){
      toast(`${files.length} photos filled — added ${blocksAdded} matching template section${blocksAdded===1?'':'s'}`);
    }else{
      toast(`${files.length} photo${files.length===1?'':'s'} filled into the template`);
    }
    return true;
  }catch(error){
    console.warn('Washi template repeat photo fill failed',error);
    toast(error?.name==='QuotaExceededError'?'Not enough local storage':'Could not fill these photos');
    return false;
  }finally{
    busy=false;
    takeoverButton();
  }
}

async function addFreely(rawFiles){
  const q=project();
  if(!q?.carousel?.enabled||busy)return false;
  const files=[...rawFiles].filter(isInputFile).slice(0,MAX_BATCH);
  if(!files.length)return false;

  busy=true;
  toast(`Adding ${files.length} photo${files.length===1?'':'s'} freely…`);
  try{
    const c=q.carousel,sw=Number(c.slideWidth)||1080,sh=Number(c.slideHeight)||1350;
    const slideIndex=Math.min(Math.max(0,Number(c.activeSlide)||0),Math.max(0,(Number(c.slideCount)||1)-1));
    const baseX=slideIndex*sw;
    const added=[];
    for(let i=0;i<files.length;i++){
      const media=await storedMedia(files[i]);
      const w=Math.round(sw*.58);
      const h=Math.round(sh*(media.type==='video'?.46:.40));
      const offset=(i%6)*24;
      const o={
        id:DB.uid('obj'),
        ...media,
        x:baseX+Math.round((sw-w)/2)+offset,
        y:Math.round((sh-h)/2)+offset,
        w,h,
        rotation:(i%3-1)*2,
        opacity:1,
        radius:18,
        fit:'cover',
        filterPreset:'none',
        brightness:1,
        contrast:1,
        saturation:1,
        focusX:50,
        focusY:50,
        mediaZoom:1,
        flipX:false,
        flipY:false,
        visible:true,
        locked:false,
        muted:true,
        freeAdded:true
      };
      q.objects.push(o);
      added.push(o);
      if(i%4===3)await yieldFrame();
    }
    E.state.selectedId=added.at(-1)?.id||null;
    E.render();
    E.save();
    requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
    toast(`${added.length} photo${added.length===1?'':'s'} added freely`);
    return true;
  }catch(error){
    console.warn('Washi free carousel photo add failed',error);
    toast(error?.name==='QuotaExceededError'?'Not enough local storage':'Could not add these photos');
    return false;
  }finally{
    busy=false;
    takeoverButton();
  }
}

function choiceSheet(){
  let sheet=$('#washiCarouselPhotoChoice');
  if(sheet)return sheet;
  sheet=document.createElement('section');
  sheet.id='washiCarouselPhotoChoice';
  sheet.className='washi-photo-choice';
  sheet.hidden=true;
  sheet.innerHTML=`
    <div class="wpc-backdrop" data-wpc-close></div>
    <div class="wpc-card" role="dialog" aria-modal="true" aria-labelledby="wpcTitle">
      <header>
        <div>
          <small>Carousel photos</small>
          <h2 id="wpcTitle">How should Washi add them?</h2>
          <p id="wpcHint">Choose template filling or place photos freely.</p>
        </div>
        <button type="button" data-wpc-close aria-label="Close">×</button>
      </header>
      <div class="wpc-actions">
        <button type="button" class="wpc-option" data-wpc-mode="template">
          <span class="wpc-icon">▦</span>
          <span><b data-wpc-auto-label>Fill Template</b><small data-wpc-auto-copy>Fill the template slots in order. Extra photos repeat the same layout.</small></span>
        </button>
        <button type="button" class="wpc-option" data-wpc-mode="free">
          <span class="wpc-icon">✦</span>
          <span><b>Add Freely</b><small>Add normal movable photos without changing or duplicating the template.</small></span>
        </button>
      </div>
    </div>`;
  document.body.append(sheet);
  return sheet;
}

function openChoice(){
  const q=project();
  if(!q?.carousel?.enabled)return;
  const sheet=choiceSheet();
  const templated=templateContext(q);
  const label=sheet.querySelector('[data-wpc-auto-label]');
  const copy=sheet.querySelector('[data-wpc-auto-copy]');
  const hint=$('#wpcHint',sheet);
  const auto=sheet.querySelector('[data-wpc-mode="template"]');
  if(templated){
    label.textContent='Fill Template';
    copy.textContent='Fill the template slots in order. Extra photos repeat the same layout.';
    hint.textContent='Keep the design structure, or place photos freely.';
    auto.dataset.wpcMode='template';
  }else{
    label.textContent='Auto Arrange';
    copy.textContent='Let Washi balance the selected photos across Carousel slides.';
    hint.textContent='Let Washi arrange them, or place photos freely.';
    auto.dataset.wpcMode='smart';
  }
  sheet.hidden=false;
}

function closeChoice(){
  const sheet=$('#washiCarouselPhotoChoice');
  if(sheet)sheet.hidden=true;
}

function ensureInput(){
  let input=$('#washiCarouselPhotoChoiceInput');
  if(input)return input;
  input=document.createElement('input');
  input.id='washiCarouselPhotoChoiceInput';
  input.type='file';
  input.accept='image/*,video/*';
  input.multiple=true;
  input.hidden=true;
  document.body.append(input);
  input.addEventListener('change',async()=>{
    const files=[...input.files];
    input.value='';
    const mode=pendingMode;
    pendingMode='';
    if(!files.length)return;
    if(mode==='free')await addFreely(files);
    else if(mode==='template')await addTemplatePhotos(files);
    else await SL.smartCarouselAdd(files,{source:'carousel-choice-auto'});
  });
  return input;
}

function chooseMode(mode){
  pendingMode=mode;
  closeChoice();
  ensureInput().click();
}

function takeoverButton(){
  const hud=$('#washiCarouselHUD');
  if(!hud)return;
  const button=hud.querySelector('[data-template-repeat-photos],[data-smart-add-photos]');
  if(!button)return;
  if(button.hasAttribute('data-smart-add-photos'))button.removeAttribute('data-smart-add-photos');
  button.dataset.templateRepeatPhotos='1';
  button.textContent='＋ Photos';
  button.title='Choose Fill Template / Auto Arrange or Add Freely';
  button.disabled=busy;
}

// pointerdown runs before the older Smart Layout click handler. If the HUD was
// rebuilt just before a tap, move the button to this module's data attribute
// before the click event is dispatched so the older handler cannot steal it.
document.addEventListener('pointerdown',event=>{
  const button=event.target instanceof Element?event.target.closest('[data-smart-add-photos]'):null;
  if(!button)return;
  button.removeAttribute('data-smart-add-photos');
  button.dataset.templateRepeatPhotos='1';
},true);

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;
  if(target.closest('[data-template-repeat-photos]')){
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openChoice();
    return;
  }
  if(target.closest('[data-wpc-close]')){
    event.preventDefault();
    closeChoice();
    return;
  }
  const option=target.closest('[data-wpc-mode]');
  if(option){
    event.preventDefault();
    chooseMode(option.dataset.wpcMode);
  }
},true);

for(const name of ['washi:selection-changed','washi:project-saved','washi:carousel-created','washi:experience-ready']){
  window.addEventListener(name,()=>requestAnimationFrame(takeoverButton));
}
window.addEventListener('resize',()=>requestAnimationFrame(takeoverButton),{passive:true});

setTimeout(()=>{
  ensureInput();
  takeoverButton();
},220);

const css=document.createElement('style');
css.textContent=`
.washi-photo-choice{position:fixed;inset:0;z-index:170}
.washi-photo-choice[hidden]{display:none!important}
.wpc-backdrop{position:absolute;inset:0;background:rgba(50,32,40,.32);backdrop-filter:blur(6px)}
.wpc-card{position:absolute;left:10px;right:10px;bottom:calc(8px + var(--safe-bottom));padding:17px;border:1px solid var(--line);border-radius:26px;background:#fffafd;box-shadow:0 26px 75px rgba(50,25,35,.24)}
.wpc-card header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.wpc-card header small{color:var(--rose);font-size:.63rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
.wpc-card h2{margin:3px 0 3px;font-size:1.18rem}
.wpc-card header p{margin:0;color:var(--muted);font-size:.74rem;line-height:1.35}
.wpc-card header>button{width:38px;height:38px;border:1px solid var(--line);border-radius:12px;background:#fff;font-size:1.2rem}
.wpc-actions{display:grid;gap:9px;margin-top:14px}
.wpc-option{width:100%;min-height:78px;display:grid;grid-template-columns:50px 1fr;gap:11px;align-items:center;text-align:left;padding:10px;border:1px solid var(--line);border-radius:17px;background:#fff}
.wpc-option:active{transform:scale(.99)}
.wpc-icon{width:50px;height:50px;display:grid;place-items:center;border-radius:15px;background:var(--pink-100);color:var(--rose);font-size:1.3rem;font-weight:900}
.wpc-option b{display:block;font-size:.88rem}
.wpc-option small{display:block;margin-top:3px;color:var(--muted);font-size:.68rem;line-height:1.35}
`;
document.head.append(css);

W.CarouselTemplatePhotoRepeat={
  version:'2026.08.16-choice-repeat1',
  addTemplatePhotos,
  addFreely,
  openChoice,
  templateContext,
  appendTemplateBlock,
  isBusy:()=>busy
};
})();