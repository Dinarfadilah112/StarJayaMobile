import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Text, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function LoadingScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 2500, // Disinkronkan dengan delay di _layout.tsx (2.5 detik)
                useNativeDriver: false,
            })
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <Animated.View style={[
                styles.content, 
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}>
                <Image 
                    source={require('../assets/images/icon.png')} 
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={styles.loaderContainer}>
                    <View style={styles.loaderLineBg}>
                        <Animated.View style={[styles.loaderLineProgress, {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%']
                            })
                        }]} />
                    </View>
                </View>
                <Text style={styles.brandText}>mOTO</Text>
                <Text style={styles.tagline}>Mobile Otomotif Solusi Cerdas</Text>
            </Animated.View>
            
            <View style={styles.footer}>
                <Text style={styles.versionText}>v1.0.3</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    logo: {
        width: 140,
        height: 140,
        marginBottom: 40,
        borderRadius: 30, // Agar mirip ikon aslinya
    },
    loaderContainer: {
        width: width * 0.4,
        height: 4,
        marginBottom: 24,
    },
    loaderLineBg: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 2,
        overflow: 'hidden',
    },
    loaderLineProgress: {
        height: '100%',
        backgroundColor: '#2563EB',
        borderRadius: 2,
    },
    brandText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#1E40AF',
        letterSpacing: 2,
        marginBottom: 4,
    },
    tagline: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    versionText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#CBD5E1',
        letterSpacing: 1,
    }
});
