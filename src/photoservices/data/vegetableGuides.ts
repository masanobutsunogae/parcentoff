// data/vegetableGuides.ts

export type NormalizedVegetable = 'tomato' | 'avocado' | 'banana' | 'generic';

export type RipenessChecklistRow = {
  point: string;
  goodSign: string;
  cautionSign: string;
  photoNote: string;
};

export type VegetableGuide = {
  vegetableKey: NormalizedVegetable;
  displayName: string;
  summary: string;
  checklist: RipenessChecklistRow[];
};

export type VegetableGuideConfig = {
  key: NormalizedVegetable;
  keywords: string[];
  displayName: string;
  summary: string;
  checklist: RipenessChecklistRow[];
};

export const VEGETABLE_GUIDES: Record<NormalizedVegetable, VegetableGuideConfig> = {
  avocado: {
    key: 'avocado',
    keywords: ['アボカド', 'avocado'],
    displayName: 'アボカド',
    summary:
      '深緑〜黒褐色の皮色、ヘタの密着感、表面の張り、軽い弾力を確認し、使う予定日や料理に合わせて選びやすくします。',
    checklist: [
      {
        point: '1. 皮の色',
        goodSign: '深緑〜黒褐色の食べごろ寄り（追熟狙いなら緑〜深緑）',
        cautionSign: '緑が明るすぎて未熟、または真っ黒で熟度が進みすぎ',
        photoNote: '照明の色温度で黒っぽく見えることがあるため、明るさや色味を補助目安にします。',
      },
      {
        point: '2. ヘタの状態',
        goodSign: 'ヘタが浮き気味〜密着しており、隙間や変色が少ない',
        cautionSign: 'ヘタが取れて隙間がある、黒ずみ・変色やカビがある',
        photoNote: '写り方や角度によっては隙間や内部変色が隠れる場合があります。',
      },
      {
        point: '3. 表面の張り',
        goodSign: 'ツルツルして張りがあり、極端な凹凸や傷がない',
        cautionSign: '強いシワやへこみ、乾燥・傷みが目立つ',
        photoNote: '影やピントの具合によって表面の質感が変わりやすいです。',
      },
      {
        point: '4. 弾力（手触り）',
        goodSign: '軽く押してわずかな弾力がある（食べごろ）',
        cautionSign: 'カチカチに硬い（未熟）、ブヨブヨに柔らかい（過熟）',
        photoNote: '写真だけでは測れないため、手触り入力や使う予定日と合わせて判断します。',
      },
    ],
  },
  tomato: {
    key: 'tomato',
    keywords: ['トマト', 'tomato'],
    displayName: 'トマト',
    summary:
      '赤みの回り具合、ヘタの鮮度、形の丸み、重さ・白い筋を確認し、用途や予定日に合う熟度を見極めます。',
    checklist: [
      {
        point: '1. 色（熟度・甘み）',
        goodSign: '皮まで赤みが回り、鮮やかな赤〜オレンジ赤になっている',
        cautionSign: '緑・黄緑が大部分を占める、または傷み色や変色がある',
        photoNote: '赤みと緑みの比率から熟度スコアを推定します。照明の色温度に注意してください。',
      },
      {
        point: '2. ヘタ（鮮度）',
        goodSign: '緑色が濃く、ピンとしてハリがある',
        cautionSign: '乾燥して茶色くなっている、または萎れている',
        photoNote: '撮影角度やヘタの有無によって見え方が変わります。',
      },
      {
        point: '3. 形（身の詰まり）',
        goodSign: '丸みがあり均整が取れている',
        cautionSign: '極端にいびつ・変形している（内部に空洞がある場合も）',
        photoNote: '輪郭や縦横比の目安として扱います。',
      },
      {
        point: '4. 重さ・白い筋',
        goodSign: '見た目より重みがあり、底面に放射状の白い筋が見える',
        cautionSign: '見た目に対して軽い、または底面が傷んでいる',
        photoNote: '重さは写真単体では測れないため、手触りや補足情報と組み合わせて確認します。',
      },
    ],
  },
  banana:{
    key: 'banana',
    keywords: ['バナナ','banana'],
    displayName: 'バナナ',
    summary:
        'シュガースポットの広がり具合、形や色合い、房の位置、茎の状態を確認し、用途や予定日に合う熟度を見極めます。',
    checklist: [
        {
        point: '1.シュガースポット',
        goodSign: '皮に茶褐色の斑点が現れていると完熟の証。',
        cautionSign: '全体に広がって黒ずんでいる。',
        photoNote: '全体にどの程度斑点がちらばっているかを基準にします。'
        },
    ],
  },
  generic: {
    key: 'generic',
    keywords: [],
    displayName: '野菜',
    summary: '色・表面の状態・使う予定日を組み合わせて目安を確認します。',
    checklist: [
      {
        point: '色・ツヤ',
        goodSign: '食材本来の熟度に合った色づきとツヤがある',
        cautionSign: '変色・くすみ・褐変が強い',
        photoNote: 'まずは参考目安として色味と明るさから状態を推定します。',
      },
      {
        point: '表面・形',
        goodSign: '傷やシワが少なく、形が整っている',
        cautionSign: 'へこみ・潰れ・乾燥が目立つ',
        photoNote: '撮影角度や照明条件によって見え方が変わります。',
      },
    ],
  },
};