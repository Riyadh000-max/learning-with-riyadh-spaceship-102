import { Bullet } from './Bullet.js';

export class Player {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 60;
        this.x = 100;
        this.y = this.game.height / 2 - this.height / 2;
        this.speed = 5;
        this.color = 'blue';
        this.image = this.game.assets.getImage('player_ship');
        this.shootTimer = 0;
        this.shootInterval = 200; // ms
    }

    update(input, deltaTime) {
        if (input.includes('ArrowUp')) this.y -= this.speed;
        if (input.includes('ArrowDown')) this.y += this.speed;
        if (input.includes('ArrowLeft')) this.x -= this.speed;
        if (input.includes('ArrowRight')) this.x += this.speed;

        // Shooting
        if (input.includes(' ') || input.includes('Enter')) {
            if (this.shootTimer > this.shootInterval) {
                this.game.bullets.push(new Bullet(this.game, this.x + this.width, this.y + this.height / 2, 10, 0, false));
                this.game.audio.playLaser();
                this.shootTimer = 0;
            }
        }
        this.shootTimer += deltaTime;

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > this.game.height - this.height) this.y = this.game.height - this.height;
    }

    draw(context) {
        if (this.image) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.width, this.height);
            // Debug
            context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
