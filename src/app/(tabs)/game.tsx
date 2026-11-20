import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePoints } from '@/context/PointContext';

const PLAY_COST = 100; // 1回遊ぶのに必要なポイント

// 仮のゲーム結果（あとで育成やミニゲームに差し替え可能）
const REWARDS = [
  '🌟 レア：フードロス救世主バッジ！',
  '🥬 野菜マスターの称号をゲット！',
  '🍎 りんごスタンプをゲット！',
  '🌱 エコな芽がぐんぐん育った！',
];

export default function GameScreen() {
  const { points, spendPoints } = usePoints();
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const handlePlay = () => {
    const success = spendPoints(PLAY_COST);

    if (!success) {
      setIsError(true);
      setMessage(`ポイントが足りません（あと ${PLAY_COST - points} pt 必要です）`);
      return;
    }

    // 消費成功時の処理（今はランダムで結果を表示）
    const randomReward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    setIsError(false);
    setMessage(`${PLAY_COST} pt 使ってプレイしました！\n結果：${randomReward}`);
  };

  return (
    <View style={styles.container}>
      {/* 保有ポイント表示 */}
      <View style={styles.pointBadge}>
        <Ionicons name="ribbon-outline" size={20} color="#FFD700" />
        <Text style={styles.pointText}>保有ポイント: {points.toLocaleString()} pt</Text>
      </View>

      <Ionicons name="game-controller-outline" size={64} color="#F5A623" style={styles.icon} />
      <Text style={styles.title}>ポイントで遊べるゲーム</Text>
      <Text style={styles.description}>
        情報提供や割引品の購入で貯めたポイントを使って{'\n'}
        ミニゲームに挑戦しよう！
      </Text>

      {/* プレイボタン */}
      <TouchableOpacity
        style={[styles.playButton, points < PLAY_COST && styles.playButtonDisabled]}
        onPress={handlePlay}
        activeOpacity={0.8}
      >
        <Text style={styles.playButtonText}>{PLAY_COST} pt 使ってプレイする</Text>
      </TouchableOpacity>

      {/* 結果・エラー表示エリア */}
      {message !== '' && (
        <View style={[styles.resultBox, isError && styles.errorBox]}>
          <Text style={[styles.resultText, isError && styles.errorText]}>{message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9F5',
  },
  pointBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pointText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D48800',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  playButton: {
    backgroundColor: '#F5A623',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  errorBox: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
  },
  resultText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  errorText: {
    color: '#C53030',
  },
});