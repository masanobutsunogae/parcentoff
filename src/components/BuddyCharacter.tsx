// components/BuddyCharacter.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { AVATAR_ITEMS } from '@/context/AvatarContext';

interface BuddyCharacterProps {
  buddyId: string;
  accessoryId?: string | null;
  snackId?: string | null;
  size?: number;
  animated?: boolean;
  eatTrigger?: number;
}

type BuddyPalette = {
  body: string;
  bodyShade: string; // 立体感用の陰色
  belly: string;
  bellyShade: string;
  ear: string;
  earShade: string;
  earInner: string;
  foot: string;
  footShade: string;
  outline: string;
  cheek: string;
};

const PALETTES: Record<string, BuddyPalette> = {
  buddy_chick: {
    body: '#FFE885',
    bodyShade: '#F2C14E',
    belly: '#FFF7CC',
    bellyShade: '#F6E08D',
    ear: '#FFD55A',
    earShade: '#EAB43B',
    earInner: '#FFE885',
    foot: '#FBA92C',
    footShade: '#D97706',
    outline: '#A66E24',
    cheek: '#FF9A9A',
  },
  buddy_cat: {
    body: '#FFFDF9',
    bodyShade: '#E8DFD5',
    belly: '#FFFFFF',
    bellyShade: '#EFE8DF',
    ear: '#F5A664',
    earShade: '#D88342',
    earInner: '#FFC4C4',
    foot: '#F7E9D7',
    footShade: '#DEC8AE',
    outline: '#765D4D',
    cheek: '#FFADBC',
  },
  buddy_bear: {
    body: '#CE9260',
    bodyShade: '#A36A3C',
    belly: '#F8E4CE',
    bellyShade: '#E2C3A3',
    ear: '#BC804E',
    earShade: '#915C32',
    earInner: '#EBC7A6',
    foot: '#B57746',
    footShade: '#8A542A',
    outline: '#653F24',
    cheek: '#F29494',
  },
  buddy_rabbit: {
    body: '#FFF6F8',
    bodyShade: '#F0D5DD',
    belly: '#FFFFFF',
    bellyShade: '#F4E3E8',
    ear: '#FFF6F8',
    earShade: '#EBCBD4',
    earInner: '#FFBFD0',
    foot: '#FFE2EA',
    footShade: '#E8BCC8',
    outline: '#96727C',
    cheek: '#FFA6C2',
  },
};

