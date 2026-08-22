export const PILOT_WILAYAS = [
  {
    id: 14,
    code: '16',
    nameAr: 'الجزائر',
    nameFr: 'Alger',
    role: 'مرساة الطلب والتشغيل',
  },
  {
    id: 8,
    code: '09',
    nameAr: 'البليدة',
    nameFr: 'Blida',
    role: 'عنقود قريب لاختبار التوصيل',
  },
  {
    id: 29,
    code: '31',
    nameAr: 'وهران',
    nameFr: 'Oran',
    role: 'قطب غربي لاختبار التوسع',
  },
] as const

export const PILOT_WILAYA_IDS = PILOT_WILAYAS.map((wilaya) => wilaya.id)

export const PILOT_LAUNCH_PHASE = {
  name: 'pilot-3-wilayas',
  labelAr: 'الإطلاق التجريبي في ثلاث ولايات',
  targetWeeks: 12,
} as const
