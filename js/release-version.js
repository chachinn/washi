(() => {
'use strict';
const W=window.Washi=window.Washi||{};
W.VERSION='v1.0';
W.RELEASE_STAGE='pre-release';
document.documentElement.dataset.washiVersion='v1.0';

const versionNode=document.querySelector('.drawer-version');
if(versionNode)versionNode.textContent='Washi v1.0 · Creative Studio';

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target?.closest('[data-action="whats-new"]'))return;
  const title=document.querySelector('#modalContent .modal-title h2');
  if(title&&title.textContent.startsWith('What’s New'))title.textContent='What’s New · v1.0';
  const notes=document.querySelector('#modalContent .field p');
  if(notes&&!notes.dataset.v1Ux){notes.dataset.v1Ux='1';notes.innerHTML='• Minimize editor controls without leaving the active tool<br>• Draw on the full canvas while Draw controls are hidden<br>• 28 additional Canvas Style presets<br>• 27 Auto Dump shuffle looks<br>• Multi-select Projects with Select All and batch Delete<br>'+notes.innerHTML}
});

// v1.0 experience modules load after the normal deferred app modules so they
// can extend the production editor without changing its initialization order.
function loadExperienceModules(){
  const files=['tool-panel-ux.js','canvas-style-pack.js','auto-dump-looks.js','project-batch.js'];
  for(const file of files){
    const id=`washi-${file.replace(/\W+/g,'-')}`;
    if(document.getElementById(id))continue;
    const script=document.createElement('script');
    script.id=id;script.src=`./js/${file}?v=1.0`;script.async=false;
    document.head.append(script);
  }
}
if(document.readyState==='complete')loadExperienceModules();
else window.addEventListener('load',loadExperienceModules,{once:true});
})();
