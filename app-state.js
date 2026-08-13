  const DEFAULT_SETTINGS = {snap:true,grid:false,safeZones:false,reduceMotion:false,defaultExport:"png",quality:0.94,brand:{primary:"#dd688e",secondary:"#f6b5c8",font:"Rounded"},favoriteTemplates:[],favoriteStickers:[],palettes:[],customFonts:[],myTemplates:[]};
  let settings = {...DEFAULT_SETTINGS,...JSON.parse(localStorage.getItem("washi:settings:v2")||"{}")};
  let projects = JSON.parse(localStorage.getItem("washi:projects:v2")||"[]");

  const state = {route:"home",activeProjectId:null,selectedIds:[],panelTool:null,zoom:1,history:[],historyIndex:-1,templateFilter:"All",savedTab:"templates",drawMode:false,drawBrush:{type:"pen",color:"#c34f77",size:14,opacity:1},pointerMap:new Map(),gesture:null,interaction:null,objectUrls:new Map(),palette:[],toastTimer:null};

  function saveSettings(){localStorage.setItem("washi:settings:v2",JSON.stringify(settings));}
  function saveProjects(){localStorage.setItem("washi:projects:v2",JSON.stringify(projects));}
  function getProject(){return projects.find(p=>p.id===state.activeProjectId)||null;}
  function updateProject(mutator,{history=true,render=true}={}){const p=getProject();if(!p)return;mutator(p);p.updatedAt=now();saveProjects();if(history)pushHistory();if(render){renderEditor();renderProjects();}}
  function toast(message){const el=$("#toast");clearTimeout(state.toastTimer);el.textContent=message;el.classList.add("show");state.toastTimer=setTimeout(()=>el.classList.remove("show"),2200);}

  // IndexedDB keeps large photos/videos/fonts out of localStorage.
  const DB_NAME="washi-assets-v2", DB_STORE="assets";
  function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE,{keyPath:"id"});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function putAsset(blob,meta={},id=uid("asset")){const db=await openDB();await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,"readwrite");tx.objectStore(DB_STORE).put({id,blob,name:meta.name||"asset",mime:meta.mime||blob.type,kind:meta.kind||"media",createdAt:meta.createdAt||now()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});if(state.objectUrls.has(id)){URL.revokeObjectURL(state.objectUrls.get(id));state.objectUrls.delete(id);}return id;}
  async function getAsset(id){if(!id)return null;const db=await openDB();return await new Promise((resolve,reject)=>{const req=db.transaction(DB_STORE,"readonly").objectStore(DB_STORE).get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});}
  async function deleteAsset(id){const db=await openDB();await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,"readwrite");tx.objectStore(DB_STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});if(state.objectUrls.has(id)){URL.revokeObjectURL(state.objectUrls.get(id));state.objectUrls.delete(id);}}
  async function assetURL(id){if(!id)return null;if(state.objectUrls.has(id))return state.objectUrls.get(id);const asset=await getAsset(id);if(!asset)return null;const url=URL.createObjectURL(asset.blob);state.objectUrls.set(id,url);return url;}
