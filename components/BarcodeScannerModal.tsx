import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    Platform
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface BarcodeScannerModalProps {
    isVisible: boolean;
    onClose: () => void;
    onScanned: (data: string) => void;
}

export default function BarcodeScannerModal({ isVisible, onClose, onScanned }: BarcodeScannerModalProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setScanned(false);
            if (!permission?.granted) {
                requestPermission();
            }
        }
    }, [isVisible, permission]);

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        onScanned(data);
    };

    if (!permission) {
        return null;
    }

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {!permission.granted ? (
                    <View style={styles.permissionContainer}>
                        <Ionicons name="camera-outline" size={80} color="#64748b" />
                        <Text style={styles.permissionText}>Aplikasi membutuhkan izin kamera untuk scan barcode.</Text>
                        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                            <Text style={styles.permissionButtonText}>Berikan Izin</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginTop: 20 }} onPress={onClose}>
                            <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Kembali</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <CameraView
                        style={StyleSheet.absoluteFillObject}
                        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_a", "upc_e"],
                        }}
                    >
                        {/* Scanner Overlay */}
                        <View style={styles.overlay}>
                            <View style={styles.unfocusedContainer}></View>
                            <View style={styles.middleContainer}>
                                <View style={styles.unfocusedContainer}></View>
                                <View style={styles.focusedContainer}>
                                    {/* Corner Markers */}
                                    <View style={[styles.corner, styles.topLeft]} />
                                    <View style={[styles.corner, styles.topRight]} />
                                    <View style={[styles.corner, styles.bottomLeft]} />
                                    <View style={[styles.corner, styles.bottomRight]} />
                                    
                                    {/* Scanning Line Animation Placeholder */}
                                    <View style={styles.scanLine} />
                                </View>
                                <View style={styles.unfocusedContainer}></View>
                            </View>
                            <View style={styles.unfocusedContainer}>
                                <Text style={styles.instructionText}>Arahkan kamera ke barcode produk</Text>
                            </View>
                        </View>

                        {/* Top Bar */}
                        <SafeAreaTop>
                            <View style={styles.topBar}>
                                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                    <Ionicons name="close" size={28} color="#fff" />
                                </TouchableOpacity>
                                <Text style={styles.topBarTitle}>Scan Barcode</Text>
                                <View style={{ width: 44 }} /> 
                            </View>
                        </SafeAreaTop>

                        {scanned && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#fff" />
                                <Text style={{ color: '#fff', marginTop: 10 }}>Memproses...</Text>
                            </View>
                        )}
                    </CameraView>
                )}
            </View>
        </Modal>
    );
}

const SafeAreaTop = ({ children }: { children: React.ReactNode }) => (
    <View style={{ paddingTop: Platform.OS === 'ios' ? 50 : 20 }}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f8fafc',
    },
    permissionText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#475569',
        marginVertical: 20,
        lineHeight: 24,
    },
    permissionButton: {
        backgroundColor: '#0ea5e9',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 12,
        elevation: 4,
    },
    permissionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    overlay: {
        flex: 1,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250,
    },
    focusedContainer: {
        width: 250,
        height: 250,
        backgroundColor: 'transparent',
    },
    instructionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    topBarTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#0ea5e9',
        borderWidth: 5,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 10,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 10,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 10,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 10,
    },
    scanLine: {
        position: 'absolute',
        top: '50%',
        left: '5%',
        right: '5%',
        height: 2,
        backgroundColor: '#0ea5e9',
        opacity: 0.5,
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
