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
  if(notes&&!notes.dataset.v1Ux){notes.dataset.v1Ux='1';notes.innerHTML='• Smart Layout now understands blank multi-photo designs, Photo Dump, and Carousel instead of stacking selected photos<br>• Carousel + Photos fills existing template frames first, balances blank carousels across slides, and adds organized overflow slides only when needed<br>• Carousel New Design now opens a real 3-slide carousel directly instead of falling through to Portrait Post<br>• Template Library cleaned into broader parent categories while detailed template types remain searchable<br>• Carousel is a core New Design choice while Photo Dump stays available<br>• Templates stay temporary until you actually edit them<br>• Projects show visual design previews instead of title-only thumbnails<br>• More compact Home creation banner<br>• Saved Palettes now recolor designs, selected layers, canvases, and My Style<br>• Appearance themes, custom accent color, and local custom wallpaper<br>• Phone-ratio wallpaper crop with drag and zoom before saving<br>• Minimize editor controls without leaving the active tool<br>• Draw on the full canvas while Draw controls are hidden<br>• 28 additional Canvas Style presets<br>• 27 Auto Dump shuffle looks<br>• Multi-select Projects with Select All and batch Delete<br>'+notes.innerHTML}
});

// v1.0 experience modules load after the normal deferred app modules so they
// can extend the production editor without changing its initialization order.
function loadExperienceModules(){
  const files=['tool-panel-ux.js','canvas-style-pack.js','auto-dump-looks.js','project-batch.js','template-draft.js','project-previews.js','palette-workflow.js','appearance.js','home-compact.js','template-categories.js','new-design-carousel.js','smart-layout.js'];
  for(const file of files){
    const id=`washi-${file.replace(/\W+/g,'-')}`;
    if(document.getElementById(id))continue;
    const script=document.createElement('script');
    script.id=id;script.src=`./js/${file}?v=1.0&build=20260815-smartlayout2`;script.async=false;
    document.head.append(script);
  }
}
if(document.readyState==='complete')loadExperienceModules();
else window.addEventListener('load',loadExperienceModules,{once:true});
})();
