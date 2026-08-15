/* Page-shatter transition: the old page's snapshot shatters over the new page */
(function(){
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clearFlags(){
    try{sessionStorage.removeItem('tileNav');sessionStorage.removeItem('tileSnap');}catch(e){}
  }

  /* Generic engine: cover the screen with `src` (canvas or image sized to the
     viewport) and shatter it into falling tiles over whatever is beneath. */
  window.tileShatter=function(src){
    var W=window.innerWidth,H=window.innerHeight;
    var cv=document.createElement('canvas');cv.className='tilecv';
    cv.width=src.width;cv.height=src.height;
    var scale=src.width/W;
    document.body.appendChild(cv);
    var ctx=cv.getContext('2d');
    ctx.drawImage(src,0,0);
    shatterRun(cv,ctx,src,W,H,scale);
  };

  /* ARRIVAL: new page loads covered by the old page's snapshot, which shatters off */
  var covered=document.documentElement.classList.contains('tilecover');
  if(covered){
    var snap=null;
    try{snap=sessionStorage.getItem('tileSnap');}catch(e){}
    clearFlags();
    if(!snap||reduced){
      document.documentElement.classList.remove('tilecover');
    }else{
      var bail=setTimeout(function(){
        document.documentElement.classList.remove('tilecover');
      },900);
      var img=new Image();
      img.onload=function(){
        clearTimeout(bail);
        window.tileShatter(img);
        document.documentElement.classList.remove('tilecover'); // new page live beneath the cover
      };
      img.onerror=function(){
        clearTimeout(bail);
        document.documentElement.classList.remove('tilecover');
      };
      img.src=snap;
    }
  }

  function shatterRun(cv,ctx,img,W,H,scale){
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
      ctx.clearRect(0,0,cv.width,cv.height);   // transparent: the real new page shows through
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
            ctx.drawImage(img,p.x*scale,p.y*scale,tss,tss,-tss/2,-tss/2,tss,tss);
            ctx.restore();
          }else{
            ctx.drawImage(img,p.x*scale,p.y*scale,tss,tss,p.x*scale,(p.y+dy)*scale,tss,tss);
          }
        }
      }
      if(alive){requestAnimationFrame(frame);}
      else if(cv.parentNode){cv.parentNode.removeChild(cv);}
    }
    requestAnimationFrame(frame);
  }

  /* EXIT: snapshot the page, stash it, navigate immediately */
  if(reduced)return;
  var busy=false;
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
    function go(withSnap){
      if(withSnap===false)clearFlags();
      location.href=href;
    }
    if(!window.html2canvas){go(false);return;}
    var fired=false;
    var to=setTimeout(function(){fired=true;go(false);},1500);
    try{
      window.html2canvas(document.body,{
        x:window.scrollX,y:window.scrollY,
        width:window.innerWidth,height:window.innerHeight,
        windowWidth:window.innerWidth,windowHeight:window.innerHeight,
        scale:Math.min(window.devicePixelRatio||1,1.5),
        useCORS:true,logging:false
      }).then(function(canvas){
        clearTimeout(to);
        if(fired)return;
        try{
          sessionStorage.setItem('tileSnap',canvas.toDataURL('image/jpeg',0.72));
          sessionStorage.setItem('tileNav','1');
          go(true);
        }catch(err){go(false);}
      }).catch(function(){clearTimeout(to);if(!fired)go(false);});
    }catch(err){clearTimeout(to);if(!fired)go(false);}
  },true);

  /* back/forward cache: never leave stale overlays up */
  window.addEventListener('pageshow',function(e){
    if(e.persisted){
      busy=false;
      var o=document.querySelector('.tilecv');
      if(o&&o.parentNode)o.parentNode.removeChild(o);
      document.documentElement.classList.remove('tilecover');
    }
  });
})();
