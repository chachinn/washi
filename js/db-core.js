(() => {
  'use strict';
  const W=window.Washi=window.Washi||{};
  const K={projects:'washi:projects:v1',settings:'washi:settings:v1',favorites:'washi:favorites:v1',palettes:'washi:palettes:v1',fonts:'washi:fonts:v1',templates:'washi:user-templates:v1'};
  const defaults={snap:true,keepInside:true,safeZones:false,grid:false,reducedMotion:false,exportQuality:.94,lastFormat:'story'};
  const uid=(prefix='id')=>`${prefix}_${Date.now().toString(36)}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
  const clone=v=>typeof structuredClone==='function'?structuredClone(v):JSON.parse(JSON.stringify(v));
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const getProjects=()=>read(K.projects,[]);
  const saveProjects=projects=>(write(K.projects,projects),projects);
  const getProject=id=>getProjects().find(p=>p.id===id)||null;
  function upsertProject(project){const list=getProjects();project.updatedAt=new Date().toISOString();const i=list.findIndex(p=>p.id===project.id);if(i>=0)list[i]=clone(project);else list.unshift(clone(project));saveProjects(list.slice(0,100));return project}
  const deleteProject=id=>saveProjects(getProjects().filter(p=>p.id!==id));
  function duplicateProject(id){const original=getProject(id);if(!original)return null;const copy=clone(original);copy.id=uid('project');copy.name=`${original.name||'Untitled'} Copy`;copy.createdAt=copy.updatedAt=new Date().toISOString();copy.objects=(copy.objects||[]).map(o=>({...o,id:uid('obj')}));copy.drawings=(copy.drawings||[]).map(s=>({...s,id:uid('stroke')}));return upsertProject(copy)}
  const getSettings=()=>({...defaults,...read(K.settings,{})});
  const saveSettings=next=>{const value={...getSettings(),...next};write(K.settings,value);return value};
  const getFavorites=()=>read(K.favorites,{templates:[]});
  const saveFavorites=value=>(write(K.favorites,value),value);
  function toggleTemplateFavorite(id){const f=getFavorites(),s=new Set(f.templates||[]);s.has(id)?s.delete(id):s.add(id);f.templates=[...s];saveFavorites(f);return s.has(id)}
  const getPalettes=()=>read(K.palettes,[]);
  function savePalette(colors,name='Photo palette'){const all=getPalettes(),item={id:uid('palette'),name,colors,createdAt:Date.now()};all.unshift(item);write(K.palettes,all.slice(0,30));return item}
  const deletePalette=id=>write(K.palettes,getPalettes().filter(p=>p.id!==id));
  const getUserTemplates=()=>read(K.templates,[]);
  function saveUserTemplate(project){const copy=clone(project),item={id:uid('usertpl'),title:project.name||'My Template',width:project.width,height:project.height,bg:clone(project.bg),createdAt:Date.now(),objects:(copy.objects||[]).map(o=>{const n={...o,id:uid('obj')};if(['image','video'].includes(n.type)||(n.type==='placeholder'&&n.mediaId)){n.type='placeholder';n.label='Add photo';delete n.mediaId;delete n.mediaType}return n}),drawings:clone(copy.drawings||[])};const all=getUserTemplates();all.unshift(item);write(K.templates,all.slice(0,40));return item}
  const deleteUserTemplate=id=>write(K.templates,getUserTemplates().filter(t=>t.id!==id));
  W.StorageKeys=K;W.DB={uid,clone,getProjects,saveProjects,getProject,upsertProject,deleteProject,duplicateProject,getSettings,saveSettings,getFavorites,saveFavorites,toggleTemplateFavorite,getPalettes,savePalette,deletePalette,getUserTemplates,saveUserTemplate,deleteUserTemplate};
})();