(() => {
'use strict';const C=window.Washi?.WashiCatalogV3;if(!C)return;
C.layoutA=(kind,cat,f,th,r,n)=>{const{P,B,X,D}=C.wrap(f,th),a=[];
switch(kind){
case'hero':{const i=.04+r()*.05,t=.18+r()*.06;C.title(a,cat,th,f,r);a.push(P(i,t,1-i*2,.58+r()*.16,18+r()*20,r()>.75?(r()-.5)*6:0));if(r()>.5)a.push(B(.06,.84,.36,.055,th.a,999));break}
case'split':{C.title(a,cat,th,f,r);if(r()>.5){const c=.36+r()*.24;a.push(P(.05,.18,c-.07,.67,12));a.push(P(c,.18,.95-c,.67,12))}else{const c=.46+r()*.16;a.push(P(.05,.18,.9,c-.18,12));a.push(P(.05,c+.02,.9,.86-c,12))}break}
case'grid':C.title(a,cat,th,f,r);C.grid(n,.055,.014+r()*.012).forEach((q,i)=>a.push(P(...q,8+r()*12,(r()-.5)*2,`Photo ${i+1}`)));break;
case'mosaic':C.title(a,cat,th,f,r);C.rects(Math.max(3,n),r).forEach((q,i)=>a.push(P(...q,8+r()*22,(r()-.5)*5,`Photo ${i+1}`)));break;
case'dense':C.title(a,cat,th,f,r);C.grid(Math.max(7,n),.035,.008).forEach((q,i)=>a.push(P(...q,2+r()*8,0,`Frame ${i+1}`)));break;
case'stack':{C.title(a,cat,th,f,r);const k=Math.max(2,Math.min(5,n));for(let i=0;i<k;i++){const w=.5+r()*.2,h=.28+r()*.17,x=.12+r()*(.76-w),y=.2+i*(.58/Math.max(1,k-1))-.07,rot=(i-k/2)*2;a.push(B(x-.025,y-.025,w+.05,h+.065,th.paper,5,{rotation:rot}));a.push(P(x,y,w,h,4,rot,`Photo ${i+1}`))}break}
case'overlap':{C.title(a,cat,th,f,r);const k=Math.max(3,Math.min(6,n));for(let i=0;i<k;i++){const w=.34+r()*.25,h=.24+r()*.22,x=.06+r()*(.88-w),y=.17+r()*(.66-h),rot=(r()-.5)*12;a.push(B(x-.018,y-.02,w+.036,h+.055,th.paper,4,{rotation:rot}));a.push(P(x,y,w,h,3,rot,`Photo ${i+1}`))}break}
case'scrapbook':{C.title(a,cat,th,f,r);const k=Math.max(3,Math.min(7,n));for(let i=0;i<k;i++){const w=.26+r()*.28,h=.2+r()*.25,x=.05+r()*(.9-w),y=.18+r()*(.66-h),rot=(r()-.5)*14;a.push(P(x,y,w,h,12,rot,`Photo ${i+1}`));if(i<3)a.push(B(x+.04,y-.012,w*.55,.025,th.b,2,{rotation:rot+(r()-.5)*8,opacity:.82}))}a.push(D('✦',.82,.78,.08));break}
case'paper':{C.title(a,cat,th,f,r);a.push(B(.05,.17,.9,.7,th.paper,4,{rotation:(r()-.5)*2}));for(let i=0;i<Math.max(2,Math.min(5,n));i++){const w=.31+r()*.28,h=.22+r()*.25,x=.08+r()*(.84-w),y=.2+r()*(.6-h),rot=(r()-.5)*9;a.push(B(x-.02,y-.02,w+.04,h+.04,i%2?th.bg:th.b,3,{rotation:rot}));a.push(P(x,y,w,h,4,rot,`Photo ${i+1}`))}a.push(D('📎',.83,.18,.07));break}
case'filmV':{C.title(a,cat,th,f,r);a.push(B(.22,.17,.56,.72,'#171717',2));const k=Math.max(3,Math.min(6,n)),h=.62/k;for(let i=0;i<k;i++)a.push(P(.28,.21+i*h,.44,h-.014,1,0,`Frame ${i+1}`));a.push(X('FILM 400 · 01',.24,.84,.5,.025,.018,'#fff',{font:'Courier New, monospace',letterSpacing:2,align:'center'}));break}
case'filmH':{C.title(a,cat,th,f,r);a.push(B(.04,.34,.92,.34,'#171717',2));const k=Math.max(3,Math.min(7,n)),w=.84/k;for(let i=0;i<k;i++)a.push(P(.08+i*w,.38,w-.012,.26,1,0,`Frame ${i+1}`));break}
case'contact':C.title(a,cat,th,f,r);C.grid(Math.max(6,Math.min(12,n)),.05,.008).forEach((q,i)=>a.push(P(...q,1,0,`Frame ${i+1}`)));break;
case'frame':{C.title(a,cat,th,f,r,'center');const w=.48+r()*.24,h=.38+r()*.28,x=(1-w)/2,y=.18+r()*.05;a.push(B(x-.035,y-.035,w+.07,h+.09,th.paper,3,{border:th.ink,borderWidth:2}));a.push(P(x,y,w,h,2));break}
case'negative':{const left=r()>.5;a.push(P(left?0:.42,0,.58,1,0));a.push(B(left?.58:0,0,.42,1,th.bg,0));C.title(a,cat,th,f,r,'center');break}
case'polaroid':{C.title(a,cat,th,f,r);const k=Math.max(2,Math.min(4,n));for(let i=0;i<k;i++){const w=.32+r()*.18,h=.27+r()*.17,x=.08+r()*(.84-w),y=.2+i*.17+r()*.06,rot=(r()-.5)*10;a.push(B(x-.025,y-.025,w+.05,h+.085,th.paper,3,{rotation:rot}));a.push(P(x,y,w,h,2,rot,`Photo ${i+1}`))}break}
case'triptych':C.title(a,cat,th,f,r);if(r()>.45){for(let i=0;i<3;i++)a.push(P(.09+i*.285,.2,.25,.62,2,(r()-.5)*2))}else{for(let i=0;i<3;i++)a.push(P(.12,.2+i*.215,.76,.18,2,(r()-.5)*2))}break;
case'magazine':a.push(P(.03,.03,.94,.94,0));a.push(X('WASHI',.05,.035,.9,.11,.095,'#fff',{bold:true,letterSpacing:6}));a.push(X((C.COPY[cat]||['THE EDIT'])[0],.05,.68,.72,.16,.072,'#fff',{bold:true}));a.push(X('ISSUE '+String(1+Math.floor(r()*24)).padStart(2,'0'),.68,.87,.25,.04,.02,'#fff',{align:'right',letterSpacing:2}));break;
case'side':C.title(a,cat,th,f,r,'side');a.push(P(.25,.09,.68,.75,2));if(r()>.5)a.push(B(.6,.7,.28,.06,th.a,999));break;
case'poster':a.push(X((C.COPY[cat]||['NEW'])[0].toUpperCase(),.05,.08,.9,.23,.11,th.ink,{bold:true,letterSpacing:r()>.5?5:0,align:r()>.55?'center':'left'}));if(n)a.push(P(.08,.38,.84,.38+r()*.22,12));a.push(X((C.COPY[cat]||['','MAKE IT YOURS'])[1],.08,.84,.8,.07,.03,th.ink,{italic:r()>.5}));break;
case'cards':{C.title(a,cat,th,f,r);const k=3+Math.floor(r()*4);for(let i=0;i<k;i++){const y=.21+i*(.59/k),w=.64+r()*.2;a.push(B(.08,y,w,.08+r()*.035,i%2?th.paper:th.b,12));a.push(X(String(i+1).padStart(2,'0'),.1,y+.018,.08,.04,.022,th.a,{bold:true}))}if(n)a.push(P(.72,.2,.22,.56,12,(r()-.5)*5));break}
case'calendar':C.title(a,cat,th,f,r);C.grid(Math.max(6,Math.min(12,n)),.06,.012).forEach((q,i)=>a.push(P(...q,8,0,`Day ${i+1}`)));a.push(X('01 02 03 04 05 06 07',.07,.89,.86,.03,.018,th.ink,{font:'Courier New, monospace',letterSpacing:2,align:'center'}));break;
case'timeline':{C.title(a,cat,th,f,r);a.push(B(.18,.22,.012,.6,th.a,999));const k=3+Math.floor(r()*3);for(let i=0;i<k;i++){const y=.23+i*(.55/(k-1));a.push(B(.15,y,.07,.07,th.paper,999,{border:th.a,borderWidth:2}));if(n)a.push(P(.3,y-.04,.58,.13,10));a.push(X(String(i+1).padStart(2,'0'),.16,y+.018,.05,.03,.018,th.ink,{align:'center',bold:true}))}break}
default:return null}return a.map(o=>({...o,locked:false,visible:o.visible!==false}))};
})();
