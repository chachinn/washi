(() => {
'use strict';

const W=window.Washi=window.Washi||{},E=W.Editor,DB=W.DB;
if(!E||!DB||W.CanvasMultiSelect)return;

const $=(s,r=document)=>r.querySelector(s);
const stage=$('#designStage');
const objects=$('#objectsLayer');
const selectionBar=$('#selectionBar');
const editorView=$('#editorView');
const selectedIds=new Set();

let selectMode=false;
let gesture=null;

const project=()=>E.getProject?.()||E.state?.project||null;
const selectedObject=()=>E.selected?.()||project()?.objects?.find(o=>o.id===E.state?.selectedId)||null;
const objectById=id=>project()?.objects?.find(o=>o.id===id)||null;
const editorActive=()=>!!editorView?.classList.contains('active');
const isCropActive=()=>!!stage?.classList.contains('photo-crop-mode');

function toast(text){
  const t=$('#toast');
  if(!t)return;
  t.textContent=text;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>t.classList.remove('show'),2100);
}

function allGroupMembers(groupId){
  if(!groupId)return [];
  return (project()?.objects||[]).filter(o=>o.groupId===groupId).map(o=>o.id);
}

function unitIds(o){
  if(!o)return [];
  return o.groupId?allGroupMembers(o.groupId):[o.id];
}

function currentObjects(){
  const p=project();
  if(!p)return [];
  return [...selectedIds].map(id=>p.objects.find(o=>o.id===id)).filter(Boolean);
}

function selectionHasLocked(){
  return currentObjects().some(o=>o.locked);
}

function oneCompleteGroup(){
  const list=currentObjects();
  if(list.length<2)return null;
  const gid=list[0]?.groupId;
  if(!gid||list.some(o=>o.groupId!==gid))return null;
  const members=allGroupMembers(gid);
  return members.length===list.length&&members.every(id=>selectedIds.has(id))?gid:null;
}

function ensureStartButton(){
  if(!selectionBar)return null;
  let b=selectionBar.querySelector('[data-washi-multi-start]');
  if(!b){
    b=document.createElement('button');
    b.type='button';
    b.dataset.washiMultiStart='1';
    b.textContent='Select multiple';
    const duplicate=selectionBar.querySelector('[data-object-action="duplicate"]');
    if(duplicate)duplicate.after(b);
    else selectionBar.append(b);
  }
  const o=selectedObject();
  b.hidden=!o||isCropActive()||selectMode||selectedIds.size>1;
  return b;
}

function ensureBar(){
  let bar=$('#washiCanvasMultiBar');
  if(bar)return bar;
  bar=document.createElement('div');
  bar.id='washiCanvasMultiBar';
  bar.hidden=true;
  bar.innerHTML=`
    <span class="wcm-count">0 selected</span>
    <button type="button" data-wcm-action="group">Group</button>
    <button type="button" data-wcm-action="duplicate">Duplicate</button>
    <button type="button" data-wcm-action="delete">Delete</button>
    <button type="button" data-wcm-action="done" class="wcm-done">Done</button>
  `;
  document.body.append(bar);
  return bar;
}

function syncVisuals(){
  const p=project();
  if(!p||!editorActive()){
    ensureBar().hidden=true;
    editorView?.classList.remove('washi-canvas-multi-active');
    return;
  }

  for(const id of [...selectedIds]){
    if(!p.objects.some(o=>o.id===id))selectedIds.delete(id);
  }

  objects?.querySelectorAll('.layer-object').forEach(node=>{
    node.classList.toggle('washi-multi-selected',selectedIds.has(node.dataset.objectId));
  });

  const active=selectMode||selectedIds.size>1;
  editorView?.classList.toggle('washi-canvas-multi-active',active);

  const bar=ensureBar();
  bar.hidden=!active;
  if(active){
    const count=bar.querySelector('.wcm-count');
    if(count)count.textContent=`${selectedIds.size} selected`;
    const group=bar.querySelector('[data-wcm-action="group"]');
    const gid=oneCompleteGroup();
    if(group){
      group.textContent=gid?'Ungroup':'Group';
      group.disabled=selectedIds.size<2;
    }
  }

  ensureStartButton();
}

function setCorePrimary(){
  const first=[...selectedIds][0]||null;
  E.state.selectedId=first;
}

function clearSelection({render=false}={}){
  selectMode=false;
  selectedIds.clear();
  gesture=null;
  editorView?.classList.remove('washi-canvas-multi-active');
  ensureBar().hidden=true;
  objects?.querySelectorAll('.washi-multi-selected').forEach(n=>n.classList.remove('washi-multi-selected'));
  ensureStartButton();
  if(render&&editorActive())E.render?.();
}

function startMulti(){
  const o=selectedObject();
  if(!o)return;
  if(o.locked){toast('Unlock this item first');return}
  W.PhotoSwap?.cancel?.();
  W.SmartPhotoFill?.exitCrop?.(true);
  selectedIds.clear();
  for(const id of unitIds(o)){
    const item=objectById(id);
    if(item&&!item.locked)selectedIds.add(id);
  }
  selectMode=true;
  setCorePrimary();
  syncVisuals();
  toast('Tap items to select · drag selected items to move together');
}

function toggleUnit(o){
  if(!o||o.locked){if(o?.locked)toast('Unlock this item first');return}
  const ids=unitIds(o).filter(id=>!objectById(id)?.locked);
  const allSelected=ids.length>0&&ids.every(id=>selectedIds.has(id));
  if(allSelected)ids.forEach(id=>selectedIds.delete(id));
  else ids.forEach(id=>selectedIds.add(id));
  if(!selectedIds.size)selectedIds.add(o.id);
  setCorePrimary();
  syncVisuals();
}

function bounds(list){
  if(!list.length)return null;
  const left=Math.min(...list.map(o=>o.x));
  const top=Math.min(...list.map(o=>o.y));
  const right=Math.max(...list.map(o=>o.x+o.w));
  const bottom=Math.max(...list.map(o=>o.y+o.h));
  return {left,top,right,bottom,w:right-left,h:bottom-top};
}

function clampedDelta(dx,dy,base){
  if(!DB.getSettings?.().keepInside)return {dx,dy};
  const p=project(),box=bounds(base.map(x=>x.base));
  if(!p||!box)return {dx,dy};
  dx=Math.max(-box.left,Math.min(dx,p.width-box.right));
  dy=Math.max(-box.top,Math.min(dy,p.height-box.bottom));
  return {dx,dy};
}

function livePosition(o){
  const n=objects?.querySelector(`[data-object-id="${CSS.escape(o.id)}"]`);
  if(!n)return;
  n.style.left=`${o.x}px`;
  n.style.top=`${o.y}px`;
}

function beginGesture(e,o,node,{groupOutside=false}={}){
  const ids=unitIds(o);
  if(ids.some(id=>objectById(id)?.locked)){
    toast('Unlock grouped items before moving them');
    return false;
  }

  if(groupOutside){
    selectedIds.clear();
    ids.forEach(id=>selectedIds.add(id));
    setCorePrimary();
    syncVisuals();
  }

  const unit=unitIds(o);
  const wasAll=unit.length>0&&unit.every(id=>selectedIds.has(id));
  gesture={
    pointerId:e.pointerId,
    startClientX:e.clientX,
    startClientY:e.clientY,
    moved:false,
    wasAll,
    unit,
    base:currentObjects().map(item=>({id:item.id,base:{x:item.x,y:item.y,w:item.w,h:item.h}}))
  };
  node.setPointerCapture?.(e.pointerId);
  return true;
}

function prepareDragSelection(){
  if(!gesture)return;
  if(!gesture.wasAll){
    gesture.unit.forEach(id=>{
      const item=objectById(id);
      if(item&&!item.locked)selectedIds.add(id);
    });
    setCorePrimary();
    gesture.base=currentObjects().map(item=>({id:item.id,base:{x:item.x,y:item.y,w:item.w,h:item.h}}));
    syncVisuals();
  }
}

function moveGesture(e){
  if(!gesture||e.pointerId!==gesture.pointerId)return false;
  const rawDx=(e.clientX-gesture.startClientX)/(E.state.zoom||1);
  const rawDy=(e.clientY-gesture.startClientY)/(E.state.zoom||1);
  if(!gesture.moved&&Math.hypot(e.clientX-gesture.startClientX,e.clientY-gesture.startClientY)<5)return true;
  if(!gesture.moved){
    gesture.moved=true;
    prepareDragSelection();
  }

  const delta=clampedDelta(rawDx,rawDy,gesture.base);
  for(const entry of gesture.base){
    const o=objectById(entry.id);
    if(!o)continue;
    o.x=entry.base.x+delta.dx;
    o.y=entry.base.y+delta.dy;
    livePosition(o);
  }
  return true;
}

function endGesture(e){
  if(!gesture||e.pointerId!==gesture.pointerId)return false;
  const g=gesture;
  gesture=null;

  if(g.moved){
    E.save?.();
    E.render?.();
    syncVisuals();
    return true;
  }

  if(selectMode){
    const o=objectById(g.unit[0]);
    if(o)toggleUnit(o);
  }else syncVisuals();
  return true;
}

function groupSelection(){
  const list=currentObjects();
  if(list.length<2){toast('Select at least 2 items');return}
  if(selectionHasLocked()){toast('Unlock selected items before grouping');return}
  const existing=oneCompleteGroup();
  if(existing){
    list.forEach(o=>delete o.groupId);
    E.save?.();
    E.render?.();
    selectMode=false;
    selectedIds.clear();
    toast('Group removed');
    return;
  }
  const gid=DB.uid('grp');
  list.forEach(o=>o.groupId=gid);
  E.save?.();
  E.render?.();
  selectedIds.clear();
  list.forEach(o=>selectedIds.add(o.id));
  selectMode=false;
  setCorePrimary();
  syncVisuals();
  toast(`${list.length} items grouped`);
}

function duplicateSelection(){
  const p=project(),list=currentObjects();
  if(!p||!list.length)return;
  if(selectionHasLocked()){toast('Unlock selected items before duplicating');return}

  const groupMap=new Map();
  const clones=list.map(o=>{
    const c=DB.clone(o);
    c.id=DB.uid('obj');
    c.x+=28;
    c.y+=28;
    if(o.groupId){
      if(!groupMap.has(o.groupId))groupMap.set(o.groupId,DB.uid('grp'));
      c.groupId=groupMap.get(o.groupId);
    }
    return c;
  });
  p.objects.push(...clones);
  selectedIds.clear();
  clones.forEach(c=>selectedIds.add(c.id));
  selectMode=clones.length>1&&!oneCompleteGroup();
  setCorePrimary();
  E.save?.();
  E.render?.();
  syncVisuals();
  toast(`${clones.length} items duplicated`);
}

function deleteSelection(){
  const p=project(),ids=new Set(selectedIds);
  if(!p||!ids.size)return;
  if(selectionHasLocked()){toast('Unlock selected items before deleting');return}
  p.objects=p.objects.filter(o=>!ids.has(o.id));
  clearSelection();
  E.state.selectedId=null;
  E.save?.();
  E.render?.();
  toast(`${ids.size} items deleted`);
}

function done(){
  const first=[...selectedIds][0]||null;
  selectMode=false;
  selectedIds.clear();
  gesture=null;
  editorView?.classList.remove('washi-canvas-multi-active');
  ensureBar().hidden=true;
  if(first&&objectById(first)){
    E.state.selectedId=first;
    E.render?.();
  }else{
    E.state.selectedId=null;
    E.render?.();
  }
}

selectionBar?.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target?.closest('[data-washi-multi-start]'))return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  startMulti();
},true);

