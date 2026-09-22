import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { RiskLevel } from '$lib/data';

export type FarmerField = {
  id: string;
  farmerId: string;
  areaId: string;
  name: { bn: string; en: string };
  crop: { bn: string; en: string };
  nextCrop: { bn: string; en: string };
  areaHa: number;
  health: number;
  soilMoisture: number;
  ndvi: number;
  risk: RiskLevel;
  savingBdt: number;
  waterSavedL: number;
  updated: string;
  center: [number, number];
  boundary: [number, number][];
  action: { bn: string; en: string };
  source: 'farmer';
};

const STORAGE_KEY = 'agri-user-fields';

export const userFields = writable<FarmerField[]>([]);

function readStored(): FarmerField[] {
  if (!browser) return [];
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function persist(fields: FarmerField[]) {
  if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  userFields.set(fields);
}

export function loadUserFields() {
  userFields.set(readStored());
}

export function polygonCenter(points: [number, number][]): [number, number] {
  if (!points.length) return [23.8103, 90.4125];
  const lat = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const lng = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  return [Number(lat.toFixed(7)), Number(lng.toFixed(7))];
}

export function polygonAreaHa(points: [number, number][]) {
  if (points.length < 3) return 0;

  const centerLat = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const metersPerLng = 111320 * Math.cos(centerLat * Math.PI / 180);
  const xy = points.map(([lat, lng]) => [lng * metersPerLng, lat * 111320]);

  let area = 0;
  for (let i = 0; i < xy.length; i++) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[(i + 1) % xy.length];
    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area) / 2 / 10000;
}

export function createFarmerField(input: {
  farmerId: string;
  areaId: string;
  name: string;
  crop: string;
  nextCrop?: string;
  areaHa?: number;
  boundary: [number, number][];
}) {
  if (input.boundary.length < 3) {
    throw new Error('A field boundary requires at least three map points.');
  }

  const now = new Date();
  const measuredArea = polygonAreaHa(input.boundary);
  const center = polygonCenter(input.boundary);

  const newField: FarmerField = {
    id: `field-local-${Date.now()}`,
    farmerId: input.farmerId,
    areaId: input.areaId,
    name: { bn: input.name, en: input.name },
    crop: { bn: input.crop, en: input.crop },
    nextCrop: { bn: input.nextCrop || 'নির্ধারিত নয়', en: input.nextCrop || 'Not selected' },
    areaHa: Number((measuredArea || input.areaHa || 0).toFixed(2)),
    health: 0,
    soilMoisture: 0,
    ndvi: 0,
    risk: 'low',
    savingBdt: 0,
    waterSavedL: 0,
    updated: now.toLocaleString(),
    center,
    boundary: input.boundary,
    action: {
      bn: 'নতুন জমি যোগ হয়েছে। স্যাটেলাইট ও রোভার ডেটা যুক্ত হলে ব্যক্তিগত পরামর্শ এখানে দেখা যাবে।',
      en: 'Field added. Personalized recommendations will appear after satellite and rover observations are connected.'
    },
    source: 'farmer'
  };

  const all = readStored();
  persist([...all, newField]);
  return newField;
}

export function removeFarmerField(fieldId: string, farmerId: string) {
  persist(readStored().filter((field) => !(field.id === fieldId && field.farmerId === farmerId)));
}

export function fieldsOwnedBy(farmerId: string, staticFields: any[] = []) {
  return [
    ...staticFields.filter((field) => field.farmerId === farmerId),
    ...readStored().filter((field) => field.farmerId === farmerId)
  ];
}
