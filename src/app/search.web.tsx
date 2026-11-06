
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import postsData from './post/posts.json';
import storesData from './store/stores.json';

import 'leaflet/dist/leaflet.css';

type Store = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};


type Post = {
  id: string;
  storeId: string | null;
  productName: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  postedAt: string;
  latitude?: number;
  longitude?: number;
};


export default function SearchScreen() {
  const [MapComponent, setMapComponent] = useState<any>(null);

  const stores = storesData as Store[];
  const posts = postsData as Post[];

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

  const center: [number, number] = [35.1709, 136.8815];

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#F7F9F5' }}>
      <Text style={{ fontSize: 23, fontWeight: 'bold', marginBottom: 12 }}>
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

          
          {/* 店舗が登録されている投稿：緑色のピン */}
          {stores.map((store) => {
            const storePosts = posts.filter(
              (post) => post.storeId === store.id
            );

            return (
              <CircleMarker
                key={store.id}
                center={[store.latitude, store.longitude]}
                radius={10}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: storePosts.length > 0
                    ? '#35A853'
                    : '#999999',
                  fillOpacity: 1,
                }}
              >
                <Popup>
                  <strong>{store.name}</strong>
                  <br />
                  {store.address}
                  <hr />

                  {storePosts.length === 0 ? (
                    <p>現在、投稿はありません。</p>
                  ) : (
                    storePosts.map((post) => (
                      <div key={post.id}>
                        <strong>{post.productName}</strong>
                        <br />
                        通常価格：{post.originalPrice}円
                        <br />
                        値引き価格：{post.discountPrice}円
                        <br />
                        <span style={{ color: '#E05252' }}>
                          {post.discountRate}% OFF
                        </span>
                        <hr />
                      </div>
                    ))
                  )}
                </Popup>
              </CircleMarker>
            );
          })}

          {/* 店舗が登録されていない投稿：オレンジ色のピン */}
          {posts
            .filter(
              (post) =>
                post.storeId === null &&
                post.latitude !== undefined &&
                post.longitude !== undefined
            )
            .map((post) => (
              <CircleMarker
                key={post.id}
                center={[post.latitude!, post.longitude!]}
                radius={10}
                pathOptions={{
                  color: '#FFFFFF',
                  fillColor: '#F39C35',
                  fillOpacity: 1,
                }}
              >
                <Popup>
                  <strong>{post.productName}</strong>
                  <br />
                  <span>店舗未登録の投稿</span>
                  <br />
                  通常価格：{post.originalPrice}円
                  <br />
                  値引き価格：{post.discountPrice}円
                  <br />
                  <span style={{ color: '#E05252' }}>
                    {post.discountRate}% OFF
                  </span>
                </Popup>
              </CircleMarker>
            ))}

        </MapContainer>
      </View>
    </View>
  );
}
