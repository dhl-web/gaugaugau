export interface Reaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface Message {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'read';
  image?: string;
  imageCaption?: string;
  voiceMemo?: {
    duration: number; // in seconds
    waveformData: number[];
  };
  reactions?: Reaction[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  genre: string;
  mood: string;
  notes: string;
  audioUrl?: string;
}

export interface MusicSettingsConfig {
  profileName: string;
  version: string;
  lastUpdated: string;
  playback: {
    isPlaying: boolean;
    currentTrackId: string;
    loopMode: 'all' | 'single' | 'off';
    autoPlayOnEnter: boolean;
    crossfadeSeconds: number;
  };
  volumeLevels: {
    masterMusic: number; // 0 - 100
    soundEffects: number; // 0 - 100
    ambienceLayer: number; // 0 - 100
  };
  ambience: {
    activeLayer: 'none' | 'rain' | 'vinyl' | 'cinema-cozy';
    filterCutoffHz: number;
    spatialPan: number; // -1 to 1
  };
  equalizer: {
    preset: 'warm-lofi' | 'balanced' | 'crystal-romance' | 'deep-acoustic';
    bassBoostDb: number;
    midPresenceDb: number;
    trebleSoftnessDb: number;
  };
  chatFeedbackAudio: {
    sendSoundEnabled: boolean;
    receiveSoundEnabled: boolean;
    typingSoundEnabled: boolean;
    heartBurstSoundEnabled: boolean;
  };
}
