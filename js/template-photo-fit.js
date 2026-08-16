(() => {
'use strict';

const W=window.Washi=window.Washi||{},E=W.Editor,DB=W.DB,SL=W.SmartLayout;
if(!E||!DB||!SL||W.TemplatePhotoFit)return;

const MAX_BATCH=60;
const $=(s,r=document)=>r.querySelector(s);
const clone=v=>DB.clone?DB.clone(v):JSON.parse(JSON.stringify(v));
const project=()=>E.getProject?.()||E.state?.project||null;
const isInputFile=f=>!!f&&/^(image|video)\//.test(f.type||'');
const isKnownSlot=o=>!!o&&(o.templatePhotoSlot||o.sampleMedia||o.sampleSource);
const isAvailableSlot=o=>isKnownSlot(o)&&(
  (o.type==='placeholder'&&!o.mediaId) ||
  (!!o.mediaId&&!!(o.sampleMedia||o.sampleSource))
);

let busy=false,pendingMode='';

function toast(message){
  const t=$('#toast');if(!t)return;
  t.textContent=message;t.classList.add('show');
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2600);
}

function yieldFrame(){return new Promise(resolve=>requestAnimationFrame(resolve))}

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
  }catch{return file}
}

async function storedMedia(raw){
  const file=await optimize(raw);
  const mediaId=await DB.assetPut(file,{name:raw.name,type:file.type,size:file.size});
  return{mediaId,mediaType:file.type,type:file.type.startsWith('video/')?'video':'image'};
}

function mediaDefaults(slot={}){
  return{
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
    locked:!!slot.locked
  };
}

function markTemplateSlots(q,{includePlaceholders=false}={}){
  if(!q)return 0;
  let changed=0;
  for(const o of q.objects||[]){
    const should=o.sampleMedia||o.sampleSource||(includePlaceholders&&o.type==='placeholder');
    if(should&&!o.templatePhotoSlot){o.templatePhotoSlot=true;changed++}
  }
  return changed;
}

function sortPageSlots(slots){
  return [...slots].sort((a,b)=>(Number(a.y)||0)-(Number(b.y)||0)||(Number(a.x)||0)-(Number(b.x)||0));
}

function knownSlots(q){return sortPageSlots((q.objects||[]).filter(isKnownSlot))}
function availableSlots(q){return sortPageSlots((q.objects||[]).filter(isAvailableSlot))}

function templateContext(q){
  if(!q||q.carousel?.enabled)return false;
  return (q.objects||[]).some(isKnownSlot);
}

function applyMedia(slot,media){
  Object.assign(slot,media,mediaDefaults(slot),{
    templatePhotoSlot:true,
    smartFilled:true
  });
  delete slot.sampleMedia;
  delete slot.sampleSource;
  delete slot.label;
  return slot;
}

async function fillSlot(slot,file){
  applyMedia(slot,await storedMedia(file));
  return slot;
}

function resetSlotClone(source){
  const o=clone(source||{});
  o.id=DB.uid('obj');
  o.type='placeholder';
  o.label='Add photo';
  o.templatePhotoSlot=true;
  o.smartTemplateAdapted=true;
  delete o.mediaId;
  delete o.mediaType;
  delete o.sampleMedia;
  delete o.sampleSource;
  delete o.smartFilled;
  delete o.freeAdded;
  return o;
}

function photoRegion(slots,q){
  if(!slots.length)return{x:0,y:0,w:q.width,h:q.height};
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const o of slots){
    const x=Number(o.x)||0,y=Number(o.y)||0,w=Math.max(1,Number(o.w)||1),h=Math.max(1,Number(o.h)||1);
    minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x+w);maxY=Math.max(maxY,y+h);
  }
  minX=Math.max(0,minX);minY=Math.max(0,minY);
  maxX=Math.min(Number(q.width)||1080,maxX);maxY=Math.min(Number(q.height)||1350,maxY);
  return{x:minX,y:minY,w:Math.max(1,maxX-minX),h:Math.max(1,maxY-minY)};
}

function adaptPhotoRegion(q,slots,region){
  const boxes=SL.rects(slots.length,region.w,region.h,slots.length%2);
  const baseRadius=slots.length?Math.max(0,Math.min(40,Math.round(slots.reduce((s,o)=>s+(Number(o.radius)||0),0)/slots.length))):18;
  for(let i=0;i<slots.length;i++){
    const o=slots[i],b=boxes[i];
    Object.assign(o,{
      x:region.x+b.x,
      y:region.y+b.y,
      w:b.w,
      h:b.h,
      rotation:0,
      radius:baseRadius||16,
      templatePhotoSlot:true,
      smartTemplateAdapted:true
    });
  }
}

