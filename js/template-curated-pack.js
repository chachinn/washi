(() => {
'use strict';

const W=window.Washi=window.Washi||{},T=W.Templates,DB=W.DB;
if(!T?.factories||!Array.isArray(T.TEMPLATES)||!DB||T.__curatedStudioAug16)return;
T.__curatedStudioAug16=true;

const {text,shape,sticker,photo}=T.factories;
const nativeFilter=Array.prototype.filter;
const SW=1080,SH=1350,ADDED='2026-08-16T12:44:00+08:00';
const COLLECTION='Washi Curated Studio · Aug 16';

const REMOVE_FAMILIES=['ribbon-four','snapshot-pair','mono-rip','scrap-doodle'];
const removeIds=new Set(REMOVE_FAMILIES.flatMap(kind=>Array.from({length:6},(_,i)=>`ref-${kind}-${i+1}`)));
const before=T.TEMPLATES.length;
const removed=nativeFilter.call(T.TEMPLATES,t=>removeIds.has(String(t.id)));
const kept=nativeFilter.call(T.TEMPLATES,t=>!removeIds.has(String(t.id)));

const palettes=[
 {name:'Paper Air',bg:'#f5f2eb',paper:'#fffdf8',ink:'#252321',accent:'#a27767',soft:'#dacdc2',dark:'#4a433e'},
 {name:'Sea Glass',bg:'#e8f0ef',paper:'#fbfdfc',ink:'#304643',accent:'#6b9590',soft:'#bfd4d0',dark:'#47645f'},
 {name:'Blue Hour',bg:'#dfe8f2',paper:'#f9fbfd',ink:'#263b50',accent:'#587fa4',soft:'#b5cbe0',dark:'#20334a'},
 {name:'Rose Film',bg:'#f1e5e7',paper:'#fffafa',ink:'#553d45',accent:'#b86d82',soft:'#dfb9c3',dark:'#6b4350'},
 {name:'Butter Press',bg:'#f5edc8',paper:'#fffdf3',ink:'#574d2c',accent:'#b29437',soft:'#dfcf82',dark:'#66572b'},
 {name:'Night Paper',bg:'#1f2022',paper:'#f3efe8',ink:'#f8f5ef',accent:'#d8b16d',soft:'#575a60',dark:'#111214'}
];

const fmt=id=>T.FORMATS?.[id]||T.FORMATS?.portrait||{w:1080,h:1350};
const base=(format,p)=>{const d=fmt(format);return{
 W:d.w,H:d.h,p,
 P:(x,y,w,h,e={})=>photo(d.w*x,d.h*y,d.w*w,d.h*h,e.radius??18,e.rotation??0,e.label||'Add photo'),
 B:(x,y,w,h,fill=p.paper,e={})=>shape(d.w*x,d.h*y,d.w*w,d.h*h,fill,e.radius??0,e),
 X:(v,x,y,w,h,s=.05,c=p.ink,e={})=>text(v,d.w*x,d.h*y,d.w*w,d.h*h,d.w*s,c,e.font||'Georgia, serif',e),
 D:(v,x,y,s=.06,c=p.accent,e={})=>sticker(v,d.w*x,d.h*y,d.w*s,{color:c,...e})
}};
const cbase=(slides,p)=>({
 W:SW*slides,H:SH,p,
 P:(x,y,w,h,e={})=>photo(x,y,w,h,e.radius??18,e.rotation??0,e.label||'Add photo'),
 B:(x,y,w,h,fill=p.paper,e={})=>shape(x,y,w,h,fill,e.radius??0,e),
 X:(v,x,y,w,h,s=54,c=p.ink,e={})=>text(v,x,y,w,h,s,c,e.font||'Georgia, serif',e),
 D:(v,x,y,s=80,c=p.accent,e={})=>sticker(v,x,y,s,{color:c,...e})
});

function heroStrip(format,p,v){const f=base(format,p),a=[];a.push(f.P(.04,.04,.92,.62,{radius:v?4:28}));for(let i=0;i<3;i++)a.push(f.P(.05+i*.31,.70,.28,.18,{radius:8,rotation:(i-1)*(v?2:-2)}));a.push(f.X(v?'a few frames':'weekend pieces',.06,.91,.62,.05,.038,p.dark,{bold:true}));a.push(f.X('photos that deserved a page',.64,.915,.30,.04,.018,p.dark,{align:'right'}));return a}
function staggeredDuo(format,p,v){const f=base(format,p),a=[];a.push(f.P(v?.42:.06,.07,.52,.78,{radius:2,rotation:v?2:-2}));a.push(f.P(v?.05:.58,.15,.36,.38,{radius:2,rotation:v?-4:4}));a.push(f.P(v?.08:.60,.58,.34,.26,{radius:2,rotation:v?3:-3}));a.push(f.X('somewhere between',.08,.88,.72,.06,.045,p.dark,{italic:true}));a.push(f.D('✦',.84,.86,.06,p.accent));return a}
function pictureInPicture(format,p,v){const f=base(format,p),a=[];a.push(f.P(0,0,1,1,{radius:0}));a.push(f.B(v?.08:.55,.57,.38,.31,p.paper,{radius:3,rotation:v?-5:5}));a.push(f.P(v?.10:.57,.59,.34,.25,{radius:2,rotation:v?-5:5}));a.push(f.X(v?'side note':'tiny detail',v?.12:.59,.86,.30,.035,.022,p.dark,{bold:true}));return a}
function asymGrid(format,p,v){const f=base(format,p),a=[];a.push(f.P(.05,.06,.58,.53,{radius:8}));a.push(f.P(.67,.06,.28,.25,{radius:8}));a.push(f.P(.67,.34,.28,.25,{radius:8}));a.push(f.P(.05,.63,.28,.27,{radius:8}));a.push(f.P(.36,.63,.59,.27,{radius:8}));a.push(f.X(v?'FIVE / FRAMES':'camera roll edit',.08,.925,.78,.04,.028,p.dark,{bold:true,letterSpacing:v?3:0}));return a}
function twinColumns(format,p,v){const f=base(format,p),a=[];a.push(f.P(.05,.07,.42,.78,{radius:v?0:22}));a.push(f.P(.53,.07,.42,.36,{radius:v?0:22}));a.push(f.P(.53,.48,.42,.37,{radius:v?0:22}));a.push(f.X('01',.08,.88,.1,.04,.025,p.accent,{bold:true}));a.push(f.X('a slower kind of day',.20,.88,.72,.05,.035,p.dark,{italic:true}));return a}
function contactCaption(format,p,v){const f=base(format,p),a=[];for(let i=0;i<6;i++){const x=.05+(i%2)*.47,y=.14+Math.floor(i/2)*.235;a.push(f.P(x,y,.42,.20,{radius:2}))}a.push(f.X(v?'CONTACT / 06':'recent frames',.05,.045,.90,.06,.04,p.dark,{bold:true,letterSpacing:v?4:0,font:v?'Courier New, monospace':'Georgia, serif'}));a.push(f.X('keep the ordinary ones too',.05,.88,.90,.045,.024,p.dark,{align:'center'}));return a}
function windowStack(format,p,v){const f=base(format,p),a=[];a.push(f.B(.08,.08,.84,.84,p.paper,{radius:6,rotation:v?2:-2}));a.push(f.B(.13,.13,.74,.72,p.soft,{radius:4,rotation:v?-3:3}));a.push(f.P(.18,.18,.64,.54,{radius:2,rotation:v?1:-1}));a.push(f.X('soft archive',.21,.77,.58,.06,.04,p.dark,{italic:true,align:'center'}));a.push(f.D('⌇',.82,.78,.055,p.accent));return a}
function circleFocus(format,p,v){const f=base(format,p),a=[];a.push(f.P(.05,.05,.90,.58,{radius:18}));a.push(f.P(.08,.69,.23,.18,{radius:999}));a.push(f.P(.38,.69,.23,.18,{radius:999}));a.push(f.P(.68,.69,.23,.18,{radius:999}));a.push(f.X(v?'three little things':'details',.10,.90,.80,.045,.032,p.dark,{align:'center',italic:true}));return a}
function magazineSplit(format,p,v){const f=base(format,p),a=[];a.push(f.P(v?.40:0,0,.60,1,{radius:0}));a.push(f.B(v?0:.62,0,.40,1,p.paper,{radius:0}));const x=v?.06:.66;a.push(f.X(v?'THE\nPHOTO\nEDIT':'THE\nWEEKEND\nFILE',x,.10,.30,.34,.065,p.dark,{bold:true,lineHeight:.9}));a.push(f.X('volume 01 / lately',x,.82,.28,.07,.022,p.accent,{letterSpacing:2}));return a}
function edgeCollage(format,p,v){const f=base(format,p),a=[];a.push(f.P(-.08,.06,.62,.46,{radius:2,rotation:v?-3:3}));a.push(f.P(.54,.18,.55,.40,{radius:2,rotation:v?4:-4}));a.push(f.P(.12,.57,.72,.35,{radius:2,rotation:v?-2:2}));a.push(f.X(v?'OUTSIDE THE LINES':'bits & pieces',.10,.03,.82,.06,.038,p.dark,{bold:v,italic:!v,align:'center'}));return a}
function receiptJournal(format,p,v){const f=base(format,p),a=[];a.push(f.P(.05,.05,.90,.58,{radius:4}));a.push(f.B(v?.10:.53,.58,.39,.34,p.paper,{radius:2,rotation:v?-4:4}));const x=v?.13:.56;a.push(f.X('TODAY / RECEIPT',x,.62,.34,.04,.022,p.dark,{bold:true,font:'Courier New, monospace'}));a.push(f.X('coffee\nwalk\nlate light\ngood company',x,.67,.30,.16,.022,p.dark,{font:'Courier New, monospace',lineHeight:1.35}));a.push(f.X('TOTAL   ♥',x,.84,.30,.04,.022,p.accent,{bold:true,font:'Courier New, monospace'}));return a}
function filmLadder(format,p,v){const f=base(format,p),a=[];a.push(f.B(0,0,1,1,'#111',{radius:0}));for(let i=0;i<4;i++)a.push(f.P(.09,.07+i*.225,.82,.18,{radius:0}));a.push(f.X(v?'ROLL 24 / NIGHT':'WASHI 400 / DAY',.09,.93,.70,.03,.018,'#f0a02a',{font:'Courier New, monospace',letterSpacing:2}));return a}
function lookbook(format,p,v){const f=base(format,p),a=[];a.push(f.P(.06,.08,.55,.67,{radius:0}));a.push(f.P(.65,.08,.29,.31,{radius:0}));a.push(f.P(.65,.44,.29,.31,{radius:0}));a.push(f.X(v?'LOOK / 02':'LOOK / 01',.06,.79,.36,.06,.04,p.dark,{bold:true,letterSpacing:3}));a.push(f.X('texture\nshape\ndetails',.67,.79,.24,.09,.022,p.dark,{lineHeight:1.25}));return a}
function tableNotes(format,p,v){const f=base(format,p),a=[];a.push(f.P(.04,.04,.92,.58,{radius:18}));for(let i=0;i<3;i++)a.push(f.P(.05+i*.31,.66,.28,.18,{radius:12}));a.push(f.X(v?'TABLE NOTES':'what we ordered',.06,.88,.48,.05,.033,p.dark,{bold:true}));a.push(f.X('taste • place • mood',.55,.89,.39,.04,.021,p.accent,{align:'right'}));return a}
function postcardGrid(format,p,v){const f=base(format,p),a=[];a.push(f.P(.04,.04,.92,.52,{radius:2}));a.push(f.P(.05,.61,.43,.25,{radius:2}));a.push(f.P(.52,.61,.43,.25,{radius:2}));a.push(f.X(v?'POSTCARD / 02':'wish you were here',.07,.89,.65,.05,.033,p.dark,{bold:v,italic:!v}));a.push(f.D('✈',.82,.88,.06,p.accent,{rotation:8}));return a}
function moodboardCorners(format,p,v){const f=base(format,p),a=[];a.push(f.P(.04,.04,.40,.32,{radius:3,rotation:-2}));a.push(f.P(.57,.05,.38,.28,{radius:3,rotation:3}));a.push(f.P(.05,.65,.36,.29,{radius:3,rotation:2}));a.push(f.P(.58,.64,.37,.30,{radius:3,rotation:-3}));a.push(f.B(.29,.34,.42,.29,p.paper,{radius:10}));a.push(f.X(v?'NEXT CHAPTER':'things I want more of',.33,.41,.34,.10,.038,p.dark,{bold:v,italic:!v,align:'center'}));return a}

function cWideWindow(slides,p,v){const f=cbase(slides,p),W=f.W,a=[];a.push(f.P(0,0,W,SH,{radius:0}));for(let i=1;i<slides;i++)a.push(f.B(i*SW-90,0,180,SH,p.paper,{radius:0,opacity:.9}));a.push(f.X(v?'KEEP MOVING':'one long afternoon',70,70,760,80,52,'#fff',{bold:v,italic:!v,effect:'shadow'}));return a}
function cEditorialRhythm(slides,p,v){const f=cbase(slides,p),W=f.W,a=[];a.push(f.B(0,0,W,SH,p.paper,{radius:0}));for(let i=0;i<slides;i++){const x=i*SW;if(i%2===0)a.push(f.P(x+80,80,660,1190,{radius:0}));else a.push(f.P(x+350,0,730,SH,{radius:0}));a.push(f.X(String(i+1).padStart(2,'0'),x+60,60,180,70,44,p.accent,{bold:true}))}a.push(f.X(v?'THE LONG EDIT':'A STORY IN FRAMES',SW*.78,460,SW*1.5,150,96,p.dark,{bold:true,letterSpacing:2}));return a}
function cPolaroidTrail(slides,p,v){const f=cbase(slides,p),a=[];a.push(f.B(0,0,f.W,SH,p.bg,{radius:0}));for(let i=0;i<slides*2;i++){const x=70+i*(SW*.48),y=i%2?390:150;a.push(f.B(x-18,y-18,500,690,p.paper,{radius:3,rotation:i%2?4:-4}));a.push(f.P(x,y,464,610,{radius:1,rotation:i%2?4:-4}))}a.push(f.X(v?'KEEP SWIPING':'little pieces',SW*.9,80,720,70,48,p.dark,{italic:!v,bold:v}));return a}
function cContactRibbon(slides,p,v){const f=cbase(slides,p),a=[];a.push(f.B(0,0,f.W,SH,p.paper,{radius:0}));const cols=slides*2;for(let i=0;i<cols*3;i++){const col=i%cols,row=Math.floor(i/cols);a.push(f.P(25+col*(SW/2),70+row*390,SW/2-50,340,{radius:2}))}a.push(f.B(0,SH-115,f.W,115,v?p.dark:p.accent,{radius:0}));a.push(f.X(v?'CONTACT ARCHIVE':'RECENT / 001',55,SH-88,600,45,28,v?'#fff':p.paper,{bold:true,font:'Courier New, monospace',letterSpacing:3}));return a}
function cTornStory(slides,p,v){const f=cbase(slides,p),a=[];a.push(f.P(0,0,f.W,SH,{radius:0}));a.push(f.B(0,SH*.36,f.W,180,p.paper,{rotation:-2,radius:0}));a.push(f.B(0,SH*.68,f.W,145,p.paper,{rotation:2,radius:0}));a.push(f.X(v?'BETWEEN PLACES':'one story / many little frames',SW*.55,SH*.43,SW*1.5,100,58,p.dark,{italic:!v,bold:v,align:'center'}));return a}
function cPhotoNotes(slides,p,v){const f=cbase(slides,p),a=[];a.push(f.P(0,0,f.W,SH,{radius:0,opacity:.86}));for(let i=0;i<slides;i++){const x=i*SW+120,y=160+(i%2)*130;a.push(f.B(x,y,530,330,p.paper,{rotation:i%2?4:-4,radius:4}));a.push(f.X(['a detail','a place','a feeling','a note'][i%4],x+45,y+70,440,80,46,p.dark,{italic:true,align:'center'}))}return a}
function cColorGallery(slides,p,v){const f=cbase(slides,p),a=[];const colors=[p.accent,p.soft,p.bg,p.dark];for(let i=0;i<slides;i++){const x=i*SW;a.push(f.B(x,0,SW,SH,colors[i%colors.length],{radius:0}));a.push(f.P(x+(i%2?320:90),170,i%2?670:760,980,{radius:v?0:28}));a.push(f.X(`0${i+1}`,x+60,60,180,70,44,i%2?p.paper:p.dark,{bold:true}))}return a}
function cFilmRoll(slides,p,v){const f=cbase(slides,p),a=[];a.push(f.B(0,0,f.W,SH,'#0d0d0e',{radius:0}));for(let i=0;i<slides*2;i++)a.push(f.P(35+i*(SW/2),145,SW/2-70,1030,{radius:0}));for(let i=0;i<slides;i++)a.push(f.X(`${v?'NIGHT':'DAY'} ${String(i+1).padStart(2,'0')}`,i*SW+45,70,320,42,23,'#e7a14b',{font:'Courier New, monospace',bold:true,letterSpacing:2}));return a}

const singles=[
 ['hero-strip','Hero + Mini Strip','Photo Dump',heroStrip,['photo dump','hero','strip','recap']],
 ['staggered-duo','Staggered Travel Duo','Travel',staggeredDuo,['travel','asymmetric','editorial']],
 ['picture-in-picture','Picture in Picture','Editorial',pictureInPicture,['photo on photo','overlay','editorial']],
 ['asym-grid','Asymmetric Five','Photo Dump',asymGrid,['grid','camera roll','five photos']],
 ['twin-columns','Twin Column Story','Photo Dump',twinColumns,['columns','minimal','three photos']],
 ['contact-caption','Contact Caption','Film',contactCaption,['contact sheet','film','archive']],
 ['window-stack','Layered Window','Scrapbook',windowStack,['paper','layers','window']],
 ['circle-focus','Circle Details','Moodboard',circleFocus,['circles','details','moodboard']],
 ['magazine-split','Magazine Split','Editorial',magazineSplit,['magazine','split','type']],
 ['edge-collage','Outside the Edges','Scrapbook',edgeCollage,['edge bleed','collage','freeform']],
 ['receipt-journal','Receipt Journal','Journal',receiptJournal,['receipt','journal','memory']],
 ['film-ladder','Film Ladder','Film',filmLadder,['film','vertical','frames']],
 ['lookbook','Lookbook Notes','Fashion',lookbook,['fashion','lookbook','editorial']],
 ['table-notes','Table Notes','Food',tableNotes,['food','restaurant','photo diary']],
 ['postcard-grid','Postcard Three','Travel',postcardGrid,['postcard','travel','three photos']],
 ['moodboard-corners','Corner Moodboard','Vision Board',moodboardCorners,['moodboard','goals','four photos']]
];
const carousels=[
 ['wide-window','Wide Window Flow',cWideWindow,['panorama','continuous','full bleed']],
 ['editorial-rhythm','Editorial Rhythm',cEditorialRhythm,['editorial','rhythm','type']],
 ['polaroid-trail','Polaroid Trail',cPolaroidTrail,['polaroid','trail','scrapbook']],
 ['contact-ribbon','Contact Ribbon',cContactRibbon,['contact','grid','film']],
 ['torn-story','Torn Story Flow',cTornStory,['torn paper','story','continuous']],
 ['photo-notes','Photo Notes Flow',cPhotoNotes,['notes','travel','overlay']],
 ['color-gallery','Color Gallery',cColorGallery,['color block','gallery','editorial']],
 ['film-roll','Continuous Film Roll',cFilmRoll,['film','roll','continuous']]
];

const fresh=[];
for(const [slug,title,category,builder,tags] of singles){
 for(let v=0;v<2;v++){
  const format=v?'story':'portrait',p=palettes[(fresh.length+v*2)%palettes.length];
  fresh.push({
   id:`curated-${slug}-${v+1}`,
   title:`${title} · ${v?'Story':'Portrait'}`,
   category,format,collection:COLLECTION,source:'washi-curated-studio',addedAt:ADDED,
   tags:['curated','photo-forward','creative','editable',...tags,format,p.name.toLowerCase()],
   bg:{type:'solid',value:p.bg},
   objects:builder(format,p,v)
  });
 }
}
for(const [slug,title,builder,tags] of carousels){
 for(let v=0;v<2;v++){
  const slides=v?4:3,p=palettes[(fresh.length+v*3)%palettes.length],objects=builder(slides,p,v);
  fresh.push({
   id:`curated-carousel-${slug}-${v+1}`,
   title:`${title} · ${slides} Slides`,
   category:'Seamless Carousel',format:'portrait',collection:COLLECTION,source:'washi-curated-studio',addedAt:ADDED,
   tags:['curated','carousel','seamless','photo-forward','creative','editable',...tags,`${slides} slides`,p.name.toLowerCase()],
   bg:{type:'solid',value:p.bg},objects,
   carousel:{enabled:true,slideCount:slides,slideWidth:SW,slideHeight:SH,durations:Array(slides).fill(3),activeSlide:0,view:'slide'}
  });
 }
}

const existing=new Set(kept.map(t=>String(t.id)));
const added=fresh.filter(t=>!existing.has(String(t.id)));
T.TEMPLATES.splice(0,T.TEMPLATES.length,...added,...kept);
T.TEMPLATE_COUNT=T.TEMPLATES.length;
T.CATEGORIES=[...new Set(T.TEMPLATES.map(t=>t.category))];
T.COLLECTIONS=[...new Set(T.TEMPLATES.map(t=>t.collection).filter(Boolean))];

W.TemplateCuration={
 version:'2026.08.16-curated1',
 before,
 removed:removed.map(t=>t.id),
 removedFamilies:[...REMOVE_FAMILIES],
 added:added.map(t=>t.id),
 after:T.TEMPLATES.length,
 collection:COLLECTION
};
window.dispatchEvent(new CustomEvent('washi:template-curation-ready',{detail:{before,removed:removed.length,added:added.length,after:T.TEMPLATES.length}}));
})();