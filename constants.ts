import { RegionName, RemoteSupportActor } from './types';
import { INITIAL_ORGANIZATIONS } from './organizations';

export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ev98ifed1h8xc16KcWaOmvaky8I9StuE0-6w7UPG4K4/edit?gid=1212063265#gid=1212063265';
export const DRIVE_URL = 'https://drive.google.com/drive/folders/1ndkLzFOLEOGIZOwh0Ya2cZuGUMpElwn_?usp=sharing';
export const REFERRAL_DRIVE_URL = 'https://drive.google.com/drive/folders/1ndkLzFOLEOGIZOwh0Ya2cZuGUMpElwn_?usp=sharing';

export { INITIAL_ORGANIZATIONS };

export const REGION_CONFIG: Record<RegionName, { center: [number, number], zoom: number, label: string, icon: string, gradient: string, description: string, customImage?: string }> = {
  'All': {
    center: [48.3794, 31.1656],
    zoom: 6,
    label: 'Вся Україна',
    icon: 'Tryzub', 
    gradient: 'from-slate-700 to-slate-900',
    description: 'ЄДИНА КРАЇНА'
  },
  'Odesa': {
    center: [46.4825, 30.7233],
    zoom: 12,
    label: 'Одеська область',
    icon: 'Anchor',
    gradient: 'from-sky-400 to-cyan-500',
    description: 'ПЕРЛИНА БІЛЯ МОРЯ'
  },
  'Mykolaiv': {
    center: [46.9750, 31.9946],
    zoom: 12,
    label: 'Миколаївська область',
    icon: 'Ship',
    gradient: 'from-indigo-400 to-violet-500',
    description: 'МІСТО НА ХВИЛІ'
  },
  'Kherson': {
    center: [46.6354, 32.6169],
    zoom: 12,
    label: 'Херсонська область',
    icon: 'Sun',
    gradient: 'from-lime-400 to-green-500',
    description: 'СОНЯЧНИЙ КРАЙ'
  },
  'Dnipro': {
    center: [48.4647, 35.0462],
    zoom: 11,
    label: 'Дніпропетровська область',
    icon: 'Building2',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'СЕРЦЕ ІНДУСТРІЇ'
  },
  'Zaporizhzhia': {
    center: [47.8388, 35.1396],
    zoom: 11,
    label: 'Запорізька область',
    icon: 'Zap',
    gradient: 'from-orange-500 to-red-500',
    description: 'КОЗАЦЬКА СИЛА'
  },
  'Donetsk': {
    center: [48.7300, 37.5800],
    zoom: 10,
    label: 'Донецька область',
    icon: 'Shield',
    gradient: 'from-slate-600 to-slate-800',
    description: 'КРАЙ МУЖНОСТІ'
  },
  'Kyiv': {
    center: [50.4501, 30.5234],
    zoom: 11,
    label: 'Київська область',
    icon: 'Church',
    gradient: 'from-emerald-500 to-teal-700',
    description: 'СЕРЦЕ УКРАЇНИ'
  },
  'Lviv': {
    center: [49.8397, 24.0297],
    zoom: 12,
    label: 'Львівська область',
    icon: 'Coffee',
    gradient: 'from-amber-700 to-orange-800',
    description: 'МІСТО ЛЕВА'
  },
  'Kharkiv': {
    center: [49.9935, 36.2304],
    zoom: 11,
    label: 'Харківська область',
    icon: 'GraduationCap',
    gradient: 'from-green-500 to-emerald-700',
    description: 'МІСТО МОЛОДІ'
  },
  'Vinnytsia': {
    center: [49.2331, 28.4682],
    zoom: 12,
    label: 'Вінницька область',
    icon: 'Waves',
    gradient: 'from-indigo-500 to-purple-600',
    description: 'МІСТО ФОНТАНІВ'
  },
  'Cherkasy': {
    center: [49.4444, 32.0598],
    zoom: 12,
    label: 'Черкаська область',
    icon: 'Wheat',
    gradient: 'from-amber-500 to-yellow-600',
    description: 'СЕРЦЕ УКРАЇНИ'
  },
  'Volyn': {
    center: [50.7472, 25.3254],
    zoom: 12,
    label: 'Волинська область',
    icon: 'Trees',
    gradient: 'from-emerald-400 to-green-600',
    description: 'КРАЙ ЛІСІВ'
  },
  'Zhytomyr': {
    center: [50.2547, 28.6587],
    zoom: 12,
    label: 'Житомирська область',
    icon: 'Trees',
    gradient: 'from-green-600 to-emerald-800',
    description: 'ПОЛІСЬКИЙ КРАЙ'
  },
  'Rivne': {
    center: [50.6199, 26.2516],
    zoom: 12,
    label: 'Рівненська область',
    icon: 'Gem', 
    gradient: 'from-amber-400 to-yellow-600',
    description: 'БУРШТИНОВИЙ КРАЙ'
  },
  'Sumy': {
    center: [50.9077, 34.7981],
    zoom: 12,
    label: 'Сумська область',
    icon: 'Wheat',
    gradient: 'from-yellow-400 to-lime-600',
    description: 'КОЗАЦЬКА КРАЙ'
  },
  'Ternopil': {
    center: [49.5535, 25.5948],
    zoom: 12,
    label: 'Тернопільська область',
    icon: 'Castle',
    gradient: 'from-teal-400 to-cyan-600',
    description: 'ФАЙНЕ МІСТО'
  },
  'Chernivtsi': {
    center: [48.2921, 25.9352],
    zoom: 12,
    label: 'Чернівецька область',
    icon: 'Landmark',
    gradient: 'from-red-600 to-rose-700',
    description: 'УКРАЇНСЬКИЙ ПАРИЖ'
  },
  'Khmelnytskyi': {
    center: [49.4230, 26.9871],
    zoom: 12,
    label: 'Хмельницька область',
    icon: 'Shield',
    gradient: 'from-indigo-500 to-blue-600',
    description: 'ПРОСТІР МОЖЛИВОСТЕЙ'
  },
  'Chernihiv': {
    center: [51.4982, 31.2893],
    zoom: 12,
    label: 'Чернігівська область',
    icon: 'Church',
    gradient: 'from-slate-500 to-gray-700',
    description: 'МІСТО ЛЕГЕНД'
  },
  'Poltava': {
    center: [49.5883, 34.5514],
    zoom: 11,
    label: 'Полтавська область',
    icon: 'Flower2',
    gradient: 'from-yellow-300 to-orange-500',
    description: 'ДУХОВНА СТОЛИЦЯ'
  },
  'IvanoFrankivsk': {
    center: [48.9226, 24.7111],
    zoom: 12,
    label: 'Івано-Франківська область',
    icon: 'Mountain',
    gradient: 'from-cyan-500 to-blue-700',
    description: 'ВОРОТА КАРПАТ'
  },
  'Kirovohrad': {
    center: [48.5079, 32.2623],
    zoom: 12,
    label: 'Кіровоградська область',
    icon: 'Wheat',
    gradient: 'from-yellow-500 to-amber-600',
    description: 'СЕРЦЕ СТЕПУ'
  }
};

