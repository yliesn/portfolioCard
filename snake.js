// Snake Game - Cyberpunk/Matrix Hidden Mini-Game
// Activation par Konami Code
// Voir snake.css pour le style

let snakeGame = null;

// Konami Code detection
const KONAMI = [38,38,40,40,37,39,37,39,66,65];
// const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
let konamiIndex = 0;
window.addEventListener('keydown', function(e) {
    if (e.keyCode === KONAMI[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === KONAMI.length) {
            konamiIndex = 0;
            if (!snakeGame) showSnakeGame();
        }
    } else {
        konamiIndex = 0;
    }
});

function showSnakeGame() {
    if (document.getElementById('snake-overlay')) return;
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'snake-overlay';
    overlay.innerHTML = `
      <div class="snake-glass">
        <canvas id="snake-canvas" tabindex="0"></canvas>
        <div class="snake-ui">
          <div class="snake-score">
            <span id="snake-score">0</span> / <span id="snake-highscore">0</span>
          </div>
          <div class="snake-msg" id="snake-msg"></div>
          <button class="snake-btn snake-pause" id="snake-pause-btn">⏸</button>
          <button class="snake-btn snake-close" id="snake-close-btn">✕</button>
        </div>
        <div class="snake-controls">
          <button class="snake-btn" data-dir="up">▲</button>
          <div>
            <button class="snake-btn" data-dir="left">◀</button>
            <button class="snake-btn" data-dir="down">▼</button>
            <button class="snake-btn" data-dir="right">▶</button>
          </div>
        </div>
        <div class="snake-instructions" id="snake-instructions">
          Utilise les flèches, swipe ou boutons. Pause: Espace. Quitter: Echap ou clic extérieur.
        </div>
        <div class="snake-countdown" id="snake-countdown"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(()=>overlay.classList.add('visible'), 10);
    startSnakeCountdown();
}

function startSnakeCountdown() {
    const countdownEl = document.getElementById('snake-countdown');
    let count = 5;
    countdownEl.style.display = 'block';
    countdownEl.style.position = 'absolute';
    countdownEl.style.left = '50%';
    countdownEl.style.top = '50%';
    countdownEl.style.transform = 'translate(-50%,-50%)';
    countdownEl.style.fontSize = '3.5em';
    countdownEl.style.color = '#00ff41';
    countdownEl.style.fontFamily = 'Fira Mono, Consolas, monospace';
    countdownEl.style.textShadow = '0 0 18px #00ff41, 0 0 40px #00ff41a0';
    countdownEl.style.zIndex = '100';
    countdownEl.textContent = count;
    let interval = setInterval(()=>{
        count--;
        if(count>0) {
            countdownEl.textContent = count;
        } else {
            clearInterval(interval);
            countdownEl.style.display = 'none';
            snakeGame = new SnakeGame();
        }
    }, 1000);
}

// Fermeture par clic extérieur
window.addEventListener('mousedown', e => {
    const overlay = document.getElementById('snake-overlay');
    if (overlay && e.target === overlay) closeSnakeGame();
});
window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSnakeGame();
});
function closeSnakeGame() {
    const overlay = document.getElementById('snake-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        setTimeout(()=>overlay.remove(), 350);
        snakeGame && snakeGame.destroy();
        snakeGame = null;
    }
}

// --- Snake Game Logic ---
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snake-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreEl = document.getElementById('snake-score');
        this.highscoreEl = document.getElementById('snake-highscore');
        this.msgEl = document.getElementById('snake-msg');
        this.instructionsEl = document.getElementById('snake-instructions');
        this.pauseBtn = document.getElementById('snake-pause-btn');
        this.closeBtn = document.getElementById('snake-close-btn');
        this.controls = document.querySelector('.snake-controls');
        this.overlay = document.getElementById('snake-overlay');
        this.size = 24;
        this.grid = 20;
        this.snake = [{x:10,y:10}];
        this.dir = {x:1,y:0};
        this.nextDir = {x:1,y:0};
        this.food = null;
        this.goldFood = null;
        this.score = 0;
        this.highscore = parseInt(localStorage.getItem('snake-highscore')||'0');
        this.speed = 120;
        this.frame = 0;
        this.running = true;
        this.paused = false;
        this.lastMove = 0;
        this.appleCount = 0;
        this.particles = [];
        this.easter = false;
        this.animMsg = null;
        this.touchStart = null;
        this.resize();
        window.addEventListener('resize', ()=>this.resize());
        this.canvas.focus();
        this.bindEvents();
        this.spawnFood();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
        setTimeout(()=>this.instructionsEl.style.opacity=0, 3500);
    }
    resize() {
        const min = Math.min(window.innerWidth, window.innerHeight) * 0.9;
        this.canvas.width = this.canvas.height = Math.max(this.grid*this.size, Math.min(600, min));
        this.cell = this.canvas.width/this.grid;
    }
    bindEvents() {
        this.keyHandler = e => {
            if (!this.running) return;
            if (e.key === ' '){ this.togglePause(); return; }
            if (e.key === 'ArrowUp' && this.dir.y!==1) this.nextDir={x:0,y:-1};
            if (e.key === 'ArrowDown' && this.dir.y!==-1) this.nextDir={x:0,y:1};
            if (e.key === 'ArrowLeft' && this.dir.x!==1) this.nextDir={x:-1,y:0};
            if (e.key === 'ArrowRight' && this.dir.x!==-1) this.nextDir={x:1,y:0};
        };
        window.addEventListener('keydown', this.keyHandler);
        this.pauseBtn.addEventListener('click', ()=>this.togglePause());
        this.closeBtn.addEventListener('click', ()=>closeSnakeGame());
        // Touch
        this.canvas.addEventListener('touchstart', e=>{
            if (e.touches.length===1) this.touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
        });
        this.canvas.addEventListener('touchend', e=>{
            if (!this.touchStart) return;
            const dx = e.changedTouches[0].clientX-this.touchStart.x;
            const dy = e.changedTouches[0].clientY-this.touchStart.y;
            if (Math.abs(dx)>Math.abs(dy)) {
                if (dx>30 && this.dir.x!==-1) this.nextDir={x:1,y:0};
                else if (dx<-30 && this.dir.x!==1) this.nextDir={x:-1,y:0};
            } else {
                if (dy>30 && this.dir.y!==-1) this.nextDir={x:0,y:1};
                else if (dy<-30 && this.dir.y!==1) this.nextDir={x:0,y:-1};
            }
            this.touchStart=null;
        });
        // Virtual btns
        this.controls.addEventListener('click', e=>{
            if (e.target.dataset.dir) {
                const d = e.target.dataset.dir;
                if (d==='up' && this.dir.y!==1) this.nextDir={x:0,y:-1};
                if (d==='down' && this.dir.y!==-1) this.nextDir={x:0,y:1};
                if (d==='left' && this.dir.x!==1) this.nextDir={x:-1,y:0};
                if (d==='right' && this.dir.x!==-1) this.nextDir={x:1,y:0};
            }
        });
        // Pause auto si onglet caché
        this.visibilityHandler = ()=>{
            if (document.hidden) this.pause(true);
        };
        document.addEventListener('visibilitychange', this.visibilityHandler);
    }
    loop(ts) {
        if (!this.running) return;
        if (!this.paused && ts-this.lastMove>this.speed) {
            this.lastMove=ts;
            this.move();
        }
        this.draw();
        requestAnimationFrame(this.loop);
    }
    move() {
        this.dir = {...this.nextDir};
        const head = {x:this.snake[0].x+this.dir.x, y:this.snake[0].y+this.dir.y};
        // Wall
        if (head.x<0||head.x>=this.grid||head.y<0||head.y>=this.grid||this.snake.some(s=>s.x===head.x&&s.y===head.y)) {
            this.gameOver();
            return;
        }
        this.snake.unshift(head);
        let ate = false;
        if (this.food && head.x===this.food.x && head.y===this.food.y) {
            this.score+=10;
            this.appleCount++;
            this.spawnFood();
            this.particleBurst(head.x, head.y, '#00ff41');
            this.encourage();
            ate = true;
        } else if (this.goldFood && head.x===this.goldFood.x && head.y===this.goldFood.y) {
            this.score+=50;
            this.appleCount++;
            this.goldFood=null;
            this.particleBurst(head.x, head.y, '#ffe066');
            this.encourage(true);
            ate = true;
        }
        if (!ate) this.snake.pop();
        if (this.appleCount>0 && this.appleCount%5===0) {
            this.speed = Math.max(50, this.speed-10);
            this.appleCount=0;
            this.spawnGold();
        }
        if (this.score>this.highscore) {
            this.highscore=this.score;
            localStorage.setItem('snake-highscore',this.highscore);
        }
        if (this.score>=500 && !this.easter) {
            this.easter=true;
            this.specialEffect();
        }
    }
    draw() {
        // Fond
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
        // Particules
        this.particles.forEach(p=>{
            this.ctx.globalAlpha = p.a;
            this.ctx.fillStyle = p.c;
            this.ctx.beginPath();
            this.ctx.arc(p.x*this.cell+this.cell/2,p.y*this.cell+this.cell/2,p.r,0,2*Math.PI);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            p.x+=p.vx; p.y+=p.vy; p.a-=0.03; p.r*=0.97;
        });
        this.particles = this.particles.filter(p=>p.a>0.1&&p.r>1);
        // Snake
        this.ctx.shadowColor = '#00ff41';
        this.ctx.shadowBlur = 12;
        this.snake.forEach((s,i)=>{
            this.ctx.fillStyle = i===0 ? '#00ff41' : 'rgba(0,255,65,0.7)';
            this.ctx.fillRect(s.x*this.cell,s.y*this.cell,this.cell,this.cell);
        });
        this.ctx.shadowBlur = 0;
        // Food
        if (this.food) {
            this.ctx.fillStyle = '#00ff41';
            this.ctx.beginPath();
            this.ctx.arc(this.food.x*this.cell+this.cell/2,this.food.y*this.cell+this.cell/2,this.cell/2.2,0,2*Math.PI);
            this.ctx.fill();
        }
        if (this.goldFood) {
            this.ctx.fillStyle = '#ffe066';
            this.ctx.beginPath();
            this.ctx.arc(this.goldFood.x*this.cell+this.cell/2,this.goldFood.y*this.cell+this.cell/2,this.cell/2.1,0,2*Math.PI);
            this.ctx.fill();
        }
        // UI
        this.scoreEl.textContent = this.score;
        this.highscoreEl.textContent = this.highscore;
    }
    spawnFood() {
        let pos;
        do {
            pos = {x:Math.floor(Math.random()*this.grid),y:Math.floor(Math.random()*this.grid)};
        } while (this.snake.some(s=>s.x===pos.x&&s.y===pos.y));
        this.food = pos;
    }
    spawnGold() {
        let pos;
        do {
            pos = {x:Math.floor(Math.random()*this.grid),y:Math.floor(Math.random()*this.grid)};
        } while (this.snake.some(s=>s.x===pos.x&&s.y===pos.y));
        this.goldFood = pos;
        setTimeout(()=>{this.goldFood=null;}, 4000);
    }
    particleBurst(x,y,color) {
        for(let i=0;i<18;i++) {
            this.particles.push({x,y,r:Math.random()*7+4,vx:Math.cos(i)*0.2+Math.random()*0.2,vy:Math.sin(i)*0.2+Math.random()*0.2,a:0.8,c:color});
        }
    }
    encourage(gold) {
        const msgs = gold ? ['Legendary!','INCROYABLE!','GOLDEN!'] : ['Nice!','Impressive!','GG!','+10pts!'];
        this.msgEl.textContent = msgs[Math.floor(Math.random()*msgs.length)];
        this.msgEl.style.opacity=1;
        clearTimeout(this.animMsg);
        this.animMsg = setTimeout(()=>this.msgEl.style.opacity=0, 1200);
    }
    specialEffect() {
        // Effet matrix pluie
        let rain = [];
        for(let i=0;i<40;i++) rain.push({x:Math.random()*this.canvas.width,y:Math.random()*-this.canvas.height});
        let running = true;
        const drawRain = ()=>{
            if (!running) return;
            this.ctx.save();
            this.ctx.font = `${this.cell}px monospace`;
            this.ctx.fillStyle = '#00ff41';
            rain.forEach(r=>{
                this.ctx.fillText(String.fromCharCode(0x30A0+Math.random()*96),r.x,r.y);
                r.y+=this.cell*0.7;
                if (r.y>this.canvas.height) r.y=0;
            });
            this.ctx.restore();
            if (this.easter) requestAnimationFrame(drawRain);
        };
        drawRain();
        this.msgEl.textContent = 'HACKERMAN!';
        this.msgEl.style.opacity=1;
        setTimeout(()=>this.msgEl.style.opacity=0, 2000);
    }
    pause(auto) {
        if (!this.paused) {
            this.paused = true;
            this.msgEl.textContent = 'Pause';
            this.msgEl.style.opacity=1;
            this.pauseBtn.textContent = '▶';
        }
    }
    togglePause() {
        this.paused = !this.paused;
        this.msgEl.textContent = this.paused ? 'Pause' : '';
        this.msgEl.style.opacity = this.paused ? 1 : 0;
        this.pauseBtn.textContent = this.paused ? '▶' : '⏸';
    }
    gameOver() {
        this.running = false;
        this.msgEl.textContent = this.score>this.highscore?"Nouveau record!" : ["Ouch!","Try again!","Snake over!"][Math.floor(Math.random()*3)];
        this.msgEl.style.opacity=1;
        setTimeout(()=>closeSnakeGame(), 1800);
    }
    destroy() {
        window.removeEventListener('keydown', this.keyHandler);
        document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
}
