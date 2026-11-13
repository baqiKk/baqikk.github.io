// Gece / gündüz geçişi — Kelime Avcısı'ndaki efektin ortak kopyası.
// Flaş bombası gündüze, sis bombası geceye geçirir.
// Sayfada <button id="modeBtn"> (ve isteğe bağlı <span id="modeLabel">) olmalı.
// Seçim "ka_mode" anahtarında saklanır; aynı alan adında olduğu için Kelime Avcısı ile ortak.
// İlk boyamada yanıp sönmeyi önlemek için <head> içinde küçük bir satır içi betik data-mode'u önceden ayarlar.
(function(){
const S={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const BLUR_SEL="[data-fx-blur]";
const ICON_FLASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="9" y="7.5" width="6" height="15" rx=".8"/><path d="M10.3 7.5V5h3.4v2.5"/><path d="M13.7 5l3 1.1v7.4"/><circle cx="8.6" cy="3.6" r="1.7"/><path d="M10.1 4.1L11.2 5"/><circle cx="12" cy="11" r=".85" fill="currentColor" stroke="none"/><circle cx="12" cy="14.6" r=".85" fill="currentColor" stroke="none"/><circle cx="12" cy="18.2" r=".85" fill="currentColor" stroke="none"/></svg>';
const ICON_SMOKE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"><rect x="7.6" y="7.5" width="8.4" height="15" rx="1.1"/><path d="M9.4 7.5V5h4.8v2.5"/><path d="M14.2 5.1l2.9 1.1v7.6"/><circle cx="8.2" cy="3.6" r="1.7"/><path d="M9.6 4.2l.9.8"/><rect x="7.6" y="10.2" width="8.4" height="1.4" fill="currentColor" stroke="none"/><rect x="7.6" y="18.6" width="8.4" height="1.4" fill="currentColor" stroke="none"/></svg>';
const modeBtn=document.getElementById("modeBtn"); if(!modeBtn)return;
function applyMode(m){document.documentElement.dataset.mode=m; const l=m==="light";
  modeBtn.innerHTML=l?ICON_SMOKE:ICON_FLASH; const lb=document.getElementById("modeLabel"); if(lb)lb.textContent=l?"Aydınlık mod":"Karanlık mod"; const t=l?"Gece moduna geç":"Gündüz moduna geç"; modeBtn.title=t; modeBtn.setAttribute("aria-label",t);
  document.dispatchEvent(new Event("modechange"))}
(function(){let m=S.get("ka_mode",null);
  if(!m){const h=document.documentElement.getAttribute("data-theme");
    m=h==="light"||h==="dark"?h:(window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark")}
  applyMode(m)})();
let fxBusy=false;
modeBtn.onclick=()=>{
  if(fxBusy)return;                       // spam koruması: efekt bitene kadar yeni atış yok
  const to=document.documentElement.dataset.mode==="light"?"dark":"light", smoke=to==="dark";
  const done=()=>{S.set("ka_mode",to)};
  const reduceFx=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduceFx||!document.body.animate){applyMode(to);done();return}
  fxBusy=true; modeBtn.disabled=true;
  const release=()=>{fxBusy=false;modeBtn.disabled=false}; const safety=setTimeout(()=>{applyMode(to);done();release();cancelAnimationFrame(smokeRaf);fx.remove()},3400);
  const fx=document.createElement("div"); fx.className="fx"; document.body.appendChild(fx);
  const br=modeBtn.getBoundingClientRect(), sx=br.left+br.width/2, sy=br.top+br.height/2, tx=innerWidth*.5, ty=innerHeight*.48;
  const g=document.createElement("div"); g.className="fx-g"+(smoke?" s":" f"); g.innerHTML=smoke?ICON_SMOKE:ICON_FLASH; fx.appendChild(g);
  // sis: tam ekran tuval üzerinde parçacık duman (uçarken iz, düşünce yayılan bulutlar)
  let smokeLanded=0, smokeRaf=0;
  if(smoke){
    const W=innerWidth,H=innerHeight,vmax=Math.max(W,H),cv=document.createElement("canvas"); cv.className="fx-cv"; cv.width=W; cv.height=H; fx.insertBefore(cv,g);
    const c2=cv.getContext("2d");
    const sprite=(rgb,a)=>{const s=document.createElement("canvas");s.width=s.height=128;const c=s.getContext("2d");
      for(let j=0;j<8;j++){const ox=64+(Math.random()-.5)*46,oy=64+(Math.random()-.5)*46,r=24+Math.random()*26,gr=c.createRadialGradient(ox,oy,0,ox,oy,r);
        gr.addColorStop(0,`rgba(${rgb},${a})`);gr.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=gr;c.beginPath();c.arc(ox,oy,r,0,7);c.fill()}return s};
    const big=[sprite("38,41,44",.5),sprite("30,33,36",.55),sprite("48,52,56",.45)], small=[sprite("110,116,120",.45),sprite("90,96,100",.45)];
    let parts=[], last=performance.now();
    const emit=(x,y,n,isBig)=>{for(let i=0;i<n;i++){const a=Math.random()*6.283,sp=isBig?vmax*(.25+Math.random()*.8):8+Math.random()*26;
      parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(isBig?0:18),r:isBig?18+Math.random()*26:4+Math.random()*6,gr:isBig?vmax*(.2+Math.random()*.3):16+Math.random()*16,
        rot:Math.random()*6.28,vr:(Math.random()-.5)*1.1,amax:isBig?.8+Math.random()*.2:.4+Math.random()*.25,life:0,ttl:isBig?0:.6+Math.random()*.4,s:(isBig?big:small)[i%(isBig?3:2)],seed:Math.random()*100})}};
    const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;
      if(!smokeLanded){const b=g.getBoundingClientRect();emit(b.left+b.width/2,b.top+b.height*.25,2,false)}
      else if(now-smokeLanded<480){emit(tx+(Math.random()-.5)*30,ty+(Math.random()-.5)*30,3,true)}
      // genişleyen sis cephesi: ekranın her yerine, köşeler dahil, bulut düşsün
      if(smokeLanded&&now-smokeLanded<700){const u=(now-smokeLanded)/700,R=vmax*(.12+.85*u);
        for(let i=0;i<3;i++){const a=Math.random()*6.283,d=R*(.75+Math.random()*.35),px=Math.max(-40,Math.min(W+40,tx+Math.cos(a)*d)),py=Math.max(-40,Math.min(H+40,ty+Math.sin(a)*d));
          const n=parts.length;emit(px,py,1,true);const q=parts[n];q.vx*=.25;q.vy*=.25;q.r=vmax*.06;q.gr=vmax*(.16+Math.random()*.18)}}
      c2.clearRect(0,0,W,H);
      if(smokeLanded){const u=Math.min(1,(now-smokeLanded)/720);c2.fillStyle=`rgba(4,5,6,${.94*u*u*(3-2*u)})`;c2.fillRect(0,0,W,H)}
      for(const q of parts){q.life+=dt;const k=Math.exp(-2.6*dt);q.vx*=k;q.vy*=k;q.vy-=7*dt;q.vx+=Math.sin(q.seed+q.life*2.2)*14*dt;
        q.x+=q.vx*dt;q.y+=q.vy*dt;q.r+=q.gr*dt*Math.exp(-q.life*1.5);q.rot+=q.vr*dt;
        const a=q.amax*Math.min(1,q.life/.16)*(q.ttl?Math.max(0,1-q.life/q.ttl):1);if(a<.01)continue;
        c2.save();c2.globalAlpha=a;c2.translate(q.x,q.y);c2.rotate(q.rot);c2.drawImage(q.s,-q.r,-q.r,2*q.r,2*q.r);c2.restore()}
      parts=parts.filter(q=>!q.ttl||q.life<q.ttl);
      smokeRaf=requestAnimationFrame(loop)};
    smokeRaf=requestAnimationFrame(loop);
  }
  const kf=[]; for(let i=0;i<=10;i++){const u=i/10, px=sx+(tx-sx)*u, py=sy+(ty-sy)*u-Math.sin(u*Math.PI)*Math.min(160,innerHeight*.22);
    kf.push({transform:`translate(${px-14}px,${py-14}px) rotate(${-u*560}deg)`})}
  g.animate(kf,{duration:560,easing:"cubic-bezier(.35,.1,.6,1)",fill:"forwards"}).onfinish=()=>{
    if(smoke){
      smokeLanded=performance.now();
      g.animate([{opacity:1},{opacity:0}],{duration:380,delay:120,fill:"forwards"});
      setTimeout(()=>{applyMode(to);done();
        fx.animate([{opacity:1},{opacity:0}],{duration:540,easing:"ease-in-out",fill:"forwards"}).onfinish=()=>{cancelAnimationFrame(smokeRaf);fx.remove();clearTimeout(safety);release()}},720);
    }else{
      g.animate([{opacity:1},{opacity:0}],{duration:60,delay:140,fill:"forwards"});
      setTimeout(()=>{
        const fl=document.createElement("div"); fl.className="fx-flash"; fl.style.setProperty("--x",tx+"px"); fl.style.setProperty("--y",ty+"px"); fx.appendChild(fl);
        const a=fl.animate([{opacity:0},{opacity:.93,offset:.08},{opacity:.93,offset:.3},{opacity:0}],{duration:1150,easing:"ease-out",fill:"forwards"});
        // patlama: şok dalgası, kıvılcımlar, yatay parlama çizgisi ve flaş sonrası göz izi
        const W=innerWidth,H=innerHeight,vmax=Math.max(W,H),cv=document.createElement("canvas");cv.className="fx-cv";cv.width=W;cv.height=H;fx.appendChild(cv);
        const c3=cv.getContext("2d"),t1=performance.now();let lastF=t1,fr=0;
        const sparks=Array.from({length:46},()=>{const an=Math.random()*6.283,sp=500+Math.random()*1100;return{x:tx,y:ty,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,life:0,ttl:.35+Math.random()*.55,w:1+Math.random()*1.6}});
        const fl2=now=>{const dt=Math.max(0,Math.min(.05,(now-lastF)/1000));lastF=now;const el=Math.max(0,(now-t1)/1000);c3.clearRect(0,0,W,H);
          // göz izi: parlamadan sonra ortada yavaşça sönen renkli leke
          if(el>.3){const k=Math.max(0,1-(el-.3)/.85);const g2=c3.createRadialGradient(tx,ty,0,tx,ty,vmax*.22);g2.addColorStop(0,`rgba(150,110,200,${.28*k})`);g2.addColorStop(.5,`rgba(90,170,160,${.12*k})`);g2.addColorStop(1,"rgba(90,170,160,0)");c3.fillStyle=g2;c3.fillRect(0,0,W,H)}
          c3.globalCompositeOperation="lighter";
          if(el<.5){const u=el/.5,R=vmax*.9*(1-Math.pow(1-u,3));c3.strokeStyle=`rgba(255,248,225,${.9*(1-u)})`;c3.lineWidth=2+10*(1-u);c3.beginPath();c3.arc(tx,ty,R,0,7);c3.stroke()}
          if(el<.65){const u=el/.65,hw=W*(.15+.85*Math.min(1,u*2.2)),hh=2+5*(1-u),g3=c3.createLinearGradient(tx-hw,0,tx+hw,0);
            g3.addColorStop(0,"rgba(180,220,255,0)");g3.addColorStop(.5,`rgba(255,255,255,${.95*(1-u)})`);g3.addColorStop(1,"rgba(180,220,255,0)");c3.fillStyle=g3;c3.fillRect(tx-hw,ty-hh,2*hw,2*hh)}
          for(const s of sparks){s.life+=dt;if(s.life>s.ttl)continue;const k=Math.exp(-3.2*dt);s.vx*=k;s.vy=s.vy*k+260*dt;const ox=s.x,oy=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;
            const al=1-s.life/s.ttl;c3.strokeStyle=`rgba(255,${200+Math.round(55*al)},${120+Math.round(100*al)},${al})`;c3.lineWidth=s.w;c3.beginPath();c3.moveTo(ox-(s.x-ox)*1.5,oy-(s.y-oy)*1.5);c3.lineTo(s.x,s.y);c3.stroke()}
          c3.globalCompositeOperation="source-over";
          if(el<1.25)fr=requestAnimationFrame(fl2)};
        fr=requestAnimationFrame(fl2);
        setTimeout(()=>{applyMode(to);done()},110);
        document.querySelectorAll(BLUR_SEL).forEach(el=>el.animate([{filter:"blur(2.5px) brightness(1.5)"},{filter:"none"}],{duration:900,delay:120,easing:"ease-out"}));
        a.onfinish=()=>{cancelAnimationFrame(fr);fx.remove();clearTimeout(safety);release()};
      },200);
    }
  };
};

})();
