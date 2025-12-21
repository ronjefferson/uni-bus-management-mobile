import React, { useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, RefreshControl, 
  ActivityIndicator, TextInput, TouchableOpacity, Modal, 
  Dimensions, Animated, Pressable, Platform, UIManager, 
  ScrollView, PanResponder 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdminStudentListViewModel } from '../../../src/features/admin/useAdminStudentListViewModel';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const WEEK_DAYS = [
  { code: 'Mo', label: 'Mon' }, { code: 'Tu', label: 'Tue' }, { code: 'We', label: 'Wed' },
  { code: 'Th', label: 'Thu' }, { code: 'Fr', label: 'Fri' }, { code: 'Sa', label: 'Sat' }, { code: 'Su', label: 'Sun' },
];

const StudentDetailSheet = ({ student, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const screenHeight = Dimensions.get('window').height;

  const { schedule_details, parents } = student;
  const activeDays = schedule_details?.days_list || [];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20 })
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { 
        toValue: screenHeight, 
        duration: 250, 
        useNativeDriver: true 
      })
    ]).start(onClose);
  };

  return (
    <View style={styles.modalContainer}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={{flex: 1}} onPress={handleClose} />
      </Animated.View>

      <Animated.View 
        style={[
          styles.sheet, 
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
          <View style={styles.sheetHandle} />
        </View>
        
        <ScrollView contentContainerStyle={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetAvatar}>
              <Text style={styles.sheetAvatarText}>
                {student.first_name?.[0]}{student.last_name?.[0]}
              </Text>
            </View>
            <Text style={styles.sheetName}>{student.first_name} {student.last_name}</Text>
            <Text style={styles.sheetId}>{student.university_id}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Student Information</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                  {student.email || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Registration Code</Text>
                <Text style={styles.value}>{student.registration_code || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.infoBox, { flex: 2, marginRight: 8 }]}>
                <Text style={styles.label}>Course</Text>
                <Text 
                  style={styles.value} 
                  numberOfLines={1} 
                  ellipsizeMode="tail"
                >
                  {schedule_details?.course || 'N/A'}
                </Text>
              </View>
              
              <View style={[styles.infoBox, { flex: 1 }]}>
                <Text style={styles.label}>Year</Text>
                <Text style={styles.value}>{schedule_details?.year || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.scheduleSection}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            <View style={styles.tableContainer}>
              {WEEK_DAYS.map((day) => {
                const isActive = activeDays.includes(day.code);
                return (
                  <View key={day.code} style={styles.dayColumn}>
                    <Text style={styles.dayLabel}>{day.label}</Text>
                    <View style={[styles.statusBox, isActive ? styles.activeBox : styles.inactiveBox]} />
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Linked Parents</Text>
            {parents && parents.length > 0 ? (
              parents.map((parent) => (
                <View key={parent.id} style={styles.parentCard}>
                  <Ionicons name="person-circle-outline" size={32} color="#9CA3AF" />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.parentName}>{parent.name}</Text>
                    <Text style={styles.parentContact}>{parent.email}</Text>
                    <Text style={styles.parentContact}>{parent.phone}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No parents linked.</Text>
            )}
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const StudentListItem = ({ student, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {student.first_name?.[0] || 'S'}
            {student.last_name?.[0] || ''}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>
            {student.first_name} {student.last_name}
          </Text>
          <Text style={styles.idText}>ID: {student.university_id}</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
};

export default function AdminStudentList() {
  const { 
    students, searchQuery, isLoading, isRefreshing, selectedStudent,
    handleRefresh, handleSearch, handleSelectStudent, handleCloseDetail
  } = useAdminStudentListViewModel();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Directory</Text>
        <Text style={styles.headerSubtitle}>Manage and view all registered students</Text>
      </View>

      <View style={styles.whiteSheet}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, ID, or email..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#404072ff" />
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.university_id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#404072ff" />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>No students found.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <StudentListItem 
                student={item} 
                onPress={() => handleSelectStudent(item)} 
              />
            )}
          />
        )}
      </View>

      <Modal 
        animationType="none" 
        transparent={true} 
        visible={!!selectedStudent} 
        onRequestClose={handleCloseDetail}
      >
        {selectedStudent && (
          <StudentDetailSheet 
            student={selectedStudent} 
            onClose={handleCloseDetail} 
          />
        )}
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#404072ff' },
  
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 30 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: '#E5E7EB', opacity: 0.9 },

  whiteSheet: { flex: 1, backgroundColor: '#F9FAFB', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },

  searchContainer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, backgroundColor: '#F9FAFB', borderBottomWidth: 0 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: 16, color: '#1F2937' },

  listContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },

  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#404072ff' },
  infoContainer: { flex: 1 },
  nameText: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  idText: { fontSize: 13, color: '#6B7280' },

  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', width: '100%' },
  
  dragHandleArea: { width: '100%', height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3 },
  
  sheetContent: { paddingHorizontal: 24, paddingBottom: 40 },

  sheetHeader: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  sheetAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  sheetAvatarText: { fontSize: 28, fontWeight: '800', color: '#404072ff' },
  sheetName: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center' },
  sheetId: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  infoSection: { gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 10 },
  infoRow: { marginBottom: 5 },
  infoBox: { flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  value: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  
  scheduleSection: { marginTop: 10 },
  tableContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  dayColumn: { alignItems: 'center', width: 40 },
  dayLabel: { fontSize: 12, color: '#6B7280', marginBottom: 8, fontWeight: '600' },
  statusBox: { width: 32, height: 32, borderRadius: 8 },
  activeBox: { backgroundColor: '#10B981' },
  inactiveBox: { backgroundColor: '#E5E7EB' },

  parentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginBottom: 8 },
  parentName: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  parentContact: { fontSize: 12, color: '#6B7280' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  closeBtn: { marginTop: 30, backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  closeBtnText: { color: '#4B5563', fontWeight: 'bold', fontSize: 16 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9CA3AF', marginTop: 10, fontSize: 16, fontWeight: '500' },
});