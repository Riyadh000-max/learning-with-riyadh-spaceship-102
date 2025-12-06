export class Assets {
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
        console.log('[Assets] Starting loadAll...');

        const imagePromises = Object.keys(this.imagePaths).map(key => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`[Assets] Loaded image: ${key}`);
                    this.images[key] = img;
                    resolve();
                };
                img.onerror = (e) => {
                    console.warn(`[Assets] Failed to load image: ${key} at ${this.imagePaths[key]}`, e);
                    this.images[key] = null;
                    resolve();
                };
                img.src = this.imagePaths[key];
            });
        });

        const soundPromises = Object.keys(this.soundPaths).map(key => {
            return new Promise((resolve) => {
                const audio = new Audio();
                const onLoaded = () => {
                    console.log(`[Assets] Loaded sound: ${key}`);
                    this.sounds[key] = audio;
                    cleanup();
                    resolve();
                };
                const onError = (e) => {
                    console.warn(`[Assets] Failed to load sound: ${key} at ${this.soundPaths[key]}`, e);
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

                // Fallback for local files where events might not fire or fire too fast
                setTimeout(() => {
                    if (!this.sounds[key] && !audio.error) {
                        console.log(`[Assets] Sound timeout (assuming loaded/cached): ${key}`);
                        // Optimistically assume it works if no error? 
                        // Or just resolve to unblock game.
                        this.sounds[key] = audio;
                        resolve();
                    }
                }, 1000);
            });
        });

        await Promise.all([...imagePromises, ...soundPromises]);
        console.log('[Assets] All assets loaded. Resolving...');
    }

    getImage(name) {
        return this.images[name];
    }

    getSound(name) {
        return this.sounds[name];
    }
}
