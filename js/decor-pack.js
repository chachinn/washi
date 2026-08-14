(() => {
'use strict';
const W=window.Washi=window.Washi||{},T=W.Templates;
if(!T||!Array.isArray(T.STICKERS))return;

// Lightweight monochrome/text glyphs: no image downloads, no emoji artwork,
// no extra storage, and they use the existing sticker move/resize/export path.
const LINE_ART=[
  '❦','❧','☙','❥','❣','✢','✣','✤','✥','✺','✻','✼','✽','✾','❁','❂','❃','❈','❉','❊','❋',
  '⟡','◇','◆','◈','◌','◍','◎','◜','◝','◞','◟','⊹','⊱','⊰','⊶','⊷','⊸',
  '⌇','⌁','〰','≋','⋰','⋱','⌒','⌣','⌜','⌝','⌞','⌟','⌑','⌖','⌗',
  '╭','╮','╰','╯','┈','┊','┄','┆','═','║','╱','╲','╌','╎','┄','┅','┉','┋',
  '↝','↠','↢','↣','↤','↦','⇢','⇠','❯','❮','〈','〉','〔','〕','〘','〙',
  '︵','︶','﹏','〜','※','⁂','⁕','⁘','⁙','⁚','⁛','⁜','⁝','⁞','⋆','˖','˚','°',
  '༺','༻','꧁','꧂','ꕤ','ꕥ','ꔛ','꒰','꒱','﹙','﹚','﹛','﹜','﹝','﹞'
];

const seen=new Set(T.STICKERS);
for(const glyph of LINE_ART)if(!seen.has(glyph)){T.STICKERS.push(glyph);seen.add(glyph)}

W.DecorPack={name:'Line Art Decor',count:LINE_ART.length,version:'v1.0'};
})();
