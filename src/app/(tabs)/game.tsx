// GameScreen.tsx（または app/(tabs)/game.tsx）
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePoints } from '@/context/PointContext';
import {
  AVATAR_ITEMS,
  AvatarCategory,
  AvatarItem,
  useAvatar,
} from '@/context/AvatarContext';
import { BuddyCharacter } from '@/components/BuddyCharacter';

const CATEGORY_TABS: { key: AvatarCategory; label: string }[] = [
  { key: 'buddy', label: 'おともだち' },
  { key: 'accessory', label: '雑貨' },
  { key: 'snack', label: 'おやつ' },
  { key: 'bg', label: 'はいけい' },
];

export default function GameScreen() {
  const { points, spendPoints } = usePoints();
  const {
    selection,
    rescuedCount,
    savedYen,
    isOwned,
    unlockItem,
    selectItem,
  } = useAvatar();

  const [activeTab, setActiveTab] = useState<AvatarCategory>('buddy');
  const [confirmItem, setConfirmItem] = useState<AvatarItem | null>(null);
  const [eatTrigger, setEatTrigger] = useState(0); 

  const currentBuddy =
    AVATAR_ITEMS.find((i) => i.id === selection.buddyId) ?? AVATAR_ITEMS[0];
  const currentBg = AVATAR_ITEMS.find((i) => i.id === selection.bgId);
  const currentSnack = selection.snackId
    ? AVATAR_ITEMS.find((i) => i.id === selection.snackId)
    : undefined;

  const isSelected = (item: AvatarItem) => {
    switch (item.category) {
      case 'buddy':
        return selection.buddyId === item.id;
      case 'accessory':
        return selection.accessoryId === item.id;
      case 'snack':
        return selection.snackId === item.id;
      case 'bg':
        return selection.bgId === item.id;
    }
  };

  const handlePressItem = (item: AvatarItem) => {
    if (isOwned(item.id)) {
      selectItem(item);
      return;
    }
    setConfirmItem(item);
  };

  const handleConfirmPurchase = () => {
    if (!confirmItem) return;
    const success = spendPoints(confirmItem.cost);
    if (success) {
      unlockItem(confirmItem.id);
      selectItem(confirmItem);
    }
    setConfirmItem(null);
  };

  const filteredItems = AVATAR_ITEMS.filter((item) => item.category === activeTab);
  const canAfford = confirmItem ? points >= confirmItem.cost : false;
  const actionWord = confirmItem?.category === 'buddy' ? 'お迎え' : '交換';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* ① 左右いっぱいの「おへやステージ」（タップでおやつをもぐもぐ） */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => {
            if (selection.snackId) {
              setEatTrigger((prev) => prev + 1);
            }
          }}
          style={[
            styles.stageCard,
            { backgroundColor: currentBg?.colorHex ?? '#FFF8E7' },
          ]}
        >
          {/* 左上：おともだち名タグ */}
          <View style={styles.nameTag}>
            <Text style={styles.nameTagText}>{currentBuddy.name}</Text>
          </View>

          {/* 右上：おやつ装備中のタップヒント */}
          {currentSnack && (
            <View style={styles.snackTag}>
              <Text style={styles.snackTagText}>
                {currentSnack.emoji} タップでもぐもぐ
              </Text>
            </View>
          )}

          {/* 床（地面）エリア */}
          <View style={styles.stageFloor} />

          {/* 全身キャラクター（右手に持っておやつを食べる） */}
          <View style={styles.stageCharacterRow}>
            <BuddyCharacter
              buddyId={selection.buddyId}
              accessoryId={selection.accessoryId}
              snackId={selection.snackId}
              size={168}
              animated
              eatTrigger={eatTrigger}
            />
          </View>
        </TouchableOpacity>

        {/* ② ステージの下：保有エコポイント＆救済・節約実績 */}
        <View style={styles.statsCard}>
          <View style={styles.pointRow}>
            <Text style={styles.pointLabel}>保有エコポイント</Text>
            <Text style={styles.pointValue}>{points.toLocaleString()} pt</Text>
          </View>

          <View style={styles.contributionRow}>
            <View style={styles.contributionBox}>
              <Text style={styles.contributionTitle}>救った食材</Text>
              <Text style={styles.contributionNumber}>{rescuedCount} 個</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.contributionBox}>
              <Text style={styles.contributionTitle}>節約お手伝い額</Text>
              <Text style={styles.contributionNumber}>
                {savedYen.toLocaleString()} 円
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.hintText}>
          おともだち・雑貨・おやつ・はいけいを組み合わせて、マイページや投稿アイコンをおめかしできます。
        </Text>

        {/* ③ カテゴリ切り替えタブ */}
        <View style={styles.tabRow}>
          {CATEGORY_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, active && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ④ アイテム一覧グリッド */}
        <View style={styles.grid}>
          {filteredItems.map((item) => {
            const owned = isOwned(item.id);
            const selected = isSelected(item);

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemCard,
                  selected && styles.itemCardSelected,
                ]}
                onPress={() => handlePressItem(item)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.previewCircle,
                    item.colorHex ? { backgroundColor: item.colorHex } : null,
                  ]}
                >
                  {item.category === 'buddy' ? (
                    <BuddyCharacter buddyId={item.id} size={58} />
                  ) : (
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  )}
                </View>

                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    selected
                      ? styles.statusSelected
                      : owned
                      ? styles.statusOwned
                      : styles.statusLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      selected && styles.statusTextSelected,
                    ]}
                  >
                    {selected
                      ? 'おめかし中'
                      : owned
                      ? 'お迎え済み'
                      : `${item.cost} pt`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 購入・交換確認モーダル */}
      <Modal
        visible={confirmItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {confirmItem && (
              <>
                <View
                  style={[
                    styles.modalPreview,
                    confirmItem.colorHex
                      ? { backgroundColor: confirmItem.colorHex }
                      : null,
                  ]}
                >
                  {confirmItem.category === 'buddy' ? (
                    <BuddyCharacter buddyId={confirmItem.id} size={74} />
                  ) : (
                    <Text style={styles.modalEmoji}>{confirmItem.emoji}</Text>
                  )}
                </View>

                <Text style={styles.modalTitle}>
                  {canAfford
                    ? `${confirmItem.name}を${actionWord}しますか？`
                    : 'エコポイントがもう少しです'}
                </Text>

                <Text style={styles.modalMessage}>
                  {canAfford
                    ? `${confirmItem.cost} エコポイントを使ってアイコンに設定します。\n（残り：${(points - confirmItem.cost).toLocaleString()} pt）`
                    : `「${confirmItem.name}」には ${confirmItem.cost} pt 必要です。\n見切り品情報の投稿や活用でエコポイントを貯めましょう！`}
                </Text>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setConfirmItem(null)}
                  >
                    <Text style={styles.modalCancelText}>
                      {canAfford ? 'やめる' : '閉じる'}
                    </Text>
                  </TouchableOpacity>

                  {canAfford && (
                    <TouchableOpacity
                      style={styles.modalConfirmButton}
                      onPress={handleConfirmPurchase}
                    >
                      <Text style={styles.modalConfirmText}>
                        {actionWord}する
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  // 左右いっぱいの全身表示ステージ
  stageCard: {
    width: '100%',
    height: 230,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EADBC8',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 18,
    position: 'relative',
  },
  nameTag: {
    position: 'absolute',
    top: 12,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  nameTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A3B2C',
  },
  snackTag: {
   position: 'absolute',
   top: 12,
   right: 14,
   backgroundColor: 'rgba(255, 255, 255, 0.88)',
   paddingHorizontal: 10,
   paddingVertical: 5,
   borderRadius: 999,
   borderWidth: 1,
   borderColor: '#EADBC8',
 },
 snackTagText: {
   fontSize: 11,
   fontWeight: '600',
   color: '#7A5C38',
},
  stageFloor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(210, 190, 165, 0.35)',
  },
  stageCharacterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  snackOnFloor: {
    marginLeft: -4,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EADBC8',
  },
  snackEmoji: {
    fontSize: 24,
  },
  // ステージ下のポイント＆実績カード
  statsCard: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE6D8',
    gap: 10,
  },
  pointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF5E4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pointLabel: {
    fontSize: 13,
    color: '#7A5C38',
    fontWeight: '600',
  },
  pointValue: {
    fontSize: 19,
    color: '#D97706',
    fontWeight: '700',
  },
  contributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6FAF7',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  contributionBox: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: '#DCE8DF',
  },
  contributionTitle: {
    fontSize: 12,
    color: '#52796F',
  },
  contributionNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F5D50',
    marginTop: 2,
  },
  hintText: {
    fontSize: 12,
    color: '#6B6257',
    marginTop: 12,
    marginBottom: 14,
    lineHeight: 18,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#EFEAE1',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#786E62',
  },
  tabTextActive: {
    color: '#2F5D50',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EFE6D8',
  },
  itemCardSelected: {
    borderColor: '#4A8B71',
    backgroundColor: '#F4FBF7',
  },
  previewCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A3228',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 11,
    color: '#7A7065',
    textAlign: 'center',
    lineHeight: 15,
    minHeight: 30,
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusSelected: {
    backgroundColor: '#4A8B71',
  },
  statusOwned: {
    backgroundColor: '#EFE6D8',
  },
  statusLocked: {
    backgroundColor: '#FFF3DC',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C4D3C',
  },
  statusTextSelected: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  modalPreview: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FAF5EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  modalEmoji: {
    fontSize: 38,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3A3228',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: '#6B6257',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#EFEAE1',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C4D3C',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#4A8B71',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});