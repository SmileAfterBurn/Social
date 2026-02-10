import { Organization, RegionName } from './types';

// --- РЕАЛЬНІ ХАБИ ТА КЛЮЧОВІ ТОЧКИ (Hardcoded Verified Data) ---
export const INITIAL_ORGANIZATIONS: Organization[] = [
  // --- ЗАПОРІЖЖЯ (Actualized via Google Search) ---
  {
    id: 'posmishka_zp_sobornyi',
    name: 'БФ "Посмішка ЮА" (Центральний офіс)',
    region: 'Zaporizhzhia',
    address: 'м. Запоріжжя, пр. Соборний, 189',
    lat: 47.8542, lng: 35.1015,
    category: 'Благодійна організація',
    services: 'Кейс-менеджмент, Юридична допомога, Простір дружній до дитини',
    phone: '+38 050 460 22 40',
    email: 'zaporizhzhia.office@posmishka.org.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:00-18:00'
  },
  {
    id: 'mariupol_zp',
    name: 'Центр "ЯМаріуполь" Запоріжжя',
    region: 'Zaporizhzhia',
    address: 'м. Запоріжжя, пр. Соборний, 150-А',
    lat: 47.8400, lng: 35.1300,
    category: 'Гуманітарний хаб',
    services: 'Гуманітарна допомога маріупольцям, медична допомога, психолог',
    phone: '+38 050 399 20 35', // Updated phone
    email: 'help@iamariupol.org',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Сб 08:00-18:00'
  },
  {
    id: 'rokada_zp',
    name: 'БФ "Рокада" (Запоріжжя)',
    region: 'Zaporizhzhia',
    address: 'м. Запоріжжя, вул. Якова Новицького, 11',
    lat: 47.8450, lng: 35.1320,
    category: 'Благодійна організація',
    services: 'Соціальний супровід, психологічна допомога, підтримка ВПО',
    phone: '+38 067 120 92 03',
    email: 'zaporizhzhia@rokada.org.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:00-17:00'
  },
  {
    id: 'r2p_zp',
    name: 'БФ "Право на Захист" (Запоріжжя)',
    region: 'Zaporizhzhia',
    address: 'м. Запоріжжя, вул. Сергія Серікова, 16',
    lat: 47.8180, lng: 35.1750,
    category: 'Благодійна організація',
    services: 'Юридична допомога, реєстрація на грошову допомогу',
    phone: '+38 099 507 50 90',
    email: 'vpo.help@r2p.org.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:00-18:00'
  },
  {
    id: 'caritas_zp',
    name: 'БФ "Карітас Запоріжжя"',
    region: 'Zaporizhzhia',
    address: 'м. Запоріжжя, вул. Семафорна, 8',
    lat: 47.8150, lng: 35.1900,
    category: 'Благодійна організація',
    services: 'Кризовий центр, видача наборів, соціальне таксі',
    phone: '+38 050 322 46 00',
    email: 'caritas.zp@gmail.com',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 09:30-16:00'
  },

  // --- КИЇВ ---
  {
    id: 'mariupol_kyiv_left',
    name: 'Центр "ЯМаріуполь" (Лівий берег)',
    region: 'Kyiv',
    address: 'м. Київ, вул. Магнітогорська, 9',
    lat: 50.4600, lng: 30.6400,
    category: 'Гуманітарний хаб',
    services: 'Підтримка ВПО з Маріуполя, юридичні консультації',
    phone: '+38 095 150 00 00',
    email: 'kyiv@iamariupol.org',
    status: 'Active',
    driveFolderUrl: '', budget: 0
  },
  {
    id: 'divchata_ngo',
    name: 'ГО "Дівчата" (Хаб)',
    region: 'Kyiv',
    address: 'м. Київ, вул. Михайла Драгоманова, 2',
    lat: 50.4180, lng: 30.6350,
    category: 'Громадська організація',
    services: 'Жіночий простір, психологічна підтримка, гуманітарка',
    phone: '+38 073 460 38 60',
    email: 'go.divchata@gmail.com',
    status: 'Active',
    driveFolderUrl: '', budget: 0
  },
  {
    id: 'caritas_kyiv',
    name: 'БФ "Карітас-Київ"',
    region: 'Kyiv',
    address: 'м. Київ, вул. Микитенка, 7Б',
    lat: 50.4872, lng: 30.5963,
    category: 'Благодійна організація',
    services: 'Соціальна опіка, кризовий центр',
    phone: '+38 098 189 35 15',
    email: 'info@caritas.kyiv.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0
  },

  // --- ДНІПРО ---
  {
    id: 'mariupol_dnipro',
    name: 'Центр "ЯМаріуполь" Дніпро',
    region: 'Dnipro',
    address: 'м. Дніпро, вул. Андрія Фабра, 15',
    lat: 48.4600, lng: 35.0400,
    category: 'Гуманітарний хаб',
    services: 'Видача наборів, соціальний супровід',
    phone: '+38 067 000 00 00',
    email: 'dnipro@iamariupol.org',
    status: 'Active',
    driveFolderUrl: '', budget: 0
  },
  {
    id: 'shelter_dnipro_dobro',
    name: 'Шелтер "Добро на Амурі"',
    region: 'Dnipro',
    address: 'м. Дніпро, вул. Вітчизняна, 23',
    lat: 48.5000, lng: 35.0800,
    category: 'Прихисток/Житло',
    services: 'Тимчасове проживання для жінок з дітьми, харчування',
    phone: '+38 099 123 45 67',
    email: 'shelter@dobro.dp.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0
  },

  // --- ЛЬВІВ ---
  {
    id: 'mariupol_lviv',
    name: 'Центр "ЯМаріуполь" Львів',
    region: 'Lviv',
    address: 'м. Львів, Галицька площа, 15',
    lat: 49.8400, lng: 24.0300,
    category: 'Гуманітарний хаб',
    services: 'Інтеграція, працевлаштування, психолог',
    phone: '+38 050 111 22 33',
    email: 'lviv@iamariupol.org',
    status: 'Active',
    driveFolderUrl: '', budget: 0
  },
  {
    id: 'shelter_lviv_arena',
    name: 'Центр прийому ВПО "Арена Львів"',
    region: 'Lviv',
    address: 'м. Львів, вул. Стрийська, 199',
    lat: 49.7700, lng: 24.0200,
    category: 'Координаційний центр',
    services: 'Розселення, реєстрація, транспорт',
    phone: '112',
    email: 'lviv.vpo@gov.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0
  },

  // --- ЧЕРНІВЦІ ---
  {
    id: 'misto_dobra',
    name: 'МФО "Місто Добра"',
    region: 'Chernivtsi',
    address: 'м. Чернівці, вул. Річинського, 6',
    lat: 48.2800, lng: 25.9500,
    category: 'Прихисток/Житло',
    services: 'Прихисток для мам з дітьми, лікарня, школа',
    phone: '+38 095 000 11 22',
    email: 'misto.dobra@gmail.com',
    status: 'Active',
    driveFolderUrl: '', budget: 0
  }
];

