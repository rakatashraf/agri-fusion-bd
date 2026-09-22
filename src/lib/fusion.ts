export type Observation = { value: number; confidence: number; ageMinutes: number };

function freshnessWeight(ageMinutes: number, halfLifeMinutes = 720) {
  return Math.exp(-Math.LN2 * ageMinutes / halfLifeMinutes);
}

export function fuseObservations(satellite: Observation, rover: Observation) {
  const sw = satellite.confidence * freshnessWeight(satellite.ageMinutes, 1440);
  const rw = rover.confidence * freshnessWeight(rover.ageMinutes, 360);
  const total = sw + rw || 1;
  return {
    value: (satellite.value * sw + rover.value * rw) / total,
    satelliteWeight: sw / total,
    roverWeight: rw / total,
    confidence: Math.min(1, (sw + rw) / 1.6)
  };
}

export function irrigationDecision(params: {
  fusedSoilMoisture: number;
  cropThreshold: number;
  rainNext48hMm: number;
  evapotranspirationMm: number;
}) {
  const moistureGap = Math.max(0, params.cropThreshold - params.fusedSoilMoisture);
  const effectiveRain = params.rainNext48hMm * 0.75;
  const demand = Math.max(0, moistureGap * 0.45 + params.evapotranspirationMm - effectiveRain);
  return {
    irrigationNeeded: demand > 3,
    recommendedMm: Math.round(demand * 10) / 10,
    reason: demand > 3
      ? 'Root-zone moisture deficit remains after accounting for forecast rainfall.'
      : 'Forecast rainfall and current root-zone moisture cover near-term crop demand.'
  };
}
