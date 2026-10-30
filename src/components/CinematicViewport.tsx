import React, { useRef, useEffect, useState } from 'react';
import { Camera, Play, CheckCircle2, AlertOctagon, Sparkles, RefreshCw, Radio, Shield, Crosshair } from 'lucide-react';
import { CameraView, SceneId, ThreatLevel, SimulationTelemetry } from '../types/simulation';
import { IMAGE_ASSETS } from '../utils/simulationData';
import { DeviceWristOverlay } from './DeviceWristOverlay';

interface CinematicViewportProps {
  currentScene: SceneId;
  sceneProgress: number; // 0 to 1 within current scene
  telemetry: SimulationTelemetry;
  cameraView: CameraView;
  onSetCameraView: (view: CameraView) => void;
  onStartSimulation: (isAutoDemo: boolean) => void;
  onConfirmResponse: () => void;
  isConfirmed: boolean;
  countdownValue: number | null; // 3, 2, 1, or null
  isResponseDeployed: boolean;
  onRestart: () => void;
  isCinematic: boolean;
}

export const CinematicViewport: React.FC<CinematicViewportProps> = ({
  currentScene,
  sceneProgress,
  telemetry,
  cameraView,
  onSetCameraView,
  onStartSimulation,
  onConfirmResponse,
  isConfirmed,
  countdownValue,
  isResponseDeployed,
  onRestart,
  isCinematic,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pulseRings, setPulseRings] = useState<number[]>([]);

  // Particle and tactical HUD overlay canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.3 - 0.15,
      alpha: Math.random() * 0.5 + 0.2
    }));

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw atmospheric forest dust / spores
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 240, 255, ${p.alpha * 0.6})`;
        ctx.fill();
      });

      // 2. Draw Target Lock Reticle if animal is visible (Scenes 1-6)
      if (currentScene >= 1 && currentScene <= 6 && cameraView !== 'WRIST' && cameraView !== 'SATELLITE') {
        const centerX = canvas.width * 0.51;
        const centerY = canvas.height * 0.52;
        const reticleSize = Math.max(45, 90 - telemetry.distanceMeters * 1.1);

        ctx.save();
        ctx.strokeStyle =
          telemetry.threatLevel === 'CRITICAL'
            ? 'rgba(239, 68, 68, 0.85)'
            : telemetry.threatLevel === 'HIGH'
            ? 'rgba(245, 158, 11, 0.85)'
            : 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 1.5;

        // Bounding box corners
        const len = 14;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(centerX - reticleSize, centerY - reticleSize + len);
        ctx.lineTo(centerX - reticleSize, centerY - reticleSize);
        ctx.lineTo(centerX - reticleSize + len, centerY - reticleSize);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(centerX + reticleSize - len, centerY - reticleSize);
        ctx.lineTo(centerX + reticleSize, centerY - reticleSize);
        ctx.lineTo(centerX + reticleSize, centerY - reticleSize + len);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(centerX - reticleSize, centerY + reticleSize - len);
        ctx.lineTo(centerX - reticleSize, centerY + reticleSize);
        ctx.lineTo(centerX - reticleSize + len, centerY + reticleSize);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(centerX + reticleSize - len, centerY + reticleSize);
        ctx.lineTo(centerX + reticleSize, centerY + reticleSize);
        ctx.lineTo(centerX + reticleSize, centerY + reticleSize - len);
        ctx.stroke();

        // Center crosshair
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();

        // Target Info Tag
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillText(`TRK: TIGER-01`, centerX + reticleSize + 8, centerY - 12);
        ctx.fillText(`DIST: ${telemetry.distanceMeters.toFixed(1)}m`, centerX + reticleSize + 8, centerY + 4);
        ctx.fillText(`CONF: 99.6%`, centerX + reticleSize + 8, centerY + 20);

        ctx.restore();
      }

      // 3. Response Deployment Pulse Trajectory (Scene 5)
      if (currentScene === 5) {
        ctx.save();
        const startX = canvas.width * 0.42;
        const startY = canvas.height * 0.82;
        const targetX = canvas.width * 0.51;
        const targetY = canvas.height * 0.52;

        // Glowing trajectory line
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Expanding calming waves around target
        const pulseSize = ((frame * 2.5) % 80);
        ctx.strokeStyle = `rgba(52, 211, 153, ${Math.max(0, 1 - pulseSize / 80)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(targetX, targetY, pulseSize + 15, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentScene, telemetry.distanceMeters, telemetry.threatLevel, cameraView]);

  // Determine background image based on scene and camera view
  const getImageForScene = () => {
    if (cameraView === 'SATELLITE') {
      return IMAGE_ASSETS.tacticalMap;
    }
    if (cameraView === 'WRIST') {
      return IMAGE_ASSETS.wristDevice;
    }

    switch (currentScene) {
      case 0:
      case 1:
        return IMAGE_ASSETS.rangerPatrol;
      case 2:
      case 4:
      case 5:
        return IMAGE_ASSETS.tigerEncounter;
      case 3:
        return IMAGE_ASSETS.wristDevice;
      case 6:
        return IMAGE_ASSETS.tigerDeparture;
      case 7:
        return IMAGE_ASSETS.tacticalMap;
      default:
        return IMAGE_ASSETS.rangerPatrol;
    }
  };

  // Zoom/pan animation style for cinematic feel
  const getCameraMotionStyle = () => {
    switch (currentScene) {
      case 1:
        // Slow cinematic push into forest
        return {
          transform: `scale(${1 + sceneProgress * 0.08}) translateY(-${sceneProgress * 15}px)`,
          transition: 'transform 0.4s linear'
        };
      case 2:
        // Dynamic slight zoom as tiger steps forward
        return {
          transform: `scale(${1.08 + sceneProgress * 0.12}) translateX(${sceneProgress * 8}px)`,
          transition: 'transform 0.4s linear'
        };
      case 3:
        // Focus on device
        return {
          transform: `scale(${1.02 + sceneProgress * 0.05})`,
          transition: 'transform 0.4s linear'
        };
      case 4:
        // High tension close framing
        return {
          transform: `scale(${1.15 + sceneProgress * 0.06})`,
          transition: 'transform 0.4s linear'
        };
      case 5:
        // Rapid response pulse
        return {
          transform: `scale(${1.12 - sceneProgress * 0.04})`,
          transition: 'transform 0.4s ease-out'
        };
      case 6:
        // Relaxed wide retreat view
        return {
          transform: `scale(${1.05 - sceneProgress * 0.05}) translateX(-${sceneProgress * 10}px)`,
          transition: 'transform 0.4s linear'
        };
      default:
        return {
          transform: 'scale(1)',
          transition: 'transform 0.5s ease-out'
        };
    }
  };

  return (
    <div className="relative w-full aspect-video max-h-[74vh] mx-auto overflow-hidden bg-black rounded-xl border border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.95)] select-none">
      {/* Background Graphic / Scene Viewport */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={getImageForScene()}
          alt="Simulation Scene"
          className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
          style={getCameraMotionStyle()}
          referrerPolicy="no-referrer"
        />

        {/* Ambient Dark Gradient & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
        <div className="absolute inset-0 vignette-cinema pointer-events-none" />

        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 scanline-overlay opacity-30 pointer-events-none" />

        {/* Emergency Red Tint during High/Critical Approach */}
        {telemetry.threatLevel === 'CRITICAL' && (
          <div className="absolute inset-0 bg-red-600/15 pointer-events-none animate-pulse" />
        )}
        {telemetry.threatLevel === 'HIGH' && (
          <div className="absolute inset-0 bg-amber-600/10 pointer-events-none" />
        )}
      </div>

      {/* Dynamic Overlay Canvas (Particles, Reticle, Traces) */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* HUD Corner Brackets */}
      {!isCinematic && (
        <>
          <div className="absolute top-3 left-3 w-8 h-8 hud-corner-tl pointer-events-none z-15" />
          <div className="absolute top-3 right-3 w-8 h-8 hud-corner-tr pointer-events-none z-15" />
          <div className="absolute bottom-3 left-3 w-8 h-8 hud-corner-bl pointer-events-none z-15" />
          <div className="absolute bottom-3 right-3 w-8 h-8 hud-corner-br pointer-events-none z-15" />
        </>
      )}

      {/* Camera Switcher Bar (top center inside viewport) */}
      {!isCinematic && currentScene > 0 && currentScene < 7 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 rounded-lg bg-black/75 backdrop-blur-md border border-cyan-500/30 font-tactical text-xs">
          <Camera className="w-3.5 h-3.5 text-cyan-400 ml-1.5 mr-0.5" />
          {(['POV', 'TACTICAL', 'WRIST', 'SATELLITE'] as CameraView[]).map((view) => (
            <button
              key={view}
              onClick={() => onSetCameraView(view)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                cameraView === view
                  ? 'bg-cyan-500 text-black shadow-[0_0_8px_#06b6d4]'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      )}

      {/* SCENE 0: STANDBY SCREEN */}
      {currentScene === 0 && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/70 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 text-xs font-tactical tracking-widest uppercase">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>ACADEMIC RESEARCH SIMULATION • PROTOTYPE MISSION</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wider text-white font-tactical glow-cyan">
              RANGER-X
            </h1>

            <p className="text-sm sm:text-base text-cyan-200/90 font-tactical tracking-widest uppercase font-semibold">
              WILDLIFE EMERGENCY RESPONSE SIMULATION
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono py-2 max-w-lg mx-auto">
              <div className="p-2 rounded bg-slate-900/80 border border-slate-700">
                <div className="text-[10px] text-slate-400">MISSION ID</div>
                <div className="text-cyan-300 font-bold">RX-WR-001</div>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-700">
                <div className="text-[10px] text-slate-400">STATUS</div>
                <div className="text-emerald-400 font-bold">STANDBY</div>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-700">
                <div className="text-[10px] text-slate-400">LOCATION</div>
                <div className="text-slate-200 font-bold">FOREST SECTOR 07</div>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-700">
                <div className="text-[10px] text-slate-400">OPERATOR</div>
                <div className="text-slate-200 font-bold">RANGER UNIT</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={() => onStartSimulation(false)}
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-tactical font-bold text-base tracking-widest uppercase shadow-[0_0_25px_rgba(6,182,212,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                START SIMULATION
              </button>

              <button
                onClick={() => onStartSimulation(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-amber-500/20 border border-amber-500/60 text-amber-300 font-tactical font-bold text-sm tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-500/30 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                AUTO DEMO (SCREEN RECORDING)
              </button>
            </div>

            <p className="text-xs text-slate-400 tracking-widest font-tactical pt-2">
              DETECT • ASSESS • RESPOND • PROTECT
            </p>
          </div>
        </div>
      )}

      {/* SCENE 1: FOREST PATROL HUD NOTIFICATION */}
      {currentScene === 1 && (
        <div className="absolute top-16 left-6 z-20 max-w-sm p-3.5 rounded-lg bg-black/80 backdrop-blur-md border border-cyan-500/40 text-slate-100 font-tactical shadow-[0_0_25px_rgba(0,0,0,0.8)] animate-fade-in">
          <div className="text-[10px] font-mono text-cyan-400 tracking-wider">
            SCENE 01 // FOREST PATROL
          </div>
          <div className="text-lg font-bold text-white tracking-wider glow-cyan">
            WILDLIFE DETECTED
          </div>
          <div className="space-y-1 text-xs font-mono text-slate-300 mt-1.5 pt-1.5 border-t border-cyan-500/20">
            <div className="flex justify-between">
              <span className="text-slate-400">SPECIES:</span>
              <span className="text-cyan-300 font-bold">BENGAL TIGER</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">THREAT LEVEL:</span>
              <span className="text-yellow-400 font-bold">ELEVATED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DISTANCE:</span>
              <span className="text-slate-100 font-bold font-mono-num">
                {telemetry.distanceMeters.toFixed(1)} m
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SCENE 2: THREAT APPROACH HUD */}
      {currentScene === 2 && (
        <div className="absolute top-16 left-6 z-20 max-w-sm p-3.5 rounded-lg bg-black/85 backdrop-blur-md border border-amber-500/50 text-slate-100 font-tactical shadow-[0_0_30px_rgba(245,158,11,0.25)] animate-fade-in">
          <div className="text-[10px] font-mono text-amber-400 tracking-wider">
            SCENE 02 // THREAT APPROACH
          </div>
          <div className="text-lg font-bold text-amber-300 tracking-wider glow-amber">
            THREAT STATUS: APPROACHING
          </div>
          <div className="space-y-1 text-xs font-mono text-slate-300 mt-1.5 pt-1.5 border-t border-amber-500/30">
            <div className="flex justify-between">
              <span className="text-slate-400">RISK LEVEL:</span>
              <span className="text-amber-400 font-bold">HIGH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">RANGER STATUS:</span>
              <span className="text-cyan-300 font-bold">ALERT (BACKING OFF)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DISTANCE:</span>
              <span className="text-amber-300 font-bold font-mono-num text-sm">
                {telemetry.distanceMeters.toFixed(1)} m
              </span>
            </div>
          </div>
          <div className="text-[9px] text-slate-400 font-mono mt-2 italic">
            *Simulated distance threshold for academic demonstration
          </div>
        </div>
      )}

      {/* SCENE 3: RANGER-X ACTIVATION OVERLAY */}
      {currentScene === 3 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg space-y-3">
            <div className="text-center font-tactical">
              <span className="px-3 py-1 rounded bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-bold tracking-widest uppercase glow-cyan">
                RANGER-X SYSTEM ACTIVATED
              </span>
            </div>
            <DeviceWristOverlay
              isArmed={false}
              moduleLoadingProgress={Math.min(100, Math.floor(sceneProgress * 120))}
              inline
            />
          </div>
        </div>
      )}

      {/* SCENE 4: FINAL APPROACH & CONFIRMATION */}
      {currentScene === 4 && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="max-w-md w-full p-5 rounded-xl bg-black/90 border-2 border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.5)] font-tactical text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-sm tracking-widest">
              <AlertOctagon className="w-5 h-5 animate-spin" />
              <span>THREAT LEVEL: CRITICAL</span>
            </div>

            <div className="space-y-1 text-xs font-mono text-slate-300">
              <div>RANGER-X: <span className="text-cyan-300 font-bold">ARMED — SIMULATION MODE</span></div>
              <div>DISTANCE: <span className="text-red-400 font-bold font-mono-num text-sm">{telemetry.distanceMeters.toFixed(1)}m</span></div>
              <div className="text-amber-300 font-semibold pt-1">OPERATOR CONFIRMATION REQUIRED</div>
            </div>

            {/* Countdown or Confirmation Button */}
            {countdownValue !== null ? (
              <div className="py-4 space-y-2">
                <div className="text-6xl font-extrabold text-red-400 font-mono-num glow-red animate-ping">
                  {countdownValue}
                </div>
                <div className="text-xs font-mono text-slate-300">
                  DEPLOYMENT IMMINENT...
                </div>
              </div>
            ) : (
              <button
                onClick={onConfirmResponse}
                className="w-full py-3.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 text-white font-tactical font-bold text-lg tracking-widest uppercase shadow-[0_0_25px_rgba(239,68,68,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Crosshair className="w-5 h-5" />
                CONFIRM RESPONSE
              </button>
            )}

            <div className="text-[10px] text-slate-400 font-mono">
              NON-GRAPHIC SIMULATION • WILDLIFE HARM FREE PROTOCOL
            </div>
          </div>
        </div>
      )}

      {/* SCENE 5: RESPONSE DEPLOYED */}
      {currentScene === 5 && (
        <div className="absolute top-16 left-6 z-20 max-w-sm p-4 rounded-lg bg-black/85 backdrop-blur-md border border-cyan-400/60 text-slate-100 font-tactical shadow-[0_0_35px_rgba(6,182,212,0.3)] animate-fade-in">
          <div className="text-[10px] font-mono text-cyan-400 tracking-wider">
            SCENE 05 // RESPONSE INITIATION
          </div>
          <div className="text-lg font-bold text-cyan-200 tracking-wider glow-cyan flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            SIMULATED RESPONSE DEPLOYED
          </div>
          <div className="space-y-1.5 text-xs font-mono text-slate-300 mt-2 pt-2 border-t border-cyan-500/20">
            <div className="flex justify-between">
              <span className="text-slate-400">THREAT STATUS:</span>
              <span className="text-emerald-400 font-bold">DE-ESCALATING (LOW)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ANIMAL STATUS:</span>
              <span className="text-emerald-300 font-bold">CALM & PACIFIED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">RANGER STATUS:</span>
              <span className="text-cyan-300 font-bold">SAFE</span>
            </div>
          </div>
        </div>
      )}

      {/* SCENE 6: RESOLUTION */}
      {currentScene === 6 && (
        <div className="absolute top-16 left-6 z-20 max-w-sm p-4 rounded-lg bg-black/85 backdrop-blur-md border border-emerald-500/50 text-slate-100 font-tactical shadow-[0_0_35px_rgba(16,185,129,0.3)] animate-fade-in">
          <div className="text-[10px] font-mono text-emerald-400 tracking-wider">
            SCENE 06 // RESOLUTION
          </div>
          <div className="text-lg font-bold text-emerald-300 tracking-wider glow-green">
            RANGER-X RESPONSE COMPLETE
          </div>
          <div className="space-y-1.5 text-xs font-mono text-slate-300 mt-2 pt-2 border-t border-emerald-500/30">
            <div className="flex justify-between">
              <span className="text-slate-400">THREAT:</span>
              <span className="text-emerald-400 font-bold">RESOLVED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ANIMAL:</span>
              <span className="text-emerald-300 font-bold">SAFE (DISPERSED)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">RANGER:</span>
              <span className="text-cyan-300 font-bold">SAFE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MISSION:</span>
              <span className="text-emerald-400 font-bold">SUCCESSFUL</span>
            </div>
          </div>
        </div>
      )}

      {/* SCENE 7: MISSION REPORT & FINAL SCREEN */}
      {currentScene === 7 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-2xl bg-black/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.35)] font-tactical text-center space-y-5 animate-scale-up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-mono tracking-widest">
              <span>MISSION REPORT // FINAL TELEMETRY</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest glow-cyan">
                RANGER-X MISSION REPORT
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                MISSION ID: RX-WR-001 • FOREST SECTOR 07
              </p>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono text-left max-w-lg mx-auto">
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-700">
                <span className="text-slate-400 text-[10px]">WILDLIFE DETECTED</span>
                <div className="text-cyan-300 font-bold text-base font-mono-num">1 (TIGER)</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-700">
                <span className="text-slate-400 text-[10px]">THREAT EVENTS</span>
                <div className="text-amber-300 font-bold text-base font-mono-num">1</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-700">
                <span className="text-slate-400 text-[10px]">RANGER RESPONSE</span>
                <div className="text-emerald-400 font-bold text-base">SUCCESSFUL</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-700">
                <span className="text-slate-400 text-[10px]">ANIMAL OUTCOME</span>
                <div className="text-emerald-300 font-bold text-base">SAFE</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-700">
                <span className="text-slate-400 text-[10px]">RANGER OUTCOME</span>
                <div className="text-cyan-300 font-bold text-base">SAFE</div>
              </div>
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-700">
                <span className="text-slate-400 text-[10px]">MISSION STATUS</span>
                <div className="text-emerald-400 font-bold text-base">COMPLETED</div>
              </div>
            </div>

            {/* Core Directives Checkmarks */}
            <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto py-2">
              {[
                { label: 'DETECT', status: 'VERIFIED' },
                { label: 'ASSESS', status: 'VERIFIED' },
                { label: 'RESPOND', status: 'VERIFIED' },
                { label: 'PROTECT', status: 'VERIFIED' }
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-center"
                >
                  <div className="font-bold text-emerald-300 text-xs">{item.label}</div>
                  <div className="text-emerald-400 text-sm font-bold flex items-center justify-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Cinematic Title & Replay Button */}
            <div className="pt-2 border-t border-cyan-500/30 space-y-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-widest text-cyan-200">
                  DETECT • DEPLOY • PROTECT
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  SMART WILDLIFE SAFETY SYSTEM — MISSION COMPLETE
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onRestart}
                  className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-tactical font-bold text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(6,182,212,0.7)] transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  REPLAY MISSION (PRESS R)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
