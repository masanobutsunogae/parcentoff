import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function InfoScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="information-circle-outline" size={64} color="#9013FE" style={styles.icon} />
      <Text style={styles.title}>情報提供の投稿ページ</Text>
      <Text style={styles.description}>
        新しい情報やおすすめの情報を投稿するためのページです。{'\n'}
        ここから写真やテキストを入力して送信できるように作成していく予定です。
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