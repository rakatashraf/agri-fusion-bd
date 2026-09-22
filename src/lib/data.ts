export type LocalText = { bn: string; en: string };
export type RiskLevel = 'low' | 'medium' | 'high';

export const areas = [
  { id: 'paba', name: { bn: 'পবা, রাজশাহী', en: 'Paba, Rajshahi' }, center: [24.405, 88.61] },
  { id: 'godagari', name: { bn: 'গোদাগাড়ী, রাজশাহী', en: 'Godagari, Rajshahi' }, center: [24.47, 88.33] },
  { id: 'bagha', name: { bn: 'বাঘা, রাজশাহী', en: 'Bagha, Rajshahi' }, center: [24.2, 88.84] }
];

export const farmers = [
  { id:'farmer-001', name:{bn:'আব্দুল করিম',en:'Abdul Karim'}, phone:'01700000001', areaId:'paba', fieldIds:['field-001'] },
  { id:'farmer-002', name:{bn:'নাসিমা বেগম',en:'Nasima Begum'}, phone:'01700000002', areaId:'paba', fieldIds:['field-002'] },
  { id:'farmer-003', name:{bn:'রহিম উদ্দিন',en:'Rahim Uddin'}, phone:'01700000003', areaId:'paba', fieldIds:['field-003'] },
  { id:'farmer-004', name:{bn:'মোছা. হালিমা',en:'Halima Khatun'}, phone:'01700000004', areaId:'paba', fieldIds:['field-005'] },
  { id:'farmer-005', name:{bn:'সাইফুল ইসলাম',en:'Saiful Islam'}, phone:'01700000005', areaId:'godagari', fieldIds:['field-004'] }
];

export const fields = [
  {
    id:'field-001', farmerId:'farmer-001', areaId:'paba', name:{bn:'পূর্ব মাঠ',en:'East Field'},
    crop:{bn:'আমন ধান',en:'Aman rice'}, nextCrop:{bn:'মুগ ডাল',en:'Mung bean'}, areaHa:2.4, health:78, soilMoisture:63, ndvi:0.73,
    risk:'medium' as RiskLevel, savingBdt:1420, waterSavedL:1850, updated:'22 Sep 2026 • 12:55',
    center:[24.4035,88.6092],
    boundary:[[24.4058,88.6064],[24.4058,88.6121],[24.4012,88.6121],[24.4012,88.6064]],
    action:{bn:'আজ সেচ বন্ধ রাখুন। দক্ষিণ-পশ্চিম অংশে রোগ-পোকা পরীক্ষা করুন।',en:'Skip irrigation today. Scout the southwest zone for pest or disease symptoms.'}
  },
  {
    id:'field-002', farmerId:'farmer-002', areaId:'paba', name:{bn:'বাড়ির পাশের জমি',en:'Homestead Field'},
    crop:{bn:'পাট',en:'Jute'}, nextCrop:{bn:'মসুর',en:'Lentil'}, areaHa:1.7, health:84, soilMoisture:57, ndvi:0.78,
    risk:'low' as RiskLevel, savingBdt:760, waterSavedL:930, updated:'22 Sep 2026 • 12:48',
    center:[24.411,88.616],
    boundary:[[24.4125,88.6137],[24.4124,88.6180],[24.4091,88.6181],[24.4092,88.6138]],
    action:{bn:'জমি স্থিতিশীল। 48 ঘণ্টার বৃষ্টির আগে সার প্রয়োগ করবেন না।',en:'Field is stable. Avoid fertilizer application before expected rain in the next 48 hours.'}
  },
  {
    id:'field-003', farmerId:'farmer-003', areaId:'paba', name:{bn:'নদীর দিকের মাঠ',en:'Riverside Field'},
    crop:{bn:'সবজি',en:'Vegetables'}, nextCrop:{bn:'ধান',en:'Rice'}, areaHa:1.2, health:56, soilMoisture:72, ndvi:0.51,
    risk:'high' as RiskLevel, savingBdt:980, waterSavedL:620, updated:'22 Sep 2026 • 12:42',
    center:[24.398,88.601],
    boundary:[[24.3997,88.5988],[24.3996,88.6035],[24.3964,88.6033],[24.3965,88.5989]],
    action:{bn:'পানি জমার ঝুঁকি বেশি। ড্রেন পরিষ্কার করুন এবং পাতার দাগ পরীক্ষা করুন।',en:'Waterlogging risk is high. Clear drainage and inspect leaves for disease symptoms.'}
  },
  {
    id:'field-004', farmerId:'farmer-005', areaId:'godagari', name:{bn:'বরেন্দ্র মাঠ',en:'Barind Field'},
    crop:{bn:'গম',en:'Wheat'}, nextCrop:{bn:'তিল',en:'Sesame'}, areaHa:3.1, health:69, soilMoisture:39, ndvi:0.62,
    risk:'medium' as RiskLevel, savingBdt:1680, waterSavedL:2200, updated:'22 Sep 2026 • 12:31',
    center:[24.469,88.332],
    boundary:[[24.4715,88.328],[24.4714,88.336],[24.4665,88.336],[24.4666,88.328]],
    action:{bn:'মাটির আর্দ্রতা কম। আবহাওয়া দেখে ভাগ করে সেচ দিন।',en:'Soil moisture is low. Use split irrigation after checking near-term rainfall.'}
  },
  {
    id:'field-005', farmerId:'farmer-004', areaId:'paba', name:{bn:'দক্ষিণ মাঠ',en:'South Field'},
    crop:{bn:'ধান',en:'Rice'}, nextCrop:{bn:'সরিষা',en:'Mustard'}, areaHa:2.0, health:74, soilMoisture:61, ndvi:0.67,
    risk:'medium' as RiskLevel, savingBdt:1110, waterSavedL:1410, updated:'22 Sep 2026 • 12:26',
    center:[24.392,88.617],
    boundary:[[24.394,88.614],[24.394,88.620],[24.390,88.620],[24.390,88.614]],
    action:{bn:'পূর্ব দিকের কম NDVI অংশে রোভার নমুনা নিন।',en:'Collect extra rover samples in the low-NDVI eastern section.'}
  }
];

