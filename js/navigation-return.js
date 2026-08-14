(() => {
'use strict';

const W=window.Washi||{},E=W.Editor;
const $=(s,r=document)=>r.querySelector(s);
let origin={route:'home',scrollY:0,templateSearch:'',templateCategory:'All',chipScroll:0};

function activeRoute(){
  const view=$('.view.active');
  return view?.dataset.view&&view.dataset.view!=='editor'?view.dataset.view:null;
}
function rememberOrigin(){
  const route=activeRoute();
  if(!route)return;
  origin={
    route,
    scrollY:Math.max(0,window.scrollY||window.pageYOffset||0),
    templateSearch:$('#templateSearch')?.value||'',
    templateCategory:$('#templateChips .chip.active')?.dataset.templateCategory||'All',
    chipScroll:$('#templateChips')?.scrollLeft||0
  };
}
function routeButton(route){
  return $(`#bottomNav [data-route="${route}"]`)||$(`[data-route="${route}"]`);
}
function restoreTemplateState(state){
  if(state.route!=='templates')return;
  const search=$('#templateSearch');
  if(search&&search.value!==state.templateSearch){
    search.value=state.templateSearch;
    search.dispatchEvent(new Event('input',{bubbles:true}));
  }
  const chip=$(`#templateChips [data-template-category="${CSS.escape(state.templateCategory||'All')}"]`);
  if(chip&&!chip.classList.contains('active'))chip.click();
  const chips=$('#templateChips');
  if(chips)chips.scrollLeft=state.chipScroll||0;
}
function restoreScroll(state){
  const top=Math.max(0,state.scrollY||0);
  window.scrollTo({top,behavior:'auto'});
  requestAnimationFrame(()=>window.scrollTo({top,behavior:'auto'}));
  setTimeout(()=>window.scrollTo({top,behavior:'auto'}),80);
}
function leaveEditor(){
  const state={...origin};
  try{E?.save?.()}catch(err){console.warn('Washi navigation save skipped',err)}
  const button=routeButton(state.route)||routeButton('home');
  if(!button)return;
  button.click();
  requestAnimationFrame(()=>{
    restoreTemplateState(state);
    restoreScroll(state);
  });
}
function isEditorEntry(target){
  return !!target.closest([
    '[data-template-id]',
    '[data-open-project]',
    '[data-use-user-template]',
    '[data-fun-text]',
    '[data-format]',
    '[data-new-format]',
    '#createCustom',
    '[data-action="auto-dump"]',
    '[data-action="photo-dump"]'
  ].join(','));
}

document.addEventListener('click',event=>{
  if(event.target.closest('#exitEditor')&&$('#editorView')?.classList.contains('active')){
    event.preventDefault();
    event.stopImmediatePropagation();
    leaveEditor();
    return;
  }
  if(isEditorEntry(event.target))rememberOrigin();
},true);

document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||!$('#editorView')?.classList.contains('active'))return;
  if($('#modal')?.classList.contains('open')||$('#drawer')?.classList.contains('open'))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  leaveEditor();
},true);

W.NavigationReturn={rememberOrigin,leaveEditor,getOrigin:()=>({...origin}),version:'2026.08.14-r16'};
})();
