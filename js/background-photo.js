(() => {
'use strict';
const W=window.Washi||{}, E=W.Editor, DB=W.DB, T=W.Templates;
if(!E||!DB||!T) return;
const $=(s,r=document)=>r.querySelector(s);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const clone=v=>typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v));
const stage=$('#designStage'), objects=$('#objectsLayer'), guides=$('#alignmentGuides'), mediaInput=$('#mediaInput');
let intent='add', active=null, raf=0;

window.addEventListener('washi:project-saved',e=>{
  if($('#editorView')?.classList.contains('active')) e.stopImmediatePropagation();
});

const NativeMutationObserver=window.MutationObserver;
window.MutationObserver=class WashiMutationObserver{
  constructor(cb){this.target=null;this.cb=cb;this.inner=new NativeMutationObserver((records)=>{
    if(this.target?.id==='panelContent'){
      const generated=new Set(['wtFreedomControls','wtColorStudio','wtPhotoBgControls']);
      const meaningful=records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType!==1||!generated.has(n.id)));
      if(!meaningful)return;
    }
    cb(records,this);
  })}
  observe(target,options){this.target=target;return this.inner.observe(target,options)}
  disconnect(){return this.inner.disconnect()}
  takeRecords(){return this.inner.takeRecords()}
};

function toast(msg){
  const t=$('#toast'); if(!t)return; t.textContent=msg; t.classList.add('show');
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove('show'),1800);
}
function project(){return E.getProject?.()||E.state?.project}
function objById(id){return project()?.objects?.find(o=>o.id===id)||null}
function point(x,y){const r=stage.getBoundingClientRect(),z=E.state.zoom||1;return{x:(x-r.left)/z,y:(y-r.top)/z}}
function styleNode(n,o){if(!n||!o)return;n.style.left=`${o.x}px`;n.style.top=`${o.y}px`;n.style.width=`${o.w}px`;n.style.height=`${o.h}px`;n.style.transform=`rotate(${o.rotation||0}deg)`;n.style.opacity=o.opacity??1}
function selectionUI(id){
  const prev=E.state.selectedId;if(prev===id)return;
  E.state.selectedId=id;
  objects.querySelector('.layer-object.selected')?.classList.remove('selected');
  const n=objects.querySelector(`[data-object-id="${CSS.escape(id)}"]`);n?.classList.add('selected');
  const bar=$('#selectionBar'),o=objById(id);if(bar){bar.hidden=!o;if(o){const l=bar.querySelector('[data-object-action="lock"]');if(l)l.textContent=o.locked?'Unlock':'Lock';const f=bar.querySelector('[data-object-action="fill"]');if(f){f.hidden=!['placeholder','image','video'].includes(o.type);f.textContent=o.type==='placeholder'?'Fill':'Replace'}}}
  window.dispatchEvent(new CustomEvent('washi:selection-changed',{detail:{id}}));
}
function keep(o,s){if(!s.keepInside)return;o.x=clamp(o.x,0,Math.max(0,project().width-o.w));o.y=clamp(o.y,0,Math.max(0,project().height-o.h))}
function snap(o,s){guides.className='alignment-guides';if(!s.snap)return;const z=E.state.zoom||1,t=14/z,p=project(),cx=o.x+o.w/2,cy=o.y+o.h/2;if(Math.abs(cx-p.width/2)<t){o.x=p.width/2-o.w/2;guides.classList.add('v')}if(Math.abs(cy-p.height/2)<t){o.y=p.height/2-o.h/2;guides.classList.add('h')}}
function setPointer(ev){active.pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY})}
function scheduleApply(){if(!raf)raf=requestAnimationFrame(apply)}
function apply(){
  raf=0;if(!active)return;const o=objById(active.id),pts=[...active.pointers.values()];if(!o||!pts.length)return;
  if(pts.length>=2&&!['resize','rotate'].includes(active.mode)){
    const a=point(pts[0].x,pts[0].y),b=point(pts[1].x,pts[1].y);
    if(active.mode!=='pinch'){active.mode='pinch';active.pinchDist=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y));active.pinchAngle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;active.base=clone(o)}
    const scale=clamp(Math.hypot(b.x-a.x,b.y-a.y)/active.pinchDist,.2,5),ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI,cx=active.base.x+active.base.w/2,cy=active.base.y+active.base.h/2;
    o.w=Math.max(40,active.base.w*scale);o.h=Math.max(40,active.base.h*scale);o.x=cx-o.w/2;o.y=cy-o.h/2;o.rotation=(active.base.rotation||0)+(ang-active.pinchAngle);keep(o,active.settings);active.moved=true;styleNode(objects.querySelector(`[data-object-id="${CSS.escape(o.id)}"]`),o);return;
  }
  const p=point(pts[0].x,pts[0].y),b=active.base;
  if(active.mode==='drag'){o.x=b.x+p.x-active.startX;o.y=b.y+p.y-active.startY;snap(o,active.settings);keep(o,active.settings)}
  else if(active.mode==='resize'){o.w=Math.max(40,b.w+p.x-active.startX);o.h=Math.max(40,b.h+p.y-active.startY);keep(o,active.settings)}
  else if(active.mode==='rotate'){o.rotation=(b.rotation||0)+(Math.atan2(p.y-(b.y+b.h/2),p.x-(b.x+b.w/2))*180/Math.PI-active.startAngle)}
  if(Math.hypot(p.x-active.startX,p.y-active.startY)>2)active.moved=true;
  styleNode(objects.querySelector(`[data-object-id="${CSS.escape(o.id)}"]`),o);
}

