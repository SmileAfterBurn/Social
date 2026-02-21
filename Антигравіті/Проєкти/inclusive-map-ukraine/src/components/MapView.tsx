import React, { useEffect, useState, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { Organization } from '../types';
import { MapPin, Phone, Locate } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const isNumeric = (val: any): val is number => {
    if (val === null || val === undefined) return false;
    const n = typeof val === 'number' ? val : parseFloat(String(val));
    return !isNaN(n) && isFinite(n);
};

const getValidLatLng = (lat: any, lng: any): [number, number] | null => {
    if (!isNumeric(lat) || !isNumeric(lng)) return null;
    const nLat = Number(lat);
    const nLng = Number(lng);
    if (nLat >= -90 && nLat <= 90 && nLng >= -180 && nLng <= 180) {
        return [nLat, nLng];
    }
    return null;
};

const createCustomIcon = (color: string, size: number, isSelected: boolean = false) => {
    const scale = isSelected ? '1.2' : '1';
    const strokeColor = isSelected ? '#ffffff' : 'white';
    const strokeWidth = isSelected ? '3' : '2';

    return new L.DivIcon({
        className: `custom-marker-${isSelected ? 'selected' : 'default'}`,
        html: `
      <div style="transform: scale(${scale}); transition: transform 0.2s ease-out;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-9 13-9 13s-9-7-9-13a6.5 6.5 0 0 1 13 0Z"></path>
          <circle cx="12" cy="10" r="3" fill="white"></circle>
        </svg>
      </div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
};

const ICONS = {
    default: createCustomIcon('#0d9488', 32, false),
    dev: createCustomIcon('#3b82f6', 32, false),
    selected: createCustomIcon('#e11d48', 42, true),
    user: new L.DivIcon({
        className: 'user-location-icon',
        html: `<div class="relative flex h-8 w-8"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-8 w-8 bg-blue-600 border-4 border-white shadow-lg"></span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    })
};

interface MapViewProps {
    organizations: Organization[];
    selectedOrgId: string | null;
    onSelectOrg: (id: string | null) => void;
    center?: [number, number];
    zoom?: number;
}

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (!map || !center) return;
        const validCoords = getValidLatLng(center[0], center[1]);
        if (!validCoords) return;
        map.flyTo(validCoords, zoom, { duration: 1.2 });
    }, [center, zoom, map]);
    return null;
};

const OrganizationMarker = memo(({ org, isSelected, onSelectOrg }: {
    org: Organization,
    isSelected: boolean,
    onSelectOrg: (id: string) => void
}) => {
    const validCoords = getValidLatLng(org.lat, org.lng);
    if (!validCoords) return null;

    const icon = isSelected ? ICONS.selected : (org.status === 'In Development' ? ICONS.dev : ICONS.default);
    const cleanPhone = org.phone ? org.phone.replace(/[^\d+]/g, '') : '';

    return (
        <Marker
            position={validCoords}
            icon={icon}
            eventHandlers={{ click: () => onSelectOrg(org.id) }}
            zIndexOffset={isSelected ? 1000 : 0}
        >
            <Popup minWidth={280}>
                <div className="flex flex-col p-1">
                    <div className={`p-3 -m-1 mb-2 rounded-t-lg ${isSelected ? 'bg-rose-600' : 'bg-teal-700'} text-white`}>
                        <p className="text-[10px] font-bold uppercase opacity-80 mb-1">{org.category}</p>
                        <h3 className="font-bold text-sm leading-tight">{org.name}</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="text-xs flex items-start gap-2 text-slate-600"><MapPin size={14} className="shrink-0 mt-0.5" />{org.address}</div>
                        <div className="bg-slate-50 p-2 rounded-lg text-xs font-medium text-slate-700">{org.services}</div>
                        <a href={`tel:${cleanPhone}`} className="flex items-center gap-2 p-2 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 font-bold text-xs"><Phone size={14} />{org.phone}</a>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
});

export const MapView: React.FC<MapViewProps> = ({
    organizations,
    selectedOrgId,
    onSelectOrg,
    center = [48.3794, 31.1656],
    zoom = 6
}) => {
    return (
        <div className="h-full w-full relative">
            <MapContainer center={center} zoom={zoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <ZoomControl position="bottomright" />
                <MapUpdater center={center} zoom={zoom} />
                {organizations.map(org => (
                    <OrganizationMarker
                        key={org.id}
                        org={org}
                        isSelected={selectedOrgId === org.id}
                        onSelectOrg={onSelectOrg}
                    />
                ))}
                <LocationControl />
            </MapContainer>
        </div>
    );
};

const LocationControl = () => {
    const [userPos, setUserPos] = useState<[number, number] | null>(null);
    const map = useMap();
    return (
        <div className="absolute top-4 left-4 z-[1000]">
            <button
                onClick={() => {
                    map.locate({ setView: true, maxZoom: 14 });
                    map.on('locationfound', (e: L.LocationEvent) => setUserPos([e.latlng.lat, e.latlng.lng]));
                }}
                className="p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-slate-600 hover:text-teal-600 transition-all"
            >
                <Locate size={20} />
            </button>
            {userPos && <Marker position={userPos} icon={ICONS.user} />}
        </div>
    );
};
