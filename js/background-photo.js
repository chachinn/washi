(() => {
'use strict';
const W=window.Washi=window.Washi||{};
function boot(){
  const E=W.Editor,DB=W.DB,panel=document.querySelector('#panelContent');
  if(!E||!DB||!panel||panel.dataset.photoBgReady)return;
  panel.dataset.photoBgReady='1';
  let input=document.querySelector('#washiBackgroundInput');
  if(!input){input=document.createElement('input');input.type='file';input.accept='image/*';input.hidden=true;input.id='washiBackgroundInput';document.body.appendChild(input)}
  const project=()=>E.getProject?.();
  const bgLayer=()=>project()?.objects?.find(o=>o.isPhotoBackground)||null;
  const sync=()=>{
    document.querySelector('#wtPhotoBgControls')?.remove();
    const p=project();if(!p)return;
    const heading=panel.querySelector('.panel-title h3')?.textContent?.trim();if(heading&&heading!=='Style')return;
    const box=document.createElement('section');box.id='wtPhotoBgControls';box.className='wt-freedom';
    const bg=bgLayer();
    box.innerHTML=`<div class="wt-freedom-head"><b>Canvas background</b><small>Use a color, pattern, or your own photo</small></div>
      <div class="button-row" style="margin-top:10px"><button data-bg-photo>${bg?'Change photo':'Use photo background'}</button>${bg?'<button data-bg-remove class="danger">Remove photo</button><button data-bg-edit>Edit as layer</button>':''}</div>
      ${bg?`<div class="wt-freedom-grid" style="margin-top:10px">
        <label>Fit<select data-bg-prop="fit"><option value="cover" ${bg.fit!=='contain'?'selected':''}>Fill canvas</option><option value="contain" ${bg.fit==='contain'?'selected':''}>Fit inside</option></select></label>
        <label>Focus X<input type="range" min="0" max="100" step="1" data-bg-prop="focusX" value="${Number(bg.focusX??50)}"></label>
        <label>Focus Y<input type="range" min="0" max="100" step="1" data-bg-prop="focusY" value="${Number(bg.focusY??50)}"></label>
        <label>Opacity<input type="range" min="0" max="1" step=".02" data-bg-prop="opacity" value="${Number(bg.opacity??1)}"></label>
      </div>`:''}`;
    panel.appendChild(box);
  };
  async function usePhoto(file){
    if(!file||!file.type.startsWith('image/'))return;
    let bg=bgLayer();
    if(bg){
      E.select(bg.id);await E.replaceSelectedMedia(file);bg=bgLayer();
    }else{
      const added=await E.addMedia([file]);bg=added?.[0];if(!bg)return;
      bg.isPhotoBackground=true;bg.name='Photo Background';bg.x=0;bg.y=0;bg.w=project().width;bg.h=project().height;bg.rotation=0;bg.radius=0;bg.fit='cover';bg.focusX=50;bg.focusY=50;bg.opacity=1;bg.locked=true;
      const a=project().objects,i=a.findIndex(o=>o.id===bg.id);if(i>0){a.splice(i,1);a.unshift(bg)}
      E.render();E.save();
    }
    bg.isPhotoBackground=true;bg.x=0;bg.y=0;bg.w=project().width;bg.h=project().height;bg.rotation=0;bg.radius=0;bg.locked=true;
    const a=project().objects,i=a.findIndex(o=>o.id===bg.id);if(i>0){a.splice(i,1);a.unshift(bg)}
    E.render();E.save();sync();
  }
  input.addEventListener('change',async()=>{const f=input.files?.[0];input.value='';if(f)await usePhoto(f)});
  panel.addEventListener('click',e=>{
    if(e.target.closest('[data-bg-photo]'))input.click();
    const rm=e.target.closest('[data-bg-remove]');if(rm){const p=project(),bg=bgLayer();if(bg){p.objects=p.objects.filter(o=>o.id!==bg.id);E.render();E.save();sync()}}
    const ed=e.target.closest('[data-bg-edit]');if(ed){const bg=bgLayer();if(bg){bg.locked=false;E.select(bg.id);E.render();E.save();sync()}}
  });
  panel.addEventListener('input',e=>{const el=e.target.closest('[data-bg-prop]');if(!el)return;const bg=bgLayer();if(!bg)return;let v=el.value;if(['focusX','focusY','opacity'].includes(el.dataset.bgProp))v=Number(v);bg[el.dataset.bgProp]=v;E.render()});
  panel.addEventListener('change',e=>{if(e.target.closest('[data-bg-prop]'))E.save()});
  const obs=new MutationObserver(()=>setTimeout(sync,0));obs.observe(panel,{childList:true,subtree:false});
  window.addEventListener('washi:project-saved',()=>setTimeout(sync,0));
  sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();