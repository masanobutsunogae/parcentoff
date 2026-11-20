import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type UsageTiming = 'today' | 'tomorrow' | 'later';

const USAGE_OPTIONS: { id: UsageTiming; label: string; hint: string }[] = [
  { id: 'today', label: '今日すぐ使う', hint: '食べごろ・完熟向き' },
  { id: 'tomorrow', label: '明日〜2日後', hint: '少し熟度が進む頃がベスト' },
  { id: 'later', label: '数日〜1週間後', hint: 'まだ青い・硬めが安心' },
];

export default function PhotoScreen() {
  const router = useRouter();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [usageTiming, setUsageTiming] = useState<UsageTiming>('today');
  const [resultText, setResultText] = useState<string | null>(null);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/mypage' as any);
    }
  };

  // アルバム・ファイルから画像を取り込む
  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (Platform.OS !== 'web' && !permission.granted) {
      Alert.alert(
        '権限が必要です',
        '写真を選ぶにはフォトライブラリへのアクセス許可が必要です。'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setResultText(null);
    }
  };

  // カメラで撮影して画像を取り込む
  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'ブラウザでの撮影について',
        '端末カメラを使う場合は実機/エミュレータをお試しください。ブラウザからは画像ファイルを選択できます。',
        [{ text: '画像を選ぶ', onPress: pickFromLibrary }, { text: '閉じる' }]
      );
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        '権限が必要です',
        '撮影するにはカメラへのアクセス許可が必要です。'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setResultText(null);
    }
  };

  // 熟度チェック実行（仮判定）
  const handleAnalyze = () => {
    if (!imageUri) {
      Alert.alert('画像がありません', '先に写真を選ぶか撮影してください。');
      return;
    }

    const selectedOption = USAGE_OPTIONS.find((opt) => opt.id === usageTiming);
    setResultText(
      `判定（仮）：画像を取り込みました。「${selectedOption?.label}」用途としてチェック完了です。`
    );
  };

  return (
    <View style={styles.container}>
      {/* 右上に×を表示するヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>写真で熟し度チェック</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="熟し度チェック画面を閉じてマイページに戻る"
          onPress={handleClose}
          hitSlop={10}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* 概要カード */}
        <View style={styles.introCard}>
          <Ionicons name="image-outline" size={32} color="#4A90E2" />
          <View style={styles.introTextWrap}>
            <Text style={styles.title}>写真で野菜の熟し度をチェック</Text>
            <Text style={styles.description}>
              使う料理や予定日に合わせて、適切な熟度の野菜を見極めやすくします。
            </Text>
          </View>
        </View>

        {/* 使うタイミング選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>いつ使う予定ですか？</Text>
          <View style={styles.optionList}>
            {USAGE_OPTIONS.map((opt) => {
              const active = usageTiming === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setUsageTiming(opt.id)}
                  style={[styles.optionCard, active && styles.optionCardActive]}
                >
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={[styles.optionHint, active && styles.optionHintActive]}>
                    {opt.hint}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 画像プレビューエリア */}
        <View style={styles.previewBox}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              <Pressable onPress={() => setImageUri(null)} style={styles.clearImageButton}>
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                <Text style={styles.clearImageText}>画像をクリア</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.placeholderWrap}>
              <Ionicons name="camera-outline" size={44} color="#8A998A" />
              <Text style={styles.placeholderText}>
                まだ画像が選択されていません
              </Text>
            </View>
          )}
        </View>

        {/* 取り込みボタン群 */}
        <View style={styles.buttonRow}>
          <Pressable onPress={pickFromLibrary} style={[styles.actionBtn, styles.libraryBtn]}>
            <Ionicons name="images-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>写真を選ぶ</Text>
          </Pressable>

          <Pressable onPress={takePhoto} style={[styles.actionBtn, styles.cameraBtn]}>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>カメラで撮る</Text>
          </Pressable>
        </View>

        {/* チェック実行ボタン */}
        <Pressable
          onPress={handleAnalyze}
          style={[styles.analyzeBtn, !imageUri && styles.analyzeBtnDisabled]}
        >
          <Text style={styles.analyzeBtnText}>熟し度をチェックする</Text>
        </Pressable>

        {resultText ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{resultText}</Text>
          </View>
        ) : null}
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
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E3E8E1',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#243024',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 27,
    lineHeight: 30,
    color: '#526052',
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40,
    gap: 16,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EBF3FF',
    borderRadius: 14,
    padding: 14,
  },
  introTextWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#243024',
  },
  description: {
    fontSize: 13,
    color: '#4A5868',
    lineHeight: 19,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#243024',
  },
  optionList: {
    flexDirection: 'row',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DDD5',
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  optionCardActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#243024',
  },
  optionLabelActive: {
    color: '#FFFFFF',
  },
  optionHint: {
    fontSize: 11,
    color: '#687368',
  },
  optionHintActive: {
    color: '#EBF3FF',
  },
  previewBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCE2DA',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  clearImageButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholderWrap: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#687368',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  libraryBtn: {
    backgroundColor: '#4A90E2',
  },
  cameraBtn: {
    backgroundColor: '#35A853',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  analyzeBtn: {
    backgroundColor: '#243024',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyzeBtnDisabled: {
    opacity: 0.45,
  },
  analyzeBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  resultBox: {
    backgroundColor: '#EAF6EC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#B7DFC0',
  },
  resultText: {
    color: '#1E5E2B',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});