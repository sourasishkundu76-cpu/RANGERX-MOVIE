import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Eye,
  Sparkles,
  FastForward
} from 'lucide-react';
import { SceneId } from '../types/simulation';
import { SCENE_DEFINITIONS, TOTAL_SIMULATION_DURATION } from '../utils/simulationData';

interface ControlDeckProps {
  currentSceneId: SceneId;
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  isCinematic: boolean;
  isAutoDemo: boolean;
  playbackSpeed: number; // 1, 1.5, 2
  totalElapsedSeconds: number;
  onTogglePlay: () => void;
  onRestart: () => void;
  onNextScene: () => void;
  onPrevScene: () => void;
  onJumpToScene: (id: SceneId) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onToggleCinematic: () => void;
  onToggleAutoDemo: () => void;
  onCyclePlaybackSpeed: () => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  currentSceneId,
  isPlaying,
  isMuted,
  isFullscreen,
  isCinematic,
  isAutoDemo,
  playbackSpeed,
  totalElapsedSeconds,
  onTogglePlay,
  onRestart,
  onNextScene,
  onPrevScene,
  onJumpToScene,
  onToggleMute,
  onToggleFullscreen,
  onToggleCinematic,
  onToggleAutoDemo,
  onCyclePlaybackSpeed,
}) => {
  const currentSceneDef = SCENE_DEFINITIONS.find((s) => s.id === currentSceneId) || SCENE_DEFINITIONS[0];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (totalElapsedSeconds / TOTAL_SIMULATION_DURATION) * 100);

  return (
    <nav
      aria-label="Simulation Controls"
      className={`w-full max-w-5xl mx-auto rounded-xl bg-black/85 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_25px_rgba(0,0,0,0.85)] p-3 text-slate-100 font-tactical select-none transition-all duration-300 ${
        isCinematic ? 'opacity-30 hover:opacity-100' : 'opacity-100'
      }`}
    >
      {/* Top Bar: Scene Title + Time Scrubber */}
      <div className="space-y-1.5 mb-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">
              {currentSceneId === 0 ? 'STANDBY' : `SCENE ${currentSceneId}/7`}:
            </span>
            <span className="text-white font-semibold tracking-wide">
              {currentSceneDef.name}
            </span>
            <span className="text-slate-400 hidden sm:inline">
              — {currentSceneDef.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono-num text-[11px] text-slate-300">
            <span className="text-cyan-300 font-bold">
              {formatTime(totalElapsedSeconds)}
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{formatTime(TOTAL_SIMULATION_DURATION)}</span>
          </div>
        </div>

        {/* Interactive Progress Bar */}
        <div
          role="slider"
          aria-label="Simulation progress timeline"
          aria-valuemin={0}
          aria-valuemax={TOTAL_SIMULATION_DURATION}
          aria-valuenow={Math.round(totalElapsedSeconds)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') onNextScene();
            if (e.key === 'ArrowLeft') onPrevScene();
          }}
          className="relative w-full h-2 rounded-full bg-slate-900 border border-slate-700/60 overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = (e.clientX - rect.left) / rect.width;
            const targetSec = clickRatio * TOTAL_SIMULATION_DURATION;
            // find corresponding scene
            for (let i = SCENE_DEFINITIONS.length - 1; i >= 1; i--) {
              if (targetSec >= SCENE_DEFINITIONS[i].startOffsetSeconds) {
                onJumpToScene(SCENE_DEFINITIONS[i].id);
                break;
              }
            }
          }}
        >
          {/* Progress Fill */}
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 shadow-[0_0_10px_#06b6d4] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Scene Pin Markers */}
          {SCENE_DEFINITIONS.slice(1).map((scene) => (
            <div
              key={scene.id}
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-200/40"
              style={{
                left: `${(scene.startOffsetSeconds / TOTAL_SIMULATION_DURATION) * 100}%`
              }}
              title={`Scene ${scene.id}: ${scene.name}`}
            />
          ))}
        </div>
      </div>

      {/* Button Deck Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Playback controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.6)]"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={onRestart}
            title="Restart Simulation (R)"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevScene}
            disabled={currentSceneId <= 1}
            title="Previous Scene"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white border border-slate-700/80 transition-all"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onNextScene}
            disabled={currentSceneId >= 7}
            title="Next Scene"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 hover:text-white border border-slate-700/80 transition-all"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Toggle */}
          <button
            onClick={onCyclePlaybackSpeed}
            title="Cycle Playback Speed"
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 font-mono font-bold border border-slate-700/80 flex items-center gap-1 transition-all"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{playbackSpeed}x</span>
          </button>
        </div>

        {/* Center: Quick Scene Selector Tabs */}
        <div className="hidden lg:flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800">
          {SCENE_DEFINITIONS.slice(1).map((s) => (
            <button
              key={s.id}
              onClick={() => onJumpToScene(s.id)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all ${
                currentSceneId === s.id
                  ? 'bg-cyan-500 text-black shadow-[0_0_8px_#06b6d4]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s.id}. {s.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Right: Mode & Audio Controls */}
        <div className="flex items-center gap-1.5">
          {/* Auto Demo Button */}
          <button
            onClick={onToggleAutoDemo}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold font-tactical flex items-center gap-1.5 transition-all ${
              isAutoDemo
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_#f59e0b]'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AUTO DEMO</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-slate-900 text-slate-500 border-slate-700'
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Cinematic Mode */}
          <button
            onClick={onToggleCinematic}
            title="Cinematic Clean Mode"
            className={`p-2 rounded-lg border transition-all ${
              isCinematic
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
