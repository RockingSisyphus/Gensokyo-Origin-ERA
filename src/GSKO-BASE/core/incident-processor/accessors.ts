import { Cache, IncidentCache } from '../../schema/cache';
import { IncidentConfig } from '../../schema/config';
import { Incidents } from '../../schema/incident';
import { Runtime } from '../../schema/runtime';
import { Stat } from '../../schema/stat';
import { DEFAULT_INCIDENT_CONFIG } from './constants';

// Stat Accessors
export function getIncidentConfig(stat: Stat): IncidentConfig {
  const userConfig = stat.config?.incident ?? {};
  return { ...DEFAULT_INCIDENT_CONFIG, ...userConfig };
}

export function getIncidents(stat: Stat): Incidents {
  return stat.incidents ?? {};
}

export function setIncidents(stat: Stat, incidents: Incidents) {
  stat.incidents = incidents;
}

export function getTimeProgress(stat: Stat): number {
  return stat.世界?.timeProgress ?? 0;
}

// Runtime Accessors
export function getLegalLocations(runtime: Runtime): string[] {
  return runtime.area?.legal_locations?.map(location => location.name) ?? ['博丽神社'];
}

// Cache Accessors
export function getIncidentCache(cache: Cache): IncidentCache {
  return cache.incident ?? { incidentCooldownAnchor: null };
}

export function setIncidentCache(cache: Cache, incidentCache: IncidentCache) {
  cache.incident = incidentCache;
}
