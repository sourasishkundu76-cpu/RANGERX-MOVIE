import React, { useState } from 'react';
import { Cpu, ShieldCheck, Zap, Radio, CheckCircle, Flame } from 'lucide-react';
import { IMAGE_ASSETS } from '../utils/simulationData';

interface DeviceWristOverlayProps {
  isArmed: boolean;
  moduleLoadingProgress: number; // 0 to 100
  onClose?: () => void;
  inline?: boolean;
}

export const DeviceWristOverlay: React.FC<DeviceWristOverlayProps> = ({
  isArmed,
  moduleLoadingProgress,
  onClose,
  inline = false
}) => {
  return (
    <div
      className={`${
        inline
          ? 'relative w-full max-w-xl mx-auto rounded-xl p-4'
          : 'relative rounded-xl max-w-lg w-full p-4'
      } bg-black/90 backdrop-blur-xl border border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.3)] text-slate-100 font-tactical select-none`}
    >
      {/* Device Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-[0_0_10px_#06b6d4]">
            <Cpu className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-widest text-white glow-cyan">
              RANGER-X WRIST TERMINAL
            </h3>
            <p className="text-[10px] text-cyan-400 font-mono">
              TACTICAL BIO-RESPONSE UNIT // MK-IV
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            CONNECTED
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Device Specs Grid */}
      <div className="grid grid-cols-3 gap-2 my-3 text-xs font-mono">
        <div className="p-2 rounded bg-slate-900/80 border border-slate-700/60">
          <div className="text-[10px] text-slate-400">SYSTEM</div>
          <div className="text-cyan-300 font-bold tracking-wider">
            {isArmed ? 'ARMED' : 'READY'}
          </div>
        </div>

        <div className="p-2 rounded bg-slate-900/80 border border-slate-700/60">
          <div className="text-[10px] text-slate-400">BATTERY</div>
          <div className="text-emerald-400 font-bold font-mono-num flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            96%
          </div>
        </div>

        <div className="p-2 rounded bg-slate-900/80 border border-slate-700/60">
          <div className="text-[10px] text-slate-400">LINK</div>
          <div className="text-cyan-300 font-bold">CONNECTED</div>
        </div>
      </div>

      {/* Simulated Non-Operational Module Calibration */}
      <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-cyan-200">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">NON-OPERATIONAL TRANQUILIZER MODULE</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
            SIMULATION ONLY
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-normal font-sans">
          Fictional rapid-response wildlife preservation cartridge calibrating for humane acoustic telemetry dispersion.
        </p>

        {/* Loading Bar Animation */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>CARTRIDGE CALIBRATION</span>
            <span className="text-cyan-300 font-mono-num font-semibold">
              {moduleLoadingProgress}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-cyan-500/30">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 shadow-[0_0_12px_#06b6d4] transition-all duration-300"
              style={{ width: `${moduleLoadingProgress}%` }}
            />
          </div>
        </div>

        {/* Module Status Pill */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-cyan-500/20 font-mono">
          <span className="text-slate-400">MODULE:</span>
          <span className="text-cyan-300 font-bold">SIMULATION TRANQUILIZER</span>
          <span className="text-slate-400">STATUS:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            READY
          </span>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-slate-500 text-center font-mono">
        ACADEMIC PROTOTYPE • FICTIONAL SYSTEM • NO OPERATIONAL HAZARDS
      </div>
    </div>
  );
};
