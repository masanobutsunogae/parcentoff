import { AvatarProvider } from '@/context/AvatarContext';
import { PointProvider } from '@/context/PointContext';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'leaflet/dist/leaflet.css';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <PointProvider>
      <AvatarProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }} >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="mpage/help" />
            <Stack.Screen name="mpage/favorites" />
        <Stack.Screen name="mpage/photo" />
        <Stack.Screen name="mpage/info" />
      </Stack>
    </ThemeProvider>
    </AvatarProvider>
    </PointProvider>

  );
}
