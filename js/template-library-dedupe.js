(() => {
'use strict';
const W=window.Washi=window.Washi||{},T=W.Templates;
if(!Array.isArray(T?.TEMPLATES)||T.__templateDedupeAug16)return;
T.__templateDedupeAug16=true;
const ids=new Set(Array.from({length:6},(_,i)=>`ref-gift-grid-${i+1}`));
const nativeFilter=Array.prototype.filter;
const removed=nativeFilter.call(T.TEMPLATES,t=>ids.has(String(t.id)));
if(removed.length){
 const kept=nativeFilter.call(T.TEMPLATES,t=>!ids.has(String(t.id)));
 T.TEMPLATES.splice(0,T.TEMPLATES.length,...kept);
 T.TEMPLATE_COUNT=T.TEMPLATES.length;
 T.CATEGORIES=[...new Set(T.TEMPLATES.map(t=>t.category))];
 T.COLLECTIONS=[...new Set(T.TEMPLATES.map(t=>t.collection).filter(Boolean))];
}
if(W.TemplateCuration){
 W.TemplateCuration.removed.push(...removed.map(t=>t.id));
 W.TemplateCuration.removedFamilies.push('gift-grid');
 W.TemplateCuration.after=T.TEMPLATES.length;
}
W.TemplateLibraryDedupe={version:'2026.08.16-ribbon-grid1',removed:removed.map(t=>t.id),after:T.TEMPLATES.length};
})();