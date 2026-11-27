import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ▼ 1. 「基本的な使い方」の内容（ここを自由に書き換えてください）
const GUIDE_ITEMS = [
  {
    step: 'STEP 1',
    icon: 'image-outline' as const,
    color: '#4A90E2',
    title: '写真で検索する',
    description: 'マイページの「写真で検索」から写真を撮影・選択すると、関連する情報を探せます。',
  },
  {
    step: 'STEP 2',
    icon: 'game-controller-outline' as const,
    color: '#F5A623',
    title: 'ゲームでポイントを貯める',
    description: 'アプリ内のゲームをプレイするとポイントが貯まります。貯まったポイントはマイページで確認できます。',
  },
  {
    step: 'STEP 3',
    icon: 'information-circle-outline' as const,
    color: '#9013FE',
    title: '情報を提供する',
    description: '新しい情報やお得な情報を見つけたときは、「情報を提供する」から投稿できます。',
  },
  {
    step: 'STEP 4',
    icon: 'map-outline' as const,
    color: '#7ED321',
    title: '割引品を買ってフードロスに貢献',
    description: '地図の割引情報から、実際に行って割引品を購入し、フードロスに貢献しよう。',
  },
];

// ▼ 2. 「よくある質問（FAQ）」の内容（ここを自由に書き換えてください）
const FAQ_ITEMS = [
  {
    q: 'ポイントに有効期限はありますか？',
    a: '現在、獲得したポイントに有効期限はありません。',
  },
  {
    q: '写真検索がうまく反応しません',
    a: '明るい場所で対象物がはっきり写るように撮影し、再度お試しください。',
  },
];

export default function HelpScreen() {
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/mypage');
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* 上部の戻るバー */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>マイページ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* 上部の見出しエリア */}
        <View style={styles.header}>
          <Ionicons name="help-circle-outline" size={64} color="#7ED321" style={styles.icon} />
          <Text style={styles.title}>アプリの使い方</Text>
          <Text style={styles.description}>
            アプリの基本的な操作手順や、{'\n'}
            よくある質問をまとめています。
          </Text>
        </View>

        {/* 基本的な使い方セクション */}
        <Text style={styles.sectionTitle}>基本的な使い方</Text>
        {GUIDE_ITEMS.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name={item.icon} size={22} color={item.color} />
              <Text style={[styles.stepBadge, { color: item.color }]}>{item.step}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <Text style={styles.cardText}>{item.description}</Text>
          </View>
        ))}

        {/* よくある質問セクション */}
        <Text style={styles.sectionTitle}>よくある質問（FAQ）</Text>
        {FAQ_ITEMS.map((faq, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.questionText}>Q. {faq.q}</Text>
            <Text style={styles.answerText}>A. {faq.a}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F9F5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  stepBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
  },
  questionText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  answerText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
  },
});