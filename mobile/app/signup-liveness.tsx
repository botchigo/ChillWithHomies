import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const FACE_FRAME_SIZE = 280;

export default function SignUpLivenessScreen() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [livenessComplete, setLivenessComplete] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  function onStartLiveness() {
    setIsScanning(true);
    console.log('starting liveness check');

    // Simulate liveness check with animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(() => {
      setIsScanning(false);
      setLivenessComplete(true);
      scaleAnim.resetAnimation();
    }, 3000);
  }

  function onContinue() {
    if (!livenessComplete) return;
    console.log('liveness verified, continue to review');
    router.push('/signup-review');
  }

  function onRetry() {
    setLivenessComplete(false);
    onStartLiveness();
  }

  if (livenessComplete) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
                <FontAwesome name="chevron-left" size={20} color="#ffb233" />
                <ThemedText style={styles.backLabel}>Back</ThemedText>
              </Pressable>
              <ThemedText type="title" style={[styles.title, styles.titleBrand]}>
                Liveness Check
              </ThemedText>
              <View style={{ width: 70 }} />
            </View>

            <View style={styles.successBox}>
              <View style={styles.successIcon}>
                <FontAwesome name="check" size={48} color="#fff" />
              </View>
              <ThemedText style={styles.successTitle}>Verification Complete!</ThemedText>
              <ThemedText style={styles.successDesc}>
                Your face verification was successful. You're one step away from completing your registration.
              </ThemedText>
            </View>

            <View style={{ height: 40 }} />

            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
            >
              <ThemedText style={styles.continueText}>CONTINUE TO REVIEW</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.retakeButton}
              onPress={onRetry}
            >
              <FontAwesome name="repeat" size={16} color="#ffb233" />
              <ThemedText style={styles.retakeText}>RETAKE</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
              <FontAwesome name="chevron-left" size={20} color="#ffb233" />
              <ThemedText style={styles.backLabel}>Back</ThemedText>
            </Pressable>
            <ThemedText type="title" style={[styles.title, styles.titleBrand]}>
              Liveness Check
            </ThemedText>
            <View style={{ width: 70 }} />
          </View>

          <ThemedText style={styles.description}>
            {isScanning ? 'Follow the instructions on screen' : 'Look directly at the camera to verify your face'}
          </ThemedText>

          <View style={{ height: 32 }} />

          {/* Camera Preview Area */}
          <View style={styles.cameraContainer}>
            <View style={styles.cameraBg}>
              {isScanning ? (
                <View style={styles.scanningContent}>
                  <Animated.View
                    style={[
                      styles.faceFrameAnimated,
                      {
                        transform: [{ scale: scaleAnim }],
                      },
                    ]}
                  >
                    <FontAwesome name="face-o" size={80} color="#3b82f6" />
                  </Animated.View>
                  <ThemedText style={styles.scanningText}>Keep your face in the frame</ThemedText>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '60%' }]} />
                  </View>
                </View>
              ) : (
                <View style={styles.readyContent}>
                  <View style={styles.faceFrame}>
                    <View style={styles.faceFrameBorder} />
                    <FontAwesome name="face-o" size={80} color="#d1d5db" />
                  </View>
                  <ThemedText style={styles.readyText}>Position your face in the oval</ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={{ height: 32 }} />

          {!isScanning && (
            <View style={styles.tipsBox}>
              <ThemedText style={styles.tipsTitle}>Tips for best results:</ThemedText>
              <View style={styles.tipItem}>
                <FontAwesome name="check" size={14} color="#10b981" />
                <ThemedText style={styles.tipText}>Good lighting from the front</ThemedText>
              </View>
              <View style={styles.tipItem}>
                <FontAwesome name="check" size={14} color="#10b981" />
                <ThemedText style={styles.tipText}>No glasses or face coverings</ThemedText>
              </View>
              <View style={styles.tipItem}>
                <FontAwesome name="check" size={14} color="#10b981" />
                <ThemedText style={styles.tipText}>Look directly at the camera</ThemedText>
              </View>
            </View>
          )}

          <View style={{ flex: 1 }} />

          {!isScanning && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.startButton}
              onPress={onStartLiveness}
            >
              <FontAwesome name="video-camera" size={18} color="#fff" />
              <ThemedText style={styles.startButtonText}>START VERIFICATION</ThemedText>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  backBtnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 70,
  },
  backLabel: {
    color: '#ffb233',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  titleBrand: {
    color: '#ffb233',
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  cameraContainer: {
    width: '100%',
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
  },
  cameraBg: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  faceFrame: {
    width: FACE_FRAME_SIZE,
    height: FACE_FRAME_SIZE,
    borderRadius: FACE_FRAME_SIZE / 2,
    borderWidth: 3,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  faceFrameBorder: {
    position: 'absolute',
    width: FACE_FRAME_SIZE - 6,
    height: FACE_FRAME_SIZE - 6,
    borderRadius: (FACE_FRAME_SIZE - 6) / 2,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
  },
  readyText: {
    marginTop: 20,
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  scanningContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 20,
  },
  faceFrameAnimated: {
    width: FACE_FRAME_SIZE,
    height: FACE_FRAME_SIZE,
    borderRadius: FACE_FRAME_SIZE / 2,
    borderWidth: 3,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  scanningText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  progressBar: {
    width: 120,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  tipsBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    padding: 14,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#1e40af',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    borderRadius: 28,
    paddingVertical: 14,
    backgroundColor: '#ffb233',
    shadowColor: '#ffb233',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 14,
  },
  successBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    padding: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginTop: 16,
  },
  successDesc: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  continueButton: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 12,
    backgroundColor: '#ffb233',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffb233',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  continueText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    borderRadius: 28,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ffb233',
  },
  retakeText: {
    color: '#ffb233',
    fontWeight: '600',
    fontSize: 14,
  },
});