objects.addEventListener('pointerdown',e=>{
  const n=e.target.closest('.layer-object');if(!n)return;const o=objById(n.dataset.objectId);if(!o)return;
  e.stopImmediatePropagation();selectionUI(o.id);if(o.locked)return;
  e.preventDefault();n.setPointerCapture?.(e.pointerId);const p=point(e.clientX,e.clientY),mode=e.target.closest('[data-handle]')?.dataset.handle||'drag';
  if(!active||active.id!==o.id){active={id:o.id,mode,startX:p.x,startY:p.y,base:clone(o),pointers:new Map(),moved:false,slotTap:!!e.target.closest('.placeholder-object'),settings:DB.getSettings()};if(mode==='rotate')active.startAngle=Math.atan2(p.y-(o.y+o.h/2),p.x-(o.x+o.w/2))*180/Math.PI}
  setPointer(e);stage.classList.add('interacting');
},true);
stage.addEventListener('pointermove',e=>{if(!active?.pointers.has(e.pointerId))return;e.stopImmediatePropagation();e.preventDefault();setPointer(e);scheduleApply()},true);
function endPointer(e){
  if(!active?.pointers.has(e.pointerId))return;e.stopImmediatePropagation();e.preventDefault();active.pointers.delete(e.pointerId);
  if(active.pointers.size)return;
  if(raf){cancelAnimationFrame(raf);raf=0;apply()}
  const changed=active.moved,tapSlot=active.slotTap&&!active.moved&&objById(active.id)?.type==='placeholder';active=null;stage.classList.remove('interacting');guides.className='alignment-guides';
  if(changed)E.save?.();
  if(tapSlot){intent='slot';mediaInput?.click()}
}
stage.addEventListener('pointerup',endPointer,true);stage.addEventListener('pointercancel',endPointer,true);

const drawing=$('#drawingLayer');
const pathData=a=>{if(!a?.length)return'';let d=`M ${a[0][0]} ${a[0][1]}`;for(let i=1;i<a.length;i++){const p=a[i-1],q=a[i];d+=` Q ${p[0]} ${p[1]} ${(p[0]+q[0])/2} ${(p[1]+q[1])/2}`}return d};
let drawPointer=null,drawPath=null;
drawing?.addEventListener('pointerdown',e=>{if(!E.state.draw.enabled)return;e.stopImmediatePropagation();e.preventDefault();if(E.state.draw.brush==='eraser'){const hit=e.target.closest?.('[data-stroke-id]');if(hit){project().drawings=project().drawings.filter(s=>s.id!==hit.dataset.strokeId);hit.remove();E.save?.()}return}const q=point(e.clientX,e.clientY),s={id:DB.uid('stroke'),brush:E.state.draw.brush,color:E.state.draw.color,width:E.state.draw.width,opacity:E.state.draw.brush==='highlighter'?.3:E.state.draw.opacity,points:[[q.x,q.y]]};project().drawings.push(s);E.state.draw.active=s;drawPointer=e.pointerId;drawing.setPointerCapture?.(e.pointerId);drawPath=document.createElementNS('http://www.w3.org/2000/svg','path');drawPath.classList.add('drawing-stroke');drawPath.dataset.strokeId=s.id;drawPath.setAttribute('stroke',s.color);drawPath.setAttribute('stroke-width',s.width);drawPath.setAttribute('opacity',s.opacity);drawPath.setAttribute('d',pathData(s.points));drawing.append(drawPath)},true);
drawing?.addEventListener('pointermove',e=>{if(e.pointerId!==drawPointer||!E.state.draw.active)return;e.stopImmediatePropagation();e.preventDefault();const q=point(e.clientX,e.clientY),a=E.state.draw.active.points,l=a.at(-1);if(Math.hypot(q.x-l[0],q.y-l[1])>2){a.push([q.x,q.y]);drawPath?.setAttribute('d',pathData(a))}},true);
function drawEnd(e){if(e.pointerId!==drawPointer)return;e.stopImmediatePropagation();e.preventDefault();drawPointer=null;drawPath=null;E.state.draw.active=null;E.save?.()}
drawing?.addEventListener('pointerup',drawEnd,true);drawing?.addEventListener('pointercancel',drawEnd,true);

