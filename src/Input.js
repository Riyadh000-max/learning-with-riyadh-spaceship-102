export class InputHandler {
    constructor() {
        this.keys = [];
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

        this.setupTouchControls();
    }

    setupTouchControls() {
        const addKey = (key) => {
            if (this.keys.indexOf(key) === -1) this.keys.push(key);
        };
        const removeKey = (key) => {
            const index = this.keys.indexOf(key);
            if (index > -1) this.keys.splice(index, 1);
        };

        const setupBtn = (id, key) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('touchstart', (e) => { e.preventDefault(); addKey(key); }, { passive: false });
                btn.addEventListener('touchend', (e) => { e.preventDefault(); removeKey(key); }, { passive: false });
                // Also mouse events for testing on PC
                btn.addEventListener('mousedown', (e) => { addKey(key); });
                btn.addEventListener('mouseup', (e) => { removeKey(key); });
            }
        };

        setupBtn('btn-up', 'ArrowUp');
        setupBtn('btn-down', 'ArrowDown');
        setupBtn('btn-left', 'ArrowLeft');
        setupBtn('btn-right', 'ArrowRight');
        setupBtn('btn-fire', ' '); // Space for fire

        // Map FIRE to Enter as well for Start Menu interaction
        const fireBtn = document.getElementById('btn-fire');
        if (fireBtn) {
            // Already set up for Space above, just adding Enter events manually to not conflict with setupBtn helper if strict
            fireBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                addKey('Enter');
            }, { passive: false });
            fireBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                removeKey('Enter');
            }, { passive: false });

            fireBtn.addEventListener('mousedown', (e) => { addKey('Enter'); });
            fireBtn.addEventListener('mouseup', (e) => { removeKey('Enter'); });
        }

        document.addEventListener('touchstart', (e) => {
            // Global Tap to Start
            // Triggers 'Enter' momentarily logic handled by game loop checking keys?
            // Actually, best to just inject 'Enter' into keys for a frame or two.
            // But if we just push it, we need to remove it.
            // Let's sim a press:
            if (e.target.tagName !== 'BUTTON') { // Avoid double trigger on buttons
                addKey('Enter');
                setTimeout(() => removeKey('Enter'), 200);
            }
        });
    }
}
