
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function SearchScreen() {
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    let active = true;

    async function loadMap() {
      const leaflet = await import('react-leaflet');

      if (active) {
        setMapComponent(() => leaflet);
      }
    }

    loadMap();

    return () => {
      active = false;
    };
  }, []);

  if (!MapComponent) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text>地図を読み込んでいます...</Text>
      </View>
    );
  }

  const {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
  } = MapComponent;

  const center: [number, number] = [35.6812, 139.7671];

  const stores = [
    {
      name: 'サンプル店舗A',
      position: [35.6812, 139.7671] as [number, number],
      product: 'お弁当 20% OFF',
    },
    {
      name: 'サンプル店舗B',
      position: [35.6895, 139.6917] as [number, number],
      product: 'パン 30% OFF',
    },
    {
      name: 'サンプル店舗C',
      position: [35.6580, 139.7016] as [number, number],
      product: 'お惣菜 50% OFF',
    },
  ];

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#F7F9F5' }}>
      <Text style={{ fontSize: 23, fontWeight: 'bold', marginBottom: 10 }}>
        お店・商品を地図から探す
      </Text>

      <View style={{ flex: 1, minHeight: 400 }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {stores.map((store, index) => (
            <CircleMarker
              key={index}
              center={store.position}
              radius={10}
              pathOptions={{
                color: '#FFFFFF',
                fillColor: '#35A853',
                fillOpacity: 1,
              }}
            >
              <Popup>
                <strong>{store.name}</strong>
                <br />
                {store.product}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </View>
    </View>
  );
}
