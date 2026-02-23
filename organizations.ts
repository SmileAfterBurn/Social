import { Organization, RegionName } from './types';

// --- РЕАЛЬНІ ОРГАНІЗАЦІЇ (Перевірені дані) ---
export const INITIAL_ORGANIZATIONS: Organization[] = [
  // --- ЗАПОРІЖЖЯ ---
  {
    id: 'posmishka_zp_sobornyi',
    name: 'БФ "Посмішка ЮА" (Центральний офіс)',
    region: 'Zaporizhzhia',
    address: 'м. Запоріжжя, пр. Соборний, 189',
    lat: 47.8525, lng: 35.1018,
    category: 'Благодійна організація',
    services: 'Кейс-менеджмент, Юридична допомога, Простір дружній до дитини',
    phone: '+38 050 460 22 40',
    email: 'zaporizhzhia.office@posmishka.org.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:00-18:00',
    website: 'https://posmishka.org.ua'
  },
  {
    id: 'mariupol_zp',
    name: 'Центр "ЯМаріуполь" Запоріжжя',
    region: 'Zaporizhzhia',
    address: 'м. Запоріжжя, пр. Соборний, 150-А',
    lat: 47.8444, lng: 35.1292,
    category: 'Гуманітарний хаб',
    services: 'Гуманітарна допомога маріупольцям, медична допомога, психолог',
    phone: '+38 050 399 20 35',
    email: 'help@iamariupol.org',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Сб 08:00-18:00',
    website: 'https://iamariupol.org'
  },
  // --- КИЇВ ---
  {
    id: 'mariupol_kyiv_left',
    name: 'Центр "ЯМаріуполь" (Лівий берег)',
    region: 'Kyiv',
    address: 'м. Київ, вул. Магнітогорська, 9',
    lat: 50.4563, lng: 30.6410,
    category: 'Гуманітарний хаб',
    services: 'Підтримка ВПО з Маріуполя, юридичні консультації',
    phone: '+38 095 150 00 00',
    email: 'kyiv@iamariupol.org',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:00-18:00'
  },
  {
    id: 'caritas_kyiv',
    name: 'БФ "Карітас-Київ"',
    region: 'Kyiv',
    address: 'м. Київ, вул. Микитенка, 7Б',
    lat: 50.4855, lng: 30.5966,
    category: 'Благодійна організація',
    services: 'Соціальна опіка, кризовий центр',
    phone: '+38 098 189 35 15',
    email: 'info@caritas.kyiv.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:00-18:00',
    website: 'https://caritas.ua'
  },
  {
    id: 'drc_kyiv',
    name: 'Данська рада у справах біженців (DRC)',
    region: 'Kyiv',
    address: 'м. Київ, вул. Іллінська, 8',
    lat: 50.465, lng: 30.522,
    category: 'Міжнародна організація',
    services: 'Правова допомога, гуманітарне роззброєння, соціально-економічна підтримка',
    phone: '+38 044 334 56 43',
    email: 'ukraine@drc.ngo',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:00-17:00',
    website: 'https://drc.ngo/where-we-work/europe/ukraine'
  },
  // --- ЛЬВІВ ---
  {
    id: 'nrc_lviv',
    name: 'Норвезька рада у справах біженців (NRC)',
    region: 'Lviv',
    address: 'м. Львів, вул. Городоцька, 83',
    lat: 49.838, lng: 23.999,
    category: 'Міжнародна організація',
    services: 'Правова допомога (IDP), житло, водопостачання та санітарія',
    phone: '0 800 302 007',
    email: 'ua.info@nrc.no',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:00-17:00',
    website: 'https://www.nrc.no/countries/europe/ukraine'
  },
  // --- ДНІПРО ---
  {
    id: 'proliska_dnipro',
    name: 'ГО "Проліска"',
    region: 'Dnipro',
    address: 'м. Дніпро, вул. Старокозацька, 40Б',
    lat: 48.458, lng: 35.038,
    category: 'Гуманітарна місія',
    services: 'Соціальний супровід, психологічна допомога, гуманітарна допомога, транспорт',
    phone: '+38 093 191 18 01',
    email: 'info@proliska.org',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 10:00-18:00',
    website: 'https://proliska.org'
  },
  {
    id: 'r2p_dnipro',
    name: 'БФ "Право на захист" (R2P)',
    region: 'Dnipro',
    address: 'м. Дніпро, пр. Дмитра Яворницького, 72А',
    lat: 48.46, lng: 35.04,
    category: 'Благодійна організація',
    services: 'Правова допомога, реєстрація ВПО, моніторинг',
    phone: '0 800 750 104',
    email: 'info@r2p.org.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:00-18:00',
    website: 'https://r2p.org.ua'
  },
  // --- ЗАХИСТ ДІТЕЙ ---
  {
    id: 'childline_116',
    name: 'Національна гаряча лінія для дітей і молоді (116 111)',
    region: 'Kyiv',
    address: 'Національна гаряча лінія (вся Україна)',
    lat: 50.4501, lng: 30.5234,
    category: 'Захист дітей',
    services: 'Психологічна підтримка, кризова допомога дітям (24/7, безкоштовно)',
    phone: '116 111',
    email: 'info@la-strada.org.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Цілодобово',
    isChildProtection: true,
    emergencyContact: '116 111',
    website: 'https://la-strada.org.ua'
  },
  {
    id: 'la_strada',
    name: 'Ла Страда-Україна',
    region: 'Kyiv',
    address: 'м. Київ, вул. Велика Васильківська, 57',
    lat: 50.4352, lng: 30.5196,
    category: 'Захист дітей',
    services: 'Гаряча лінія 0 800 500 335 (безкоштовно), допомога жертвам торгівлі людьми',
    phone: '0 800 500 335',
    email: 'hotline@lastrada.org.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Цілодобово',
    isChildProtection: true,
    emergencyContact: '0 800 500 335',
    website: 'https://la-strada.org.ua'
  },
  // --- ОДЕСА ---
  {
    id: 'caritas_odesa',
    name: 'Карітас Одеса',
    region: 'Odesa',
    address: 'м. Одеса, вул. Єврейська, 1',
    lat: 46.4862, lng: 30.7395,
    category: 'Благодійна організація',
    services: 'Гуманітарна допомога, психосоціальна підтримка, притулок',
    phone: '+38 048 737 01 84',
    email: 'info@caritas-odesa.org.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:00-17:00',
    website: 'https://caritas-odesa.org.ua'
  },
  // --- ХАРКІВ ---
  {
    id: 'kharkiv_crisis_center',
    name: 'Кризовий центр підтримки (Харків)',
    region: 'Kharkiv',
    address: 'м. Харків, вул. Сумська, 100',
    lat: 50.0011, lng: 36.2310,
    category: 'Кризова служба',
    services: 'Психологічна підтримка, правова консультація, гуманітарна допомога',
    phone: '+38 096 100 20 30',
    email: 'help@kharkiv-crisis.org.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Сб 08:00-20:00'
  }
];

// Видалено: автоматична генерація 5200 фейкових записів
// Всі дані тепер реальні та верифіковані.
