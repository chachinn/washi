(() => {
'use strict';
const W=window.Washi=window.Washi||{};
W.VERSION='v1.0';
W.RELEASE_STAGE='pre-release';
document.documentElement.dataset.washiVersion='v1.0';

const versionNode=document.querySelector('.drawer-version');
if(versionNode)versionNode.textContent='Washi v1.0 · Creative Studio';

document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target?.closest('[data-action="whats-new"]'))return;
  const title=document.querySelector('#modalContent .modal-title h2');
  if(title&&title.textContent.startsWith('What’s New'))title.textContent='What’s New · v1.0';
});
})();
