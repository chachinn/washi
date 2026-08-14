(() => {
'use strict';
const css=document.createElement('style');css.textContent=`
.hero-card{padding:17px 18px 16px;border-radius:24px}.hero-card:after{right:14px;top:5px;font-size:2.75rem}.hero-card h1{margin-bottom:6px;font-size:clamp(1.72rem,6.6vw,2.35rem);line-height:.98}.hero-card p{margin-bottom:12px;max-width:31rem;font-size:.88rem;line-height:1.34}.soft-pill{margin-bottom:8px;padding:5px 9px;font-size:.68rem}.hero-actions{gap:7px}.hero-actions .primary-button,.hero-actions .secondary-button{min-height:40px;padding-inline:12px;font-size:.82rem;border-radius:14px}
@media(max-width:430px){.hero-card{padding:15px 15px 14px;border-radius:22px}.hero-card h1{font-size:clamp(1.62rem,7.3vw,2.02rem)}.hero-card p{font-size:.82rem;line-height:1.31;margin-bottom:10px}.soft-pill{font-size:.64rem}.hero-actions .primary-button,.hero-actions .secondary-button{min-height:38px;font-size:.78rem}.hero-card:after{font-size:2.35rem}}
body.washi-wallpaper-enabled{background:none!important;background-image:none!important}.app-shell{position:relative;z-index:1}.nav-create{border-color:var(--pink-50)!important}body.washi-wallpaper-enabled:before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,250,253,var(--washi-wallpaper-overlay,.48)),rgba(255,247,250,var(--washi-wallpaper-overlay,.48))),var(--washi-wallpaper-url);background-size:cover;background-position:center;background-repeat:no-repeat}
`;document.head.append(css);window.Washi=window.Washi||{};window.Washi.HomeCompact={version:'v1.0'};
})();