export const rotationPlans = [
  {
    id:'rice-mung-mustard',
    sequence:{bn:'ধান → মুগ → সরিষা',en:'Rice → Mung bean → Mustard'},
    fit:91, water:'-18%', fertilizer:'-12%',
    reason:{bn:'ডালজাতীয় ফসল যোগ হওয়ায় মাটির নাইট্রোজেন চক্রে সহায়তা করে এবং একই ফসলের রোগ-পোকার চাপ কমায়।',en:'Adds a legume to support nitrogen cycling and reduces repeated crop pest pressure.'}
  },
  {
    id:'rice-lentil-jute',
    sequence:{bn:'ধান → মসুর → পাট',en:'Rice → Lentil → Jute'},
    fit:84, water:'-11%', fertilizer:'-9%',
    reason:{bn:'মৌসুমি পানির চাহিদা ভাগ করে এবং একই শিকড়ের গভীরতার ফসল বারবার না রাখতে সহায়তা করে।',en:'Spreads seasonal water demand and avoids repeating crops with similar rooting patterns.'}
  },
  {
    id:'veg-mung-rice',
    sequence:{bn:'সবজি → মুগ → ধান',en:'Vegetable → Mung bean → Rice'},
    fit:78, water:'-8%', fertilizer:'-14%',
    reason:{bn:'স্বল্পমেয়াদি ডাল ফসল পরবর্তী মৌসুমের আগে মাটির পুনরুদ্ধারে সহায়ক হতে পারে।',en:'A short-duration legume can help soil recovery before the following rice season.'}
  }
];

export const alerts = [
  { severity:'high' as RiskLevel, title:{bn:'ভারী বৃষ্টি',en:'Heavy rainfall'}, detail:{bn:'পরবর্তী 48 ঘণ্টায় 25–35 mm বৃষ্টি হতে পারে। নিচু জমির ড্রেন পরীক্ষা করুন।',en:'25–35 mm rainfall is possible within 48 hours. Check drainage in low fields.'} },
  { severity:'medium' as RiskLevel, title:{bn:'রোগের অনুকূল আর্দ্রতা',en:'Disease-favorable humidity'}, detail:{bn:'পাতা দীর্ঘ সময় ভেজা থাকলে রোগ ঝুঁকি বাড়তে পারে। স্প্রে করার আগে মাঠ পর্যবেক্ষণ করুন।',en:'Long leaf-wetness periods may raise disease risk. Scout before spraying.'} }
];

export function fieldsForArea(areaId: string) {
  return fields.filter((field) => field.areaId === areaId);
}

export function farmersForArea(areaId: string) {
  return farmers.filter((farmer) => farmer.areaId === areaId);
}

export function areaSummary(areaId: string) {
  const scoped = fieldsForArea(areaId);
  return {
    fields: scoped.length,
    hectares: Number(scoped.reduce((sum, field) => sum + field.areaHa, 0).toFixed(1)),
    avgHealth: scoped.length ? Math.round(scoped.reduce((sum, field) => sum + field.health, 0) / scoped.length) : 0,
    highRisk: scoped.filter((field) => field.risk === 'high').length,
    savings: scoped.reduce((sum, field) => sum + field.savingBdt, 0),
    waterSaved: scoped.reduce((sum, field) => sum + field.waterSavedL, 0)
  };
}
