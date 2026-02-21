export type UserRole = 'Guest' | 'Partner' | 'Manager' | 'Admin' | 'Creator';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type RegionName = 'All' | 'Odesa' | 'Mykolaiv' | 'Kherson' | 'Dnipro' | 'Zaporizhzhia' | 'Kyiv' | 'Lviv' | 'Kharkiv' | 'Volyn' | 'Zhytomyr' | 'IvanoFrankivsk' | 'Kirovohrad' | 'Rivne' | 'Sumy' | 'Ternopil' | 'Chernivtsi' | 'Khmelnytskyi' | 'Chernihiv' | 'Poltava' | 'Vinnytsia' | 'Cherkasy' | 'Donetsk' | 'Zakarpattia';

export interface Organization {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  services: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'In Development';
  driveFolderUrl?: string;
  budget?: number;
  region: RegionName; 
  workingHours?: string;
  additionalPhones?: string[];
  establishedDate?: string; 
  website?: string;
  notes?: string;
  logoUrl?: string;
  isChildProtection?: boolean;
  emergencyContact?: string;
}

export interface RemoteSupportActor {
  id: string;
  name: string;
  category: string;
  phones: string[];
  description: string;
  website?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum ViewMode {
  Grid = 'grid',
  Map = 'map',
  Split = 'split'
}

export interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'xl';
  highContrast: boolean;
}

declare global {
  interface Window {
    process?: {
      env: {
        API_KEY: string;
        [key: string]: string;
      }
    };
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
