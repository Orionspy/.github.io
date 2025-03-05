// Initialisation du canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Variables globales
const CELL_SIZE = 40;
let playerX = CELL_SIZE; // Position initiale du joueur
let playerY = CELL_SIZE;
let level = 1; // Niveau actuel
let maze = [];
let exitX, exitY; // Position de la sortie
let isGameOver = false;

// Chargement des images
const viceputImg = new Image();
viceputImg.src = "https://i.ibb.co/Mk1t05xp/Viceput.png";

const tanabladeImg = new Image();
tanabladeImg.src = "https://i.ibb.co/5XgY59S0/Tanablade.png";

const playerImg = () => (level === 1 ? viceputImg : tanabladeImg);

// Génération du labyrinthe
function generateMaze(cols, rows) {
    const maze = Array.from({ length: rows }, () => Array(cols).fill(1));
    const stack = [[1, 1]];
    maze[1][1] = 0;

    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        const directions = [
            [0, -2], // Haut
            [2, 0], // Droite
            [0, 2], // Bas
            [-2, 0], // Gauche
        ].sort(() => Math.random() - 0.5);

        let moved = false;

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx > 0 && ny > 0 && nx < cols - 1 && ny < rows - 1 && maze[ny][nx] === 1) {
                maze[ny][nx] = 0;
                maze[y + dy / 2][x + dx / 2] = 0; // Ouvre le mur entre les cellules
                stack.push([nx, ny]);
                moved = true;
                break;
            }
        }

        if (!moved) stack.pop();
    }

    // Ajouter des impasses pour le niveau difficile (niveau 2)
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
        playerX += dx * CELL_SIZE / 4;
        playerY += dy * CELL_SIZE / 4;

        // Vérifier si le joueur atteint la sortie
        if (cellX === exitX && cellY === exitY) {
            isGameOver = true;
            setTimeout(() => nextLevel(), 500);
        }
    }
}

// Passer au niveau suivant ou terminer le jeu
function nextLevel() {
    if (level === 2) {
        alert("Bravo ! Vous avez terminé le jeu !");
        document.location.reload();
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

// Boucle de jeu principale
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMaze();
    drawExit();
    drawPlayer();

    requestAnimationFrame(gameLoop);
}

// Initialisation du jeu
initLevel();
gameLoop();
