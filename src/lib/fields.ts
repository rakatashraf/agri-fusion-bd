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

function squareBoundary(lat: number, lng: number, areaHa: number): [number, number][] {
  const sideM = Math.sqrt(Math.max(areaHa, 0.01) * 10000);
  const latDelta = (sideM / 2) / 111320;
  const lngScale = Math.max(Math.cos(lat * Math.PI / 180), 0.2);
  const lngDelta = (sideM / 2) / (111320 * lngScale);

  return [
    [lat + latDelta, lng - lngDelta],
    [lat + latDelta, lng + lngDelta],
    [lat - latDelta, lng + lngDelta],
    [lat - latDelta, lng - lngDelta]
  ];
}

export function createFarmerField(input: {
  farmerId: string;
  areaId: string;
  name: string;
  crop: string;
  nextCrop?: string;
  areaHa: number;
  latitude: number;
  longitude: number;
}) {
  const now = new Date();
  const newField: FarmerField = {
    id: `field-local-${Date.now()}`,
    farmerId: input.farmerId,
    areaId: input.areaId,
    name: { bn: input.name, en: input.name },
    crop: { bn: input.crop, en: input.crop },
    nextCrop: { bn: input.nextCrop || 'নির্ধারিত নয়', en: input.nextCrop || 'Not selected' },
    areaHa: input.areaHa,
    health: 0,
    soilMoisture: 0,
    ndvi: 0,
    risk: 'low',
    savingBdt: 0,
    waterSavedL: 0,
    updated: now.toLocaleString(),
    center: [input.latitude, input.longitude],
    boundary: squareBoundary(input.latitude, input.longitude, input.areaHa),
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
