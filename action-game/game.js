const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let player = {
  x: 50,
  y: 300,
  width: 40,
  height: 40,
  speed: 5,
  dy: 0,
  gravity: 0.5,
  jumpPower: -10,
  onGround: false
};
let stage = 1;
let nextStageScore = 10;
let gameTimer = 0;
let enemies = [];

let shootCooldown = 0;
let shootInterval = 20; // フレーム数（約0.3秒）

let keys = {};
let gameState = "title"; 
// "title" | "playing" | "gameover"
let score = 0;
let hp = 3;
let bullets = [];
let spawnTimer = 0;
let spawnInterval = 180; // 60fpsなら約3秒

let shootSound = new Audio("shoot.mp3");
let hitSound = new Audio("hit.mp3");
let damageSound = new Audio("damage.mp3");


document.addEventListener("keydown", e => {
  canvas.addEventListener("touchstart", function (e) {
  e.preventDefault(); // スクロール防止

  if (gameState === "title") {
    gameState = "playing";
    return;
  }

  if (gameState === "gameover") {
    resetGame();
    return;
  }

  // プレイ中ならジャンプ
  if (player.onGround) {
    player.velocityY = -10;
    player.onGround = false;
  }
});
  keys[e.key] = true;

  if (gameState === "title" && e.key === "Enter") {
    gameState = "playing";
  }

  if (gameState === "gameover" && e.key === "Enter") {
    location.reload();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

function update() {
  if (score >= nextStageScore) {
  stage++;
  nextStageScore += 10;

  // ステージアップ時に難易度上昇
  if (spawnInterval > 40) {
    spawnInterval -= 10;
  }
}
  if (gameState !== "playing") return;
  gameTimer++;
spawnTimer++;

if (spawnTimer >= spawnInterval) {
  spawnTimer = 0;

  // 難易度上昇
  if (spawnInterval > 60) {
    spawnInterval -= 1;
  }

  enemies.push({
    x: canvas.width,
    y: 300,
    width: 40,
    height: 40,
    speed: 2 + Math.random() * 2 + stage * 0.5,
    direction: -1
  });
}
  if (shootCooldown > 0) {
    shootCooldown--;
  }



  // 弾発射
  if (keys["z"] && shootCooldown === 0) {
    bullets.push({
      x: player.x + player.width,
      y: player.y + player.height / 2 - 5,
      width: 10,
      height: 10,
      speed: 8
    });
     
    shootCooldown = shootInterval;
    shootSound.currentTime = 0;
     shootSound.play();

  }

 for (let i = bullets.length - 1; i >= 0; i--) {
  bullets[i].x += bullets[i].speed;

  // 画面外に出たら削除
  if (bullets[i].x > canvas.width) {
    bullets.splice(i, 1);
  }
}
  // 左右移動
  if (keys["ArrowRight"]) player.x += player.speed;
  if (keys["ArrowLeft"]) player.x -= player.speed;

  // ジャンプ
  if (keys[" "] && player.onGround) {
    player.dy = player.jumpPower;
    player.onGround = false;
  }

  // 重力
  player.dy += player.gravity;
  player.y += player.dy;

  // 地面判定
  if (player.y > 300) {
    player.y = 300;
    player.dy = 0;
    player.onGround = true;
  }

  
 // 弾と敵の当たり判定
for (let i = bullets.length - 1; i >= 0; i--) {
  for (let j = enemies.length - 1; j >= 0; j--) {

    if (
      bullets[i].x < enemies[j].x + enemies[j].width &&
      bullets[i].x + bullets[i].width > enemies[j].x &&
      bullets[i].y < enemies[j].y + enemies[j].height &&
      bullets[i].y + bullets[i].height > enemies[j].y
    ) {
      enemies.splice(j, 1);   // 敵削除
      bullets.splice(i, 1);   // 弾削除
      score += 100;

      hitSound.currentTime = 0;
      hitSound.play();
      break;
    }

  }
}

  // 敵の移動
  for (let enemy of enemies) {
  enemy.x += enemy.speed * enemy.direction;


  }
for (let i = enemies.length - 1; i >= 0; i--) {
  if (enemies[i].x < -50) {
    enemies.splice(i, 1);
  }
}
  // プレイヤーと敵の当たり判定
  for (let i = enemies.length - 1; i >= 0; i--) {
  let enemy = enemies[i];
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      if (player.dy > 0 && player.y + player.height - player.dy <= enemy.y) {
        enemies.splice(i, 1);
        player.dy = -8;
        score += 100;
      } else {
        hp--;
        damageSound.currentTime = 0;
        damageSound.play();


        if (hp <= 0) {
          gameState = "gameover";
          
        } else {
          player.x = 50;
          player.y = 300;
          player.dy = 0;
        }
      }
    }
  }
}

function draw() {
  ctx.fillText("Stage: " + stage, 10, 60);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // プレイヤー
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // 敵
 for (let enemy of enemies) {
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

  }
 

  // スコア表示
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("HP: " + hp, 20, 60);
 
 // 弾描画
for (let bullet of bullets) {
  ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
}

// ===== 画面表示（ここはループの外） =====

if (gameState === "title") {
  ctx.fillStyle = "black";
  ctx.font = "40px Arial";
  ctx.fillText("ACTION GAME", 150, 150);
  ctx.font = "20px Arial";
  ctx.fillText("Press Enter to Start", 200, 200);
}

if (gameState === "gameover") {
  ctx.fillStyle = "red";
  ctx.font = "40px Arial";
  ctx.fillText("GAME OVER", 180, 150);
  ctx.font = "20px Arial";
  ctx.fillText("Press Enter to Restart", 180, 200);
}
}
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
