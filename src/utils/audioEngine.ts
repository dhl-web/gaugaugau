import { MusicSettingsConfig } from '../types/chat';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private ambienceSource: AudioNode | null = null;
  private ambienceGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;
  private currentNoteIndex = 0;
  private audioElement: HTMLAudioElement | null = null;
  private timeUpdateCallback: ((current: number, duration: number) => void) | null = null;
  private endedCallback: (() => void) | null = null;

  // Lofi chord progression notes (Hz) for fallback synthesis
  private lofiChords = [
    [174.61, 220.0, 261.63, 329.63], // F3, A3, C4, E4
    [164.81, 196.0, 246.94, 293.66], // E3, G3, B3, D4
    [146.83, 174.61, 220.0, 261.63], // D3, F3, A3, C4
    [130.81, 164.81, 196.0, 246.94], // C3, E3, G3, B3
  ];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private initAudioElement() {
    if (typeof window === 'undefined') return null;
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
      this.audioElement.addEventListener('timeupdate', () => {
        if (this.audioElement && this.timeUpdateCallback) {
          this.timeUpdateCallback(this.audioElement.currentTime, this.audioElement.duration || 0);
        }
      });
      this.audioElement.addEventListener('ended', () => {
        if (this.endedCallback) {
          this.endedCallback();
        }
      });
    }
    return this.audioElement;
  }

  // Play a soft bell/chime note (electric piano / Rhodes style) for fallback
  private playChordNote(freq: number, duration: number, gainValue = 0.08) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gainValue, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);

      if (this.musicGain) {
        gain.connect(this.musicGain);
      } else {
        gain.connect(ctx.destination);
      }

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext policy suppression
    }
  }

  public startMusic(config: MusicSettingsConfig, audioUrl?: string) {
    const ctx = this.getContext();
    this.stopMusic();
    this.isMusicPlaying = true;

    // Check if track has actual audio URL file (e.g. Phép Màu)
    if (audioUrl) {
      const audio = this.initAudioElement();
      if (audio) {
        if (audio.src !== window.location.origin + audioUrl && !audio.src.endsWith(audioUrl)) {
          audio.src = audioUrl;
        }
        audio.loop = config.playback.loopMode !== 'off';
        audio.volume = Math.max(0, Math.min(1, config.volumeLevels.masterMusic / 100));
        audio.play().catch(() => {
          // Autoplay interaction policy
        });
        this.updateAmbience(config);
        return;
      }
    }

    // Fallback: Web Audio Synth
    if (!ctx) return;
    if (!this.musicGain) {
      this.musicGain = ctx.createGain();
      this.musicGain.connect(ctx.destination);
    }
    this.musicGain.gain.setValueAtTime((config.volumeLevels.masterMusic / 100) * 0.4, ctx.currentTime);

    const step = () => {
      if (!this.isMusicPlaying) return;
      const chord = this.lofiChords[this.currentNoteIndex % this.lofiChords.length];
      this.currentNoteIndex++;

      chord.forEach((freq, idx) => {
        setTimeout(() => {
          if (this.isMusicPlaying) {
            this.playChordNote(freq, 2.6, 0.07);
          }
        }, idx * 160);
      });
    };

    step();
    this.musicInterval = window.setInterval(step, 2400);
    this.updateAmbience(config);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {
        // Ignored
      }
    }
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.stopAmbience();
  }

  public seek(seconds: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = seconds;
    }
  }

  public getCurrentTime(): number {
    return this.audioElement ? this.audioElement.currentTime : 0;
  }

  public getDuration(): number {
    return this.audioElement ? this.audioElement.duration || 0 : 0;
  }

  public setTimeUpdateListener(cb: ((current: number, duration: number) => void) | null) {
    this.timeUpdateCallback = cb;
  }

  public setEndedListener(cb: (() => void) | null) {
    this.endedCallback = cb;
  }

  public setMasterVolume(volume: number) {
    const volFraction = Math.max(0, Math.min(1, volume / 100));
    if (this.audioElement) {
      this.audioElement.volume = volFraction;
    }
    const ctx = this.getContext();
    if (ctx && this.musicGain) {
      this.musicGain.gain.setValueAtTime(volFraction * 0.4, ctx.currentTime);
    }
  }

  // Ambience audio generator (vinyl crackle / rain pink noise)
  public updateAmbience(config: MusicSettingsConfig) {
    const ctx = this.getContext();
    if (!ctx || config.ambience.activeLayer === 'none' || !this.isMusicPlaying) {
      this.stopAmbience();
      return;
    }

    try {
      this.stopAmbience();

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(config.ambience.filterCutoffHz || 1200, ctx.currentTime);

      const gain = ctx.createGain();
      const level = (config.volumeLevels.ambienceLayer / 100) * 0.12;
      gain.gain.setValueAtTime(level, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      this.ambienceSource = noise;
      this.ambienceGain = gain;
    } catch {
      // Ignored
    }
  }

  private stopAmbience() {
    if (this.ambienceSource) {
      try {
        (this.ambienceSource as AudioBufferSourceNode).stop();
        this.ambienceSource.disconnect();
      } catch {
        // Ignored
      }
      this.ambienceSource = null;
    }
  }

  // Sound Effect: Message Sent (sweet bell chime)
  public playSendSound(sfxVolume = 80) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const vol = (sfxVolume / 100) * 0.15;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(1046.5, now);
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12);

      osc2.frequency.setValueAtTime(1567.98, now);
      osc2.frequency.exponentialRampToValueAtTime(2093.0, now + 0.12);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // Ignored
    }
  }

  // Sound Effect: Message Received (bubble marimba pop)
  public playReceiveSound(sfxVolume = 80) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const vol = (sfxVolume / 100) * 0.18;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignored
    }
  }

  // Sound Effect: Heart Sparkle
  public playHeartSound(sfxVolume = 80) {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    const vol = (sfxVolume / 100) * 0.12;

    notes.forEach((freq, i) => {
      setTimeout(() => {
        try {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.25);
        } catch {
          // Ignored
        }
      }, i * 45);
    });
  }

  // Sound Effect: Soft Key click
  public playKeyClick(sfxVolume = 60) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const vol = (sfxVolume / 100) * 0.03;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Ignored
    }
  }
}

