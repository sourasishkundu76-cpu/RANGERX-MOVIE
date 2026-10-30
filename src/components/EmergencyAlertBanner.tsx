import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { ThreatLevel } from '../types/simulation';

interface EmergencyAlertBannerProps {
  threatLevel: ThreatLevel;
  distance: number;
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  threatLevel,
  distance
}) => {
  if (threatLevel === 'NOMINAL' || threatLevel === 'RESOLVED') return null;

  const isCritical = threatLevel === 'CRITICAL';

  return (
    <div
      className={`relative z-10 w-full py-1 px-4 flex items-center justify-between text-xs font-tactical font-bold tracking-widest uppercase transition-all duration-300 ${
        isCritical
          ? 'bg-red-600/90 text-white shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse'
          : threatLevel === 'HIGH'
          ? 'bg-amber-600/90 text-black shadow-[0_0_20px_rgba(245,158,11,0.6)]'
          : 'bg-yellow-500/80 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]'
      }`}
    >
      <div className="flex items-center gap-2">
        {isCritical ? (
          <ShieldAlert className="w-4 h-4 animate-bounce" />
        ) : (
          <AlertTriangle className="w-4 h-4" />
        )}
        <span>
          {isCritical
            ? 'CRITICAL WILDLIFE PROXIMITY ALERT — OPERATOR ACTION REQUIRED'
            : threatLevel === 'HIGH'
            ? 'HIGH THREAT DETECTED — WILDLIFE CLOSING DISTANCE'
            : 'ELEVATED WILDLIFE ACTIVITY DETECTED IN SECTOR 07'}
        </span>
      </div>

      <div className="flex items-center gap-4 font-mono-num text-[11px]">
        <span>DISTANCE: {distance.toFixed(1)}m</span>
        <span className="hidden sm:inline">SAFETY CORRIDOR: BREACHED</span>
      </div>
    </div>
  );
};
