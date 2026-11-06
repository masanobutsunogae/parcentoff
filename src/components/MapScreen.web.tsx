//Filename: src/components/MapScreen.web.tsx

import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

export default function MyMap() {
  return (
    <MapContainer center={[35.6812, 139.7671]} zoom={13} style={{ height: "400px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[35.6812, 139.7671]}>
        <Popup>東京駅周辺です！</Popup>
      </Marker>
    </MapContainer>
  );
}
