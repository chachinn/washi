(() => {
'use strict';
const W=window.Washi=window.Washi||{};
function canvasBlob(canvas,type='image/png',quality=.94){return new Promise(resolve=>canvas.toBlob(resolve,type,quality))}
async function exportProject(project,{format='png',quality=.94,share=false}={}){const canvas=await W.Export.renderProject(project);let mime='image/png',ext='png';if(format==='jpg'||format==='jpeg'){mime='image/jpeg';ext='jpg'}if(format==='webp'){mime='image/webp';ext='webp'}let blob=await canvasBlob(canvas,mime,quality);if(!blob&&mime==='image/webp'){mime='image/png';ext='png';blob=await canvasBlob(canvas,mime,quality)}if(!blob)throw new Error('Export failed');const safe=(project.name||'Washi Design').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-')||'washi-design';const file=new File([blob],`${safe}.${ext}`,{type:mime});if(share&&navigator.share&&navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:project.name||'Washi design'});return{file,shared:true,url:null}}return{file,shared:false,url:URL.createObjectURL(blob)}}
W.Export.exportProject=exportProject;
})();