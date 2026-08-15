(() => {
'use strict';
const W=window.Washi=window.Washi||{},C=W.Carousel,X=W.Export,E=W.Editor;
if(!C||!X||!E)return;
const $=(s,r=document)=>r.querySelector(s),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
let prepared=null,preparedUrl='';
const project=()=>E.getProject?.()||E.state?.project;
const active=()=>!!project()?.carousel?.enabled;
const safe=v=>(String(v||'washi-carousel').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-')||'washi-carousel').toLowerCase();
const isiOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function toast(v){const t=$('#toast');if(!t)return;t.textContent=v;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2600)}
function mime(){
 if(!window.MediaRecorder)return null;
 const mp4=['video/mp4;codecs=avc1.42E01E','video/mp4'];
 const other=['video/webm;codecs=vp9','video/webm'];
 for(const m of isiOS()?mp4:[...mp4,...other]){
  try{if(!MediaRecorder.isTypeSupported||MediaRecorder.isTypeSupported(m))return m}catch{}
 }
 return null;
}
function animate(ms,draw){
 return new Promise(resolve=>{
  const start=performance.now();
  function frame(now){const p=ms<=0?1:Math.min(1,(now-start)/ms);draw(p);if(p<1)requestAnimationFrame(frame);else resolve()}
  requestAnimationFrame(frame);
 });
}
function drawPan(ctx,canvas,full,c,p){
 const w=c.slideWidth,h=c.slideHeight,maxX=Math.max(0,full.width-w);
 const sx=clamp(maxX*p,0,maxX);
 ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.drawImage(full,sx,0,w,h,0,0,w,h);
}
function totalPanMs(q){
 const count=Math.max(1,Number(q.carousel?.slideCount)||1);
 const durations=Array.from({length:count},(_,i)=>clamp(Number(q.carousel?.durations?.[i])||3,.5,60));
 const average=durations.reduce((sum,n)=>sum+n,0)/durations.length;
 return Math.max(500,average*count*1000);
}
async function renderVideo(q){
 const recorderType=mime();
 if(!recorderType)throw Error(isiOS()?'Video export needs MP4 recording support on this iPhone.':'Timed video export is not supported by this browser');
 const full=await X.renderProject(q),canvas=document.createElement('canvas');
 canvas.width=q.carousel.slideWidth;canvas.height=q.carousel.slideHeight;
 if(!canvas.captureStream)throw Error('Timed video export is not supported by this browser');
 const ctx=canvas.getContext('2d',{alpha:false}),stream=canvas.captureStream(30),chunks=[];
 drawPan(ctx,canvas,full,q.carousel,0);
 const recorder=new MediaRecorder(stream,{mimeType:recorderType,videoBitsPerSecond:6000000});
 recorder.ondataavailable=e=>e.data.size&&chunks.push(e.data);
 const done=new Promise((res,rej)=>{recorder.onstop=res;recorder.onerror=()=>rej(recorder.error||Error('Video recorder failed'))});
 recorder.start(250);
 try{
  const count=Math.max(1,Number(q.carousel.slideCount)||1),ms=totalPanMs(q);
  toast(count>1?`Rendering one seamless ${count}-slide pan…`:'Rendering video…');
  if(count>1)await animate(ms,p=>drawPan(ctx,canvas,full,q.carousel,p));
  else await animate(ms,()=>drawPan(ctx,canvas,full,q.carousel,0));
 }finally{if(recorder.state!=='inactive')recorder.stop()}
 await done;stream.getTracks().forEach(track=>track.stop());
 if(!chunks.length)throw Error('The browser did not produce video data.');
 const isMp4=recorderType.includes('mp4'),fileType=isMp4?'video/mp4':'video/webm',ext=isMp4?'mp4':'webm';
 return new File([new Blob(chunks,{type:fileType})],`${safe(q.name)}.${ext}`,{type:fileType});
}
function clearPrepared(){if(preparedUrl){URL.revokeObjectURL(preparedUrl);preparedUrl=''}prepared=null}
function fallbackLinks(file,box){
 if(preparedUrl)URL.revokeObjectURL(preparedUrl);
 preparedUrl=URL.createObjectURL(file);
 box.hidden=false;
 box.innerHTML=`<a href="${preparedUrl}" target="_blank" rel="noopener">Open video</a><a href="${preparedUrl}" download="${file.name}">Download ${file.name}</a>`;
}
function showReady(file){
 const sheet=$('#wcExport'),box=$('#wcDownloads');if(!sheet||!box)return;
 prepared=file;
 if(preparedUrl){URL.revokeObjectURL(preparedUrl);preparedUrl=''}
 box.hidden=false;
 box.innerHTML='<button type="button" data-save-ready-video class="wc-save-ready">Save / Share video</button><small class="wc-save-hint">Your video is ready. Tap once more so iPhone can open the native Save/Share sheet.</small>';
}
async function sharePrepared(){
 const file=prepared,box=$('#wcDownloads');if(!file||!box)return;
 try{
  if(navigator.share&&navigator.canShare?.({files:[file]})){
   await navigator.share({files:[file],title:project()?.name||'Washi Carousel'});
   toast('Video ready to save or share');
   return;
  }
 }catch(err){if(err?.name==='AbortError')return;fallbackLinks(file,box);toast('Use Open video or Download instead');return}
 fallbackLinks(file,box);
}
document.addEventListener('click',async e=>{
 const t=e.target instanceof Element?e.target:null;if(!t)return;
 if(t.closest('[data-save-ready-video]')){e.preventDefault();e.stopImmediatePropagation();return sharePrepared()}
 const videoButton=t.closest('#wcExport [data-x="video"]');if(!videoButton||!active())return;
 e.preventDefault();e.stopImmediatePropagation();
 clearPrepared();
 const sheet=$('#wcExport'),buttons=[...sheet.querySelectorAll('[data-x]')],box=$('#wcDownloads');
 buttons.forEach(b=>b.disabled=true);if(box){box.hidden=false;box.innerHTML='<small class="wc-save-hint">Preparing one continuous seamless pan…</small>'}
 try{const file=await renderVideo(project());showReady(file);toast('Video ready — tap Save / Share video')}
 catch(err){if(box){box.hidden=false;box.innerHTML=''}toast(err?.message||'Video export failed')}
 finally{buttons.forEach(b=>b.disabled=false)}
},true);
const css=document.createElement('style');css.textContent='.wc-save-ready{min-height:48px;border:0;border-radius:14px;background:var(--rose);color:#fff;font-weight:850;padding:0 16px}.wc-save-hint{display:block;color:var(--muted);line-height:1.4;padding:4px 2px}';document.head.append(css);
W.CarouselIOSExport={renderVideo,version:'v1.0-iphone-video-seamless-pan'};
})();
