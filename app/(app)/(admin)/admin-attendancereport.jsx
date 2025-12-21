import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, RefreshControl, 
  ActivityIndicator, TouchableOpacity, ScrollView, Modal, 
  Animated, Dimensions, TextInput, Pressable, Platform, 
  UIManager, PanResponder
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAdminAttendanceReport } from '../../../src/features/admin/useAdminAttendanceReport';
import { useAdminScanLogsViewModel } from '../../../src/features/admin/useAdminScanLogsViewModel';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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
      <Text style={[styles.dateTextInput, !value && { color: '#aaa' }]}>{value || "Select Date"}</Text>
    </TouchableOpacity>
  </View>
);

const ScanLogsList = () => {
  const { 
    logs, isLoading, isRefreshing, handleRefresh,
    filters, updateFilter, normalizeBusFilter, applyFilters, resetFilters
  } = useAdminScanLogsViewModel();

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const screenHeight = Dimensions.get('window').height;
  const insets = useSafeAreaInsets();

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          closeFilter();
        } else {
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
    })
  ).current;

  const formatLogDateTime = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return { dateStr: `${day}/${month}/${year}`, timeStr: `${hours}:${minutes}` };
  };

  const formatDirection = (rawDirection) => {
    if (!rawDirection) return '';
    const d = rawDirection.toUpperCase();
    if (d.startsWith('IN')) return 'Inbound';
    if (d.startsWith('OUT')) return 'Outbound';
    return rawDirection;
  };

  const openFilter = () => {
    setFilterVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20 })
    ]).start();
  };

  const closeFilter = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: screenHeight, duration: 250, useNativeDriver: true })
    ]).start(() => {
      setFilterVisible(false);
      setShowDatePicker(false);
    });
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      updateFilter('timestamp__date', selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleApply = () => {
    applyFilters();
    closeFilter();
  };

  const handleClear = () => {
    resetFilters();
    closeFilter();
  };

  return (
    <View style={styles.tabContainer}>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.filterBtn} onPress={openFilter}>
          <Ionicons name="options-outline" size={18} color="white" />
          <Text style={styles.filterBtnText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#404072ff" />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#404072ff" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={48} color="#E5E7EB" />
              <Text style={styles.emptyText}>No logs for today.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const { dateStr, timeStr } = formatLogDateTime(item.timestamp);
            const direction = formatDirection(item.direction);

            return (
              <View style={styles.card}>
                <View style={styles.logHeader}>
                  <Text style={styles.studentName}>{item.student_name}</Text>
                  <Text style={[
                    styles.statusText, 
                    item.status === 'VALID' ? styles.green : item.status === 'INVALID' ? styles.red : styles.orange
                  ]}>{item.status}</Text>
                </View>
                
                <View style={styles.logDetails}>
                  <Text style={styles.detailText}>ID: <Text style={styles.detailValue}>{item.student_id}</Text></Text>
                  <View style={styles.detailDivider} />
                  <Text style={styles.detailText}>Bus: <Text style={styles.detailValue}>{item.bus_number}</Text></Text>
                </View>

                <View style={styles.metaContainer}>
                   <Text style={styles.dateLabel}>{dateStr}</Text>
                   <View style={styles.verticalSep} />
                   <Text style={styles.timeLabel}>{timeStr}</Text>
                   <View style={styles.verticalSep} />
                   <Text style={styles.directionLabel}>{direction}</Text>
                </View>
              </View>
            );
          }}
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
                transform: [{ translateY: slideAnim }],
                paddingBottom: Math.max(insets.bottom + 20, 40)
              }
            ]}
          >
            <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
              <View style={styles.sheetHandle} />
              <Text style={styles.filterTitle}>Filter Logs</Text>
            </View>

            <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={{ marginBottom: 15 }}>
                <Text style={styles.filterLabel}>Bus Number</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. 1" 
                  value={filters.bus_number}
                  onChangeText={(t) => updateFilter('bus_number', t)}
                  onEndEditing={normalizeBusFilter}
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={styles.filterLabel}>Student ID</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. 1002345" 
                  value={filters.student__university_id}
                  onChangeText={(t) => updateFilter('student__university_id', t)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={{ marginBottom: 15 }}>
                <DateInput label="Date" value={filters.timestamp__date} onPress={() => setShowDatePicker(true)} />
              </View>

              {showDatePicker && (
                <View style={styles.datePickerWrapper}>
                  {Platform.OS === 'ios' && (
                    <View style={styles.iosPickerHeader}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.iosDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <DateTimePicker
                    value={filters.timestamp__date ? new Date(filters.timestamp__date) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                    textColor={Platform.OS === 'ios' ? 'black' : undefined}
                  />
                </View>
              )}

              <Text style={styles.filterLabel}>Direction</Text>
              <View style={styles.chipRow}>
                <FilterChip label="Inbound" value="INBOUND" current={filters.direction} onSelect={(v) => updateFilter('direction', v)} />
                <FilterChip label="Outbound" value="OUTBOUND" current={filters.direction} onSelect={(v) => updateFilter('direction', v)} />
              </View>

              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.chipRow}>
                <FilterChip label="Valid" value="VALID" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
                <FilterChip label="Invalid" value="INVALID" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
                <FilterChip label="Override" value="OVERRIDE" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                  <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const DailyReportList = () => {
  const { 
    students, selectedDay, daysList, isLoading, isRefreshing, 
    handleDayChange, handleRefresh 
  } = useAdminAttendanceReport();

  return (
    <View style={styles.tabContainer}>
      <View style={styles.daySelectorContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayScrollContent}
        >
          {daysList.map((day) => (
            <TouchableOpacity 
              key={day} 
              style={[
                styles.dayChip, 
                selectedDay === day && styles.dayChipActive
              ]}
              onPress={() => handleDayChange(day)}
            >
              <Text style={[
                styles.dayText, 
                selectedDay === day && styles.dayTextActive
              ]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
              <Ionicons name="calendar-outline" size={48} color="#E5E7EB" />
              <Text style={styles.emptyText}>No students scheduled for {selectedDay}.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{item.full_name ? item.full_name.charAt(0) : 'S'}</Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text style={styles.nameText}>{item.full_name}</Text>
                  <Text style={styles.idText}>ID: {item.university_id}</Text>
                </View>
                <View style={styles.scheduleBadge}>
                  <Text style={styles.scheduleText}>#{item.schedule_id}</Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default function AdminReportsScreen() {
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Reports</Text>
        <Text style={styles.headerSubtitle}>View daily schedules and scan activity</Text>
      </View>

      <View style={styles.whiteSheet}>
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'daily' && styles.tabActive]} 
            onPress={() => setActiveTab('daily')}
          >
            <Text style={[styles.tabText, activeTab === 'daily' && styles.tabTextActive]}>Daily Report</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'logs' && styles.tabActive]} 
            onPress={() => setActiveTab('logs')}
          >
            <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>Scan Logs</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'daily' ? <DailyReportList /> : <ScanLogsList />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#404072ff' },
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 30 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: '#E5E7EB', opacity: 0.9 },
  whiteSheet: { flex: 1, backgroundColor: '#F9FAFB', borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },

  tabBar: { flexDirection: 'row', backgroundColor: 'transparent', padding: 4, margin: 16, borderRadius: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#eeeeeeff' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#404072ff', fontWeight: '700' },

  tabContainer: { flex: 1 },

  daySelectorContainer: { paddingVertical: 10, borderBottomWidth: 0 },
  dayScrollContent: { paddingHorizontal: 24, gap: 10 },
  dayChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 0 },
  dayChipActive: { backgroundColor: '#404072ff' },
  dayText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  dayTextActive: { color: '#ffffff' },

  toolbar: { paddingHorizontal: 24, paddingBottom: 10 },
  filterBtn: { flexDirection: 'row', backgroundColor: '#404072ff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start', alignItems: 'center', gap: 6 },
  filterBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },

  listContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },

  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12 },
  
  row: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#404072ff' },
  infoContainer: { flex: 1 },
  nameText: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  idText: { fontSize: 13, color: '#6B7280' },
  scheduleBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  scheduleText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },

  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  studentName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  statusText: { fontSize: 12, fontWeight: '700' },
  
  logDetails: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  detailText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  detailValue: { color: '#1F2937', fontWeight: '600' },
  detailDivider: { width: 1, height: 12, backgroundColor: '#E5E7EB' },

  metaContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dateLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  timeLabel: { fontSize: 13, color: '#1F2937', fontWeight: '700' },
  directionLabel: { fontSize: 13, color: '#4B5563', fontStyle: 'italic', backgroundColor: 'transparent', paddingRight: 4, },
  verticalSep: { width: 1, height: 10, backgroundColor: '#D1D5DB', marginHorizontal: 8 },

  green: { color: '#059669' }, 
  red: { color: '#DC2626' }, 
  orange: { color: '#D97706' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9CA3AF', marginTop: 10, fontSize: 16, fontWeight: '500' },

  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  filterSheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  
  dragHandleArea: { width: '100%', alignItems: 'center', marginBottom: 5 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: 15 },
  
  filterTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  filterLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, color: '#374151', backgroundColor: 'transparent' },
  
  input: { 
    backgroundColor: '#F3F4F6', 
    padding: 12, 
    borderRadius: 10, 
    fontSize: 16, 
    color: '#1F2937',
    borderWidth: 0
  },
  dateInputButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: '#F3F4F6',
    borderWidth: 0
  },
  dateTextInput: { fontSize: 14, color: '#374151' },
  
  datePickerWrapper: { backgroundColor: '#F9FAFB', borderRadius: 10, overflow: 'hidden', marginBottom: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  iosPickerHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 10, backgroundColor: '#F3F4F6', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  iosDoneText: { color: '#404072ff', fontWeight: 'bold', fontSize: 16 },

  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 20 },
  chip: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    backgroundColor: '#F3F4F6', 
    borderWidth: 0
  },
  chipActive: { 
    backgroundColor: '#404072ff', 
    borderWidth: 0
  },
  chipText: { fontSize: 13, color: '#4B5563' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10, paddingBottom: 20 },
  clearBtn: { flex: 1, backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  clearBtnText: { color: '#4B5563', fontWeight: 'bold' },
  applyBtn: { flex: 1, backgroundColor: '#404072ff', padding: 16, borderRadius: 12, alignItems: 'center' },
  applyBtnText: { color: 'white', fontWeight: 'bold' },
});