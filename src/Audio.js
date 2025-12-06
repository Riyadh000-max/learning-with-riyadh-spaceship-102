export class AudioControl {
    constructor(game) {
        this.game = game;
    }

    play(name) {
        const sound = this.game.assets.getSound(name);
        if (sound) {
            // Clone node to allow overlapping sounds (e.g. rapid fire)
            const clone = sound.cloneNode();
            clone.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    playBGM() {
        const bgm = this.game.assets.getSound('bgm_space');
        if (bgm) {
            bgm.loop = true;
            bgm.play().catch(e => console.log('BGM play failed:', e));
        }
    }

    playLaser() {
        this.play('sfx_laser');
    }

    playExplosion() {
        this.play('sfx_explosion');
    }

    playAlarm() {
        const alarm = this.game.assets.getSound('sfx_alarm');
        if (alarm) {
            alarm.play().catch(e => console.log('Alarm play failed:', e));
        }
    }

    stopAlarm() {
        const alarm = this.game.assets.getSound('sfx_alarm');
        if (alarm) {
            alarm.pause();
            alarm.currentTime = 0;
        }
    }
}
