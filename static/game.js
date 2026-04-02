let gameState = {
    map: [],
    pacman: [1, 1],
    ghosts: [],
    score: 0,
    lives: 3,
    food_count: 0,
    game_over: false,
    won: false
};

const gameBoard = document.getElementById('game-board');
const resetBtn = document.getElementById('reset-btn');
const gameMessage = document.getElementById('game-message');

const CHARS = {
    wall: '#',
    space: ' ',
    door: '=',
    food: '.',
    pacman: 'C',
    ghost: 'G'
};

async function loadGameState() {
    try {
        const response = await fetch('/api/game/state');
        const state = await response.json();
        gameState = state;
        render();
    } catch (error) {
        console.error('Error loading game state:', error);
    }
}

function render() {
    gameBoard.innerHTML = '';

    if (gameState.map.length === 0) {
        gameBoard.textContent = 'Loading game...';
        return;
    }

    gameState.map.forEach((row, y) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'game-row';

        let rowText = '';
        row.forEach((char, x) => {
            const isPacman = gameState.pacman && gameState.pacman[0] === y && gameState.pacman[1] === x;
            const isGhost = gameState.ghosts && gameState.ghosts.some(g => g[0] === y && g[1] === x);

            if (isPacman) {
                rowText += CHARS.pacman;
            } else if (isGhost) {
                rowText += CHARS.ghost;
            } else {
                rowText += char || ' ';
            }
        });

        rowDiv.textContent = rowText;
        gameBoard.appendChild(rowDiv);
    });

    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('food').textContent = gameState.food_count;

    if (gameState.game_over) {
        gameMessage.textContent = 'GAME OVER! Click "New Game" to play again.';
        gameMessage.style.color = '#ff0000';
    } else if (gameState.won) {
        gameMessage.textContent = 'YOU WIN! Click "New Game" to play again.';
        gameMessage.style.color = '#00ff00';
    } else {
        gameMessage.textContent = 'Use arrow keys to move';
        gameMessage.style.color = '#ffff00';
    }
}

async function movePacman(direction) {
    if (gameState.game_over || gameState.won) return;

    try {
        const response = await fetch('/api/game/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ direction })
        });
        const result = await response.json();
        if (result.success) {
            await loadGameState();
        }
    } catch (error) {
        console.error('Error moving pacman:', error);
    }
}

async function resetGame() {
    try {
        const response = await fetch('/api/game/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const result = await response.json();
        if (result.success) {
            await loadGameState();
        }
    } catch (error) {
        console.error('Error resetting game:', error);
    }
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            movePacman('UP');
            break;
        case 'ArrowDown':
            e.preventDefault();
            movePacman('DOWN');
            break;
        case 'ArrowLeft':
            e.preventDefault();
            movePacman('LEFT');
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePacman('RIGHT');
            break;
    }
});

resetBtn.addEventListener('click', resetGame);

loadGameState();
setInterval(loadGameState, 200);
