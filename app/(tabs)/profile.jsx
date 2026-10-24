import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {
  getLocalContacts,
  getLocalProfile,
  saveLocalProfile,
} from "../../services/storageService";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Profile() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [userData, setUserData] = useState({
    name: "ResQ User",
    phone: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    note: "",
    photo: "",
  });

  // Modal State: null | "parents" | "medical" | "emergency"
  const [activeModal, setActiveModal] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Section 1: Parents Details Form State
  const [parentPhone, setParentPhone] = useState("");
  const [parentAddress, setParentAddress] = useState("");

  // Section 2: Medical Info Form State
  const [medicalBloodGroup, setMedicalBloodGroup] = useState("");
  const [medicalAllergies, setMedicalAllergies] = useState("");
  const [medicalNote, setMedicalNote] = useState("");

  // Section 3: Emergency Network / Profile Identity Form State
  const [profileName, setProfileName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  // Reload profile and contacts whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const localProfile = await getLocalProfile();
        if (localProfile) {
          setUserData(localProfile);
        }
        const localContacts = await getLocalContacts();
        setContacts(localContacts || []);
      };

      fetchData();
    }, [])
  );

  // --- MODAL OPEN HANDLERS (Pre-fill with existing values) ---
  const openParentsModal = () => {
    setParentPhone(userData.phone || "");
    setParentAddress(userData.address || "");
    setErrorMessage("");
    setActiveModal("parents");
  };

  const openMedicalModal = () => {
    setMedicalBloodGroup(userData.bloodGroup || "");
    setMedicalAllergies(userData.allergies || "");
    setMedicalNote(userData.note || "");
    setErrorMessage("");
    setActiveModal("medical");
  };

  const openEmergencyModal = () => {
    setProfileName(userData.name || "ResQ User");
    setProfilePhoto(userData.photo || "");
    setErrorMessage("");
    setActiveModal("emergency");
  };

  const closeModal = () => {
    if (isSaving) return;
    setActiveModal(null);
    setErrorMessage("");
  };

  // --- SAVE HANDLERS (Independent, Atomic Read-Modify-Write) ---

  // 1. Parents Details Save
  const handleSaveParents = async () => {
    if (isSaving) return;

    const trimmedPhone = parentPhone.trim();
    const trimmedAddress = parentAddress.trim();

    if (trimmedPhone) {
      const digits = trimmedPhone.replace(/\D/g, "");
      if (digits.length < 7) {
        setErrorMessage("Please enter a valid phone number (at least 7 digits).");
        return;
      }
    }

    setIsSaving(true);
    setErrorMessage("");
    try {
      const current = (await getLocalProfile()) || {};
      const updated = {
        ...current,
        phone: trimmedPhone,
        address: trimmedAddress,
      };
      await saveLocalProfile(updated);
      setUserData(updated);
      setActiveModal(null);
    } catch (e) {
      console.error("Failed to save parents details", e);
      setErrorMessage("Could not save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Medical Info Save
  const handleSaveMedical = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage("");
    try {
      const current = (await getLocalProfile()) || {};
      const updated = {
        ...current,
        bloodGroup: medicalBloodGroup,
        allergies: medicalAllergies.trim(),
        note: medicalNote.trim(),
      };
      await saveLocalProfile(updated);
      setUserData(updated);
      setActiveModal(null);
    } catch (e) {
      console.error("Failed to save medical info", e);
      setErrorMessage("Could not save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Emergency Profile Info Save
  const handleSaveEmergency = async () => {
    if (isSaving) return;

    const trimmedName = profileName.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    try {
      const current = (await getLocalProfile()) || {};
      const updated = {
        ...current,
        name: trimmedName,
        photo: profilePhoto,
      };
      await saveLocalProfile(updated);
      setUserData(updated);
      setActiveModal(null);
    } catch (e) {
      console.error("Failed to save emergency profile", e);
      setErrorMessage("Could not save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar Image Picker
  const pickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to photos to update your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType?.Images || ImagePicker.MediaTypeOptions?.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Error picking photo", err);
      Alert.alert("Error", "Could not select photo.");
    }
  };

  return (
    <LinearGradient colors={["#ff8c5a", "#ff6b3d"]} style={styles.container}>
      {/* Ambient background watermark shapes */}
      <View style={styles.decorCircleTop1} pointerEvents="none" />
      <View style={styles.decorCircleBottom} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Bar with Settings squircle button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={openEmergencyModal}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-sharp" size={19} color="#ff6b3d" />
            </TouchableOpacity>
          </View>

          {/* Compact Profile Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={openEmergencyModal}
              activeOpacity={0.85}
            >
              {userData.photo ? (
                <Image source={{ uri: userData.photo }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={36} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.headerTextContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {userData.name || "ResQ User"}
              </Text>
              <Text style={styles.userSubtitle}>SAFETY PROFILE</Text>
            </View>
          </View>

          {/* --- 1. PARENTS DETAILS CARD --- */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.headerIconBg}>
                  <Ionicons name="people" size={18} color="#ff6b3d" />
                </View>
                <Text style={styles.cardTitle}>Parents Details</Text>
              </View>

              <TouchableOpacity
                style={styles.editPill}
                onPress={openParentsModal}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="pencil"
                  size={12}
                  color="#ff6b3d"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.editPillText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Phone item */}
            <View style={styles.itemRow}>
              <View style={styles.itemIconBg}>
                <Ionicons name="call" size={15} color="#ff6b3d" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Phone</Text>
                <Text style={styles.itemValue}>{userData.phone || "Not set"}</Text>
              </View>
            </View>

            <View style={styles.itemDivider} />

            {/* Address item */}
            <View style={styles.itemRow}>
              <View style={styles.itemIconBg}>
                <Ionicons name="location" size={15} color="#ff6b3d" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Address</Text>
                <Text style={styles.itemValue}>{userData.address || "Not set"}</Text>
              </View>
            </View>
          </View>

          {/* --- 2. MEDICAL INFO CARD --- */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.headerIconBg}>
                  <Ionicons name="medical" size={18} color="#ff6b3d" />
                </View>
                <Text style={styles.cardTitle}>Medical Info</Text>
              </View>

              <TouchableOpacity
                style={styles.editPill}
                onPress={openMedicalModal}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="pencil"
                  size={12}
                  color="#ff6b3d"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.editPillText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Blood Group item */}
            <View style={styles.itemRow}>
              <View style={styles.itemIconBg}>
                <Ionicons name="water" size={15} color="#ff6b3d" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Blood Group</Text>
                <Text
                  style={[
                    styles.itemValue,
                    userData.bloodGroup ? styles.bloodGroupHighlight : null,
                  ]}
                >
                  {userData.bloodGroup || "-"}
                </Text>
              </View>
            </View>

            <View style={styles.itemDivider} />

            {/* Allergies item */}
            <View style={styles.itemRow}>
              <View style={styles.itemIconBg}>
                <Ionicons name="flower" size={15} color="#ff6b3d" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Allergies</Text>
                <Text style={styles.itemValue}>{userData.allergies || "None"}</Text>
              </View>
            </View>

            <View style={styles.itemDivider} />

            {/* Notes item */}
            <View style={styles.itemRow}>
              <View style={styles.itemIconBg}>
                <Ionicons name="document-text" size={15} color="#ff6b3d" />
              </View>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemLabel}>Notes</Text>
                <Text style={styles.itemValue}>
                  {userData.note || "No additional medical notes."}
                </Text>
              </View>
            </View>
          </View>

          {/* --- 3. EMERGENCY NETWORK CARD --- */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={[styles.headerIconBg, { backgroundColor: "#eef4ff" }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#0f56da" />
                </View>
                <Text style={styles.cardTitle}>Emergency Network</Text>
              </View>

              <TouchableOpacity
                style={styles.editPill}
                onPress={openEmergencyModal}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="pencil"
                  size={12}
                  color="#ff6b3d"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.editPillText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.networkSubtitle}>
              You have {contacts.length} trusted contact(s) active.
            </Text>

            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() => router.push("/myCircle")}
              activeOpacity={0.85}
            >
              <Ionicons
                name="people"
                size={18}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.manageBtnText}>Manage Contacts</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom spacing to clear floating tab bar */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>

      {/* =========================================================================
          MODAL 1: EDIT PARENTS DETAILS
         ========================================================================= */}
      <Modal
        visible={activeModal === "parents"}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <View style={styles.headerIconBg}>
                  <Ionicons name="people" size={18} color="#ff6b3d" />
                </View>
                <Text style={styles.modalTitle}>Edit Parents Details</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#888888" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Parent Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color="#888888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={parentPhone}
                  onChangeText={(text) => {
                    setParentPhone(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="+91 9876543210"
                  placeholderTextColor="#aaaaaa"
                  keyboardType="phone-pad"
                />
              </View>

              <Text style={styles.inputLabel}>Parent / Emergency Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#888888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={parentAddress}
                  onChangeText={(text) => {
                    setParentAddress(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="e.g. 123 MG Road, Kolkata"
                  placeholderTextColor="#aaaaaa"
                />
              </View>

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color="#d32f2f" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={closeModal}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && styles.btnDisabled]}
                  onPress={handleSaveParents}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* =========================================================================
          MODAL 2: EDIT MEDICAL INFO
         ========================================================================= */}
      <Modal
        visible={activeModal === "medical"}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <View style={styles.headerIconBg}>
                  <Ionicons name="medical" size={18} color="#ff6b3d" />
                </View>
                <Text style={styles.modalTitle}>Edit Medical Info</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#888888" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Blood Group</Text>
              <View style={styles.bloodGroupGrid}>
                {BLOOD_GROUPS.map((bg) => {
                  const isSelected = medicalBloodGroup === bg;
                  return (
                    <TouchableOpacity
                      key={bg}
                      style={[
                        styles.bloodGroupChip,
                        isSelected && styles.bloodGroupChipActive,
                      ]}
                      onPress={() => setMedicalBloodGroup(isSelected ? "" : bg)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.bloodGroupChipText,
                          isSelected && styles.bloodGroupChipTextActive,
                        ]}
                      >
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Allergies</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="flower-outline"
                  size={18}
                  color="#888888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={medicalAllergies}
                  onChangeText={(text) => {
                    setMedicalAllergies(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="e.g. Peanuts, Penicillin, Dust (or None)"
                  placeholderTextColor="#aaaaaa"
                />
              </View>

              <Text style={styles.inputLabel}>Medical Notes / Conditions</Text>
              <View
                style={[
                  styles.inputWrapper,
                  { height: 80, alignItems: "flex-start", paddingTop: 10 },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color="#888888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.textInput,
                    { height: "100%", textAlignVertical: "top" },
                  ]}
                  value={medicalNote}
                  onChangeText={(text) => {
                    setMedicalNote(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="e.g. Asthmatic, wears contact lenses..."
                  placeholderTextColor="#aaaaaa"
                  multiline={true}
                />
              </View>

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color="#d32f2f" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={closeModal}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && styles.btnDisabled]}
                  onPress={handleSaveMedical}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* =========================================================================
          MODAL 3: EDIT EMERGENCY PROFILE / USER IDENTITY
         ========================================================================= */}
      <Modal
        visible={activeModal === "emergency"}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <View style={[styles.headerIconBg, { backgroundColor: "#eef4ff" }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#0f56da" />
                </View>
                <Text style={styles.modalTitle}>Edit Emergency Profile</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color="#888888" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Avatar Photo Picker */}
              <View style={styles.avatarPickerSection}>
                <TouchableOpacity
                  style={styles.avatarPickerContainer}
                  onPress={pickPhoto}
                  activeOpacity={0.8}
                >
                  {profilePhoto ? (
                    <Image
                      source={{ uri: profilePhoto }}
                      style={styles.avatarPickerImage}
                    />
                  ) : (
                    <View style={styles.avatarPickerPlaceholder}>
                      <Ionicons name="person" size={38} color="#ffffff" />
                    </View>
                  )}
                  <View style={styles.cameraIconBadge}>
                    <Ionicons name="camera" size={13} color="#ffffff" />
                  </View>
                </TouchableOpacity>

                <View style={styles.avatarPickerActions}>
                  <TouchableOpacity
                    onPress={pickPhoto}
                    style={styles.changePhotoBtn}
                  >
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                  </TouchableOpacity>
                  {profilePhoto ? (
                    <TouchableOpacity
                      onPress={() => setProfilePhoto("")}
                      style={styles.removePhotoBtn}
                    >
                      <Text style={styles.removePhotoText}>Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#888888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={profileName}
                  onChangeText={(text) => {
                    setProfileName(text);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="ResQ User"
                  placeholderTextColor="#aaaaaa"
                />
              </View>

              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color="#d32f2f" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={closeModal}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && styles.btnDisabled]}
                  onPress={handleSaveEmergency}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Subtle ambient watermark rings
  decorCircleTop1: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 28,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  decorCircleBottom: {
    position: "absolute",
    bottom: 90,
    left: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 24,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  // Top Bar & Settings
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 10,
  },
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  // Profile Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  avatarContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#3e4956",
    borderWidth: 2.5,
    borderColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3e4956",
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  userSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.85)",
    letterSpacing: 1.6,
    marginTop: 4,
  },

  // Cards
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff0eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#222222",
  },

  // Edit Pill
  editPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff0eb",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
  },
  editPillText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#ff6b3d",
  },

  // Items inside card
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  itemIconBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff5f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 11.5,
    color: "#8e8e93",
    fontWeight: "500",
  },
  itemValue: {
    fontSize: 14.5,
    color: "#222222",
    fontWeight: "600",
    marginTop: 2,
  },
  bloodGroupHighlight: {
    color: "#d32f2f",
    fontWeight: "700",
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#f5f5f7",
    marginVertical: 8,
    marginLeft: 42,
  },

  // Emergency Network Card specific
  networkSubtitle: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 14,
    marginTop: 2,
  },
  manageBtn: {
    backgroundColor: "#0f56da",
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0f56da",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  manageBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  // --- MODAL & FORM STYLING ---
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 14,
  },
  modalHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222222",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollContent: {
    paddingBottom: 10,
  },

  // Form Fields
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#f9f9fb",
    borderWidth: 1,
    borderColor: "#e5e5ea",
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 14.5,
    color: "#222222",
    paddingVertical: 0,
  },

  // Blood Group Chips
  bloodGroupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  bloodGroupChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#f4f4f6",
    borderWidth: 1,
    borderColor: "#e5e5ea",
    minWidth: 50,
    alignItems: "center",
  },
  bloodGroupChipActive: {
    backgroundColor: "#ff6b3d",
    borderColor: "#ff6b3d",
  },
  bloodGroupChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444444",
  },
  bloodGroupChipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // Avatar Photo Picker inside Modal
  avatarPickerSection: {
    alignItems: "center",
    marginVertical: 10,
  },
  avatarPickerContainer: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#3e4956",
    position: "relative",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  avatarPickerImage: {
    width: "100%",
    height: "100%",
  },
  avatarPickerPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ff6b3d",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarPickerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  changePhotoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  changePhotoText: {
    fontSize: 13,
    color: "#ff6b3d",
    fontWeight: "600",
  },
  removePhotoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removePhotoText: {
    fontSize: 13,
    color: "#999999",
    fontWeight: "500",
  },

  // Error Banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },

  // Modal Action Buttons
  modalActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 6,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#f2f2f5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: "#666666",
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1.3,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#ff6b3d",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff6b3d",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.65,
  },
});