import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Hotel } from '../../../types/host';
import { Link } from 'react-router-dom';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  hotels: Hotel[];
}

export default function MapView({ hotels }: MapViewProps) {
  // Default center (Vietnam) or center of first hotel
  const center: [number, number] =
    hotels.length > 0 && hotels[0].latitude && hotels[0].longitude
      ? [hotels[0].latitude, hotels[0].longitude]
      : [16.047079, 108.20623]; // Da Nang

  return (
    <div className="h-[calc(100vh-150px)] rounded-2xl overflow-hidden border border-slate-200 shadow-lg sticky top-24">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotels.map((hotel) =>
          hotel.latitude && hotel.longitude ? (
            <Marker key={hotel.id} position={[hotel.latitude, hotel.longitude]}>
              <Popup>
                <div className="min-w-[200px]">
                  <img
                    src={
                      hotel.images?.[0]?.url
                        ? hotel.images[0].url.startsWith('http')
                          ? hotel.images[0].url
                          : `http://localhost:8080${hotel.images[0].url}`
                        : '/placeholder-hotel.jpg'
                    }
                    alt={hotel.name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-bold text-sm mb-1">{hotel.name}</h3>
                  <p className="text-brand-cta font-bold text-sm">
                    From $100/night
                  </p>
                  <Link
                    to={`/hotels/${hotel.id}`}
                    className="block mt-2 text-center bg-brand-primary text-white text-xs py-2 rounded-md font-bold"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
