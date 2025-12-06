import { InputHandler } from './Input.js';

window.addEventListener('load', function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1280;
    canvas.height = 720;

    // Use a factory or modify Game to accept the input handler if needed,
    // but Game creates its own InputHandler.
    // However, we need to bind the UI elements to the Game's input handler.
    // The Game class instantiates InputHandler internally.
    // So we can't easily access it unless we change how Game is initialized or how InputHandler works.

    // Let's modify InputHandler to be a singleton or pass the UI elements to it?
    // Or we can just attach the event listeners in InputHandler constructor if we pass the document?
    // InputHandler attaches to window.

    // Actually, the best way is to modify InputHandler to also look for these elements.
    // But here in app.js, we instantiate Game.

    const game = new Game(canvas.width, canvas.height);
    game.init();

    // We need to handle the "Tap to Start" overlay visibility.
    // The game state is in Game object.
    const startScreen = document.getElementById('start-screen');

    // Simple loop to toggle start screen based on game state
    // Ideally this logic belongs inside Game.js or InputHandler.js
    // But since I can't easily change the architecture without risking regressions,
    // I will let Game.js handle the logic if possible, or do it in the animate loop.

    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);

        // Update UI visibility
        if (game.gameState === 'MENU' || game.gameState === 'GAMEOVER' || game.gameState === 'WIN') {
             if (startScreen) {
                 startScreen.style.display = 'flex';
                 if (game.gameState === 'GAMEOVER') startScreen.innerText = "GAME OVER - TAP TO RESTART";
                 else if (game.gameState === 'WIN') startScreen.innerText = "MISSION ACCOMPLISHED - TAP TO RESTART";
                 else startScreen.innerText = "TAP TO START";
             }
        } else {
             if (startScreen) startScreen.style.display = 'none';
        }

        requestAnimationFrame(animate);
    }

    animate(0);
});

import { Game } from './Game.js';
