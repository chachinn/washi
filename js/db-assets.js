(() => {
  'use strict';
  const W=window.Washi,DB=W.DB,K=W.StorageKeys;
  const DB_NAME='washi-assets-v1',STORE='assets',urlCache=new Map();let dbPromise=null;
  function openDB(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return dbPromise}
  async function assetPut(blob,meta={}){const id=DB.uid('asset'),db=await openDB();await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({id,blob,meta,createdAt:Date.now()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});return id}
  async function assetGet(id){if(!id)return null;const db=await openDB();return await new Promise((resolve,reject)=>{const req=db.transaction(STORE).objectStore(STORE).get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}
  async function assetURL(id){if(!id)return '';if(urlCache.has(id))return urlCache.get(id);const item=await assetGet(id);if(!item?.blob)return '';const url=URL.createObjectURL(item.blob);urlCache.set(id,url);return url}
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const getFonts=()=>read(K.fonts,[]);const saveFonts=fonts=>write(K.fonts,fonts);
  async function addFont(file){const assetId=await assetPut(file,{type:'font',name:file.name});const base=file.name.replace(/\.[^.]+$/,'').replace(/[^\w -]/g,'').trim()||'Custom Font';const family=`Washi Custom ${DB.uid('font').slice(-6)}`;const entry={id:DB.uid('fontmeta'),name:base,family,assetId};const fonts=getFonts();fonts.push(entry);saveFonts(fonts);await loadFont(entry);return entry}
  async function loadFont(entry){try{const url=await assetURL(entry.assetId);if(!url)return false;const font=new FontFace(entry.family,`url(${url})`);await font.load();document.fonts.add(font);return true}catch{return false}}
  async function loadFonts(){await Promise.all(getFonts().map(loadFont))}
  async function storageEstimate(){if(!navigator.storage?.estimate)return null;try{return await navigator.storage.estimate()}catch{return null}}
  Object.assign(DB,{assetPut,assetGet,assetURL,getFonts,addFont,loadFonts,storageEstimate});
})();