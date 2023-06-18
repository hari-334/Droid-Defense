

const canvas = document.querySelector(".gameCanvas");
const ctx = canvas.getContext("2d");

const shooterWidth = 50;
const shooterHeight = 10;
const shooterSpeed = 5;
const shooterColor = "blue";
const shooterBorderColor = "white";
const shooterBorderWidth = 2;

const bulletHeight = 10;
const bulletWidth = 10;
const bulletSpeed = 6;
const bulletColor = "white";

const enemyWidth = 20;
const enemyHeight = 20;
const enemySpeed = 2;
const enemyColor = "red";
const enemyBorderColor = "white";
const enemyBorderWidth = 2;

const homeBlockSize = 80;
const homeBlockColor = "yellow";
const homeBlockX = 325;
const homeBlockY = 450;
const homeTextColor = "black";
const homeFont = "20px Arial";
const homeBorderColor = "white";
const homeBorderWidth = 3;

const minBots = 5;
const maxBots = 10;

const shootSound = new Audio (src = "Shooting.mp3");

let shooter;
let bullets;
let enemies;
let homeBlock;
let scoreValue;
let healthBar;
let score;
let health;
let gameRunning;

function randomBots (max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Shooter{
    constructor() {
        this.width = shooterWidth;
        this.height = shooterHeight;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 0;
    }
    moveLeft() {
        this.speed = -shooterSpeed;
    }
    moveRight() {
        this.speed = shooterSpeed;
    }
    update() {
        this.x += this.speed;
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    }
    draw() {
        ctx.strokeStyle = shooterBorderColor;
        ctx.lineWidth = shooterBorderWidth;
        ctx.fillStyle = shooterColor;        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
};

class Bullet {
    constructor(x, y) {
        this.width = bulletWidth;
        this.height = bulletHeight;
        this.x = x;
        this.y = y;
        this.active = true;
    }
    update() {
        this.y -= bulletSpeed;
        if (this.y < 0) {
            this.active = false;
        }
    }
    draw() {
        ctx.fillStyle = bulletColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

class EnemyBot {
    constructor(x, y) {
        this.width = enemyWidth;
        this.height = enemyHeight;
        this.x = x;
        this.y = y;
        this.active = true;
    }
    update() {
        this.y += enemySpeed;
        if (this.y > canvas.height) {
            this.active = false;
        }
    }
    draw() {
        ctx.strokeStyle = enemyBorderColor;
        ctx.lineWidth = enemyBorderWidth;
        ctx.fillStyle = enemyColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);

    }
};

class HomeBlock {
    constructor(){
        this.size = homeBlockSize;
        this.x = homeBlockX;
        this.y = homeBlockY;
    }
    draw() {
        ctx.strokeStyle = homeBorderColor;
        ctx.lineWidth = homeBorderWidth;
        ctx.fillStyle = homeBlockColor;
        ctx.fillRect(this.x, this.y, homeBlockSize, homeBlockSize);
        ctx.strokeRect(this.x, this.y, homeBlockSize, homeBlockSize);
        ctx.fillStyle = homeTextColor;
        ctx.font = homeFont;
        ctx.textAlign = "center";
        ctx.fillText("HOME", this.x + this.size / 2, this.y + this.size / 2);
    }
};

function initiateGame() {
    shooter = new Shooter();
    bullets = [];
    enemies = [];
    homeBlock = new HomeBlock();
    score = 0;
    health = 100;
    gameRunning = true;
    scoreValue = document.querySelector(".score");
    healthBar = document.querySelector(".healthBar");
    healthBar.style.width = `${health}%`;
    for (let i = 0; i < randomBots(minBots, maxBots); i++) {
        let enemyX = Math.random() * (canvas.width - enemyWidth);
        let enemyY = Math.random() * -400;
        enemies.push(new EnemyBot(enemyX, enemyY));
    }
    document.addEventListener("keydown", movingShooter);
    document.addEventListener("keyup", stoppingshooter);
    canvas.addEventListener("click", shootBullet);    
};

function movingShooter(e) {
    if (e.key === "ArrowLeft" || e.key === "a") {
        shooter.moveLeft();
    }
    else if (e.key === "ArrowRight" || e.key === "d") {
        shooter.moveRight();
    }
};

function stoppingshooter(e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "ArrowRight" || e.key === "d") {
        shooter.speed = 0; 
    }
};

function shootBullet(e) {
    if (!gameRunning) return;

    let bulletX = shooter.x + shooter.width / 2 - bulletWidth / 2
    let bulletY = shooter.y;
    bullets.push(new Bullet(bulletX, bulletY));
    shootSound.play();
};

function updateGame() {
    if (!gameRunning) return;

    shooter.update();
    bullets.forEach((bullet) => {
        bullet.update();
    });
    enemies.forEach((enemy) => {
        enemy.update();

        if (
            enemy.y + enemy.height >= homeBlock.y && 
            enemy.y <= homeBlock.y + homeBlock.size &&
            enemy.x + enemy.width >= homeBlock.x &&
            enemy.x <= homeBlock.x + homeBlock.size
            ) {
                enemy.active = false;
                health -= 10;
                healthBar.style.width = `${health}%`;
                if (health <= 0) {
                    endGame();
                }
            }

            if (
                enemy.y + enemy.height >= shooter.y &&
                enemy.y <= shooter.y + shooter.height && 
                enemy.x + enemy.width >= shooter.x &&
                enemy.x <= shooter.x + shooter.width
            ) {
                enemy.active = false;
                endGame();
            }

            bullets.forEach((bullet) => {
                if (
                    bullet.y + bullet.height >= enemy.y &&
                    bullet.y <= enemy.y + enemy.height &&
                    bullet.x + bullet.width >= enemy.x &&
                    bullet.x <= enemy.x + enemy.width
                ) {
                    enemy.active = false;
                    bullet.active = false;
                    score++;
                    scoreValue.textContent = score;
                }
            });
    });
    bullets = bullets.filter((bullet) => bullet.active);
    enemies = enemies.filter((enemy) => enemy.active);

    if (enemies.length ===0) {
        for (let i = 0; i < 10; i++) {
            let enemyX = Math.random() * (canvas.width - enemyWidth);
            let enemyY = Math.random() * -400;
            enemies.push(new EnemyBot(enemyX, enemyY));
        }
    }
};

/*function checkColoision(rect1, rect2) {
    rect1.y + rect1.height >= rect2.y &&
    rect1.y <= rect2.y + rect2.height &&
    rect1.x + rect1.width >= rect2.x &&
    rect1.x <= rect2.x + rect2.width                   
}*/
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    shooter.draw();
    bullets.forEach((bullet) => {
        bullet.draw();
    });
    enemies.forEach((enemy) => {
        enemy.draw();
    });
    homeBlock.draw();
};

function endGame() {
    gameRunning = false;
    alert("Game Over..!! Try Again..!!");
    location.reload();
};

function startGame() {
    initiateGame();

    function gameLoop() {
        updateGame();
        drawGame();
        if (gameRunning) {
            requestAnimationFrame(gameLoop);
        }
    }

    gameLoop();

};

startGame();

