import { SceneDefinition } from '../types/simulation';

export const SCENE_DEFINITIONS: SceneDefinition[] = [
  {
    id: 0,
    name: 'MISSION BRIEFING',
    subtitle: 'STANDBY & INITIALIZATION',
    durationSeconds: 0, // Standby until user clicks START or AUTO DEMO
    startOffsetSeconds: 0,
    description: 'System standby in Forest Sector 07. Pre-flight telemetry and unit status verification.'
  },
  {
    id: 1,
    name: 'FOREST PATROL',
    subtitle: 'SECTOR RECON & INITIAL DETECTION',
    durationSeconds: 18,
    startOffsetSeconds: 0,
    description: 'Ranger Unit navigating dense canopy trail. Ambient acoustic sensors register wildlife anomaly at 48 meters.'
  },
  {
    id: 2,
    name: 'THREAT APPROACH',
    subtitle: 'PROXIMITY RADAR TRACKING',
    durationSeconds: 18,
    startOffsetSeconds: 18,
    description: 'Bengal Tiger approaches within active safety corridor (38m down to 18m). Ranger performs tactical backward clearance.'
  },
  {
    id: 3,
    name: 'RANGER-X ACTIVATION',
    subtitle: 'WEARABLE SAFETY SYSTEM INITIALIZATION',
    durationSeconds: 20,
    startOffsetSeconds: 36,
    description: 'Wrist unit powers on. Telemetry link verified. Simulation non-operational tranquilizer module calibrated and armed.'
  },
  {
    id: 4,
    name: 'FINAL APPROACH',
    subtitle: 'TARGET LOCK & OPERATOR CONFIRMATION',
    durationSeconds: 18,
    startOffsetSeconds: 56,
    description: 'Critical distance threshold reached. Targeting trajectory calculated. System requests operator manual confirmation.'
  },
  {
    id: 5,
    name: 'RESPONSE DEPLOYED',
    subtitle: 'SIMULATED INTERVENTION SEQUENCE',
    durationSeconds: 14,
    startOffsetSeconds: 74,
    description: 'Stylized non-graphic simulation response deployed. Pulse path active. Animal movement decelerates safely.'
  },
  {
    id: 6,
    name: 'RESOLUTION',
    subtitle: 'WILDLIFE SAFELY DISPERSED',
    durationSeconds: 15,
    startOffsetSeconds: 88,
    description: 'Tiger unharmed and tranquilized safely into calm state, moving away into deep foliage. Sector safety restored.'
  },
  {
    id: 7,
    name: 'MISSION REPORT',
    subtitle: 'DEBRIEFING & TELEMETRY LOG',
    durationSeconds: 12,
    startOffsetSeconds: 103,
    description: 'All 4 mission directives verified: DETECT, ASSESS, RESPOND, PROTECT. Zero animal or ranger injury recorded.'
  }
];

export const TOTAL_SIMULATION_DURATION = 115; // seconds (approx 1m 55s)

export const IMAGE_ASSETS = {
  rangerPatrol: '/src/assets/images/ranger_forest_patrol_1793373820213.jpg',
  tigerEncounter: '/src/assets/images/tiger_encounter_jungle_1793373842167.jpg',
  wristDevice: '/src/assets/images/ranger_x_wrist_gadget_1793373843262.jpg',
  tigerDeparture: '/src/assets/images/tiger_peaceful_departure_1793373842613.jpg',
  tacticalMap: '/src/assets/images/forest_sector_tactical_map_1793373863603.jpg'
};
