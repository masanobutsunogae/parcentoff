
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// 仮の商品データ
const posts = [
  {
    id: '1',
    name: 'お弁当',
    price: '298円',
    originalPrice: '498円',
    store: 'スーパーA',
    discount: '40% OFF',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
  },
  {
    id: '2',
    name: '焼きたてパンセット',
    price: '150円',
    originalPrice: '300円',
    store: 'パン屋B',
    discount: '50% OFF',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
  },
  {
    id: '3',
    name: '新鮮野菜セット',
    price: '200円',
    originalPrice: '350円',
    store: 'スーパーC',
    discount: '43% OFF',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.appName}>食品ロス削減アプリ</Text>
          <Text style={styles.subtitle}>
            お得に買って、食品ロスを減らそう！
          </Text>
        </View>

        {/* 検索欄 */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="商品やお店を検索"
            placeholderTextColor="#999"
          />
        </View>

        {/* メインメッセージ */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>
            今日のお得を見つけよう！
          </Text>
          <Text style={styles.bannerText}>
            近くのお店の割引情報をチェック
          </Text>
        </View>

        {/* 投稿一覧 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>新着のお得情報</Text>

          {posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postCard}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
              />

              <View style={styles.postInfo}>
                <Text style={styles.discount}>
                  {post.discount}
                </Text>

                <Text style={styles.productName}>
                  {post.name}
                </Text>

                <Text style={styles.storeName}>
                  📍 {post.store}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={styles.price}>
                    {post.price}
                  </Text>
                  <Text style={styles.originalPrice}>
                    {post.originalPrice}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>
          みんなで食品ロスを減らしましょう！
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 48,
    borderRadius: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  banner: {
    backgroundColor: '#E5F3DF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  bannerText: {
    fontSize: 13,
    color: '#527052',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  postCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
  },
  postImage: {
    width: 120,
    height: 140,
    backgroundColor: '#eee',
  },
  postInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  discount: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 13,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  storeName: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#E53935',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  footer: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 25,
    fontSize: 13,
  },
});
