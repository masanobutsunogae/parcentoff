import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="game-controller-outline" size={64} color="#F5A623" style={styles.icon} />
      <Text style={styles.title}>ポイントがたまるゲーム</Text>
      <Text style={styles.description}>
        アプリ内で遊んでポイントがたまるミニゲームを準備中です！{'\n'}
        どのような内容にするかは現在検討中です。お楽しみに！
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F9F5' },
  icon: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12, textAlign: 'center' },
  description: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 },
});