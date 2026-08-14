(() => {
'use strict';

const W=window.Washi||{},E=W.Editor;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const KEY='washi:return-state:r16';
let origin={route:'home',scrollY:0};

try{
  const saved=JSON.parse(sessionStorage.getItem(KEY)||'null');
  if(saved&&saved.route)origin=saved;
}catch{}

function activeRoute(){
  const route=$('.view.active')?.dataset.view;
  return route&&route!=='editor'?route:null;
}
function rememberOrigin(){
  const route=activeRoute();
  if(!route)return;
  origin={route,scrollY:Math.max(0,window.scrollY||window.pageYOffset||0),savedAt:Date.now()};
  try{sessionStorage.setItem(KEY,JSON.stringify(origin))}catch{}
}
function isEditorEntry(target){
  if(!target||target.closest('[data-favorite-template]'))return false;
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
function restoreOrigin(){
  const route=['home','templates','projects','saved'].includes(origin.route)?origin.route:'home';
  closeEditorChrome();
  $$('.view').forEach(view=>view.classList.toggle('active',view.dataset.view===route));
  $$('.nav-item').forEach(item=>item.classList.toggle('active',item.dataset.route===route));
  const top=Math.max(0,Number(origin.scrollY)||0);
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
  if(isEditorEntry(event.target))rememberOrigin();
  if(event.target.closest('#exitEditor'))leaveEditor(event);
},true);

document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||!$('#editorView')?.classList.contains('active'))return;
  if($('#modal')?.classList.contains('open')||$('#drawer')?.classList.contains('open'))return;
  leaveEditor(event);
},true);

window.addEventListener('pagehide',()=>{if(activeRoute())rememberOrigin()});
W.NavigationReturn={rememberOrigin,restoreOrigin,getOrigin:()=>({...origin}),version:'2026.08.14-r16'};
})();