const panel=$('#panelContent');
function photoBackground(){return project()?.objects?.find(o=>o.isPhotoBackground)||null}
panel?.addEventListener('input',e=>{
  const el=e.target.closest('[data-bg-prop]');if(!el)return;e.stopImmediatePropagation();const bg=photoBackground();if(!bg)return;let v=el.value;if(['focusX','focusY','opacity'].includes(el.dataset.bgProp))v=Number(v);bg[el.dataset.bgProp]=v;const n=objects.querySelector(`[data-object-id="${CSS.escape(bg.id)}"]`),m=n?.querySelector('img,video');if(n&&el.dataset.bgProp==='opacity')n.style.opacity=v;if(m){m.style.objectFit=bg.fit||'cover';m.style.objectPosition=`${bg.focusX??50}% ${bg.focusY??50}%`;}
},true);
panel?.addEventListener('change',e=>{if(e.target.closest('[data-bg-prop]')){e.stopImmediatePropagation();E.save?.()}},true);

document.addEventListener('click',e=>{
  if(e.target.closest('[data-paction="replace-media"],[data-object-action="fill"]'))intent='replace';
  else if(e.target.closest('[data-paction="add-photo"]'))intent=E.selected?.()?.type==='placeholder'?'slot':'add';
},true);

mediaInput?.addEventListener('change',async e=>{
  e.stopImmediatePropagation();const files=[...e.target.files];if(!files.length)return;
  try{
    const selected=E.selected?.();
    if(intent==='replace'&&selected&&selected.type!=='placeholder')await E.replaceSelectedMedia(files[0]);
    else if(selected?.type==='placeholder')await E.addMedia(files,{replaceSelected:true});
    else await E.addMedia(files,{replaceSelected:false});
    window.dispatchEvent(new CustomEvent('washi:selection-changed',{detail:{id:E.state.selectedId}}));
    toast(selected?.type==='placeholder'||intent==='slot'?'Photo added to frame':intent==='replace'?'Media replaced':'Media added');
  }catch(err){toast(err?.name==='QuotaExceededError'?'Not enough local storage':'Could not add media')}
  finally{intent='add';e.target.value=''}
},true);

function recentScore(t){
  if(t.addedAt)return new Date(t.addedAt).getTime()||0;
  if(String(t.id).startsWith('ref-')||t.source==='reference-pack')return 4;
  if(String(t.id).startsWith('fun-'))return 3;
  if(String(t.id).startsWith('v3-'))return 2;
  return 1;
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function mini(t){
  const p=t.objects||[],d=T.FORMATS[t.format]||T.FORMATS.story,sw=100/d.w,sh=140/d.h;
  const pieces=p.slice(0,7).map(o=>{const left=o.x*sw,top=o.y*sh,w=Math.max(5,(o.w||50)*sw),h=Math.max(5,(o.h||50)*sh),rot=o.rotation||0;if(['placeholder','image','video'].includes(o.type))return `<i style="left:${left}%;top:${top}px;width:${w}%;height:${h}px;transform:rotate(${rot}deg);background:${o.type==='placeholder'?'rgba(255,255,255,.68)':'rgba(100,100,100,.25)'}"></i>`;if(o.type==='shape')return `<i style="left:${left}%;top:${top}px;width:${w}%;height:${h}px;transform:rotate(${rot}deg);background:${esc(o.fill||'#ddd')}"></i>`;return ''}).join('');
  const bg=t.bg?.type==='solid'?t.bg.value:'#f5f1ee';return `<div class="ws-new-mini" style="background:${esc(bg)}">${pieces}</div>`;
}
function installNewSection(){
  const view=$('#templatesView'),chips=$('#templateChips');if(!view||!chips)return;
  let box=$('#wsNewTemplates');if(!box){box=document.createElement('section');box.id='wsNewTemplates';box.className='ws-new-templates';const anchor=$('#wtDiscover')||chips;anchor.parentNode.insertBefore(box,anchor)}
  const newest=[...T.TEMPLATES].sort((a,b)=>recentScore(b)-recentScore(a)).slice(0,18);
  box.innerHTML=`<div class="ws-new-head"><div><span>Just added</span><h2>New Templates</h2><p>Newest Washi layouts first.</p></div></div><div class="ws-new-row">${newest.map(t=>`<article class="ws-new-card template-card" data-template-id="${esc(t.id)}">${mini(t)}<strong>${esc((t.title||'Template').replace(/\s+\d+$/,''))}</strong><small>${esc(t.category||'Template')} · ${esc((T.FORMATS[t.format]?.label)||t.format||'Story')}</small></article>`).join('')}</div>`;
}

const perfStyle=document.createElement('style');perfStyle.textContent=`
.template-card,.wt-template,.wt-category,.ws-new-card{contain:layout paint style;content-visibility:auto;contain-intrinsic-size:280px 420px}
.ws-new-templates{margin:8px 0 22px}.ws-new-head span{font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;opacity:.6}.ws-new-head h2{margin:.2rem 0 0}.ws-new-head p{margin:.25rem 0 .8rem;opacity:.65}.ws-new-row{display:flex;gap:12px;overflow-x:auto;padding:2px 2px 10px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}.ws-new-card{flex:0 0 150px;scroll-snap-align:start;border:1px solid rgba(94,67,77,.12);border-radius:18px;padding:8px;background:#fff;text-align:left}.ws-new-card strong,.ws-new-card small{display:block;margin-top:7px}.ws-new-card small{font-size:.72rem;opacity:.62}.ws-new-mini{height:190px;border-radius:13px;position:relative;overflow:hidden}.ws-new-mini i{position:absolute;display:block;border-radius:3px}
.design-stage.interacting .layer-object:not(.selected){pointer-events:none}
`;
document.head.append(perfStyle);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>requestAnimationFrame(installNewSection),30),{once:true});else setTimeout(()=>requestAnimationFrame(installNewSection),30);

