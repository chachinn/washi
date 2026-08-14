(() => {
'use strict';

const W=window.Washi||{},E=W.Editor;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const KEY='washi:return-state:v1.0';
const ALLOWED=new Set(['home','templates','projects','saved']);
let origin={route:'home',scrollY:0,templateSearch:'',templateCategory:'All',chipScroll:0};

try{
  const saved=JSON.parse(sessionStorage.getItem(KEY)||'null');
  if(saved&&ALLOWED.has(saved.route))origin={...origin,...saved};
}catch{}

function activeRoute(){
  const route=$('.view.active')?.dataset.view;
  return ALLOWED.has(route)?route:null;
}
function routeFromTarget(target){
  if(!(target instanceof Element))return null;
  const route=target.closest('.view')?.dataset.view;
  return ALLOWED.has(route)?route:null;
}
function templateState(){
  return {
    templateSearch:$('#templateSearch')?.value||'',
    templateCategory:$('#templateChips .chip.active')?.dataset.templateCategory||'All',
    chipScroll:Math.max(0,$('#templateChips')?.scrollLeft||0)
  };
}
function persist(){
  try{sessionStorage.setItem(KEY,JSON.stringify(origin))}catch{}
}
function rememberOrigin(routeOverride){
  const route=ALLOWED.has(routeOverride)?routeOverride:activeRoute();
  if(!route)return;
  origin={
    ...origin,
    route,
    scrollY:Math.max(0,window.scrollY||window.pageYOffset||0),
    ...(route==='templates'?templateState():{}),
    savedAt:Date.now()
  };
  persist();
}
function isEditorEntry(target){
  if(!(target instanceof Element)||target.closest('[data-favorite-template]'))return false;
  return !!target.closest([
    '[data-template-id]',
    '[data-open-project]',
    '[data-use-user-template]',
    '[data-fun-text]',
    '[data-new-format]',
    '#createCustom',
    '[data-action="auto-dump"]',
    '[data-action="photo-dump"]'
  ].join(','));
}
function closeEditorChrome(){
  const panel=$('#editorPanel'),modal=$('#modal'),drawer=$('#drawer');
  panel?.classList.remove('open');
  panel?.setAttribute('aria-hidden','true');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
  drawer?.classList.remove('open');
  drawer?.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  E?.setDrawMode?.(false);
}
function restoreTemplateState(state){
  const search=$('#templateSearch');
  if(search&&search.value!==state.templateSearch)search.value=state.templateSearch||'';
  const chips=$('#templateChips');
  if(chips){
    const wanted=[...chips.querySelectorAll('[data-template-category]')]
      .find(button=>button.dataset.templateCategory===(state.templateCategory||'All'));
    if(wanted){
      chips.querySelectorAll('[data-template-category]').forEach(button=>button.classList.toggle('active',button===wanted));
    }
    chips.scrollLeft=Math.max(0,Number(state.chipScroll)||0);
  }
}
function restoreOrigin(){
  const state={...origin};
  const route=ALLOWED.has(state.route)?state.route:'home';
  closeEditorChrome();
  $$('.view').forEach(view=>view.classList.toggle('active',view.dataset.view===route));
  $$('.nav-item').forEach(item=>item.classList.toggle('active',item.dataset.route===route));
  if(route==='templates')restoreTemplateState(state);
  const top=Math.max(0,Number(state.scrollY)||0);
  requestAnimationFrame(()=>{
    window.scrollTo({top,left:0,behavior:'auto'});
    requestAnimationFrame(()=>window.scrollTo({top,left:0,behavior:'auto'}));
  });
}
function leaveEditor(event){
  if(!$('#editorView')?.classList.contains('active'))return;
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
  try{E?.save?.()}catch(err){console.warn('Washi navigation save skipped',err)}
  restoreOrigin();
}

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target)return;

  // Record the source from the actual DOM section first. This removes the old
  // dependency on a fragile inferred active route for template-card entry.
  if(isEditorEntry(target)){
    const source=routeFromTarget(target)||activeRoute();
    if(source)rememberOrigin(source);
  }

  // Template cards inside Templates always return to Templates, even if another
  // feature module changes how the editor is opened later.
  if(target.closest('#templatesView [data-template-id]'))rememberOrigin('templates');

  if(target.closest('#exitEditor'))leaveEditor(event);
},true);

document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||!$('#editorView')?.classList.contains('active'))return;
  if($('#modal')?.classList.contains('open')||$('#drawer')?.classList.contains('open'))return;
  leaveEditor(event);
},true);

window.addEventListener('pagehide',()=>{const route=activeRoute();if(route)rememberOrigin(route)});
W.NavigationReturn={rememberOrigin,restoreOrigin,getOrigin:()=>({...origin}),version:'v1.0'};
})();
