(() => {
'use strict';
const W=window.Washi=window.Washi||{};
const IS_IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

function installWallpaperLayer(){
 let layer=document.getElementById('washiWallpaperViewport');
 if(!layer){
  layer=document.createElement('div');
  layer.id='washiWallpaperViewport';
  layer.setAttribute('aria-hidden','true');
  document.body.prepend(layer);
 }
 return layer;
}

function stabilizeNav(){
 const nav=document.getElementById('bottomNav');
 if(!nav)return;
 // Keep persistent navigation outside the scrollable app shell so no page
 // transform or content height can turn it into scrolling content.
 if(nav.parentElement!==document.body)document.body.append(nav);
 const vv=window.visualViewport;
 const height=Math.max(1,Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||0));
 const offsetTop=Math.max(0,Math.round(vv?.offsetTop||0));
 // The tab bar now uses a deliberately compact 74–88px range. This prevents
 // transient iOS safe-area values from lifting the controls too high while
 // still leaving a small home-indicator clearance inside the bar.
 const measured=Math.round(nav.getBoundingClientRect().height||74);
 const navHeight=Math.min(88,Math.max(74,measured));
 document.documentElement.style.setProperty('--washi-vv-height',`${height}px`);
 document.documentElement.style.setProperty('--washi-vv-top',`${offsetTop}px`);
 document.documentElement.style.setProperty('--washi-nav-height',`${navHeight}px`);
}

async function ensureServiceWorker(){
 if(!('serviceWorker' in navigator))return;
 try{
  const registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
  registration.update?.().catch(()=>{});
 }catch{}
}

function sync(){
 stabilizeNav();
 installWallpaperLayer();
 document.documentElement.style.setProperty('--washi-stable-vh',`${Math.round(window.visualViewport?.height||window.innerHeight||0)}px`);
}

let raf=0;
function schedule(){
 if(raf)return;
 raf=requestAnimationFrame(()=>{raf=0;sync()});
}

const css=document.createElement('style');
css.textContent=`
#washiWallpaperViewport{position:fixed;inset:0;z-index:0;pointer-events:none;background:none center/cover no-repeat}
body.washi-wallpaper-enabled{background:none!important;background-image:none!important;background-attachment:scroll!important}
body.washi-wallpaper-enabled::before{content:none!important;display:none!important;background:none!important}
body.washi-wallpaper-enabled #washiWallpaperViewport{background-image:linear-gradient(rgba(255,250,253,var(--washi-wallpaper-overlay,.48)),rgba(255,247,250,var(--washi-wallpaper-overlay,.48))),var(--washi-wallpaper-url)}
#app{position:relative;z-index:1}

/* Persistent tabs: fill the phone width with no left/right gutters. Keep only
   a small capped safe-area allowance so the row sits lower and the bar does
   not turn into a tall white block on iPhone. */
.app-shell{padding-bottom:102px!important}
.bottom-nav{position:fixed!important;z-index:60!important;left:50%!important;right:auto!important;transform:translate3d(-50%,0,0)!important;backface-visibility:hidden;will-change:transform;box-sizing:border-box!important;width:min(100vw,780px)!important;max-width:780px!important;margin:0!important;height:calc(74px + min(var(--safe-bottom),14px))!important;min-height:74px!important;max-height:88px!important;padding:5px 10px calc(5px + min(var(--safe-bottom),14px))!important;border-radius:24px 24px 0 0!important;border-left:0!important;border-right:0!important;border-bottom:0!important;pointer-events:auto!important}
html.washi-ios-nav-track .bottom-nav{top:calc(var(--washi-vv-top,0px) + var(--washi-vv-height,100dvh) - var(--washi-nav-height,74px))!important;bottom:auto!important}
html:not(.washi-ios-nav-track) .bottom-nav{top:auto!important;bottom:0!important}

/* Editor stack: reserve the compact nav height instead of letting editor
   controls live behind the tabs. */
.editor-view.active .editor-toolbar{bottom:var(--washi-nav-height,74px)!important;height:76px!important;padding:7px 10px!important}
.editor-view.active .editor-panel{bottom:calc(var(--washi-nav-height,74px) + 76px)!important;padding-bottom:24px!important;scroll-padding-bottom:30px!important}
.editor-view.active .selection-bar{bottom:calc(var(--washi-nav-height,74px) + 84px)!important}
.editor-view.active .editor-workspace{bottom:calc(var(--washi-nav-height,74px) + 76px)!important}
`;

function boot(){
 document.documentElement.classList.toggle('washi-ios-nav-track',IS_IOS);
 document.head.append(css);
 sync();
 ensureServiceWorker();
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('orientationchange',schedule,{passive:true});
 window.visualViewport?.addEventListener('resize',schedule,{passive:true});
 window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
 document.addEventListener('visibilitychange',()=>!document.hidden&&schedule());
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();

W.MobileStability={sync,ensureServiceWorker,version:'v1.0-bottom-tabs-flush-lower'};
})();