W.Stability={version:'2026.08.14-smooth-1',installNewSection};
})();

(() => {
'use strict';
const W=window.Washi=window.Washi||{};
function boot(){
  const E=W.Editor,DB=W.DB,panel=document.querySelector('#panelContent');
  if(!E||!DB||!panel||panel.dataset.photoBgReady)return;
  panel.dataset.photoBgReady='2';
  let input=document.querySelector('#washiBackgroundInput');
  if(!input){input=document.createElement('input');input.type='file';input.accept='image/*';input.hidden=true;input.id='washiBackgroundInput';document.body.appendChild(input)}
  const project=()=>E.getProject?.();
  const bgLayer=()=>project()?.objects?.find(o=>o.isPhotoBackground)||null;
  let syncing=false;
  const sync=()=>{
    if(syncing)return;syncing=true;
    try{
      document.querySelector('#wtPhotoBgControls')?.remove();
      const p=project();if(!p)return;
      const heading=panel.querySelector('.panel-title h3')?.textContent?.trim();if(heading&&heading!=='Canvas Style'&&heading!=='Style')return;
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
    } finally {syncing=false}
  };
  async function usePhoto(file){
    if(!file||!file.type.startsWith('image/'))return;
    let bg=bgLayer();
    if(bg){E.select(bg.id);await E.replaceSelectedMedia(file);bg=bgLayer()}
    else{
      const added=await E.addMedia([file]);bg=added?.[0];if(!bg)return;
      Object.assign(bg,{isPhotoBackground:true,name:'Photo Background',x:0,y:0,w:project().width,h:project().height,rotation:0,radius:0,fit:'cover',focusX:50,focusY:50,opacity:1,locked:true});
      const a=project().objects,i=a.findIndex(o=>o.id===bg.id);if(i>0){a.splice(i,1);a.unshift(bg)}
    }
    Object.assign(bg,{isPhotoBackground:true,x:0,y:0,w:project().width,h:project().height,rotation:0,radius:0,locked:true});
    const a=project().objects,i=a.findIndex(o=>o.id===bg.id);if(i>0){a.splice(i,1);a.unshift(bg)}
    E.render();E.save();sync();
  }
  input.addEventListener('change',async()=>{const f=input.files?.[0];input.value='';if(f)await usePhoto(f)});
  panel.addEventListener('click',e=>{
    if(e.target.closest('[data-bg-photo]'))input.click();
    if(e.target.closest('[data-bg-remove]')){const p=project(),bg=bgLayer();if(bg){p.objects=p.objects.filter(o=>o.id!==bg.id);E.render();E.save();sync()}}
    if(e.target.closest('[data-bg-edit]')){const bg=bgLayer();if(bg){bg.locked=false;E.select(bg.id);E.render();E.save();sync()}}
  });
  const obs=new MutationObserver(()=>setTimeout(sync,0));obs.observe(panel,{childList:true,subtree:false});
  sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0),{once:true});else setTimeout(boot,0);
})();
