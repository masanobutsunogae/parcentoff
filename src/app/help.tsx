import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="help-circle-outline" size={64} color="#7ED321" style={styles.icon} />
      <Text style={styles.title}>アプリの使い方</Text>
      <Text style={styles.description}>
        ここではアプリの基本的な使い方や操作手順を表示します。{'\n'}
        困ったときのFAQやガイドを確認できるページです。
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