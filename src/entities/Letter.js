export class Letter {
    constructor(game, x, y, char) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.char = char;
        this.width = 40;
        this.height = 40;
        // Initial scatter velocity
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.markedForDeletion = false;
        this.timer = 0;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;

        // Dampen scatter, then drift left
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Drift left with background
        this.x -= 1;

        if (this.x + this.width < 0 || this.y > this.game.height || this.y < 0) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.fillStyle = 'yellow';
        context.fillRect(this.x, this.y, this.width, this.height);

        context.fillStyle = 'black';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.char, this.x + this.width / 2, this.y + this.height / 2);
    }
}
