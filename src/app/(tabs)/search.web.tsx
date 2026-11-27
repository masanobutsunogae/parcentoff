import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

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
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [screen, setScreen] = useState<'map' | 'form'>('map');
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [unregisteredLocation, setUnregisteredLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Firestoreから取得した店舗・商品データ
  const [stores, setStores] = useState<Store[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [productName, setProductName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [showPreviewMessage, setShowPreviewMessage] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMap() {
      const leaflet = await import('react-leaflet');
      if (active) setMapComponent(() => leaflet);
    }

    loadMap();
    return () => {
      active = false;
    };
  }, []);

  // Firestoreの店舗・商品データをリアルタイムで監視
  useEffect(() => {
    const unsubscribeStores = onSnapshot(
      collection(db, 'stores'),
      (snapshot) => {
        const storeList = snapshot.docs.map((document) => ({
          ...document.data(),
          id: document.id,
        })) as Store[];

        setStores(storeList);
      },
      (error) => {
        console.error('店舗情報の取得エラー:', error);
      }
    );

    const unsubscribePosts = onSnapshot(
      collection(db, 'posts'),
      (snapshot) => {
        const postList = snapshot.docs.map((document) => ({
          ...document.data(),
          id: document.id,
        })) as Post[];

        setPosts(postList);
      },
      (error) => {
        console.error('商品情報の取得エラー:', error);
      }
    );

    return () => {
      unsubscribeStores();
      unsubscribePosts();
    };
  }, []);

  const discountRate = useMemo(() => {
    const original = Number(originalPrice);
    const discounted = Number(discountPrice);
    if (!originalPrice || !discountPrice || original <= 0 || discounted < 0 || discounted > original) {
      return null;
    }
    return Math.round(((original - discounted) / original) * 100);
  }, [originalPrice, discountPrice]);

  const openPostForm = (store: Store) => {
    setSelectedStore(store);
    setUnregisteredLocation(null);
    setShowPreviewMessage(false);
    setSaveMessage('');
    setScreen('form');
  };

  const startUnregisteredPost = () => {
    setIsPickingLocation(true);
    setSaveMessage('');
  };

  const openUnregisteredPostForm = (latitude: number, longitude: number) => {
    setSelectedStore(null);
    setUnregisteredLocation({ latitude, longitude });
    setIsPickingLocation(false);
    setShowPreviewMessage(false);
    setSaveMessage('');
    setScreen('form');
  };

  const savePost = async () => {
    if (!productName.trim() || !originalPrice || !discountPrice || discountRate === null) {
      setSaveMessage('商品名・通常価格・値引き価格を正しく入力してください。');
      return;
    }
    if (!selectedStore && !unregisteredLocation) {
      setSaveMessage('投稿する場所を地図上で選択してください。');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    try {
      await addDoc(collection(db, 'posts'), {
        storeId: selectedStore ? selectedStore.id : null,
        productName: productName.trim(),
        originalPrice: Number(originalPrice),
        discountPrice: Number(discountPrice),
        discountRate,
        description: description.trim(),
        postedAt: new Date().toISOString(),
        ...(selectedStore ? {} : {
          latitude: unregisteredLocation!.latitude,
          longitude: unregisteredLocation!.longitude,
        }),
      });
      setProductName('');
      setOriginalPrice('');
      setDiscountPrice('');
      setDescription('');
      setSelectedStore(null);
      setUnregisteredLocation(null);
      setShowPreviewMessage(false);
      setScreen('map');
      setSaveMessage('投稿を保存しました。');
    } catch (error) {
      console.error('投稿の保存に失敗しました:', error);
      setSaveMessage('投稿を保存できませんでした。Firestoreの設定や通信状態をご確認ください。');
    } finally {
      setIsSaving(false);
    }
  };

  const closePostForm = () => {
    // 地図コンポーネントはアンマウントせず非表示にするため、戻った際も地図の位置を保ちます。
    setScreen('map');
    setShowPreviewMessage(false);
    setSelectedStore(null);
    setUnregisteredLocation(null);
  };

  if (!MapComponent) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
        <Text>地図を読み込んでいます...</Text>
      </View>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } = MapComponent;
  const MapClickHandler = ({ onSelect }: { onSelect: (latitude: number, longitude: number) => void }) => {
    useMapEvents({
      click(event: any) {
        onSelect(event.latlng.lat, event.latlng.lng);
      },
    });
    return null;
  };
  const center: [number, number] = [35.1709, 136.8815];

  const inputStyle = {
    borderWidth: 1,
    borderColor: '#D7DDD5',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#243024',
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F9F5' }}>
      {/* 地図画面はフォーム表示中も保持し、閉じたときに同じ位置へ戻します。 */}
      <View
        style={{
          flex: 1,
          padding: 16,
          display: screen === 'map' ? 'flex' : 'none',
        }}
      >
        <Text style={{ fontSize: 23, fontWeight: 'bold', marginBottom: 12, color: '#243024' }}>
          お店・商品を地図から探す
        </Text>
        <Pressable
          onPress={startUnregisteredPost}
          style={{ backgroundColor: '#F39C35', paddingVertical: 11, paddingHorizontal: 14, borderRadius: 9, alignItems: 'center', marginBottom: 10 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>店舗を指定せずに投稿</Text>
        </Pressable>
        {isPickingLocation ? (
          <Text style={{ color: '#805A16', marginBottom: 8 }}>地図上の投稿したい場所をタップしてください。</Text>
        ) : null}
        {saveMessage ? (
          <Text style={{ color: saveMessage.includes('保存しました') ? '#287A3B' : '#B34B42', marginBottom: 8 }}>{saveMessage}</Text>
        ) : null}

        <View style={{ flex: 1, minHeight: 400 }}>
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            {isPickingLocation ? (
              <MapClickHandler onSelect={openUnregisteredPostForm} />
            ) : null}
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 登録済み店舗：商品投稿の有無でピンの色を変更 */}
            {stores.map((store) => {
              const storePosts = posts.filter((post) => post.storeId === store.id);

              return (
                <CircleMarker
                  key={store.id}
                  center={[store.latitude, store.longitude]}
                  radius={10}
                  pathOptions={{
                    color: '#FFFFFF',
                    fillColor: storePosts.length > 0 ? '#35A853' : '#999999',
                    fillOpacity: 1,
                  }}
                >
                  <Popup>
                    <View style={{ minWidth: 190, gap: 7 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{store.name}</Text>
                      <Text>{store.address}</Text>
                      <View style={{ height: 1, backgroundColor: '#DDDDDD' }} />

                      {storePosts.length === 0 ? (
                        <Text>現在、投稿はありません。</Text>
                      ) : (
                        storePosts.map((post) => (
                          <View key={post.id} style={{ gap: 3, marginBottom: 6 }}>
                            <Text style={{ fontWeight: 'bold' }}>{post.productName}</Text>
                            <Text>通常価格：{post.originalPrice}円</Text>
                            <Text>値引き価格：{post.discountPrice}円</Text>
                            <Text style={{ color: '#E05252', fontWeight: 'bold' }}>
                              {post.discountRate}% OFF
                            </Text>
                          </View>
                        ))
                      )}

                      <Pressable
                        onPress={() => openPostForm(store)}
                        style={{
                          backgroundColor: '#35A853',
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          alignItems: 'center',
                          marginTop: 4,
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                          この店舗に商品を投稿
                        </Text>
                      </Pressable>
                    </View>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* 店舗未登録の商品投稿 */}
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
                  pathOptions={{ color: '#FFFFFF', fillColor: '#F39C35', fillOpacity: 1 }}
                >
                  <Popup>
                    <View style={{ gap: 3 }}>
                      <Text style={{ fontWeight: 'bold' }}>{post.productName}</Text>
                      <Text>店舗未登録の投稿</Text>
                      <Text>通常価格：{post.originalPrice}円</Text>
                      <Text>値引き価格：{post.discountPrice}円</Text>
                      <Text style={{ color: '#E05252', fontWeight: 'bold' }}>
                        {post.discountRate}% OFF
                      </Text>
                    </View>
                  </Popup>
                </CircleMarker>
              ))}
          </MapContainer>
        </View>
      </View>

      {/* 投稿フォーム画面 */}
      <View
        style={{
          flex: 1,
          display: screen === 'form' ? 'flex' : 'none',
          backgroundColor: '#F7F9F5',
        }}
      >
        <View
          style={{
            minHeight: 58,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: '#E3E8E1',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#243024' }}>
            商品を投稿
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="投稿フォームを閉じて地図に戻る"
            onPress={closePostForm}
            hitSlop={10}
            style={{ padding: 8 }}
          >
            <Text style={{ fontSize: 27, lineHeight: 30, color: '#526052' }}>×</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 36, gap: 15 }}>
          <View style={{ backgroundColor: '#EAF4E9', borderRadius: 10, padding: 13, gap: 5 }}>
            <Text style={{ color: '#287A3B', fontSize: 12, fontWeight: 'bold' }}>投稿先の店舗</Text>
            <Text style={{ color: '#243024', fontSize: 16, fontWeight: 'bold' }}>
              {selectedStore?.name ?? '店舗が選択されていません'}
            </Text>
            <Text style={{ color: '#596659', fontSize: 13 }}>
              {selectedStore?.address ?? (unregisteredLocation ? `地図上の位置：${unregisteredLocation.latitude.toFixed(5)}, ${unregisteredLocation.longitude.toFixed(5)}` : '')}
            </Text>
          </View>

          <View style={{ gap: 7 }}>
            <Text style={{ fontWeight: 'bold', color: '#243024' }}>商品名 *</Text>
            <TextInput
              value={productName}
              onChangeText={(value) => { setProductName(value); setShowPreviewMessage(false); }}
              placeholder="例：お弁当"
              style={inputStyle}
            />
          </View>

          <View style={{ gap: 7 }}>
            <Text style={{ fontWeight: 'bold', color: '#243024' }}>通常価格（円） *</Text>
            <TextInput
              value={originalPrice}
              onChangeText={(value) => { setOriginalPrice(value.replace(/[^0-9]/g, '')); setShowPreviewMessage(false); }}
              placeholder="例：600"
              keyboardType="number-pad"
              style={inputStyle}
            />
          </View>

          <View style={{ gap: 7 }}>
            <Text style={{ fontWeight: 'bold', color: '#243024' }}>値引き価格（円） *</Text>
            <TextInput
              value={discountPrice}
              onChangeText={(value) => { setDiscountPrice(value.replace(/[^0-9]/g, '')); setShowPreviewMessage(false); }}
              placeholder="例：300"
              keyboardType="number-pad"
              style={inputStyle}
            />
          </View>

          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 13, borderWidth: 1, borderColor: '#E1E7DF' }}>
            <Text style={{ color: '#596659', fontSize: 13 }}>割引率（自動計算）</Text>
            <Text style={{ color: '#D94B43', fontSize: 24, fontWeight: 'bold', marginTop: 3 }}>
              {discountRate === null ? '-- % OFF' : `${discountRate}% OFF`}
            </Text>
            {discountRate === null && originalPrice && discountPrice ? (
              <Text style={{ color: '#B34B42', fontSize: 12, marginTop: 3 }}>
                値引き価格は通常価格以下の金額を入力してください。
              </Text>
            ) : null}
          </View>

          <View style={{ gap: 7 }}>
            <Text style={{ fontWeight: 'bold', color: '#243024' }}>商品説明（任意）</Text>
            <TextInput
              value={description}
              onChangeText={(value) => { setDescription(value); setShowPreviewMessage(false); }}
              placeholder="商品の状態や消費期限など"
              multiline
              textAlignVertical="top"
              style={{ ...inputStyle, minHeight: 105 }}
            />
          </View>

          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 13, gap: 5 }}>
            <Text style={{ fontWeight: 'bold', color: '#243024' }}>商品写真</Text>
            <Text style={{ color: '#687368', fontSize: 13 }}>
              写真の追加機能は今後実装予定です。
            </Text>
          </View>

          <Pressable
            onPress={savePost}
            disabled={isSaving}
            style={{
              backgroundColor: '#35A853',
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
              opacity: productName.trim() && originalPrice && discountPrice && discountRate !== null && !isSaving ? 1 : 0.55,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>
              {isSaving ? '投稿中...' : '投稿する'}
            </Text>
          </Pressable>

          {showPreviewMessage ? (
            <View style={{ backgroundColor: '#FFF6E5', borderRadius: 9, padding: 12, gap: 5 }}>
              <Text style={{ color: '#805A16', fontWeight: 'bold' }}>入力内容の確認</Text>
              <Text style={{ color: '#5F512F' }}>
                {productName.trim() && originalPrice && discountPrice && discountRate !== null
                  ? `${productName}：${originalPrice}円 → ${discountPrice}円（${discountRate}% OFF）`
                  : '商品名・通常価格・値引き価格を正しく入力してください。'}
              </Text>
            </View>
          ) : null}
          {saveMessage ? (
            <Text style={{ color: saveMessage.includes('保存しました') ? '#287A3B' : '#B34B42' }}>{saveMessage}</Text>
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
}
