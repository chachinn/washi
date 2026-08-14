(() => {
'use strict';
const W=window.Washi=window.Washi||{};
function install(){
 const E=W.Editor,panel=document.querySelector('#panelContent');
 if(!E||!panel||panel.dataset.freedomReady)return;
 panel.dataset.freedomReady='1';let busy=false;
 const hex=v=>/^#[0-9a-f]{6}$/i.test(String(v||''))?v:'#ffffff';
 function controls(){
  if(busy)return;busy=true;
  try{
   document.querySelector('#wtFreedomControls')?.remove();
   const o=E.selected?.();if(!o)return;
   const box=document.createElement('section');box.id='wtFreedomControls';box.className='wt-freedom';
   let html='<div class="wt-freedom-head"><b>Selected layer</b><small>Customize this piece</small></div><div class="wt-freedom-grid">';
   if(o.type==='shape')html+=`<label>Fill<input type="color" data-wt-prop="fill" value="${hex(o.fill)}"></label><label>Border<input type="color" data-wt-prop="border" value="${hex(o.border||'#ffffff')}"></label><label>Border width<input type="number" min="0" max="40" data-wt-num data-wt-prop="borderWidth" value="${Number(o.borderWidth||0)}"></label><label>Corner radius<input type="number" min="0" max="500" data-wt-num data-wt-prop="radius" value="${Number(o.radius||0)}"></label>`;
   if(o.type==='sticker')html+=`<label>Color<input type="color" data-wt-prop="color" value="${hex(o.color||'#c84f77')}"></label>`;
   if(['placeholder','image','video'].includes(o.type))html+=`<label>Corner radius<input type="number" min="0" max="500" data-wt-num data-wt-prop="radius" value="${Number(o.radius||0)}"></label>`;
   if(o.type==='text')html+=`<label>Text color<input type="color" data-wt-prop="color" value="${hex(o.color||'#222222')}"></label>`;
   html+=`<label>Rotation<input type="number" min="-360" max="360" data-wt-num data-wt-prop="rotation" value="${Math.round(Number(o.rotation||0))}"></label><label>Opacity<input type="range" min="0" max="1" step=".02" data-wt-num data-wt-prop="opacity" value="${Number(o.opacity??1)}"></label></div>`;
   box.innerHTML=html;panel.appendChild(box);
  } finally {busy=false}
 }
 const observer=new MutationObserver(()=>setTimeout(controls,0));observer.observe(panel,{childList:true,subtree:false});
 window.addEventListener('washi:selection-changed',()=>setTimeout(controls,0));
 panel.addEventListener('input',e=>{const el=e.target.closest('[data-wt-prop]');if(!el)return;let v=el.value;if(el.hasAttribute('data-wt-num'))v=Number(v);E.updateSelected?.({[el.dataset.wtProp]:v},{history:false,rerender:true,persist:false})});
 panel.addEventListener('change',e=>{if(e.target.closest('[data-wt-prop]'))E.save?.()});controls();
}
if(typeof document!=='undefined'){const boot=()=>setTimeout(install,0);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()}
})();
