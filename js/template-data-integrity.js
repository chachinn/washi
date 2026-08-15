(() => {
'use strict';
const W=window.Washi=window.Washi||{},T=W.Templates,DB=W.DB;
if(!T?.TEMPLATES||!DB||T.__uncappedData)return;
T.__uncappedData=true;

const original=T.TEMPLATES;
const hasOwnFilter=Object.prototype.hasOwnProperty.call(original,'filter');
if(hasOwnFilter){
  // templates.js historically attached a non-configurable 144-result filter to
  // its array. Keep all objects, but move them to a normal Array before any
  // cumulative template packs load so every feature sees the real library.
  T.TEMPLATES=Array.from(original);
  T.TEMPLATE_COUNT=T.TEMPLATES.length;
}

// Bind template creation to the live cumulative array rather than the original
// closure in templates.js. Later packs can now add templates without becoming
// invisible to the editor's fromTemplate() path.
T.fromTemplate=function(id){
  const t=T.TEMPLATES.find(item=>item.id===id);
  if(!t)return null;
  const p=T.newProject(t.format,t.title);
  p.bg=DB.clone(t.bg);
  p.objects=DB.clone(t.objects||[]).map(o=>({...o,id:DB.uid('obj')}));
  return p;
};

W.TemplateDataIntegrity={version:'20260816',uncapped:hasOwnFilter,total:T.TEMPLATES.length};
})();
