import { Bullet } from './Bullet.js';

export class Enemy {
    constructor(game, x, y, prisonId = null) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.prisonId = prisonId;
        this.width = 100;
        this.height = 60;
        this.speedX = Math.random() * -2 - 1; // Move left speed -1 to -3
        this.markedForDeletion = false;
        this.image = this.game.assets.getImage('enemy_ship');
        this.hp = 10;
        this.shootTimer = 0;
    }

    update(deltaTime) {
        // Find linked prison
        let linkedPrison = null;
        if (this.prisonId) {
            linkedPrison = this.game.prisons.find(p => p.id === this.prisonId);
        }

        // Movement
        if (linkedPrison && !linkedPrison.markedForDeletion) {
            // GUARDIAN LOGIC: Orbit the prison
            // We want to orbit around the center of the prison
            const cx = linkedPrison.x + linkedPrison.width / 2;
            const cy = linkedPrison.y + linkedPrison.height / 2;

            // Simple circular orbit
            // We can store a personal angle or just use time + offset
            const angleSpeed = 2; // Radians per second
            const orbitRadius = 120; // Distance from prison

            // Use a unique offset for each enemy so they don't stack (using initial x/y or random)
            // Let's assume we set 'angleOffset' in constructor or derive it. 
            // Since we didn't add it in constructor, let's add it on the fly or rely on 'this.x' variance.
            // A clearer way:
            if (!this.angle) this.angle = Math.random() * Math.PI * 2;
            this.angle += deltaTime / 1000 * angleSpeed;

            this.x = cx + Math.cos(this.angle) * orbitRadius - this.width / 2;
            this.y = cy + Math.sin(this.angle) * orbitRadius - this.height / 2;

        } else {
            // No linked prison (or destroyed) - act as free enemy or flee
            // For now: Fly left
            this.x += this.speedX;

            // Wobble
            this.y += Math.sin(Date.now() / 300) * 2;

            if (this.x + this.width < 0) {
                this.markedForDeletion = true;
            }
        }

        // Shooting
        this.shootTimer += deltaTime;
        if (this.shootTimer > 2000) { // Shoot every 2 seconds
            if (this.game.player) {
                // ... (shooting logic same as before, simplified below)
                const angle = Math.atan2(this.game.player.y - this.y, this.game.player.x - this.x);
                const speed = 5;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                this.game.bullets.push(new Bullet(this.game, this.x, this.y + this.height / 2, vx, vy, true));
            }
            this.shootTimer = 0;
        }
    }

    draw(context) {
        if (this.image) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
