(() => {
'use strict';
const W=window.Washi||{},E=W.Editor,DB=W.DB;
if(!E||!DB)return;
const $=(s,r=document)=>r.querySelector(s);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const mediaInput=$('#mediaInput'),stage=$('#designStage'),objects=$('#objectsLayer'),bar=$('#selectionBar'),editorView=$('#editorView');
let mode='add';
let crop=null;
let cropDirty=false;
const NativeMutationObserver=window.MutationObserver;

function toast(msg){
  const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2100);
}
function project(){return E.getProject?.()||E.state?.project}
function selected(){return E.selected?.()||project()?.objects?.find(o=>o.id===E.state?.selectedId)||null}
function objById(id){return project()?.objects?.find(o=>o.id===id)||null}
function emptySlots(){return (project()?.objects||[]).filter(o=>o.type==='placeholder'&&!o.mediaId&&o.visible!==false)}
function selectedNode(){const id=E.state?.selectedId;return id?objects?.querySelector(`[data-object-id="${CSS.escape(id)}"]`):null}
function isMedia(o){return !!o&&['image','video'].includes(o.type)&&!!o.mediaId}

function ensureCropButton(){
  if(!bar)return null;
  let b=bar.querySelector('[data-object-action="edit-photo"]');
  if(!b){
    b=document.createElement('button');
    b.dataset.objectAction='edit-photo';
    b.textContent='Edit Photo';
    const fill=bar.querySelector('[data-object-action="fill"]');
    (fill||bar.firstElementChild)?.after?.(b);
    if(!b.parentNode)bar.append(b);
  }
  return b;
}
function syncFillButton(){
  if(!bar)return;const o=selected(),f=bar.querySelector('[data-object-action="fill"]'),cropBtn=ensureCropButton();
  if(f){
    if(!o)f.hidden=true;
    else if(o.type==='shape'){f.hidden=false;f.textContent='Use Photo';f.setAttribute('aria-label','Use a photo in this area')}
    else if(o.type==='placeholder'){f.hidden=false;const n=emptySlots().length;f.textContent=n>1?'Fill Photos':'Fill';f.setAttribute('aria-label',n>1?`Fill up to ${n} photo areas`:'Fill this photo area')}
    else if(['image','video'].includes(o.type)){f.hidden=false;f.textContent='Replace';f.setAttribute('aria-label','Replace media')}
    else f.hidden=true;
  }
  if(cropBtn){cropBtn.hidden=!isMedia(o);cropBtn.textContent=crop?.id===o?.id?'Done':'Edit Photo';cropBtn.classList.toggle('active',crop?.id===o?.id)}
}

async function optimize(file){
  if(!file?.type?.startsWith('image/')||file.type==='image/gif'||!window.createImageBitmap)return file;
  try{
    const b=await createImageBitmap(file),m=Math.max(b.width,b.height);
    if(m<=2600&&file.size<=3e6){b.close();return file}
    const k=Math.min(1,2600/m),c=document.createElement('canvas');c.width=Math.max(1,Math.round(b.width*k));c.height=Math.max(1,Math.round(b.height*k));
    c.getContext('2d').drawImage(b,0,0,c.width,c.height);b.close();
    const type=file.type==='image/png'?'image/png':'image/jpeg',blob=await new Promise(r=>c.toBlob(r,type,.9));
    return blob?new File([blob],file.name,{type:blob.type}):file;
  }catch{return file}
}
async function putMedia(target,raw){
  const file=await optimize(raw),id=await DB.assetPut(file,{name:raw.name,type:file.type,size:file.size});
  Object.assign(target,{mediaId:id,mediaType:file.type,type:file.type.startsWith('video/')?'video':'image',fit:target.fit||'cover',filterPreset:target.filterPreset||'none',brightness:target.brightness??1,contrast:target.contrast??1,saturation:target.saturation??1,focusX:target.focusX??50,focusY:target.focusY??50,mediaZoom:target.mediaZoom??1,flipX:!!target.flipX,flipY:!!target.flipY,muted:true});
  return target;
}
function slotOrder(first){
  const slots=emptySlots();
  if(first?.type==='placeholder'&&slots.some(s=>s.id===first.id))return [first,...slots.filter(s=>s.id!==first.id)];
  return slots;
}
async function fillSlots(files,first){
  const slots=slotOrder(first),limit=Math.min(files.length,slots.length);if(!limit)return{filled:0,skipped:files.length};
  if(limit>1)toast(`Filling ${limit} photos…`);
  let filled=0,last=null;
  for(let i=0;i<limit;i++){
    try{last=await putMedia(slots[i],files[i]);filled++}catch(err){if(!filled)throw err;break}
  }
  if(filled){E.state.selectedId=last?.id||E.state.selectedId;E.render();E.save();syncFillButton()}
  return{filled,skipped:Math.max(0,files.length-filled)};
}
async function usePhotoInShape(file,o){
  if(!file||!o||o.type!=='shape')return false;
  await putMedia(o,file);E.state.selectedId=o.id;E.render();E.save();syncFillButton();return true;
}

function sourceSize(m,o){
  if(o.type==='video')return[m.videoWidth||o.w,m.videoHeight||o.h];
  return[m.naturalWidth||o.w,m.naturalHeight||o.h];
}
function cropGeometry(sw,sh,fw,fh,fit='cover',fx=50,fy=50,zoom=1){
  zoom=clamp(Number(zoom)||1,1,5);fx=clamp(Number(fx)||50,0,100);fy=clamp(Number(fy)||50,0,100);
  if(fit==='contain'){
    const scale=Math.min(fw/sw,fh/sh)*zoom,dw=sw*scale,dh=sh*scale;
    const x=dw<=fw?(fw-dw)/2:-(dw-fw)*fx/100;
    const y=dh<=fh?(fh-dh)/2:-(dh-fh)*fy/100;
    return{scale,x,y,dw,dh};
  }
  const scale=Math.max(fw/sw,fh/sh)*zoom,cw=fw/scale,ch=fh/scale;
  const sx=(sw-cw)*fx/100,sy=(sh-ch)*fy/100;
  return{scale,x:-sx*scale,y:-sy*scale,dw:sw*scale,dh:sh*scale};
}
function applyMediaCrop(o,node){
  if(!isMedia(o)||!node)return;
  const m=node.querySelector('.object-content img,.object-content video');if(!m)return;
  const run=()=>{
    const [sw,sh]=sourceSize(m,o);if(!sw||!sh)return;
    const g=cropGeometry(sw,sh,o.w,o.h,o.fit||'cover',o.focusX??50,o.focusY??50,o.mediaZoom??1);
    Object.assign(m.style,{position:'absolute',maxWidth:'none',maxHeight:'none',width:`${g.dw}px`,height:`${g.dh}px`,left:`${g.x}px`,top:`${g.y}px`,objectFit:'fill',objectPosition:'center',transformOrigin:'center',transform:`scaleX(${o.flipX?-1:1}) scaleY(${o.flipY?-1:1})`});
  };
  if((m.tagName==='IMG'&&m.complete&&m.naturalWidth)||(m.tagName==='VIDEO'&&m.readyState>=1))run();
  else m.addEventListener(m.tagName==='IMG'?'load':'loadedmetadata',run,{once:true});
}
function applyAllMediaCrops(){
  for(const o of project()?.objects||[]){if(!isMedia(o))continue;const n=objects?.querySelector(`[data-object-id="${CSS.escape(o.id)}"]`);applyMediaCrop(o,n)}
}
let cropApplyRAF=0;
function scheduleCropApply(o){
  if(cropApplyRAF)return;
  cropApplyRAF=requestAnimationFrame(()=>{cropApplyRAF=0;const n=objects?.querySelector(`[data-object-id="${CSS.escape(o.id)}"]`);applyMediaCrop(o,n);updateCropHUD(o)});
}

function cropHUD(){
  let h=$('#washiMediaCropHUD');if(h)return h;
  h=document.createElement('div');h.id='washiMediaCropHUD';h.className='washi-media-crop-hud';h.hidden=true;
  h.innerHTML='<div class="crop-hint">Drag photo to reposition · pinch to zoom</div><div class="crop-controls"><button type="button" data-crop="minus">−</button><input type="range" min="1" max="5" step="0.01" value="1" data-crop="zoom" aria-label="Photo zoom"><span data-crop="value">100%</span><button type="button" data-crop="plus">＋</button><button type="button" data-crop="reset">Reset</button><button type="button" data-crop="done" class="crop-done">Done</button></div>';
  editorView?.append(h);return h;
}
function updateCropHUD(o=selected()){
  const h=cropHUD();if(!h)return;const z=clamp(Number(o?.mediaZoom)||1,1,5);const slider=h.querySelector('[data-crop="zoom"]'),v=h.querySelector('[data-crop="value"]');if(slider)slider.value=z;if(v)v.textContent=`${Math.round(z*100)}%`;
}
function enterCrop(o=selected()){
  if(!isMedia(o))return;
  if(crop&&crop.id!==o.id)exitCrop(true);
  o.focusX=clamp(Number(o.focusX??50),0,100);o.focusY=clamp(Number(o.focusY??50),0,100);o.mediaZoom=clamp(Number(o.mediaZoom??1),1,5);
  crop={id:o.id,pointers:new Map(),start:null,startDist:0,baseZoom:o.mediaZoom};cropDirty=false;
  stage?.classList.add('photo-crop-mode');objects?.querySelector(`[data-object-id="${CSS.escape(o.id)}"]`)?.classList.add('photo-cropping');
  const h=cropHUD();h.hidden=false;bar?.classList.add('crop-hidden');updateCropHUD(o);syncFillButton();applyMediaCrop(o,selectedNode());
}
function exitCrop(save=true){
  if(!crop)return;const o=objById(crop.id);if(save&&cropDirty&&o)E.save?.();
  crop=null;cropDirty=false;stage?.classList.remove('photo-crop-mode');objects?.querySelector('.photo-cropping')?.classList.remove('photo-cropping');
  const h=$('#washiMediaCropHUD');if(h)h.hidden=true;bar?.classList.remove('crop-hidden');syncFillButton();
}
function setCropZoom(z){
  const o=crop&&objById(crop.id);if(!o)return;o.mediaZoom=clamp(Number(z)||1,1,5);cropDirty=true;scheduleCropApply(o);
}
function pointerDistance(a,b){return Math.hypot(b.x-a.x,b.y-a.y)}
function cropPointerDown(e){
  if(!crop)return false;const n=e.target.closest?.('.layer-object');if(!n||n.dataset.objectId!==crop.id||e.target.closest?.('.object-handle'))return false;
  e.stopImmediatePropagation();e.preventDefault();n.setPointerCapture?.(e.pointerId);crop.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const o=objById(crop.id),rect=n.getBoundingClientRect();crop.start={fx:o.focusX??50,fy:o.focusY??50,zoom:o.mediaZoom??1,x:e.clientX,y:e.clientY,w:Math.max(1,rect.width),h:Math.max(1,rect.height)};
  if(crop.pointers.size===2){const pts=[...crop.pointers.values()];crop.startDist=Math.max(1,pointerDistance(pts[0],pts[1]));crop.baseZoom=o.mediaZoom??1}
  return true;
}
function cropPointerMove(e){
  if(!crop?.pointers.has(e.pointerId))return false;e.stopImmediatePropagation();e.preventDefault();crop.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const o=objById(crop.id);if(!o)return true;
  const pts=[...crop.pointers.values()];
  if(pts.length>=2){if(!crop.startDist){crop.startDist=Math.max(1,pointerDistance(pts[0],pts[1]));crop.baseZoom=o.mediaZoom??1}setCropZoom(crop.baseZoom*pointerDistance(pts[0],pts[1])/crop.startDist);return true}
  const s=crop.start;if(!s)return true;const dx=e.clientX-s.x,dy=e.clientY-s.y,z=Math.max(1,o.mediaZoom||1);
  o.focusX=clamp(s.fx-(dx/s.w)*100/z,0,100);o.focusY=clamp(s.fy-(dy/s.h)*100/z,0,100);cropDirty=true;scheduleCropApply(o);return true;
}
function cropPointerEnd(e){
  if(!crop?.pointers.has(e.pointerId))return false;e.stopImmediatePropagation();e.preventDefault();crop.pointers.delete(e.pointerId);
  if(crop.pointers.size===1){const p=[...crop.pointers.values()][0],o=objById(crop.id),n=objects?.querySelector(`[data-object-id="${CSS.escape(crop.id)}"]`),rect=n?.getBoundingClientRect();crop.start={fx:o?.focusX??50,fy:o?.focusY??50,zoom:o?.mediaZoom??1,x:p.x,y:p.y,w:Math.max(1,rect?.width||1),h:Math.max(1,rect?.height||1)};crop.startDist=0}
  if(!crop.pointers.size){crop.start=null;crop.startDist=0}
  return true;
}

const cropStyle=document.createElement('style');cropStyle.textContent=`
#washiMediaCropHUD{position:absolute;z-index:52;left:12px;right:12px;bottom:calc(84px + var(--safe-bottom));padding:9px 10px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.97);box-shadow:var(--shadow-soft);backdrop-filter:blur(14px)}
#washiMediaCropHUD[hidden]{display:none}.crop-hint{text-align:center;font-size:.68rem;font-weight:800;color:var(--muted);margin-bottom:7px}.crop-controls{display:grid;grid-template-columns:36px minmax(90px,1fr) 48px 36px auto auto;gap:6px;align-items:center}.crop-controls button{height:36px;border:1px solid var(--line);border-radius:10px;background:#fff;font-weight:850;color:var(--ink)}.crop-controls input{width:100%}.crop-controls [data-crop="value"]{font-size:.68rem;font-weight:850;text-align:center;color:var(--muted)}.crop-controls .crop-done{background:var(--rose);color:#fff;border-color:var(--rose)}
.selection-bar.crop-hidden{display:none!important}.photo-crop-mode .photo-cropping:after{border-style:dashed;box-shadow:0 0 0 2px rgba(226,100,144,.18)}.photo-crop-mode .photo-cropping .object-handle{display:none!important}.photo-crop-mode .photo-cropping{cursor:move}.photo-crop-mode .photo-cropping .object-content{touch-action:none}
@media(max-width:430px){.crop-controls{grid-template-columns:34px minmax(72px,1fr) 44px 34px auto}.crop-controls [data-crop="reset"]{display:none}}
`;
document.head.append(cropStyle);

objects?.addEventListener('pointerdown',e=>{if(cropPointerDown(e))return},true);
stage?.addEventListener('pointermove',e=>{if(cropPointerMove(e))return},true);
stage?.addEventListener('pointerup',e=>{if(cropPointerEnd(e))return},true);
stage?.addEventListener('pointercancel',e=>{if(cropPointerEnd(e))return},true);

cropHUD().addEventListener('input',e=>{if(e.target.matches('[data-crop="zoom"]'))setCropZoom(e.target.value)});
cropHUD().addEventListener('change',e=>{if(e.target.matches('[data-crop="zoom"]'))cropDirty=true});
cropHUD().addEventListener('click',e=>{
  const a=e.target.closest('[data-crop]')?.dataset.crop,o=crop&&objById(crop.id);if(!a||!o)return;
  if(a==='minus')setCropZoom((o.mediaZoom||1)-.15);else if(a==='plus')setCropZoom((o.mediaZoom||1)+.15);else if(a==='reset'){o.mediaZoom=1;o.focusX=50;o.focusY=50;cropDirty=true;scheduleCropApply(o)}else if(a==='done')exitCrop(true);
});

document.addEventListener('click',e=>{
  const cropAction=e.target.closest('[data-object-action="edit-photo"]');if(cropAction){e.preventDefault();e.stopImmediatePropagation();if(crop?.id===selected()?.id)exitCrop(true);else enterCrop(selected());return}
  const fill=e.target.closest('[data-object-action="fill"]'),o=selected();
  if(fill){mode=o?.type==='shape'?'shape':o?.type==='placeholder'?'slot':'replace';return}
  if(e.target.closest('[data-paction="replace-media"]')){mode='replace';return}
  if(e.target.closest('[data-paction="add-photo"]')){mode=o?.type==='placeholder'?'slot':'add';return}
},true);

stage?.addEventListener('pointerup',e=>{if(!crop&&e.target.closest('.placeholder-object'))mode='slot'},true);

mediaInput?.addEventListener('change',async e=>{
  const files=[...e.target.files].filter(f=>/^(image|video)\//.test(f.type));if(!files.length)return;
  const o=selected(),slots=emptySlots();
  const handleShape=mode==='shape'&&o?.type==='shape';
  const handleSlots=o?.type==='placeholder'||(files.length>1&&slots.length>0&&mode!=='replace');
  if(!handleShape&&!handleSlots)return;
  e.stopImmediatePropagation();
  try{
    if(handleShape){await usePhotoInShape(files[0],o);toast(files.length>1?'Photo added to area · extra selections ignored':'Photo added to area')}
    else{
      const r=await fillSlots(files,o?.type==='placeholder'?o:null);
      if(r.filled){const plural=r.filled===1?'photo':'photos';toast(r.skipped?`${r.filled} ${plural} filled · ${r.skipped} not added`:`${r.filled} ${plural} filled`)}
    }
  }catch(err){toast(err?.name==='QuotaExceededError'?'Not enough local storage':'Could not add photo')}
  finally{mode='add';e.target.value=''}
},true);

const objectObserver=objects?new NativeMutationObserver(()=>requestAnimationFrame(applyAllMediaCrops)):null;
objectObserver?.observe(objects,{childList:true,subtree:true});
window.addEventListener('washi:selection-changed',()=>{if(crop&&crop.id!==E.state?.selectedId)exitCrop(true);syncFillButton();requestAnimationFrame(applyAllMediaCrops)});
window.addEventListener('washi:project-saved',()=>{syncFillButton();requestAnimationFrame(applyAllMediaCrops)});
requestAnimationFrame(()=>{syncFillButton();applyAllMediaCrops()});
W.SmartPhotoFill={version:'2026.08.14-2',syncFillButton,emptySlots,enterCrop,exitCrop,applyAllMediaCrops};
})();