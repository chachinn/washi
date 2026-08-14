(() => {
'use strict';
const W=window.Washi=window.Washi||{},E=W.Editor,DB=W.DB,T=W.Templates;if(!E||!DB||!T)return;
const clone=v=>DB.clone?DB.clone(v):JSON.parse(JSON.stringify(v));
let draft=null,userTemplateArm=false,suppressed=null;
const comparable=p=>{if(!p)return'';const c=clone(p);delete c.updatedAt;return JSON.stringify(c)};
const markDraft=(p,source='template')=>{if(!p)return;draft={id:p.id,source,baseline:comparable(p)};window.dispatchEvent(new CustomEvent('washi:draft-state',{detail:{id:p.id,temporary:true,source}}))};
const clearDraft=()=>{if(!draft)return;const old=draft;draft=null;window.dispatchEvent(new CustomEvent('washi:draft-state',{detail:{id:old.id,temporary:false,source:old.source}}))};

const nativeSetProject=E.setProject.bind(E),nativeCreateFromTemplate=E.createFromTemplate.bind(E),nativeSave=E.save.bind(E),nativeOpenProject=E.openProject?.bind(E),nativeCreateProject=E.createProject?.bind(E),nativeUpsert=DB.upsertProject.bind(DB);
E.setProject=function(p){clearDraft();return nativeSetProject(p)};
E.createFromTemplate=function(id){const p=T.fromTemplate(id);if(!p)return null;clearDraft();nativeSetProject(p);markDraft(p,'template');return p};
E.save=function(options){const p=E.getProject?.();if(draft&&p?.id===draft.id){if(comparable(p)===draft.baseline)return p;const out=nativeSave(options);clearDraft();return out}return nativeSave(options)};
if(nativeOpenProject)E.openProject=function(id){clearDraft();return nativeOpenProject(id)};
if(nativeCreateProject)E.createProject=function(...args){clearDraft();return nativeCreateProject(...args)};

// My Templates used a separate app path that saves before setProject. Arm only
// that exact click, suppress exactly one upsert, then mark the opened copy as a
// temporary draft. No other project writes are affected.
DB.upsertProject=function(p){
  if(userTemplateArm){userTemplateArm=false;suppressed=clone(p);return p}
  return nativeUpsert(p);
};
document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('[data-use-user-template]')){userTemplateArm=true;suppressed=null;setTimeout(()=>{userTemplateArm=false},0)}
},true);
document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target?.closest('[data-use-user-template]'))return;
  if(suppressed){const p=E.getProject?.();if(p?.id===suppressed.id)markDraft(p,'my-template');suppressed=null}
});

window.addEventListener('washi:project-saved',event=>{
  if(draft&&event.detail?.id===draft.id&&DB.getProject?.(draft.id))clearDraft();
});
window.addEventListener('pagehide',()=>{userTemplateArm=false;suppressed=null});
W.TemplateDrafts={version:'v1.0',isTemporary:()=>!!draft&&E.getProject?.()?.id===draft.id,state:()=>draft?{...draft}:null};
})();
