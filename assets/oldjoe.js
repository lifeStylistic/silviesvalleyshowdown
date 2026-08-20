/* "Old Joe!" — nav link pops up the legend himself and plays his ballad */
(function(){
  var au=null;
  function stop(){if(au)au.pause();}
  function close(ov){
    stop();
    ov.classList.remove('on');
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},320);
  }
  function open(){
    if(!au)au=new Audio('assets/audio/old-joe-rides-again.mp3');
    var ov=document.createElement('div');ov.className='oj-ov';
    ov.innerHTML='<div class="oj-card">'+
      '<img src="assets/img/old-joe.jpg" alt="Old Joe in full glory">'+
      '<div class="oj-cap">Old Joe Rides Again</div>'+
      '<button class="oj-x" type="button" aria-label="Close">&times;</button></div>';
    document.body.appendChild(ov);
    requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('on');});});
    try{au.currentTime=0;}catch(e){}
    var p=au.play();
    if(p&&p.catch)p.catch(function(){});
    ov.addEventListener('click',function(e){
      if(e.target===ov||e.target.closest('.oj-x'))close(ov);
    });
    function esc(e){if(e.key==='Escape'){close(ov);document.removeEventListener('keydown',esc);}}
    document.addEventListener('keydown',esc);
  }
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('.oldjoe-link'):null;
    if(!a)return;
    e.preventDefault();e.stopPropagation();
    open();
  },true);
})();
