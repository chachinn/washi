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
function cut(full,i,c){const o=document.createElement('canvas');o.width=c.slideWidth;o.height=c.slideHeight;o.getContext('2d',{alpha:false}).drawImage(full,i*c.slideWidth,0,c.slideWidth,c.slideHeight,0,0,c.slideWidth,c.slideHeight);return o}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function animate(ms,draw){
 return new Promise(resolve=>{
  const start=performance.now();
  function frame(now){const p=ms<=0?1:Math.min(1,(now-start)/ms);draw(p);if(p<1)requestAnimationFrame(frame);else resolve()}
  requestAnimationFrame(frame);
 });
}
function drawHold(ctx,canvas,snapshot,p){
 const z=1+.012*p,dx=canvas.width*(z-1)/2,dy=canvas.height*(z-1)/2;
 ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.save();ctx.translate(-dx,-dy);ctx.scale(z,z);ctx.drawImage(snapshot,0,0);ctx.restore();
}
function drawPush(ctx,canvas,current,next,p){
 const k=ease(p),x=Math.round(k*canvas.width);
 ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.drawImage(current,-x,0,canvas.width,canvas.height);
 ctx.drawImage(next,canvas.width-x,0,canvas.width,canvas.height);
}
async function renderVideo(q){
 const recorderType=mime();
 if(!recorderType)throw Error(isiOS()?'Video export needs MP4 recording support on this iPhone.':'Timed video export is not supported by this browser');
 const full=await X.renderProject(q),canvas=document.createElement('canvas');
 canvas.width=q.carousel.slideWidth;canvas.height=q.carousel.slideHeight;
 if(!canvas.captureStream)throw Error('Timed video export is not supported by this browser');
 const ctx=canvas.getContext('2d',{alpha:false}),first=cut(full,0,q.carousel),stream=canvas.captureStream(30),chunks=[];
 ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(first,0,0);
 const recorder=new MediaRecorder(stream,{mimeType:recorderType,videoBitsPerSecond:6000000});
 recorder.ondataavailable=e=>e.data.size&&chunks.push(e.data);
 const done=new Promise((res,rej)=>{recorder.onstop=res;recorder.onerror=()=>rej(recorder.error||Error('Video recorder failed'))});
 recorder.start(250);
 try{
  let current=first;
  for(let i=0;i<q.carousel.slideCount;i++){
   toast(`Rendering slide ${i+1}/${q.carousel.slideCount} into one video…`);
   if(i>0)current=cut(full,i,q.carousel);
   const totalMs=clamp(Number(q.carousel.durations?.[i])||3,.5,60)*1000;
   const hasNext=i<q.carousel.slideCount-1;
   const transitionMs=hasNext?Math.min(650,Math.max(320,totalMs*.22)):0;
   const holdMs=Math.max(120,totalMs-transitionMs);
   await animate(holdMs,p=>drawHold(ctx,canvas,current,p));
   if(hasNext){
    const next=cut(full,i+1,q.carousel);
    await animate(transitionMs,p=>drawPush(ctx,canvas,current,next,p));
   }
  }
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
 buttons.forEach(b=>b.disabled=true);if(box){box.hidden=false;box.innerHTML='<small class="wc-save-hint">Preparing one continuous sliding video…</small>'}
 try{const file=await renderVideo(project());showReady(file);toast('Video ready — tap Save / Share video')}
 catch(err){if(box){box.hidden=false;box.innerHTML=''}toast(err?.message||'Video export failed')}
 finally{buttons.forEach(b=>b.disabled=false)}
},true);
const css=document.createElement('style');css.textContent='.wc-save-ready{min-height:48px;border:0;border-radius:14px;background:var(--rose);color:#fff;font-weight:850;padding:0 16px}.wc-save-hint{display:block;color:var(--muted);line-height:1.4;padding:4px 2px}';document.head.append(css);
W.CarouselIOSExport={renderVideo,version:'v1.0-iphone-video-slide-transition'};
})();
