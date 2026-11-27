// services/ripenessPredictor.ts
import {
  VEGETABLE_GUIDES,
  type NormalizedVegetable,
  type RipenessChecklistRow,
  type VegetableGuide,
} from '@/photoservices/data/vegetableGuides';
import { Platform } from 'react-native';

export type { NormalizedVegetable, RipenessChecklistRow, VegetableGuide };

export type UsageTiming = 'today' | 'tomorrow' | 'later';
export type RipenessStage = 'unripe' | 'ripe' | 'overripe';
export type TouchFeel = 'unknown' | 'firm_or_light' | 'balanced' | 'soft_or_heavy';

export type RipenessPrediction = {
  vegetableName: string;
  normalizedVegetable: NormalizedVegetable;
  isSupportedVegetable: boolean;
  usageTiming: UsageTiming;
  cookingNote?: string;
  touchFeel: TouchFeel;
  stage: RipenessStage;
  stageLabel: string;
  ripenessScore: number; // 0.0〜1.0
  matchLevel: 'best' | 'good' | 'caution';
  matchLabel: string;
  advice: string;
  checklist: RipenessChecklistRow[];
  debugInfo?: string;
};

type ImageStats = {
  avgR: number;
  avgG: number;
  avgB: number;
  redRatio: number;
  redGreenDiff: number;
  luminance: number;
};

export function normalizeVegetableName(rawName: string): NormalizedVegetable {
  const name = rawName.trim().toLowerCase();
  if (!name) return 'generic';

  for (const key of Object.keys(VEGETABLE_GUIDES) as NormalizedVegetable[]) {
    if (key === 'generic') continue;
    const matched = VEGETABLE_GUIDES[key].keywords.some((kw) =>
      name.includes(kw.toLowerCase())
    );
    if (matched) return key;
  }

  return 'generic';
}

export function getVegetableGuide(rawName: string): VegetableGuide {
  const vegetableKey = normalizeVegetableName(rawName);
  const config = VEGETABLE_GUIDES[vegetableKey];
  const trimmed = rawName.trim();

  return {
    vegetableKey,
    displayName: trimmed || config.displayName,
    summary: config.summary,
    checklist: config.checklist,
  };
}

async function extractImageStatsWeb(imageUri: string): Promise<ImageStats | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 96;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let weightedR = 0;
        let weightedG = 0;
        let weightedB = 0;
        let weightedRedRatio = 0;
        let weightedRedGreenDiff = 0;
        let weightedLuminance = 0;
        let totalWeight = 0;

        const center = (size - 1) / 2;
        const maxRadius = Math.hypot(center, center);

        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const idx = (y * size + x) * 4;
            if (data[idx + 3] < 128) continue;

            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            if (lum < 0.05 || lum > 0.97) continue;

            const dist = Math.hypot(x - center, y - center);
            const centerWeight = 1.4 - 0.7 * (dist / maxRadius);
            const sumRgb = Math.max(r + g + b, 1);

            weightedR += r * centerWeight;
            weightedG += g * centerWeight;
            weightedB += b * centerWeight;
            weightedRedRatio += (r / sumRgb) * centerWeight;
            weightedRedGreenDiff += ((r - g) / 255) * centerWeight;
            weightedLuminance += lum * centerWeight;
            totalWeight += centerWeight;
          }
        }

        if (totalWeight <= 0) {
          resolve(null);
          return;
        }

        resolve({
          avgR: weightedR / totalWeight,
          avgG: weightedG / totalWeight,
          avgB: weightedB / totalWeight,
          redRatio: weightedRedRatio / totalWeight,
          redGreenDiff: weightedRedGreenDiff / totalWeight,
          luminance: weightedLuminance / totalWeight,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUri;
  });
}

function scoreToAvocadoStage(score: number): {
  stage: RipenessStage;
  stageLabel: string;
} {
  if (score < 0.38) {
    return { stage: 'unripe', stageLabel: '未熟・緑寄り（追熟向き）' };
  }
  if (score > 0.74) {
    return { stage: 'overripe', stageLabel: '完熟〜熟度高め（黒褐色寄り）' };
  }
  return { stage: 'ripe', stageLabel: '食べごろ・適熟（深緑〜黒褐色）' };
}

function scoreToTomatoStage(score: number): {
  stage: RipenessStage;
  stageLabel: string;
} {
  if (score < 0.38) {
    return { stage: 'unripe', stageLabel: '未熟・緑寄り' };
  }
  if (score > 0.74) {
    return { stage: 'overripe', stageLabel: '完熟・赤み強め' };
  }
  return { stage: 'ripe', stageLabel: '食べごろ・赤み適熟' };
}

