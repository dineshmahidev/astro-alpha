import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#B09C66';
const TEXT_DARK = '#1D1D1C';
const TEXT_MID = '#555555';

export default function PalmReadingScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch (e) {
      console.warn('Capture failed', e);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const sendToAstrologer = () => {
    router.push('/astrologers-market');
  };

  const retake = () => setCapturedImage(null);

  // ─── No Permission ──────────────────────────────────────

  if (!permission) {
    return (
      <View style={s.screen}>
        <StatusBar style="dark" />
        <SafeAreaView style={s.safe}>
          <View style={s.center}>
            <Text style={s.loadingText}>Loading camera...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={s.screen}>
        <StatusBar style="dark" />
        <SafeAreaView style={s.safe}>
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Palm Reading</Text>
            <View style={{ width: 36 }} />
          </View>
          <View style={s.center}>
            <View style={s.permIconWrap}>
              <Ionicons name="camera-outline" size={60} color={ACCENT} />
            </View>
            <Text style={s.permTitle}>Camera Access Needed</Text>
            <Text style={s.permDesc}>Allow camera access to scan your palm and reveal your reading</Text>
            <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
              <Ionicons name="camera" size={18} color="#fff" />
              <Text style={s.permBtnTxt}>Allow Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.galleryLink} onPress={pickFromGallery}>
              <Ionicons name="images" size={18} color={ACCENT} />
              <Text style={s.galleryLinkTxt}>Or pick from gallery</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Captured Image Preview ─────────────────────────────

  if (capturedImage) {
    return (
      <View style={s.screen}>
        <StatusBar style="dark" />
        <SafeAreaView style={s.safe}>
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Palm Reading</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={s.previewContainer}>
            <Image source={{ uri: capturedImage }} style={s.previewImage} resizeMode="cover" />
          </View>

          <View style={s.bottomBar}>
            <TouchableOpacity style={s.retakeBtn} onPress={retake}>
              <Ionicons name="refresh" size={20} color={ACCENT} />
              <Text style={s.retakeBtnTxt}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.sendBtn} onPress={sendToAstrologer}>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={s.sendBtnTxt}>Send to Astrologer</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ─── Live Camera ────────────────────────────────────────

  return (
    <View style={s.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Palm Reading</Text>
          <TouchableOpacity style={s.historyBtn} onPress={() => router.push('/palm-history')}>
            <Ionicons name="time-outline" size={20} color={ACCENT} />
          </TouchableOpacity>
        </View>

        {/* Camera - 80% */}
        <View style={s.cameraWrap}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={flash}
          />
        </View>

        {/* Bottom Controls - 20% */}
        <View style={s.controlsBar}>
          {/* Gallery */}
          <TouchableOpacity style={s.controlBtn} onPress={pickFromGallery}>
            <View style={s.controlIconWrap}>
              <Ionicons name="images" size={24} color={ACCENT} />
            </View>
            <Text style={s.controlLabel}>Gallery</Text>
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity style={s.shutterBtn} onPress={takePicture}>
            <View style={s.shutterInner} />
          </TouchableOpacity>

          {/* Flash */}
          <TouchableOpacity style={s.controlBtn} onPress={() => setFlash(!flash)}>
            <View style={[s.controlIconWrap, flash && s.controlIconActive]}>
              <Ionicons name={flash ? 'flash' : 'flash-outline'} size={24} color={flash ? '#FFD700' : ACCENT} />
            </View>
            <Text style={s.controlLabel}>Flash</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  historyBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },

  // Permission
  permIconWrap: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(176,156,102,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  permTitle: { fontSize: 20, fontWeight: 'bold', color: TEXT_DARK, marginBottom: 8 },
  permDesc: { fontSize: 14, color: TEXT_MID, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  permBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14 },
  permBtnTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  galleryLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  galleryLinkTxt: { fontSize: 14, fontWeight: '500', color: ACCENT },

  loadingText: { fontSize: 14, color: TEXT_MID },

  // Camera
  cameraWrap: {
    flex: 1, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden',
    borderWidth: 2, borderColor: ACCENT, backgroundColor: '#000',
  },
  guideOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guideBox: {
    width: 220, height: 300, borderRadius: 20,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', borderStyle: 'dashed',
  },
  guideText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', marginTop: 12 },

  // Controls
  controlsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: 20, paddingHorizontal: 24,
  },
  controlBtn: { alignItems: 'center', gap: 6 },
  controlIconWrap: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(176,156,102,0.35)',
  },
  controlIconActive: { backgroundColor: 'rgba(255,215,0,0.15)', borderColor: '#FFD700' },
  controlLabel: { fontSize: 11, fontWeight: '500', color: TEXT_MID },

  shutterBtn: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: ACCENT,
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: ACCENT },

  // Preview
  previewContainer: { flex: 1, marginHorizontal: 16, borderRadius: 20, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16,
  },
  retakeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#F5F5F5', borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(176,156,102,0.35)',
  },
  retakeBtnTxt: { fontSize: 15, fontWeight: '600', color: ACCENT },
  sendBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 16,
  },
  sendBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
