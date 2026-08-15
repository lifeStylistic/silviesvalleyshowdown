/* Page-shatter transition: the live page breaks into tiles of itself and falls away */
(function(){
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ARRIVAL: page loads black, quick fade-in */
  var covered=document.documentElement.classList.contains('tilecover');
  if(covered){
    try{sessionStorage.removeItem('tileNav');}catch(e){}
    var f=document.createElement('div');f.className='tilefade';
    document.body.appendChild(f);
    document.documentElement.classList.remove('tilecover');
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      f.style.opacity='0';
      setTimeout(function(){if(f.parentNode)f.parentNode.removeChild(f);},450);
    });});
  }

  if(reduced)return;
  var busy=false;

  function shatter(snap,nav){
    var W=window.innerWidth,H=window.innerHeight;
    var scale=snap.width/W;
    var cv=document.createElement('canvas');cv.className='tilecv';
    cv.width=snap.width;cv.height=snap.height;
    document.body.appendChild(cv);
    var ctx=cv.getContext('2d');
    ctx.drawImage(snap,0,0);
    var ts=Math.ceil(Math.max(16,Math.sqrt(W*H/1400)));
    var cols=Math.ceil(W/ts),rows=Math.ceil(H/ts);
    var tiles=[];
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
      tiles.push({x:c*ts,y:r*ts,
        delay:(r/rows)*550+Math.random()*350,
        vy:40+Math.random()*160,
        vr:(Math.random()-0.5)*3});
    }
    var G=2800,tss=ts*scale,start=null;
    function frame(tm){
      if(start===null)start=tm;
      var t=(tm-start)/1000,alive=false;
      ctx.fillStyle='#000';
      ctx.fillRect(0,0,cv.width,cv.height);
      for(var i=0;i<tiles.length;i++){
        var p=tiles[i],lt=t-p.delay/1000;
        var dy=0,rot=0;
        if(lt>0){dy=p.vy*lt+0.5*G*lt*lt;rot=p.vr*lt;}
        if(p.y+dy<H+ts*2){
          alive=true;
          if(rot){
            ctx.save();
            ctx.translate((p.x+ts/2)*scale,(p.y+dy+ts/2)*scale);
            ctx.rotate(rot*0.25);
            ctx.drawImage(snap,p.x*scale,p.y*scale,tss,tss,-tss/2,-tss/2,tss,tss);
            ctx.restore();
          }else{
            ctx.drawImage(snap,p.x*scale,p.y*scale,tss,tss,p.x*scale,(p.y+dy)*scale,tss,tss);
          }
        }
      }
      if(alive){requestAnimationFrame(frame);}
      else{setTimeout(nav,120);}
    }
    requestAnimationFrame(frame);
  }

  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a'):null;
    if(!a)return;
    if(a.target==='_blank'||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var raw=a.getAttribute('href')||'';
    if(!raw||raw.charAt(0)==='#')return;
    var u;try{u=new URL(a.href,location.href);}catch(err){return;}
    if(u.origin!==location.origin)return;          // external links untouched
    if(u.pathname===location.pathname)return;      // same-page anchors untouched
    var href=u.href;
    e.preventDefault();
    if(busy)return;busy=true;
    function nav(){
      try{sessionStorage.setItem('tileNav','1');}catch(err){}
      location.href=href;
    }
    if(!window.html2canvas){nav();return;}
    var fired=false;
    var to=setTimeout(function(){fired=true;nav();},1500); // snapshot too slow -> plain nav
    try{
      window.html2canvas(document.body,{
        x:window.scrollX,y:window.scrollY,
        width:window.innerWidth,height:window.innerHeight,
        windowWidth:window.innerWidth,windowHeight:window.innerHeight,
        scale:Math.min(window.devicePixelRatio||1,2),
        useCORS:true,logging:false
      }).then(function(snap){
        clearTimeout(to);
        if(!fired)shatter(snap,nav);
      }).catch(function(){clearTimeout(to);if(!fired)nav();});
    }catch(err){clearTimeout(to);if(!fired)nav();}
  },true);

  /* back/forward cache: never leave stale overlays up */
  window.addEventListener('pageshow',function(e){
    if(e.persisted){
      busy=false;
      var o=document.querySelector('.tilecv'),g=document.querySelector('.tilefade');
      if(o&&o.parentNode)o.parentNode.removeChild(o);
      if(g&&g.parentNode)g.parentNode.removeChild(g);
      document.documentElement.classList.remove('tilecover');
    }
  });
})();
