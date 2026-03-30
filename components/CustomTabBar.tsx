import { useTheme } from '@/context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();


    // Safety check for empty routes
    if (state.routes.length === 0) return null;

    return (
        <View style={[styles.container, { bottom: Math.max(insets.bottom, 12), backgroundColor: 'transparent' }]} pointerEvents="box-none">
            <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Icon Logic
                    let iconName: any;
                    if (route.name === 'index') {
                        iconName = isFocused ? "view-dashboard" : "view-dashboard-outline";
                    } else if (route.name === 'kasir') {
                        iconName = isFocused ? "cart" : "cart-outline";
                    } else if (route.name === 'gudang') {
                        iconName = isFocused ? "package-variant" : "package-variant-closed";
                    } else if (route.name === 'penjualan') {
                        iconName = isFocused ? "chart-line" : "chart-line-variant";
                    } else if (route.name === 'options') {
                        iconName = isFocused ? "settings" : "settings-outline";
                    }

                    // Render Icon
                    const IconComponent = (route.name === 'index' || route.name === 'gudang' || route.name === 'penjualan')
                        ? MaterialCommunityIcons
                        : Ionicons;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            // testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={[
                                styles.tabItem,
                                isFocused && { backgroundColor: colors.pillActive }, // Custom active background
                                isFocused && styles.activeTabItem,
                            ]}
                        >
                            {/* Animated Content */}
                            <IconComponent
                                name={iconName}
                                size={22}
                                color={isFocused ? '#FFFFFF' : colors.textSecondary}
                            />
                            {isFocused && (
                                <Text style={[
                                    styles.label,
                                    { color: '#FFFFFF' }
                                ]}>
                                    {label as string}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30, // Fallback if inline style is missing
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 9999, // High zIndex for ordering
        elevation: 20, // Elevation for Android stacking order
        width: '100%',
    },
    tabBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24, // Fully rounded pill container
        padding: 4, // Slimmer padding
        elevation: 10, // Elevation on the VISIBLE view for Android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20, // Round individual items
    },
    activeTabItem: {
        // Additional styles for active state if needed
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,

    },
});
