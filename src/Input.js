export class InputHandler {
    constructor() {
        this.keys = [];

        // Keyboard Events
        window.addEventListener('keydown', e => {
            if ((e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === ' ' || // Space
                e.key === 'Enter')
                && this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            }
        });
        window.addEventListener('keyup', e => {
            if (e.key === 'ArrowDown' ||
                e.key === 'ArrowUp' ||
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowRight' ||
                e.key === ' ' ||
                e.key === 'Enter') {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });

        // Touch/Mouse Events for Virtual Controls
        this.setupTouchControls();
    }

    setupTouchControls() {
        const buttons = document.querySelectorAll('.dpad-btn, .fire-btn');
        const startScreen = document.getElementById('start-screen');

        buttons.forEach(btn => {
            const key = btn.getAttribute('data-key');

            const press = (e) => {
                e.preventDefault(); // Prevent default touch behavior (scrolling/zoom)
                if (this.keys.indexOf(key) === -1) {
                    this.keys.push(key);
                }
                btn.classList.add('active'); // For visual feedback if needed
            };

            const release = (e) => {
                e.preventDefault();
                const index = this.keys.indexOf(key);
                if (index > -1) {
                    this.keys.splice(index, 1);
                }
                btn.classList.remove('active');
            };

            btn.addEventListener('mousedown', press);
            btn.addEventListener('mouseup', release);
            btn.addEventListener('mouseleave', release); // If mouse leaves button while pressed

            btn.addEventListener('touchstart', press, { passive: false });
            btn.addEventListener('touchend', release, { passive: false });
        });

        if (startScreen) {
            const triggerStart = (e) => {
                e.preventDefault(); // Prevent double firing
                if (this.keys.indexOf('Enter') === -1) {
                    this.keys.push('Enter');
                    setTimeout(() => {
                        const index = this.keys.indexOf('Enter');
                        if (index > -1) this.keys.splice(index, 1);
                    }, 100); // Simulate a quick press
                }
            };

            startScreen.addEventListener('click', triggerStart);
            startScreen.addEventListener('touchstart', triggerStart, { passive: false });
        }
    }
}
