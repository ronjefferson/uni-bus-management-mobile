import React, { useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, 
  ScrollView, Modal, Pressable, Animated, Dimensions, Easing, 
  TextInput, Platform, PanResponder, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useParentProfileViewModel } from '../../../src/features/parent/useParentProfileViewModel'

export default function ParentProfileScreen() {
  const { 
    parent, isLoading, isLinking, error,
    isLinkModalVisible, setLinkModalVisible,
    linkForm, handleUpdateForm, handleLinkSubmit, handleLogout
  } = useParentProfileViewModel();

  const screenHeight = Dimensions.get('window').height;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (e) => {
      Animated.timing(keyboardOffset, {
        toValue: -e.endCoordinates.height, 
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    };

    const onKeyboardHide = (e) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    };

    const showListener = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideListener = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0 && JSON.stringify(keyboardOffset) === '0') {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          closeModal();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4
          }).start();
        }
      },
    })
  ).current;

  const openModal = () => {
    setLinkModalVisible(true);
    slideAnim.setValue(screenHeight); 
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { 
        toValue: 0, 
        useNativeDriver: true, 
        damping: 20,
        stiffness: 90
      })
    ]).start();
  };

  const closeModal = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { 
        toValue: screenHeight, 
        duration: 250, 
        useNativeDriver: true, 
        easing: Easing.in(Easing.cubic) 
      })
    ]).start(() => {
        setLinkModalVisible(false);
        keyboardOffset.setValue(0);
    });
  };

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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {parent?.first_name?.charAt(0)}{parent?.last_name?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.nameText}>{parent?.first_name} {parent?.last_name}</Text>
          <Text style={styles.emailText}>{parent?.email}</Text>
        </View>
      </View>

      <View style={styles.bottomSheetContainer}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>Account Actions</Text>

          <TouchableOpacity style={styles.actionCard} onPress={openModal}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-add" size={22} color="#ffffff" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Link a Child</Text>
              <Text style={styles.actionSub}>Add a student account using their code</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Information</Text>
          <View style={styles.infoItem}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBoxGray}>
                <Ionicons name="call-outline" size={20} color="#4B5563" />
              </View>
              <View>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.value}>{parent?.phone_number || "N/A"}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      <Modal 
        transparent={true} 
        visible={isLinkModalVisible} 
        onRequestClose={closeModal} 
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <Pressable style={{flex: 1}} onPress={closeModal} />
          </Animated.View>

          <Animated.View 
            style={[
              styles.modalSheet, 
              { 
                transform: [
                    { translateY: slideAnim },     
                    { translateY: keyboardOffset } 
                ] 
              }
            ]}
          >
            <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
              <View style={styles.sheetHandle} />
            </View>
            
            <ScrollView 
              bounces={false} 
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sheetTitle}>Link Student Account</Text>
              <Text style={styles.sheetSubtitle}>Enter the details provided by the university.</Text>

              {error ? (
                <Text style={styles.inlineErrorText}>
                  {error}
                </Text>
              ) : null}

              <View style={styles.formContainer}>
                
                <Text style={styles.inputLabel}>University ID</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. 1002345"
                  placeholderTextColor="#9CA3AF"
                  value={linkForm.child_university_id}
                  onChangeText={(t) => handleUpdateForm('child_university_id', t)}
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Registration Code</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="e.g. 10935BA447"
                  placeholderTextColor="#9CA3AF"
                  value={linkForm.child_registration_code}
                  onChangeText={(t) => handleUpdateForm('child_registration_code', t)}
                  autoCapitalize="characters"
                />

                <View style={styles.btnRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.submitBtn, isLinking && { backgroundColor: '#666' }]} 
                    onPress={handleLinkSubmit}
                    disabled={isLinking}
                  >
                    {isLinking ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.submitBtnText}>Link Account</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
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
  logoutButton: { backgroundColor: 'white', padding: 8, borderRadius: 20 },
  
  avatarSection: { alignItems: 'center' },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 32, color: '#404072ff', fontWeight: '800' },
  nameText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  emailText: { fontSize: 14, color: '#CCCCFF', marginTop: 4 },

  bottomSheetContainer: {
    flex: 1, 
    backgroundColor: '#ffffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    overflow: 'hidden', 
  },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 25 },

  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#404072ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  actionSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  infoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 14, marginBottom: 10 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBoxGray: { width: 40, height: 40, backgroundColor: '#E5E7EB', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  value: { fontSize: 16, color: '#111827', fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },

  backdrop: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  
  modalSheet: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    elevation: 10,
    width: '100%',
    maxHeight: '85%', 
  },
  
  modalScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40 
  },

  dragHandleArea: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3 },
  
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sheetSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 5, marginBottom: 15 },
  
  inlineErrorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15, 
  },

  formContainer: { gap: 15 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: -5 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, fontSize: 16, color: '#1F2937' },
  
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { color: '#4B5563', fontWeight: 'bold', fontSize: 16 },
  submitBtn: { flex: 2, backgroundColor: '#404072ff', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});