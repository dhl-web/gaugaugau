import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  Sliders, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Bell, 
  CloudRain, 
  Disc, 
  Coffee, 
  Ban,
  Music
} from 'lucide-react';
import { MusicSettingsConfig, Track } from '../types/chat';
import { audioEngine, formatMusicConfigJSON, formatMusicConfigYAML } from '../utils/audioEngine';

interface MusicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MusicSettingsConfig;
  onUpdateConfig: (newConfig: MusicSettingsConfig) => void;
  tracks: Track[];
  currentTrack: Track;
  onSelectTrack: (trackId: string) => void;
}

export const MusicSettingsModal: React.FC<MusicSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  tracks,
  currentTrack,
  onSelectTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'player' | 'levels' | 'equalizer' | 'export'>('player');
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'yaml' | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml'>('json');
  const [currentTime, setCurrentTime] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(currentTrack.duration);

  React.useEffect(() => {
    audioEngine.setTimeUpdateListener((curr, dur) => {
      setCurrentTime(curr);
      if (dur && !isNaN(dur) && dur > 0) {
        setCurrentDuration(dur);
      }
    });
    return () => audioEngine.setTimeUpdateListener(null);
  }, []);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    const nextState = !config.playback.isPlaying;
    const updated: MusicSettingsConfig = {
      ...config,
      playback: { ...config.playback, isPlaying: nextState },
    };
    onUpdateConfig(updated);
    if (nextState) {
      audioEngine.startMusic(updated, currentTrack.audioUrl);
    } else {
      audioEngine.stopMusic();
    }
  };

  const handleVolumeChange = (type: 'masterMusic' | 'soundEffects' | 'ambienceLayer', value: number) => {
    const updated: MusicSettingsConfig = {
      ...config,
      volumeLevels: { ...config.volumeLevels, [type]: value },
    };
    onUpdateConfig(updated);
    if (type === 'masterMusic') {
      audioEngine.setMasterVolume(value);
    } else if (type === 'ambienceLayer') {
      audioEngine.updateAmbience(updated);
    }
  };

  const handleAmbienceChange = (layer: 'none' | 'rain' | 'vinyl' | 'cinema-cozy') => {
    const updated: MusicSettingsConfig = {
      ...config,
      ambience: { ...config.ambience, activeLayer: layer },
    };
    onUpdateConfig(updated);
    audioEngine.updateAmbience(updated);
  };

  const handleEqualizerChange = (preset: 'warm-lofi' | 'balanced' | 'crystal-romance' | 'deep-acoustic') => {
    const presetValues = {
      'warm-lofi': { bass: 3.5, mid: 1.2, treble: -2.0 },
      'balanced': { bass: 0.0, mid: 0.0, treble: 0.0 },
      'crystal-romance': { bass: 1.0, mid: 2.5, treble: 3.0 },
      'deep-acoustic': { bass: 4.5, mid: 0.5, treble: -1.0 },
    }[preset];

    const updated: MusicSettingsConfig = {
      ...config,
      equalizer: {
        preset,
        bassBoostDb: presetValues.bass,
        midPresenceDb: presetValues.mid,
        trebleSoftnessDb: presetValues.treble,
      },
    };
    onUpdateConfig(updated);
  };

  const handleFeedbackToggle = (key: keyof MusicSettingsConfig['chatFeedbackAudio']) => {
    const updated: MusicSettingsConfig = {
      ...config,
      chatFeedbackAudio: {
        ...config.chatFeedbackAudio,
        [key]: !config.chatFeedbackAudio[key],
      },
    };
    onUpdateConfig(updated);
  };

  const handleCopyExport = (format: 'json' | 'yaml') => {
    const text = format === 'json' ? formatMusicConfigJSON(config) : formatMusicConfigYAML(config);
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownloadExport = () => {
    const text = exportFormat === 'json' ? formatMusicConfigJSON(config) : formatMusicConfigYAML(config);
    const mime = exportFormat === 'json' ? 'application/json' : 'text/yaml';
    const filename = `cai-dat-am-nhac-cgv.${exportFormat}`;
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-xl bg-white/95 rounded-3xl shadow-2xl border border-pink-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100 bg-gradient-to-r from-pink-50/80 via-white to-pink-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-600 flex items-center justify-center border border-pink-200">
              <Music className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">Cài Đặt Âm Nhạc & Không Gian</h2>
              <p className="text-xs text-pink-600/90 font-medium">Cấu trúc cấu hình âm thanh chuẩn mực cho giao diện chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-pink-100/60 transition-colors"
            title="Đóng bảng cài đặt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 bg-pink-50/40 border-b border-pink-100/70 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'player'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'text-slate-600 hover:text-pink-600 hover:bg-pink-100/50'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Trình phát & Bài hát
          </button>
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'levels'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'text-slate-600 hover:text-pink-600 hover:bg-pink-100/50'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Cường độ âm lượng
          </button>
          <button
            onClick={() => setActiveTab('equalizer')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'equalizer'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'text-slate-600 hover:text-pink-600 hover:bg-pink-100/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Bộ cân bằng âm
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/20'
                : 'text-slate-600 hover:text-pink-600 hover:bg-pink-100/50'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Xuất cấu trúc cấu hình
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700">
          
          {/* TAB 1: PLAYER & TRACKS */}
          {activeTab === 'player' && (
            <div className="space-y-5">
              {/* Active Playing Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border border-pink-200/70">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-semibold text-pink-600">Đang chọn phát</span>
                      {currentTrack.audioUrl && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500 text-white shadow-2xs">
                          Nhạc nền tải lên ⭐
                        </span>
                      )}
                    </div>
                    <div className="text-base font-bold text-slate-800 mt-0.5">{currentTrack.title}</div>
                    <div className="text-xs text-slate-500">{currentTrack.artist} · {currentTrack.genre}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTogglePlay}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-500/25 hover:brightness-105 active:scale-95 transition-all"
                    >
                      {config.playback.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                  </div>
                </div>

                {/* Scrubber slider */}
                <div className="mt-3.5 pt-2.5 border-t border-pink-200/60">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                    <span className="text-pink-600 font-semibold">{formatTime(currentTime)}</span>
                    <span>{formatTime(currentDuration || currentTrack.duration)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={currentDuration || currentTrack.duration || 100}
                    step={0.5}
                    value={currentTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCurrentTime(val);
                      audioEngine.seek(val);
                    }}
                    className="w-full accent-pink-500 h-1.5 cursor-pointer"
                  />
                </div>
              </div>

              {/* Track Selection List */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Danh sách bài hát lofi acoustic gợi nhớ kỷ niệm:
                </label>
                <div className="space-y-2">
                  {tracks.map((track) => {
                    const isSelected = track.id === config.playback.currentTrackId;
                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          onSelectTrack(track.id);
                          if (config.playback.isPlaying) {
                            audioEngine.startMusic({ ...config, playback: { ...config.playback, currentTrackId: track.id } }, track.audioUrl);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-pink-50/90 border-pink-300 ring-2 ring-pink-400/20 shadow-sm'
                            : 'bg-white border-pink-100 hover:border-pink-200 hover:bg-pink-50/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold ${
                            isSelected ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600'
                          }`}>
                            {isSelected && config.playback.isPlaying ? '▶' : '♫'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800 text-sm leading-tight">{track.title}</span>
                              {track.audioUrl && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-100 text-pink-700 border border-pink-200">
                                  Tệp tải lên
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{track.notes}</div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-slate-400 tabular-nums font-mono">
                          {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Playback Automation Preferences */}
              <div className="pt-2 border-t border-pink-100 space-y-3">
                <div className="text-xs font-semibold text-slate-700">Tùy chọn tự động hóa phát nhạc</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-pink-100 bg-pink-50/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.playback.autoPlayOnEnter}
                      onChange={(e) =>
                        onUpdateConfig({
                          ...config,
                          playback: { ...config.playback, autoPlayOnEnter: e.target.checked },
                        })
                      }
                      className="accent-pink-500 rounded"
                    />
                    <span className="text-xs text-slate-700 font-medium">Tự động phát khi mở chat</span>
                  </label>
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-pink-100 bg-pink-50/30">
                    <span className="text-xs text-slate-700 font-medium">Chuyển tiếp mượt</span>
                    <span className="text-xs font-mono font-semibold text-pink-600">{config.playback.crossfadeSeconds}s</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VOLUME & AMBIENCE */}
          {activeTab === 'levels' && (
            <div className="space-y-5">
              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-pink-500" />
                      Âm lượng nhạc nền (Master Music)
                    </span>
                    <span className="font-mono text-pink-600">{config.volumeLevels.masterMusic}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.volumeLevels.masterMusic}
                    onChange={(e) => handleVolumeChange('masterMusic', Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-pink-500" />
                      Cường độ hiệu ứng thông báo (SFX)
                    </span>
                    <span className="font-mono text-pink-600">{config.volumeLevels.soundEffects}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.volumeLevels.soundEffects}
                    onChange={(e) => handleVolumeChange('soundEffects', Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <CloudRain className="w-3.5 h-3.5 text-pink-500" />
                      Cường độ lớp không gian nền (Ambience)
                    </span>
                    <span className="font-mono text-pink-600">{config.volumeLevels.ambienceLayer}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.volumeLevels.ambienceLayer}
                    onChange={(e) => handleVolumeChange('ambienceLayer', Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Ambience layer selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Lớp âm thanh không gian đi kèm (Background Noise Layer):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'Tắt lớp', icon: Ban },
                    { id: 'rain', label: 'Mưa êm dịu', icon: CloudRain },
                    { id: 'vinyl', label: 'Đĩa than Lofi', icon: Disc },
                    { id: 'cinema-cozy', label: 'Quán cà phê', icon: Coffee },
                  ].map((item) => {
                    const isCurrent = config.ambience.activeLayer === item.id;
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAmbienceChange(item.id as any)}
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                          isCurrent
                            ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                            : 'bg-white border-pink-100 text-slate-600 hover:bg-pink-50/50'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sound Effect Test Triggers */}
              <div className="p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-2">
                <div className="text-xs font-semibold text-slate-700">Nghe thử hiệu ứng âm thanh trò chuyện:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => audioEngine.playSendSound(config.volumeLevels.soundEffects)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-medium text-pink-700 hover:bg-pink-100/50 transition-colors"
                  >
                    🔔 Chuông gửi tin
                  </button>
                  <button
                    onClick={() => audioEngine.playReceiveSound(config.volumeLevels.soundEffects)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-medium text-pink-700 hover:bg-pink-100/50 transition-colors"
                  >
                    💬 Chuông nhận tin
                  </button>
                  <button
                    onClick={() => audioEngine.playHeartSound(config.volumeLevels.soundEffects)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-medium text-pink-700 hover:bg-pink-100/50 transition-colors"
                  >
                    💖 Hiệu ứng thả tim
                  </button>
                  <button
                    onClick={() => audioEngine.playKeyClick(config.volumeLevels.soundEffects)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-medium text-pink-700 hover:bg-pink-100/50 transition-colors"
                  >
                    ⌨️ Tiếng gõ phím
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EQUALIZER */}
          {activeTab === 'equalizer' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Bộ chỉnh âm cài sẵn (Equalizer Profiles):
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'warm-lofi', title: 'Lofi Ấm Áp', desc: 'Tăng âm trầm nhẹ, giảm sắc gắt treble' },
                    { id: 'balanced', title: 'Cân Bằng Chuẩn', desc: 'Đáp ứng phẳng tự nhiên 0dB' },
                    { id: 'crystal-romance', title: 'Trong Trẻo Lãng Mạn', desc: 'Tôn giọng hát và tiếng đàn acoustic' },
                    { id: 'deep-acoustic', title: 'Acoustic Trầm Sâu', desc: 'Không gian mộc mạc thư thái' },
                  ].map((eq) => {
                    const isSelected = config.equalizer.preset === eq.id;
                    return (
                      <div
                        key={eq.id}
                        onClick={() => handleEqualizerChange(eq.id as any)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-pink-50 border-pink-300 ring-2 ring-pink-400/20'
                            : 'bg-white border-pink-100 hover:bg-pink-50/40'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-800">{eq.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{eq.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visual 5-Band Representation */}
              <div className="p-4 rounded-2xl bg-white border border-pink-100 space-y-3">
                <div className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Mô phỏng đáp ứng dải tần (Frequency Response)</span>
                  <span className="font-mono text-pink-600 text-xs">{config.equalizer.preset}</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center pt-2">
                  {[
                    { label: '60Hz', val: config.equalizer.bassBoostDb },
                    { label: '250Hz', val: config.equalizer.bassBoostDb * 0.6 },
                    { label: '1kHz', val: config.equalizer.midPresenceDb },
                    { label: '4kHz', val: config.equalizer.trebleSoftnessDb * 0.5 },
                    { label: '12kHz', val: config.equalizer.trebleSoftnessDb },
                  ].map((band, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="h-20 w-3 bg-pink-100 rounded-full flex items-end justify-center p-0.5">
                        <div
                          className="w-full bg-gradient-to-t from-pink-500 to-rose-400 rounded-full transition-all duration-300"
                          style={{
                            height: `${Math.max(15, Math.min(100, 50 + band.val * 8))}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 mt-1.5">{band.label}</span>
                      <span className="text-[10px] font-mono font-semibold text-pink-700">
                        {band.val > 0 ? `+${band.val.toFixed(1)}` : band.val.toFixed(1)}dB
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Audio Toggles */}
              <div className="pt-2 border-t border-pink-100 space-y-2">
                <div className="text-xs font-semibold text-slate-700">Kích hoạt âm thanh theo hành động</div>
                <div className="space-y-1.5 text-xs">
                  {[
                    { key: 'sendSoundEnabled', label: 'Phát chuông khi gửi tin nhắn thành công' },
                    { key: 'receiveSoundEnabled', label: 'Phát chuông khi đối phương gửi tin nhắn tới' },
                    { key: 'typingSoundEnabled', label: 'Hiệu ứng gõ phím nhẹ nhàng' },
                    { key: 'heartBurstSoundEnabled', label: 'Hiệu ứng chuông gió khi thả tim phát sáng' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 p-2 rounded-xl hover:bg-pink-50/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.chatFeedbackAudio[item.key as keyof MusicSettingsConfig['chatFeedbackAudio']]}
                        onChange={() => handleFeedbackToggle(item.key as keyof MusicSettingsConfig['chatFeedbackAudio'])}
                        className="accent-pink-500 rounded"
                      />
                      <span className="text-slate-700 font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STRUCTURED EXPORT (CRITICAL FOR USER REQUIREMENT) */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Cấu Trúc Cài Đặt Xuất Ra Mạch Lạc</h3>
                  <p className="text-[11px] text-slate-500">Cấu hình hoàn chỉnh có thể tái sử dụng cho hệ thống máy chủ hoặc lưu trữ cục bộ</p>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-pink-100/60 rounded-xl text-xs font-medium">
                  <button
                    onClick={() => setExportFormat('json')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      exportFormat === 'json' ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => setExportFormat('yaml')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      exportFormat === 'yaml' ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    YAML
                  </button>
                </div>
              </div>

              {/* Code display block */}
              <div className="relative rounded-2xl bg-slate-900 text-pink-50 p-4 font-mono text-xs overflow-x-auto max-h-64 border border-slate-800 leading-relaxed">
                <pre>
                  {exportFormat === 'json' ? formatMusicConfigJSON(config) : formatMusicConfigYAML(config)}
                </pre>
              </div>

              {/* Actions: Copy & Download */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="text-xs text-slate-500 font-medium">
                  Cập nhật lần cuối: <span className="font-mono text-slate-700">{config.lastUpdated.split('T')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyExport(exportFormat)}
                    className="px-3.5 py-2 rounded-xl bg-pink-50 text-pink-700 border border-pink-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-pink-100 transition-colors"
                  >
                    {copiedFormat === exportFormat ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFormat === exportFormat ? 'Đã sao chép!' : 'Sao chép cấu hình'}
                  </button>
                  <button
                    onClick={handleDownloadExport}
                    className="px-3.5 py-2 rounded-xl bg-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-pink-600 shadow-sm shadow-pink-500/20 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải tệp .{exportFormat}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-pink-50/50 border-t border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span>Kỷ niệm 08/11/2026 · CGV Hoàng Văn Thụ</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white text-xs font-semibold shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            Áp dụng & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
