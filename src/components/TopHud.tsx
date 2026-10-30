import React, { useState, useEffect } from 'react';
import { Shield, Radio, Battery, Clock, Eye, Sparkles } from 'lucide-react';
import { ThreatLevel } from '../types/simulation';

interface TopHudProps {
  currentSceneId: number;
  threatLevel: ThreatLevel;
  isCinematic: boolean;
  onToggleCinematic: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  currentSceneId,
  threatLevel,
  isCinematic,
  onToggleCinematic
}) => {
  const [timeString, setTimeString] = useState('08:23:42');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getThreatColor = () => {
    switch (threatLevel) {
      case 'CRITICAL':
        return 'text-red-400 border-red-500/40 bg-red-950/40';
      case 'HIGH':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
      case 'ELEVATED':
        return 'text-yellow-400 border-yellow-500/40 bg-yellow-950/30';
      case 'RESOLVED':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
      default:
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
    }
  };

  return (
    <header className="relative z-30 w-full px-4 py-2.5 bg-black/85 backdrop-blur-md border-b border-cyan-500/20 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 font-tactical tracking-wider text-xs">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/50 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm tracking-widest text-cyan-100 glow-cyan">
              RANGER-X
            </span>
          </div>
          <span className="text-slate-400 font-mono-num hidden sm:inline">
            MISSION ID: <span className="text-cyan-300 font-semibold">RX-WR-001</span>
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-400 hidden md:inline">
            SECTOR: <span className="text-slate-200">FOREST 07</span>
          </span>
        </div>

        {/* Center Telemetry & Threat Badge */}
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded border font-semibold flex items-center gap-1.5 transition-colors duration-300 ${getThreatColor()}`}>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">THREAT:</span>
            <span className="font-bold">{threatLevel}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/60 border border-slate-700/50 text-slate-300">
            <span className="text-[10px] text-slate-400">STATUS:</span>
            <span className="text-cyan-300 font-mono-num font-semibold">
              {currentSceneId === 0 ? 'STANDBY' : currentSceneId === 7 ? 'COMPLETE' : 'ACTIVE SIMULATION'}
            </span>
          </div>
        </div>

        {/* Right Info Zone */}
        <div className="flex items-center gap-4 shrink-0 font-mono-num text-[11px] text-slate-300">
          <div className="hidden sm:flex items-center gap-1 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-medium">SAT-LINK</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">96%</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-cyan-200">{timeString}</span>
          </div>

          <button
            onClick={onToggleCinematic}
            title="Toggle Cinematic Widescreen Mode"
            className={`px-2.5 py-1 rounded border text-xs font-tactical font-semibold flex items-center gap-1 transition-all ${
              isCinematic
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/80 text-cyan-400 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/40'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isCinematic ? 'EXIT CINEMATIC' : 'CINEMATIC MODE'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