async function fitTemplatePhotos(rawFiles){
  const q=project();
  if(!q||q.carousel?.enabled||busy)return false;
  const files=[...rawFiles].filter(isInputFile).slice(0,MAX_BATCH);
  if(!files.length)return false;

  markTemplateSlots(q,{includePlaceholders:!!W.TemplateDrafts?.isTemporary?.()});
  let allSlots=knownSlots(q);
  if(!allSlots.length)return false;

  busy=true;toast(`Fitting ${files.length} photo${files.length===1?'':'s'} into the template…`);
  try{
    const region=photoRegion(allSlots,q);
    const open=availableSlots(q);
    let index=0;

    for(const slot of open){
      if(index>=files.length)break;
      await fillSlot(slot,files[index++]);
      if(index%4===0)await yieldFrame();
    }

    if(index<files.length){
      const prototype=allSlots.at(-1)||allSlots[0];
      while(index<files.length){
        const slot=resetSlotClone(prototype);
        await fillSlot(slot,files[index++]);
        q.objects.push(slot);
        allSlots.push(slot);
        if(index%4===0)await yieldFrame();
      }
      allSlots=knownSlots(q);
      adaptPhotoRegion(q,allSlots,region);
      q.smartTemplatePhotoFit={
        version:1,
        slotCount:allSlots.length,
        adaptedAt:Date.now()
      };
    }

    E.state.selectedId=null;
    E.render();
    E.save();
    window.dispatchEvent(new CustomEvent('washi:smart-layout',{
      detail:{mode:'template-photo-fit',source:'template-photo-choice',count:files.length,slots:knownSlots(q).length}
    }));
    toast(`${files.length} photo${files.length===1?'':'s'} fitted into the template`);
    return true;
  }catch(error){
    console.warn('Washi template photo fit failed',error);
    toast(error?.name==='QuotaExceededError'?'Not enough local storage':'Could not fit these photos');
    return false;
  }finally{busy=false}
}

async function addFreely(rawFiles){
  const q=project();
  if(!q||q.carousel?.enabled||busy)return false;
  const files=[...rawFiles].filter(isInputFile).slice(0,MAX_BATCH);
  if(!files.length)return false;

  busy=true;toast(`Adding ${files.length} photo${files.length===1?'':'s'} freely…`);
  try{
    const added=[];
    for(let i=0;i<files.length;i++){
      const media=await storedMedia(files[i]);
      const w=Math.round(q.width*.56),h=Math.round(q.height*(media.type==='video'?.44:.38));
      const offset=(i%7)*24;
      const o={
        id:DB.uid('obj'),...media,
        x:Math.max(0,Math.round((q.width-w)/2)+offset),
        y:Math.max(0,Math.round((q.height-h)/2)+offset),
        w,h,rotation:(i%3-1)*2,radius:18,
        ...mediaDefaults(),
        freeAdded:true
      };
      q.objects.push(o);added.push(o);
      if(i%4===3)await yieldFrame();
    }
    E.state.selectedId=added.at(-1)?.id||null;
    E.render();E.save();
    toast(`${added.length} photo${added.length===1?'':'s'} added freely`);
    return true;
  }catch(error){
    console.warn('Washi free template photo add failed',error);
    toast(error?.name==='QuotaExceededError'?'Not enough local storage':'Could not add these photos');
    return false;
  }finally{busy=false}
}

function choiceSheet(){
  let sheet=$('#washiTemplatePhotoChoice');
  if(sheet)return sheet;
  sheet=document.createElement('section');
  sheet.id='washiTemplatePhotoChoice';
  sheet.className='washi-template-photo-choice';
  sheet.hidden=true;
  sheet.innerHTML=`
    <div class="wtpc-backdrop" data-wtpc-close></div>
    <div class="wtpc-card" role="dialog" aria-modal="true" aria-labelledby="wtpcTitle">
      <header>
        <div>
          <small>Template photos</small>
          <h2 id="wtpcTitle">How should Washi add them?</h2>
          <p>Fit them into the design, or place them freely.</p>
        </div>
        <button type="button" data-wtpc-close aria-label="Close">×</button>
      </header>
      <div class="wtpc-actions">
        <button type="button" class="wtpc-option" data-wtpc-mode="fit">
          <span class="wtpc-icon">▦</span>
          <span><b>Fill / Adapt Template</b><small>Replace the template photos first. Extra photos reflow only the template's photo area.</small></span>
        </button>
        <button type="button" class="wtpc-option" data-wtpc-mode="free">
          <span class="wtpc-icon">✦</span>
          <span><b>Add Freely</b><small>Leave the template unchanged and add normal movable photo layers.</small></span>
        </button>
      </div>
    </div>`;
  document.body.append(sheet);
  return sheet;
}