export const BuddyCharacter: React.FC<BuddyCharacterProps> = ({
  buddyId,
  accessoryId = null,
  snackId = null,
  size = 140,
  animated = false,
  eatTrigger = 0,
}) => {
  const buddyItem = AVATAR_ITEMS.find((i) => i.id === buddyId);
  const accessoryItem = accessoryId
    ? AVATAR_ITEMS.find((i) => i.id === accessoryId)
    : undefined;
  const snackItem = snackId
    ? AVATAR_ITEMS.find((i) => i.id === snackId)
    : undefined;

  // アニメーション用
  const handLift = useRef(new Animated.Value(0)).current;
  const mouthOpen = useRef(new Animated.Value(0)).current;
  const bodyBounce = useRef(new Animated.Value(0)).current;
  const notePop = useRef(new Animated.Value(0)).current;
  const [isChewing, setIsChewing] = useState(false);

  const runEatAnimation = () => {
    setIsChewing(false);
    handLift.setValue(0);
    mouthOpen.setValue(0);
    bodyBounce.setValue(0);
    notePop.setValue(0);

    const oneChew = Animated.parallel([
      Animated.sequence([
        Animated.timing(mouthOpen, {
          toValue: 1,
          duration: 150,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.timing(mouthOpen, {
          toValue: 0,
          duration: 150,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.timing(bodyBounce, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(bodyBounce, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]),
    ]);

    Animated.sequence([
      Animated.timing(handLift, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.delay(60),
    ]).start(({ finished }) => {
      if (!finished) return;
      setIsChewing(true);

      Animated.parallel([
        Animated.sequence([oneChew, oneChew, oneChew]),
        Animated.sequence([
          Animated.timing(notePop, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.delay(250),
          Animated.timing(notePop, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
          }),
        ]),
      ]).start(({ finished: chewDone }) => {
        setIsChewing(false);
        if (!chewDone) return;
        Animated.timing(handLift, {
          toValue: 0,
          duration: 360,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }).start();
      });
    });
  };

  useEffect(() => {
    if (!animated || !snackItem) {
      handLift.stopAnimation();
      mouthOpen.stopAnimation();
      bodyBounce.stopAnimation();
      notePop.stopAnimation();
      handLift.setValue(0);
      mouthOpen.setValue(0);
      bodyBounce.setValue(0);
      notePop.setValue(0);
      setIsChewing(false);
      return;
    }

    runEatAnimation();

    const timer = setInterval(() => {
      runEatAnimation();
    }, 4500);

    return () => {
      clearInterval(timer);
      handLift.stopAnimation();
      mouthOpen.stopAnimation();
      bodyBounce.stopAnimation();
      notePop.stopAnimation();
    };
  }, [animated, snackId, eatTrigger]);

  // フェーズ3で透過PNG画像が設定されている場合は画像を優先描画
  if (buddyItem?.image) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={buddyItem.image}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    );
  }

  const p = PALETTES[buddyId] ?? PALETTES.buddy_chick;
  const scale = size / 140;
  const s = (v: number) => v * scale;
  const borderW = Math.max(1.2, s(1.8));

  // 雑貨ごとのフィット位置
  const getAccessoryPlacement = () => {
    if (!accessoryId) return null;
    const isRabbit = buddyId === 'buddy_rabbit';
    const isCat = buddyId === 'buddy_cat';

    switch (accessoryId) {
      case 'acc_apron': // 王冠
        return {
          containerStyle: {
            top: isRabbit ? s(19) : s(9),
            alignSelf: 'center' as const,
          },
          fontSize: s(28),
        };
      case 'acc_ribbon': // リボン（耳の根元にぴったり）
        return {
          containerStyle: {
            top: isRabbit ? s(27) : isCat ? s(25) : s(26),
            left: isRabbit ? s(20) : s(24),
            transform: [{ rotate: '-18deg' }],
          },
          fontSize: s(25),
        };
      case 'acc_hat': // 麦わら帽子
        return {
          containerStyle: {
            top: isRabbit ? s(22) : s(16),
            alignSelf: 'center' as const,
          },
          fontSize: s(35),
        };
      case 'acc_basket': // お買い物かご
        return {
          containerStyle: {
            bottom: s(20),
            left: s(3),
          },
          fontSize: s(26),
        };
      default:
        return {
          containerStyle: { top: s(12), alignSelf: 'center' as const },
          fontSize: s(26),
        };
    }
  };

  const accessoryPlacement = getAccessoryPlacement();

  // アニメーション補間値
  const rightHandTranslateX = handLift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -s(28)],
  });
  const rightHandTranslateY = handLift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -s(20)],
  });
  const rightHandRotate = handLift.interpolate({
    inputRange: [0, 1],
    outputRange: ['25deg', '-35deg'],
  });
  const bodyScaleY = bodyBounce.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });
  const bodyTranslateY = bodyBounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, s(2)],
  });
  const mouthHeight = mouthOpen.interpolate({
    inputRange: [0, 1],
    outputRange: [s(3), s(11)],
  });
  const noteTranslateY = notePop.interpolate({
    inputRange: [0, 1],
    outputRange: [s(8), -s(10)],
  });

  // ぷっくりした手・足の共通パーツ（陰影＋光沢つき）
  const renderPuffyLimb = (
    w: number,
    h: number,
    baseColor: string,
    shadeColor: string
  ) => (
    <View
      style={[
        styles.dropShadowSoft,
        {
          width: w,
          height: h,
          borderRadius: h / 2,
          backgroundColor: shadeColor,
          borderColor: p.outline,
          borderWidth: borderW,
          overflow: 'hidden',
        },
      ]}
    >
      {/* ベース色（左上に寄せて右下に立体的な陰を作る） */}
      <View
        style={{
          position: 'absolute',
          top: -s(2),
          left: -s(2),
          width: w - s(2),
          height: h - s(3),
          borderRadius: h / 2,
          backgroundColor: baseColor,
        }}
      />
      {/* ツヤ光沢 */}
      <View
        style={{
          position: 'absolute',
          top: s(2),
          left: s(3.5),
          width: w * 0.42,
          height: h * 0.28,
          borderRadius: h / 4,
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
        }}
      />
    </View>
  );

  return (
    <View
      style={{
        width: s(136),
        height: s(148),
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {/* 食べているときの「♪」エフェクト */}
      {animated && snackItem && (
        <Animated.Text
          style={{
            position: 'absolute',
            top: s(6),
            right: s(10),
            fontSize: s(18),
            color: '#E07A5F',
            opacity: notePop,
            transform: [{ translateY: noteTranslateY }],
          }}
        >
          ♪
        </Animated.Text>
      )}

      {/* === 二重の足元シャドウ（立体的な接地感） === */}
      <View
        style={{
          position: 'absolute',
          bottom: s(1),
          width: s(92),
          height: s(18),
          borderRadius: s(9),
          backgroundColor: 'rgba(85, 65, 45, 0.11)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: s(4),
          width: s(64),
          height: s(11),
          borderRadius: s(6),
          backgroundColor: 'rgba(70, 50, 35, 0.16)',
        }}
      />

      {/* 体全体をぷにっと揺らすラッパー */}
      <Animated.View
        style={{
          width: s(136),
          height: s(148),
          alignItems: 'center',
          justifyContent: 'flex-end',
          transform: [{ translateY: bodyTranslateY }, { scaleY: bodyScaleY }],
        }}
      >
        {/* === みけねこの立体的しっぽ === */}
        {buddyId === 'buddy_cat' && (
          <View
            style={[
              styles.dropShadowSoft,
              {
                position: 'absolute',
                bottom: s(24),
                right: s(10),
                width: s(28),
                height: s(14),
                borderRadius: s(8),
                backgroundColor: '#523B2B',
                borderColor: p.outline,
                borderWidth: borderW,
                transform: [{ rotate: '-28deg' }],
                overflow: 'hidden',
              },
            ]}
          >
            <View
              style={{
                position: 'absolute',
                top: -s(2),
                left: -s(1),
                width: s(26),
                height: s(10),
                borderRadius: s(6),
                backgroundColor: '#785A44',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: s(2),
                left: s(5),
                width: s(12),
                height: s(3),
                borderRadius: s(2),
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
            />
          </View>
        )}

        {/* === 耳・とさか（陰影＋光沢つき） === */}
        {buddyId === 'buddy_rabbit' && (
          <>
            {[
              { side: 'left' as const, rot: '-8deg' },
              { side: 'right' as const, rot: '8deg' },
            ].map((ear) => (
              <View
                key={ear.side}
                style={[
                  styles.outlineBox,
                  styles.dropShadowSoft,
                  {
                    position: 'absolute',
                    top: s(6),
                    [ear.side]: s(36),
                    width: s(21),
                    height: s(47),
                    borderRadius: s(12),
                    backgroundColor: p.earShade,
                    borderColor: p.outline,
                    borderWidth: borderW,
                    transform: [{ rotate: ear.rot }],
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                {/* 立体ハイライト層 */}
                <View
                  style={{
                    position: 'absolute',
                    top: -s(2),
                    left: -s(2),
                    width: s(18),
                    height: s(43),
                    borderRadius: s(11),
                    backgroundColor: p.ear,
                  }}
                />
                {/* 内耳（少し奥まった陰影つき） */}
                <View
                  style={{
                    width: s(9.5),
                    height: s(29),
                    borderRadius: s(6),
                    backgroundColor: p.earInner,
                    borderTopWidth: s(1.5),
                    borderLeftWidth: s(1.5),
                    borderColor: 'rgba(210, 120, 145, 0.35)',
                  }}
                />
                {/* ツヤ */}
                <View
                  style={{
                    position: 'absolute',
                    top: s(4),
                    left: s(3.5),
                    width: s(4),
                    height: s(11),
                    borderRadius: s(3),
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  }}
                />
              </View>
            ))}
          </>
        )}

        {buddyId === 'buddy_bear' && (
          <>
            {(['left', 'right'] as const).map((side) => (
              <View
                key={side}
                style={[
                  styles.outlineBox,
                  styles.dropShadowSoft,
                  {
                    position: 'absolute',
                    top: s(27),
                    [side]: s(25),
                    width: s(27),
                    height: s(27),
                    borderRadius: s(14),
                    backgroundColor: p.earShade,
                    borderColor: p.outline,
                    borderWidth: borderW,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <View
                  style={{
                    position: 'absolute',
                    top: -s(2),
                    left: -s(2),
                    width: s(24),
                    height: s(24),
                    borderRadius: s(12),
                    backgroundColor: p.ear,
                  }}
                />
                <View
                  style={{
                    width: s(13),
                    height: s(13),
                    borderRadius: s(7),
                    backgroundColor: p.earInner,
                    borderTopWidth: s(1.5),
                    borderLeftWidth: s(1.5),
                    borderColor: 'rgba(130, 80, 40, 0.22)',
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: s(3),
                    left: s(4),
                    width: s(7),
                    height: s(3.5),
                    borderRadius: s(2),
                    backgroundColor: 'rgba(255, 255, 255, 0.45)',
                    transform: [{ rotate: '-25deg' }],
                  }}
                />
              </View>
            ))}
          </>
        )}

        {buddyId === 'buddy_cat' && (
          <>
            {/* 左猫耳（オレンジ立体） */}
            <View
              style={[
                styles.outlineBox,
                styles.dropShadowSoft,
                {
                  position: 'absolute',
                  top: s(28),
                  left: s(27),
                  width: s(26),
                  height: s(26),
                  borderRadius: s(7),
                  backgroundColor: '#D88342',
                  borderColor: p.outline,
                  borderWidth: borderW,
                  transform: [{ rotate: '32deg' }],
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <View
                style={{
                  position: 'absolute',
                  top: -s(2),
                  left: -s(2),
                  width: s(23),
                  height: s(23),
                  borderRadius: s(6),
                  backgroundColor: '#F5A664',
                }}
              />
              <View
                style={{
                  width: s(11),
                  height: s(11),
                  borderRadius: s(3),
                  backgroundColor: p.earInner,
                  marginTop: s(-2),
                  marginLeft: s(-2),
                }}
              />
            </View>
            {/* 右猫耳（焦げ茶立体） */}
            <View
              style={[
                styles.outlineBox,
                styles.dropShadowSoft,
                {
                  position: 'absolute',
                  top: s(28),
                  right: s(27),
                  width: s(26),
                  height: s(26),
                  borderRadius: s(7),
                  backgroundColor: '#523B2B',
                  borderColor: p.outline,
                  borderWidth: borderW,
                  transform: [{ rotate: '-32deg' }],
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <View
                style={{
                  position: 'absolute',
                  top: -s(2),
                  left: -s(2),
                  width: s(23),
                  height: s(23),
                  borderRadius: s(6),
                  backgroundColor: '#755640',
                }}
              />
              <View
                style={{
                  width: s(11),
                  height: s(11),
                  borderRadius: s(3),
                  backgroundColor: p.earInner,
                  marginTop: s(-2),
                  marginRight: s(-2),
                }}
              />
            </View>
          </>
        )}

        {buddyId === 'buddy_chick' && (
          <View
            style={{
              position: 'absolute',
              top: s(28),
              flexDirection: 'row',
              gap: s(2),
            }}
          >
            <View
              style={[
                styles.outlineBox,
                {
                  width: s(11),
                  height: s(15),
                  borderRadius: s(6),
                  backgroundColor: p.earShade,
                  borderColor: p.outline,
                  borderWidth: Math.max(1.2, s(1.6)),
                  transform: [{ rotate: '-15deg' }],
                },
              ]}
            >
              <View
                style={{
                  width: s(8),
                  height: s(12),
                  borderRadius: s(5),
                  backgroundColor: p.ear,
                }}
              />
            </View>
            <View
              style={[
                styles.outlineBox,
                {
                  width: s(11),
                  height: s(17),
                  borderRadius: s(6),
                  backgroundColor: p.earShade,
                  borderColor: p.outline,
                  borderWidth: Math.max(1.2, s(1.6)),
                  marginTop: s(-3),
                  transform: [{ rotate: '10deg' }],
                },
              ]}
            >
              <View
                style={{
                  width: s(8),
                  height: s(14),
                  borderRadius: s(5),
                  backgroundColor: p.ear,
                }}
              />
            </View>
          </View>
        )}

        {/* === ぷっくり立体的な足 === */}
        <View
          style={{
            position: 'absolute',
            bottom: s(7),
            flexDirection: 'row',
            gap: s(16),
          }}
        >
          {renderPuffyLimb(s(22), s(15), p.foot, p.footShade)}
          {renderPuffyLimb(s(22), s(15), p.foot, p.footShade)}
        </View>

        {/* === ぷっくり立体的な左手 === */}
        <View
          style={{
            position: 'absolute',
            bottom: s(34),
            left: s(17),
            transform: [{ rotate: '-25deg' }],
          }}
        >
          {renderPuffyLimb(s(21), s(17), p.body, p.bodyShade)}
        </View>

        {/* === 立体的な全身ボディ（3Dクレイ・フィギュア風シェーディング） === */}
        <View
          style={[
            styles.dropShadowBody,
            {
              position: 'absolute',
              bottom: s(14),
              width: s(90),
              height: s(94),
              borderTopLeftRadius: s(45),
              borderTopRightRadius: s(45),
              borderBottomLeftRadius: s(39),
              borderBottomRightRadius: s(39),
              backgroundColor: p.bodyShade, // ベースを陰色にして右下に三日月影を作る
              borderColor: p.outline,
              borderWidth: borderW,
              alignItems: 'center',
              overflow: 'hidden',
            },
          ]}
        >
          {/* メイン色の球体レイヤー（左上に寄せることで右下に滑らかな陰影が生まれる） */}
          <View
            style={{
              position: 'absolute',
              top: -s(6),
              left: -s(7),
              width: s(88),
              height: s(90),
              borderTopLeftRadius: s(44),
              borderTopRightRadius: s(44),
              borderBottomLeftRadius: s(40),
              borderBottomRightRadius: s(42),
              backgroundColor: p.body,
            }}
          />

          {/* みけねこの三毛ブチ模様（立体カーブに合わせて配置） */}
          {buddyId === 'buddy_cat' && (
            <>
              <View
                style={{
                  position: 'absolute',
                  top: s(-8),
                  left: s(-6),
                  width: s(34),
                  height: s(28),
                  borderRadius: s(16),
                  backgroundColor: '#F5A664',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: s(-6),
                  right: s(-8),
                  width: s(30),
                  height: s(24),
                  borderRadius: s(14),
                  backgroundColor: '#6B4F3B',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: s(4),
                  left: s(-10),
                  width: s(26),
                  height: s(26),
                  borderRadius: s(13),
                  backgroundColor: '#F5A664',
                  opacity: 0.9,
                }}
              />
            </>
          )}

          {/* 頭頂部〜左上のぷっくり光沢ハイライト */}
          <View
            style={{
              position: 'absolute',
              top: s(7),
              left: s(14),
              width: s(28),
              height: s(13),
              borderRadius: s(10),
              backgroundColor: 'rgba(255, 255, 255, 0.58)',
              transform: [{ rotate: '-22deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: s(18),
              left: s(9),
              width: s(7),
              height: s(7),
              borderRadius: s(4),
              backgroundColor: 'rgba(255, 255, 255, 0.45)',
            }}
          />

          {/* 左下のわずかな反射光（リムライトで球体感アップ） */}
          <View
            style={{
              position: 'absolute',
              bottom: s(6),
              right: s(12),
              width: s(26),
              height: s(6),
              borderRadius: s(4),
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              transform: [{ rotate: '-18deg' }],
            }}
          />

          {/* おなかのぷっくりパーツ（陰影＋光沢つき・みけねこ以外） */}
          {buddyId !== 'buddy_cat' && (
            <View
              style={{
                position: 'absolute',
                bottom: s(6),
                width: s(54),
                height: s(38),
                borderRadius: s(25),
                backgroundColor: p.bellyShade,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: -s(2),
                  left: -s(2),
                  width: s(50),
                  height: s(34),
                  borderRadius: s(22),
                  backgroundColor: p.belly,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: s(5),
                  left: s(11),
                  width: s(18),
                  height: s(7),
                  borderRadius: s(4),
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  transform: [{ rotate: '-10deg' }],
                }}
              />
            </View>
          )}

          {/* 顔パーツ（うるうる立体瞳・ぷっくりほっぺ・ひげ・口） */}
          <View style={{ marginTop: s(27), alignItems: 'center' }}>
            {/* 目（二重ハイライトで立体的に） */}
            <View style={{ flexDirection: 'row', gap: s(22), alignItems: 'center' }}>
              {[0, 1].map((idx) => (
                <View
                  key={idx}
                  style={{
                    width: s(9),
                    height: s(10.5),
                    borderRadius: s(5),
                    backgroundColor: '#2F241D',
                    position: 'relative',
                  }}
                >
                  {/* メイン光沢 */}
                  <View
                    style={{
                      position: 'absolute',
                      top: s(1.6),
                      left: s(1.8),
                      width: s(3.4),
                      height: s(3.4),
                      borderRadius: s(2),
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  {/* サブ光沢 */}
                  <View
                    style={{
                      position: 'absolute',
                      bottom: s(1.8),
                      right: s(1.8),
                      width: s(1.8),
                      height: s(1.8),
                      borderRadius: s(1),
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    }}
                  />
                </View>
              ))}
            </View>

            {/* ほっぺ＆口元 */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: s(2),
                gap: s(6),
              }}
            >
              {/* みけねこの左ひげ */}
              {buddyId === 'buddy_cat' && (
                <View style={{ gap: s(3), marginRight: s(-2) }}>
                  <View
                    style={{
                      width: s(9),
                      height: Math.max(1, s(1.3)),
                      backgroundColor: '#8D7363',
                      transform: [{ rotate: '8deg' }],
                    }}
                  />
                  <View
                    style={{
                      width: s(9),
                      height: Math.max(1, s(1.3)),
                      backgroundColor: '#8D7363',
                      transform: [{ rotate: '-8deg' }],
                    }}
                  />
                </View>
              )}

              {/* 左ほっぺ（ツヤ粒つき） */}
              <View
                style={{
                  width: s(11.5),
                  height: s(7),
                  borderRadius: s(4),
                  backgroundColor: p.cheek,
                  opacity: isChewing ? 0.95 : 0.72,
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  paddingTop: s(1.2),
                  paddingLeft: s(2.5),
                }}
              >
                <View
                  style={{
                    width: s(3.2),
                    height: s(1.8),
                    borderRadius: s(1),
                    backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  }}
                />
              </View>

              {/* 口（もぐもぐ中は開閉アニメーション） */}
              <View
                style={{
                  minWidth: s(16),
                  height: s(16),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isChewing ? (
                  <Animated.View
                    style={{
                      width: s(11),
                      height: mouthHeight,
                      borderRadius: s(6),
                      backgroundColor: buddyId === 'buddy_chick' ? '#F59E0B' : '#E76F7A',
                      borderColor: p.outline,
                      borderWidth: Math.max(1, s(1.2)),
                    }}
                  />
                ) : buddyId === 'buddy_chick' ? (
                  /* ぷっくり立体くちばし */
                  <View
                    style={{
                      width: s(13),
                      height: s(9),
                      borderRadius: s(5),
                      backgroundColor: '#D97706',
                      borderColor: p.outline,
                      borderWidth: Math.max(1, s(1.2)),
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: s(11),
                        height: s(6.5),
                        borderRadius: s(4),
                        backgroundColor: '#FBBF24',
                      }}
                    />
                    <View
                      style={{
                        position: 'absolute',
                        top: s(1.2),
                        left: s(2.5),
                        width: s(4),
                        height: s(1.8),
                        borderRadius: s(1),
                        backgroundColor: 'rgba(255, 255, 255, 0.75)',
                      }}
                    />
                  </View>
                ) : buddyId === 'buddy_bear' ? (
                  /* 立体マズル＆つや鼻 */
                  <View
                    style={{
                      width: s(23),
                      height: s(16),
                      borderRadius: s(10),
                      backgroundColor: p.bellyShade,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        position: 'absolute',
                        top: -s(1),
                        left: -s(1),
                        width: s(21),
                        height: s(14),
                        borderRadius: s(9),
                        backgroundColor: p.belly,
                      }}
                    />
                    <View
                      style={{
                        width: s(7),
                        height: s(4.8),
                        borderRadius: s(3),
                        backgroundColor: '#4A3423',
                        alignItems: 'flex-start',
                        paddingTop: s(0.8),
                        paddingLeft: s(1.2),
                      }}
                    >
                      <View
                        style={{
                          width: s(2.2),
                          height: s(1.2),
                          borderRadius: s(1),
                          backgroundColor: 'rgba(255,255,255,0.65)',
                        }}
                      />
                    </View>
                  </View>
                ) : buddyId === 'buddy_cat' ? (
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={{
                        width: s(5.5),
                        height: s(4),
                        borderRadius: s(2),
                        backgroundColor: '#F28B9A',
                        marginBottom: s(-2),
                        paddingTop: s(0.6),
                        paddingLeft: s(1),
                      }}
                    >
                      <View
                        style={{
                          width: s(1.8),
                          height: s(1),
                          borderRadius: s(1),
                          backgroundColor: 'rgba(255,255,255,0.75)',
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: s(10),
                        fontWeight: '700',
                        color: '#6B4F3B',
                        lineHeight: s(12),
                      }}
                    >
                      ω
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      fontSize: s(11),
                      fontWeight: '700',
                      color: '#5A4638',
                      lineHeight: s(13),
                    }}
                  >
                    ω
                  </Text>
                )}
              </View>

              {/* 右ほっぺ（ツヤ粒つき） */}
              <View
                style={{
                  width: s(11.5),
                  height: s(7),
                  borderRadius: s(4),
                  backgroundColor: p.cheek,
                  opacity: isChewing ? 0.95 : 0.72,
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  paddingTop: s(1.2),
                  paddingLeft: s(2.5),
                }}
              >
                <View
                  style={{
                    width: s(3.2),
                    height: s(1.8),
                    borderRadius: s(1),
                    backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  }}
                />
              </View>

              {/* みけねこの右ひげ */}
              {buddyId === 'buddy_cat' && (
                <View style={{ gap: s(3), marginLeft: s(-2) }}>
                  <View
                    style={{
                      width: s(9),
                      height: Math.max(1, s(1.3)),
                      backgroundColor: '#8D7363',
                      transform: [{ rotate: '-8deg' }],
                    }}
                  />
                  <View
                    style={{
                      width: s(9),
                      height: Math.max(1, s(1.3)),
                      backgroundColor: '#8D7363',
                      transform: [{ rotate: '8deg' }],
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* === ぷっくり立体的な右手（おやつを持って口元へ運ぶアニメーション） === */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: s(34),
            right: s(17),
            alignItems: 'center',
            justifyContent: 'center',
            transform: [
              { translateX: rightHandTranslateX },
              { translateY: rightHandTranslateY },
              { rotate: rightHandRotate },
            ],
          }}
        >
          {renderPuffyLimb(s(21), s(17), p.body, p.bodyShade)}

          {animated && snackItem && (
            <View
              style={{
                position: 'absolute',
                top: -s(18),
                right: -s(6),
              }}
            >
              {snackItem.image ? (
                <Image
                  source={snackItem.image}
                  style={{ width: s(24), height: s(24) }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ fontSize: s(22) }}>{snackItem.emoji}</Text>
              )}
            </View>
          )}
        </Animated.View>

        {/* === 雑貨（アイテム＆キャラごとにフィット配置） === */}
        {accessoryItem && accessoryPlacement && (
          <View
            style={[
              styles.dropShadowSoft,
              {
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
              },
              accessoryPlacement.containerStyle,
            ]}
          >
            {accessoryItem.image ? (
              <Image
                source={accessoryItem.image}
                style={{ width: s(34), height: s(34) }}
                resizeMode="contain"
              />
            ) : (
              <Text style={{ fontSize: accessoryPlacement.fontSize }}>
                {accessoryItem.emoji}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outlineBox: {
    overflow: 'hidden',
  },
  dropShadowBody: {
    shadowColor: '#4A3520',
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  dropShadowSoft: {
    shadowColor: '#4A3520',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 2,
  },
});