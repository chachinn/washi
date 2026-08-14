(() => {
'use strict';
const W=window.Washi||{},E=W.Editor,DB=W.DB;
if(!E||!DB)return;
const $=(s,r=document)=>r.querySelector(s);
const mediaInput=$('#mediaInput'),stage=$('#designStage'),bar=$('#selectionBar');
let mode='add';

function toast(msg){
  const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2100);
}
function project(){return E.getProject?.()||E.state?.project}
function selected(){return E.selected?.()||project()?.objects?.find(o=>o.id===E.state?.selectedId)||null}
function emptySlots(){return (project()?.objects||[]).filter(o=>o.type==='placeholder'&&!o.mediaId&&o.visible!==false)}
function syncFillButton(){
  if(!bar)return;const o=selected(),f=bar.querySelector('[data-object-action="fill"]');if(!f)return;
  if(!o){f.hidden=true;return}
  if(o.type==='shape'){f.hidden=false;f.textContent='Use Photo';f.setAttribute('aria-label','Use a photo in this area');return}
  if(o.type==='placeholder'){f.hidden=false;const n=emptySlots().length;f.textContent=n>1?'Fill Photos':'Fill';f.setAttribute('aria-label',n>1?`Fill up to ${n} photo areas`:'Fill this photo area');return}
  if(['image','video'].includes(o.type)){f.hidden=false;f.textContent='Replace';f.setAttribute('aria-label','Replace media');return}
  f.hidden=true;
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
  Object.assign(target,{mediaId:id,mediaType:file.type,type:file.type.startsWith('video/')?'video':'image',fit:target.fit||'cover',filterPreset:target.filterPreset||'none',brightness:target.brightness??1,contrast:target.contrast??1,saturation:target.saturation??1,focusX:target.focusX??50,focusY:target.focusY??50,flipX:!!target.flipX,flipY:!!target.flipY,muted:true});
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

document.addEventListener('click',e=>{
  const fill=e.target.closest('[data-object-action="fill"]'),o=selected();
  if(fill){mode=o?.type==='shape'?'shape':o?.type==='placeholder'?'slot':'replace';return}
  if(e.target.closest('[data-paction="replace-media"]')){mode='replace';return}
  if(e.target.closest('[data-paction="add-photo"]')){mode=o?.type==='placeholder'?'slot':'add';return}
},true);

stage?.addEventListener('pointerup',e=>{
  if(e.target.closest('.placeholder-object'))mode='slot';
},true);

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

window.addEventListener('washi:selection-changed',syncFillButton);
window.addEventListener('washi:project-saved',syncFillButton);
requestAnimationFrame(syncFillButton);
W.SmartPhotoFill={version:'2026.08.14-1',syncFillButton,emptySlots};
})();