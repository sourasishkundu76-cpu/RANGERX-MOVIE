import React, { useState } from 'react';
import { Crosshair, Heart, Activity, Radio, Cpu, ChevronRight, ChevronLeft } from 'lucide-react';
import { SimulationTelemetry } from '../types/simulation';

interface TacticalHudPanelProps {
  telemetry: SimulationTelemetry;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const TacticalHudPanel: React.FC<TacticalHudPanelProps> = ({
  telemetry,
  isCollapsed,
  onToggleCollapse
}) => {
  const [activeTab, setActiveTab] = useState<'RADAR' | 'BIOMETRICS'>('RADAR');

  const getDistanceColor = () => {
    if (telemetry.distanceMeters <= 12) return 'text-red-400 glow-red border-red-500/50';
    if (telemetry.distanceMeters <= 25) return 'text-amber-400 glow-amber border-amber-500/50';
    return 'text-cyan-400 glow-cyan border-cyan-500/40';
  };

  return (
    <aside
      className={`fixed right-4 top-16 z-20 w-72 md:w-80 rounded-lg bg-black/85 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-300 select-none ${
        isCollapsed ? 'h-10 overflow-hidden' : 'h-auto pb-3'
      }`}
    >
      {/* Header */}
      <div
        onClick={onToggleCollapse}
        className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/20 bg-cyan-950/30 cursor-pointer hover:bg-cyan-900/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs font-tactical font-semibold tracking-wider text-cyan-200">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>TACTICAL TELEMETRY HUD</span>
        </div>
        <button
          className="text-slate-400 hover:text-white transition-colors"
          aria-label={isCollapsed ? 'Expand telemetry' : 'Collapse telemetry'}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3 space-y-3 font-tactical">
          {/* Simulated Distance Gauge */}
          <div className={`p-2.5 rounded bg-black/60 border ${getDistanceColor()} transition-colors duration-300`}>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>TARGET PROXIMITY</span>
              <span className="text-[10px] tracking-widest uppercase">SIMULATED VALUE</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold font-mono-num tracking-tight">
                {telemetry.distanceMeters.toFixed(1)}
              </span>
              <span className="text-lg font-mono-num text-slate-300">METERS</span>
            </div>
            {/* Visual Bar */}
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-300 ${
                  telemetry.distanceMeters <= 12
                    ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                    : telemetry.distanceMeters <= 25
                    ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                    : 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'
                }`}
                style={{ width: `${Math.min(100, Math.max(8, (50 - telemetry.distanceMeters) * 2))}%` }}
              />
            </div>
          </div>

          {/* Radar Screen Visual */}
          <div className="relative w-full h-36 bg-slate-950 rounded border border-cyan-500/25 flex items-center justify-center overflow-hidden">
            {/* Radar Grid Circles */}
            <div className="absolute w-28 h-28 rounded-full border border-cyan-500/20" />
            <div className="absolute w-20 h-20 rounded-full border border-cyan-500/25" />
            <div className="absolute w-10 h-10 rounded-full border border-cyan-500/30" />
            <div className="absolute w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute h-full w-[1px] bg-cyan-500/20" />

            {/* Rotating Radar Sweep Line */}
            <div className="absolute inset-0 flex items-center justify-center animate-radar pointer-events-none">
              <div className="w-1/2 h-[1px] bg-gradient-to-r from-transparent to-cyan-400 origin-left" />
            </div>

            {/* Ranger Center Marker */}
            <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]" />

            {/* Target Tiger Blip */}
            {telemetry.animalStatus !== 'ABSENT' && (
              <div
                className={`absolute w-3 h-3 rounded-full transition-all duration-500 flex items-center justify-center ${
                  telemetry.threatLevel === 'CRITICAL'
                    ? 'bg-red-500 animate-ping shadow-[0_0_12px_#ef4444]'
                    : telemetry.threatLevel === 'HIGH'
                    ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]'
                    : 'bg-yellow-400 shadow-[0_0_8px_#eab308]'
                }`}
                style={{
                  transform: `translate(${Math.max(10, Math.min(50, telemetry.distanceMeters * 1.05))}px, -${Math.max(8, Math.min(45, telemetry.distanceMeters * 0.95))}px)`
                }}
              />
            )}

            <div className="absolute top-1 left-2 text-[9px] text-cyan-400/80 font-mono">
              RADAR: 360° ACOUSTIC
            </div>
            <div className="absolute bottom-1 right-2 text-[9px] text-cyan-400/80 font-mono">
              RANGE: 50m
            </div>
          </div>

          {/* Biological & Hardware Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                <Heart className="w-3 h-3 text-red-400" />
                <span>RANGER BPM</span>
              </div>
              <div className="text-sm font-bold text-slate-100 font-mono-num">
                {telemetry.rangerHeartRate} <span className="text-[10px] text-slate-400 font-normal">BPM</span>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>SUBJECT</span>
              </div>
              <div className="text-xs font-bold text-cyan-300 uppercase truncate">
                {telemetry.species}
              </div>
            </div>
          </div>

          {/* RANGER-X Device Quick Status */}
          <div className="p-2 rounded bg-cyan-950/20 border border-cyan-500/20 text-xs">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>WRIST UNIT CONFIG</span>
              </span>
              <span className="text-emerald-400 font-mono">LINK ACTIVE</span>
            </div>
            <div className="text-slate-200 text-[11px] leading-tight">
              MODULE: <span className="text-cyan-300 font-semibold">{telemetry.moduleStatus}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              MODE: <span className="text-slate-200">{telemetry.systemStatus}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
