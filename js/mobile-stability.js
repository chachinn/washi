(() => {
'use strict';
const W=window.Washi=window.Washi||{};
function installWallpaperLayer(){
 let layer=document.getElementById('washiWallpaperViewport');
 if(!layer){layer=document.createElement('div');layer.id='washiWallpaperViewport';layer.setAttribute('aria-hidden','true');document.body.prepend(layer)}
}
function stabilizeNav(){
 const nav=document.getElementById('bottomNav');
 if(!nav)return;
 // Keep the persistent app navigation outside the scrollable app shell so
 // iOS compositing/viewport changes cannot make it behave like page content.
 if(nav.parentElement!==document.body)document.body.append(nav);
}
function sync(){
 stabilizeNav();installWallpaperLayer();
 document.documentElement.style.setProperty('--washi-stable-vh',`${Math.round(window.visualViewport?.height||window.innerHeight||0)}px`);
}
let raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;sync()})}
const css=document.createElement('style');css.textContent=`
#washiWallpaperViewport{position:fixed;inset:0;z-index:0;pointer-events:none;background:none center/cover no-repeat}
body.washi-wallpaper-enabled{background-image:none!important;background-attachment:scroll!important}
body.washi-wallpaper-enabled #washiWallpaperViewport{background-image:linear-gradient(rgba(255,250,253,var(--washi-wallpaper-overlay,.48)),rgba(255,247,250,var(--washi-wallpaper-overlay,.48))),var(--washi-wallpaper-url)}
#app{position:relative;z-index:1}
.bottom-nav{position:fixed!important;left:50%!important;right:auto!important;top:auto!important;bottom:max(10px,var(--safe-bottom))!important;transform:translateX(-50%)!important;will-change:transform}
`;
function boot(){document.head.append(css);sync();window.addEventListener('resize',schedule,{passive:true});window.addEventListener('orientationchange',schedule,{passive:true});window.visualViewport?.addEventListener('resize',schedule,{passive:true});window.visualViewport?.addEventListener('scroll',schedule,{passive:true});document.addEventListener('visibilitychange',()=>!document.hidden&&schedule())}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
W.MobileStability={sync,version:'v1.0-iphone-fixed-nav'};
})();
