//検索画面(地図)

import { StyleSheet, Text, View } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>お店・商品を検索</Text>
      <Text style={styles.description}>
        地図から値引き商品を探せるようにしていきます。
      </Text>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>ここに地図を表示します</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F5',
    padding: 20,
    paddingTop: 55,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#263D2B',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#667366',
    marginBottom: 20,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E4EBDD',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: '#536B54',
    fontSize: 16,
  },
});