/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SceneId, ThreatLevel, CameraView, LogEntry, SimulationTelemetry } from './types/simulation';
import { SCENE_DEFINITIONS, TOTAL_SIMULATION_DURATION } from './utils/simulationData';
import { soundFX } from './utils/audioSystem';
import { TopHud } from './components/TopHud';
import { EventLogPanel } from './components/EventLogPanel';
import { TacticalHudPanel } from './components/TacticalHudPanel';
import { EmergencyAlertBanner } from './components/EmergencyAlertBanner';
import { CinematicViewport } from './components/CinematicViewport';
import { ControlDeck } from './components/ControlDeck';

export default function App() {
  const [currentScene, setCurrentScene] = useState<SceneId>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAutoDemo, setIsAutoDemo] = useState<boolean>(false);
  const [isCinematic, setIsCinematic] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [cameraView, setCameraView] = useState<CameraView>('POV');

  // Elapsed time in current scene (seconds)
  const [sceneElapsedTime, setSceneElapsedTime] = useState<number>(0);
  // Total elapsed simulation time (seconds)
  const [totalElapsedTime, setTotalElapsedTime] = useState<number>(0);

  // Panels collapsed states
  const [isLogCollapsed, setIsLogCollapsed] = useState<boolean>(false);
  const [isTacticalCollapsed, setIsTacticalCollapsed] = useState<boolean>(false);

  // Response confirmation state in Scene 4
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [isResponseDeployed, setIsResponseDeployed] = useState<boolean>(false);

  // Event Log
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-0',
      timestamp: '00:00',
      scene: 0,
      message: 'System standby — Forest Sector 07 ready',
      type: 'info',
    },
  ]);

  // Telemetry state
  const [telemetry, setTelemetry] = useState<SimulationTelemetry>({
    threatLevel: 'NOMINAL',
    distanceMeters: 48.0,
    species: 'UNKNOWN',
    rangerHeartRate: 72,
    animalHeartRate: 70,
    deviceBattery: 96,
    systemStatus: 'STANDBY',
    moduleStatus: 'CALIBRATING',
    animalStatus: 'ABSENT',
    rangerStatus: 'PATROLLING',
  });

  const appContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const triggeredEventsRef = useRef<Set<string>>(new Set());

  // Helper to format timestamp MM:SS
  const getSimTimestamp = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = Math.floor(totalSecs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addLog = useCallback(
    (message: string, type: LogEntry['type'], totalSecs: number) => {
      const entry: LogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: getSimTimestamp(totalSecs),
        scene: currentScene,
        message,
        type,
      };
      setLogs((prev) => [...prev, entry]);
      soundFX.playUiClick();
    },
    [currentScene]
  );

  // Jump to specific scene
  const jumpToScene = useCallback(
    (sceneId: SceneId) => {
      soundFX.playUiClick();
      setCurrentScene(sceneId);
      setSceneElapsedTime(0);

      const sceneDef = SCENE_DEFINITIONS.find((s) => s.id === sceneId);
      const newTotal = sceneDef ? sceneDef.startOffsetSeconds : 0;
      setTotalElapsedTime(newTotal);

      // Reset scene-specific variables
      setIsConfirmed(false);
      setCountdownValue(null);
      setIsResponseDeployed(false);

      if (sceneId === 0) {
        setIsPlaying(false);
        setTelemetry({
          threatLevel: 'NOMINAL',
          distanceMeters: 48.0,
          species: 'UNKNOWN',
          rangerHeartRate: 72,
          animalHeartRate: 70,
          deviceBattery: 96,
          systemStatus: 'STANDBY',
          moduleStatus: 'CALIBRATING',
          animalStatus: 'ABSENT',
          rangerStatus: 'PATROLLING',
        });
        soundFX.startAtmosphere('calm');
      } else if (sceneId === 1) {
        setCameraView('POV');
        setTelemetry((prev) => ({
          ...prev,
          threatLevel: 'NOMINAL',
          distanceMeters: 46.5,
          species: 'BENGAL TIGER',
          animalStatus: 'DETECTED',
          rangerStatus: 'PATROLLING',
          rangerHeartRate: 76,
        }));
        soundFX.startAtmosphere('calm');
      } else if (sceneId === 2) {
        setCameraView('TACTICAL');
        setTelemetry((prev) => ({
          ...prev,
          threatLevel: 'HIGH',
          species: 'BENGAL TIGER',
          animalStatus: 'APPROACHING',
          rangerStatus: 'BACKING_OFF',
          rangerHeartRate: 104,
        }));
        soundFX.startAtmosphere('tension');
      } else if (sceneId === 3) {
        setCameraView('WRIST');
        setTelemetry((prev) => ({
          ...prev,
          threatLevel: 'HIGH',
          rangerStatus: 'ARMED',
          systemStatus: 'ACTIVE',
          moduleStatus: 'SIMULATION TRANQUILIZER',
          rangerHeartRate: 112,
        }));
        soundFX.playDeviceArm();
        soundFX.startAtmosphere('tension');
      } else if (sceneId === 4) {
        setCameraView('POV');
        setTelemetry((prev) => ({
          ...prev,
          threatLevel: 'CRITICAL',
          animalStatus: 'LOCKED',
          rangerStatus: 'ARMED',
          rangerHeartRate: 124,
        }));
        soundFX.playWarningBeep(true);
        soundFX.startAtmosphere('critical');
      } else if (sceneId === 5) {
        setCameraView('TACTICAL');
        setIsResponseDeployed(true);
        setTelemetry((prev) => ({
          ...prev,
          threatLevel: 'HIGH',
          animalStatus: 'CALMING',
          rangerStatus: 'DEPLOYING',
          rangerHeartRate: 105,
        }));
        soundFX.playResponseDeploy();
        soundFX.startAtmosphere('tension');
      } else if (sceneId === 6) {
        setCameraView('POV');
        setTelemetry((prev) => ({
          ...prev,
          threatLevel: 'RESOLVED',
          animalStatus: 'SAFE_DISPERSED',
          rangerStatus: 'SAFE',
          rangerHeartRate: 78,
          distanceMeters: 38.0,
        }));
        soundFX.playResolutionChord();
        soundFX.startAtmosphere('resolved');
      } else if (sceneId === 7) {
        setCameraView('SATELLITE');
        setTelemetry((prev) => ({
          ...prev,
          threatLevel: 'RESOLVED',
          rangerStatus: 'SAFE',
          rangerHeartRate: 72,
        }));
        soundFX.playMissionComplete();
      }
    },
    []
  );

  // Start Simulation or Auto Demo
  const handleStartSimulation = (autoDemo: boolean) => {
    setIsAutoDemo(autoDemo);
    setIsPlaying(true);
    triggeredEventsRef.current.clear();
    setLogs([]);
    addLog('Simulation initialized', 'info', 0);
    jumpToScene(1);
  };

  // Restart Mission
  const handleRestart = () => {
    triggeredEventsRef.current.clear();
    jumpToScene(0);
  };

  // Confirm response button clicked in Scene 4
  const handleConfirmResponse = useCallback(() => {
    if (isConfirmed) return;
    setIsConfirmed(true);
    addLog('Response confirmed', 'critical', totalElapsedTime);
    soundFX.playCountdownTick(3);
    setCountdownValue(3);

    setTimeout(() => {
      setCountdownValue(2);
      soundFX.playCountdownTick(2);
    }, 900);

    setTimeout(() => {
      setCountdownValue(1);
      soundFX.playCountdownTick(1);
    }, 1800);

    setTimeout(() => {
      setCountdownValue(0);
      soundFX.playCountdownTick(0);
      // Auto advance to scene 5
      jumpToScene(5);
    }, 2700);
  }, [isConfirmed, totalElapsedTime, addLog, jumpToScene]);

  // Main Simulation Loop
  useEffect(() => {
    if (!isPlaying || currentScene === 0) {
      lastTimeRef.current = performance.now();
      return;
    }

    const currentSceneDef = SCENE_DEFINITIONS.find((s) => s.id === currentScene);
    if (!currentSceneDef) return;

    const tick = (now: number) => {
      const deltaSec = ((now - lastTimeRef.current) / 1000) * playbackSpeed;
      lastTimeRef.current = now;

      setSceneElapsedTime((prevSceneTime) => {
        const nextSceneTime = prevSceneTime + deltaSec;
        const currentTotal = currentSceneDef.startOffsetSeconds + nextSceneTime;
        setTotalElapsedTime(currentTotal);

        // Scene 1: Event triggers
        if (currentScene === 1) {
          if (nextSceneTime >= 8 && !triggeredEventsRef.current.has('wildlife_detected')) {
            triggeredEventsRef.current.add('wildlife_detected');
            addLog('Wildlife detected', 'warning', currentTotal);
            soundFX.playWarningBeep(false);
            setTelemetry((prev) => ({
              ...prev,
              threatLevel: 'ELEVATED',
              species: 'BENGAL TIGER',
              distanceMeters: 42.0,
              animalStatus: 'DETECTED',
              rangerHeartRate: 88,
            }));
          }
          if (nextSceneTime > 8) {
            // gradual distance decrease
            const dist = Math.max(38, 46.5 - (nextSceneTime - 8) * 0.85);
            setTelemetry((prev) => ({ ...prev, distanceMeters: dist }));
          }
        }

        // Scene 2: Threat Approach
        if (currentScene === 2) {
          if (nextSceneTime >= 2 && !triggeredEventsRef.current.has('threat_approaching')) {
            triggeredEventsRef.current.add('threat_approaching');
            addLog('Threat approaching', 'warning', currentTotal);
            soundFX.playWarningBeep(false);
            setTelemetry((prev) => ({
              ...prev,
              threatLevel: 'HIGH',
              animalStatus: 'APPROACHING',
              rangerStatus: 'BACKING_OFF',
            }));
          }
          // Distance decreasing: 38m -> 16m
          const distProgress = Math.min(1, nextSceneTime / currentSceneDef.durationSeconds);
          const currentDist = 38 - distProgress * 22; // down to 16m
          const rangerBpm = Math.floor(92 + distProgress * 24);
          setTelemetry((prev) => ({
            ...prev,
            distanceMeters: Math.max(16, currentDist),
            rangerHeartRate: rangerBpm,
          }));
        }

        // Scene 3: Wrist Device Activation
        if (currentScene === 3) {
          if (nextSceneTime >= 2 && !triggeredEventsRef.current.has('rangerx_activated')) {
            triggeredEventsRef.current.add('rangerx_activated');
            addLog('RANGER-X activated', 'info', currentTotal);
          }
        }

        // Scene 4: Final Approach & Confirmation
        if (currentScene === 4) {
          const distProgress = Math.min(1, nextSceneTime / currentSceneDef.durationSeconds);
          const currentDist = Math.max(9.2, 16 - distProgress * 6.8);
          setTelemetry((prev) => ({
            ...prev,
            distanceMeters: currentDist,
            threatLevel: 'CRITICAL',
            rangerHeartRate: 124,
          }));

          // In Auto Demo mode, automatically confirm after 3.5 seconds if not yet confirmed
          if (isAutoDemo && nextSceneTime >= 3.5 && !isConfirmed && countdownValue === null) {
            handleConfirmResponse();
          }
        }

        // Scene 5: Response Deployed
        if (currentScene === 5) {
          if (nextSceneTime >= 1 && !triggeredEventsRef.current.has('response_deployed')) {
            triggeredEventsRef.current.add('response_deployed');
            addLog('Simulated response deployed', 'info', currentTotal);
          }
          // Threat reducing: CRITICAL -> HIGH -> MEDIUM -> LOW
          const calmingProgress = Math.min(1, nextSceneTime / currentSceneDef.durationSeconds);
          const currentThreat: ThreatLevel =
            calmingProgress < 0.3 ? 'HIGH' : calmingProgress < 0.7 ? 'ELEVATED' : 'NOMINAL';
          setTelemetry((prev) => ({
            ...prev,
            threatLevel: currentThreat,
            animalStatus: 'CALMING',
            rangerHeartRate: Math.floor(118 - calmingProgress * 32),
          }));
        }

        // Scene 6: Resolution
        if (currentScene === 6) {
          if (nextSceneTime >= 1 && !triggeredEventsRef.current.has('threat_resolved')) {
            triggeredEventsRef.current.add('threat_resolved');
            addLog('Threat resolved', 'success', currentTotal);
            setTelemetry((prev) => ({
              ...prev,
              threatLevel: 'RESOLVED',
              animalStatus: 'SAFE_DISPERSED',
              rangerStatus: 'SAFE',
            }));
          }
          // Distance increases as animal safely retreats
          const retreatProgress = Math.min(1, nextSceneTime / currentSceneDef.durationSeconds);
          setTelemetry((prev) => ({
            ...prev,
            distanceMeters: 18 + retreatProgress * 32, // up to 50m away
            rangerHeartRate: Math.floor(86 - retreatProgress * 12),
          }));
        }

        // Scene 7: Mission Report
        if (currentScene === 7) {
          if (nextSceneTime >= 1 && !triggeredEventsRef.current.has('mission_completed')) {
            triggeredEventsRef.current.add('mission_completed');
            addLog('Mission completed', 'success', currentTotal);
          }
        }

        // Advance to next scene when duration reached (except Scene 4 which waits for countdown completion)
        if (
          currentSceneDef.durationSeconds > 0 &&
          nextSceneTime >= currentSceneDef.durationSeconds &&
          currentScene !== 4
        ) {
          if (currentScene < 7) {
            jumpToScene((currentScene + 1) as SceneId);
            return 0;
          } else {
            // End of mission
            setIsPlaying(false);
            return currentSceneDef.durationSeconds;
          }
        }

        return nextSceneTime;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    isPlaying,
    currentScene,
    playbackSpeed,
    isAutoDemo,
    isConfirmed,
    countdownValue,
    handleConfirmResponse,
    jumpToScene,
    addLog,
  ]);

  // Audio mute sync
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundFX.setMuted(nextMute);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      appContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Cycle speed
  const cyclePlaybackSpeed = () => {
    soundFX.playUiClick();
    if (playbackSpeed === 1) setPlaybackSpeed(1.5);
    else if (playbackSpeed === 1.5) setPlaybackSpeed(2);
    else setPlaybackSpeed(1);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if focus is in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleRestart();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        setIsCinematic((c) => !c);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentScene < 7) jumpToScene((currentScene + 1) as SceneId);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentScene > 1) jumpToScene((currentScene - 1) as SceneId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScene, jumpToScene, isMuted]);

  // Calculate progress within current scene
  const currentSceneDef = SCENE_DEFINITIONS.find((s) => s.id === currentScene);
  const currentSceneProgress = currentSceneDef && currentSceneDef.durationSeconds > 0
    ? Math.min(1, sceneElapsedTime / currentSceneDef.durationSeconds)
    : 0;

  return (
    <div
      ref={appContainerRef}
      className="relative min-h-screen bg-black text-slate-100 flex flex-col justify-between overflow-x-hidden font-tactical"
    >
      {/* Top Persistent HUD */}
      {!isCinematic && (
        <TopHud
          currentSceneId={currentScene}
          threatLevel={telemetry.threatLevel}
          isCinematic={isCinematic}
          onToggleCinematic={() => setIsCinematic((c) => !c)}
        />
      )}

      {/* Flashing Emergency Alert Banner */}
      <EmergencyAlertBanner
        threatLevel={telemetry.threatLevel}
        distance={telemetry.distanceMeters}
      />

      {/* Main Simulation Viewport Container */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 w-full max-w-7xl mx-auto">
        {/* Left Side Event Log Panel */}
        {!isCinematic && currentScene > 0 && (
          <EventLogPanel
            logs={logs}
            isCollapsed={isLogCollapsed}
            onToggleCollapse={() => setIsLogCollapsed((c) => !c)}
          />
        )}

        {/* Right Side Tactical HUD Panel */}
        {!isCinematic && currentScene > 0 && currentScene < 7 && (
          <TacticalHudPanel
            telemetry={telemetry}
            isCollapsed={isTacticalCollapsed}
            onToggleCollapse={() => setIsTacticalCollapsed((c) => !c)}
          />
        )}

        {/* Central 16:9 Cinematic Viewport */}
        <div className="w-full flex items-center justify-center">
          <CinematicViewport
            currentScene={currentScene}
            sceneProgress={currentSceneProgress}
            telemetry={telemetry}
            cameraView={cameraView}
            onSetCameraView={setCameraView}
            onStartSimulation={handleStartSimulation}
            onConfirmResponse={handleConfirmResponse}
            isConfirmed={isConfirmed}
            countdownValue={countdownValue}
            isResponseDeployed={isResponseDeployed}
            onRestart={handleRestart}
            isCinematic={isCinematic}
          />
        </div>
      </main>

      {/* Bottom Cinematic Control Deck */}
      <footer className="p-3 sm:p-4 z-20">
        <ControlDeck
          currentSceneId={currentScene}
          isPlaying={isPlaying}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          isCinematic={isCinematic}
          isAutoDemo={isAutoDemo}
          playbackSpeed={playbackSpeed}
          totalElapsedSeconds={totalElapsedTime}
          onTogglePlay={() => {
            soundFX.playUiClick();
            if (currentScene === 0) {
              handleStartSimulation(false);
            } else {
              setIsPlaying((p) => !p);
            }
          }}
          onRestart={handleRestart}
          onNextScene={() => {
            if (currentScene < 7) jumpToScene((currentScene + 1) as SceneId);
          }}
          onPrevScene={() => {
            if (currentScene > 1) jumpToScene((currentScene - 1) as SceneId);
          }}
          onJumpToScene={jumpToScene}
          onToggleMute={toggleMute}
          onToggleFullscreen={toggleFullscreen}
          onToggleCinematic={() => setIsCinematic((c) => !c)}
          onToggleAutoDemo={() => {
            if (currentScene === 0 || !isAutoDemo) {
              handleStartSimulation(true);
            } else {
              setIsAutoDemo(false);
            }
          }}
          onCyclePlaybackSpeed={cyclePlaybackSpeed}
        />

        <div className="text-center text-[11px] text-slate-500 font-mono mt-2 select-none">
          RANGER-X WILDLIFE EMERGENCY RESPONSE SIMULATION • ACADEMIC PROTOTYPE • SPACE: PLAY/PAUSE • R: RESTART • C: CINEMATIC • M: MUTE
        </div>
      </footer>
    </div>
  );
}
