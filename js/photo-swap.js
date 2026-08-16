(() => {
'use strict';
const W=window.Washi=window.Washi||{},E=W.Editor,DB=W.DB;
if(!E||!DB)return;

const $=(s,r=document)=>r.querySelector(s);
const MEDIA_KEYS=['type','mediaId','mediaType','focusX','focusY','mediaZoom','filterPreset','brightness','contrast','saturation','flipX','flipY','muted','sampleMedia','sampleSource'];
let sourceId=null;

function toast(text){
 const t=$('#toast');if(!t)return;
 t.textContent=text;t.classList.add('show');clearTimeout(toast.timer);
 toast.timer=setTimeout(()=>t.classList.remove('show'),2200);
}
function project(){return E.getProject?.()||E.state?.project||null}
function mediaObject(id){return project()?.objects?.find(o=>o.id===id)||null}
function eligible(o){return !!(o?.mediaId&&['image','video','placeholder'].includes(o.type))}
function actualType(o){return o?.type==='placeholder'?(String(o.mediaType||'').startsWith('video/')?'video':'image'):o?.type}
function payload(o){
 const out={};
 for(const key of MEDIA_KEYS)if(Object.prototype.hasOwnProperty.call(o,key))out[key]=DB.clone?DB.clone(o[key]):o[key];
 out.type=actualType(o);
 return out;
}
function applyPayload(o,data){
 for(const key of MEDIA_KEYS){
  if(Object.prototype.hasOwnProperty.call(data,key))o[key]=DB.clone?DB.clone(data[key]):data[key];
  else delete o[key];
 }
 o.type=data.type||'image';
}
function mediaCount(){return (project()?.objects||[]).filter(eligible).length}
function hint(){
 let h=$('#washiSwapHint');
 if(!h){
  h=document.createElement('div');h.id='washiSwapHint';h.hidden=true;
  h.innerHTML='<span>Tap another photo to swap</span><button type="button" data-washi-swap-cancel>Cancel</button>';
  document.body.append(h);
 }
 return h;
}
function setMode(id=null){
 sourceId=id;
 document.documentElement.classList.toggle('washi-photo-swap-mode',!!id);
 const h=hint();h.hidden=!id;
 syncButton();
}
function syncButton(){
 const bar=$('#selectionBar');if(!bar)return;
 let b=bar.querySelector('[data-washi-photo-swap]');
 if(!b){
  b=document.createElement('button');b.type='button';b.dataset.washiPhotoSwap='1';b.textContent='Swap';
  const fill=bar.querySelector('[data-object-action="fill"]');
  if(fill)fill.after(b);else bar.prepend(b);
 }
 const selected=E.selected?.();
 b.hidden=!(eligible(selected)&&mediaCount()>=2);
 b.classList.toggle('active',!!sourceId&&selected?.id===sourceId);
}
function swap(source,target){
 if(!eligible(source)||!eligible(target)||source.id===target.id)return false;
 const a=payload(source),b=payload(target);
 applyPayload(source,b);applyPayload(target,a);
 E.state.selectedId=target.id;
 E.render();E.save();
 setMode(null);toast('Photos swapped');
 return true;
}

document.addEventListener('click',event=>{
 const target=event.target instanceof Element?event.target:null;if(!target)return;
 if(target.closest('[data-washi-swap-cancel]')){
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();setMode(null);return;
 }
 if(target.closest('[data-washi-photo-swap]')){
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
  const selected=E.selected?.();
  if(!eligible(selected)||mediaCount()<2){toast('Select a photo with another photo available');return}
  if(sourceId===selected.id){setMode(null);return}
  setMode(selected.id);toast('Now tap the photo you want to swap with');
 }
},true);

document.addEventListener('pointerdown',event=>{
 if(!sourceId)return;
 const target=event.target instanceof Element?event.target:null;if(!target)return;
 if(target.closest('#washiSwapHint,[data-washi-photo-swap]'))return;
 const node=target.closest('.layer-object[data-object-id]');
 if(!node)return;
 const source=mediaObject(sourceId),other=mediaObject(node.dataset.objectId);
 if(!source){setMode(null);return}
 if(other?.id===source.id){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();toast('Tap a different photo');return}
 if(!eligible(other)){toast('Choose another photo');return}
 event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
 swap(source,other);
},true);

window.addEventListener('washi:selection-changed',()=>requestAnimationFrame(syncButton));
window.addEventListener('washi:project-saved',()=>{if(sourceId&&!mediaObject(sourceId))setMode(null)});
window.addEventListener('washi:experience-ready',()=>requestAnimationFrame(syncButton));
setTimeout(syncButton,160);

const css=document.createElement('style');css.textContent=`
#selectionBar [data-washi-photo-swap][hidden]{display:none!important}
#selectionBar [data-washi-photo-swap].active{background:var(--pink-100);color:var(--rose)}
#washiSwapHint{position:fixed;z-index:145;left:50%;top:calc(max(10px,var(--safe-top)) + 8px);transform:translateX(-50%);display:flex;align-items:center;gap:9px;max-width:calc(100vw - 24px);padding:8px 9px 8px 13px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.97);box-shadow:0 10px 28px rgba(70,40,52,.18);font-size:.73rem;font-weight:850;white-space:nowrap}
#washiSwapHint[hidden]{display:none!important}
#washiSwapHint button{border:0;border-radius:999px;background:var(--pink-100);color:var(--rose);min-height:32px;padding:0 11px;font-weight:850}
html.washi-photo-swap-mode .layer-object{cursor:crosshair}
`;
document.head.append(css);

W.PhotoSwap={version:'v1.0-frame-content-swap',swap,cancel:()=>setMode(null)};
})();
