// Configurações do Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Definições do Jogo
const gridSize = 20; // Tamanho de cada "quadrado" (cobra ou comida)
let tileCount = canvas.width / gridSize; // Quantidade de quadrados no eixo X/Y (400/20 = 20)
let velocityX = 1;  // Velocidade inicial no eixo X (anda para a direita)
let velocityY = 0;  // Velocidade inicial no eixo Y
let score = 0;

// Estado da Cobrinha
let snake = [
    { x: 10, y: 10 } // Posição inicial da cabeça da cobrinha (meio)
];

// Estado da Comida (posição aleatória)
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};

let gameInterval; // Variável para armazenar o ID do setInterval

// --- Funções de Lógica do Jogo ---

// Função chamada quando o jogo termina
function handleGameOver() {
    // 1. Para o loop do jogo
    clearInterval(gameInterval); 

    // 2. Exibe a mensagem de Game Over
    alert("Fim de Jogo! Sua Pontuação: " + score);

    // 3. Recarrega a página para reiniciar
    document.location.reload(); 
}

// Função principal que é chamada repetidamente
function gameLoop() {
    // 1. Atualiza a posição da cobra
    moveSnake();

    // 2. Verifica se houve colisão (parede ou consigo mesma)
    if (checkCollision()) {
        handleGameOver(); // Chama a função para parar e reiniciar
        return; // Sai do loop para não executar o resto do código
    }

    // 3. Verifica se a cobra comeu a comida
    if (checkFoodCollision()) {
        eatFood();
    } else {
        // Se não comeu, remove a cauda para simular o movimento
        snake.pop();
    }

    // 4. Desenha o jogo na tela
    drawGame();
}

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

    // Colisão com o próprio corpo (começa a verificar a partir do 4º segmento)
    for (let i = 4; i < snake.length; i++) {
        // Verifica se a posição da cabeça é igual a qualquer parte do corpo
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
    
    // Gera nova posição para a comida
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
}

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
        // Desenha cada parte da cobra, com um pequeno recuo para dar a sensação de grade
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 1, gridSize - 1);
    });
}

// --- Controle de Input (Teclas) ---

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    // event.keyCode: 37=Esquerda, 38=Cima, 39=Direita, 40=Baixo
    switch (event.keyCode) {
        case 37: // Esquerda
            if (velocityX !== 1) { // Impede movimento reverso imediato
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case 38: // Cima
            if (velocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case 39: // Direita
            if (velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
            }
            break;
        case 40: // Baixo
            if (velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
    }
}


// --- Variáveis para Touch/Swipe ---
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// --- Controles de Input (Teclas e Toque) ---

// EVENTO DE TECLADO (Já existente)
document.addEventListener('keydown', changeDirection);

// EVENTOS DE TOQUE (Novos)
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);


function handleTouchStart(event) {
    // Registra a posição inicial do toque
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    // Previne o comportamento padrão do navegador (como rolar a página)
    event.preventDefault(); 
}

function handleTouchEnd(event) {
    // Registra a posição final (onde o dedo foi levantado)
    // O evento touchend não tem event.touches[0], então usamos o último ponto registrado
    if (event.changedTouches && event.changedTouches.length > 0) {
        touchEndX = event.changedTouches[0].clientX;
        touchEndY = event.changedTouches[0].clientY;
    } else {
        // Fallback caso a informação de toque final não esteja clara (pode acontecer)
        return; 
    }
    
    // Calcula a distância percorrida nos eixos X e Y
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    // Define um limite mínimo para considerar o movimento um "swipe" válido
    const minSwipeDistance = 15; 
    
    if (Math.abs(dx) > minSwipeDistance || Math.abs(dy) > minSwipeDistance) {
        // Verifica se o movimento horizontal (DX) foi maior que o vertical (DY)
        if (Math.abs(dx) > Math.abs(dy)) {
            // Movimento Horizontal: Esquerda ou Direita
            if (dx > 0) {
                // Direita
                if (velocityX !== -1) { velocityX = 1; velocityY = 0; }
            } else {
                // Esquerda
                if (velocityX !== 1) { velocityX = -1; velocityY = 0; }
            }
        } else {
            // Movimento Vertical: Cima ou Baixo
            if (dy > 0) {
                // Baixo
                if (velocityY !== -1) { velocityX = 0; velocityY = 1; }
            } else {
                // Cima
                if (velocityY !== 1) { velocityX = 0; velocityY = -1; }
            }
        }
    }
}
// Mantenha a função changeDirection original para o teclado,
// mas ela só será chamada pelo 'keydown'.
// As funções de touch farão a mesma lógica de alteração de velocityX/velocityY.

// --- Inicialização do Jogo ---

// Chama a função gameLoop a cada 100 milissegundos (velocidade da cobra)
gameInterval = setInterval(gameLoop, 300);