(() => {
'use strict';
const W=window.Washi=window.Washi||{},E=W.Editor;if(!E)return;
const $=(s,r=document)=>r.querySelector(s);
const panel=$('#editorPanel'),editorView=$('#editorView');
const LABELS={add:'Add',text:'Text',media:'Media',stickers:'Decor',draw:'Draw',style:'Style',layers:'Layers',more:'More'};
const activeTool=()=>$('#editorToolbar [data-tool].active')?.dataset.tool||'add';
function ensurePeek(){let c=$('#washiToolPeek');if(c)return c;c=document.createElement('button');c.id='washiToolPeek';c.type='button';c.className='washi-tool-peek';c.setAttribute('aria-label','Open active tool controls');c.hidden=true;editorView?.append(c);return c}
function sync(){const c=ensurePeek(),tool=activeTool(),open=panel?.classList.contains('open');if(!c)return;c.hidden=!editorView?.classList.contains('active')||open;if(c.hidden)return;const drawing=tool==='draw'&&E.state?.draw?.enabled;c.innerHTML=`<span>${drawing?'✎':'⌃'}</span><b>${LABELS[tool]||'Tool'} controls</b>${drawing?'<small>Draw mode on</small>':''}`;c.classList.toggle('drawing-on',drawing)}
function minimize(){if(!panel)return;panel.classList.remove('open');panel.setAttribute('aria-hidden','true');sync()}
function reopen(){const b=$(`#editorToolbar [data-tool="${CSS.escape(activeTool())}"]`);if(b&&!panel?.classList.contains('open'))b.click()}
const handle=panel?.querySelector('.panel-handle');if(handle){handle.setAttribute('role','button');handle.setAttribute('tabindex','0');handle.setAttribute('aria-label','Minimize controls')}
document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;const close=t.closest('[data-panel-close],#editorPanel .panel-handle');if(close&&panel?.classList.contains('open')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();minimize();return}const b=t.closest('#editorToolbar [data-tool]');if(b&&panel?.classList.contains('open')&&b.classList.contains('active')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();minimize()}},true);
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target?.matches?.('#editorPanel .panel-handle')){e.preventDefault();minimize()}},true);
document.addEventListener('click',e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;if(t.closest('#washiToolPeek')){e.preventDefault();reopen();return}if(t.closest('#editorToolbar,[data-paction],[data-object-action],[data-route],#exitEditor'))requestAnimationFrame(sync)});
window.addEventListener('washi:selection-changed',()=>requestAnimationFrame(sync));
const css=document.createElement('style');css.textContent=`#editorPanel .panel-handle{cursor:pointer;min-height:14px;background:transparent;position:relative}#editorPanel .panel-handle:after{content:"";position:absolute;left:50%;top:4px;transform:translateX(-50%);width:38px;height:4px;border-radius:99px;background:var(--pink-200)}.washi-tool-peek{position:absolute;z-index:53;top:calc(118px + var(--safe-top));right:10px;max-width:170px;min-height:38px;border:1px solid var(--line);border-radius:13px;background:rgba(255,255,255,.94);box-shadow:var(--shadow-soft);backdrop-filter:blur(12px);padding:6px 10px;display:grid;grid-template-columns:auto 1fr;align-items:center;gap:6px;text-align:left;color:var(--ink)}.washi-tool-peek[hidden]{display:none}.washi-tool-peek span{grid-row:1/3;font-size:1rem;color:var(--rose)}.washi-tool-peek b{font-size:.69rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.washi-tool-peek small{font-size:.55rem;color:var(--rose);font-weight:850}.washi-tool-peek.drawing-on{border-color:rgba(200,79,119,.28);background:rgba(255,245,249,.97)}@media(max-width:430px){.washi-tool-peek{top:calc(115px + var(--safe-top));max-width:145px}}`;document.head.append(css);
function boot(){ensurePeek();sync();W.ToolPanelUX={version:'v1.0',minimize,sync}}
if(document.readyState==='complete')boot();else window.addEventListener('load',boot,{once:true});
})();
