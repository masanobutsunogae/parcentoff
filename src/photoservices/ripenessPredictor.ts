// services/ripenessPredictor.ts
import { Platform } from 'react-native';

export type UsageTiming = 'today' | 'tomorrow' | 'later';

export type RipenessStage = 'unripe' | 'ripe' | 'overripe';

export type RipenessPrediction = {
  vegetableName: string;
  usageTiming: UsageTiming;
  stage: RipenessStage;
  stageLabel: string;
  ripenessScore: number; // 0.0（未熟寄り）〜 1.0（完熟・熟度高寄り）
  matchLevel: 'best' | 'good' | 'caution';
  matchLabel: string;
  advice: string;
  debugInfo?: string;
};

// Web環境で画像から簡単なRGB統計（平均輝度・赤み/緑み比率）を取る補助関数
async function extractWebRgbStats(
  imageUri: string
): Promise<{ avgR: number; avgG: number; avgB: number; redGreenRatio: number } | null> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return null;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 64; // 推論・特徴量抽出用に縮小
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

        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          if (alpha < 128) continue;
          sumR += data[i];
          sumG += data[i + 1];
          sumB += data[i + 2];
          count++;
        }

        if (count === 0) {
          resolve(null);
          return;
        }

        const avgR = sumR / count;
        const avgG = sumG / count;
        const avgB = sumB / count;
        const redGreenRatio = avgR / Math.max(avgG, 1);

        resolve({ avgR, avgG, avgB, redGreenRatio });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUri;
  });
}

function buildTimingAdvice(
  stage: RipenessStage,
  usageTiming: UsageTiming
): { matchLevel: 'best' | 'good' | 'caution'; matchLabel: string; advice: string } {
  if (usageTiming === 'today') {
    if (stage === 'ripe') {
      return {
        matchLevel: 'best',
        matchLabel: '今日使うのにぴったり',
        advice: '今の熟度状態は「今日すぐ使う」予定に合っています。',
      };
    }
    if (stage === 'overripe') {
      return {
        matchLevel: 'good',
        matchLabel: '今日中の消費がおすすめ',
        advice: '熟度が進んでいるため、今日中に加熱調理や早めに使い切るのがおすすめです。',
      };
    }
    return {
      matchLevel: 'caution',
      matchLabel: 'まだ少し早めかもしれません',
      advice: '未熟寄りの見え方のため、今日すぐ使う場合は食感や味を確認しながら調整してください。',
    };
  }

  if (usageTiming === 'tomorrow') {
    if (stage === 'ripe' || stage === 'unripe') {
      return {
        matchLevel: 'best',
        matchLabel: '明日〜2日後に合わせやすい状態',
        advice: '1〜2日後の調理タイミングを想定しやすい状態です。保存温度にも気をつけてみてください。',
      };
    }
    return {
      matchLevel: 'caution',
      matchLabel: '少し早めに使った方が安心',
      advice: '熟度が進みやすいため、1〜2日待つ場合は傷み具合を見ながら早めに使うのがおすすめです。',
    };
  }

  // usageTiming === 'later'（数日〜1週間後）
  if (stage === 'unripe') {
    return {
      matchLevel: 'best',
      matchLabel: '数日〜1週間後の予定に向いています',
      advice: 'まだ熟度が上がりきっていない状態なので、数日〜1週間後の調理を見据えやすいです。',
    };
  }
  if (stage === 'ripe') {
    return {
      matchLevel: 'good',
      matchLabel: '保存方法にひと工夫が必要',
      advice: 'すでに食べごろに近い状態なので、数日後まで置くなら冷蔵保存や下処理も検討してみてください。',
    };
  }
  return {
    matchLevel: 'caution',
    matchLabel: '数日待つと熟しすぎる可能性あり',
    advice: 'すでに熟度が高めのため、数日〜1週間後まで置くと柔らかくなりすぎる可能性があります。',
  };
}

/**
 * 野菜の熟し度を自前ロジック／モデルで推定するエントリポイント。
 * 将来 TensorFlow.js や ONNX Runtime Web 等のモデルを載せる場合は、
 * ここ（または内部の推論関数）を差し替えます。
 */
export async function predictRipeness(params: {
  imageUri: string;
  vegetableName: string;
  usageTiming: UsageTiming;
}): Promise<RipenessPrediction> {
  const vegetableName = params.vegetableName.trim() || '野菜（未指定）';
  const stats = await extractWebRgbStats(params.imageUri);

  // まずはRGB特徴量からの仮スコア計算（ここを学習済みモデル推論に差し替え可能）
  let ripenessScore = 0.55;
  let debugInfo = 'ネイティブ/フォールバック判定（基準スコア: 0.55）';

  if (stats) {
    // 例: 赤み比率が高いほど熟度スコアを高めに振る単純な初期ロジック
    const normalized = Math.min(1, Math.max(0, (stats.redGreenRatio - 0.7) / 0.8));
    ripenessScore = Number((0.25 + normalized * 0.65).toFixed(2));
    debugInfo = `RGB平均(${Math.round(stats.avgR)}, ${Math.round(stats.avgG)}, ${Math.round(stats.avgB)}) / R:G比=${stats.redGreenRatio.toFixed(2)}`;
  }

  let stage: RipenessStage = 'ripe';
  let stageLabel = '食べごろ（適熟）';

  if (ripenessScore < 0.38) {
    stage = 'unripe';
    stageLabel = '未熟・若め';
  } else if (ripenessScore > 0.75) {
    stage = 'overripe';
    stageLabel = '完熟・熟度高め';
  }

  const timing = buildTimingAdvice(stage, params.usageTiming);

  return {
    vegetableName,
    usageTiming: params.usageTiming,
    stage,
    stageLabel,
    ripenessScore,
    matchLevel: timing.matchLevel,
    matchLabel: timing.matchLabel,
    advice: timing.advice,
    debugInfo,
  };
}