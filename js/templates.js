(() => {
  'use strict';

  const W = window.Washi = window.Washi || {};
  const { uid, clone } = W.DB;

  const F = {
    story: { label: 'Story', w: 1080, h: 1920 },
    portrait: { label: 'Portrait post', w: 1080, h: 1350 },
    square: { label: 'Square post', w: 1080, h: 1080 },
    reel: { label: 'Reel cover', w: 1080, h: 1920 },
    dump: { label: 'Photo dump', w: 1080, h: 1350 }
  };

  const text = (value, x, y, w, h, size = 80, color = '#4b3740', font = 'Georgia, serif', extra = {}) => ({
    id: uid('obj'), type: 'text', text: value, x, y, w, h, fontSize: size, color, font,
    align: 'left', bold: false, italic: false, letterSpacing: 0, lineHeight: 1.05,
    opacity: 1, rotation: 0, visible: true, locked: false, effect: 'none', ...extra
  });

  const shape = (x, y, w, h, fill = '#fdeef4', radius = 30, extra = {}) => ({
    id: uid('obj'), type: 'shape', shape: 'rect', x, y, w, h, fill, border: '#ffffff',
    borderWidth: 0, radius, opacity: 1, rotation: 0, visible: true, locked: false, ...extra
  });

  const sticker = (content, x, y, size = 90, extra = {}) => ({
    id: uid('obj'), type: 'sticker', content, x, y, w: size, h: size, fontSize: size * .8,
    color: '#c84f77', opacity: 1, rotation: 0, visible: true, locked: false, ...extra
  });

  const photo = (x, y, w, h, radius = 28, rotation = 0, label = 'Add photo') => ({
    id: uid('obj'), type: 'placeholder', x, y, w, h, radius, rotation, label,
    fit: 'cover', opacity: 1, visible: true, locked: false
  });

  const QUICK_TEXT = [
    'life lately', 'little things lately', 'August so far', 'POV: a very good day',
    'things I never want to forget', 'currently obsessed with', 'tiny joys', 'my week in photos',
    'one photo every day', 'what’s in my camera roll', 'a day worth remembering', 'currently listening',
    'weekend recap', 'places I want to go', 'our month ♡', 'photo dump ✦', 'today was…',
    'a very good day', 'currently', 'on repeat', 'small things, big feelings', 'soft moments',
    'the week according to my camera roll', 'recently', 'bits & pieces', 'this made me smile',
    'proof I went outside', 'a few things I loved', 'my current favorites', 'today in four photos',
    'weekend in six frames', 'what I ate today', 'outfit of the day', 'things on my mind',
    'notes from today', 'places I’d go back to', 'my favorite part', 'before I forget',
    'somewhere between here and there', 'another day, another little memory', 'today’s tiny win',
    'my mood lately', 'a page from my life', 'good things from this week', 'currently craving',
    'a little reminder', 'things worth romanticizing', 'today’s soundtrack', 'my comfort things',
    'week in review', 'monthly reset', 'what made this month mine', 'favorite people lately',
    'little adventures', 'postcards from lately', 'one thing at a time', 'my soft life era',
    'what I’m looking forward to', 'the ordinary was lovely', 'photos I almost forgot',
    'a few scenes from today', 'camera roll therapy', 'current chapter', 'days like this',
    'just because ♡', 'this week felt like', 'notes to future me', 'things I want more of'
  ];

  const STICKERS = [
    '♡','♥','✦','✧','★','☆','✿','❀','🎀','🍓','🍒','🌷','🌸','☁️','✨','💌','🎞️','📷','✈️','☕','🎧','☺','→','↳','○','⌁','〰','⋆','୨୧','♡̷',
    '🧸','🍰','🧁','🍵','🍜','🥐','🍋','🍑','🍎','🌙','☀️','🌼','🌿','🪻','🦋','🐚','🫧','🎟️','🎫','📮','📍','🗺️','🧳','🏷️','📝','📎','📌','✂️','📼','💿','📻','🎵','🎤','🪩','🎬','🎨','🖍️','🪄','🧷','🔖','🕯️','🪞','🛍️','💄','👟','👗','🍽️','🥂','🎂','🎈','🎁','💐','💍','💒','🏖️','🌊','⛰️','🚃','🚲','🏃','🏋️','🏀','⚽','🎾','📚','💡','✅','❓','💭','💬','📅','🕒','♡︎','✶','✷','✹','𐙚','୭ৎ','꩜','⌇','⋆｡°✩'
  ];

  const TAPE_COLORS = [
    'rgba(246,170,194,.72)', 'rgba(225,200,246,.74)', 'rgba(250,221,150,.74)',
    'rgba(190,226,218,.74)', 'rgba(207,207,207,.68)', 'rgba(238,190,166,.72)',
    'rgba(188,209,238,.72)', 'rgba(205,191,170,.68)', 'rgba(236,220,206,.76)'
  ];

  const PALETTES = [
    { name: 'Blush', colors: ['#fff8fb','#fdeef4','#f7b7c9','#dc6b8e','#7b5361'] },
    { name: 'Lavender Milk', colors: ['#fffaff','#f1e8fb','#dbc7ef','#aa89c7','#65526f'] },
    { name: 'Film Cream', colors: ['#fffaf0','#eadcc7','#c8a98d','#8a6f61','#3e3431'] },
    { name: 'Soft Summer', colors: ['#fff5f0','#f6c7b9','#e5a98e','#8fb6b1','#546d69'] },
    { name: 'Night Rose', colors: ['#2c2328','#5e3d4b','#a85575','#e8a6bd','#fff0f5'] },
    { name: 'Sakura Milk', colors: ['#fffafb','#fbe5ec','#f2a9c0','#cb6689','#674650'] },
    { name: 'Matcha Paper', colors: ['#fbfcf4','#e7ebd2','#b7c49a','#71805c','#394333'] },
    { name: 'Sky Letter', colors: ['#f8fbff','#dcecff','#a8caed','#668fb7','#3e5368'] },
    { name: 'Peach Sorbet', colors: ['#fff9f5','#fee4d7','#f7b59a','#d97961','#714b43'] },
    { name: 'Butter', colors: ['#fffdf4','#f8efc5','#eed77a','#b89739','#5d512e'] },
    { name: 'Cherry Pop', colors: ['#fff7f8','#ffd8de','#ef6680','#bd294d','#5c2632'] },
    { name: 'Ink & Ivory', colors: ['#fffdf7','#ede7da','#aaa095','#514b46','#1d1b1a'] }
  ];

  const THEMES = [
    {slug:'blush-paper',name:'Blush Paper',bg:'#fff8fb',paper:'#fffdfd',ink:'#5f4650',accent:'#d7668b',accent2:'#f3b9cb',head:'Georgia, serif',body:'system-ui',radius:30,deco:'♡'},
    {slug:'linen-cream',name:'Linen Cream',bg:'#fbf6ed',paper:'#fffdf8',ink:'#554b42',accent:'#b58a68',accent2:'#dfc9ae',head:'Georgia, serif',body:'system-ui',radius:18,deco:'✦'},
    {slug:'film-beige',name:'Film Beige',bg:'#eee3d4',paper:'#f9f4ea',ink:'#413833',accent:'#8d6d5d',accent2:'#c9ad95',head:'Courier New, monospace',body:'Courier New, monospace',radius:4,deco:'🎞️'},
    {slug:'soft-rose',name:'Soft Rose',bg:'#f8e8ed',paper:'#fff9fb',ink:'#6c4f5b',accent:'#c36b88',accent2:'#e9b8c9',head:'Georgia, serif',body:'system-ui',radius:36,deco:'🌷'},
    {slug:'sakura-milk',name:'Sakura Milk',bg:'#fff5f8',paper:'#fffdfd',ink:'#664851',accent:'#d66d8f',accent2:'#f5c7d5',head:'Georgia, serif',body:'Trebuchet MS, sans-serif',radius:28,deco:'🌸'},
    {slug:'lavender-haze',name:'Lavender Haze',bg:'#f6f1fb',paper:'#fffaff',ink:'#5e5169',accent:'#9b76b8',accent2:'#d9c6eb',head:'Georgia, serif',body:'system-ui',radius:32,deco:'✧'},
    {slug:'matcha-paper',name:'Matcha Paper',bg:'#f4f6ea',paper:'#fcfdf7',ink:'#48513d',accent:'#758562',accent2:'#cbd4b9',head:'Georgia, serif',body:'system-ui',radius:20,deco:'🌿'},
    {slug:'sky-blue',name:'Sky Letter',bg:'#f4f9ff',paper:'#ffffff',ink:'#45596c',accent:'#719fc6',accent2:'#c3ddf4',head:'Georgia, serif',body:'system-ui',radius:26,deco:'☁️'},
    {slug:'peach-sorbet',name:'Peach Sorbet',bg:'#fff4ef',paper:'#fffaf7',ink:'#694c43',accent:'#dc8066',accent2:'#f4bfaa',head:'Georgia, serif',body:'Trebuchet MS, sans-serif',radius:34,deco:'🍑'},
    {slug:'butter-yellow',name:'Butter Yellow',bg:'#fff9dc',paper:'#fffdf4',ink:'#5f552f',accent:'#c79c32',accent2:'#f0d77b',head:'Georgia, serif',body:'system-ui',radius:24,deco:'☀️'},
    {slug:'charcoal-editorial',name:'Charcoal Editorial',bg:'#232123',paper:'#f6f1eb',ink:'#f9f6f2',accent:'#f2a8c0',accent2:'#6d6268',head:'Georgia, serif',body:'system-ui',radius:6,deco:'✦'},
    {slug:'ink-ivory',name:'Ink & Ivory',bg:'#f9f5ec',paper:'#fffdf7',ink:'#282421',accent:'#695c50',accent2:'#c7baaa',head:'Georgia, serif',body:'Courier New, monospace',radius:2,deco:'•'},
    {slug:'cherry-pop',name:'Cherry Pop',bg:'#fff0f3',paper:'#fff9fa',ink:'#592b38',accent:'#d9315b',accent2:'#f39ab0',head:'Trebuchet MS, sans-serif',body:'system-ui',radius:26,deco:'🍒'},
    {slug:'y2k-candy',name:'Y2K Candy',bg:'#f6e7ff',paper:'#fff8ff',ink:'#5c3e70',accent:'#e754c7',accent2:'#7cccf5',head:'Trebuchet MS, sans-serif',body:'system-ui',radius:40,deco:'🫧'},
    {slug:'digicam-flash',name:'Digicam Flash',bg:'#dbe5ec',paper:'#f9fbfc',ink:'#20262a',accent:'#ff5c86',accent2:'#7ca3bd',head:'Courier New, monospace',body:'Courier New, monospace',radius:2,deco:'📷'},
    {slug:'warm-retro',name:'Warm Retro',bg:'#efe0c8',paper:'#f8f0df',ink:'#503d2d',accent:'#c26845',accent2:'#d9a66d',head:'Georgia, serif',body:'Courier New, monospace',radius:12,deco:'✶'},
    {slug:'cool-minimal',name:'Cool Minimal',bg:'#eef2f4',paper:'#ffffff',ink:'#37434b',accent:'#7793a1',accent2:'#cbd7dd',head:'system-ui',body:'system-ui',radius:16,deco:'○'},
    {slug:'coffee-journal',name:'Coffee Journal',bg:'#eee4d8',paper:'#fbf7f1',ink:'#54463d',accent:'#8a6650',accent2:'#cfb29d',head:'Georgia, serif',body:'Courier New, monospace',radius:18,deco:'☕'},
    {slug:'sage-studio',name:'Sage Studio',bg:'#edf2e9',paper:'#fbfdf9',ink:'#485346',accent:'#7a9072',accent2:'#c3d2bd',head:'Georgia, serif',body:'system-ui',radius:28,deco:'🌿'},
    {slug:'night-plum',name:'Night Plum',bg:'#2c202d',paper:'#4a3549',ink:'#fff4fb',accent:'#e7a2c9',accent2:'#835e82',head:'Georgia, serif',body:'system-ui',radius:30,deco:'🌙'}
  ];

  const RECIPES = [
    ['life-lately','Life Lately','Photo Dump','collage','portrait','life lately','the little things I want to remember',['dump','lifestyle','camera roll']],
    ['little-things','Little Things Lately','Photo Dump','collage','story','little things lately','small moments, kept here',['dump','cute','daily']],
    ['weekend-recap','Weekend Recap','Photo Dump','grid','story','weekend recap','a few frames from a very good weekend',['weekend','photos','recap']],
    ['camera-roll','Camera Roll','Photo Dump','contact','portrait','camera roll','recently, according to my photos',['photos','gallery','dump']],
    ['one-photo-day','One Photo Every Day','Recap','calendar','story','one photo every day','a tiny archive of ordinary days',['calendar','daily','recap']],
    ['month-in-photos','Month in Photos','Recap','grid','portrait','this month','a month of little moments',['month','calendar','recap']],
    ['year-so-far','Year So Far','Recap','collage','story','year so far','more to come ✦',['year','recap','memories']],
    ['birthday-bits','Birthday Bits','Birthday','collage','story','birthday bits','another trip around the sun ♡',['birthday','party','recap']],
    ['birthday-invite','Birthday Invitation','Birthday','invite','story','you’re invited','birthday celebration',['birthday','invitation','party']],
    ['wedding-moments','Wedding Moments','Wedding','collage','story','the best day','little pieces of a beautiful day',['wedding','love','photos']],
    ['save-the-date','Save the Date','Wedding','invite','story','save the date','a day to remember',['wedding','invitation','date']],
    ['our-month','Our Month','Couples','collage','story','our month ♡','favorite memories with you',['couple','love','month']],
    ['date-night','Date Night','Couples','review','portrait','date night','where we went • what we loved',['couple','date','review']],
    ['best-friends','Best Friends','Friends','polaroid','story','best friends','proof we always take too many photos',['friends','friendship','photos']],
    ['friendship-dump','Friendship Dump','Friends','collage','portrait','us lately','favorite people, favorite moments',['friends','dump','memories']],
    ['travel-diary','Travel Diary','Travel','journal','story','travel diary','places, food, little details',['travel','diary','trip']],
    ['boarding-pass','Boarding Pass','Travel','ticket','story','boarding pass','from here to somewhere lovely',['travel','ticket','flight']],
    ['postcard','Postcard','Travel','postcard','portrait','wish you were here','postcard from somewhere lovely',['travel','postcard','memory']],
    ['passport-stamps','Passport Stamps','Travel','stamps','story','places I went','collecting little pieces of the world',['travel','passport','stamps']],
    ['48-hours','48 Hours In…','Travel','timeline','story','48 hours in…','a tiny itinerary',['travel','itinerary','city']],
    ['food-diary','Food Diary','Food','grid','story','what I ate','the good stuff',['food','restaurant','diary']],
    ['recipe-card','Recipe Card','Food','recipe','portrait','made with love','save this recipe',['food','recipe','cooking']],
    ['cafe-review','Cafe Review','Food','review','story','café of the day','drink • food • vibe • rating',['food','cafe','review']],
    ['ootd','Outfit of the Day','Fashion','editorial','story','outfit of the day','details • mood • where it’s from',['fashion','ootd','style']],
    ['style-guide','Style Guide','Fashion','moodboard','story','style notes','textures, colors, pieces I love',['fashion','moodboard','style']],
    ['beauty-routine','Beauty Routine','Beauty','list','story','beauty routine','the little lineup',['beauty','routine','products']],
    ['skincare-shelf','Skincare Shelf','Beauty','grid','portrait','on my shelf','current skincare rotation',['beauty','skincare','products']],
    ['quote-day','Quote of the Day','Quotes','quote','story','quote of the day','write something worth keeping',['quote','text','minimal']],
    ['affirmation','Daily Affirmation','Quotes','quote','story','a little reminder','you are allowed to take your time',['affirmation','wellness','text']],
    ['currently','Currently','Prompts','prompt','story','currently','listening • watching • reading • craving',['prompt','currently','interactive']],
    ['get-to-know-me','Get to Know Me','Prompts','prompt','story','get to know me','favorites • habits • little facts',['prompt','about me','questions']],
    ['ask-me-anything','Ask Me Anything','Prompts','question','story','ask me anything','drop a question here',['questions','interactive','prompt']],
    ['this-or-that','This or That','Story Game','thisthat','story','this or that','pick one',['game','interactive','choice']],
    ['bingo','Little Things Bingo','Story Game','bingo','story','little things bingo','mark your squares',['game','bingo','interactive']],
    ['tier-list','Tier List','Story Game','tier','story','tier list','rank your favorites',['game','ranking','interactive']],
    ['ranking','Rank It','Story Game','ranking','story','rank it','best to… still good',['game','rating','interactive']],
    ['vision-board','Vision Board','Vision Board','moodboard','story','vision board','what I want more of',['goals','moodboard','manifest']],
    ['moodboard','Moodboard','Moodboard','moodboard','portrait','moodboard','colors • textures • feelings',['moodboard','aesthetic','inspiration']],
    ['goals','Goals & Intentions','Vision Board','list','story','goals & intentions','a gentle list for what’s next',['goals','planning','vision']],
    ['notes-app','Notes App Story','Faux UI','notes','story','Notes','life lately',['notes','ui','text']],
    ['messages','Text Message Story','Faux UI','chat','story','Messages','a tiny conversation',['messages','chat','ui']],
    ['music-player','Currently Listening','Faux UI','music','story','currently listening','song title • artist',['music','player','playlist']],
    ['search-bar','Search Story','Faux UI','search','story','searching for…','little things that make life better',['search','ui','prompt']],
    ['calendar-story','Calendar Story','Faux UI','calendar','story','this week','little plans worth looking forward to',['calendar','planner','ui']],
    ['editorial-cover','Editorial Cover','Editorial','editorial','portrait','WASHI','the little things issue',['magazine','editorial','fashion']],
    ['newspaper','Little Newspaper','Editorial','newspaper','portrait','THE DAILY LITTLE','small moments worth keeping',['newspaper','editorial','journal']],
    ['film-strip','Film Strip','Film','filmstrip','story','on film','four frames, one day',['film','strip','photos']],
    ['polaroid-stack','Polaroid Stack','Film','polaroid','story','a very good day','photos I want to keep',['polaroid','film','photos']],
    ['photobooth','Photobooth Strip','Film','photobooth','story','photobooth','four tiny frames',['photobooth','film','friends']],
    ['contact-sheet','Contact Sheet','Film','contact','portrait','CONTACT SHEET','WASHI / 400 ISO',['film','grid','photos']],
    ['scrapbook','Washi Scrapbook','Scrapbook','scrapbook','portrait','little pieces','cut • paste • keep',['scrapbook','washi','tape']],
    ['ripped-paper','Ripped Paper Story','Scrapbook','ripped','story','pieces of today','torn paper, taped memories',['scrapbook','ripped','paper']],
    ['product-launch','Product Launch','Marketing','marketing','story','new drop','introducing something lovely',['business','product','launch']],
    ['sale','Sale Announcement','Marketing','marketing','story','special offer','limited time only',['business','sale','promotion']],
    ['testimonial','Customer Love','Marketing','review','story','kind words','a little love from our community',['business','testimonial','review']],
    ['event-countdown','Event Countdown','Announcement','countdown','story','coming soon','save the date',['event','countdown','announcement']],
    ['new-post','New Post','Announcement','announcement','story','new post','tap to see what’s new',['announcement','creator','post']],
    ['fitness-plan','Fitness Plan','Sports & Fitness','list','story','this week’s movement','move • rest • repeat',['fitness','workout','plan']],
    ['workout-recap','Workout Recap','Sports & Fitness','score','story','workout recap','today’s little win',['fitness','workout','recap']],
    ['match-day','Match Day','Sports & Fitness','score','story','MATCH DAY','team • time • place',['sports','match','score']]
  ].map(([slug,title,category,layout,format,lead,body,tags]) => ({slug,title,category,layout,format,lead,body,tags}));

  const seeded = seed => {
    let s = (seed >>> 0) || 1;
    return () => ((s = Math.imul(1664525, s) + 1013904223 >>> 0) / 4294967296);
  };
  const pick = (arr, r) => arr[Math.floor(r() * arr.length) % arr.length];
  const rot = r => Math.round((r() * 8 - 4) * 10) / 10;
  const fmt = id => F[id] || F.story;

  function baseTitle(recipe, theme, x, y, w, size, extra = {}) {
    return text(recipe.lead, x, y, w, size * 1.35, size, theme.ink, theme.head, { italic: theme.head.includes('Georgia'), ...extra });
  }

  const LAYOUTS = {
    collage(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [baseTitle(recipe,theme,W*.07,H*.045,W*.82,W*.085),photo(W*.07,H*.17,W*.39,H*.29,theme.radius,rot(r)),photo(W*.52,H*.14,W*.41,H*.24,theme.radius,rot(r)),photo(W*.5,H*.43,W*.42,H*.31,theme.radius,rot(r)),photo(W*.08,H*.51,W*.35,H*.22,theme.radius,rot(r)),sticker(theme.deco,W*.82,H*.06,W*.09,{rotation:rot(r)}),text(recipe.body,W*.08,H*.79,W*.84,H*.09,W*.043,theme.ink,theme.body,{align:'center'})] },
    grid(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format),cols=recipe.format==='portrait'?3:2,rows=recipe.format==='portrait'?2:3,g=W*.035,cw=(W-g*(cols+1))/cols,top=H*.18,ch=(H*.62-g*(rows-1))/rows;const a=[baseTitle(recipe,theme,W*.06,H*.045,W*.88,W*.075,{align:'center',bold:true})];for(let i=0;i<cols*rows;i++)a.push(photo(g+(i%cols)*(cw+g),top+Math.floor(i/cols)*(ch+g),cw,ch,theme.radius*.55,0,`Photo ${i+1}`));a.push(text(recipe.body,W*.08,H*.84,W*.84,H*.08,W*.038,theme.ink,theme.body,{align:'center'}));return a},
    contact(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format),cols=3,rows=3,g=W*.035,cw=(W-g*(cols+1))/cols,top=H*.15,ch=H*.19;const a=[text(recipe.lead.toUpperCase(),W*.05,H*.04,W*.9,H*.06,W*.052,theme.ink,'Courier New, monospace',{bold:true,letterSpacing:4})];for(let i=0;i<9;i++)a.push(photo(g+(i%3)*(cw+g),top+Math.floor(i/3)*(ch+g),cw,ch,2,0,`Frame ${String(i+1).padStart(2,'0')}`));a.push(text(recipe.body.toUpperCase(),W*.05,H*.88,W*.9,H*.05,W*.028,theme.ink,'Courier New, monospace',{letterSpacing:3}));return a},
    calendar(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format),g=W*.035,cw=(W-g*4)/3,top=H*.19,ch=H*.18;const a=[baseTitle(recipe,theme,W*.06,H*.05,W*.88,W*.075,{bold:true}),text('MON   TUE   WED   THU   FRI   SAT   SUN',W*.06,H*.135,W*.88,H*.04,W*.025,theme.ink,'Courier New, monospace',{align:'center',letterSpacing:2})];for(let i=0;i<9;i++)a.push(photo(g+(i%3)*(cw+g),top+Math.floor(i/3)*(ch+g),cw,ch,theme.radius*.45,rot(r),`Day ${i+1}`));a.push(text(recipe.body,W*.08,H*.84,W*.84,H*.08,W*.038,theme.ink,theme.body,{align:'center'}));return a},
    invite(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [shape(W*.08,H*.08,W*.84,H*.82,theme.paper,theme.radius),sticker(theme.deco,W*.45,H*.12,W*.1),text(recipe.lead.toUpperCase(),W*.13,H*.24,W*.74,H*.1,W*.075,theme.accent,theme.head,{bold:true,align:'center',letterSpacing:3}),photo(W*.21,H*.39,W*.58,H*.27,theme.radius*.7,0),text(recipe.body,W*.15,H*.71,W*.7,H*.07,W*.04,theme.ink,theme.body,{align:'center'}),text('DATE  •  TIME  •  PLACE',W*.15,H*.8,W*.7,H*.05,W*.03,theme.ink,'Courier New, monospace',{align:'center',letterSpacing:2})]},
    review(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [baseTitle(recipe,theme,W*.07,H*.05,W*.86,W*.08,{bold:true}),photo(W*.07,H*.18,W*.86,H*.45,theme.radius,0),text(recipe.body,W*.08,H*.67,W*.84,H*.07,W*.037,theme.ink,theme.body),shape(W*.08,H*.76,W*.84,H*.09,theme.paper,theme.radius*.6),text('★★★★★',W*.12,H*.78,W*.76,H*.05,W*.05,theme.accent,theme.body,{align:'center',letterSpacing:8})]},
    polaroid(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);const a=[baseTitle(recipe,theme,W*.08,H*.04,W*.84,W*.075)];[[.13,.18,.68,.34,-5],[.22,.47,.66,.33,5],[.09,.72,.52,.23,-3]].forEach((p,i)=>{a.push(shape(W*p[0]-W*.025,H*p[1]-H*.018,W*p[2]+W*.05,H*p[3]+H*.06,theme.paper,4,{rotation:p[4]}));a.push(photo(W*p[0],H*p[1],W*p[2],H*p[3],2,p[4],`Polaroid ${i+1}`))});a.push(sticker(theme.deco,W*.76,H*.78,W*.11,{rotation:8}));return a},
    journal(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [shape(W*.065,H*.055,W*.87,H*.86,theme.paper,theme.radius),baseTitle(recipe,theme,W*.11,H*.09,W*.7,W*.07),sticker(theme.deco,W*.79,H*.085,W*.09),photo(W*.11,H*.23,W*.78,H*.34,theme.radius*.75,rot(r)),text('currently:',W*.11,H*.62,W*.3,H*.045,W*.032,theme.accent,theme.body,{bold:true}),text(recipe.body,W*.11,H*.67,W*.78,H*.08,W*.038,theme.ink,theme.head,{italic:true}),shape(W*.11,H*.78,W*.78,H*.08,theme.accent2,theme.radius*.5),text('a note to remember…',W*.15,H*.795,W*.7,H*.045,W*.03,theme.ink,theme.body)]},
    ticket(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [shape(W*.07,H*.15,W*.86,H*.67,theme.paper,theme.radius),text(recipe.lead.toUpperCase(),W*.12,H*.19,W*.72,H*.055,W*.045,theme.accent,theme.body,{bold:true,letterSpacing:4}),shape(W*.12,H*.27,W*.76,3,theme.accent2,0),text('FROM',W*.12,H*.31,W*.2,H*.03,W*.022,theme.ink,theme.body,{bold:true}),text('HERE',W*.12,H*.35,W*.28,H*.06,W*.06,theme.ink,theme.body,{bold:true}),text('TO',W*.62,H*.31,W*.18,H*.03,W*.022,theme.ink,theme.body,{bold:true}),text('THERE',W*.62,H*.35,W*.28,H*.06,W*.055,theme.ink,theme.body,{bold:true}),photo(W*.12,H*.45,W*.76,H*.2,theme.radius*.55,0),text('SEAT  •  DATE  •  GATE',W*.12,H*.7,W*.76,H*.04,W*.028,theme.ink,'Courier New, monospace',{letterSpacing:2}),sticker('✈️',W*.76,H*.18,W*.08,{rotation:10})]},
    postcard(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [photo(W*.05,H*.05,W*.9,H*.52,theme.radius*.35,0),baseTitle(recipe,theme,W*.07,H*.62,W*.8,W*.075),shape(W*.05,H*.72,W*.9,3,theme.accent2,0),text('FROM:',W*.08,H*.76,W*.22,H*.035,W*.024,theme.ink,'Courier New, monospace'),text(recipe.body,W*.08,H*.81,W*.66,H*.06,W*.04,theme.ink,theme.head,{italic:true}),sticker('💌',W*.78,H*.77,W*.11,{rotation:7})]},
    stamps(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);const a=[baseTitle(recipe,theme,W*.08,H*.05,W*.84,W*.075),photo(W*.1,H*.2,W*.8,H*.34,theme.radius*.4,rot(r))];['TOKYO','SEOUL','PARIS','ROME'].forEach((s,i)=>a.push(text(s,W*(.09+(i%2)*.47),H*(.62+Math.floor(i/2)*.13),W*.35,H*.07,W*.045,i%2?theme.accent:theme.ink,'Courier New, monospace',{bold:true,align:'center',rotation:i%2?5:-5})));a.push(sticker('✈︎',W*.78,H*.82,W*.11,{rotation:20}));return a},
    timeline(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);const a=[baseTitle(recipe,theme,W*.07,H*.045,W*.86,W*.075,{bold:true}),shape(W*.17,H*.2,5,H*.58,theme.accent,0)];for(let i=0;i<4;i++){a.push(shape(W*.14,H*(.23+i*.15),W*.065,W*.065,theme.accent,999));a.push(text(`${String(9+i*3).padStart(2,'0')}:00`,W*.25,H*(.22+i*.15),W*.2,H*.04,W*.029,theme.accent,'Courier New, monospace',{bold:true}));a.push(text(i===0?recipe.body:['coffee & wander','photos & food','one last stop'][i-1],W*.25,H*(.265+i*.15),W*.6,H*.07,W*.035,theme.ink,theme.body))}return a},
    recipe(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [photo(W*.06,H*.06,W*.88,H*.4,theme.radius*.5,0),baseTitle(recipe,theme,W*.07,H*.5,W*.8,W*.07),text('INGREDIENTS',W*.07,H*.61,W*.34,H*.04,W*.028,theme.accent,theme.body,{bold:true,letterSpacing:2}),text('• ingredient one\n• ingredient two\n• ingredient three\n• add your favorite',W*.07,H*.66,W*.39,H*.24,W*.033,theme.ink,theme.body,{lineHeight:1.5}),text('METHOD',W*.55,H*.61,W*.3,H*.04,W*.028,theme.accent,theme.body,{bold:true,letterSpacing:2}),text(recipe.body+'\n\nAdd your steps here.',W*.55,H*.66,W*.38,H*.2,W*.033,theme.ink,theme.body,{lineHeight:1.45})]},
    editorial(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [photo(0,0,W,H,0,0),text(recipe.lead.toUpperCase(),W*.055,H*.04,W*.89,H*.09,W*.085,'#ffffff',theme.body,{bold:true,letterSpacing:6}),text(recipe.body.toUpperCase(),W*.06,H*.68,W*.82,H*.11,W*.06,'#ffffff',theme.body,{bold:true}),shape(W*.06,H*.84,W*.42,H*.055,'#ffffff',999),text('WASHI EDITION',W*.085,H*.852,W*.36,H*.03,W*.022,theme.ink,theme.body,{bold:true,letterSpacing:2})]},
    moodboard(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [baseTitle(recipe,theme,W*.06,H*.04,W*.88,W*.075),photo(W*.06,H*.17,W*.43,H*.29,theme.radius*.5,rot(r)),photo(W*.53,H*.14,W*.4,H*.23,theme.radius*.5,rot(r)),photo(W*.55,H*.42,W*.38,H*.31,theme.radius*.5,rot(r)),photo(W*.08,H*.5,W*.38,H*.22,theme.radius*.5,rot(r)),shape(W*.08,H*.78,W*.22,H*.08,theme.accent,999),shape(W*.33,H*.78,W*.22,H*.08,theme.accent2,999),shape(W*.58,H*.78,W*.22,H*.08,theme.paper,999),sticker(theme.deco,W*.8,H*.81,W*.09)]},
    list(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);const a=[baseTitle(recipe,theme,W*.07,H*.05,W*.86,W*.075),text(recipe.body,W*.08,H*.15,W*.84,H*.06,W*.035,theme.ink,theme.body)];for(let i=0;i<6;i++){a.push(shape(W*.08,H*(.25+i*.095),W*.84,H*.065,i%2?theme.paper:theme.accent2,theme.radius*.5));a.push(text(['morning','midday','afternoon','evening','little win','remember'][i],W*.12,H*(.265+i*.095),W*.72,H*.035,W*.028,theme.ink,theme.body,{bold:i===0}))}return a},
    quote(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [sticker(theme.deco,W*.44,H*.14,W*.12),text('“',W*.08,H*.26,W*.2,H*.12,W*.14,theme.accent,theme.head),text(recipe.body,W*.13,H*.33,W*.74,H*.3,W*.065,theme.ink,theme.head,{italic:true,align:'center',lineHeight:1.15}),shape(W*.33,H*.68,W*.34,3,theme.accent2,0),text(recipe.lead.toUpperCase(),W*.14,H*.73,W*.72,H*.05,W*.028,theme.accent,theme.body,{bold:true,align:'center',letterSpacing:3})]},
    prompt(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);const prompts=['favorite color','comfort food','on repeat','dream trip','current hobby','little joy'];const a=[baseTitle(recipe,theme,W*.07,H*.05,W*.86,W*.075,{align:'center'})];prompts.forEach((p,i)=>{a.push(shape(W*.09,H*(.2+i*.105),W*.82,H*.075,i%2?theme.paper:theme.accent2,theme.radius*.7));a.push(text(p,W*.14,H*(.22+i*.105),W*.72,H*.04,W*.028,theme.ink,theme.body,{align:'center'}))});return a},
    question(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [baseTitle(recipe,theme,W*.08,H*.13,W*.84,W*.08,{align:'center'}),sticker(theme.deco,W*.44,H*.27,W*.12),shape(W*.1,H*.43,W*.8,H*.18,theme.paper,theme.radius),text(recipe.body,W*.16,H*.485,W*.68,H*.07,W*.038,theme.ink,theme.body,{align:'center'}),text('type your question here…',W*.16,H*.67,W*.68,H*.05,W*.03,theme.accent,theme.body,{align:'center'})]},
    thisthat(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);const pairs=['coffee / tea','sunrise / sunset','city / beach','sweet / salty','film / digital','stay in / go out'];const a=[text(recipe.lead.toUpperCase(),W*.07,H*.055,W*.86,H*.07,W*.06,theme.accent,theme.body,{bold:true,letterSpacing:5,align:'center'})];pairs.forEach((p,i)=>{a.push(shape(W*.1,H*(.2+i*.105),W*.8,H*.075,i%2?theme.paper:theme.accent2,theme.radius*.7));a.push(text(p,W*.14,H*(.22+i*.105),W*.72,H*.04,W*.032,theme.ink,theme.body,{bold:true,align:'center'}))});return a},
    bingo(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format),g=W*.03,c=(W-g*4)/3,top=H*.25;const labels=['good coffee','pink sky','cute dog','new song','FREE ♡','good food','tiny flower','long walk','sweet text'];const a=[text(recipe.lead.toUpperCase(),W*.05,H*.055,W*.9,H*.08,W*.055,theme.accent,theme.body,{bold:true,align:'center'})];for(let i=0;i<9;i++){a.push(shape(g+(i%3)*(c+g),top+Math.floor(i/3)*(c+g),c,c,i===4?theme.accent2:theme.paper,theme.radius*.55));a.push(text(labels[i],g+(i%3)*(c+g)+W*.02,top+Math.floor(i/3)*(c+g)+c*.38,c-W*.04,c*.25,W*.026,theme.ink,theme.body,{bold:true,align:'center'}))}return a},
    tier(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);const tiers=['S','A','B','C','D'];const a=[baseTitle(recipe,theme,W*.07,H*.05,W*.86,W*.07,{bold:true,align:'center'})];tiers.forEach((t,i)=>{a.push(shape(W*.08,H*(.22+i*.125),W*.16,H*.09,[theme.accent,theme.accent2,theme.paper,theme.accent2,theme.paper][i],theme.radius*.4));a.push(text(t,W*.08,H*(.24+i*.125),W*.16,H*.05,W*.04,theme.ink,theme.body,{bold:true,align:'center'}));a.push(shape(W*.27,H*(.22+i*.125),W*.65,H*.09,theme.paper,theme.radius*.4));a.push(text('add favorites here',W*.31,H*(.245+i*.125),W*.57,H*.04,W*.025,theme.ink,theme.body))});return a},
    ranking(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);const a=[baseTitle(recipe,theme,W*.07,H*.05,W*.86,W*.075,{bold:true})];for(let i=0;i<5;i++){a.push(text(String(i+1),W*.08,H*(.22+i*.13),W*.11,H*.07,W*.06,theme.accent,theme.head,{bold:true,align:'center'}));a.push(shape(W*.21,H*(.21+i*.13),W*.71,H*.085,theme.paper,theme.radius*.6));a.push(text(i===0?'favorite thing':'add item',W*.26,H*(.235+i*.13),W*.6,H*.04,W*.029,theme.ink,theme.body))}return a},
    notes(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [shape(W*.05,H*.05,W*.9,H*.88,'#ffffff',theme.radius),text('‹ Notes',W*.09,H*.09,W*.45,H*.04,W*.035,'#d79d00','system-ui'),text(recipe.body,W*.09,H*.17,W*.78,H*.08,W*.06,'#1f1f1f','system-ui',{bold:true}),text('Today at 8:02 AM',W*.09,H*.25,W*.7,H*.035,W*.022,'#9a9a9a','system-ui'),text('• tiny joys\n• places I want to go\n• songs on repeat\n• things I never want to forget',W*.09,H*.34,W*.78,H*.35,W*.042,'#242424','system-ui',{lineHeight:1.55}),text('♡',W*.09,H*.78,W*.12,H*.06,W*.055,'#d79d00','system-ui')]},
    chat(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [text('Messages',W*.07,H*.06,W*.84,H*.06,W*.05,theme.ink,'system-ui',{bold:true}),shape(W*.08,H*.25,W*.62,H*.085,'#e5e5ea',999),text('what should we do today?',W*.13,H*.275,W*.52,H*.04,W*.03,'#111','system-ui'),shape(W*.32,H*.4,W*.6,H*.085,theme.accent,999),text('take photos of everything ♡',W*.37,H*.425,W*.5,H*.04,W*.029,'#fff','system-ui'),shape(W*.08,H*.55,W*.54,H*.085,'#e5e5ea',999),text('deal ✨',W*.13,H*.575,W*.44,H*.04,W*.03,'#111','system-ui')]},
    music(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [text(recipe.lead,W*.1,H*.07,W*.8,H*.05,W*.036,theme.ink,theme.body,{bold:true,align:'center'}),photo(W*.15,H*.2,W*.7,W*.39,theme.radius,0),text('SONG TITLE',W*.12,H*.64,W*.76,H*.05,W*.04,theme.ink,theme.body,{bold:true}),text('artist name',W*.12,H*.7,W*.76,H*.04,W*.028,theme.ink,theme.body),shape(W*.12,H*.77,W*.76,5,theme.accent2,3),shape(W*.12,H*.77,W*.31,5,theme.accent,3),text('◀     ▶     ▶▶',W*.2,H*.83,W*.6,H*.05,W*.045,theme.ink,theme.body,{align:'center'})]},
    search(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [baseTitle(recipe,theme,W*.08,H*.12,W*.84,W*.07,{align:'center'}),shape(W*.1,H*.33,W*.8,H*.085,theme.paper,999),text('⌕  '+recipe.body,W*.15,H*.355,W*.7,H*.04,W*.03,theme.ink,theme.body),...['soft mornings','good coffee','weekend plans','somewhere pretty'].map((s,i)=>text('↗ '+s,W*.15,H*(.5+i*.08),W*.7,H*.04,W*.028,theme.ink,theme.body))]},
    newspaper(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [text(recipe.lead,W*.05,H*.04,W*.9,H*.07,W*.055,theme.ink,theme.head,{bold:true,align:'center'}),shape(W*.05,H*.13,W*.9,3,theme.ink,0),text('VOL. 01   •   TODAY',W*.05,H*.15,W*.9,H*.035,W*.022,theme.ink,'Courier New, monospace',{align:'center'}),photo(W*.05,H*.23,W*.55,H*.37,2),text('A VERY GOOD DAY',W*.63,H*.23,W*.31,H*.12,W*.045,theme.ink,theme.head,{bold:true}),text(recipe.body,W*.63,H*.37,W*.31,H*.18,W*.028,theme.ink,theme.head),shape(W*.05,H*.66,W*.9,3,theme.ink,0),text('small moments worth keeping',W*.05,H*.71,W*.9,H*.06,W*.04,theme.ink,theme.head,{italic:true,align:'center'})]},
    filmstrip(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);const a=[text(recipe.lead.toUpperCase(),W*.06,H*.04,W*.88,H*.055,W*.04,theme.ink,'Courier New, monospace',{bold:true,letterSpacing:4})];for(let i=0;i<4;i++)a.push(photo(W*.15,H*(.15+i*.19),W*.7,H*.15,2,0,`Frame ${i+1}`));a.push(text(recipe.body,W*.1,H*.89,W*.8,H*.04,W*.028,theme.ink,'Courier New, monospace',{align:'center'}));return a},
    photobooth(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);const a=[shape(W*.23,H*.05,W*.54,H*.9,theme.paper,8)];for(let i=0;i<4;i++)a.push(photo(W*.28,H*(.1+i*.19),W*.44,H*.16,4,0,`Photo ${i+1}`));a.push(text(recipe.lead.toUpperCase(),W*.28,H*.86,W*.44,H*.04,W*.024,theme.ink,'Courier New, monospace',{bold:true,align:'center',letterSpacing:2}));return a},
    scrapbook(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [photo(W*.07,H*.09,W*.42,H*.35,theme.radius*.5,-5),photo(W*.54,H*.07,W*.4,H*.3,theme.radius*.5,4),photo(W*.49,H*.47,W*.44,H*.38,theme.radius*.5,-3),baseTitle(recipe,theme,W*.08,H*.51,W*.34,W*.09,{rotation:-4}),shape(W*.11,H*.075,W*.28,H*.035,theme.accent2,4,{rotation:-9}),shape(W*.64,H*.43,W*.25,H*.035,theme.accent2,4,{rotation:7}),sticker(theme.deco,W*.1,H*.76,W*.1,{rotation:-8}),text(recipe.body,W*.08,H*.88,W*.84,H*.04,W*.026,theme.ink,'Courier New, monospace',{letterSpacing:3,align:'center'})]},
    ripped(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [shape(W*.06,H*.05,W*.88,H*.9,theme.paper,4),photo(W*.11,H*.15,W*.78,H*.31,4,-2),shape(W*.09,H*.47,W*.82,H*.06,theme.bg,3,{rotation:1}),baseTitle(recipe,theme,W*.11,H*.56,W*.76,W*.08),photo(W*.12,H*.68,W*.36,H*.18,4,3,'Photo 2'),photo(W*.54,H*.66,W*.34,H*.2,4,-3,'Photo 3'),shape(W*.17,H*.13,W*.24,H*.035,theme.accent2,3,{rotation:-7}),sticker('📎',W*.79,H*.59,W*.08,{rotation:12})]},
    marketing(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [text(recipe.lead.toUpperCase(),W*.07,H*.07,W*.86,H*.09,W*.075,theme.ink,theme.body,{bold:true,letterSpacing:4}),photo(W*.07,H*.23,W*.86,H*.42,theme.radius,0),text(recipe.body,W*.08,H*.7,W*.7,H*.07,W*.038,theme.ink,theme.head,{italic:true}),shape(W*.08,H*.81,W*.42,H*.07,theme.accent,999),text('LEARN MORE',W*.11,H*.83,W*.36,H*.035,W*.025,'#fff',theme.body,{bold:true,align:'center',letterSpacing:2}),sticker(theme.deco,W*.8,H*.72,W*.1)]},
    countdown(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [text(recipe.lead.toUpperCase(),W*.08,H*.08,W*.84,H*.08,W*.065,theme.ink,theme.body,{bold:true,align:'center',letterSpacing:4}),text('03',W*.2,H*.29,W*.6,H*.2,W*.18,theme.accent,theme.head,{bold:true,align:'center'}),text('DAYS',W*.2,H*.48,W*.6,H*.06,W*.04,theme.ink,theme.body,{bold:true,align:'center',letterSpacing:8}),shape(W*.18,H*.61,W*.64,H*.09,theme.paper,theme.radius),text(recipe.body,W*.22,H*.635,W*.56,H*.04,W*.029,theme.ink,theme.body,{align:'center'}),sticker(theme.deco,W*.45,H*.77,W*.11)]},
    announcement(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [photo(W*.08,H*.08,W*.84,H*.48,theme.radius,0),shape(W*.12,H*.53,W*.76,H*.19,theme.paper,theme.radius),text(recipe.lead.toUpperCase(),W*.16,H*.57,W*.68,H*.06,W*.05,theme.accent,theme.body,{bold:true,align:'center',letterSpacing:3}),text(recipe.body,W*.16,H*.65,W*.68,H*.04,W*.029,theme.ink,theme.body,{align:'center'}),sticker(theme.deco,W*.78,H*.74,W*.11)]},
    score(recipe,theme,r){const {w:W,h:H}=fmt(recipe.format);return [text(recipe.lead.toUpperCase(),W*.07,H*.07,W*.86,H*.08,W*.065,theme.ink,theme.body,{bold:true,align:'center',letterSpacing:4}),shape(W*.08,H*.25,W*.84,H*.28,theme.paper,theme.radius),text('HOME',W*.13,H*.3,W*.25,H*.04,W*.03,theme.ink,theme.body,{bold:true,align:'center'}),text('03',W*.13,H*.37,W*.25,H*.09,W*.08,theme.accent,theme.head,{bold:true,align:'center'}),text('AWAY',W*.62,H*.3,W*.25,H*.04,W*.03,theme.ink,theme.body,{bold:true,align:'center'}),text('02',W*.62,H*.37,W*.25,H*.09,W*.08,theme.accent,theme.head,{bold:true,align:'center'}),text(recipe.body,W*.12,H*.62,W*.76,H*.06,W*.035,theme.ink,theme.head,{italic:true,align:'center'}),photo(W*.15,H*.72,W*.7,H*.17,theme.radius*.5,0)]}
  };

  function makeTemplate(recipe, theme, ri, ti) {
    const r = seeded((ri + 1) * 4099 + (ti + 1) * 7919);
    const factory = LAYOUTS[recipe.layout] || LAYOUTS.collage;
    const bg = (ti % 5 === 1 || ti % 7 === 0)
      ? { type: 'gradient', value: `linear-gradient(${Math.round(130 + r()*50)}deg,${theme.bg},${theme.accent2})` }
      : { type: 'solid', value: theme.bg };
    return {
      id: `${recipe.slug}-${theme.slug}`,
      title: `${recipe.title} · ${theme.name}`,
      category: recipe.category,
      format: recipe.format,
      collection: theme.name,
      tags: [...recipe.tags, theme.slug, theme.name.toLowerCase(), recipe.category.toLowerCase(), 'story', 'editable'],
      bg,
      objects: factory(recipe, theme, r)
    };
  }

  const TEMPLATES = [];
  THEMES.forEach((theme, ti) => RECIPES.forEach((recipe, ri) => TEMPLATES.push(makeTemplate(recipe, theme, ri, ti))));

  // 60 concepts × 20 visual collections = 1,200 original editable templates.
  // Keep the All view light on mobile: every template is still searchable and all
  // templates remain available through category filters, but a broad match only
  // hands the current UI a manageable batch instead of 1,200 DOM cards at once.
  const nativeFilter = Array.prototype.filter;
  Object.defineProperty(TEMPLATES, 'filter', {
    configurable: false,
    enumerable: false,
    writable: false,
    value(callback, thisArg) {
      const matches = nativeFilter.call(this, callback, thisArg);
      return matches.length > 144 ? matches.slice(0, 144) : matches;
    }
  });

  function newProject(format = 'story', name) {
    const f = F[format] || F.story;
    const now = new Date().toISOString();
    return {
      id: uid('project'), name: name || `Untitled ${f.label}`, format,
      width: f.w, height: f.h, bg: { type: 'solid', value: '#fffdfd' },
      objects: [], drawings: [], createdAt: now, updatedAt: now
    };
  }

  function fromTemplate(id) {
    const t = TEMPLATES.find(item => item.id === id);
    if (!t) return null;
    const p = newProject(t.format, t.title);
    p.bg = clone(t.bg);
    p.objects = clone(t.objects).map(o => ({ ...o, id: uid('obj') }));
    return p;
  }

  function addTextObject(project, value = 'Text') {
    const size = Math.max(44, Math.round(project.width * .06));
    const o = text(value, project.width * .1, project.height * .16, project.width * .8, Math.max(120, size * 2.2), size, '#4b3740', 'Georgia, serif');
    project.objects.push(o);
    return o;
  }

  W.Templates = {
    FORMATS: F,
    TEMPLATES,
    TEMPLATE_COUNT: TEMPLATES.length,
    COLLECTIONS: THEMES.map(t => t.name),
    CATEGORIES: [...new Set(RECIPES.map(r => r.category))],
    QUICK_TEXT,
    STICKERS,
    TAPE_COLORS,
    PALETTES,
    newProject,
    fromTemplate,
    addTextObject,
    factories: { text, shape, sticker, photo }
  };
})();
