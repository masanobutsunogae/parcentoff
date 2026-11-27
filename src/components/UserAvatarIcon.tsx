// components/UserAvatarIcon.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AVATAR_ITEMS, AvatarSelection, useAvatar } from '@/context/AvatarContext';
import { BuddyCharacter } from '@/components/BuddyCharacter';

interface UserAvatarIconProps {
  size?: number;
  customSelection?: AvatarSelection;
  showBorder?: boolean;
}

export const UserAvatarIcon: React.FC<UserAvatarIconProps> = ({
  size = 64,
  customSelection,
  showBorder = true,
}) => {
  const { selection: mySelection } = useAvatar();
  const active = customSelection ?? mySelection;

  const bg = AVATAR_ITEMS.find((item) => item.id === active.bgId);
  const snack = active.snackId
    ? AVATAR_ITEMS.find((item) => item.id === active.snackId)
    : undefined;

  const badgeSize = Math.round(size * 0.34);

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg?.colorHex ?? '#FFF8E7',
            borderWidth: showBorder ? 2 : 0,
          },
        ]}
      >
        <BuddyCharacter
          buddyId={active.buddyId}
          accessoryId={active.accessoryId}
          size={size * 0.84}
        />
      </View>

      {/* 右下：おやつバッジ */}
      {snack && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: -2,
              right: -2,
            },
          ]}
        >
          <Text style={{ fontSize: badgeSize * 0.6 }}>{snack.emoji}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#E6D5B8',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EADBC8',
    elevation: 2,
  },
});