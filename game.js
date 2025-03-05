// Initialisation du canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Variables globales
const CELL_SIZE = 40;
const ARROW_SIZE = 80;
const ARROW_MARGIN = 20;
const BLUR_PADDING = 10;
let playerX = CELL_SIZE;
let playerY = CELL_SIZE;
let level = 1;
let maze = [];
let exitX, exitY;
let isGameOver = false;

// Rectangles des flèches
let arrowRects = {
    up: null,
    down: null,
    left: null,
    right: null
};

// Chargement des images
const viceputImg = new Image();
viceputImg.src = "https://i.ibb.co/Mk1t05xp/Viceput.png";

const tanabladeImg = new Image();
tanabladeImg.src = "https://i.ibb.co/5XgY59S0/Tanablade.png";

const arrowUpImg = new Image();
arrowUpImg.src = "https://i.ibb.co/MxXRKf9j/en-avant.png";

const arrowDownImg = new Image();
arrowDownImg.src = "https://i.ibb.co/N8j1rSJ/en-bas.png";

const arrowRightImg = new Image();
arrowRightImg.src = "https://i.ibb.co/Z1RvWLJm/droite.png";

const arrowLeftImg = new Image();
arrowLeftImg.src = "https://i.ibb.co/CDYdqHQ/gauche.png";

const playerImg = () => (level === 1 ? viceputImg : tanabladeImg);

// Génération du labyrinthe
function generateMaze(cols, rows) {
    const maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    const stack = [[1, 1]];
    maze[1][1] = 0;

    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        const directions = [
            [0, -2], [2, 0], [0, 2], [-2, 0]
        ].sort(() => Math.random() - 0.5);

        let moved = false;

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx > 0 && ny > 0 && nx < cols - 1 && ny < rows - 1 && maze[ny][nx] === 1) {
                maze[ny][nx] = 0;
                maze[y + dy / 2][x + dx / 2] = 0;
                stack.push([nx, ny]);
                moved = true;
                break;
            }
        }

        if (!moved) stack.pop();
    }

    if (level === 2) {
        for (let i = 0; i < cols * rows * 0.1; i++) {
            const rx = Math.floor(Math.random() * cols);
            const ry = Math.floor(Math.random() * rows);
            if (maze[ry][rx] === 1) maze[ry][rx] = 0;
        }
    }

    exitX = cols - 2;
    exitY = rows - 2;
    maze[exitY][exitX] = 0;

    return maze;
}

// Initialisation du niveau
function initLevel() {
    const cols = Math.floor(canvas.width / CELL_SIZE);
    const rows = Math.floor(canvas.height / CELL_SIZE);
    maze = generateMaze(cols, rows);
    playerX = CELL_SIZE;
    playerY = CELL_SIZE;
}

