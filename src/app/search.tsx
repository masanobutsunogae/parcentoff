// //検索画面(地図)

// import { StyleSheet, Text, View } from 'react-native';

// export default function SearchScreen() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>お店・商品を検索</Text>
//       <Text style={styles.description}>
//         地図から値引き商品を探せるようにしていきます。
//       </Text>
//       <View style={styles.mapPlaceholder}>
//         <Text style={styles.mapText}>ここに地図を表示します</Text>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F7F9F5',
//     padding: 20,
//     paddingTop: 55,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#263D2B',
//     marginBottom: 12,
//   },
//   description: {
//     fontSize: 14,
//     color: '#667366',
//     marginBottom: 20,
//   },
//   mapPlaceholder: {
//     flex: 1,
//     backgroundColor: '#E4EBDD',
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   mapText: {
//     color: '#536B54',
//     fontSize: 16,
//   },
// });
// 検索画面(地図)

// app/search.tsx のイメージ
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      {/* ヘッダーやタイトル部分 */}
      <View style={styles.header}>
        <Text style={styles.title}>お店・商品を検索</Text>
        <Text style={styles.description}>
          地図から値引き商品を探せます
        </Text>
      </View>

      {/* 地図コンポーネント */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 35.6812,
            longitude: 139.7671,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{ latitude: 35.6812, longitude: 139.7671 }}
            title="サンプルスーパー"
            description="値引き商品：お弁当 30%OFF"
          />
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F5',
  },
  header: {
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#263D2B',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#667366',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});