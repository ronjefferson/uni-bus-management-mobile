import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, RefreshControl, 
  ActivityIndicator, TouchableOpacity, LayoutAnimation, 
  Platform, UIManager, Modal, Animated, Dimensions, Pressable, TextInput 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getMyChildren, getChildLogs } from '../../../src/features/parent/parentService';
import { useChildLogsViewModel } from '../../../src/features/parent/useChildLogsViewModel';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const WEEK_DAYS = [
  { code: 'Mo', label: 'Mon' }, { code: 'Tu', label: 'Tue' }, { code: 'We', label: 'Wed' },
  { code: 'Th', label: 'Thu' }, { code: 'Fr', label: 'Fri' }, { code: 'Sa', label: 'Sat' }, { code: 'Su', label: 'Sun' },
];

const FilterChip = ({ label, value, current, onSelect }) => (
  <TouchableOpacity 
    style={[styles.chip, current === value && styles.chipActive]} 
    onPress={() => onSelect(current === value ? '' : value)}
  >
    <Text style={[styles.chipText, current === value && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const DateInput = ({ label, value, onPress }) => (
  <View style={{ flex: 1 }}>
    <Text style={styles.filterLabel}>{label}</Text>
    <TouchableOpacity style={styles.dateInputButton} onPress={onPress}>
      <Ionicons name="calendar-outline" size={18} color="#666" />
      <Text style={[styles.dateText, !value && { color: '#aaa' }]}>{value || "Select Date"}</Text>
    </TouchableOpacity>
  </View>
);

const ChildLogsSheet = ({ student, onClose }) => {
  const { 
    logs, isLoading, isRefreshing, handleRefresh,
    filters, updateFilter, normalizeBusFilter, applyFilters, resetFilters
  } = useChildLogsViewModel(student?.university_id);

  const insets = useSafeAreaInsets();
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height;

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); 
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const openFilter = () => {
    setFilterVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, damping: 20 })
    ]).start();
  };

  const closeFilter = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true })
    ]).start(() => setFilterVisible(false));
  };

  const handleApply = () => {
    applyFilters();
    closeFilter();
  };

  const handleClear = () => {
    resetFilters();
    closeFilter();
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateFilter(pickerTarget, formattedDate);
    }
  };

  const openPicker = (target) => {
    setPickerTarget(target);
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={[styles.sheetContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.sheetHeader}>
        <View style={styles.sheetHeaderInfo}>
          <Text style={styles.sheetTitle}>{student.first_name}'s History</Text>
          <Text style={styles.sheetSubtitle}>Scan logs and activity</Text>
        </View>
        <TouchableOpacity style={styles.closeSheetBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.logsToolbar}>
        <TouchableOpacity style={styles.filterBtn} onPress={openFilter}>
          <Ionicons name="options-outline" size={18} color="white" />
          <Text style={styles.filterBtnText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !isRefreshing ? (
        <ActivityIndicator size="large" color="#404072ff" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.logsList}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#404072ff" />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No logs found for this period.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <View style={styles.logLeft}>
                <View>
                  <Text style={styles.busText}>{item.bus_number}</Text>
                  <Text style={styles.logDate}>{formatDate(item.timestamp)}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[
                  styles.statusText, 
                  item.status === 'VALID' ? styles.green : item.status === 'INVALID' ? styles.red : styles.orange
                ]}>
                  {item.status}
                </Text>
                <Text style={styles.directionText}>{item.direction}</Text>
              </View>
            </View>
          )}
        />
      )}

      <Modal transparent={true} visible={isFilterVisible} onRequestClose={closeFilter} animationType="none">
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
             <Pressable style={{flex: 1}} onPress={closeFilter} />
          </Animated.View>
          <Animated.View 
            style={[
              styles.filterSheet, 
              { 
                transform: [{ translateY: slideAnim.interpolate({inputRange:[0,1], outputRange:[screenHeight, 0]}) }],
                paddingBottom: Math.max(insets.bottom + 20, 40) // Dynamic safe area padding
              }
            ]}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.filterTitle}>Filter Logs</Text>

            <View style={{ marginBottom: 15 }}>
              <Text style={styles.filterLabel}>Bus Number</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 1" 
                value={filters.bus_number}
                onChangeText={(t) => updateFilter('bus_number', t)}
                onEndEditing={normalizeBusFilter}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.dateRow}>
              <DateInput label="From Date" value={filters.from_date} onPress={() => openPicker('from_date')} />
              <DateInput label="To Date" value={filters.to_date} onPress={() => openPicker('to_date')} />
            </View>

            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.chipRow}>
              <FilterChip label="Valid" value="VALID" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
              <FilterChip label="Invalid" value="INVALID" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
              <FilterChip label="Override" value="OVERRIDE" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
            </View>

            <Text style={styles.filterLabel}>Direction</Text>
            <View style={styles.chipRow}>
              <FilterChip label="Inbound" value="INBOUND" current={filters.direction} onSelect={(v) => updateFilter('direction', v)} />
              <FilterChip label="Outbound" value="OUTBOUND" current={filters.direction} onSelect={(v) => updateFilter('direction', v)} />
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const useMyChildrenViewModel = () => {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchChildren = useCallback(async () => {
    try {
      const data = await getMyChildren();
      setChildren(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchChildren();
    setIsRefreshing(false);
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchChildren();
      setIsLoading(false);
    };
    init();
  }, [fetchChildren]);

  return { children, isLoading, isRefreshing, handleRefresh };
};

const ChildCard = ({ student, onPress }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { schedule_details } = student;
  const activeDays = schedule_details?.days_list || [];

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.nameText}>{student.first_name} {student.last_name}</Text>
            <Text style={styles.uniIdText}>ID: {student.university_id}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Course</Text>
            <Text style={styles.value}>{schedule_details?.course || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Year</Text>
            <Text style={styles.value}>{schedule_details?.year || 'N/A'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.scheduleContainer}>
          <View style={styles.divider} />
          <Text style={styles.scheduleTitle}>Weekly Schedule</Text>
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
      )}

      <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
        <Text style={styles.expandText}>{isExpanded ? 'Hide Schedule' : 'View Schedule'}</Text>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6B7280" 
        />
      </TouchableOpacity>
    </View>
  );
};