function openChoice(){
  const q=project();if(!templateContext(q))return false;
  choiceSheet().hidden=false;return true;
}
function closeChoice(){const sheet=$('#washiTemplatePhotoChoice');if(sheet)sheet.hidden=true}

function ensureInput(){
  let input=$('#washiTemplatePhotoChoiceInput');
  if(input)return input;
  input=document.createElement('input');
  input.id='washiTemplatePhotoChoiceInput';
  input.type='file';input.accept='image/*,video/*';input.multiple=true;input.hidden=true;
  document.body.append(input);
  input.addEventListener('change',async()=>{
    const files=[...input.files];input.value='';
    const mode=pendingMode;pendingMode='';
    if(!files.length)return;
    if(mode==='fit')await fitTemplatePhotos(files);
    else await addFreely(files);
  });
  return input;
}

function chooseMode(mode){
  pendingMode=mode;closeChoice();ensureInput().click();
}

function shouldInterceptAddPhoto(target){
  if(!target?.closest('[data-paction="add-photo"]'))return false;
  const q=project();
  if(!q||q.carousel?.enabled||!templateContext(q))return false;
  return true;
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(shouldInterceptAddPhoto(target)){
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    openChoice();return;
  }
  if(target.closest('[data-wtpc-close]')){event.preventDefault();closeChoice();return}
  const option=target.closest('[data-wtpc-mode]');
  if(option){event.preventDefault();chooseMode(option.dataset.wtpcMode)}
},true);

window.addEventListener('washi:draft-state',event=>{
  if(event.detail?.temporary&&event.detail?.source==='template'){
    markTemplateSlots(project(),{includePlaceholders:true});
  }
});
window.addEventListener('washi:selection-changed',()=>{
  const q=project();
  if(q&&!q.carousel?.enabled)markTemplateSlots(q);
});

setTimeout(()=>ensureInput(),240);

const css=document.createElement('style');
css.textContent=`
.washi-template-photo-choice{position:fixed;inset:0;z-index:171}
.washi-template-photo-choice[hidden]{display:none!important;pointer-events:none!important}
.wtpc-backdrop{position:absolute;inset:0;background:rgba(50,32,40,.32);backdrop-filter:blur(6px)}
.wtpc-card{position:absolute;left:10px;right:10px;bottom:calc(8px + var(--safe-bottom));padding:17px;border:1px solid var(--line);border-radius:26px;background:#fffafd;box-shadow:0 26px 75px rgba(50,25,35,.24)}
.wtpc-card header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.wtpc-card header small{color:var(--rose);font-size:.63rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
.wtpc-card h2{margin:3px 0 3px;font-size:1.18rem}
.wtpc-card header p{margin:0;color:var(--muted);font-size:.74rem;line-height:1.35}
.wtpc-card header>button{width:38px;height:38px;border:1px solid var(--line);border-radius:12px;background:#fff;font-size:1.2rem}
.wtpc-actions{display:grid;gap:9px;margin-top:14px}
.wtpc-option{width:100%;min-height:78px;display:grid;grid-template-columns:50px 1fr;gap:11px;align-items:center;text-align:left;padding:10px;border:1px solid var(--line);border-radius:17px;background:#fff}
.wtpc-option:active{transform:scale(.99)}
.wtpc-icon{width:50px;height:50px;display:grid;place-items:center;border-radius:15px;background:var(--pink-100);color:var(--rose);font-size:1.3rem;font-weight:900}
.wtpc-option b{display:block;font-size:.88rem}
.wtpc-option small{display:block;margin-top:3px;color:var(--muted);font-size:.68rem;line-height:1.35}
`;
document.head.append(css);

W.TemplatePhotoFit={
  version:'2026.08.16-universal1',
  templateContext,
  fitTemplatePhotos,
  addFreely,
  markTemplateSlots,
  photoRegion,
  adaptPhotoRegion,
  isBusy:()=>busy
};
})();