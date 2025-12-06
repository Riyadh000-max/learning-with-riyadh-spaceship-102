export class Prison {
    constructor(game, x, y, id) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.id = id;
        this.width = 80;
        this.height = 80;
        this.hp = 30;
        this.shieldHp = 3; // 3 hits to break shield
        this.markedForDeletion = false;
        this.image = this.game.assets.getImage('space_prison');
        this.drops = this.getDrops(id); // Single letter
        this.guardCount = 0; // Managed by Game class, but kept for legacy check
        this.angle = 0; // For shield rotation
        this.initialY = y; // Center of sine wave
        this.randomPhase = Math.random() * Math.PI * 2; // Randomize start of sine wave
    }

    getDrops(id) {
        // ID 1 -> 'A', ID 26 -> 'Z'
        const code = 'A'.charCodeAt(0) + (id - 1);
        const char = String.fromCharCode(code);
        return [char];
    }

    update(deltaTime) {
        // Unpredictable Movement: Sine Wave + Jitter
        // Move towards left slowly
        if (this.x > 800) {
            this.x -= 2; // Fly in
        } else {
            // Basic Sine Wave
            const time = Date.now() / 1000;
            const sineOffset = Math.sin(time + this.randomPhase) * 100;

            // Jitter
            const jitter = (Math.random() - 0.5) * 5;

            this.y = this.initialY + sineOffset + jitter;
        }

        // Rotate shield visual
        this.angle += 0.05;

        // Ensure it stays within bounds
        if (this.y < 50) this.y = 50;
        if (this.y > this.game.height - 150) this.y = this.game.height - 150;
    }

    draw(context) {
        if (this.image) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'white';
            context.fillText(this.drops[0], this.x + 30, this.y + 45);
        }

        // Draw Shield
        if (this.shieldHp > 0) {
            context.save();
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.rotate(this.angle);

            context.strokeStyle = 'cyan';
            context.lineWidth = 4;
            context.lineCap = 'round';

            // Draw segmented ring for effect
            context.beginPath();
            context.arc(0, 0, this.width * 0.8, 0, Math.PI * 1.5); // 75% circle
            context.stroke();

            context.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            context.beginPath();
            context.arc(0, 0, this.width * 0.9, Math.PI, Math.PI * 0.5); // Outer faint ring
            context.stroke();

            context.restore();
        }

        // Draw letter hint on top
        context.fillStyle = 'white';
        context.font = '20px Arial';
        context.fillText(this.drops[0], this.x + 35, this.y - 10);
    }
}
