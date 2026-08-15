(() => {
'use strict';
const W=window.Washi=window.Washi||{};
W.VERSION='v1.0';
W.RELEASE_STAGE='pre-release';
W.RUNTIME_BUILD='20260816-template-library-recovery1';
document.documentElement.dataset.washiVersion='v1.0';

const versionNode=document.querySelector('.drawer-version');
if(versionNode)versionNode.textContent='Washi v1.0 · Creative Studio';

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target?.closest('[data-action="whats-new"]'))return;
  const title=document.querySelector('#modalContent .modal-title h2');
  if(title&&title.textContent.startsWith('What’s New'))title.textContent='What’s New · v1.0';
  const notes=document.querySelector('#modalContent .field p');
  if(notes&&!notes.dataset.v1Ux){notes.dataset.v1Ux='1';notes.innerHTML='• Full 1,242-template library is browsable again with 11 parent categories and incremental loading for iPhone performance<br>• Detailed template types such as Wedding, Cafe, Film, Journal, Birthday, Seamless Carousel, and more remain searchable<br>• Smart Layout understands blank multi-photo designs, Photo Dump, and Carousel instead of stacking selected photos<br>• Carousel + Photos fills existing template frames first, balances blank carousels across slides, and adds organized overflow slides only when needed<br>• Carousel New Design opens a real 3-slide carousel directly instead of falling through to Portrait Post<br>• Carousel templates have a dedicated Carousels category near the front of the category row<br>• Carousel is a core New Design choice while Photo Dump stays available<br>• Templates stay temporary until you actually edit them<br>• Projects show visual design previews instead of title-only thumbnails<br>• More compact Home creation banner<br>• Saved Palettes recolor designs, selected layers, canvases, and My Style<br>• Appearance themes, custom accent color, and local custom wallpaper<br>• Phone-ratio wallpaper crop with drag and zoom before saving<br>• Minimize editor controls without leaving the active tool<br>• Draw on the full canvas while Draw controls are hidden<br>• 28 additional Canvas Style presets<br>• 27 Auto Dump shuffle looks<br>• Multi-select Projects with Select All and batch Delete<br>'+notes.innerHTML}
});

const EXPERIENCE_FILES=['tool-panel-ux.js','canvas-style-pack.js','auto-dump-looks.js','project-batch.js','template-draft.js','project-previews.js','palette-workflow.js','appearance.js','home-compact.js','template-categories.js','new-design-carousel.js','smart-layout.js','carousel-export-ios.js','mobile-stability.js'];

function showRuntimeFailure(file){
  console.error(`[Washi] Failed to load experience module: ${file}`);
  let n=document.getElementById('washiRuntimeWarning');
  if(!n){
    n=document.createElement('div');
    n.id='washiRuntimeWarning';
    n.setAttribute('role','status');
    n.style.cssText='position:fixed;left:12px;right:12px;top:max(12px,env(safe-area-inset-top));z-index:9999;padding:12px 14px;border-radius:14px;background:#fff4f7;color:#7a2943;border:1px solid #efb6c8;box-shadow:0 12px 30px rgba(70,30,45,.18);font:700 13px/1.35 system-ui;text-align:center';
    n.textContent='Washi could not load one of its latest modules. Please close and reopen the app while online.';
    document.body.append(n);
  }
}

function loadScript(file){
  const id=`washi-${file.replace(/\W+/g,'-')}`;
  if(document.getElementById(id))return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.id=id;
    script.src=`./js/${file}?v=1.0&build=${W.RUNTIME_BUILD}`;
    script.async=false;
    script.onload=resolve;
    script.onerror=()=>reject(new Error(file));
    document.head.append(script);
  });
}

async function loadExperienceModules(){
  const failed=[];
  for(const file of EXPERIENCE_FILES){
    try{await loadScript(file)}catch{failed.push(file);showRuntimeFailure(file)}
  }
  W.RUNTIME_MODULES={build:W.RUNTIME_BUILD,files:[...EXPERIENCE_FILES],failed};
  window.dispatchEvent(new CustomEvent('washi:experience-ready',{detail:{build:W.RUNTIME_BUILD,failed:[...failed]}}));
}

if(document.readyState==='complete')loadExperienceModules();
else window.addEventListener('load',loadExperienceModules,{once:true});
})();
