// Simple Tetris game in canvas, no dependency
let tetrisModal, tetrisCanvas, tetrisCtx, tetrisInterval, tetrisActive = false;
const COLS = 10, ROWS = 20, BLOCK = 30;
const COLORS = [
  null,
  '#0000FF', // T - bleu
  '#FFFF00', // S - jaune
  '#FF0000', // Z - rouge
  '#00FF00', // J - vert
  '#800080', // L - violet
  '#FFA500', // I - orange
  '#00FFFF'  // O - cyan
];
const SHAPES = [
  [],
  [[1,1,1],[0,1,0]], // T
  [[0,2,2],[2,2,0]], // S
  [[3,3,0],[0,3,3]], // Z
  [[4,0,0],[4,4,4]], // J
  [[0,0,5],[5,5,5]], // L
  [[6,6,6,6]],       // I
  [[7,7],[7,7]]      // O
];
let arena, player;

function tetrisInit() {
  tetrisCanvas = document.getElementById('tetris-canvas');
  tetrisCtx = tetrisCanvas.getContext('2d');
  arena = createMatrix(COLS, ROWS);
  player = {pos: {x:0, y:0}, matrix: null, score: 0};
  playerReset();
  tetrisDraw();
  if (tetrisInterval) clearInterval(tetrisInterval);
  tetrisInterval = setInterval(() => tetrisUpdate(), 400);
  tetrisActive = true;
}

function createMatrix(w, h) {
  const m = [];
  while (h--) m.push(new Array(w).fill(0));
  return m;
}

function collide(arena, player) {
  const m = player.matrix, o = player.pos;
  for (let y=0; y<m.length; ++y) for (let x=0; x<m[y].length; ++x)
    if (m[y][x] && (arena[y+o.y] && arena[y+o.y][x+o.x]) !== 0) return true;
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => row.forEach((v, x) => {
    if (v) arena[y+player.pos.y][x+player.pos.x] = v;
  }));
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  tetrisDraw();
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
  tetrisDraw();
}

// Nouvelle fonction pour faire tourner une matrice de 90° dans le sens horaire
function rotate(matrix, dir) {
  const rotated = [];
  for (let i = 0; i < matrix[0].length; i++) {
    rotated[i] = [];
    for (let j = 0; j < matrix.length; j++) {
      if (dir > 0) {
        // Rotation horaire
        rotated[i][j] = matrix[matrix.length - 1 - j][i];
      } else {
        // Rotation anti-horaire
        rotated[i][j] = matrix[j][matrix[0].length - 1 - i];
      }
    }
  }
  return rotated;
}

// Nouvelle fonction pour faire tourner la pièce du joueur
function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  const rotated = rotate(player.matrix, dir);
  
  // Sauvegarder la matrice originale
  const originalMatrix = player.matrix;
  player.matrix = rotated;
  
  // Tester si la rotation est possible
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      // Si la rotation n'est pas possible, restaurer la matrice originale
      player.matrix = originalMatrix;
      player.pos.x = pos;
      return;
    }
  }
  tetrisDraw();
}

function playerReset() {
  const type = Math.floor(Math.random()* (SHAPES.length-1)) + 1;
  player.matrix = SHAPES[type].map(row => row.slice());
  player.pos.y = 0;
  player.pos.x = Math.floor(COLS/2) - Math.floor(player.matrix[0].length/2);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
  }
}

function arenaSweep() {
  let lines = 0;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (!arena[y][x]) continue outer;
    }
    arena.splice(y, 1);
    arena.unshift(new Array(COLS).fill(0));
    lines++;
    y++; // Re-vérifier la même ligne après avoir décalé
  }
  if (lines > 0) {
    player.score += lines * 10;
  }
}

function tetrisDraw() {
  tetrisCtx.fillStyle = '#222';
  tetrisCtx.fillRect(0,0, tetrisCanvas.width, tetrisCanvas.height);
  drawMatrix(arena, {x:0, y:0});
  drawMatrix(player.matrix, player.pos);
  // Score centré, style rétro
  tetrisCtx.font = 'bold 28px Fira Mono, monospace';
  tetrisCtx.fillStyle = '#7fff00';
  tetrisCtx.textAlign = 'center';
  tetrisCtx.textBaseline = 'top';
  tetrisCtx.shadowColor = '#7fff00';
  tetrisCtx.shadowBlur = 8;
  tetrisCtx.fillText('SCORE : ' + player.score, tetrisCanvas.width/2, 12);
  tetrisCtx.shadowBlur = 0;
  tetrisCtx.textAlign = 'start';
  tetrisCtx.textBaseline = 'alphabetic';
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => row.forEach((v, x) => {
    if (v) {
      tetrisCtx.fillStyle = COLORS[v];
      tetrisCtx.fillRect((x+offset.x)*BLOCK, (y+offset.y)*BLOCK, BLOCK-2, BLOCK-2);
    }
  }));
}

function tetrisUpdate() {
  if (!tetrisActive) return;
  playerDrop();
}

document.addEventListener('keydown', function(e) {
  if (!tetrisActive) return;
  if (e.key === 'ArrowLeft') playerMove(-1);
  else if (e.key === 'ArrowRight') playerMove(1);
  else if (e.key === 'ArrowDown') playerDrop();
  else if (e.key === 'ArrowUp') playerRotate(1); // Rotation horaire avec flèche du haut
  else if (e.key === 'z' || e.key === 'Z') playerRotate(-1); // Rotation anti-horaire avec Z
  else if (e.key === 'Escape') tetrisClose();
});

function tetrisClose() {
  tetrisActive = false;
  if (tetrisInterval) clearInterval(tetrisInterval);
  if (tetrisModal) tetrisModal.style.display = 'none';
}

window.tetrisShow = function() {
  tetrisModal = document.getElementById('tetris-modal');
  tetrisModal.style.display = 'flex';
  tetrisInit();
};

window.tetrisClose = tetrisClose;