ensureBar().addEventListener('click',event=>{
  const action=event.target.closest('[data-wcm-action]')?.dataset.wcmAction;
  if(!action)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  if(action==='group')groupSelection();
  else if(action==='duplicate')duplicateSelection();
  else if(action==='delete')deleteSelection();
  else if(action==='done')done();
},true);

objects?.addEventListener('pointerdown',event=>{
  if(!editorActive()||isCropActive())return;
  const node=event.target.closest?.('.layer-object[data-object-id]');
  if(!node||event.target.closest?.('.object-handle'))return;
  const o=objectById(node.dataset.objectId);
  if(!o)return;

  const grouped=!!o.groupId;
  if(!selectMode&&!grouped){
    if(selectedIds.size)clearSelection();
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if(selectMode)beginGesture(event,o,node);
  else if(grouped)beginGesture(event,o,node,{groupOutside:true});
},true);

document.addEventListener('pointermove',event=>{
  if(!gesture)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  moveGesture(event);
},true);

for(const type of ['pointerup','pointercancel']){
  document.addEventListener(type,event=>{
    if(!gesture)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    endGesture(event);
  },true);
}

window.addEventListener('washi:selection-changed',()=>{
  if(!editorActive())return;
  if(!selectMode&&selectedIds.size<=1)selectedIds.clear();
  requestAnimationFrame(syncVisuals);
});
window.addEventListener('washi:project-saved',()=>requestAnimationFrame(syncVisuals));
window.addEventListener('washi:experience-ready',()=>requestAnimationFrame(syncVisuals));
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearSelection()});
window.addEventListener('pagehide',()=>clearSelection());

