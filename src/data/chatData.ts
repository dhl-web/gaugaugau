import { Message, MusicSettingsConfig, Track } from '../types/chat';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track_phep_mau',
    title: 'Phép Màu',
    artist: 'F47 x Mounter x MAYDAYs (Minh Tốc - Chạm Music Box)',
    duration: 273,
    genre: 'Acoustic Ballad Lofi',
    mood: 'Ngọt ngào, lắng đọng, lãng mạn',
    notes: '“Chẳng phải phép màu, vì sao chúng ta gặp nhau... Quãng đời mai sau luôn cạnh nhau”',
    audioUrl: './assets/aistudio/Ph_p_M_u_-_F47_Cover_x_Mounter_x_MAYDAYs__Minh_T_c_-_Ch_m_Music_Box__cut_273sec__32daddfe.mp3',
  },
];

export const INITIAL_MUSIC_CONFIG: MusicSettingsConfig = {
  profileName: 'Cấu hình Âm nhạc Chat Kỷ Niệm CGV - Phép Màu',
  version: '1.3.0',
  lastUpdated: '2026-11-09T15:40:00+07:00',
  playback: {
    isPlaying: false,
    currentTrackId: 'track_phep_mau',
    loopMode: 'all',
    autoPlayOnEnter: false,
    crossfadeSeconds: 2.5,
  },
  volumeLevels: {
    masterMusic: 75,
    soundEffects: 80,
    ambienceLayer: 25,
  },
  ambience: {
    activeLayer: 'vinyl',
    filterCutoffHz: 1400,
    spatialPan: 0.0,
  },
  equalizer: {
    preset: 'warm-lofi',
    bassBoostDb: 3.5,
    midPresenceDb: 1.2,
    trebleSoftnessDb: -2.0,
  },
  chatFeedbackAudio: {
    sendSoundEnabled: true,
    receiveSoundEnabled: true,
    typingSoundEnabled: true,
    heartBurstSoundEnabled: true,
  },
};

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'partner',
    text: 'Em nhớ giữ sức khoẻ, ăn uống đầy đủ và ngủ đúng giờ nhé! <3',
    timestamp: '21:30',
    status: 'read',
    reactions: [
      { emoji: '💖', count: 1, reactedByMe: true },
    ],
  },
];

