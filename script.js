onst canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const playerImg = new Image();
playerImg.src = "assets/player.png";

const trashImages = {
    lata: "assets/lata.png",
    botella_plastico: "assets/botella.png",
    cristal: "assets/cristal.png",
    papel: "assets/papel.png",
    cascara_platano: "assets/platano.png"
};

const pickupSound = new Audio("assets/pickup.mp3");
const gameOverSound = new Audio("assets/gameover.mp3");

const player = { x: canvas.width / 2 - 25, y: canvas.height - 70, width: 50, height: 50, speed: 10, dx: 0 };
const trashTypes = [
    { name: "lata", points: 10 },
    { name: "botella_plastico", points: 15 },
    { name: "cristal", points: 20 },
    { name: "papel", points: 5 },
    { name: "cascara_platano", points: -10, noGameOver: true }
];

let trash = [];
let score = 0;
let speed = 2;
let spawnRate = 3000;
let gameOver = false;

function movePlayer() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function generateTrash() {
    const randomTrash = trashTypes[Math.floor(Math.random() * trashTypes.length)];
    let newTrash = {
        x: Math.random() * (canvas.width - 30),
        y: 0,
        width: 30,
        height: 30,
        type: randomTrash,
        img: new Image()
    };
    newTrash.img.src = trashImages[randomTrash.name];
    trash.push(newTrash);
}

function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawTrash() {
    trash.forEach((t) => {
        ctx.drawImage(t.img, t.x, t.y, t.width, t.height);
    });
}

function moveTrash() {
    trash.forEach((t, index) => {
        t.y += speed;
        if (t.y + t.height >= player.y && t.x + t.width >= player.x && t.x <= player.x + player.width) {
            score += t.type.points;
            trash.splice(index, 1);
            pickupSound.play();
        }
        if (t.y > canvas.height) {
            if (!t.type.noGameOver) {
                gameOver = true;
                gameOverSound.play();
                endGame();
            } else {
                trash.splice(index, 1);
            }
        }
    });
}

function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Puntaje: ${score}`, 20, 30);
}

function updateGame() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    moveTrash();
    drawPlayer();
    drawTrash();
    drawScore();
    requestAnimationFrame(updateGame);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.dx = -player.speed;
    if (e.key === "ArrowRight") player.dx = player.speed;
});

document.addEventListener("keyup", () => {
    player.dx = 0;
});

canvas.addEventListener("touchstart", (e) => {
    let touchX = e.touches[0].clientX;
    if (touchX < canvas.width / 2) {
        player.dx = -player.speed;
    } else {
        player.dx = player.speed;
    }
});

canvas.addEventListener("touchend", () => {
    player.dx = 0;
});

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    canvas.style.display = "block";
    gameOver = false;
    score = 0;
    trash = [];
    speed = 2;
    spawnRate = 3000;
    setInterval(generateTrash, spawnRate);
    setInterval(() => { 
        speed += 0.5; 
        spawnRate = Math.max(1000, spawnRate - 200);
    }, 30000);
    updateGame();
}

function endGame() {
    document.getElementById("gameOverScreen").style.display = "block";
    canvas.style.display = "none";
    document.getElementById("finalScore").textContent = score;
}

function saveScore() {
    let name = document.getElementById("playerName").value || "Anónimo";
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    ranking.push({ name, score });
    ranking.sort((a, b) => b.score - a.score);
    ranking = ranking.slice(0, 5);
    localStorage.setItem("ranking", JSON.stringify(ranking));
    updateRanking();
}

function updateRanking() {
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    document.getElementById("rankingList").innerHTML = ranking.map(r => `<li>${r.name}: ${r.score}</li>`).join("");
}

function restartGame() {
    document.getElementById("gameOverScreen").style.display = "none";
    startGame();
}
