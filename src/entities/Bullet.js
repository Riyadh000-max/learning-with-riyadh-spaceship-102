export class Bullet {
    constructor(game, x, y, vx, vy, isEnemy = false) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = vx || 10;
        this.vy = vy || 0;
        this.isEnemy = isEnemy;
        this.width = isEnemy ? 15 : 30;
        this.height = isEnemy ? 15 : 10;
        this.markedForDeletion = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x > this.game.width || this.x < 0 || this.y > this.game.height || this.y < 0) {
            this.markedForDeletion = true;
        }
    }

    draw(context) {
        context.fillStyle = this.isEnemy ? 'red' : 'yellow';
        if (this.isEnemy) {
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.fill();
        } else {
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