function buildTimingAdvice(params: {
  vegetableKey: NormalizedVegetable;
  stage: RipenessStage;
  usageTiming: UsageTiming;
  touchFeel: TouchFeel;
  cookingNote?: string;
}): {
  matchLevel: 'best' | 'good' | 'caution';
  matchLabel: string;
  advice: string;
} {
  const { vegetableKey, stage, usageTiming, touchFeel, cookingNote } = params;
  const trimmedNote = cookingNote?.trim();
  const noteText = trimmedNote ? `（「${trimmedNote}」用途も考慮して調整してください）` : '';

  let matchLevel: 'best' | 'good' | 'caution' = 'good';
  let matchLabel = '';
  let advice = '';

  if (usageTiming === 'today') {
    if (stage === 'ripe') {
      matchLevel = 'best';
      matchLabel = '今日すぐ使う予定に合いやすい状態です';
      advice =
        vegetableKey === 'avocado'
          ? `食べごろ寄りの目安です。生食・サラダ・丼などに使いやすく、ヘタの隙間や表面の張りもあわせて確認すると安心です。${noteText}`
          : `赤みがしっかり回った食べごろ寄りの状態です。生食やサラダなど今日の調理に合わせやすいです。${noteText}`;
    } else if (stage === 'overripe') {
      matchLevel = 'good';
      matchLabel = '今日中の消費が向いています';
      advice =
        vegetableKey === 'avocado'
          ? `熟度が進んでいる見え方のため、早めに使い切るのがおすすめです。ディップやソース、加熱調理などにも向きます。${noteText}`
          : `熟度が高めの見え方です。早めに使い切るか、ソース・スープ・炒め物など加熱調理にも向きます。${noteText}`;
    } else {
      matchLevel = 'caution';
      matchLabel = '今日すぐ使うには少し早いかもしれません';
      advice =
        vegetableKey === 'avocado'
          ? `緑み・若さが残る見え方です。硬さが強い場合は今日すぐよりも追熟を待つ方が風味や食感が出やすくなります。${noteText}`
          : `未熟寄りの見え方のため、今日すぐ使う場合は酸味や硬さを見ながら調理法を調整してください。${noteText}`;
    }
  } else if (usageTiming === 'tomorrow') {
    if (stage === 'ripe' || stage === 'unripe') {
      matchLevel = 'best';
      matchLabel = '明日〜2日後の予定に合わせやすい状態です';
      advice = `1〜2日後の使用を見据えやすい状態です。少し若め・硬めなら室温で様子を見て、食べごろに近づいたら保存温度を調整してください。${noteText}`;
    } else {
      matchLevel = 'caution';
      matchLabel = '1〜2日待つと熟しすぎる可能性があります';
      advice = `熟度が高めの見え方なので、明日以降まで置く場合は傷みや柔らかさ・変色を確認しながら早めに使ってください。${noteText}`;
    }
  } else {
    if (stage === 'unripe') {
      matchLevel = 'best';
      matchLabel = '数日〜1週間後の予定に向いています';
      advice = `若め・追熟の余地がある見え方のため、数日〜1週間後の調理日に合わせて状態を育てやすいです。${noteText}`;
    } else if (stage === 'ripe') {
      matchLevel = 'good';
      matchLabel = '数日後まで置くなら保存調整がおすすめです';
      advice = `食べごろに近い状態なので、数日〜1週間後まで使う場合は低温保存や早めの下処理も検討してください。${noteText}`;
    } else {
      matchLevel = 'caution';
      matchLabel = '数日〜1週間後まで待つには不向きな可能性があります';
      advice = `熟度高めの見え方のため、数日以上置くと柔らかくなりすぎたり傷んだりするおそれがあります。${noteText}`;
    }
  }

  if (touchFeel === 'soft_or_heavy' && stage !== 'overripe') {
    advice +=
      vegetableKey === 'avocado'
        ? ' 手触りが柔らかめなら、見た目以上に熟度が進んでいる可能性があるため早めの使用が安心です。'
        : ' 手触りや重さの感覚も踏まえ、柔らかさや傷みがないか確認しながら使ってください。';
  } else if (touchFeel === 'firm_or_light' && stage === 'ripe') {
    advice +=
      vegetableKey === 'avocado'
        ? ' まだしっかり硬い手触りがある場合は、数日かけて追熟させると食べごろに近づきます。'
        : ' 軽さや硬さが気になる場合は、中身の状態や追熟の余地もあわせて確認してください。';
  }

  return { matchLevel, matchLabel, advice };
}