const css=document.createElement('style');
css.textContent=`
#selectionBar [data-washi-multi-start][hidden]{display:none!important}
.editor-view.washi-canvas-multi-active #selectionBar{display:none!important}
.layer-object.washi-multi-selected:after{content:'';position:absolute;inset:-5px;border:3px solid var(--rose);border-radius:10px;pointer-events:none;box-shadow:0 0 0 2px rgba(255,255,255,.9)}
.layer-object.washi-multi-selected .object-handle{display:none!important}
#washiCanvasMultiBar{position:fixed;z-index:66;left:12px;right:12px;bottom:calc(var(--washi-nav-height,74px) + 84px);display:flex;align-items:center;gap:7px;overflow-x:auto;padding:8px 9px;border:1px solid var(--line);border-radius:17px;background:rgba(255,255,255,.97);box-shadow:0 12px 28px rgba(70,40,52,.17);backdrop-filter:blur(14px);-webkit-overflow-scrolling:touch}
#washiCanvasMultiBar[hidden]{display:none!important}
#washiCanvasMultiBar .wcm-count{flex:0 0 auto;font-size:.72rem;font-weight:900;color:var(--rose);padding:0 4px}
#washiCanvasMultiBar button{flex:0 0 auto;min-height:38px;border:1px solid var(--line);border-radius:11px;background:#fff;color:var(--ink);padding:0 12px;font-weight:850}
#washiCanvasMultiBar button:disabled{opacity:.42}
#washiCanvasMultiBar .wcm-done{background:var(--rose);border-color:var(--rose);color:#fff}
@media(max-width:430px){#washiCanvasMultiBar{left:8px;right:8px;gap:5px;padding:7px}#washiCanvasMultiBar button{padding:0 10px;font-size:.72rem}.layer-object.washi-multi-selected:after{inset:-4px;border-width:2px}}
`;
document.head.append(css);

ensureStartButton();
syncVisuals();

W.CanvasMultiSelect={
  version:'2026.08.16-r1',
  start:startMulti,
  cancel:()=>clearSelection(),
  selectedIds:()=>[...selectedIds],
  group:groupSelection,
  ungroup:()=>{if(oneCompleteGroup())groupSelection()}
};
})();
