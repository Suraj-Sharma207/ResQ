import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_GUIDE_SEEN_KEY = '@resq_user_guide_seen';

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
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="shield-checkmark" size={24} color="#fff" />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>User Manual & Safety Guide</Text>
                  <Text style={styles.headerSubtitle}>How ResQ protects you on the road</Text>
                </View>
              </View>
              {/* Close Button (X) */}
              <TouchableOpacity
                style={styles.closeIconButton}
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close User Guide"
              >
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.contentScroll}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Privacy & Safety Badge */}
              <View style={styles.safetyBadge}>
                <Ionicons name="lock-closed" size={20} color="#2e7d32" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.safetyBadgeTitle}>100% Safe & Private</Text>
                  <Text style={styles.safetyBadgeText}>
                    ResQ operates completely on your phone. Your location and contacts are never uploaded or sold to external servers.
                  </Text>
                </View>
              </View>

              {/* Steps Section */}
              <Text style={styles.sectionHeading}>How It Works (Step-by-Step)</Text>

              <View style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>Add Emergency Contacts</Text>
                  <Text style={styles.stepDescription}>
                    Go to the <Text style={styles.bold}>My Circle</Text> tab and save your trusted family members, friends, or emergency numbers.
                  </Text>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>Turn SOS ON Before Driving</Text>
                  <Text style={styles.stepDescription}>
                    Tap the large SOS button on the Home screen to turn it <Text style={{ color: '#2e7d32', fontWeight: 'bold' }}>GREEN (ON)</Text>.
                  </Text>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>Continuous Background Monitoring</Text>
                  <Text style={styles.stepDescription}>
                    You can lock your phone or use navigation. ResQ runs in the background, monitoring motion and sudden high-G deceleration.
                  </Text>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={[styles.stepNumberBadge, { backgroundColor: '#ff5f5f' }]}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>Crash Detected: 30-Sec Countdown</Text>
                  <Text style={styles.stepDescription}>
                    If a severe impact is detected, the phone screen turns on, sounds an alarm, and starts a 30-second timer.
                  </Text>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={[styles.stepNumberBadge, { backgroundColor: '#ff3b30' }]}>
                  <Text style={styles.stepNumberText}>5</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>Automatic Emergency SMS</Text>
                  <Text style={styles.stepDescription}>
                    If you are safe, press <Text style={styles.bold}>"Stop Alert"</Text>. If you are unresponsive and the 30 seconds expire, ResQ automatically dispatches an SMS with your live GPS location via SIM.
                  </Text>
                </View>
              </View>

              {/* Samsung Tip */}
              <View style={styles.tipBox}>
                <Ionicons name="phone-portrait-outline" size={20} color="#ff6b4a" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.tipTitle}>Samsung / Lock Screen Tip</Text>
                  <Text style={styles.tipText}>
                    To let the countdown timer pop up over your locked screen, enable <Text style={styles.bold}>"Appear on top"</Text> in your phone Settings &gt; Apps &gt; ResQ.
                  </Text>
                </View>
              </View>

              {/* Don't show again toggle */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setDontShowAgain(!dontShowAgain)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={dontShowAgain ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={dontShowAgain ? '#ff6b4a' : '#888'}
                />
                <Text style={styles.checkboxLabel}>Don't show this guide automatically on launch</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Bottom Close Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.gotItButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.gotItButtonText}>Got It, I'm Ready!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    width: '92%',
    maxHeight: '88%',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff6b4a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  closeIconButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
    marginLeft: 8,
  },
  contentScroll: {
    maxHeight: 460,
  },
  scrollContent: {
    padding: 20,
  },
  safetyBadge: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  safetyBadgeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  safetyBadgeText: {
    fontSize: 12,
    color: '#388e3c',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9f9fb',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ececf2',
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff8a5c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 3,
  },
  stepDescription: {
    fontSize: 12.5,
    color: '#555',
    lineHeight: 18,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffe0b2',
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#e65100',
  },
  tipText: {
    fontSize: 12,
    color: '#bf360c',
    marginTop: 2,
    lineHeight: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 6,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  gotItButton: {
    backgroundColor: '#ff6b4a',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
