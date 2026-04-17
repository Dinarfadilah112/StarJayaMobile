import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Bisnis di Ponsel',
        description: 'Kelola akuntansi dan inventaris bisnis Anda dengan mudah langsung dari ponsel Anda.',
        icon: 'phone-portrait-outline',
        color: '#10B981', // Emerald
    },
    {
        id: '2',
        title: 'Laporan Bisnis yang Informatif',
        description: 'Buat keputusan bisnis yang lebih baik dengan laporan kinerja bisnis Anda.',
        icon: 'document-text-outline',
        color: '#3B82F6', // Blue
    },
    {
        id: '3',
        title: 'Manajemen Staf & Mekanik',
        description: 'Tambahkan akun kasir dan mekanik. Pantau kinerja transaksi masing-masing pegawai dengan mudah.',
        icon: 'people-outline',
        color: '#F59E0B', // Amber
    },
    {
        id: '4',
        title: 'Akses Offline Penuh',
        description: 'Kelola semua fitur bisnis Anda kapan saja, bahkan di lokasi tanpa sinyal internet sama sekali.',
        icon: 'cloud-offline-outline',
        color: '#8B5CF6', // Purple
    },
    {
        id: '5',
        title: 'Data Lokal yang Aman',
        description: 'Seluruh data transaksi dan inventaris tersimpan aman di dalam memori ponsel Anda.',
        icon: 'shield-checkmark-outline',
        color: '#10B981',
    },
];

export default function OnboardingScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const flatListRef = useRef<any>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const updateCurrentSlideIndex = (e: any) => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / width);
        setCurrentSlideIndex(currentIndex);
    };

    const goToNextSlide = () => {
        const nextSlideIndex = currentSlideIndex + 1;
        if (nextSlideIndex < slides.length) {
            const offset = nextSlideIndex * width;
            flatListRef?.current?.scrollToOffset({ offset });
            setCurrentSlideIndex(nextSlideIndex);
        }
    };

    const skipOnboarding = async () => {
        await AsyncStorage.setItem('onboarded', 'true');
        router.replace('/(drawer)/(tabs)');
    };

    const finishOnboarding = async () => {
        await AsyncStorage.setItem('onboarded', 'true');
        router.replace('/(drawer)/(tabs)');
    };

    const Footer = () => {
        return (
            <View style={styles.footer}>
                {/* Pagination Dots */}
                <View style={styles.indicatorContainer}>
                    {slides.map((_, index) => {
                        const dotWidth = scrollX.interpolate({
                            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                            outputRange: [6, 25, 6],
                            extrapolate: 'clamp',
                        });
                        const dotColor = scrollX.interpolate({
                            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                            outputRange: ['#E2E8F0', colors.primary, '#E2E8F0'],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.indicator,
                                    { width: dotWidth, backgroundColor: dotColor }
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Buttons */}
                <View style={{ marginBottom: 20 }}>
                    {currentSlideIndex === slides.length - 1 ? (
                        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={finishOnboarding}>
                            <Text style={styles.btnText}>Mulai</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.cardBorder, flex: 1 }]}
                                onPress={skipOnboarding}>
                                <Text style={[styles.btnText, { color: colors.text }]}>Lewati</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: colors.primary, flex: 1 }]}
                                onPress={goToNextSlide}>
                                <Text style={styles.btnText}>Berikutnya</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header / Logo */}
            <View style={styles.header}>
                <Image 
                    source={require('@/assets/images/logo.png')} 
                    style={{ width: 220, height: 60, marginLeft: -45 }}
                    resizeMode="contain"
                />
            </View>

            <Animated.FlatList
                ref={flatListRef}
                onMomentumScrollEnd={updateCurrentSlideIndex}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                data={slides}
                contentContainerStyle={{ flexGrow: 1 }}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                renderItem={({ item }: { item: any }) => (
                    <View style={styles.slide}>
                        <View style={styles.imageContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name={item.icon as any} size={100} color={item.color} />
                            </View>
                        </View>
                        <View style={{ paddingHorizontal: 35, alignItems: 'center', flex: 1, paddingTop: 20 }}>
                            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
                        </View>
                    </View>
                )}
            />

            <Footer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 0,
        paddingRight: 18,
        paddingVertical: 10,
    },
    brand: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    slide: {
        width,
        alignItems: 'center',
    },
    imageContainer: {
        height: height * 0.4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    footer: {
        height: height * 0.22,
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingBottom: 25,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    indicator: {
        height: 6,
        width: 6,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 3,
        borderRadius: 3,
    },
    btn: {
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        fontWeight: '700',
        fontSize: 15,
        color: '#FFF',
    },
});
