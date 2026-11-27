import {
  getVegetableGuide,
  predictRipeness,
  type RipenessPrediction,
  type TouchFeel,
  type UsageTiming,
} from '@/photoservices/ripenessPredictor';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const USAGE_OPTIONS: { id: UsageTiming; label: string; hint: string }[] = [
  { id: 'today', label: '今日すぐ使う', hint: '食べごろ・完熟向き' },
  { id: 'tomorrow', label: '明日〜2日後', hint: '少し熟度が進む頃がベスト' },
  { id: 'later', label: '数日〜1週間後', hint: 'まだ青い・硬めが安心' },
];

const TOUCH_OPTIONS: { id: TouchFeel; label: string }[] = [
  { id: 'unknown', label: '未確認' },
  { id: 'firm_or_light', label: '硬め・軽め' },
  { id: 'balanced', label: '適度・普通' },
  { id: 'soft_or_heavy', label: '柔らかめ・重め' },
];

const SUGGESTED_VEGGIES = ['アボカド', 'トマト', 'バナナ', 'ピーマン', 'ナス'];

export default function PhotoScreen() {
  const router = useRouter();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [usageTiming, setUsageTiming] = useState<UsageTiming>('today');
  const [vegetableName, setVegetableName] = useState('');
  const [cookingNote, setCookingNote] = useState('');
  const [touchFeel, setTouchFeel] = useState<TouchFeel>('unknown');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<RipenessPrediction | null>(null);

  const trimmedVegetable = vegetableName.trim();
  const activeGuide = trimmedVegetable ? getVegetableGuide(trimmedVegetable) : null;

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
      setPrediction(null);
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
      setPrediction(null);
    }
  };

  // 熟度チェック実行
  const handleAnalyze = async () => {
    if (!imageUri) {
      Alert.alert('画像がありません', '先に写真を選ぶか撮影してください。');
      return;
    }

    setIsAnalyzing(true);
    setPrediction(null);
    try {
      const res = await predictRipeness({
        imageUri,
        vegetableName,
        usageTiming,
        touchFeel,
        cookingNote,
      });
      setPrediction(res);
    } catch (e) {
      console.warn(e);
      Alert.alert('判定エラー', '熟度チェック中にエラーが発生しました。');
    } finally {
      setIsAnalyzing(false);
    }
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
            <Text style={styles.title}>野菜の確認ポイントと熟し度チェック</Text>
            <Text style={styles.description}>
              食材ごとの確認ポイントを表で確認し、使う予定日や料理に合わせて写真から熟度を目安判定します。
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
                  onPress={() => {
                    setUsageTiming(opt.id);
                    setPrediction(null);
                  }}
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

        {/* 野菜の種類入力欄 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>何の食材ですか？</Text>
          <TextInput
            value={vegetableName}
            onChangeText={(text) => {
              setVegetableName(text);
              setPrediction(null);
            }}
            placeholder="例：アボカド、トマト、バナナ"
            placeholderTextColor="#99A399"
            style={styles.veggieInput}
            maxLength={30}
          />
          <View style={styles.chipRow}>
            {SUGGESTED_VEGGIES.map((veggie) => {
              const selected = trimmedVegetable === veggie;
              return (
                <Pressable
                  key={veggie}
                  onPress={() => {
                    setVegetableName(veggie);
                    setPrediction(null);
                  }}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {veggie}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 野菜入力・選択時に表示する確認ポイント表 */}
        {activeGuide ? (
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>{activeGuide.displayName} の確認ポイント表</Text>
            <Text style={styles.guideSummary}>{activeGuide.summary}</Text>

            <View style={styles.tableWrap}>
              {activeGuide.checklist.map((row) => (
                <View key={row.point} style={styles.tableRow}>
                  <Text style={styles.tablePoint}>{row.point}</Text>
                  <Text style={styles.tableGood}>よい目安：{row.goodSign}</Text>
                  <Text style={styles.tableCaution}>避けたい目安：{row.cautionSign}</Text>
                  <Text style={styles.tablePhotoNote}>写真での補足：{row.photoNote}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 料理・用途メモと手触り（任意） */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>どんな料理・用途で使いますか？（任意）</Text>
          <TextInput
            value={cookingNote}
            onChangeText={(text) => {
              setCookingNote(text);
              setPrediction(null);
            }}
            placeholder="例：サラダ、ポキ丼、ディップ、トマトソース"
            placeholderTextColor="#99A399"
            style={styles.veggieInput}
            maxLength={40}
          />

          <Text style={styles.subLabel}>手触り・重さの感覚（任意）</Text>
          <View style={styles.touchRow}>
            {TOUCH_OPTIONS.map((opt) => {
              const active = touchFeel === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    setTouchFeel(opt.id);
                    setPrediction(null);
                  }}
                  style={[styles.touchChip, active && styles.touchChipActive]}
                >
                  <Text style={[styles.touchChipText, active && styles.touchChipTextActive]}>
                    {opt.label}
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
              <Pressable
                onPress={() => {
                  setImageUri(null);
                  setPrediction(null);
                }}
                style={styles.clearImageButton}
              >
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
          disabled={!imageUri || isAnalyzing}
          style={[
            styles.analyzeBtn,
            (!imageUri || isAnalyzing) && styles.analyzeBtnDisabled,
          ]}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.analyzeBtnText}>熟し度をチェックする</Text>
          )}
        </Pressable>

        {prediction ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>
              {prediction.vegetableName}：{prediction.stageLabel}（スコア {prediction.ripenessScore}）
            </Text>
            <Text style={styles.resultMatch}>{prediction.matchLabel}</Text>
            <Text style={styles.resultText}>{prediction.advice}</Text>
            {prediction.debugInfo ? (
              <Text style={styles.debugText}>{prediction.debugInfo}</Text>
            ) : null}
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
  subLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3A473A',
    marginTop: 4,
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
  veggieInput: {
    borderWidth: 1,
    borderColor: '#D7DDD5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#243024',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DDD5',
  },
  chipSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  chipText: {
    fontSize: 13,
    color: '#4A554A',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7DDD5',
    padding: 14,
    gap: 10,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#243024',
  },
  guideSummary: {
    fontSize: 12,
    color: '#526052',
    lineHeight: 18,
  },
  tableWrap: {
    gap: 8,
  },
  tableRow: {
    backgroundColor: '#F7F9F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3E8E1',
    padding: 10,
    gap: 3,
  },
  tablePoint: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#243024',
  },
  tableGood: {
    fontSize: 12,
    color: '#1E5E2B',
    lineHeight: 17,
  },
  tableCaution: {
    fontSize: 12,
    color: '#8A3B12',
    lineHeight: 17,
  },
  tablePhotoNote: {
    fontSize: 11,
    color: '#5C695C',
    lineHeight: 16,
  },
  touchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  touchChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DDD5',
  },
  touchChipActive: {
    backgroundColor: '#35A853',
    borderColor: '#35A853',
  },
  touchChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A554A',
  },
  touchChipTextActive: {
    color: '#FFFFFF',
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
    gap: 6,
  },
  resultTitle: {
    color: '#1E5E2B',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resultMatch: {
    color: '#287A3B',
    fontSize: 13,
    fontWeight: 'bold',
  },
  resultText: {
    color: '#243024',
    fontSize: 14,
    lineHeight: 20,
  },
  debugText: {
    color: '#596659',
    fontSize: 12,
    marginTop: 2,
  },
});