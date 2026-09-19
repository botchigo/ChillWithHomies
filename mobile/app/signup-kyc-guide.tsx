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

const STEPS = [
  { id: 1, name: 'Basic Info', completed: true },
  { id: 2, name: 'OTP', completed: true },
  { id: 3, name: 'ID Card', completed: false },
  { id: 4, name: 'Face', completed: false },
  { id: 5, name: 'Review', completed: false },
];

export default function SignUpKYCGuideScreen() {
  const router = useRouter();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const stepDescriptions: Record<number, string> = {
    3: 'Take clear photos of both sides of your ID card',
    4: 'Complete a liveness check by following on-screen instructions',
    5: 'Review and confirm all your information',
  };

  function onStartStep3() {
    router.push('/signup-id-card');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Pressable onPress={() => router.back()} style={styles.backBtnWrapper}>
                <FontAwesome name="chevron-left" size={20} color="#ffb233" />
                <ThemedText style={styles.backLabel}>Back</ThemedText>
              </Pressable>
              <ThemedText type="title" style={[styles.title, styles.titleBrand]} numberOfLines={1}>
                Identity Verification
              </ThemedText>
              <View style={{ width: 70 }} />
            </View>
            <ThemedText style={styles.subtitle}>
              Complete your eKYC verification to unlock all features
            </ThemedText>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  <View style={styles.progressStepWrapper}>
                    <View
                      style={[
                        styles.progressDot,
                        step.completed && styles.progressDotCompleted,
                        index === 2 && styles.progressDotCurrent,
                      ]}
                    >
                      {step.completed ? (
                        <FontAwesome name="check" size={12} color="#fff" />
                      ) : (
                        <ThemedText style={styles.stepNumber}>{step.id}</ThemedText>
                      )}
                    </View>
                    <ThemedText style={styles.progressLabel} numberOfLines={1}>
                      {step.name}
                    </ThemedText>
                  </View>
                  {index < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.progressLine,
                        step.completed && styles.progressLineCompleted,
                      ]}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>

          <View style={{ height: 32 }} />

          {/* Steps Overview */}
          <ThemedText style={styles.sectionTitle}>Verification Steps</ThemedText>

          <View style={{ height: 12 }} />

          {STEPS.slice(2).map((step) => (
            <View key={step.id}>
              <TouchableOpacity
                style={[styles.stepCard, expandedStep === step.id && styles.stepCardExpanded]}
                onPress={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                <View style={styles.stepCardHeader}>
                  <View style={styles.stepCardLeft}>
                    <View
                      style={[
                        styles.stepIcon,
                        step.completed && styles.stepIconCompleted,
                      ]}
                    >
                      {step.completed ? (
                        <FontAwesome name="check" size={16} color="#fff" />
                      ) : (
                        <ThemedText style={styles.stepCardNumber}>{step.id}</ThemedText>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.stepCardTitle}>{step.name}</ThemedText>
                      <ThemedText style={styles.stepCardDesc} numberOfLines={2}>
                        {stepDescriptions[step.id]}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {expandedStep === step.id && (
                  <View style={styles.stepCardContent}>
                    <ThemedText style={styles.stepCardHint}>
                      💡 Make sure your ID is clearly visible with good lighting and no glare.
                    </ThemedText>
                    {step.id === 3 && (
                      <TouchableOpacity
                        style={styles.startButton}
                        onPress={onStartStep3}
                      >
                        <FontAwesome name="camera" size={16} color="#fff" />
                        <ThemedText style={styles.startButtonText}>START</ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
              <View style={{ height: 12 }} />
            </View>
          ))}

          <View style={{ height: 20 }} />

          <View style={styles.infoBox}>
            <FontAwesome name="info-circle" size={16} color="#3b82f6" />
            <ThemedText style={styles.infoText}>
              This verification process typically takes 5-10 minutes. You can pause and resume at any time.
            </ThemedText>
          </View>
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 70,
  },
  backLabel: {
    fontSize: 16,
    color: '#ffb233',
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
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  progressSection: {
    backgroundColor: '#fffbf0',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  progressStepWrapper: {
    alignItems: 'center',
    width: 60,
  },
  progressDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    flexShrink: 0,
    zIndex: 2,
    backgroundColor: '#fff',
  },
  progressDotCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#059669',
  },
  progressDotCurrent: {
    backgroundColor: '#ffb233',
    borderColor: '#f59e0b',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: -8,
    marginTop: 17,
    zIndex: 1,
  },
  progressLineCompleted: {
    backgroundColor: '#10b981',
  },
  progressLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  stepCardExpanded: {
    borderColor: '#ffb233',
    backgroundColor: '#fffbf0',
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconCompleted: {
    backgroundColor: '#10b981',
  },
  stepCardNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  stepCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  stepCardDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 0,
    lineHeight: 16,
  },
  stepCardContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  stepCardHint: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffb233',
    borderRadius: 24,
    paddingVertical: 10,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
});