export const REMOTE_SUPPORT_ACTORS: RemoteSupportActor[] = [
  {
    id: 'r1',
    name: 'Урядова гаряча лінія',
    category: 'Державні гарячі лінії',
    phones: ['1545'],
    description: 'Цілодобова урядова гаряча лінія з усіх питань.',
    website: 'https://ukc.gov.ua/'
  },
  {
    id: 'r_dv_1',
    name: 'Гаряча лінія протидії насильству',
    category: 'Соціальний захист',
    phones: ['1547'],
    description: 'Гаряця лінія з питань протидії торгівлі людьми, запобігання та протидії домашньому насильству. Безкоштовно, анонімно.',
    website: 'https://1547.ukc.gov.ua'
  },
  {
    id: 'r_dv_2',
    name: 'Онлайн-платформа «Аврора»',
    category: 'Психологічна підтримка',
    phones: [],
    description: 'Спеціалізована психотерапевтична підтримка особам, які зазнали насильства, пов’язаного з війною (зокрема, сексуального).',
    website: 'https://avrora-help.org.ua'
  },
  {
    id: 'r_health_1',
    name: 'Лінія здоров’я жінки',
    category: 'Охорона здоров\'я',
    phones: ['3033'],
    description: 'Лінія сексуально-репродуктивного здоров’я. Первинні консультації профільного фахівця. Щодня 9:00-18:00.',
  },
  {
    id: 'r2',
    name: 'Гаряча лінія Мінреінтеграції',
    category: 'Державні гарячі лінії',
    phones: ['1548', '+380960788433'],
    description: 'Питання ВПО, евакуації та гуманітарної допомоги.',
    website: 'https://minre.gov.ua/'
  },
  {
    id: 'r3',
    name: 'Безоплатна правова допомога',
    category: 'Юридична допомога',
    phones: ['0 800 213 103'],
    description: 'Консультації юристів, допомога в оформленні документів.',
    website: 'https://legalaid.gov.ua/'
  }
];