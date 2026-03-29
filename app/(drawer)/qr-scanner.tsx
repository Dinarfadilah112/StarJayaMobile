import { useUser } from '@/context/UserContext';
import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router'; // Key Import
import { useState } from 'react';
import { Alert, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function QRScannerScreen() {
    const router = useRouter();
    const { user } = useUser();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera-outline" size={64} color="#64748B" />
                    <Text style={styles.message}>Kami membutuhkan izin kamera untuk memindai kode QR login web.</Text>
                    <TouchableOpacity style={styles.btnPerm} onPress={requestPermission}>
                        <Text style={styles.btnPermText}>Izinkan Kamera</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
        if (scanned || isProcessing) return;

        // Basic validation: UUID format length is 36
        if (data.length !== 36) {
            // Not our UUID
            return;
        }

        setScanned(true);
        setIsProcessing(true);
        console.log(`Bar code with type ${type} and data ${data} has been scanned!`);

        try {
            // Attempt to update the session in Supabase
            // We set status to 'authenticated' and save the user_id
            if (!user) {
                setIsProcessing(false);
                setScanned(false);
                Alert.alert("Error", "Anda harus login di HP terlebih dahulu.");
                return;
            }


            console.log('🔄 Updating session:', data, 'for user:', user.id);

            const { data: updateResult, error } = await supabase
                .from('auth_sessions')
                .update({
                    user_id: user.id,
                    status: 'authenticated',
                    device_info: `Mobile App - ${user.name}`
                })
                .eq('session_id', data)
                .select();

            console.log('📊 Update result:', { updateResult, error });

            if (error) {
                console.error('❌ Error:', error);
                throw error;
            }

            if (!updateResult || updateResult.length === 0) {
                throw new Error('QR Code tidak valid atau sudah kadaluarsa');
            }

            console.log('✅ Success!');
            setIsProcessing(false);

            Alert.alert(
                "Login Berhasil!",
                "Perangkat Web berhasil terhubung.",
                [{ text: 'OK', onPress: () => router.back() }]
            );

        } catch (error: any) {
            console.error("❌ QR Scan Error:", error);
            setIsProcessing(false);
            setScanned(false);

            Alert.alert("Gagal", error.message || "Kode QR tidak valid atau kadaluarsa.", [
                { text: 'Coba Lagi' }
            ]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan QR Web</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    facing={facing}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                >
                    {/* Overlay Visualization */}
                    <View style={styles.overlay}>
                        <View style={styles.unfocusedContainer}></View>
                        <View style={styles.middleContainer}>
                            <View style={styles.unfocusedContainer}></View>
                            <View style={styles.focusedContainer}>
                                <View style={styles.cornerTopLeft} />
                                <View style={styles.cornerTopRight} />
                                <View style={styles.cornerBottomLeft} />
                                <View style={styles.cornerBottomRight} />
                            </View>
                            <View style={styles.unfocusedContainer}></View>
                        </View>
                        <View style={styles.unfocusedContainer}></View>
                    </View>
                </CameraView>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Arahkan kamera ke kode QR di layar Web Laptop/PC Anda.</Text>
            </View>

            {/* Processing Modal */}
            <Modal visible={isProcessing} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.loadingBox}>
                        <Text>Menghubungkan...</Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cameraContainer: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 280,
    },
    focusedContainer: {
        width: 280,
        borderColor: 'transparent',
    },
    cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderColor: '#0EA5E9', borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 20 },
    cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderColor: '#0EA5E9', borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 20 },
    cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderColor: '#0EA5E9', borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 20 },
    cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderColor: '#0EA5E9', borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 20 },

    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#FFF'
    },
    message: {
        textAlign: 'center',
        paddingBottom: 20,
        marginTop: 20,
        fontSize: 16,
        color: '#334155'
    },
    btnPerm: {
        backgroundColor: '#0EA5E9',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12
    },
    btnPermText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    footerText: {
        color: '#FFF',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 8,
        overflow: 'hidden'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingBox: {
        backgroundColor: '#FFF',
        padding: 24,
        borderRadius: 12
    }
});
