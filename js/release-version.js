(() => {
'use strict';
const W=window.Washi=window.Washi||{};
W.VERSION='v1.0';
W.RELEASE_STAGE='pre-release';
W.RUNTIME_BUILD='20260816-cumulative-history-recovery2';
document.documentElement.dataset.washiVersion='v1.0';

const versionNode=document.querySelector('.drawer-version');
if(versionNode)versionNode.textContent='Washi v1.0 · Creative Studio';

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target?.closest('[data-action="whats-new"]'))return;
  const title=document.querySelector('#modalContent .modal-title h2');
  if(title&&title.textContent.startsWith('What’s New'))title.textContent='What’s New · v1.0';
  const notes=document.querySelector('#modalContent .field p');
  if(notes&&!notes.dataset.v1Ux){
    notes.dataset.v1Ux='1';
    const total=W.Templates?.TEMPLATES?.length||0;
    const countText=total?`${total.toLocaleString()} cumulative production templates`:'the full cumulative production template library';
    notes.innerHTML=`• ${countText}, including restored composition-first and art-directed Washi layouts from the pre-regression Git history<br>• Visual Discover category cards, format filters, search, parent categories, and incremental loading keep the larger library usable on iPhone<br>• Parent browsing categories preserve each template’s original semantic type, so Photo Dump, Carousel, and format recommendations keep their intended behavior<br>• Detailed template types remain searchable while 11 broader parent categories keep browsing organized<br>• Smart Layout understands blank multi-photo designs, Photo Dump, and Carousel instead of stacking selected photos<br>• Carousel + Photos fills existing template frames first, balances blank carousels across slides, and adds organized overflow slides only when needed<br>• Carousel New Design opens a real 3-slide carousel directly instead of falling through to Portrait Post<br>• Carousel is a core New Design choice while Photo Dump stays available<br>• Templates stay temporary until you actually edit them<br>• Projects show visual design previews instead of title-only thumbnails<br>• Compact Home creation experience<br>• Saved Palettes recolor designs, selected layers, canvases, and My Style<br>• Appearance themes, custom accent color, and local custom wallpaper with phone-ratio crop, drag, and zoom<br>• iPhone wallpaper uses one dedicated fixed viewport layer instead of competing fixed backgrounds<br>• Minimize editor controls without leaving the active tool and draw on the full canvas while controls are hidden<br>• 28 additional Canvas Style presets and 27 Auto Dump shuffle looks<br>• Multi-select Projects with Select All and batch Delete<br>`+notes.innerHTML;
  }
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
