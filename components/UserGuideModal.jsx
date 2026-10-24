import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_GUIDE_SEEN_KEY = '@resq_user_guide_seen';

const STEPS = [
  {
    number: '01',
    title: 'Add Emergency Contacts',
    description: 'Go to My Circle and add trusted family members, friends, or emergency contacts.',
  },
  {
    number: '02',
    title: 'Enable SOS Before Driving',
    description: 'Turn on the SOS button on the Home screen. Make sure it turns green before you start driving.',
  },
  {
    number: '03',
    title: 'Keep Background Monitoring Active',
    description: 'ResQ can monitor for accidents while you lock your phone or use navigation.',
  },
];

export default function UserGuideModal({ visible, onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = async () => {
    if (dontShowAgain) {
      try {
        await AsyncStorage.setItem(USER_GUIDE_SEEN_KEY, 'true');
      } catch (e) {
        console.error('Error saving user guide preference', e);
      }
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* A. Compact Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Safety Guide</Text>
              <Text style={styles.headerSubtitle}>How ResQ protects you on the road</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close Safety Guide"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.contentScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* B. Minimal Privacy Banner */}
            <View style={styles.privacyBanner}>
              <Ionicons name="lock-closed" size={14} color="#059669" style={styles.privacyIcon} />
              <View style={styles.privacyTextContainer}>
                <Text style={styles.privacyHeading}>Your privacy matters</Text>
                <Text style={styles.privacyText}>
                  Your location and contacts stay on your device and are never sold.
                </Text>
              </View>
            </View>

            {/* C. Single Continuous Vertical Timeline */}
            <View style={styles.timelineContainer}>
              {STEPS.map((step, index) => {
                const isLast = index === STEPS.length - 1;
                return (
                  <View key={step.number} style={styles.timelineRow}>
                    {/* Connecting line between steps */}
                    {!isLast && <View style={styles.connectingLine} />}

                    {/* Step Number Badge */}
                    <View style={styles.numberCircle}>
                      <Text style={styles.numberText}>{step.number}</Text>
                    </View>

                    {/* Step Text */}
                    <View style={[styles.stepContent, isLast && styles.stepContentLast]}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Subtle "Don't show again" toggle */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setDontShowAgain(!dontShowAgain)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: dontShowAgain }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={dontShowAgain ? 'checkbox' : 'square-outline'}
                size={17}
                color={dontShowAgain ? '#FF6347' : '#94A3B8'}
              />
              <Text style={styles.checkboxLabel}>Don't show this guide on launch</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* D. Fixed Bottom Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleClose}
              activeOpacity={0.85}
              accessibilityLabel="Got It, I'm Ready"
              accessibilityRole="button"
            >
              <Text style={styles.ctaButtonText}>Got It, I'm Ready</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentScroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  privacyIcon: {
    marginRight: 9,
    marginTop: 1,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  privacyText: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 16,
  },
  timelineContainer: {
    marginBottom: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  connectingLine: {
    position: 'absolute',
    left: 13,
    top: 26,
    bottom: 0,
    width: 1.5,
    backgroundColor: '#E2E8F0',
  },
  numberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    zIndex: 1,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 22,
  },
  stepContentLast: {
    paddingBottom: 8,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 3,
    letterSpacing: -0.2,
    lineHeight: 20,
    marginTop: 2,
  },
  stepDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
    paddingVertical: 6,
  },
  checkboxLabel: {
    fontSize: 12.5,
    color: '#64748B',
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  ctaButton: {
    backgroundColor: '#FF6347',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
