export class AssetManager {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.imagePaths = {
            'player_ship': 'assets/images/player_ship.png',
            'cabin_interior': 'assets/images/cabin_interior.png',
            'enemy_ship': 'assets/images/enemy_ship.png',
            'space_prison': 'assets/images/space_prison.png',
            'background_space': 'assets/images/background_space.png'
        };
        this.soundPaths = {
            'bgm_space': 'assets/sounds/bgm_space.mp3',
            'sfx_laser': 'assets/sounds/sfx_laser.wav',
            'sfx_explosion': 'assets/sounds/sfx_explosion.wav',
            'sfx_alarm': 'assets/sounds/sfx_alarm.wav',
            'sfx_win': 'assets/sounds/sfx_win.wav'
        };
    }

    async loadAll() {
        console.log('[AssetManager] Starting loadAll...');
        this.errors = []; // Reset errors

        const imagePromises = Object.keys(this.imagePaths).map(key => {
            return new Promise((resolve) => {
                const img = new Image();
                let isResolved = false;

                const timeout = setTimeout(() => {
                    if (!isResolved) {
                        const msg = `Error: Timeout loading image '${key}' at '${this.imagePaths[key]}'`;
                        console.warn(msg);
                        this.errors.push(msg);
                        this.images[key] = null;
                        isResolved = true;
                        resolve();
                    }
                }, 2000); // 2 seconds timeout

                img.onload = () => {
                    if (!isResolved) {
                        clearTimeout(timeout);
                        console.log(`[AssetManager] Loaded image: ${key}`);
                        this.images[key] = img;
                        isResolved = true;
                        resolve();
                    }
                };
                img.onerror = (e) => {
                    if (!isResolved) {
                        clearTimeout(timeout);
                        const msg = `Error: Cannot find image '${key}' at '${this.imagePaths[key]}'`;
                        console.warn(msg, e);
                        this.errors.push(msg);
                        this.images[key] = null;
                        isResolved = true;
                        resolve();
                    }
                };
                img.src = this.imagePaths[key];
            });
        });

        const soundPromises = Object.keys(this.soundPaths).map(key => {
            return new Promise((resolve) => {
                const audio = new Audio();
                const onLoaded = () => {
                    console.log(`[AssetManager] Loaded sound: ${key}`);
                    this.sounds[key] = audio;
                    cleanup();
                    resolve();
                };
                const onError = (e) => {
                    // Sounds are less critical, just log warning
                    console.warn(`[AssetManager] Failed to load sound: ${key} at ${this.soundPaths[key]}`, e);
                    this.sounds[key] = null;
                    cleanup();
                    resolve();
                };
                const cleanup = () => {
                    audio.removeEventListener('canplaythrough', onLoaded);
                    audio.removeEventListener('error', onError);
                };

                audio.addEventListener('canplaythrough', onLoaded);
                audio.addEventListener('error', onError);

                audio.src = this.soundPaths[key];
                audio.load();

                setTimeout(() => {
                    if (!this.sounds[key] && !audio.error) {
                        console.log(`[AssetManager] Sound timeout: ${key}`);
                        this.sounds[key] = audio; // Attempt to use anyway or null? Let's keep it.
                        resolve();
                    }
                }, 1000);
            });
        });

        await Promise.all([...imagePromises, ...soundPromises]);
        console.log('[AssetManager] All assets loaded (or failed). Resolving...');
        if (this.errors.length > 0) {
            console.error('[AssetManager] Asset loading errors:', this.errors);
        }
    }

    getImage(name) {
        return this.images[name];
    }

    getSound(name) {
        return this.sounds[name];
    }
}
