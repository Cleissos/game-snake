// --- ELEMENTOS HTML ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

// --- ELEMENTOS DE ÁUDIO ---
// ATENÇÃO: Substitua 'caminho/para/seu/arquivo.wav' pelos nomes corretos
const backgroundMusic = new Audio('audio/hallelluj (online-audio-converter.com).mp3'); 
const gameOverSound = new Audio('audio/snake_gameover.mp3');

// Configura a música de fundo para tocar em loop e um volume mais baixo
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5; // Ajuste o volume se estiver muito alto ou baixo

// NOVO: Declarar o áudio do som de comer
const foodEatSound = new Audio('audio/eat.mp3'); 
foodEatSound.volume = 1.0; // Opcional: Garante volume máximo

// --- DEFINIÇÕES DO JOGO ---
const gridSize = 20; 
let tileCount = canvas.width / gridSize;
let velocityX = 1;
let velocityY = 0;
let score = 0;
let snake = [];
let food = {};
let gameInterval;

// --- FUNÇÕES DE CONTROLE DE JOGO ---

function resetGame() {
    // Reseta as variáveis
    snake = [{ x: 10, y: 10 }];
    velocityX = 1;
    velocityY = 0;
    score = 0;
    scoreElement.innerText = 0;
    
    // Esconde a tela de Game Over
    gameOverScreen.classList.add('hidden');
    
    // Gera a primeira comida
    generateFoodPosition();

    // Toca a música de fundo e garante que ela comece do zero
    backgroundMusic.currentTime = 0;
    backgroundMusic.play(); // Inicia a música de fundo

    // Inicia o loop do jogo
    gameInterval = setInterval(gameLoop, 200);
}

function generateFoodPosition() {
     food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function handleGameOver() {
    // 1. Para o loop do jogo
    clearInterval(gameInterval); 

    // NOVO: PARE A MÚSICA DE FUNDO IMEDIATAMENTE
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Opcional: Reseta o tempo da música
    
    // Toca o som de Game Over
    gameOverSound.play();

    // 2. Exibe a pontuação final e a tela de Game Over
    finalScoreElement.innerText = score;
    gameOverScreen.classList.remove('hidden');
}

function gameLoop() {
    moveSnake();

    if (checkCollision()) {
        handleGameOver();
        return;
    }

    if (checkFoodCollision()) {
        eatFood();
    } else {
        snake.pop();
    }

    drawGame();
}

// ... (as funções moveSnake(), checkCollision(), checkFoodCollision() permanecem IGUAIS) ...

// Atualiza a posição da cabeça da cobra
function moveSnake() {
    let head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    snake.unshift(head); // Adiciona a nova cabeça no início do array
}

// Verifica colisões
function checkCollision() {
    let head = snake[0];

    // Colisão com as paredes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }

    // Colisão com o próprio corpo
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

// Verifica se a cabeça está na mesma posição da comida
function checkFoodCollision() {
    return snake[0].x === food.x && snake[0].y === food.y;
}

// Lógica de quando a cobra come a comida
function eatFood() {
    score++;
    scoreElement.innerText = score;
    
    // Toca o som de comer
    // eatSound.play();

    // CORREÇÃO: Toca o objeto de áudio sem argumentos
    foodEatSound.currentTime = 0; // Garante que o som sempre comece do início (evita bugs de áudio)
    foodEatSound.play();
    
    // Gera nova posição para a comida
    generateFoodPosition();
}

// ... (as funções drawGame() e changeDirection() permanecem IGUAIS) ...

// --- Funções de Desenho (Canvas) ---

function drawGame() {
    // 1. Limpa a tela (fundo)
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Desenha a Comida (vermelha)
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);

    // 3. Desenha a Cobrinha (verde)
    ctx.fillStyle = 'green';
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1);
    });
}


// --- CONTROLES DE INPUT (Teclado e Toque) ---

document.addEventListener('keydown', changeDirection);
restartButton.addEventListener('click', resetGame); // NOVO: Botão Jogar Novamente

function changeDirection(event) {
    if (gameOverScreen.classList.contains('hidden')) { // Só muda a direção se o jogo estiver rodando
        switch (event.keyCode) {
            case 37: // Esquerda
                if (velocityX !== 1) { velocityX = -1; velocityY = 0; }
                break;
            case 38: // Cima
                if (velocityY !== 1) { velocityX = 0; velocityY = -1; }
                break;
            case 39: // Direita
                if (velocityX !== -1) { velocityX = 1; velocityY = 0; }
                break;
            case 40: // Baixo
                if (velocityY !== -1) { velocityX = 0; velocityY = 1; }
                break;
        }
    }
}

// Lógica de Toque (Swipe) - Mantenha a lógica que te passei anteriormente:
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault(); 
}

function handleTouchEnd(event) {
    if (gameOverScreen.classList.contains('hidden')) { // Só aceita swipe se o jogo estiver rodando
        if (!event.changedTouches || event.changedTouches.length === 0) return;
        
        let touchEndX = event.changedTouches[0].clientX;
        let touchEndY = event.changedTouches[0].clientY;
        
        let dx = touchEndX - touchStartX;
        let dy = touchEndY - touchStartY;

        const minSwipeDistance = 15; 
        
        if (Math.abs(dx) > minSwipeDistance || Math.abs(dy) > minSwipeDistance) {
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal
                if (dx > 0) {
                    if (velocityX !== -1) { velocityX = 1; velocityY = 0; }
                } else {
                    if (velocityX !== 1) { velocityX = -1; velocityY = 0; }
                }
            } else {
                // Vertical
                if (dy > 0) {
                    if (velocityY !== -1) { velocityX = 0; velocityY = 1; }
                } else {
                    if (velocityY !== 1) { velocityX = 0; velocityY = -1; }
                }
            }
        }
    }
}


// --- INICIALIZAÇÃO DO JOGO ---

// Inicia o jogo assim que a página é carregada
resetGame();