export default function MyChildrenScreen() {
  const { 
    children, isLoading, isRefreshing, handleRefresh 
  } = useMyChildrenViewModel();

  const [selectedStudent, setSelectedStudent] = useState(null);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#404072ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.headerTitle}>My Children</Text>
        <Text style={styles.headerSubtitle}>Monitor schedules and attendance</Text>
      </View>

      <View style={styles.bottomSheet}>
        <FlatList
          data={children}
          keyExtractor={(item) => item.university_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={handleRefresh} 
              tintColor="#404072ff"
              colors={['#404072ff']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No children linked yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ChildCard 
              student={item} 
              onPress={() => setSelectedStudent(item)} 
            />
          )}
        />
      </View>

      <Modal 
        animationType="slide" 
        visible={!!selectedStudent} 
        onRequestClose={() => setSelectedStudent(null)}
        presentationStyle="pageSheet"
      >
        {selectedStudent && (
          <ChildLogsSheet 
            student={selectedStudent} 
            onClose={() => setSelectedStudent(null)} 
          />
        )}
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#404072ff' },
  // Changed background color to white to show the spinner correctly
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  topSection: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 25 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: '#E5E7EB', opacity: 0.9 },
  bottomSheet: { flex: 1, backgroundColor: '#ffffff', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  listContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#F3F4F6', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#404072ff' },
  headerInfo: { flex: 1 },
  nameText: { fontSize: 18, fontWeight: '700', color: '#111827' },
  uniIdText: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '500' },
  infoGrid: { flexDirection: 'row', marginBottom: 10, gap: 20 },
  infoItem: { flex: 1 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase' },
  value: { fontSize: 15, color: '#111827', fontWeight: '600' },
  scheduleContainer: { marginTop: 5, marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 15 },
  scheduleTitle: { fontSize: 14, fontWeight: '700', color: '#404072ff', marginBottom: 15 },
  tableContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  dayColumn: { alignItems: 'center', width: 34 },
  dayLabel: { fontSize: 11, color: '#6B7280', marginBottom: 8, fontWeight: '600' },
  statusBox: { width: 28, height: 28, borderRadius: 8 },
  activeBox: { backgroundColor: '#10B981' },
  inactiveBox: { backgroundColor: '#E5E7EB' },
  expandButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 6 },
  expandText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9CA3AF', marginTop: 10, fontSize: 16, fontWeight: '500' },

  sheetContainer: { flex: 1, backgroundColor: 'white' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  sheetSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  closeSheetBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 20 },
  logsToolbar: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'white' },
  filterBtn: { flexDirection: 'row', backgroundColor: '#404072ff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start', alignItems: 'center', gap: 6 },
  filterBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
  logsList: { padding: 20 },
  
  logItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0
  },
  logLeft: { flexDirection: 'row', alignItems: 'center' },
  busText: { fontWeight: '700', fontSize: 16, color: '#1F2937' },
  logDate: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  statusText: { fontWeight: '700', fontSize: 13, marginBottom: 2 },
  directionText: { color: '#6B7280', fontSize: 12, textAlign: 'right' },
  green: { color: '#059669' }, 
  red: { color: '#DC2626' }, 
  orange: { color: '#D97706' },

  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  filterSheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 0 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20, marginTop: 10 },
  filterTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  filterLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, color: '#374151' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', padding: 12, borderRadius: 10, backgroundColor: '#F9FAFB' },
  dateRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  dateInputButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, borderRadius: 10, backgroundColor: '#F9FAFB' },
  dateText: { fontSize: 14, color: '#374151' },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F3F4F6' },
  chipActive: { backgroundColor: '#404072ff' },
  chipText: { fontSize: 13, color: '#4B5563' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  clearBtn: { flex: 1, backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  clearBtnText: { color: '#4B5563', fontWeight: 'bold' },
  applyBtn: { flex: 1, backgroundColor: '#404072ff', padding: 16, borderRadius: 12, alignItems: 'center' },
  applyBtnText: { color: 'white', fontWeight: 'bold' },
});