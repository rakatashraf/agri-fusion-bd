export type Severity = 'good' | 'watch' | 'urgent';

export const field = {
  id: 'BD-RJS-001',
  name: 'পূর্ব মাঠ • Paba, Rajshahi',
  crop: 'Aman rice',
  areaHa: 2.4,
  stage: 'Tillering',
  boundary: { north: 24.4058, south: 24.4012, east: 88.6121, west: 88.6064 },
  updated: '22 Sep 2026, 10:40 AM'
};

export const farmerKpis = [
  { label: 'আজ সেচের প্রয়োজন', value: 'না', note: 'আগামী 48 ঘণ্টায় বৃষ্টি সম্ভাবনা', tone: 'good' },
  { label: 'সম্ভাব্য পানি সাশ্রয়', value: '1,850 L', note: 'আজ সেচ বন্ধ রাখলে', tone: 'good' },
  { label: 'ফসল স্বাস্থ্য', value: '78/100', note: 'পশ্চিম অংশে চাপ দেখা যাচ্ছে', tone: 'watch' },
  { label: 'এই সপ্তাহের ঝুঁকি', value: '2টি', note: 'ভারী বৃষ্টি + বাদামী দাগ রোগ', tone: 'urgent' }
];

export const recommendations = [
  {
    priority: 1,
    title: 'আজ সেচ বন্ধ রাখুন',
    why: 'মাটির আর্দ্রতা 63% এবং 36 ঘণ্টার মধ্যে 18–28 mm বৃষ্টির সম্ভাবনা।',
    saving: 'আনুমানিক ৳420 এবং 1,850 L পানি সাশ্রয়',
    action: 'পরবর্তী মাপ: কাল সকাল 7টা',
    severity: 'good' as Severity
  },
  {
    priority: 2,
    title: 'দক্ষিণ-পশ্চিম জোনে পোকা পরীক্ষা করুন',
    why: 'রোভার পাতার ছবি + আর্দ্রতা + স্যাটেলাইট NDVI মিলিয়ে ঝুঁকি বেড়েছে।',
    saving: 'পুরো জমিতে স্প্রে না করে শুধু 0.35 ha লক্ষ্য করুন',
    action: 'স্প্রে করার আগে 20টি গাছ হাতে পরীক্ষা করুন',
    severity: 'watch' as Severity
  },
  {
    priority: 3,
    title: 'আইলে মুগ/ধৈঞ্চা ইন্টারক্রপ বিবেচনা করুন',
    why: 'খালি আইল, নাইট্রোজেন ঘাটতির প্রবণতা এবং পর্যাপ্ত আলো পাওয়া যাচ্ছে।',
    saving: 'মাটির জৈব পদার্থ বাড়াতে এবং অতিরিক্ত আয় তৈরিতে সহায়ক',
    action: 'স্থানীয় কৃষি কর্মকর্তার সাথে জাত ও সময় মিলিয়ে নিন',
    severity: 'good' as Severity
  }
];

export const weatherAlerts = [
  { day: 'বুধ', rain: '6 mm', risk: 'কম', note: 'সাধারণ কাজ করা যাবে' },
  { day: 'বৃহস্পতি', rain: '22 mm', risk: 'উচ্চ', note: 'ড্রেন পরিষ্কার রাখুন' },
  { day: 'শুক্র', rain: '31 mm', risk: 'উচ্চ', note: 'সার/কীটনাশক প্রয়োগ এড়িয়ে চলুন' },
  { day: 'শনি', rain: '8 mm', risk: 'মাঝারি', note: 'জমে থাকা পানি পরীক্ষা করুন' }
];

export const specialistMetrics = [
  { metric: 'NDVI', satellite: '0.71', rover: '0.76 canopy score', fused: '0.73', trend: '+4.3%' },
  { metric: 'Soil moisture', satellite: '58%', rover: '67%', fused: '63%', trend: '+8.1%' },
  { metric: 'Surface temp', satellite: '31.8°C', rover: '30.9°C', fused: '31.3°C', trend: '-1.2°C' },
  { metric: 'Nitrogen proxy', satellite: 'Moderate', rover: 'Low SW zone', fused: 'Watch', trend: 'Declining' },
  { metric: 'Disease pressure', satellite: 'Low', rover: 'Moderate', fused: 'Moderate', trend: 'Rising' }
];

export const zones = [
  { id: 'A', health: 87, moisture: 66, issue: 'Stable', action: 'Maintain current plan' },
  { id: 'B', health: 72, moisture: 61, issue: 'Nutrient variability', action: 'Soil sample + split N application' },
  { id: 'C', health: 54, moisture: 69, issue: 'Disease/pest signal', action: 'Ground scouting within 24h' }
];

export const roverMission = {
  spacingM: 12,
  estimatedDistanceKm: 3.8,
  samplePoints: 46,
  sensors: ['Soil moisture', 'EC', 'pH', 'Air/soil temp', 'Leaf RGB image', 'GPS'],
  strategy: 'Serpentine coverage inside GPS boundary with extra samples in low-NDVI zones'
};