// Dessiner le labyrinthe
function drawMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = "black";
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Dessiner la sortie
function drawExit() {
    ctx.fillStyle = "green";
    ctx.fillRect(exitX * CELL_SIZE, exitY * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

// Dessiner le joueur
function drawPlayer() {
    ctx.drawImage(playerImg(), playerX, playerY, CELL_SIZE / 1.5, CELL_SIZE / 1.5);
}

// Fonction pour dessiner un rectangle flou
function drawBlurredRect(x, y, width, height) {
    ctx.save();
    ctx.filter = 'blur(5px)';
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.fillRect(x, y, width, height);
    ctx.restore();
}

// Fonction pour dessiner les flèches
function drawArrows() {
    const arrowsWidth = ARROW_SIZE * 3 + ARROW_MARGIN * 2;
    const arrowsHeight = ARROW_SIZE * 3 + ARROW_MARGIN * 2;
    const startX = canvas.width - arrowsWidth - ARROW_MARGIN;
    const startY = canvas.height - arrowsHeight - ARROW_MARGIN;

    drawBlurredRect(
        startX - BLUR_PADDING, 
        startY - BLUR_PADDING, 
        arrowsWidth + BLUR_PADDING * 2, 
        arrowsHeight + BLUR_PADDING * 2
    );

    arrowRects.up = {x: startX + ARROW_SIZE + ARROW_MARGIN, y: startY, width: ARROW_SIZE, height: ARROW_SIZE};
    arrowRects.down = {x: startX + ARROW_SIZE + ARROW_MARGIN, y: startY + ARROW_SIZE * 2 + ARROW_MARGIN, width: ARROW_SIZE, height: ARROW_SIZE};
    arrowRects.left = {x: startX, y: startY + ARROW_SIZE + ARROW_MARGIN, width: ARROW_SIZE, height: ARROW_SIZE};
    arrowRects.right = {x: startX + ARROW_SIZE * 2 + ARROW_MARGIN * 2, y: startY + ARROW_SIZE + ARROW_MARGIN, width: ARROW_SIZE, height: ARROW_SIZE};

    ctx.drawImage(arrowUpImg, arrowRects.up.x, arrowRects.up.y, ARROW_SIZE, ARROW_SIZE);
    ctx.drawImage(arrowDownImg, arrowRects.down.x, arrowRects.down.y, ARROW_SIZE, ARROW_SIZE);
    ctx.drawImage(arrowLeftImg, arrowRects.left.x, arrowRects.left.y, ARROW_SIZE, ARROW_SIZE);
    ctx.drawImage(arrowRightImg, arrowRects.right.x, arrowRects.right.y, ARROW_SIZE, ARROW_SIZE);
}

// Déplacement du joueur
function movePlayer(dx, dy) {
    const newX = playerX + dx * CELL_SIZE / 4;
    const newY = playerY + dy * CELL_SIZE / 4;

    const cellX = Math.floor(newX / CELL_SIZE);
    const cellY = Math.floor(newY / CELL_SIZE);

    if (
        cellX >= 0 &&
        cellY >= 0 &&
        cellX < maze[0].length &&
        cellY < maze.length &&
        maze[cellY][cellX] === 0
    ) {
        playerX = newX;
        playerY = newY;

        if (cellX === exitX && cellY === exitY) {
            isGameOver = true;
            setTimeout(() => nextLevel(), 500);
        }
    }
}

// Passer au niveau suivant ou terminer le jeu
function nextLevel() {
    if (level === 2) {
        fetch('config.json')
            .then(response => response.json())
            .then(data => {
                window.location.href = data.endGameLink;
            })
            .catch(error => {
                console.error('Erreur lors du chargement du lien:', error);
                alert("Bravo ! Vous avez terminé le jeu !");
                document.location.reload();
            });
    } else {
        level++;
        initLevel();
        isGameOver = false;
    }
}

// Gestion des entrées clavier
window.addEventListener("keydown", (e) => {
    if (!isGameOver) {
        switch (e.key) {
            case "ArrowUp":
                movePlayer(0, -1);
                break;
            case "ArrowDown":
                movePlayer(0, 1);
                break;
            case "ArrowLeft":
                movePlayer(-1, 0);
                break;
            case "ArrowRight":
                movePlayer(1, 0);
                break;
        }
    }
});

// Gestion des clics sur le canvas
function handleCanvasClick(event) {
    if (isGameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isPointInRect(x, y, arrowRects.up)) {
        movePlayer(0, -1);
    } else if (isPointInRect(x, y, arrowRects.down)) {
        movePlayer(0, 1);
    } else if (isPointInRect(x, y, arrowRects.left)) {
        movePlayer(-1, 0);
    } else if (isPointInRect(x, y, arrowRects.right)) {
        movePlayer(1, 0);
    }
}

// Fonction utilitaire pour vérifier si un point est dans un rectangle
function isPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
}

// Ajout de l'écouteur d'événements pour les clics sur le canvas
canvas.addEventListener('click', handleCanvasClick);

// Boucle de jeu principale
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    drawExit();
    drawPlayer();
    drawArrows();

    requestAnimationFrame(gameLoop);
}

// Initialisation du jeu
initLevel();
gameLoop();