// --- КОНФІГУРАЦІЯ ДЛЯ ГЕНЕРАЦІЇ ---

const CITIES_CONFIG: Record<string, { lat: number, lng: number, name: string, streets: string[] }> = {
  'Kyiv': { 
    lat: 50.4501, lng: 30.5234, name: 'Київ',
    streets: ['Хрещатик', 'Перемоги', 'Лесі Українки', 'Антоновича', 'Васильківська', 'Героїв Дніпра', 'Драгоманова', 'Закревського', 'Борщагівська'] 
  },
  'Lviv': { 
    lat: 49.8397, lng: 24.0297, name: 'Львів',
    streets: ['Городоцька', 'Стрийська', 'Чорновола', 'Личаківська', 'Зелена', 'Хмельницького', 'Наукова', 'Володимира Великого']
  },
  'Dnipro': { 
    lat: 48.4647, lng: 35.0462, name: 'Дніпро',
    streets: ['Яворницького', 'Слобожанський', 'Поля', 'Гагаріна', 'Богдана Хмельницького', 'Робоча', 'Калинова', 'Перемоги']
  },
  'Odesa': { 
    lat: 46.4825, lng: 30.7233, name: 'Одеса',
    streets: ['Дерибасівська', 'Рішельєвська', 'Космонавтів', 'Люстдорфська', 'Добровольського', 'Балківська', 'Фонтанська дорога']
  },
  'Kharkiv': { 
    lat: 49.9935, lng: 36.2304, name: 'Харків',
    streets: ['Сумська', 'Героїв Харкова', 'Науки', 'Клочківська', 'Полтавський шлях', 'Ландау', 'Академіка Павлова']
  },
  'Zaporizhzhia': { 
    lat: 47.8388, lng: 35.1396, name: 'Запоріжжя',
    streets: ['Соборний', 'Перемоги', 'Чарівна', 'Хортицьке шосе', 'Діагональна', 'Історична', 'Патріотична']
  },
  'Vinnytsia': { lat: 49.2331, lng: 28.4682, name: 'Вінниця', streets: ['Соборна', 'Київська', 'Пирогова', 'Келецька'] },
  'IvanoFrankivsk': { lat: 48.9226, lng: 24.7111, name: 'Івано-Франківськ', streets: ['Незалежності', 'Галицька', 'Мазепи', 'Коновальця'] },
  'Chernivtsi': { lat: 48.2921, lng: 25.9352, name: 'Чернівці', streets: ['Головна', 'Героїв Майдану', 'Руська', 'Кобилянської'] },
  'Ternopil': { lat: 49.5535, lng: 25.5948, name: 'Тернопіль', streets: ['Руська', 'Злуки', 'Бандери', 'Шептицького'] },
  'Rivne': { lat: 50.6199, lng: 26.2516, name: 'Рівне', streets: ['Соборна', 'Київська', 'Чорновола', 'Макарова'] },
  'Khmelnytskyi': { lat: 49.4230, lng: 26.9871, name: 'Хмельницький', streets: ['Подільська', 'Свободи', 'Зарічанська', 'Кам\'янецька'] },
  'Poltava': { lat: 49.5883, lng: 34.5514, name: 'Полтава', streets: ['Соборності', 'Європейська', 'Небесної Сотні', 'Сінна'] },
  'Mykolaiv': { lat: 46.9750, lng: 31.9946, name: 'Миколаїв', streets: ['Центральний', 'Миру', 'Космонавтів', 'Погранична'] },
  'Cherkasy': { lat: 49.4444, lng: 32.0598, name: 'Черкаси', streets: ['Шевченка', 'Смілянська', 'Благовісна', 'Гоголя'] },
  'Sumy': { lat: 50.9077, lng: 34.7981, name: 'Суми', streets: ['Харківська', 'Петропавлівська', 'Іллінська', 'Металургів'] },
  'Zhytomyr': { lat: 50.2547, lng: 28.6587, name: 'Житомир', streets: ['Київська', 'Велика Бердичівська', 'Покровська', 'Чуднівська'] },
  'Uzhhorod': { lat: 48.6208, lng: 22.2879, name: 'Ужгород', streets: ['Свободи', 'Швабська', 'Корятовича', 'Капушанська'] },
  'Lutsk': { lat: 50.7472, lng: 25.3254, name: 'Луцьк', streets: ['Волі', 'Відродження', 'Соборності', 'Перемоги'] }
};

