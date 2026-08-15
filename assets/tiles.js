/* Tile-fall page transition */
(function(){
  var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SHADES=['#33241a','#3a2a1e','#2c1f16','#41301f','#372718'];
  function buildOverlay(){
    var ov=document.createElement('div');ov.className='tilefx';
    var ts=Math.ceil(Math.max(16,Math.sqrt(window.innerWidth*window.innerHeight/1400)));
    var cols=Math.ceil(window.innerWidth/ts),rows=Math.ceil(window.innerHeight/ts);
    ov.style.gridTemplateColumns='repeat('+cols+',1fr)';
    ov.style.gridTemplateRows='repeat('+rows+',1fr)';
    var tiles=[];
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
      var t=document.createElement('div');t.className='tile';
      t.style.background=SHADES[(r*7+c*13)%SHADES.length];
      tiles.push({el:t,r:r,c:c});
      ov.appendChild(t);
    }
    document.body.appendChild(ov);
    return {ov:ov,tiles:tiles};
  }
  /* ARRIVAL: page loads pre-covered, tiles rain off to reveal it */
  var covered=document.documentElement.classList.contains('tilecover');
  if(covered){
    try{sessionStorage.removeItem('tileNav');}catch(e){}
    if(reduced){
      document.documentElement.classList.remove('tilecover');
    }else{
      var g=buildOverlay();
      document.documentElement.classList.remove('tilecover');
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        g.tiles.forEach(function(t){
          var d=Math.round(t.r*45+Math.random()*380);
          t.el.style.transition='transform .85s cubic-bezier(.5,0,.85,.4) '+d+'ms, opacity .85s ease-in '+d+'ms';
          t.el.style.transform='translateY(115vh) rotate('+Math.round(Math.random()*50-25)+'deg)';
          t.el.style.opacity='0.9';
        });
        setTimeout(function(){if(g.ov.parentNode)g.ov.parentNode.removeChild(g.ov);},1900);
      });});
    }
  }
  /* EXIT: tile the page over, then navigate */
  if(reduced)return;
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
    var g=buildOverlay();
    g.tiles.forEach(function(t){
      t.el.style.opacity='0';
      t.el.style.transform='translateY(-26px) scale(.85)';
      t.el.style.transition='transform .18s ease-out '+Math.round(Math.random()*240)+'ms, opacity .18s ease-out '+Math.round(Math.random()*240)+'ms';
    });
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      g.tiles.forEach(function(t){t.el.style.opacity='1';t.el.style.transform='none';});
    });});
    setTimeout(function(){
      try{sessionStorage.setItem('tileNav','1');}catch(err){}
      location.href=href;
    },520);
  },true);
  /* back/forward cache: never leave a stale overlay up */
  window.addEventListener('pageshow',function(e){
    if(e.persisted){
      var o=document.querySelector('.tilefx');
      if(o&&o.parentNode)o.parentNode.removeChild(o);
      document.documentElement.classList.remove('tilecover');
    }
  });
})();
