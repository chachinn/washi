  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const uid = (prefix = "id") => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const deepClone = obj => JSON.parse(JSON.stringify(obj));
  const now = () => new Date().toISOString();
  const escapeHTML = value => String(value ?? "").replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
  const debounce = (fn, ms = 180) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };

  const FORMATS = {
    story: {label:"Instagram Story", width:1080, height:1920, ratio:"9:16"},
    portrait: {label:"Portrait Post", width:1080, height:1350, ratio:"4:5"},
    square: {label:"Square Post", width:1080, height:1080, ratio:"1:1"},
    reel: {label:"Reel / TikTok Cover", width:1080, height:1920, ratio:"9:16"},
    dump: {label:"Photo Dump", width:1080, height:1350, ratio:"4:5"}
  };

  const COLORS = ["#ffffff","#fff6fa","#fde8f0","#f8bfd1","#e780a0","#cc5a80","#4b3540","#f6e1d2","#dce8ef","#dfe8da","#eee3f6","#fff0c7"];
  const STICKERS = ["♡","♥","✦","✧","★","☆","☁","☾","☀","❀","✿","❁","🎀","🌸","🍓","🍒","✨","💌","🧸","📎","📍","🎞️","📷","🎧","☕","🍰","🫧","🪩","🦢","🩰","🌷","💿","🧁","🎂","✈️","🗺️","💭","↗","→","↘","⌁","〰","♡♡"];
  const SYSTEM_FONTS = [
    {name:"Rounded", value:'ui-rounded, "SF Pro Rounded", system-ui'},
    {name:"Clean", value:'Inter, system-ui, sans-serif'},
    {name:"Editorial", value:'Georgia, "Times New Roman", serif'},
    {name:"Classic", value:'"Times New Roman", serif'},
    {name:"Typewriter", value:'"Courier New", monospace'},
    {name:"Handwritten", value:'"Comic Sans MS", "Bradley Hand", cursive'},
    {name:"Soft", value:'Trebuchet MS, sans-serif'},
    {name:"Modern", value:'Arial, Helvetica, sans-serif'}
  ];
  const TEXT_EFFECTS = ["none","outline","shadow","glow","highlight","sticker","arc","wave"];
  const FILTER_PRESETS = {
    none:{label:"Original",filter:"none"},
    soft:{label:"Soft Pink",filter:"brightness(1.04) contrast(.94) saturate(.92) sepia(.06)"},
    film:{label:"Warm Film",filter:"contrast(.96) saturate(.86) sepia(.18) brightness(1.02)"},
    digicam:{label:"Digicam",filter:"contrast(1.12) saturate(1.18) brightness(1.03)"},
    faded:{label:"Faded Summer",filter:"contrast(.87) saturate(.78) brightness(1.08)"},
    cool:{label:"Cool Film",filter:"contrast(.98) saturate(.86) hue-rotate(8deg) brightness(1.02)"},
    bw:{label:"B&W",filter:"grayscale(1) contrast(1.06)"},
    newspaper:{label:"Newspaper",filter:"grayscale(1) contrast(1.35) brightness(1.08)"},
    dreamy:{label:"Dreamy",filter:"brightness(1.08) contrast(.9) saturate(.9) blur(.3px)"}
  };

  const PROMPTS = [
    "Pick four photos from this week and make a ‘little things lately’ story.",
    "Choose one photo you almost forgot about and write why you still love it.",
    "Make a three-slide ‘currently’ set: listening, craving, and looking forward to.",
    "Turn your camera roll into a messy scrapbook with one tiny handwritten caption per photo.",
    "Make a mini weekend recap: where you went, what you ate, and the moment you want to keep.",
    "Create a story with only one photo, one sentence, and one color pulled from the photo.",
    "Build a ‘tiny joys’ collage with six ordinary things that made your day better.",
    "Make a fake receipt that lists everything you loved about today.",
    "Create a ‘what’s in my camera roll’ contact sheet with a big date stamp.",
    "Make a travel postcard using one landscape photo, a location, and a tiny diary note."
  ];

  const textObj = (text,x,y,w,h,size=66,color="#4b3540",opts={}) => ({
    id:uid("txt"),type:"text",name:opts.name||text.slice(0,24)||"Text",x,y,w,h,rotation:opts.rotation||0,opacity:1,locked:false,visible:true,
    text,font:opts.font||SYSTEM_FONTS[0].value,fontName:opts.fontName||"Rounded",fontSize:size,color,align:opts.align||"left",bold:opts.bold??true,italic:opts.italic||false,
    letterSpacing:opts.letterSpacing||0,lineHeight:opts.lineHeight||1.1,effect:opts.effect||"none",outline:opts.outline||"#ffffff",shadow:opts.shadow||"rgba(75,53,64,.24)",
    background:opts.background||"transparent",radius:opts.radius||0,animation:opts.animation||"none"
  });
  const shapeObj = (x,y,w,h,fill="#f8bfd1",shape="rect",opts={}) => ({id:uid("shape"),type:"shape",name:opts.name||"Shape",x,y,w,h,rotation:opts.rotation||0,opacity:opts.opacity??1,locked:false,visible:true,shape,fill,border:opts.border||"transparent",borderWidth:opts.borderWidth||0,radius:opts.radius??(shape==="circle"?999:24),animation:"none"});
  const placeholderObj = (x,y,w,h,label="Add photo",opts={}) => ({id:uid("slot"),type:"placeholder",name:opts.name||label,x,y,w,h,rotation:opts.rotation||0,opacity:1,locked:false,visible:true,label,radius:opts.radius||18,mediaId:null,mediaType:null,fit:"cover",filter:"none",animation:"none"});
  const stickerObj = (content,x,y,size=90,opts={}) => ({id:uid("stk"),type:"sticker",name:`Sticker ${content}`,x,y,w:size,h:size,rotation:opts.rotation||0,opacity:1,locked:false,visible:true,content,color:opts.color||"#c34f77",fontSize:size*.78,animation:opts.animation||"none"});
