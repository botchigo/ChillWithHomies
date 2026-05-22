import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function SignUpNFCGuideScreen() {
  const router = useRouter();
  const [isReading, setIsReading] = useState(false);
  const [nfcSupported] = useState(true); // In real app, check device NFC capability

  function onStartNFC() {
    setIsReading(true);
    console.log('opening nfc reader');
    setTimeout(() => {
      setIsReading(false);
      router.push('/signup-liveness');
    }, 2000);
  }

  function onSkipNFC() {
    console.log('skipping nfc');
    router.push('/signup-liveness');
  }

  if (!nfcSupported) {
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
                NFC Scan
              </ThemedText>
              <View style={{ width: 70 }} />
            </View>

            <View style={styles.errorBox}>
              <FontAwesome name="exclamation-circle" size={48} color="#ef4444" />
              <ThemedText style={styles.errorTitle}>NFC Not Supported</ThemedText>
              <ThemedText style={styles.errorDesc}>
                Your device doesn't support NFC scanning. You can skip this step and proceed with face verification.
              </ThemedText>
            </View>

            <View style={{ height: 40 }} />

            <TouchableOpacity
              style={styles.continueButton}
              onPress={onSkipNFC}
            >
              <ThemedText style={styles.continueText}>CONTINUE WITHOUT NFC</ThemedText>
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
              NFC Scan
            </ThemedText>
            <View style={{ width: 70 }} />
          </View>

          <ThemedText style={styles.description}>
            Place your ID card at the back of your phone to scan NFC chip
          </ThemedText>

          <View style={{ height: 40 }} />

          {/* Phone Illustration */}
          <View style={styles.illustrationBox}>
            <View style={styles.phoneFrame}>
              <View style={styles.phoneScreen}>
                <View style={styles.nfcIcon}>
                  <FontAwesome name="wifi" size={40} color="#3b82f6" />
                </View>
                <ThemedText style={styles.nfcText}>
                  {isReading ? 'READING NFC...' : 'Ready to scan'}
                </ThemedText>
              </View>
              <View style={styles.phoneNotch} />
            </View>

            {/* ID Card above phone */}
            <View style={styles.idCardAbove}>
              <View style={styles.idCardSmall}>
                <FontAwesome name="credit-card" size={24} color="#ffb233" />
              </View>
            </View>
          </View>

          <View style={{ height: 32 }} />

          <View style={styles.instructionBox}>
            <ThemedText style={styles.instructionTitle}>Instructions:</ThemedText>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <ThemedText style={styles.instructionNumberText}>1</ThemedText>
              </View>
              <ThemedText style={styles.instructionText}>
                Hold your ID card near the back of your phone
              </ThemedText>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <ThemedText style={styles.instructionNumberText}>2</ThemedText>
              </View>
              <ThemedText style={styles.instructionText}>
                Keep it steady until scanning completes
              </ThemedText>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <ThemedText style={styles.instructionNumberText}>3</ThemedText>
              </View>
              <ThemedText style={styles.instructionText}>
                Wait for the confirmation message
              </ThemedText>
            </View>
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.scanButton, isReading && styles.scanButtonReading]}
            onPress={onStartNFC}
            disabled={isReading}
          >
            <FontAwesome name={isReading ? 'spinner' : 'mobile'} size={24} color="#fff" />
            <ThemedText style={styles.scanButtonText}>
              {isReading ? 'SCANNING...' : 'START SCANNING'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkipNFC}
            disabled={isReading}
          >
            <ThemedText style={styles.skipText}>SKIP FOR NOW</ThemedText>
          </TouchableOpacity>
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
  illustrationBox: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  phoneFrame: {
    width: 120,
    height: 200,
    backgroundColor: '#1f2937',
    borderRadius: 20,
    borderWidth: 8,
    borderColor: '#111827',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneScreen: {
    flex: 1,
    width: '100%',
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nfcIcon: {
    marginBottom: 12,
  },
  nfcText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
  },
  phoneNotch: {
    width: 100,
    height: 24,
    backgroundColor: '#111827',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignSelf: 'center',
  },
  idCardAbove: {
    position: 'absolute',
    top: -30,
    right: -20,
    transform: [{ rotate: '15deg' }],
  },
  idCardSmall: {
    width: 100,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffb233',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  instructionBox: {
    backgroundColor: '#fffbf0',
    borderRadius: 12,
    padding: 16,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffb233',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    paddingTop: 2,
  },
  scanButton: {
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
    marginBottom: 12,
  },
  scanButtonReading: {
    backgroundColor: '#d1d5db',
    shadowColor: '#d1d5db',
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 14,
  },
  skipButton: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skipText: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 16,
  },
  errorDesc: {
    fontSize: 14,
    color: '#b91c1c',
    textAlign: 'center',
    marginTop: 12,
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
  },
  continueText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