export const audioEngine = new AudioEngine();

// Formatter to produce clean structured JSON for music settings
export function formatMusicConfigJSON(config: MusicSettingsConfig): string {
  return JSON.stringify(config, null, 2);
}

// Formatter to produce clean structured YAML for music settings
export function formatMusicConfigYAML(config: MusicSettingsConfig): string {
  return `# ====================================================================
# BẢNG CÀI ĐẶT CẤU HÌNH ÂM NHẠC & KHÔNG GIAN (MUSIC AUDIO CONFIGURATION)
# Giao diện Chat Hồng Tối Giản - Kỷ niệm CGV Hoàng Văn Thụ (08/11/2026)
# Nhạc nền: Phép Màu - F47 Cover x Mounter x MAYDAYs (Minh Tốc - Chạm Music Box)
# ====================================================================

profile_name: "${config.profileName}"
version: "${config.version}"
last_updated: "${config.lastUpdated}"

# 1. CẤU HÌNH PHÁT NHẠC NỀN (PLAYBACK SETTINGS)
playback:
  is_playing: ${config.playback.isPlaying}
  current_track_id: "${config.playback.currentTrackId}"
  loop_mode: "${config.playback.loopMode}" # all | single | off
  auto_play_on_enter: ${config.playback.autoPlayOnEnter}
  crossfade_seconds: ${config.playback.crossfadeSeconds}

# 2. CƯỜNG ĐỘ ÂM LƯỢNG (VOLUME LEVELS % 0-100)
volume_levels:
  master_music: ${config.volumeLevels.masterMusic}%
  sound_effects: ${config.volumeLevels.soundEffects}%
  ambience_layer: ${config.volumeLevels.ambienceLayer}%

# 3. LỚP KHÔNG GIAN ÂM THANH (AMBIENCE ATMOSPHERE)
ambience:
  active_layer: "${config.ambience.activeLayer}" # none | rain | vinyl | cinema-cozy
  filter_cutoff_hz: ${config.ambience.filterCutoffHz}
  spatial_pan: ${config.ambience.spatialPan}

# 4. BỘ CÂN BẰNG TẦN SỐ (EQUALIZER PRESETS)
equalizer:
  preset: "${config.equalizer.preset}" # warm-lofi | balanced | crystal-romance | deep-acoustic
  bass_boost_db: ${config.equalizer.bassBoostDb} dB
  mid_presence_db: ${config.equalizer.midPresenceDb} dB
  treble_softness_db: ${config.equalizer.trebleSoftnessDb} dB

# 5. HIỆU ỨNG ÂM THANH TRÒ CHUYỆN (CHAT FEEDBACK AUDIO)
chat_feedback_audio:
  send_sound_enabled: ${config.chatFeedbackAudio.sendSoundEnabled}
  receive_sound_enabled: ${config.chatFeedbackAudio.receiveSoundEnabled}
  typing_sound_enabled: ${config.chatFeedbackAudio.typingSoundEnabled}
  heart_burst_sound_enabled: ${config.chatFeedbackAudio.heartBurstSoundEnabled}
`;
}
