(() => {
'use strict';
const W=window.Washi=window.Washi||{},T=W.Templates;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const normHex=v=>{let s=String(v||'').trim().toLowerCase();if(/^#[0-9a-f]{3}$/.test(s))s='#'+[...s.slice(1)].map(x=>x+x).join('');return /^#[0-9a-f]{6}$/.test(s)?s:null};
function upgradeCatalog(){
 if(!T?.factories||!Array.isArray(T.TEMPLATES)||T.__referenceUpgrade)return;
 T.__referenceUpgrade=true;
 const kept=[...T.TEMPLATES]; // Preserve the full 1,200+ base library; broad UI views are already capped by templates.js for mobile stability.
 const {text,shape,sticker,photo}=T.factories;
 const palettes=[
  {n:'Paper',bg:'#f5f3ee',paper:'#ffffff',ink:'#171717',a:'#74716c',b:'#d8d4ca'},
  {n:'Ink',bg:'#111111',paper:'#f7f5f0',ink:'#111111',a:'#efefeb',b:'#4d4d4d'},
  {n:'Blue',bg:'#dfeafa',paper:'#ffffff',ink:'#173653',a:'#4f83b9',b:'#a8c7e5'},
  {n:'Sage',bg:'#e7eee4',paper:'#fbfcf8',ink:'#344230',a:'#70866a',b:'#bdcab6'},
  {n:'Clay',bg:'#e9d2c3',paper:'#fffaf6',ink:'#50342b',a:'#aa6045',b:'#d9a58d'},
  {n:'Cherry',bg:'#8e2829',paper:'#fffaf5',ink:'#431719',a:'#c74745',b:'#e9bbb0'},
  {n:'Butter',bg:'#f3e9b4',paper:'#fffdf3',ink:'#554b23',a:'#aa8c26',b:'#ddc968'},
  {n:'Lavender',bg:'#ece7f5',paper:'#fdfbff',ink:'#4b4057',a:'#8873a5',b:'#c8bcdb'}
 ];
 const fam=[
  ['torn-four','Torn Travel Stack','Travel'],['ripped-duo','Ripped Double Exposure','Photo Dump'],
  ['brush-frame','Brush Edge Portrait','Editorial'],['flower-frame','Pressed Flower Frame','Scrapbook'],
  ['gift-grid','Ribbon Gift Grid','Celebrations'],['postage-six','Postage Six','Instant'],
  ['instant-nine','Instant Contact Nine','Instant'],['polaroid-overlap','Overlapping Instants','Instant'],
  ['doodle-highlights','Handwritten Highlights','Scrapbook'],['vertical-film','Vertical Instant Roll','Film'],
  ['torn-triptych','Torn Portrait Triptych','Film'],['travel-diary','Travel Diary Stack','Travel'],
  ['type-cutout','Cutout Type Story','Editorial'],['vacation-grid','Vacation Favorites','Travel'],
  ['suitcase-board','Open Suitcase Board','Travel'],['snapshot-pair','Snapshot Pair','Photo Dump'],
  ['stamp-single','Postage Portrait','Instant'],['scribble-pair','Scribble Frame Pair','Scrapbook'],
  ['instant-carousel','Instant Carousel','Instant'],['instant-triptych','Instant Triptych','Instant'],
  ['stamp-triptych','Stamp Triptych','Film'],['paper-stack','Layered Paper Stack','Scrapbook'],
  ['ribbon-four','Ribbon Four','Celebrations'],['center-cutout','Center Cutout Collage','Photo Dump'],
  ['paint-window','Paint Window','Editorial'],['botanical-cutout','Botanical Cutout','Scrapbook'],
  ['journal-layers','Journal Layers','Scrapbook'],['contact-torn','Torn Contact Sheet','Film'],
  ['white-mat','Gallery White Mat','Photographer'],['double-snapshot','Double Snapshot','Photo Dump'],
  ['photo-on-photo','Photo on Photo','Editorial'],['scrap-doodle','Scrapbook Doodles','Scrapbook'],
  ['letter-column','Letter Column','Editorial'],['four-square','Four Square Travel','Travel'],
  ['picnic-collage','Picnic Collage','Seasonal'],['mono-rip','Monochrome Rips','Film'],
  ['postcard-stamp','Postcard Stamp','Travel'],['film-roll','Film Roll','Film'],
  ['ticket-stack','Ticket Stack','Travel'],['memory-wall','Memory Wall','Photo Dump']
 ];
 const formats=['story','portrait','story','square','portrait','story'];
 function F(format,p){const d=T.FORMATS[format]||T.FORMATS.story,Wd=d.w,H=d.h;return{W:Wd,H,P:(x,y,w,h,r=0,rot=0,l='Add photo')=>photo(Wd*x,H*y,Wd*w,H*h,r,rot,l),B:(x,y,w,h,fill=p.paper,r=0,e={})=>shape(Wd*x,H*y,Wd*w,H*h,fill,r,e),X:(v,x,y,w,h,s=.04,c=p.ink,e={})=>text(v,Wd*x,H*y,Wd*w,H*h,Wd*s,c,e.font||'Georgia, serif',e),D:(v,x,y,s=.06,c=p.a,e={})=>sticker(v,Wd*x,H*y,Wd*s,{color:c,...e})}}
 const rot=(v,a=6)=>((v%3)-1)*a;
 function build(kind,format,p,v){
  const f=F(format,p),a=[];
  const tape=(x,y,w,ang=0,c=p.b)=>a.push(f.B(x,y,w,.025,c,3,{rotation:ang,opacity:.82}));
  const torn=(x,y,w,ang=0,c=p.paper)=>{a.push(f.B(x,y,w,.035,c,0,{rotation:ang}));for(let i=0;i<9;i++)a.push(f.D(i%2?'·':'•',x+i*w/9,y-.01,.018,c,{rotation:ang}))};
  const pol=(x,y,w,h,ang=0,label='')=>{a.push(f.B(x-.018,y-.018,w+.036,h+.075,p.paper,3,{rotation:ang,border:p.b,borderWidth:1}));a.push(f.P(x,y,w,h,1,ang,label||'Add photo'))};
  switch(kind){
   case'torn-four':for(let i=0;i<4;i++){a.push(f.P(0,i*.25,1,.28,0,rot(v+i,2)));torn(0,i*.245,1,rot(v+i,1.5))}break;
   case'ripped-duo':a.push(f.P(0,0,1,.55));a.push(f.P(0,.48,1,.52));torn(0,.49,1,rot(v,2));torn(0,.54,1,-rot(v,2));break;
   case'brush-frame':a.push(f.P(.04,.04,.92,.92));for(let i=0;i<6;i++){a.push(f.B(-.02+i*.2,.02,.24,.055,p.paper,0,{rotation:-12+i*4}));a.push(f.B(.8-i*.18,.92,.25,.055,p.paper,0,{rotation:10-i*3}))}break;
   case'flower-frame':a.push(f.B(0,0,1,1,p.paper));a.push(f.P(.2,.2,.6,.58,0));[['✿',.05,.08,.12],['❀',.76,.13,.12],['✾',.05,.72,.11],['❁',.78,.72,.12]].forEach(q=>a.push(f.D(...q,p.a)));a.push(f.X('happy little days',.32,.83,.36,.08,.03,p.ink,{align:'center'}));break;
   case'gift-grid':for(let i=0;i<4;i++)a.push(f.P((i%2)*.5,Math.floor(i/2)*.5,.5,.5));a.push(f.B(.47,0,.06,1,p.a));a.push(f.B(0,.47,1,.06,p.a));a.push(f.D('✦',.42,.41,.18,p.paper));break;
   case'postage-six':for(let i=0;i<6;i++){let x=.1+(i%2)*.45,y=.08+Math.floor(i/2)*.3;a.push(f.B(x-.02,y-.02,.39,.27,p.paper,0,{border:p.a,borderWidth:2}));a.push(f.P(x,y,.35,.23))}break;
   case'instant-nine':for(let i=0;i<9;i++){let x=.08+(i%3)*.3,y=.08+Math.floor(i/3)*.29;pol(x,y,.24,.18,rot(v+i,1))}break;
   case'polaroid-overlap':a.push(f.P(0,0,1,1));pol(.06,.16,.48,.42,-7+v);pol(.45,.35,.48,.42,6-v);break;
   case'doodle-highlights':pol(.08,.1,.44,.36,-4);pol(.46,.48,.44,.36,4);a.push(f.X('Highlights',.58,.08,.3,.06,.035,p.ink,{italic:true}));a.push(f.D('→',.55,.18,.08,p.ink));a.push(f.D('☆',.8,.2,.06,p.a));a.push(f.X('some snapshots worth keeping',.08,.55,.34,.12,.025));break;
   case'vertical-film':for(let i=0;i<4;i++)pol(.18,.04+i*.24,.64,.19,0,`Frame ${i+1}`);break;
   case'torn-triptych':for(let i=0;i<3;i++){a.push(f.P(.23,.07+i*.3,.54,.25));torn(.21,.055+i*.3,.58,0,p.paper);torn(.21,.29+i*.3,.58,0,p.paper)}break;
   case'travel-diary':a.push(f.P(0,0,1,1));a.push(f.B(.2,.2,.62,.6,p.paper,1,{rotation:-5+v}));a.push(f.B(.23,.16,.62,.6,p.paper,1,{rotation:3-v/2}));a.push(f.P(.18,.22,.62,.52,1,-4+v));a.push(f.B(.48,.14,.3,.13,p.b,1,{rotation:-4}));a.push(f.X('my travel diaries',.5,.17,.26,.08,.028,p.ink,{italic:true,align:'center'}));a.push(f.D('📎',.72,.12,.07,p.ink));break;
   case'type-cutout':{const m=f.P(.035,.035,.93,.93,0,0,'Add photo inside LATELY');Object.assign(m,{maskText:'LATELY',maskStyle:'lately-free',fit:'cover',focusX:50,focusY:50,mediaZoom:1,radius:0});a.push(m);break}
   case'vacation-grid':for(let i=0;i<4;i++)a.push(f.P((i%2)*.5,Math.floor(i/2)*.5,.5,.5));a.push(f.P(.39,.25,.22,.5,10,0,'Cutout portrait'));a.push(f.X('vacation',.34,.18,.28,.04,.025,'#fff',{align:'center'}));break;
   case'suitcase-board':a.push(f.P(0,0,1,1));a.push(f.B(.12,.24,.76,.58,'#d8c9b8',30,{border:'#8a725d',borderWidth:4}));a.push(f.X('meet me in',.26,.12,.48,.04,.025,'#fff',{align:'center'}));a.push(f.X('France',.16,.15,.68,.12,.08,'#fff',{italic:true,align:'center'}));pol(.22,.34,.24,.19,-5);pol(.56,.58,.22,.18,5);a.push(f.D('✈',.5,.42,.09,p.ink));a.push(f.D('◒',.23,.62,.08,p.a));break;
   case'snapshot-pair':a.push(f.P(0,0,1,1));a.push(f.P(0,.5,1,.5));torn(0,.48,1,rot(v,2));break;
   case'stamp-single':a.push(f.B(0,0,1,1,p.bg));a.push(f.B(.12,.12,.76,.76,p.paper,0,{border:p.paper,borderWidth:10}));a.push(f.P(.15,.15,.7,.7));a.push(f.D('📎',.12,.1,.08,p.ink));break;
   case'scribble-pair':a.push(f.B(0,0,1,1,p.paper));a.push(f.P(.1,.1,.8,.4));a.push(f.P(.45,.55,.55,.4));for(let i=0;i<4;i++)a.push(f.B(.07+i*.01,.08+i*.008,.84,.008,p.ink,0,{rotation:(i-2)*.5}));break;
   case'instant-carousel':for(let i=0;i<3;i++)pol(-.08+i*.38,.28,.34,.4,rot(v+i,1.5));break;
   case'instant-triptych':for(let i=0;i<3;i++)pol(.18,.08+i*.3,.64,.22,0);break;
   case'stamp-triptych':a.push(f.B(0,0,1,1,'#111'));for(let i=0;i<3;i++){a.push(f.B(.09,.06+i*.31,.82,.27,p.paper,0,{border:p.paper,borderWidth:6}));a.push(f.P(.12,.09+i*.31,.76,.21))}break;
   case'paper-stack':a.push(f.B(0,0,1,1,p.bg));for(let i=0;i<3;i++)a.push(f.B(.18+i*.03,.18-i*.03,.64,.64,i%2?p.b:p.paper,2,{rotation:(i-1)*4}));a.push(f.P(.23,.25,.54,.48,1,2));tape(.55,.18,.22,-8);break;
   case'ribbon-four':for(let i=0;i<4;i++)a.push(f.P((i%2)*.5,Math.floor(i/2)*.5,.5,.5));a.push(f.B(.48,0,.04,1,p.a));a.push(f.B(0,.48,1,.04,p.a));a.push(f.D('❈',.44,.44,.12,p.a));break;
   case'center-cutout':for(let i=0;i<4;i++)a.push(f.P((i%2)*.5,Math.floor(i/2)*.5,.5,.5));a.push(f.P(.34,.18,.32,.66,999,0,'Center portrait'));break;
   case'paint-window':a.push(f.B(0,0,1,1,p.paper));a.push(f.P(.12,.16,.76,.68));for(let i=0;i<8;i++){a.push(f.B(-.02+i*.14,.1,.18,.05,p.paper,0,{rotation:-14+i*4}));a.push(f.B(.86-i*.12,.82,.18,.05,p.paper,0,{rotation:12-i*3}))}break;
   case'botanical-cutout':a.push(f.B(0,0,1,1,p.paper));a.push(f.P(.2,.18,.6,.62));a.push(f.D('✿',.04,.07,.14,p.a));a.push(f.D('❁',.78,.13,.14,p.b));a.push(f.D('✾',.1,.72,.12,p.a));a.push(f.X('summer notes',.35,.84,.3,.07,.027,p.ink,{align:'center'}));break;
   case'journal-layers':a.push(f.B(0,0,1,1,p.bg));a.push(f.B(.08,.08,.84,.84,p.paper,2,{rotation:-2}));a.push(f.B(.13,.13,.74,.72,p.b,2,{rotation:3}));a.push(f.P(.17,.2,.66,.5,2,-1));a.push(f.X('journal page',.22,.74,.56,.06,.032,p.ink,{italic:true,align:'center'}));break;
   case'contact-torn':a.push(f.B(0,0,1,1,p.paper));for(let i=0;i<6;i++){let x=.08+(i%2)*.46,y=.08+Math.floor(i/2)*.3;a.push(f.P(x,y,.38,.24));torn(x-.02,y-.015,.42,0,p.paper)}break;
   case'white-mat':a.push(f.B(0,0,1,1,p.paper));a.push(f.P(.08,.08,.84,.84));break;
   case'double-snapshot':a.push(f.B(0,0,1,1,p.paper));a.push(f.P(.08,.08,.84,.4));a.push(f.P(.28,.55,.72,.4));break;
   case'photo-on-photo':a.push(f.P(0,0,1,1));a.push(f.B(.44,.42,.48,.4,p.paper,0));a.push(f.P(.47,.45,.42,.34));break;
   case'scrap-doodle':a.push(f.B(0,0,1,1,p.paper));pol(.08,.1,.44,.36,-4);pol(.48,.48,.43,.36,5);a.push(f.D('☆',.72,.1,.06,p.a));a.push(f.D('→',.42,.42,.08,p.ink));a.push(f.X('new year ahead',.55,.32,.32,.07,.025,p.ink,{italic:true}));break;
   case'letter-column':a.push(f.P(.48,0,.52,1));a.push(f.B(0,0,.48,1,p.paper));a.push(f.X('L\nA\nT\nE\nL\nY',.12,.08,.25,.8,.08,p.a,{bold:true,align:'center',lineHeight:.9,font:'Marker Felt, Chalkboard SE, Trebuchet MS, sans-serif'}));break;
   case'four-square':for(let i=0;i<4;i++)a.push(f.P((i%2)*.5,Math.floor(i/2)*.5,.5,.5));[['vacation',.3,.15],['outfit',.6,.22],['faves',.57,.4],['day 1',.6,.55]].forEach(q=>a.push(f.X(q[0],q[1],q[2],.22,.04,.022,'#fff')));break;
   case'picnic-collage':a.push(f.P(0,0,1,1));pol(.08,.1,.38,.3,-5);pol(.52,.55,.38,.3,5);a.push(f.D('✿',.7,.08,.1,p.paper));break;
   case'mono-rip':a.push(f.B(0,0,1,1,p.paper));for(let i=0;i<3;i++){a.push(f.P(.22,.06+i*.31,.56,.25));torn(.2,.05+i*.31,.6,0,p.paper)}break;
   case'postcard-stamp':a.push(f.P(0,0,1,1));a.push(f.B(.1,.12,.8,.74,p.paper,2,{rotation:rot(v,3)}));a.push(f.P(.15,.18,.7,.54,1,rot(v,3)));a.push(f.X('POSTCARD',.18,.77,.32,.04,.022,p.ink,{letterSpacing:3}));a.push(f.D('✈',.72,.76,.07,p.a));break;
   case'film-roll':a.push(f.B(0,0,1,1,'#111'));for(let i=0;i<2;i++){a.push(f.P(.02,.03+i*.49,.96,.44));a.push(f.X(`WASHI ${40+v}`,.04,.465+i*.49,.22,.025,.015,'#f2a12a',{font:'Courier New, monospace'}))}break;
   case'ticket-stack':a.push(f.P(0,0,1,1));for(let i=0;i<3;i++){a.push(f.B(.15+i*.04,.2+i*.12,.7,.22,p.paper,4,{rotation:-5+i*5}));a.push(f.X(['BOARDING','ADMIT ONE','TRAVEL PASS'][i],.23+i*.03,.25+i*.12,.5,.04,.026,p.ink,{bold:true,letterSpacing:2}))}break;
   case'memory-wall':a.push(f.B(0,0,1,1,p.paper));for(let i=0;i<6;i++){let x=.06+(i%3)*.31,y=.1+Math.floor(i/3)*.4;pol(x,y,.24,.25,rot(v+i,2))}break;
  }
  return a;
 }
 const fresh=[];
 fam.forEach(([kind,title,category],fi)=>{for(let v=0;v<6;v++){const format=formats[(fi+v)%formats.length],p=palettes[(fi*3+v)%palettes.length],objects=build(kind,format,p,v);fresh.push({id:`ref-${kind}-${v+1}`,title:`${title} ${String(v+1).padStart(2,'0')}`,category,format,collection:p.n,composition:`${kind}-${v+1}`,source:'reference-pack',tags:[kind.replaceAll('-',' '),category.toLowerCase(),format,'creative','editable','reference-inspired'],bg:{type:'solid',value:p.bg},palette:{ink:p.ink,accent:p.a,accent2:p.b,paper:p.paper},customizable:{background:true,colors:true,typography:true,media:true,layout:true,layers:true,spacing:true,rotation:true,opacity:true},objects})}});
 const first=fresh.filter((_,i)=>i%6===0),rest=fresh.filter((_,i)=>i%6!==0);
 T.TEMPLATES.splice(0,T.TEMPLATES.length,...first,...kept,...rest);T.TEMPLATE_COUNT=T.TEMPLATES.length;T.CATEGORIES=[...new Set(T.TEMPLATES.map(t=>t.category))];T.COLLECTIONS=[...new Set(T.TEMPLATES.map(t=>t.collection).filter(Boolean))];T.LIBRARY_VERSION='3.3-clean-r10';
}
function install(){
 const E=W.Editor,DB=W.DB,panel=document.querySelector('#panelContent');if(!E||!DB||!panel||panel.dataset.freedomReady)return;panel.dataset.freedomReady='2';let busy=false;
 const style=document.createElement('style');style.textContent=`.wt-color-studio{margin:14px 0;padding:14px;border:1px solid rgba(111,72,87,.13);border-radius:18px;background:rgba(255,255,255,.72)}.wt-color-head{display:flex;justify-content:space-between;gap:10px;align-items:end;margin-bottom:10px}.wt-color-head small{opacity:.62}.wt-color-main{display:grid;grid-template-columns:68px 1fr auto;gap:9px;align-items:center}.wt-color-main input[type=color]{width:68px;height:56px;padding:3px;border:1px solid rgba(80,50,60,.18);border-radius:14px;background:white}.wt-color-main input[type=text]{height:50px;border:1px solid rgba(80,50,60,.15);border-radius:14px;padding:0 12px;font:600 16px ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase}.wt-color-main button,.wt-doc-color button{min-height:44px;border:1px solid rgba(80,50,60,.14);border-radius:13px;background:#fff;padding:0 12px;font-weight:700}.wt-doc-colors{display:grid;gap:8px;margin-top:12px}.wt-doc-color{display:grid;grid-template-columns:48px 1fr auto;gap:8px;align-items:center}.wt-doc-color input[type=color]{width:48px;height:44px;padding:2px;border:0;background:transparent}.wt-doc-color code{font-size:13px;opacity:.7}.wt-freedom{margin-top:12px}.wt-freedom-head{display:flex;justify-content:space-between;align-items:end;gap:8px}.wt-freedom-head small{opacity:.6}.wt-freedom-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:10px}.wt-freedom-grid label{display:grid;gap:5px;font-size:12px;font-weight:700}.wt-freedom-grid input,.wt-freedom-grid select{min-height:42px;border:1px solid rgba(80,50,60,.14);border-radius:12px;background:#fff;padding:6px}`;document.head.append(style);
 const proj=()=>E.getProject?.(),colorProps=['fill','border','color','highlightColor','outlineColor'];
 function projectColors(){const out=new Set,p=proj();if(!p)return[];if(p.bg?.type==='solid'&&normHex(p.bg.value))out.add(normHex(p.bg.value));for(const o of p.objects||[])for(const k of colorProps){const x=normHex(o[k]);if(x)out.add(x)}return[...out].sort((a,b)=>((a==='#ffffff')?-1:0)-((b==='#ffffff')?-1:0)).slice(0,18)}
 function replaceColor(oldColor,newColor){oldColor=normHex(oldColor);newColor=normHex(newColor);const p=proj();if(!oldColor||!newColor||!p)return;if(p.bg?.type==='solid'&&normHex(p.bg.value)===oldColor)p.bg.value=newColor;if(p.bg?.type==='gradient'&&typeof p.bg.value==='string')p.bg.value=p.bg.value.replaceAll(oldColor,newColor);for(const o of p.objects||[])for(const k of colorProps)if(normHex(o[k])===oldColor)o[k]=newColor;E.render();E.save()}
 function colorStudio(){document.querySelector('#wtColorStudio')?.remove();const p=proj();if(!p)return;const heading=panel.querySelector('.panel-title h3')?.textContent?.trim();if(heading!=='Canvas Style')return;const current=normHex(p.bg?.type==='solid'?p.bg.value:null)||'#ffffff',colors=projectColors(),box=document.createElement('section');box.id='wtColorStudio';box.className='wt-color-studio';box.innerHTML=`<div class="wt-color-head"><div><b>Canvas color</b><small>Color wheel + HEX</small></div></div><div class="wt-color-main"><input type="color" data-canvas-wheel value="${current}" aria-label="Canvas color wheel"><input type="text" data-canvas-hex value="${current.toUpperCase()}" maxlength="7" spellcheck="false"><button data-canvas-apply>Apply</button></div><div class="wt-color-head" style="margin-top:16px"><div><b>Template colors</b><small>Change any used color — including white paper</small></div></div><div class="wt-doc-colors">${colors.map(c=>`<div class="wt-doc-color"><input type="color" value="${c}" data-replace-color="${c}" aria-label="Replace ${c}"><code>${c.toUpperCase()}</code><button data-pick-replace="${c}">${c==='#ffffff'?'Change white':'Change'}</button></div>`).join('')}</div>`;const anchor=panel.querySelector('.swatch-row');anchor?.after(box)||panel.append(box)}
 function selectedControls(){document.querySelector('#wtFreedomControls')?.remove();const o=E.selected?.();if(!o)return;const box=document.createElement('section');box.id='wtFreedomControls';box.className='wt-freedom';let html='<div class="wt-freedom-head"><b>Selected layer</b><small>Customize this piece</small></div><div class="wt-freedom-grid">';if(o.type==='shape')html+=`<label>Fill<input type="color" data-wt-prop="fill" value="${normHex(o.fill)||'#ffffff'}"></label><label>Border<input type="color" data-wt-prop="border" value="${normHex(o.border)||'#ffffff'}"></label><label>Border width<input type="number" min="0" max="40" data-wt-num data-wt-prop="borderWidth" value="${Number(o.borderWidth||0)}"></label><label>Corner radius<input type="number" min="0" max="500" data-wt-num data-wt-prop="radius" value="${Number(o.radius||0)}"></label>`;if(o.type==='sticker')html+=`<label>Color<input type="color" data-wt-prop="color" value="${normHex(o.color)||'#c84f77'}"></label>`;if(['placeholder','image','video'].includes(o.type)&&!o.maskText)html+=`<label>Corner radius<input type="number" min="0" max="500" data-wt-num data-wt-prop="radius" value="${Number(o.radius||0)}"></label>`;if(o.type==='text')html+=`<label>Text color<input type="color" data-wt-prop="color" value="${normHex(o.color)||'#222222'}"></label>`;html+=`<label>Rotation<input type="number" min="-360" max="360" data-wt-num data-wt-prop="rotation" value="${Math.round(Number(o.rotation||0))}"></label><label>Opacity<input type="range" min="0" max="1" step=".02" data-wt-num data-wt-prop="opacity" value="${Number(o.opacity??1)}"></label></div>`;box.innerHTML=html;panel.appendChild(box)}
 function controls(){if(busy)return;busy=true;try{selectedControls();colorStudio()}finally{busy=false}}
 const observer=new MutationObserver(()=>setTimeout(controls,0));observer.observe(panel,{childList:true,subtree:false});window.addEventListener('washi:selection-changed',()=>setTimeout(controls,0));window.addEventListener('washi:project-saved',()=>setTimeout(colorStudio,0));
 panel.addEventListener('input',e=>{const el=e.target.closest('[data-wt-prop]');if(el){let v=el.value;if(el.hasAttribute('data-wt-num'))v=Number(v);E.updateSelected?.({[el.dataset.wtProp]:v},{history:false,rerender:true,persist:false});return}if(e.target.matches('[data-canvas-wheel]')){const hex=panel.querySelector('[data-canvas-hex]');if(hex)hex.value=e.target.value.toUpperCase()}});
 panel.addEventListener('change',e=>{if(e.target.closest('[data-wt-prop]')){E.save?.();return}const rep=e.target.closest('[data-replace-color]');if(rep){replaceColor(rep.dataset.replaceColor,rep.value);setTimeout(colorStudio,0)}});
 panel.addEventListener('click',e=>{const apply=e.target.closest('[data-canvas-apply]');if(apply){const hex=normHex(panel.querySelector('[data-canvas-hex]')?.value);if(hex){E.setBackground?.({type:'solid',value:hex});setTimeout(colorStudio,0)}return}const pick=e.target.closest('[data-pick-replace]');if(pick){const row=pick.closest('.wt-doc-color'),inp=row?.querySelector('input[type=color]');inp?.click()}});controls();
}
upgradeCatalog();if(typeof document!=='undefined'){const boot=()=>setTimeout(install,0);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()}
})();
