import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

export default function SignUpIDCardScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'front' | 'front_review' | 'flipping' | 'back' | 'back_review' | 'review'>('front');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  function onTakePhoto() {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
      if (step === 'front') {
        setFrontPhoto('captured_front');
        setStep('front_review');
      } else if (step === 'back') {
        setBackPhoto('captured_back');
        setStep('back_review');
      }
    }, 1000);
  }

  function onContinueFront() {
    if (!frontPhoto) return;
    setStep('flipping');
    // Automatically switch to 'back' after 2 seconds
    setTimeout(() => setStep('back'), 2000);
  }

  function onRetakeFront() {
    setFrontPhoto(null);
    setStep('front');
  }

  function onContinueBack() {
    if (!backPhoto) return;
    setStep('review');
  }

  function onRetakeBack() {
    setBackPhoto(null);
    setStep('back');
  }

  function onRetake() {
    setFrontPhoto(null);
    setBackPhoto(null);
    setStep('front');
  }

  function onContinue() {
    if (!frontPhoto || !backPhoto) return;
    router.push('/signup-nfc-guide');
  }

  if (step === 'front_review') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Pressable onPress={() => onRetakeFront()} style={styles.backBtnWrapper}>
                <FontAwesome name="chevron-left" size={20} color="#ffb233" />
                <ThemedText style={styles.backLabel}>Back</ThemedText>
              </Pressable>
              <ThemedText type="title" style={[styles.title, styles.titleBrand]} numberOfLines={1}>
                Review Front
              </ThemedText>
              <View style={{ width: 70 }} />
            </View>

            <ThemedText style={styles.description}>
              Please review your ID front photo before continuing
            </ThemedText>

            <View style={{ height: 24 }} />

            <View style={[styles.photoPreviewBox, { height: 200 }]}>
              <View style={styles.photoPlaceholder}>
                <FontAwesome name="image" size={48} color="#d1d5db" />
                <ThemedText style={styles.photoPlaceholderText}>Front captured</ThemedText>
              </View>
            </View>

            <View style={{ height: 32 }} />

            <TouchableOpacity style={styles.continueButton} onPress={onContinueFront}>
              <ThemedText style={styles.continueText}>LOOKS GOOD</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.retakeButton} onPress={onRetakeFront}>
              <FontAwesome name="camera" size={16} color="#ffb233" />
              <ThemedText style={styles.retakeText}>RETAKE FRONT PHOTO</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (step === 'back_review') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Pressable onPress={() => onRetakeBack()} style={styles.backBtnWrapper}>
                <FontAwesome name="chevron-left" size={20} color="#ffb233" />
                <ThemedText style={styles.backLabel}>Back</ThemedText>
              </Pressable>
              <ThemedText type="title" style={[styles.title, styles.titleBrand]} numberOfLines={1}>
                Review Back
              </ThemedText>
              <View style={{ width: 70 }} />
            </View>

            <ThemedText style={styles.description}>
              Please review your ID back photo before continuing
            </ThemedText>

            <View style={{ height: 24 }} />

            <View style={[styles.photoPreviewBox, { height: 200 }]}>
              <View style={styles.photoPlaceholder}>
                <FontAwesome name="image" size={48} color="#d1d5db" />
                <ThemedText style={styles.photoPlaceholderText}>Back captured</ThemedText>
              </View>
            </View>

            <View style={{ height: 32 }} />

            <TouchableOpacity style={styles.continueButton} onPress={onContinueBack}>
              <ThemedText style={styles.continueText}>LOOKS GOOD</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.retakeButton} onPress={onRetakeBack}>
              <FontAwesome name="camera" size={16} color="#ffb233" />
              <ThemedText style={styles.retakeText}>RETAKE BACK PHOTO</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (step === 'flipping') {
    return (
      <ThemedView style={[styles.container, styles.centerAll]}>
        <FontAwesome name="refresh" size={48} color="#ffb233" />
        <View style={{ height: 24 }} />
        <ThemedText style={styles.flipText}>CScan successful!</ThemedText>
        <ThemedText style={styles.flipSubtext}>Hãy lật mặt sau (Please flip your card)...</ThemedText>
      </ThemedView>
    );
  }

  if (step === 'review') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
                <FontAwesome name="chevron-left" size={20} color="#ffb233" />
                <ThemedText style={styles.backLabel}>Back</ThemedText>
              </Pressable>
              <ThemedText type="title" style={[styles.title, styles.titleBrand]} numberOfLines={1}>
                Review ID
              </ThemedText>
              <View style={{ width: 70 }} />
            </View>

            <ThemedText style={styles.description}>
              Please review your ID photos
            </ThemedText>

            <View style={{ height: 24 }} />

            <ThemedText style={styles.label}>Front Side</ThemedText>
            <View style={styles.photoPreviewBox}>
              <View style={styles.photoPlaceholder}>
                <FontAwesome name="image" size={32} color="#d1d5db" />
                <ThemedText style={styles.photoPlaceholderText}>Front captured</ThemedText>
              </View>
            </View>

            <View style={{ height: 16 }} />

            <ThemedText style={styles.label}>Back Side</ThemedText>
            <View style={styles.photoPreviewBox}>
              <View style={styles.photoPlaceholder}>
                <FontAwesome name="image" size={32} color="#d1d5db" />
                <ThemedText style={styles.photoPlaceholderText}>Back captured</ThemedText>
              </View>
            </View>

            <View style={{ height: 32 }} />

            <View style={styles.checklistBox}>
              <View style={styles.checklistItem}>
                <FontAwesome name="check-circle" size={18} color="#10b981" />
                <ThemedText style={styles.checklistText}>Clearly visible and no glare</ThemedText>
              </View>
              <View style={styles.checklistItem}>
                <FontAwesome name="check-circle" size={18} color="#10b981" />
                <ThemedText style={styles.checklistText}>All corners visible</ThemedText>
              </View>
            </View>

            <View style={{ height: 32 }} />

            <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
              <ThemedText style={styles.continueText}>CONTINUE</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
              <FontAwesome name="camera" size={16} color="#ffb233" />
              <ThemedText style={styles.retakeText}>RETAKE PHOTOS</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // step 'front' or 'back'
  const isFront = step === 'front';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
              <FontAwesome name="chevron-left" size={20} color="#ffb233" />
              <ThemedText style={styles.backLabel}>Back</ThemedText>
            </Pressable>
            <ThemedText type="title" style={[styles.title, styles.titleBrand]} numberOfLines={1}>
              {isFront ? 'ID Front' : 'ID Back'}
            </ThemedText>
            <View style={{ width: 70 }} />
          </View>

          <ThemedText style={styles.description}>
            Take a clear photo of the {isFront ? 'front' : 'back'} side of your ID card
          </ThemedText>

          <View style={{ height: 32 }} />

          {/* Guide Illustration */}
          <View style={styles.guideBox}>
            <View style={styles.idIllustration}>
              <View style={styles.idCard}>
                <View style={styles.idTop}>
                  {isFront ? (
                    <>
                      <View style={styles.idCircle} />
                      <ThemedText style={styles.idCardText}>CARD ID</ThemedText>
                    </>
                  ) : (
                    <ThemedText style={styles.idNumber}>0123 4567 8901</ThemedText>
                  )}
                </View>
                <View style={styles.idMiddle}>
                  {isFront ? (
                    <ThemedText style={styles.idNumber}>0123 4567</ThemedText>
                  ) : (
                    <ThemedText style={styles.expiryText}>EXP: 12/2030</ThemedText>
                  )}
                </View>
                <View style={styles.idBottom}>
                  <ThemedText style={styles.idBottomText}>{isFront ? 'FRONT' : 'BACK'}</ThemedText>
                </View>
              </View>
            </View>

            <View style={{ height: 20 }} />

            <View style={styles.tipBox}>
              <FontAwesome name="lightbulb-o" size={16} color="#f59e0b" />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.tipTitle}>
                  {isFront ? 'Tips for best results:' : 'Important:'}
                </ThemedText>
                {isFront ? (
                  <>
                    <ThemedText style={styles.tipText}>• Place card on a flat surface</ThemedText>
                    <ThemedText style={styles.tipText}>• Ensure good lighting and no shadows</ThemedText>
                  </>
                ) : (
                  <>
                    <ThemedText style={styles.tipText}>• Make sure expiry date is visible</ThemedText>
                    <ThemedText style={styles.tipText}>• Include the back serial number</ThemedText>
                  </>
                )}
                <ThemedText style={styles.tipText}>• Avoid glare or reflections</ThemedText>
              </View>
            </View>
          </View>

          <View style={{ height: 48 }} />

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.cameraButton, isCapturing && styles.cameraButtonDisabled]}
            onPress={onTakePhoto}
            disabled={isCapturing}
          >
            <FontAwesome name="camera" size={24} color="#fff" />
            <ThemedText style={styles.cameraButtonText}>
              {isCapturing ? 'CAPTURING...' : 'TAKE PHOTO'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerAll: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  flipText: { fontSize: 24, fontWeight: 'bold', color: '#10b981' },
  flipSubtext: { fontSize: 16, color: '#6b7280', marginTop: 8 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  backBtnWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 70 },
  backLabel: { color: '#ffb233', fontSize: 16, fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 'bold' },
  titleBrand: { color: '#ffb233' },
  description: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  
  label: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  photoPreviewBox: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderText: { color: '#9ca3af', fontSize: 13, marginTop: 8 },
  
  checklistBox: { backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12, gap: 12 },
  checklistItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checklistText: { fontSize: 14, color: '#065f46', fontWeight: '500' },

  continueButton: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 14,
    backgroundColor: '#ffb233',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffb233',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  continueText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1 },

  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  retakeText: { color: '#ffb233', fontSize: 14, fontWeight: '700' },

  guideBox: { alignItems: 'center' },
  idIllustration: {
    width: '100%',
    height: 220,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  idCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },
  idTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  idCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb' },
  idCardText: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },
  idNumber: { fontSize: 18, fontWeight: '700', color: '#374151', letterSpacing: 2 },
  expiryText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  idMiddle: { alignItems: 'center' },
  idBottom: { alignItems: 'flex-end' },
  idBottomText: { fontSize: 12, fontWeight: '800', color: '#d1d5db' },

  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    width: '100%',
  },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#b45309', marginBottom: 4 },
  tipText: { fontSize: 13, color: '#92400e', lineHeight: 20 },

  cameraButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraButtonDisabled: { backgroundColor: '#9ca3af' },
  cameraButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
