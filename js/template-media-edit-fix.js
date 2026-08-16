(() => {
'use strict';
const W=window.Washi=window.Washi||{},E=W.Editor;
if(!E||W.TemplateMediaEditFix)return;

function normalizeObject(o){
 if(!o||o.type!=='placeholder'||!o.mediaId)return false;
 o.type=String(o.mediaType||'').startsWith('video/')?'video':'image';
 o.fit=o.fit||'cover';
 o.filterPreset=o.filterPreset||'none';
 o.brightness=o.brightness??1;
 o.contrast=o.contrast??1;
 o.saturation=o.saturation??1;
 o.focusX=o.focusX??50;
 o.focusY=o.focusY??50;
 o.mediaZoom=o.mediaZoom??1;
 o.flipX=!!o.flipX;
 o.flipY=!!o.flipY;
 if(o.type==='video')o.muted=o.muted!==false;
 return true;
}

function syncMediaUI(){
 W.SmartPhotoFill?.syncFillButton?.();
 requestAnimationFrame(()=>W.SmartPhotoFill?.applyAllMediaCrops?.());
}

function normalizeSelected({refresh=true}={}){
 const o=E.selected?.();
 if(!normalizeObject(o))return false;
 if(refresh)E.refreshObject?.();
 syncMediaUI();
 return true;
}

const objects=document.querySelector('#objectsLayer');
objects?.addEventListener('pointerdown',event=>{
 const node=event.target instanceof Element?event.target.closest('.layer-object[data-object-id]'):null;
 if(!node)return;
 const p=E.getProject?.(),o=p?.objects?.find(item=>item.id===node.dataset.objectId);
 normalizeObject(o);
},true);

// Normalize before the click event so the older media-fill/app handlers see a
// real image/video and choose Replace rather than placeholder Fill mode.
document.addEventListener('pointerdown',event=>{
 const target=event.target instanceof Element?event.target:null;
 if(!target?.closest('[data-object-action="fill"],[data-paction="replace-media"]'))return;
 normalizeSelected();
},true);

document.addEventListener('click',event=>{
 const target=event.target instanceof Element?event.target:null;
 if(!target?.closest('[data-object-action="fill"],[data-paction="replace-media"]'))return;
 normalizeSelected();
},true);

window.addEventListener('washi:selection-changed',()=>{
 normalizeSelected();
 syncMediaUI();
});

const nativeReplace=E.replaceSelectedMedia?.bind(E);
if(nativeReplace){
 E.replaceSelectedMedia=async function(file){
  const out=await nativeReplace(file);
  if(out?.sampleMedia||out?.sampleSource){
   delete out.sampleMedia;
   delete out.sampleSource;
   E.save?.({history:false,renderUI:false});
  }
  syncMediaUI();
  return out;
 };
}

W.TemplateMediaEditFix={
 version:'2026.08.16-r2-replace',
 normalizeObject,
 normalizeSelected,
 normalizeProject(project){let changed=0;for(const o of project?.objects||[])if(normalizeObject(o))changed++;return changed}
};
})();