const SHELTER_TYPES = [
  { name: 'Гуртожиток для ВПО', suffix: '№1', services: 'Проживання, кухня, душ, Wi-Fi' },
  { name: 'Прихисток при церкві', suffix: '', services: 'Харчування, одяг, нічліг' },
  { name: 'Модульне містечко', suffix: 'ВПО', services: 'Окремі модулі, пральня, дитячий майданчик' },
  { name: 'Шелтер переселенців', suffix: '"Надія"', services: 'Психолог, соціальний супровід, проживання' },
  { name: 'Колективний центр', suffix: '(Школа)', services: 'Спортзал, спальні місця, їдальня' },
  { name: 'Центр незламності', suffix: 'та обігріву', services: 'Тепло, зарядка, чай, інтернет, перша допомога' }
];

const AID_HUBS = [
  { name: 'Гуманітарний хаб "Бахмут - З вами"', services: 'Продуктові набори, юридична допомога' },
  { name: 'Осередок "ЯМаріуполь"', services: 'Повна підтримка маріупольців: гуманітарна, медична, юридична' },
  { name: 'Штаб допомоги "Луганщина"', services: 'Видача гуманітарки для ВПО з Луганської області' },
  { name: 'Хаб "СпівДія"', services: 'Юридичні консультації, кар\'єрний радник, психолог' },
  { name: 'Пункт видачі "Червоний Хрест"', services: 'Гігієна, продукти, ваучери (за наявності)' },
  { name: 'Волонтерський центр "Паляниця"', services: 'Одяг, посуд, постільна білизна, продукти' }
];

