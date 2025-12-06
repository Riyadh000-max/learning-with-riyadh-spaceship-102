import { InputHandler } from './Input.js';
import { Player } from './entities/Player.js';
import { AssetManager } from './AssetManager.js';
import { AudioControl } from './Audio.js';
import { Prison } from './entities/Prison.js';
import { Enemy } from './entities/Enemy.js';
import { Letter } from './entities/Letter.js';

export class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.input = new InputHandler();
        this.assets = new AssetManager();
        this.audio = null;
        this.player = null;
        this.keys = [];
        this.bullets = [];
        this.prisons = [];
        this.enemies = [];
        this.letters = [];
        this.enemyTimer = 0;
        this.enemyInterval = 3000;
        this.gameState = 'LOADING';
        this.score = 0;
        this.currentWave = 1;
        this.damageFlash = 0;
    }

    async init() {
        await this.assets.loadAll();
        if (this.assets.errors.length > 0) {
            console.error('Errors loading assets:', this.assets.errors);
        }
        this.audio = new AudioControl(this);
        this.gameState = 'MENU';
    }

    enterPlayState() {
        this.gameState = 'PLAY';
        this.player = new Player(this);
        this.prisons = [];
        this.enemies = [];
        this.bullets = [];
        this.letters = [];
        this.score = 0;

        // Load Progress
        const savedWave = localStorage.getItem('alphaSectorWave');
        this.currentWave = savedWave ? parseInt(savedWave, 10) : 1;
        if (this.currentWave > 26) this.currentWave = 1; // Reset if completed previously
        console.log('Starting at Level:', this.currentWave);

        // Spawn First Prison
        this.spawnPrison(this.currentWave);
    }

    spawnPrison(id) {
        // Spawn off-screen to the right if it's not the first ONE OF THE SESSION? 
        // Actually, if we just loaded into level 10, we want it to spawn visibly or float in.
        // Let's just spawn at 800 (Screen width) + padding and let it float in.
        // Or if it IS the very first start, maybe set it closer.
        // But consistent behavior is better.
        const x = this.width + 50;
        const y = this.height / 2 - 40;
        this.prisons.push(new Prison(this, x, y, id));

        // Spawn 5 Guards for each prison
        for (let j = 0; j < 5; j++) {
            // Position guards around prison
            const gx = x + (Math.random() * 200 - 100);
            const gy = y + (Math.random() * 300 - 150);
            this.enemies.push(new Enemy(this, gx, gy, id)); // Pass prison ID
        }
    }

    update(deltaTime) {
        if (this.gameState === 'MENU') {
            if (this.input.keys.includes('Enter')) {
                this.enterPlayState();
            }
        } else if (this.gameState === 'PLAY') {
            this.player.update(this.input.keys, deltaTime);

            // Bullets
            this.bullets.forEach(bullet => bullet.update());
            this.bullets = this.bullets.filter(bullet => !bullet.markedForDeletion);

            // Prisons
            this.prisons.forEach(prison => prison.update(deltaTime));
            this.prisons = this.prisons.filter(prison => !prison.markedForDeletion);

            // Enemies
            this.enemies.forEach(enemy => enemy.update(deltaTime));
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

            // Letters
            this.letters.forEach(letter => letter.update(deltaTime));
            this.letters = this.letters.filter(letter => !letter.markedForDeletion);

            this.checkCollisions();

            if (this.damageFlash > 0) this.damageFlash -= deltaTime;

            // Check Game Over
            if (this.playerHp <= 0) {
                this.gameState = 'GAMEOVER';
            }
        }
    }

    checkCollisions() {
        // Player vs Letters
        this.letters.forEach(letter => {
            if (this.checkCollision(this.player, letter)) {
                letter.markedForDeletion = true;
                this.score += 50;
                this.audio.play('sfx_win'); // Pickup sound
                console.log('Collected Letter:', letter.char);
            }
        });

        // Bullets
        this.bullets.forEach(bullet => {
            if (bullet.isEnemy) {
                // Enemy Bullet vs Player
                if (this.checkCollision(bullet, this.player)) {
                    bullet.markedForDeletion = true;
                    this.playerHp -= 10; // Take Damage
                    this.audio.playExplosion();
                    console.log('Player Hit! HP:', this.playerHp);
                }
            } else {
                // Player Bullet vs Prisons
                this.prisons.forEach(prison => {
                    if (this.checkCollision(bullet, prison)) {
                        bullet.markedForDeletion = true;

                        // Check Guard Count - NO, Check Shield HP
                        // if (prison.guardCount > 0) return; <-- OLD

                        if (prison.shieldHp > 0) {
                            prison.shieldHp--;
                            this.audio.playExplosion(); // Reuse explosion sound for shield hit separately? Or just hit.
                            // Visual feedback?
                            return;
                        }

                        prison.hp -= 10;
                        if (prison.hp <= 0 && !prison.markedForDeletion) {
                            prison.markedForDeletion = true;
                            this.audio.playExplosion();
                            this.audio.play('sfx_win');
                            this.score += 100;
                            // Spawn Drops
                            prison.drops.forEach(char => {
                                this.letters.push(new Letter(this, prison.x, prison.y, char));
                            });

                            // Spawn Next Prison
                            this.currentWave++;

                            // Save Progress
                            localStorage.setItem('alphaSectorWave', this.currentWave);

                            if (this.currentWave <= 26) {
                                this.spawnPrison(this.currentWave);
                            } else {
                                console.log("All prisons destroyed!");
                                this.gameState = 'WIN';
                                // Reset progress for next time?
                                localStorage.setItem('alphaSectorWave', 1);
                            }
                        }
                    }
                });

                // Player Bullet vs Enemies
                this.enemies.forEach(enemy => {
                    if (this.checkCollision(bullet, enemy)) {
                        bullet.markedForDeletion = true;
                        enemy.hp -= 10;
                        if (enemy.hp <= 0) {
                            enemy.markedForDeletion = true;
                            this.audio.playExplosion();
                            this.score += 50;

                            // Decrease Guard Count if linked to a prison
                            if (enemy.prisonId) {
                                const prison = this.prisons.find(p => p.id === enemy.prisonId);
                                if (prison) {
                                    prison.guardCount--;
                                }
                            }
                        }
                    }
                });
            }
        });
    }

    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    draw(context) {
        if (this.gameState === 'LOADING') {
            context.fillStyle = 'black';
            context.fillRect(0, 0, this.width, this.height);
            context.fillStyle = 'white';
            context.font = '30px Arial';
            context.textAlign = 'center';
            context.fillText('Loading Assets...', this.width / 2, this.height / 2);
            if (this.assets.errors.length > 0) this.drawErrors(context);
        } else if (this.gameState === 'MENU') {
            const cabin = this.assets.getImage('cabin_interior');
            if (cabin) context.drawImage(cabin, 0, 0, this.width, this.height);
            else { context.fillStyle = 'darkslategrey'; context.fillRect(0, 0, this.width, this.height); }

            context.fillStyle = 'rgba(0, 0, 0, 0.7)';
            context.fillRect(this.width / 2 - 300, this.height / 2 - 100, 600, 200);
            context.fillStyle = 'white';
            context.font = '30px Arial';
            context.textAlign = 'center';
            context.fillText('COMMANDER RAY', this.width / 2, this.height / 2 - 20);
            context.font = '20px Arial';
            context.fillText('PRESS ENTER TO START', this.width / 2, this.height / 2 + 40);
            if (this.assets.errors.length > 0) this.drawErrors(context);

        } else if (this.gameState === 'PLAY') {
            const bg = this.assets.getImage('background_space');
            if (bg) {
                context.drawImage(bg, 0, 0, this.width, this.height);
            } else {
                context.fillStyle = 'black';
                context.fillRect(0, 0, this.width, this.height);
            }

            this.prisons.forEach(prison => prison.draw(context));
            this.enemies.forEach(enemy => enemy.draw(context));
            this.letters.forEach(letter => letter.draw(context));
            this.bullets.forEach(bullet => bullet.draw(context));
            if (this.player) this.player.draw(context);

            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(10, 10, 200, 80);
            context.fillStyle = 'white';
            context.font = '20px Arial';
            context.textAlign = 'left';
            context.fillText('Score: ' + this.score, 20, 40);
            context.fillText('HP: ' + this.playerHp, 20, 70);

            if (this.damageFlash > 0) {
                context.fillStyle = 'rgba(255, 0, 0, 0.5)';
                context.fillRect(0, 0, this.width, this.height);
            }

            if (this.assets.errors && this.assets.errors.length > 0) {
                this.drawErrors(context);
            }
        } else if (this.gameState === 'GAMEOVER') {
            context.fillStyle = 'black';
            context.fillRect(0, 0, this.width, this.height);
            context.fillStyle = 'red';
            context.font = '50px Arial';
            context.textAlign = 'center';
            context.fillText('GAME OVER', this.width / 2, this.height / 2 - 20);
            context.fillStyle = 'white';
            context.font = '20px Arial';
            context.fillText('Score: ' + this.score, this.width / 2, this.height / 2 + 30);
            context.fillText('Press Enter to Restart', this.width / 2, this.height / 2 + 70);
        } else if (this.gameState === 'WIN') {
            const cabin = this.assets.getImage('cabin_interior');
            if (cabin) context.drawImage(cabin, 0, 0, this.width, this.height);
            else { context.fillStyle = 'black'; context.fillRect(0, 0, this.width, this.height); }

            context.fillStyle = 'lime';
            context.font = '40px Arial';
            context.textAlign = 'center';
            context.fillText('MISSION ACCOMPLISHED!', this.width / 2, this.height / 2 - 20);
            context.font = '30px Arial';
            context.fillText('All Alphabets Saved.', this.width / 2, this.height / 2 + 30);
            context.fillStyle = 'white';
            context.font = '20px Arial';
            context.fillText('Press Enter to Play Again', this.width / 2, this.height / 2 + 80);
        }
    }

    drawErrors(context) {
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 100, 600, 300);
        context.fillStyle = 'red';
        context.font = '14px Arial';
        context.textAlign = 'left';
        let y = 120;
        this.assets.errors.forEach(err => {
            context.fillText(err, 20, y);
            y += 20;
        });
    }
}
