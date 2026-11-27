// context/AvatarContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { ImageSourcePropType } from 'react-native';

export type AvatarCategory = 'buddy' | 'accessory' | 'snack' | 'bg';

export interface AvatarItem {
  id: string;
  category: AvatarCategory;
  name: string;
  description: string;
  cost: number; // 必要エコポイント（0は初期所持）
  emoji: string; // フェーズ1仮表示用
  image?: ImageSourcePropType; // フェーズ3画像差し替え用
  colorHex?: string; // 背景カテゴリ用カラーコード
}

export interface AvatarSelection {
  buddyId: string;
  accessoryId: string | null;
  snackId: string | null;
  bgId: string;
}

export const AVATAR_ITEMS: AvatarItem[] = [
  // おともだち（生物のゆるキャラ）
  { id: 'buddy_chick', category: 'buddy', name: 'ぴよまる', description: 'お買い物についてくる小さなひよこ', cost: 0, emoji: '🐥' },
  { id: 'buddy_cat', category: 'buddy', name: 'みけねこ', description: '夕方の半額シールを見つける名人', cost: 100, emoji: '🐱' },
  { id: 'buddy_bear', category: 'buddy', name: 'こぐま', description: '残り物アレンジが得意な食いしん坊', cost: 200, emoji: '🐻' },
  { id: 'buddy_rabbit', category: 'buddy', name: 'うさぎ', description: '特売日のチラシチェックが日課', cost: 300, emoji: '🐰' },

  // 雑貨（身につけるもの）
  { id: 'acc_ribbon', category: 'accessory', name: 'チェックのリボン', description: 'お出かけ気分が上がる赤いリボン', cost: 60, emoji: '🎀' },
  { id: 'acc_basket', category: 'accessory', name: 'お買い物かご', description: 'エコバッグいらずの編みかご', cost: 80, emoji: '🧺' },
  { id: 'acc_hat', category: 'accessory', name: '麦わら帽子', description: 'マルシェへ行く日の定番', cost: 120, emoji: '👒' },
  { id: 'acc_apron', category: 'accessory', name: '王冠ブローチ', description: '節約達人のしるし', cost: 250, emoji: '👑' },

  // おやつ・小物
  { id: 'snack_onigiri', category: 'snack', name: '塩むすび', description: 'ほっと一息つく定番おやつ', cost: 50, emoji: '🍙' },
  { id: 'snack_apple', category: 'snack', name: '旬のりんご', description: 'シャキッと甘いおつとめ品', cost: 70, emoji: '🍎' },
  { id: 'snack_pudding', category: 'snack', name: '手作りプリン', description: '家事の合間のごほうび', cost: 110, emoji: '🍮' },
  { id: 'snack_tea', category: 'snack', name: 'ほっこりお茶', description: 'お気に入りの湯呑みセット', cost: 150, emoji: '🍵' },

  // はいけい（背景色）
  { id: 'bg_cream', category: 'bg', name: 'きなり', description: 'やさしいナチュラルカラー', cost: 0, emoji: '🌼', colorHex: '#FFF8E7' },
  { id: 'bg_mint', category: 'bg', name: 'わかくさ', description: 'すっきり爽やかなミント色', cost: 50, emoji: '🌿', colorHex: '#E6F5EC' },
  { id: 'bg_peach', category: 'bg', name: 'ももいろ', description: 'あたたかみのあるピンク', cost: 80, emoji: '🍑', colorHex: '#FCEBE9' },
  { id: 'bg_sky', category: 'bg', name: 'そらいろ', description: '晴れた日の朝のブルー', cost: 100, emoji: '☁️', colorHex: '#E8F3FC' },
];

interface AvatarContextValue {
  ownedIds: string[];
  selection: AvatarSelection;
  rescuedCount: number; // 救った食材数
  savedYen: number; // 節約お手伝い額（円）
  isOwned: (itemId: string) => boolean;
  unlockItem: (itemId: string) => void;
  selectItem: (item: AvatarItem) => void;
  clearCategory: (category: 'accessory' | 'snack') => void;
  addRescueRecord: (count: number, yen: number) => void;
}

const AvatarContext = createContext<AvatarContextValue | undefined>(undefined);

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 初期所持：めばえちゃん・きなり背景
  const [ownedIds, setOwnedIds] = useState<string[]>(['buddy_chick', 'bg_cream']);
  const [selection, setSelection] = useState<AvatarSelection>({
    buddyId: 'buddy_chick',
    accessoryId: null,
    snackId: null,
    bgId: 'bg_cream',
  });

  // 救済・節約実績（フェーズ2で投稿・レスキュー完了時に加算）
  const [rescuedCount, setRescuedCount] = useState<number>(0);
  const [savedYen, setSavedYen] = useState<number>(0);

  const isOwned = (itemId: string) => ownedIds.includes(itemId);

  const unlockItem = (itemId: string) => {
    setOwnedIds((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
  };

  const selectItem = (item: AvatarItem) => {
    setSelection((prev) => {
      switch (item.category) {
        case 'buddy':
          return { ...prev, buddyId: item.id };
        case 'accessory':
          return { ...prev, accessoryId: prev.accessoryId === item.id ? null : item.id };
        case 'snack':
          return { ...prev, snackId: prev.snackId === item.id ? null : item.id };
        case 'bg':
          return { ...prev, bgId: item.id };
      }
    });
  };

  const clearCategory = (category: 'accessory' | 'snack') => {
    setSelection((prev) => ({
      ...prev,
      ...(category === 'accessory' ? { accessoryId: null } : { snackId: null }),
    }));
  };

  const addRescueRecord = (count: number, yen: number) => {
    setRescuedCount((prev) => prev + Math.max(0, count));
    setSavedYen((prev) => prev + Math.max(0, yen));
  };

  const value = useMemo(
    () => ({
      ownedIds,
      selection,
      rescuedCount,
      savedYen,
      isOwned,
      unlockItem,
      selectItem,
      clearCategory,
      addRescueRecord,
    }),
    [ownedIds, selection, rescuedCount, savedYen]
  );

  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>;
};

export const useAvatar = () => {
  const ctx = useContext(AvatarContext);
  if (!ctx) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return ctx;
};