
(() => {
  'use strict';
  const GRID=20, CELL=24, BASE_TICK=140;
  function targetForLevel(n){return 5+(n-1)*3;}
  const canvas=document.getElementById('game-canvas'),ctx=canvas.getContext('2d');
  const $=id=>document.getElementById(id);
  const scoreEl=$('score'),highEl=$('high-score'),levelEl=$('level'),targetEl=$('target');
  const overlay=$('overlay'),titleEl=$('overlay-title'),textEl=$('overlay-text'),eyebrowEl=$('overlay-eyebrow');
  const modeButtons=$('mode-buttons'),startButton=$('start-button'),pauseButton=$('pause-button');
  const menuButton=$('menu-button'),statusEl=$('game-status'),modeLabel=$('mode-label'),objectiveEl=$('objective-text'),mobilePauseButton=$('mobile-pause-button');
  let snake=[],direction={x:1,y:0},queuedDirection={x:1,y:0},food={x:0,y:0};
  let score=0,level=1,levelScore=0,mode=null,state='menu',timer=null;
  let highScore=Number(localStorage.getItem('snake-high-score')||0);
  highEl.textContent=pad(highScore);
  function pad(n){return String(n).padStart(3,'0')}
  function initSnake(){const m=Math.floor(GRID/2);snake=[{x:m,y:m},{x:m-1,y:m},{x:m-2,y:m}];direction={x:1,y:0};queuedDirection={x:1,y:0};}
  function spawnFood(){let p;do{p={x:Math.floor(Math.random()*GRID),y:Math.floor(Math.random()*GRID)}}while(snake.some(s=>s.x===p.x&&s.y===p.y));return p}
  function updateHud(){scoreEl.textContent=pad(score);highEl.textContent=pad(highScore);levelEl.textContent=mode==='levels'?level:'—';targetEl.textContent=mode==='levels'?`${levelScore}/${targetForLevel(level)}`:'—';}
  function chooseMode(chosen){mode=chosen;modeButtons.classList.add('hidden');startButton.classList.remove('hidden');startButton.textContent='PRESS SPACE TO START';titleEl.textContent=chosen==='free'?'Free Run':'Level Mode';eyebrowEl.textContent=chosen==='free'?'ENDLESS / WALL WRAP':'LEVELS / SCORE TARGET';textEl.textContent=chosen==='free'?'Walls wrap around. Survive as long as you can.':'Collect an increasing number of nodes to advance.';modeLabel.textContent=chosen==='free'?'FREE RUN':'LEVEL MODE';objectiveEl.textContent=chosen==='free'?'Collect nodes, wrap through the walls, and avoid your own trail.':'Collect 5 nodes per level. Levels gradually get faster.';state='ready';statusEl.textContent='READY';}
  function begin(){if(!mode)return;if(state==='running')return;if(state==='paused'){resume();return}if(state!=='levelComplete')resetGame();state='running';hideOverlay();pauseButton.disabled=false;pauseButton.innerHTML='PAUSE <span>P</span>';mobilePauseButton.textContent='Ⅱ PAUSE';statusEl.textContent='RUNNING';setTimer();}
  function resetGame(){initSnake();score=0;level=1;levelScore=0;food=spawnFood();updateHud();draw();}
  function setTimer(){clearInterval(timer);const speed=Math.max(65,BASE_TICK-(mode==='levels'?(level-1)*10:0));timer=setInterval(tick,speed);}
  function pause(){if(state!=='running')return;state='paused';clearInterval(timer);showOverlay('PAUSED','Game paused.','Press P or Space to resume.');pauseButton.innerHTML='RESUME <span>P</span>';mobilePauseButton.textContent='▶ RESUME';statusEl.textContent='PAUSED';}
  function resume(){if(state!=='paused')return;state='running';hideOverlay();statusEl.textContent='RUNNING';pauseButton.innerHTML='PAUSE <span>P</span>';mobilePauseButton.textContent='Ⅱ PAUSE';setTimer();}
  function hideOverlay(){overlay.classList.add('hidden')}
  function showOverlay(eyebrow,title,desc){overlay.classList.remove('hidden');eyebrowEl.textContent=eyebrow;titleEl.textContent=title;textEl.textContent=desc;modeButtons.classList.add('hidden');startButton.classList.add('hidden')}
  function gameOver(){
    state='over';
    clearInterval(timer);
    showOverlay('RUN ENDED','Game over.',`Final score: ${score}. Tap below or press Space to try again.`);
    modeButtons.classList.add('hidden');
    startButton.classList.remove('hidden');
    startButton.textContent='PLAY AGAIN';
    pauseButton.disabled=true;
    statusEl.textContent='GAME OVER';
  }
  function levelAdvance(){state='levelComplete';clearInterval(timer);level++;levelScore=0;initSnake();food=spawnFood();updateHud();draw();showOverlay('LEVEL CLEARED',`Level ${level-1} complete!`,`Collect ${targetForLevel(level)} nodes to clear Level ${level}. Press Space to continue.`);startButton.classList.remove('hidden');startButton.textContent='CONTINUE';statusEl.textContent='LEVEL CLEAR';}
  function tick(){direction=queuedDirection;let head={x:snake[0].x+direction.x,y:snake[0].y+direction.y};const eating=head.x===food.x&&head.y===food.y;
    if(mode==='free'){head.x=(head.x+GRID)%GRID;head.y=(head.y+GRID)%GRID;}
    const body=eating?snake:snake.slice(0,-1);
    const wall=mode==='levels'&&(head.x<0||head.x>=GRID||head.y<0||head.y>=GRID);
    if(wall||body.some(s=>s.x===head.x&&s.y===head.y)){gameOver();draw();return}
    snake.unshift(head);if(eating){score++;levelScore++;if(score>highScore){highScore=score;localStorage.setItem('snake-high-score',String(highScore));}food=spawnFood();updateHud();if(mode==='levels'&&levelScore>=targetForLevel(level)){levelAdvance();return}}else snake.pop();draw();}
  function change(dx,dy){if(dx===-direction.x&&dy===-direction.y)return;queuedDirection={x:dx,y:dy};}
  function draw(){ctx.fillStyle='#061d2c';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='rgba(191,200,217,.045)';ctx.lineWidth=1;for(let i=0;i<=GRID;i++){let p=i*CELL;ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,canvas.height);ctx.stroke();ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(canvas.width,p);ctx.stroke();}
    ctx.fillStyle='#FCBA04';ctx.shadowColor='#FCBA04';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(food.x*CELL+CELL/2,food.y*CELL+CELL/2,CELL*.31,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    snake.forEach((s,i)=>{ctx.fillStyle=i===0?'#F7F7F2':'#2D848A';ctx.beginPath();ctx.roundRect(s.x*CELL+3,s.y*CELL+3,CELL-6,CELL-6,5);ctx.fill()});drawEyes();}
  function drawEyes(){if(!snake.length)return;let h=snake[0],cx=h.x*CELL+CELL/2,cy=h.y*CELL+CELL/2,a,b;if(direction.x===1){a=[cx+5,cy-4];b=[cx+5,cy+4]}else if(direction.x===-1){a=[cx-5,cy-4];b=[cx-5,cy+4]}else if(direction.y===-1){a=[cx-4,cy-5];b=[cx+4,cy-5]}else{a=[cx-4,cy+5];b=[cx+4,cy+5]}ctx.fillStyle='#061d2c';[a,b].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,1.8,0,Math.PI*2);ctx.fill()});}
  document.addEventListener('keydown',e=>{const k=e.key.toLowerCase(),map={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};if(map[k]&&state==='running'){e.preventDefault();change(...map[k]);}if(k===' '&&!e.repeat){e.preventDefault();if(state==='running')return;if(state==='paused')resume();else if(mode)begin();else{showOverlay('SELECT YOUR MODE','Choose a mode','Select Free Run or Level Mode to continue.');modeButtons.classList.remove('hidden');}}if(k==='p'&&!e.repeat){if(state==='running')pause();else if(state==='paused')resume();}});

  // Touch D-pad input for phones and narrow touch layouts.
  document.querySelectorAll('.dpad-button[data-dir]').forEach(button => {
    const directions = {up:[0,-1], down:[0,1], left:[-1,0], right:[1,0]};
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      if (state === 'running') change(...directions[button.dataset.dir]);
    });
    button.addEventListener('contextmenu', event => event.preventDefault());
  });

  document.querySelectorAll('.mode-button').forEach(b=>b.addEventListener('click',()=>chooseMode(b.dataset.mode)));
  startButton.addEventListener('click',()=>{if(mode)begin()});
  pauseButton.addEventListener('click',()=>{if(state==='running')pause();else if(state==='paused')resume()});
  mobilePauseButton.addEventListener('click',()=>{if(state==='running')pause();else if(state==='paused')resume()});
  menuButton.addEventListener('click',()=>{clearInterval(timer);state='menu';mode=null;pauseButton.disabled=true;modeButtons.classList.remove('hidden');startButton.classList.add('hidden');overlay.classList.remove('hidden');eyebrowEl.textContent='SELECT YOUR MODE';titleEl.textContent="Let's play.";textEl.textContent='Choose how you want to play.';modeLabel.textContent='SELECT MODE';statusEl.textContent='MODE SELECT';objectiveEl.textContent='Choose a mode to begin.';levelEl.textContent='—';targetEl.textContent='—';});
  state='menu';initSnake();food=spawnFood();draw();
})();
