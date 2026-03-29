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
    SafeAreaView,
    Image,
} from 'react-native';

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
        icon: 'stats-chart-outline',
        color: '#3B82F6', // Blue
    },
    {
        id: '3',
        title: 'Multi Bisnis & Staf',
        description: 'Buat dan kelola banyak bisnis, juga keuangan pribadi Anda.',
        icon: 'people-outline',
        color: '#F59E0B', // Amber
    },
    {
        id: '4',
        title: 'Gunakan Secara Offline & Online',
        description: 'Jalankan bisnis Anda kapan saja tanpa hambatan, bahkan tanpa koneksi internet.',
        icon: 'cloud-offline-outline',
        color: '#8B5CF6', // Purple
    },
    {
        id: '5',
        title: 'Aman & Terpercaya',
        description: 'Data Anda disimpan dengan aman dan dicadangkan, sehingga dapat dipulihkan kapan saja.',
        icon: 'shield-checkmark-outline',
        color: '#10B981',
    },
];

export default function OnboardingScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

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
        router.replace('/(auth)/setup');
    };

    const finishOnboarding = async () => {
        await AsyncStorage.setItem('onboarded', 'true');
        router.replace('/(auth)/setup');
    };

    const Footer = () => {
        return (
            <View style={styles.footer}>
                {/* Pagination Dots */}
                <View style={styles.indicatorContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                currentSlideIndex === index && {
                                    backgroundColor: colors.primary,
                                    width: 25,
                                },
                            ]}
                        />
                    ))}
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
                        <Ionicons name="flash" size={20} color="#FFF" />
                    </View>
                    <Text style={[styles.brand, { color: colors.text }]}>mOTO</Text>
                </View>
                <TouchableOpacity style={styles.langBtn}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>Indonesian</Text>
                    <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                onMomentumScrollEnd={updateCurrentSlideIndex}
                data={slides}
                contentContainerStyle={{ height: height * 0.7 }}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <View style={styles.imageContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                                <Ionicons name={item.icon as any} size={120} color={item.color} />
                            </View>
                        </View>
                        <View style={{ paddingHorizontal: 40, alignItems: 'center' }}>
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
        paddingHorizontal: 25,
        paddingVertical: 20,
    },
    logoBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
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
        justifyContent: 'center',
    },
    imageContainer: {
        height: height * 0.35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 220,
        height: 220,
        borderRadius: 110,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        height: height * 0.25,
        justifyContent: 'space-between',
        paddingHorizontal: 25,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    indicator: {
        height: 8,
        width: 8,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 4,
        borderRadius: 4,
    },
    btn: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        fontWeight: '700',
        fontSize: 16,
        color: '#FFF',
    },
});
