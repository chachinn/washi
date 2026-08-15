(() => {
'use strict';
const W=window.Washi=window.Washi||{};

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
 // Keep persistent navigation outside the scrollable app shell so iOS viewport
 // and wallpaper compositing changes cannot make it behave like page content.
 if(nav.parentElement!==document.body)document.body.append(nav);
}

async function ensureServiceWorker(){
 if(!('serviceWorker' in navigator))return;
 try{
  // app.js historically registers after async font loading. Registering here as
  // well removes the race where window.load can fire before that listener exists.
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
.bottom-nav{position:fixed!important;z-index:40!important;left:50%!important;right:auto!important;top:auto!important;bottom:max(10px,var(--safe-bottom))!important;transform:translate3d(-50%,0,0)!important;backface-visibility:hidden}
`;

function boot(){
 document.head.append(css);
 sync();
 ensureServiceWorker();
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('orientationchange',schedule,{passive:true});
 window.visualViewport?.addEventListener('resize',schedule,{passive:true});
 window.visualViewport?.addEventListener('scroll',schedule,{passive:true});
 document.addEventListener('visibilitychange',()=>!document.hidden&&schedule());
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();

W.MobileStability={sync,ensureServiceWorker,version:'v1.0-integrity-audit'};
})();
