//マイページ画面
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MyPageScreen() {
  const menuItems = [
    { id: 'photo', title:'写真で検索', icon:'image-outline', color:'#4A90E2', bg:'#EBF3FF' },
    { id: 'game' , title:'ゲーム'    , icon:'game-controller-outline', color:'#F5A623', bg:'#FFF7E6' },
    { id: 'help' , title:'ヘルプ'    , icon:'help-circle-outline', color:'#7ED321', bg:'#F4FCE3' },
    { id: 'info' , title:'情報を提供する', icon:'information-circle-outline', color:'#9013FE', bg:'#F8F0FF' },
  ];
return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ユーザープロフィールエリア */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#CCCCCC" />
        </View>
        <Text style={styles.userName}>ユーザー名</Text>
        <Text style={styles.userSubText}>user@example.com</Text>

        {/* ポイント表示 */}
        <View style={styles.pointContainer}>
          <Ionicons name="ribbon-outline" size={20} color="#FFD700" />
          <Text style={styles.pointLabel}>保有ポイント:</Text>
          <Text style={styles.pointValue}>1,250 pt</Text>
        </View>
      </View>

      {/* メニューカード一覧（2列×自動折り返し） */}
      <View style={styles.menuGrid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuCard, { backgroundColor: item.bg }]}
            activeOpacity={0.8}
            onPress={() => console.log(`${item.title}が押されました`)}
          >
            <Ionicons name={item.icon as any} size={36} color={item.color} style={styles.menuIcon} />
            <Text style={styles.menuTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 40,
  },
  profileCard:{
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userSubText: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 16,
  },
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFF9F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  pointLabel: {
    fontSize: 14,
    color: '#666666',
  },
  pointValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D48800',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  menuCard: {
    width: '48%',//1行に２つ並ぶサイズ（約48%*2 +　隙間）に
    aspectRatio: 3/4,//縦横比を3:4に固定
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,//下の隙間
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuIcon: {
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
