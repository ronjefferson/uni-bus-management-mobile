import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, 
  ScrollView, Modal, Pressable, Animated, Dimensions, Easing, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudentProfileViewModel } from '../../../src/features/student/useStudentProfileViewModel';

export default function ProfileScreen() {
  const { 
    student, isLoading, handleLogoutPress,
    connectedAccounts, isAccountsLoading, 
    showAccountsModal, handleOpenAccounts, handleCloseAccounts
  } = useStudentProfileViewModel();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  const openModal = () => {
    handleOpenAccounts(); 
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, damping: 20 })
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true, easing: Easing.in(Easing.cubic) })
    ]).start(() => {
      handleCloseAccounts();
    });
  };

  const sheetTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const backdropOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#404072ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>My Profile</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {student?.first_name?.charAt(0)}{student?.last_name?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.nameText}>{student?.first_name} {student?.last_name}</Text>
          <Text style={styles.idText}>University ID: {student?.university_id}</Text>
        </View>
      </View>

      <View style={styles.bottomSheetContainer}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>Student Details</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBoxGray}>
                <Ionicons name="mail-outline" size={20} color="#4B5563" />
              </View>
              <View>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{student?.email || "N/A"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBoxGray}>
                <Ionicons name="qr-code-outline" size={20} color="#4B5563" />
              </View>
              <View>
                <Text style={styles.label}>Registration Code</Text>
                <Text style={[styles.value, styles.codeValue]}>{student?.registration_code || "N/A"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBoxGray}>
                <Ionicons name="time-outline" size={20} color="#4B5563" />
              </View>
              <View>
                <Text style={styles.label}>Joined Date</Text>
                <Text style={styles.value}>{new Date(student?.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Relationships</Text>

          <TouchableOpacity style={styles.actionRow} onPress={openModal}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBoxBlue}>
                <Ionicons name="people" size={20} color="white" />
              </View>
              <View>
                <Text style={styles.actionLabel}>Connected Accounts</Text>
                <Text style={styles.actionSub}>View parents and guardians</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

        </ScrollView>
      </View>

      <Modal transparent={true} visible={showAccountsModal} onRequestClose={closeModal} animationType="none">
        <View style={styles.modalContainer}>
          
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable style={{flex: 1}} onPress={closeModal} />
          </Animated.View>

          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Parents & Guardians</Text>

            {isAccountsLoading ? (
              <ActivityIndicator size="large" color="#404072ff" style={{marginTop: 20}} />
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {connectedAccounts.length === 0 ? (
                  <Text style={styles.emptyText}>No connected accounts found.</Text>
                ) : (
                  connectedAccounts.map((parent, index) => (
                    <View key={index} style={styles.parentCard}>
                      <View style={styles.parentAvatar}>
                        <Text style={styles.parentAvatarText}>
                          {parent.first_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{flex: 1}}>
                        <Text style={styles.parentName}>
                          {parent.first_name} {parent.last_name}
                        </Text>
                        <Text style={styles.parentDetail}>{parent.email}</Text>
                        <Text style={styles.parentDetail}>{parent.phone_number}</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#404072ff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  topSection: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontSize: 28, fontWeight: '800', color: '#ffffffff' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 8, borderRadius: 20 },
  
  avatarSection: { alignItems: 'center' },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 32, color: '#404072ff', fontWeight: '800' },
  nameText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  idText: { fontSize: 16, color: '#CCCCFF', marginTop: 4 },

  bottomSheetContainer: {
    flex: 1, 
    backgroundColor: '#ffffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    overflow: 'hidden', 
  },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },

  infoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 14, marginBottom: 10 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBoxGray: { width: 40, height: 40, backgroundColor: '#E5E7EB', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  value: { fontSize: 16, color: '#111827', fontWeight: '600' },
  codeValue: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1 },

  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 14 },
  iconBoxBlue: { width: 40, height: 40, backgroundColor: '#404072ff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionLabel: { fontSize: 16, color: '#111827', fontWeight: '600' },
  actionSub: { fontSize: 12, color: '#6B7280' },

  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, elevation: 10 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#e5e7eb', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#111' },
  
  parentCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
  parentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  parentAvatarText: { color: '#4B5563', fontWeight: 'bold', fontSize: 18 },
  parentName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  parentDetail: { fontSize: 13, color: '#6B7280' },
  
  closeButton: { marginTop: 15, backgroundColor: '#F3F4F6', padding: 15, borderRadius: 12, alignItems: 'center' },
  closeButtonText: { fontWeight: 'bold', color: '#374151' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 20 }
});