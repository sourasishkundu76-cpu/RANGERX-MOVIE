export type SceneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ThreatLevel = 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL' | 'RESOLVED';

export type CameraView = 'POV' | 'TACTICAL' | 'WRIST' | 'SATELLITE';

export interface LogEntry {
  id: string;
  timestamp: string; // e.g. "00:08"
  scene: number;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
}

export interface SimulationTelemetry {
  threatLevel: ThreatLevel;
  distanceMeters: number;
  species: string;
  rangerHeartRate: number;
  animalHeartRate: number;
  deviceBattery: number;
  systemStatus: string;
  moduleStatus: string;
  animalStatus: 'ABSENT' | 'DETECTED' | 'APPROACHING' | 'LOCKED' | 'CALMING' | 'SAFE_DISPERSED';
  rangerStatus: 'PATROLLING' | 'ALERT' | 'BACKING_OFF' | 'ARMED' | 'DEPLOYING' | 'SAFE';
}

export interface SceneDefinition {
  id: SceneId;
  name: string;
  subtitle: string;
  durationSeconds: number; // default duration in real seconds (at 1x)
  startOffsetSeconds: number; // accumulated start offset
  description: string;
}
