(() => {
'use strict';
const W=window.Washi=window.Washi||{};
W.VERSION='v1.0';
W.RELEASE_STAGE='pre-release';
W.RUNTIME_BUILD='20260816-photo-swap-navfix1';
document.documentElement.dataset.washiVersion='v1.0';

// Critical Home sizing is installed immediately so the first visible layout is
// already the final compact layout. home-compact.js is intentionally a marker
// only now, preventing a second late CSS pass and visible startup reflow.
if(!document.getElementById('washiHomeFirstPaint')){
  const homeFirstPaint=document.createElement('style');
  homeFirstPaint.id='washiHomeFirstPaint';
  homeFirstPaint.textContent=`
.hero-card{padding:14px 16px 13px;border-radius:20px}.hero-card:after{right:12px;top:4px;font-size:2.15rem}.hero-card h1{margin:0 0 5px;font-size:clamp(1.5rem,5.8vw,2.05rem);line-height:1}.hero-card p{margin:0 0 9px;max-width:31rem;font-size:.8rem;line-height:1.3}.soft-pill{margin-bottom:6px;padding:4px 8px;font-size:.62rem}.hero-actions{gap:6px}.hero-actions .primary-button,.hero-actions .secondary-button{min-height:36px;padding-inline:11px;font-size:.76rem;border-radius:13px}
.name-story-card{grid-template-columns:46px 1fr;gap:11px;margin-top:11px;padding:13px 14px;border-radius:19px}.name-story-mark{width:46px;height:46px;border-radius:14px;font-size:1.08rem}.name-story-card .section-kicker{font-size:.6rem}.name-story-card p{margin:2px 0 0;font-size:.79rem;line-height:1.34}.home-section{margin-top:20px}.nav-create{border-color:var(--pink-50)!important}
@media(max-width:430px){.hero-card{padding:11px 12px 10px;border-radius:18px}.hero-card:after{right:9px;top:1px;font-size:1.7rem}.soft-pill{display:none}.hero-card h1{font-size:1.38rem;line-height:1.02;margin-bottom:5px;letter-spacing:-.035em}.hero-card h1 br{display:none}.hero-card h1 em:before{content:' '}.hero-card p{font-size:.71rem;line-height:1.23;margin-bottom:7px;max-width:94%}.hero-actions{gap:5px}.hero-actions .primary-button,.hero-actions .secondary-button{min-height:33px;padding-inline:9px;font-size:.69rem;border-radius:11px}.name-story-card{grid-template-columns:38px 1fr;gap:8px;margin-top:8px;padding:10px 11px;border-radius:16px}.name-story-mark{width:38px;height:38px;border-radius:12px;font-size:.92rem}.name-story-card .section-kicker{font-size:.54rem}.name-story-card p{margin-top:1px;font-size:.68rem;line-height:1.27}.home-section{margin-top:15px}}
`;
  document.head.append(homeFirstPaint);
}

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
    notes.innerHTML='• Selected photos can now be swapped between frames while keeping each frame position, size, rotation, radius, and template structure fixed; crop/zoom/filter state travels with the photo<br>• Fixed an iPhone safe-area regression that could expand the persistent bottom tabs into a giant white block; the safe-area contribution and editor offsets are now capped defensively<br>• Photo Dump / Auto Dump photos now expose Edit Photo directly; entering photo edit hides the Studio dock so you can drag the image inside its existing frame, pinch/zoom, reset, and finish without changing the outer frame<br>• Non-Carousel templates now offer Fill / Adapt Template or Add Freely when adding photos; existing template frames are replaced first and overflow photos reflow only the template photo area while preserving text, decor, and background<br>• Carousel + Photos now lets you choose Fill Template / Auto Arrange or Add Freely; template mode fills existing slots in order and repeats the same template section for overflow photos while free mode adds ordinary movable layers<br>• Added dedicated Carousel canvas zoom controls (− / percentage / + / Fit) and made Wide Window Flow use independent replaceable photo frames per slide<br>• Fixed template sample-photo editing so filled template photos behave as standard editable image/video layers for Replace, Edit Photo, crop, focus, filters, move, resize, and save/reopen flows<br>• Template library QA removed 30 genuinely redundant Freedom variants across five repeated composition families and added 48 new photo-forward Curated Studio templates across 24 distinct composition families, bringing the active library to 1,500 templates<br>• New curated designs include asymmetric grids, editorial splits, film/contact layouts, scrapbook layers, travel/food/fashion pages, and 16 new seamless Carousel templates<br>• Template cards now look like finished sample designs, and their sample photos stay inside the template when you open it so you can replace, crop, move, or delete them<br>• Sample template photos use a small reusable local asset pool instead of downloading duplicate copies every time you browse or open a design<br>• Carousel + Slide now opens visual layout choices instead of forcing a blank page<br>• Carousel now has Preview as Video with the same continuous seamless pan used by export; no audio is added<br>• iPhone bottom navigation stays fixed outside document flow and follows the live visual viewport<br>• Carousel video export moves as one uninterrupted seamless pan across the full design strip<br>• Home opens directly in its compact layout instead of visibly resizing after startup<br>• Full 1,500-template production library is browsable through 11 parent categories with incremental loading for iPhone performance<br>• Parent browsing categories no longer overwrite each template’s original type, so Photo Dump and Carousel recommendations keep their intended behavior<br>• Detailed types such as Wedding, Cafe, Film, Journal, Birthday, Instant, Seasonal, Seamless Carousel, and more remain searchable<br>• Smart Layout understands blank multi-photo designs, Photo Dump, and Carousel instead of stacking selected photos<br>• Carousel New Design opens a real 3-slide carousel directly instead of falling through to Portrait Post<br>• Carousel templates have a dedicated Carousels category near the front of the category row<br>• Carousel is a core New Design choice while Photo Dump stays available<br>• Templates stay temporary until you actually edit them<br>• Projects show visual design previews instead of title-only thumbnails<br>• More compact Home creation banner<br>• Saved Palettes recolor designs, selected layers, canvases, and My Style<br>• Appearance themes, custom accent color, and local custom wallpaper<br>• Phone-ratio wallpaper crop with drag and zoom before saving<br>• iPhone wallpaper uses one dedicated fixed viewport layer instead of competing fixed backgrounds<br>• Minimize editor controls without leaving the active tool<br>• Draw on the full canvas while Draw controls are hidden<br>• 28 additional Canvas Style presets<br>• 27 Auto Dump shuffle looks<br>• Multi-select Projects with Select All and batch Delete<br>'+notes.innerHTML;
  }
});

const EXPERIENCE_FILES=['tool-panel-ux.js','canvas-style-pack.js','auto-dump-looks.js','auto-dump-photo-edit.js','photo-swap.js','project-batch.js','template-draft.js','project-previews.js','palette-workflow.js','appearance.js','home-compact.js','template-curated-pack.js','carousel-editing-ux.js','template-library-dedupe.js','template-categories.js','template-preview-samples.js','template-media-edit-fix.js','new-design-carousel.js','smart-layout.js','carousel-template-photo-repeat.js','template-photo-fit.js','carousel-studio.js','carousel-export-ios.js','mobile-stability.js'];

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

// release-version.js is a deferred script. During normal startup we wait only
// for DOMContentLoaded (which fires after every defer script has executed), not
// window.load (which can be delayed by images and caused visible UI reflow).
if(document.readyState==='complete')loadExperienceModules();
else document.addEventListener('DOMContentLoaded',loadExperienceModules,{once:true});
})();