async function predictAvocadoRipeness(params: {
  imageUri: string;
  usageTiming: UsageTiming;
  touchFeel: TouchFeel;
  cookingNote?: string;
}) {
  const stats = await extractImageStatsWeb(params.imageUri);

  let ripenessScore = 0.55;
  let debugInfo = 'アボカド基準（既定値: 0.55）';

  if (stats) {
    const darkNorm = Math.min(1, Math.max(0, (0.62 - stats.luminance) / 0.42));
    const rgShift = Math.min(1, Math.max(0, (-stats.redGreenDiff + 0.08) / 0.25));
    const combined = 0.65 * darkNorm + 0.35 * rgShift;

    ripenessScore = Number((0.12 + combined * 0.82).toFixed(2));
    debugInfo = `アボカド特徴 [輝度:${stats.luminance.toFixed(2)} | R-G:${stats.redGreenDiff.toFixed(2)} | R比:${stats.redRatio.toFixed(2)}]`;
  }

  const { stage, stageLabel } = scoreToAvocadoStage(ripenessScore);
  const timing = buildTimingAdvice({
    vegetableKey: 'avocado',
    stage,
    usageTiming: params.usageTiming,
    touchFeel: params.touchFeel,
    cookingNote: params.cookingNote,
  });

  return {
    stage,
    stageLabel,
    ripenessScore,
    matchLevel: timing.matchLevel,
    matchLabel: timing.matchLabel,
    advice: timing.advice,
    debugInfo,
  };
}

async function predictTomatoRipeness(params: {
  imageUri: string;
  usageTiming: UsageTiming;
  touchFeel: TouchFeel;
  cookingNote?: string;
}) {
  const stats = await extractImageStatsWeb(params.imageUri);

  let ripenessScore = 0.55;
  let debugInfo = 'トマト基準（既定値: 0.55）';

  if (stats) {
    const rgNorm = Math.min(1, Math.max(0, (stats.redGreenDiff + 0.05) / 0.45));
    const ratioNorm = Math.min(1, Math.max(0, (stats.redRatio - 0.34) / 0.24));
    const combined = 0.65 * rgNorm + 0.35 * ratioNorm;

    ripenessScore = Number((0.1 + combined * 0.85).toFixed(2));
    debugInfo = `トマト特徴 [R:${Math.round(stats.avgR)} G:${Math.round(stats.avgG)} B:${Math.round(stats.avgB)} | R-G:${stats.redGreenDiff.toFixed(2)} | R比:${stats.redRatio.toFixed(2)}]`;
  }

  const { stage, stageLabel } = scoreToTomatoStage(ripenessScore);
  const timing = buildTimingAdvice({
    vegetableKey: 'tomato',
    stage,
    usageTiming: params.usageTiming,
    touchFeel: params.touchFeel,
    cookingNote: params.cookingNote,
  });

  return {
    stage,
    stageLabel,
    ripenessScore,
    matchLevel: timing.matchLevel,
    matchLabel: timing.matchLabel,
    advice: timing.advice,
    debugInfo,
  };
}

export async function predictRipeness(params: {
  imageUri: string;
  vegetableName: string;
  usageTiming: UsageTiming;
  touchFeel?: TouchFeel;
  cookingNote?: string;
}): Promise<RipenessPrediction> {
  const trimmedName = params.vegetableName.trim() || 'トマト';
  const normalizedVegetable = normalizeVegetableName(trimmedName);
  const touchFeel = params.touchFeel ?? 'unknown';
  const guide = getVegetableGuide(trimmedName);

  if (normalizedVegetable === 'avocado') {
    const avocadoResult = await predictAvocadoRipeness({
      imageUri: params.imageUri,
      usageTiming: params.usageTiming,
      touchFeel,
      cookingNote: params.cookingNote,
    });

    return {
      vegetableName: trimmedName,
      normalizedVegetable,
      isSupportedVegetable: true,
      usageTiming: params.usageTiming,
      cookingNote: params.cookingNote,
      touchFeel,
      checklist: guide.checklist,
      ...avocadoResult,
    };
  }

  if (normalizedVegetable === 'tomato') {
    const tomatoResult = await predictTomatoRipeness({
      imageUri: params.imageUri,
      usageTiming: params.usageTiming,
      touchFeel,
      cookingNote: params.cookingNote,
    });

    return {
      vegetableName: trimmedName,
      normalizedVegetable,
      isSupportedVegetable: true,
      usageTiming: params.usageTiming,
      cookingNote: params.cookingNote,
      touchFeel,
      checklist: guide.checklist,
      ...tomatoResult,
    };
  }

  const fallback = await predictTomatoRipeness({
    imageUri: params.imageUri,
    usageTiming: params.usageTiming,
    touchFeel,
    cookingNote: params.cookingNote,
  });

  return {
    vegetableName: trimmedName,
    normalizedVegetable,
    isSupportedVegetable: false,
    usageTiming: params.usageTiming,
    cookingNote: params.cookingNote,
    touchFeel,
    checklist: guide.checklist,
    ...fallback,
    advice: `※現在はトマト・アボカド中心の基準のため、参考判定です。${fallback.advice}`,
  };
}