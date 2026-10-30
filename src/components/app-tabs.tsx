
import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      {/* ホーム */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>ホーム</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="house.fill"
          md="home"
        />
      </NativeTabs.Trigger>

      {/* 検索 */}
      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Label>検索</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="map.fill"
          md="map"
        />
      </NativeTabs.Trigger>

      {/* お気に入り */}
      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Label>お気に入り</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="heart.fill"
          md="favorite"
        />
      </NativeTabs.Trigger>

      {/* マイページ */}
      <NativeTabs.Trigger name="mypage">
        <NativeTabs.Trigger.Label>マイページ</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="person.fill"
          md="person"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
