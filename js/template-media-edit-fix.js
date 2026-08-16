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

function normalizeSelected(){
 const o=E.selected?.();
 if(!normalizeObject(o))return false;
 E.refreshObject?.();
 W.SmartPhotoFill?.syncFillButton?.();
 requestAnimationFrame(()=>W.SmartPhotoFill?.applyAllMediaCrops?.());
 return true;
}

const objects=document.querySelector('#objectsLayer');
objects?.addEventListener('pointerdown',event=>{
 const node=event.target instanceof Element?event.target.closest('.layer-object[data-object-id]'):null;
 if(!node)return;
 const p=E.getProject?.(),o=p?.objects?.find(item=>item.id===node.dataset.objectId);
 normalizeObject(o);
},true);

window.addEventListener('washi:selection-changed',normalizeSelected);

W.TemplateMediaEditFix={
 version:'2026.08.16-r1',
 normalizeObject,
 normalizeProject(project){let changed=0;for(const o of project?.objects||[])if(normalizeObject(o))changed++;return changed}
};
})();