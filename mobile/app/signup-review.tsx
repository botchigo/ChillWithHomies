import React from 'react';
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

export default function SignUpReviewScreen() {
  const router = useRouter();

  const userInfo = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    idFront: 'Captured ✓',
    idBack: 'Captured ✓',
    nfc: 'Scanned ✓',
    liveness: 'Verified ✓',
  };

  function onCompleteSignUp() {
    console.log('completing sign up');
    router.replace('/signin');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <ThemedText type="title" style={[styles.title, styles.titleBrand]}>
              Review Information
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Please verify all details before completing registration
            </ThemedText>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="user" size={18} color="#ffb233" />
              <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
            </View>

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Full Name</ThemedText>
              <ThemedText style={styles.infoValue}>{userInfo.fullName}</ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              <ThemedText style={styles.infoValue}>{userInfo.email}</ThemedText>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Phone Number</ThemedText>
              <ThemedText style={styles.infoValue}>{userInfo.phone}</ThemedText>
            </View>
          </View>

          {/* Document Verification Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="id-card" size={18} color="#ffb233" />
              <ThemedText style={styles.sectionTitle}>Document Verification</ThemedText>
            </View>

            <View style={styles.verificationItem}>
              <View style={styles.verificationCheck}>
                <FontAwesome name="check-circle" size={20} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.verificationLabel}>ID Card Front</ThemedText>
                <ThemedText style={styles.verificationStatus}>{userInfo.idFront}</ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.verificationItem}>
              <View style={styles.verificationCheck}>
                <FontAwesome name="check-circle" size={20} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.verificationLabel}>ID Card Back</ThemedText>
                <ThemedText style={styles.verificationStatus}>{userInfo.idBack}</ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.verificationItem}>
              <View style={styles.verificationCheck}>
                <FontAwesome name="check-circle" size={20} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.verificationLabel}>NFC Scan</ThemedText>
                <ThemedText style={styles.verificationStatus}>{userInfo.nfc}</ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.verificationItem}>
              <View style={styles.verificationCheck}>
                <FontAwesome name="check-circle" size={20} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.verificationLabel}>Liveness Check</ThemedText>
                <ThemedText style={styles.verificationStatus}>{userInfo.liveness}</ThemedText>
              </View>
            </View>
          </View>

          {/* Terms & Conditions */}
          <View style={styles.termsBox}>
            <ThemedText style={styles.termsTitle}>Terms & Conditions</ThemedText>
            <ThemedText style={styles.termsText}>
              By clicking Complete, you confirm that all information provided is accurate and you agree to our Terms of Service and Privacy Policy.
            </ThemedText>
          </View>

          <View style={{ height: 20 }} />

          {/* Summary Box */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryItem}>
              <FontAwesome name="check-square" size={16} color="#10b981" />
              <ThemedText style={styles.summaryText}>All documents verified</ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <FontAwesome name="check-square" size={16} color="#10b981" />
              <ThemedText style={styles.summaryText}>Identity confirmed</ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <FontAwesome name="check-square" size={16} color="#10b981" />
              <ThemedText style={styles.summaryText}>Ready to complete registration</ThemedText>
            </View>
          </View>

          <View style={{ height: 32 }} />

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.completeButton}
            onPress={onCompleteSignUp}
          >
            <FontAwesome name="check" size={18} color="#fff" />
            <ThemedText style={styles.completeButtonText}>COMPLETE REGISTRATION</ThemedText>
          </TouchableOpacity>

          <Pressable onPress={() => router.back()} style={styles.editButton}>
            <FontAwesome name="arrow-left" size={14} color="#ffb233" />
            <ThemedText style={styles.editButtonText}>BACK TO EDIT</ThemedText>
          </Pressable>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  titleBrand: {
    color: '#ffb233',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoItem: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  verificationCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  verificationStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2,
  },
  termsBox: {
    backgroundColor: '#fffbf0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffb233',
    padding: 14,
  },
  termsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  summaryBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    padding: 14,
    gap: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '500',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    borderRadius: 28,
    paddingVertical: 14,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 14,
  },
  editButton: {
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
  editButtonText: {
    color: '#ffb233',
    fontWeight: '600',
    fontSize: 14,
  },
});
