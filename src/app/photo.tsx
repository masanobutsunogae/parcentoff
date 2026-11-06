import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function PhotoScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="image-outline" size={64} color="#4A90E2" style={styles.icon} />
      <Text style={styles.title}>写真で野菜の熟し度をチェック</Text>
      <Text style={styles.description}>
        カメラを使用して野菜の熟し度合いを測ります。{'\n'}
        使う料理や使う予定の日に合わせて、もっとも適切な熟度の野菜を見つけることができる機能です。
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