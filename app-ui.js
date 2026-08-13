"use strict";
  function routeTo(route){
    state.route=route;
    $$(".view").forEach(v=>v.classList.toggle("active",v.dataset.view===route));
    $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.route===route));
    const editor=route==="editor";
    $("#bottomNav").style.display=editor?"none":"grid";
    $("#topbar").style.display=editor?"none":"flex";
    if(!editor)window.scrollTo({top:0,behavior:"instant"});
    if(route==="templates")renderTemplates();
    if(route==="projects")renderProjects();
    if(route==="saved")renderSaved();
    closeDrawer();
  }

  function templateGradient(tone){
    const map={pink:"linear-gradient(145deg,#f4a9c0,#ffe8f0)",paper:"linear-gradient(145deg,#fffaf2,#f5eadf)",editorial:"linear-gradient(145deg,#c85e82,#efadc2)",film:"linear-gradient(145deg,#3d3336,#d7bfb3)",cream:"linear-gradient(145deg,#fbf2e8,#f1cad6)",blue:"linear-gradient(145deg,#d7e7ef,#f4dce6)",lavender:"linear-gradient(145deg,#ddd0ea,#f2d7e1)",white:"linear-gradient(145deg,#fff,#f7edf1)"};return map[tone]||map.pink;
  }
  function templateCardHTML(t){const fav=settings.favoriteTemplates.includes(t.id);return `<article class="template-thumb" data-template-id="${escapeHTML(t.id)}" role="button" tabindex="0" aria-label="Use ${escapeHTML(t.name)}"><span class="preview" style="background:${templateGradient(t.tone)}"><b>${escapeHTML(t.name)}</b><small>${escapeHTML(t.pack)} · ${escapeHTML(FORMATS[t.format]?.ratio||"")}</small></span><button class="heart-save" data-favorite-template="${escapeHTML(t.id)}" aria-label="Favorite">${fav?"♥":"♡"}</button></article>`;}
  function renderHomeTemplates(){const root=$("#homeTemplateScroller");root.innerHTML=TEMPLATES.slice(0,8).map(templateCardHTML).join("");}
  function renderTemplateCategories(){const cats=["All",...new Set(TEMPLATES.map(t=>t.category))];$("#templateCategoryChips").innerHTML=cats.map(c=>`<button class="chip ${state.templateFilter===c?"active":""}" data-template-category="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join("");}
  function renderTemplates(){renderTemplateCategories();const q=$("#templateSearch")?.value.trim().toLowerCase()||"";const filtered=TEMPLATES.filter(t=>(state.templateFilter==="All"||t.category===state.templateFilter)&&(!q||`${t.name} ${t.category} ${t.pack} ${t.tags.join(" ")}`.toLowerCase().includes(q)));$("#templateLibrary").innerHTML=filtered.length?filtered.map(templateCardHTML).join(""):`<div class="empty-state"><b>No templates found</b>Try another word or category.</div>`;}

  function projectPreviewStyle(p){const bg=p.bg||{type:"solid",value:"#fff6fa"};if(bg.type==="gradient")return bg.value;if(bg.type==="solid")return bg.value;if(bg.type==="pattern")return `repeating-linear-gradient(0deg,${bg.color||"#fff"} 0 24px,#efdde4 25px 26px)`;return "#fff6fa";}
  function projectCardHTML(p){const fmt=`${p.width} × ${p.height}`;const objectCount=(p.objects||[]).length;return `<button class="project-card" data-project-id="${p.id}"><span class="project-preview" style="background:${projectPreviewStyle(p)}">${objectCount?"✦":"＋"}</span><span class="project-meta"><b>${escapeHTML(p.name)}</b><small>${fmt} · ${objectCount} layer${objectCount===1?"":"s"}</small></span></button>`;}
  function renderProjects(){
    const query=$("#projectSearch")?.value.trim().toLowerCase()||"";const sort=$("#projectSort")?.value||"updated";let list=projects.filter(p=>!query||p.name.toLowerCase().includes(query));
    list.sort((a,b)=>sort==="name"?a.name.localeCompare(b.name):new Date(sort==="created"?b.createdAt:b.updatedAt)-new Date(sort==="created"?a.createdAt:a.updatedAt));
    const html=list.length?list.map(projectCardHTML).join(""):`<div class="empty-state"><b>No projects yet</b>Your first design will appear here automatically.</div>`;
    if($("#allProjects"))$("#allProjects").innerHTML=html;
    const recent=[...projects].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,5);$("#recentProjects").innerHTML=recent.length?recent.map(projectCardHTML).join(""):`<div class="empty-state"><b>Your canvas is waiting</b>Start with a blank design or a template.</div>`;
  }

  function renderSaved(){
    $$("#savedTabs button").forEach(b=>b.classList.toggle("active",b.dataset.saved===state.savedTab));
    const root=$("#savedContent");
    if(state.savedTab==="templates"){const list=TEMPLATES.filter(t=>settings.favoriteTemplates.includes(t.id));root.innerHTML=list.length?`<div class="template-library">${list.map(templateCardHTML).join("")}</div>`:`<div class="empty-state"><b>No favorite templates yet</b>Tap ♡ on any template to keep it here.</div>`;}
    else if(state.savedTab==="palettes"){root.innerHTML=settings.palettes.length?`<div class="saved-list">${settings.palettes.map((p,i)=>`<div class="saved-row"><div><b>${escapeHTML(p.name||`Palette ${i+1}`)}</b><small>${p.colors.join(" · ")}</small></div><div class="swatches">${p.colors.map(c=>`<i style="background:${c}"></i>`).join("")}</div></div>`).join("")}</div>`:`<div class="empty-state"><b>No saved palettes</b>Extract colors from a photo or save one from the editor.</div>`;}
    else if(state.savedTab==="fonts"){const fonts=[...SYSTEM_FONTS,...settings.customFonts];root.innerHTML=`<div class="saved-list">${fonts.map(f=>`<div class="saved-row"><b style="font-family:${escapeHTML(f.value||f.cssFamily||"inherit")}">${escapeHTML(f.name)}</b><small>${f.custom?"Custom font":"Built in"}</small></div>`).join("")}</div>`;}
    else if(state.savedTab==="stickers"){const list=settings.favoriteStickers.length?settings.favoriteStickers:STICKERS.slice(0,18);root.innerHTML=`<div class="sticker-grid">${list.map(s=>`<button class="sticker-button" data-add-sticker="${escapeHTML(s)}">${escapeHTML(s)}</button>`).join("")}</div>${settings.favoriteStickers.length?"":"<div class='hint'>Tip: long-press-style favorites are available in the editor sticker panel.</div>"}`;}
    else {const list=settings.myTemplates||[];root.innerHTML=list.length?`<div class="saved-list">${list.map(t=>`<button class="saved-row" data-my-template="${t.id}"><div><b>${escapeHTML(t.name)}</b><small>Your reusable layout</small></div><span>›</span></button>`).join("")}</div>`:`<div class="empty-state"><b>No reusable templates yet</b>Open a project and choose “Save as Template.”</div>`;}
  }

  function newProject({format="story",name,template=null,width,height}={}){
    const f=FORMATS[format]||FORMATS.story;const p={id:uid("project"),name:name||`Untitled ${f.label}`,format,width:width||f.width,height:height||f.height,bg:{type:"solid",value:"#fff8fb"},objects:[],drawingId:null,audioId:null,beats:[],createdAt:now(),updatedAt:now(),templateSource:null};
    if(template){p.name=template.name;p.format=template.format;p.width=FORMATS[template.format].width;p.height=FORMATS[template.format].height;p.bg=deepClone(template.bg);p.objects=deepClone(template.objects).map(o=>({...o,id:uid(o.type)}));p.templateSource=template.id;}
    projects.unshift(p);saveProjects();openProject(p.id);return p;
  }
  function openProject(id){const p=projects.find(x=>x.id===id);if(!p)return;state.activeProjectId=id;state.selectedIds=[];state.history=[deepClone(p)];state.historyIndex=0;routeTo("editor");fitStage();renderEditor();loadDrawing();}
  function deleteProject(id){const p=projects.find(x=>x.id===id);if(!p)return;projects=projects.filter(x=>x.id!==id);saveProjects();renderProjects();toast("Project deleted");}
  function duplicateProject(id){const src=projects.find(x=>x.id===id);if(!src)return;const p=deepClone(src);p.id=uid("project");p.name=`${src.name} Copy`;p.createdAt=p.updatedAt=now();p.objects=p.objects.map(o=>({...o,id:uid(o.type)}));projects.unshift(p);saveProjects();renderProjects();toast("Project duplicated");}

  function openModal(html){$("#modalContent").innerHTML=html;$("#modal").classList.add("open");$("#modal").setAttribute("aria-hidden","false");document.body.classList.add("modal-open");}
  function closeModal(){$("#modal").classList.remove("open");$("#modal").setAttribute("aria-hidden","true");if(!$("#drawer").classList.contains("open"))document.body.classList.remove("modal-open");}
  function openDrawer(){$("#drawer").classList.add("open");$("#drawer").setAttribute("aria-hidden","false");$("#menuButton").setAttribute("aria-expanded","true");document.body.classList.add("modal-open");}
  function closeDrawer(){$("#drawer").classList.remove("open");$("#drawer").setAttribute("aria-hidden","true");$("#menuButton").setAttribute("aria-expanded","false");if(!$("#modal").classList.contains("open"))document.body.classList.remove("modal-open");}

  function showNewProjectModal(){openModal(`<div class="modal-head"><div><span class="section-kicker">New design</span><h2>Choose a canvas</h2><p>Start blank, use a template, or set your own dimensions.</p></div><button class="modal-close" data-close-modal>×</button></div><div class="modal-grid">${Object.entries(FORMATS).filter(([k])=>k!=="dump").map(([k,f])=>`<button class="modal-choice" data-create-format="${k}"><b>${f.label}</b><small>${f.ratio} · ${f.width} × ${f.height}</small></button>`).join("")}<button class="modal-choice" data-create-format="dump"><b>Photo Dump</b><small>Choose photos + auto layout</small></button><button class="modal-choice" data-custom-canvas><b>Custom size</b><small>Any width and height</small></button></div>`);}
  function showCustomCanvas(){openModal(`<div class="modal-head"><div><span class="section-kicker">Custom canvas</span><h2>Your dimensions</h2><p>Use pixels for precise exports.</p></div><button class="modal-close" data-close-modal>×</button></div><div class="form-stack"><div class="field"><label>Project name</label><input id="customName" value="Custom Design"></div><div class="control-grid"><div class="field"><label>Width (px)</label><input id="customWidth" type="number" min="200" max="6000" value="1080"></div><div class="field"><label>Height (px)</label><input id="customHeight" type="number" min="200" max="6000" value="1350"></div></div><button class="primary-button" id="createCustomButton">Create canvas</button></div>`);}
  function showProjectMenu(){const p=getProject();if(!p)return;openModal(`<div class="modal-head"><div><span class="section-kicker">Project</span><h2>${escapeHTML(p.name)}</h2><p>${p.width} × ${p.height} · autosaved locally</p></div><button class="modal-close" data-close-modal>×</button></div><div class="form-stack"><div class="field"><label>Project name</label><input id="renameProjectInput" value="${escapeHTML(p.name)}"></div><div class="button-row"><button class="primary-button" id="saveProjectName">Save name</button><button class="secondary-button" id="duplicateActiveProject">Duplicate</button><button class="secondary-button" id="saveAsTemplateButton">Save as Template</button><button class="danger-button" id="deleteActiveProject">Delete</button></div></div>`);}
