(() => {
'use strict';

const W=window.Washi=window.Washi||{},T=W.Templates,E=W.Editor,DB=W.DB;
if(!T||!E||!DB)return;
const $=(s,r=document)=>r.querySelector(s);
const MAX_CUSTOM_PHOTOS=60,MAX_CAROUSEL_SLIDES=20;
const LABELS={story:'Story',portrait:'Post',square:'Square',reel:'Reel cover',dump:'Photo dump'};
const TERMS={
 story:['story','diary','scrapbook','travel','birthday','recap','prompt','journal'],
 portrait:['portrait','post','editorial','collage','photo dump','magazine','camera roll'],
 square:['square','grid','collage','post','contact'],
 reel:['reel','video','motion','cover','film','editorial'],
 dump:['photo dump','dump','camera roll','collage','recap','lately','contact']
};
const fmtDims={story:[1080,1920],portrait:[1080,1350],square:[1080,1080],reel:[1080,1920],dump:[1080,1350]};

function toast(msg){const t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function openModal(html){const m=$('#modal'),c=$('#modalContent');if(!m||!c)return;c.innerHTML=html;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.classList.add('modal-open')}
const modalHead=(title,desc='')=>`<div class="modal-title"><div><h2>${esc(title)}</h2>${desc?`<p>${esc(desc)}</p>`:''}</div><button class="modal-close" data-close-modal>×</button></div>`;

function templateScore(t,format){
 const hay=`${t.title||''} ${t.category||''} ${(t.tags||[]).join(' ')}`.toLowerCase(),terms=TERMS[format]||[];
 let score=0;
 if(t.format===format)score+=80;
 if(format==='portrait'&&t.format==='portrait')score+=20;
 if(format==='dump'&&/photo dump/i.test(t.category||''))score+=70;
 if(format==='reel'&&t.format==='story')score+=12;
 for(const term of terms)if(hay.includes(term))score+=12;
 if(t.category==='Seamless Carousel')score-=35;
 if(t.addedAt)score+=Math.min(10,Math.max(0,(Date.parse(t.addedAt)||0)/1e13));
 return score;
}
function recommended(format){
 const list=(T.TEMPLATES||[]).map((t,i)=>({t,score:templateScore(t,format),i})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.i-b.i).map(x=>x.t);
 const seen=new Set(),out=[];
 for(const t of list){const key=t.id||t.title;if(seen.has(key))continue;seen.add(key);out.push(t);if(out.length===8)break}
 if(out.length<8){for(const t of T.TEMPLATES||[]){if(t.category==='Seamless Carousel')continue;const key=t.id||t.title;if(seen.has(key))continue;seen.add(key);out.push(t);if(out.length===8)break}}
 return out;
}
function showRecommendations(format){
 const label=LABELS[format]||'Design',items=recommended(format),blank=format==='dump'?'Choose photos & auto-arrange':`Start blank ${label.toLowerCase()}`;
 const [w,h]=fmtDims[format]||[];
 openModal(`${modalHead(`${label} ideas`,`Pick a recommended template or start blank. Everything stays editable.`)}
 <button class="primary-button" style="width:100%;margin-top:16px;justify-content:center" data-new-format="${format}" data-rec-blank>${blank}</button>
 <div class="section-kicker" style="margin-top:18px">Recommended for ${esc(label)}</div>
 <div class="modal-grid">${items.map(t=>`<button class="modal-option" data-template-id="${esc(t.id)}"><b>${esc(t.title||'Template')}</b><small>${esc(t.category||'Template')}${w&&h?` · ${w} × ${h}`:''}</small></button>`).join('')}</div>`);
}

function enhanceCustomModal(){
 const c=$('#modalContent');if(!c||!$('#customWidth',c)||$('#customPhotoCount',c))return;
 const create=$('#createCustom',c);if(!create)return;
 const wrap=document.createElement('div');wrap.className='field';wrap.innerHTML=`<label>How many photos are you planning to add?</label><input id="customPhotoCount" type="number" inputmode="numeric" min="0" max="${MAX_CUSTOM_PHOTOS}" value="0"><small style="color:var(--muted);line-height:1.35">0 keeps the canvas blank. 1–${MAX_CUSTOM_PHOTOS} creates ready-to-fill photo frames automatically.</small>`;
 create.before(wrap);
}
function gridRects(n,w,h){
 if(n<=0)return[];const min=Math.min(w,h),margin=Math.max(22,Math.round(min*.035)),gap=Math.max(10,Math.round(min*.014)),usableW=w-margin*2,usableH=h-margin*2;
 const cols=Math.max(1,Math.ceil(Math.sqrt(n*(usableW/Math.max(1,usableH))))),rows=Math.ceil(n/cols),cellW=(usableW-gap*(cols-1))/cols,cellH=(usableH-gap*(rows-1))/rows,out=[];
 for(let i=0;i<n;i++){const row=Math.floor(i/cols),inRow=Math.min(cols,n-row*cols),rowW=inRow*cellW+(inRow-1)*gap,start=margin+(usableW-rowW)/2,col=i-row*cols;out.push({x:start+col*(cellW+gap),y:margin+row*(cellH+gap),w:cellW,h:cellH})}
 return out;
}
function addCustomFrames(count){
 const p=E.getProject?.();if(!p||p.name!=='Untitled Custom'||count<1)return;
 count=Math.min(MAX_CUSTOM_PHOTOS,Math.max(0,Math.floor(count)));const rects=gridRects(count,p.width,p.height),radius=Math.max(4,Math.min(28,Math.min(p.width,p.height)*.018));
 const objects=rects.map(r=>({id:DB.uid('obj'),type:'placeholder',x:r.x,y:r.y,w:r.w,h:r.h,radius,rotation:0,fit:'cover',opacity:1,visible:true,locked:false,label:'Add photo'}));
 p.objects.push(...objects);p.plannedPhotoCount=count;E.state.selectedId=null;E.render();E.save();toast(`${count} photo frame${count===1?'':'s'} ready`);
}

function currentProject(){return E.getProject?.()||E.state?.project}
function carouselActive(){return !!currentProject()?.carousel?.enabled}
function ensureExtendInput(){let i=$('#carouselExtendInput');if(i)return i;i=document.createElement('input');i.id='carouselExtendInput';i.type='file';i.accept='image/*,video/*';i.multiple=true;i.hidden=true;document.body.append(i);i.addEventListener('change',async()=>{const files=[...i.files];i.value='';if(files.length)await addPhotoSlides(files)});return i}
function ensureCarouselButtons(){
 const h=$('#washiCarouselHUD');if(!h||!carouselActive())return;
 if(!h.querySelector('[data-c-add-photos]')){const photos=document.createElement('button');photos.dataset.cAddPhotos='1';photos.textContent='＋ Photos';photos.title='Add photos as new slides';const slide=document.createElement('button');slide.dataset.cAddSlide='1';slide.textContent='＋ Slide';slide.title='Add a blank slide';h.append(photos,slide)}
 const q=currentProject(),disabled=q.carousel.slideCount>=MAX_CAROUSEL_SLIDES;h.querySelectorAll('[data-c-add-photos],[data-c-add-slide]').forEach(b=>b.disabled=disabled);
}
function slideBackground(q,slide){
 const sw=q.carousel.slideWidth,sh=q.carousel.slideHeight,x=slide*sw;
 const local=(q.objects||[]).find(o=>o.type==='shape'&&o.x<=x+2&&o.y<=2&&o.x+o.w>=x+sw-2&&o.y+o.h>=sh-2&&o.fill);
 return local?.fill||(q.bg?.type==='solid'?q.bg.value:'#fff8fb');
}
function appendSlideBase(q,slide){
 const sw=q.carousel.slideWidth,sh=q.carousel.slideHeight,fill=slideBackground(q,Math.max(0,slide-1));
 q.objects.unshift({id:DB.uid('obj'),type:'shape',shape:'rect',x:slide*sw,y:0,w:sw,h:sh,fill,border:'transparent',borderWidth:0,radius:0,opacity:1,rotation:0,visible:true,locked:true,carouselExtension:true});
}
function appendPlaceholder(q,slide){const sw=q.carousel.slideWidth,sh=q.carousel.slideHeight;q.objects.push({id:DB.uid('obj'),type:'placeholder',x:slide*sw+Math.round(sw*.09),y:Math.round(sh*.08),w:Math.round(sw*.82),h:Math.round(sh*.84),radius:18,rotation:0,fit:'cover',opacity:1,visible:true,locked:false,label:'Add photo',carouselExtension:true})}
async function optimize(file){
 if(!file.type.startsWith('image/')||file.type==='image/gif'||!window.createImageBitmap)return file;
 try{const b=await createImageBitmap(file),max=2600;if(Math.max(b.width,b.height)<=max&&file.size<=3_000_000){b.close();return file}const s=Math.min(1,max/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(b.width*s));c.height=Math.max(1,Math.round(b.height*s));c.getContext('2d').drawImage(b,0,0,c.width,c.height);b.close();const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.9));return blob?new File([blob],file.name.replace(/\.[^.]+$/,'.jpg'),{type:'image/jpeg'}):file}catch{return file}
}
async function mediaObject(file,q,slide){
 const stored=await optimize(file),mediaId=await DB.assetPut(stored,{name:file.name,type:stored.type,size:stored.size}),sw=q.carousel.slideWidth,sh=q.carousel.slideHeight;
 return{id:DB.uid('obj'),type:stored.type.startsWith('video/')?'video':'image',mediaId,mediaType:stored.type,x:slide*sw+Math.round(sw*.09),y:Math.round(sh*.08),w:Math.round(sw*.82),h:Math.round(sh*.84),radius:18,rotation:0,fit:'cover',focusX:50,focusY:50,mediaZoom:1,filterPreset:'none',brightness:1,contrast:1,saturation:1,flipX:false,flipY:false,muted:true,opacity:1,visible:true,locked:false,carouselExtension:true};
}
function finishExtend(q,oldCount,added){
 if(!added)return;const c=q.carousel;c.slideCount=oldCount+added;q.width=c.slideWidth*c.slideCount;c.durations=Array.from({length:c.slideCount},(_,i)=>Number(c.durations?.[i])||3);c.activeSlide=oldCount;c.view='slide';E.state.selectedId=null;E.render();E.save();requestAnimationFrame(()=>{ensureCarouselButtons();const sc=$('#stageScroll');if(sc)sc.scrollTo({left:c.activeSlide*c.slideWidth*E.state.zoom,behavior:'smooth'})});toast(`${added} slide${added===1?'':'s'} added`)
}
function addBlankSlide(){const q=currentProject();if(!q?.carousel?.enabled)return;const old=q.carousel.slideCount;if(old>=MAX_CAROUSEL_SLIDES)return toast(`Carousel is already at ${MAX_CAROUSEL_SLIDES} slides`);appendSlideBase(q,old);appendPlaceholder(q,old);finishExtend(q,old,1)}
async function addPhotoSlides(files){
 const q=currentProject();if(!q?.carousel?.enabled)return;const old=q.carousel.slideCount,room=MAX_CAROUSEL_SLIDES-old;if(room<=0)return toast(`Carousel is already at ${MAX_CAROUSEL_SLIDES} slides`);const picked=files.slice(0,room);toast(`Adding ${picked.length} photo slide${picked.length===1?'':'s'}…`);let added=0;
 for(const file of picked){try{const slide=old+added,obj=await mediaObject(file,q,slide);appendSlideBase(q,slide);q.objects.push(obj);added++}catch(err){console.warn('Washi carousel add photo failed',err);break}}
 if(added)finishExtend(q,old,added);if(files.length>room)toast(`Added ${added}. Maximum ${MAX_CAROUSEL_SLIDES} slides.`)
}

document.addEventListener('click',e=>{
 const card=e.target.closest('.format-card[data-format]');
 if(card){const format=card.dataset.format;if(format==='custom'){requestAnimationFrame(enhanceCustomModal);return}if(LABELS[format]){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showRecommendations(format);return}}
 const custom=e.target.closest('[data-new-format="custom"]');if(custom)requestAnimationFrame(enhanceCustomModal);
 const create=e.target.closest('#createCustom');if(create){const count=Math.min(MAX_CUSTOM_PHOTOS,Math.max(0,Math.floor(Number($('#customPhotoCount')?.value)||0)));if(count)requestAnimationFrame(()=>addCustomFrames(count))}
 if(e.target.closest('[data-c-add-photos]')){e.preventDefault();return ensureExtendInput().click()}
 if(e.target.closest('[data-c-add-slide]')){e.preventDefault();return addBlankSlide()}
},true);

window.addEventListener('washi:selection-changed',()=>requestAnimationFrame(ensureCarouselButtons));
window.addEventListener('washi:project-saved',()=>requestAnimationFrame(ensureCarouselButtons));
window.addEventListener('resize',()=>carouselActive()&&requestAnimationFrame(ensureCarouselButtons),{passive:true});
setTimeout(()=>{ensureCarouselButtons();ensureExtendInput()},120);

W.CreationFlow={recommended,gridRects,addPhotoSlides,addBlankSlide,version:'2026.08.14-r15'};
})();
