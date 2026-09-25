export type NasaLayerId = 'viirs21' | 'viirs20' | 'modis' | 'hls';

export type NasaLayerPreset = {
  id: NasaLayerId;
  label: string;
  layer: string;
  resolution: string;
  latency: string;
  maxNativeZoom: number;
  format: 'image/jpeg' | 'image/png';
  transparent: boolean;
  fastTiles?: boolean;
};

export const NASA_WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi';
export const NASA_WMTS = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best';

export const NASA_LAYERS: Record<NasaLayerId, NasaLayerPreset> = {
  viirs21: {
    id: 'viirs21',
    label: 'NOAA-21 / VIIRS',
    layer: 'VIIRS_NOAA21_CorrectedReflectance_TrueColor',
    resolution: '≈375 m',
    latency: 'Near-real-time',
    maxNativeZoom: 9,
    format: 'image/jpeg',
    transparent: false,
    fastTiles: true
  },
  viirs20: {
    id: 'viirs20',
    label: 'NOAA-20 / VIIRS',
    layer: 'VIIRS_NOAA20_CorrectedReflectance_TrueColor',
    resolution: '≈375 m',
    latency: 'Near-real-time',
    maxNativeZoom: 9,
    format: 'image/jpeg',
    transparent: false,
    fastTiles: true
  },
  modis: {
    id: 'modis',
    label: 'Terra / MODIS',
    layer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    resolution: '≈250 m',
    latency: 'Near-real-time',
    maxNativeZoom: 9,
    format: 'image/jpeg',
    transparent: false,
    fastTiles: true
  },
  hls: {
    id: 'hls',
    label: 'HLS / Sentinel-2',
    layer: 'HLS_S30_Nadir_BRDF_Adjusted_Reflectance',
    resolution: '30 m',
    latency: 'Usually days',
    maxNativeZoom: 12,
    format: 'image/png',
    transparent: true,
    fastTiles: false
  }
};

export function isoDateOffset(daysBack = 1) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysBack);
  return date.toISOString().slice(0, 10);
}

export function clampDateToToday(value: string) {
  const today = new Date().toISOString().slice(0, 10);
  return value > today ? today : value;
}

export function createNasaLayer(L: any, preset: NasaLayerPreset, date: string, opacity = 1) {
  if (preset.fastTiles) {
    const extension = preset.format === 'image/png' ? 'png' : 'jpeg';
    const url =
      NASA_WMTS + '/' + preset.layer + '/default/' + date +
      '/GoogleMapsCompatible_Level' + preset.maxNativeZoom +
      '/{z}/{y}/{x}.' + extension;

    return L.tileLayer(url, {
      tileSize: 256,
      maxZoom: 20,
      maxNativeZoom: preset.maxNativeZoom,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2,
      crossOrigin: true,
      opacity,
      attribution: 'NASA EOSDIS GIBS'
    });
  }

  return L.tileLayer.wms(NASA_WMS, {
    layers: preset.layer,
    styles: '',
    format: preset.format,
    transparent: preset.transparent,
    version: '1.1.1',
    time: date,
    tileSize: 256,
    detectRetina: false,
    maxZoom: 20,
    maxNativeZoom: preset.maxNativeZoom,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 1,
    crossOrigin: true,
    opacity,
    attribution: 'NASA EOSDIS GIBS'
  });
}

export function createNasaLabelsLayer(L: any) {
  return L.tileLayer.wms(NASA_WMS, {
    layers: 'Reference_Labels_15m',
    styles: '',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    tileSize: 256,
    detectRetina: false,
    maxZoom: 20,
    maxNativeZoom: 14,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 1,
    crossOrigin: true,
    opacity: .92,
    attribution: 'NASA GIBS reference labels'
  });
}

export function createNasaBlueMarble(L: any) {
  const url =
    NASA_WMTS +
    '/BlueMarble_ShadedRelief_Bathymetry/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg';

  return L.tileLayer(url, {
    tileSize: 256,
    maxZoom: 20,
    maxNativeZoom: 8,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 1,
    crossOrigin: true,
    attribution: 'NASA EOSDIS GIBS'
  });
}
