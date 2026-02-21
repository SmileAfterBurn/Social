import { Organization, RegionName } from '../types';

export const INITIAL_ORGANIZATIONS: Organization[] = [
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
    workingHours: 'Пн-Пт 09:00-18:00'
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
    workingHours: 'Пн-Сб 08:00-18:00'
  }
];

// Helper to expand data for testing across regions
const CITIES: Record<string, { lat: number, lng: number, name: string, region: RegionName }> = {
  'Kyiv': { lat: 50.4501, lng: 30.5234, name: 'Київ', region: 'Kyiv' },
  'Lviv': { lat: 49.8397, lng: 24.0297, name: 'Львів', region: 'Lviv' },
  'Dnipro': { lat: 48.4647, lng: 35.0462, name: 'Дніпро', region: 'Dnipro' },
  'Odesa': { lat: 46.4825, lng: 30.7233, name: 'Одеса', region: 'Odesa' },
  'Kharkiv': { lat: 49.9935, lng: 36.2304, name: 'Харків', region: 'Kharkiv' },
  'Sumy': { lat: 50.9077, lng: 34.7981, name: 'Суми', region: 'Sumy' }
};

Object.keys(CITIES).forEach((key) => {
  const city = CITIES[key];
  INITIAL_ORGANIZATIONS.push({
    id: `auto_${key}`,
    name: `Гуманітарний штаб (${city.name})`,
    region: city.region,
    address: `м. ${city.name}, центральна площа`,
    lat: city.lat + (Math.random() - 0.5) * 0.01,
    lng: city.lng + (Math.random() - 0.5) * 0.01,
    category: 'Гуманітарна допомога',
    services: 'Продукти, ліки, гігієна',
    phone: '+38 0800 000 000',
    email: `help.${key.toLowerCase()}@example.com`,
    status: 'Active'
  });
});
