
import React, { useCallback, useState, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow, MarkerClusterer, useJsApiLoader } from '@react-google-maps/api';
import { Organization } from '../types';
import { Phone, Mail, AlertTriangle } from 'lucide-react';

interface MapViewProps {
  organizations: Organization[];
  selectedOrgId: string | null;
  onSelectOrg: (id: string) => void;
  onOpenReferral: (org: Organization) => void;
  center?: [number, number];
  zoom?: number;
  isDarkMode?: boolean;
  onResetKey?: () => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '2.5rem'
};

const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places", "geometry"];

const CLEAN_MAP_STYLES = (isDark: boolean) => [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  ...(isDark ? [
    { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] }
  ] : [])
];

export const MapView: React.FC<MapViewProps> = ({
  organizations = [],
  selectedOrgId,
  onSelectOrg,
  onOpenReferral,
  center = [48.3794, 31.1656],
  zoom = 6,
  isDarkMode = false,
  onResetKey
}) => {
  // Fix: Use any to avoid 'Cannot find namespace google' when type definitions are not loaded
  const [map, setMap] = useState<any>(null);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);

  // Use the library's official loader to handle script injection and API key management
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.API_KEY || '',
    libraries: LIBRARIES,
    language: 'uk',
    region: 'UA'
  });

  // Fix: Use any for mapInstance parameter to avoid namespace error
  const onLoad = useCallback((mapInstance: any) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const mapCenter = useMemo(() => {
    const lat = center && typeof center[0] === 'number' ? center[0] : 48.3794;
    const lng = center && typeof center[1] === 'number' ? center[1] : 31.1656;
    return { lat, lng };
  }, [center]);

  const mapOptions = useMemo(() => ({
    styles: CLEAN_MAP_STYLES(isDarkMode),
    disableDefaultUI: true,
    zoomControl: false,
    minZoom: 4,
    gestureHandling: 'greedy' as const,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
  }), [isDarkMode]);

  if (loadError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] p-6 text-center animate-in-dialog">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-xl font-black dark:text-white uppercase mb-4">Помилка авторизації Карт</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
          Виникла помилка при завантаженні Google Maps API. Перевірте дійсність ключа (InvalidKeyMapError).
        </p>
        <button 
          onClick={onResetKey} 
          className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg hover:bg-teal-700 transition-all active:scale-95"
        >
          Налаштувати ключ
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-[2.5rem]">
        <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative overflow-hidden rounded-[2.5rem]">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        <MarkerClusterer>
          {(clusterer) => (
            <>
              {organizations.map((org) => {
                if (!org || typeof org.lat !== 'number' || typeof org.lng !== 'number') return null;
                const isSelected = selectedOrgId === org.id;
                return (
                  <Marker
                    key={org.id}
                    position={{ lat: org.lat, lng: org.lng }}
                    clusterer={clusterer}
                    title={org.name}
                    onClick={() => {
                      setActiveOrg(org);
                      onSelectOrg(org.id);
                    }}
                    icon={{
                      url: isSelected 
                        ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' 
                        : 'https://maps.google.com/mapfiles/ms/icons/teal-dot.png',
                      // Fix: Access Size constructor via window.google to ensure name resolution in all environments
                      scaledSize: new window.google.maps.Size(32, 32)
                    }}
                  />
                );
              })}
            </>
          )}
        </MarkerClusterer>

        {activeOrg && (
          <InfoWindow
            position={{ lat: activeOrg.lat, lng: activeOrg.lng }}
            onCloseClick={() => setActiveOrg(null)}
          >
            <div className="p-2 min-w-[220px]">
               <h3 className="font-black text-slate-800 text-sm mb-3 uppercase tracking-tight">{activeOrg.name}</h3>
               <div className="flex flex-col gap-2">
                 {activeOrg.phone && (
                   <a 
                     href={`tel:${activeOrg.phone.replace(/[^\d+]/g, '')}`} 
                     className="flex items-center gap-2 py-2.5 bg-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl justify-center transition hover:bg-teal-700"
                   >
                      <Phone size={12} /> Зателефонувати
                   </a>
                 )}
                 <button 
                   onClick={() => onOpenReferral(activeOrg)} 
                   className="flex items-center gap-2 py-2.5 border border-teal-200 text-teal-700 text-[10px] font-black uppercase tracking-widest rounded-xl justify-center transition hover:bg-teal-50"
                 >
                    <Mail size={12} /> Направити запит
                 </button>
               </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
        <button 
          onClick={() => map?.setZoom((map.getZoom() || 6) + 1)} 
          className="w-10 h-10 bg-white dark:bg-slate-800 shadow-xl rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-100 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all active:scale-90"
        >
          +
        </button>
        <button 
          onClick={() => map?.setZoom((map.getZoom() || 6) - 1)} 
          className="w-10 h-10 bg-white dark:bg-slate-800 shadow-xl rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-100 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-all active:scale-90"
        >
          -
        </button>
      </div>
    </div>
  );
};
