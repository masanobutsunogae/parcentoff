import {
  TabList,
  TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
} from 'expo-router/ui';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />

      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>ホーム</TabButton>
          </TabTrigger>

          <TabTrigger name="search" href="/search" asChild>
            <TabButton>探す</TabButton>
          </TabTrigger>

          <TabTrigger name="favorites" href="/game" asChild>
            <TabButton>ゲーム</TabButton>
          </TabTrigger>

          <TabTrigger name="mypage" href="/mypage" asChild>
            <TabButton>マイページ</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export const TabButton = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  TabTriggerSlotProps
>(function TabButton({ children, isFocused, ...props }, ref) {
  return (
    <Pressable
      ref={ref}
      {...props}
      style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}
    >
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}
      >
        <ThemedText
          type="small"
          themeColor={isFocused ? 'text' : 'textSecondary'}
        >
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
});

export const CustomTabList = React.forwardRef<
  React.ComponentRef<typeof View>,
  TabListProps
>(function CustomTabList(props, ref) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView
        type="backgroundElement"
        style={styles.innerContainer}
      >
        {props.children}
      </ThemedView>
    </View>
  );
});

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: 4,
  },
  tabButton: {
    flex: 1,
  },
  tabButtonView: {
    paddingVertical: Spacing.two,
    paddingHorizontal: 2,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