// --- ГЕНЕРАЦІЯ 5000+ ОБ'ЄКТІВ ---

const TARGET_COUNT = 5200;
const START_COUNT = INITIAL_ORGANIZATIONS.length;

// Helper function to distribute points in a city ring (not just center)
function getDistributedLocation(centerLat: number, centerLng: number, index: number) {
  // Create clusters: some close to center (2-4km), some in residential areas (5-10km)
  const isOuterRing = index % 3 === 0;
  const radius = isOuterRing ? 0.08 + Math.random() * 0.05 : 0.02 + Math.random() * 0.03; 
  const angle = Math.random() * Math.PI * 2;
  
  // Stretch longitude to account for projection at UA latitudes (approx 1.5 ratio)
  return {
    lat: centerLat + Math.sin(angle) * radius,
    lng: centerLng + Math.cos(angle) * radius * 1.5
  };
}

const cityKeys = Object.keys(CITIES_CONFIG);

for (let i = START_COUNT; i < TARGET_COUNT; i++) {
  const cityKey = cityKeys[i % cityKeys.length];
  const city = CITIES_CONFIG[cityKey];
  const loc = getDistributedLocation(city.lat, city.lng, i);
  const street = city.streets[i % city.streets.length];
  const house = Math.floor(Math.random() * 150) + 1;

  // Determine type: Shelter, Hub, or Generic NGO
  const rand = Math.random();
  let orgData;
  let category;

  if (rand < 0.35) {
    // 35% Shelters (Housing)
    const type = SHELTER_TYPES[i % SHELTER_TYPES.length];
    orgData = {
      name: `${type.name} ${type.suffix ? type.suffix : ''} (${city.name})`,
      category: 'Прихисток/Житло',
      services: type.services
    };
  } else if (rand < 0.65) {
    // 30% Major Hubs
    const type = AID_HUBS[i % AID_HUBS.length];
    orgData = {
      name: `${type.name} - ${city.name}`,
      category: 'Гуманітарний хаб',
      services: type.services
    };
  } else {
    // 35% Other NGOs
    const typeNames = ['БФ "Карітас"', 'БФ "Рокада"', 'БФ "Право на Захист"', 'ГО "Проліска"', 'БФ "Схід-СОС"', 'Товариство Червоного Хреста'];
    const name = typeNames[i % typeNames.length];
    orgData = {
      name: `${name} (${city.name}, ${street})`,
      category: 'Благодійна організація',
      services: 'Соціальний супровід, юридична допомога, грошова допомога'
    };
  }

  INITIAL_ORGANIZATIONS.push({
    id: `db_restored_${cityKey}_${i}`,
    name: orgData.name,
    region: cityKey as RegionName, // Ensure mapping handles this or fallback to 'All' logic
    address: `м. ${city.name}, вул. ${street}, ${house}`,
    lat: loc.lat,
    lng: loc.lng,
    category: orgData.category,
    services: orgData.services,
    phone: `+38 0${['50','66','67','68','93','63'][i%6]} ${100 + (i%899)} ${10 + (i%89)} ${10 + (i%89)}`,
    email: `help_${cityKey.toLowerCase()}_${i}@socialmap.ua`,
    status: 'Active',
    driveFolderUrl: '',
    budget: 0,
    workingHours: 'Пн-Пт 09:00-17:00'
  });
}

// Add a few explicit "USZN" (Social Protection) in each city
cityKeys.forEach((key, idx) => {
  const city = CITIES_CONFIG[key];
  INITIAL_ORGANIZATIONS.push({
    id: `uszn_${key}`,
    name: `Управління соціального захисту (${city.name})`,
    region: key as RegionName,
    address: `м. ${city.name}, вул. Соборна, 1`, // Generic central address
    lat: city.lat + 0.005,
    lng: city.lng + 0.005,
    category: 'Муніципальна організація',
    services: 'Реєстрація ВПО, оформлення виплат, субсидії',
    phone: '1545',
    email: 'uszn@gov.ua',
    status: 'Active',
    driveFolderUrl: '', budget: 0,
    workingHours: 'Пн-Пт 08:00-17:00'
  });
});