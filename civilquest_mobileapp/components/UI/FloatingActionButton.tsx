import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, LAYOUT, FONTS } from '../../theme';

interface FABAction {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  mainIcon?: string;
  mainColor?: string;
  onMainPress?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'small' | 'medium' | 'large';
}

const { width, height } = Dimensions.get('window');

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions = [],
  mainIcon = 'add',
  mainColor = COLORS.primary,
  onMainPress,
  position = 'bottom-right',
  size = 'medium',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const actionsAnimation = useRef(actions.map(() => new Animated.Value(0))).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    // Main button rotation
    Animated.spring(animation, {
      toValue,
      tension: 80,
      friction: 5,
      useNativeDriver: true,
    }).start();

    // Actions animation
    if (actions.length > 0) {
      const animations = actionsAnimation.map((anim, index) =>
        Animated.timing(anim, {
          toValue,
          duration: 200 + index * 50,
          useNativeDriver: true,
        })
      );

      if (isOpen) {
        Animated.stagger(50, animations.reverse()).start();
      } else {
        Animated.stagger(50, animations).start();
      }
    }
  };

  const handleMainPress = () => {
    if (actions.length > 0) {
      toggleMenu();
    } else if (onMainPress) {
      onMainPress();
    }
  };

  const getMainButtonSize = () => {
    switch (size) {
      case 'small':
        return { width: 48, height: 48, borderRadius: 24 };
      case 'large':
        return { width: 64, height: 64, borderRadius: 32 };
      default:
        return { width: 56, height: 56, borderRadius: 28 };
    }
  };

  const getActionButtonSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, borderRadius: 20 };
      case 'large':
        return { width: 48, height: 48, borderRadius: 24 };
      default:
        return { width: 44, height: 44, borderRadius: 22 };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const getPositionStyle = () => {
    const bottom = SPACING.xxl;
    switch (position) {
      case 'bottom-left':
        return { bottom, left: SPACING.xl };
      case 'bottom-center':
        return { bottom, left: width / 2 - getMainButtonSize().width / 2 };
      default:
        return { bottom, right: SPACING.xl };
    }
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const renderAction = (action: FABAction, index: number) => {
    const translateY = actionsAnimation[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -(60 + index * 60)],
    });

    const scale = actionsAnimation[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const opacity = actionsAnimation[index];

    return (
      <Animated.View
        key={index}
        style={[
          styles.actionContainer,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        <View style={styles.actionLabelContainer}>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.actionButton,
            getActionButtonSize(),
            { backgroundColor: action.color || COLORS.surface },
          ]}
          onPress={() => {
            action.onPress();
            toggleMenu();
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={action.icon as any}
            size={getIconSize() - 4}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backdropTouchable}
            onPress={toggleMenu}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* FAB Container */}
      <View style={[styles.container, getPositionStyle()]}>
        {/* Action Buttons */}
        {actions.map((action, index) => renderAction(action, index))}

        {/* Main Button */}
        <Animated.View
          style={[
            styles.mainButton,
            getMainButtonSize(),
            {
              backgroundColor: mainColor,
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.mainButtonTouchable, getMainButtonSize()]}
            onPress={handleMainPress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={mainIcon as any}
              size={getIconSize()}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    zIndex: LAYOUT.zIndex.overlay,
  },
  backdropTouchable: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: LAYOUT.zIndex.overlay + 1,
  },
  mainButton: {
    justifyContent: 'center',
    alignItems: 'center',
    ...LAYOUT.shadows.lg,
  },
  mainButtonTouchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 0,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    ...LAYOUT.shadows.md,
  },
  actionLabelContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: LAYOUT.borderRadius.lg,
    marginBottom: SPACING.md,
    ...LAYOUT.shadows.sm,
  },
  actionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    minWidth: 80,
  },
});
