import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, RefreshControl, 
  ActivityIndicator, TextInput, TouchableOpacity, Modal, 
  Pressable, Platform, Animated, Dimensions, PanResponder 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStudentScheduleViewModel } from '../../../src/features/student/useStudentScheduleViewModel';

const WEEK_DAYS = [
  { code: 'Mo', label: 'Mon' }, { code: 'Tu', label: 'Tue' }, { code: 'We', label: 'Wed' },
  { code: 'Th', label: 'Thu' }, { code: 'Fr', label: 'Fri' }, { code: 'Sa', label: 'Sat' }, { code: 'Su', label: 'Sun' },
];

export default function ScheduleScreen() {
  const { 
    courseName, year, activeDays, 
    historyData, filters, updateFilter, applyFilters, resetFilters, isHistoryLoading,
    isLoading, error, isRefreshing, handleRefresh 
  } = useStudentScheduleViewModel();

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('');

  const screenHeight = Dimensions.get('window').height;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
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
    setFilterVisible(true); 
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20 })
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: screenHeight, duration: 250, useNativeDriver: true })
    ]).start(() => setFilterVisible(false));
  };

  const backdropOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); 
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const openDatePicker = (target) => {
    setPickerTarget(target);
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      updateFilter(pickerTarget, formattedDate);
    }
  };

  const formatBusNumber = () => {
    const current = filters.bus_number;
    if (current && /^\d+$/.test(current)) {
      const number = parseInt(current, 10);
      const formatted = `BUS-${number.toString().padStart(2, '0')}`;
      updateFilter('bus_number', formatted);
    }
  };

  const handleApply = () => {
    applyFilters();
    closeModal();
  };

  const handleClear = () => {
    resetFilters();
    closeModal();
  };

  const FilterChip = ({ label, value, current, onSelect }) => (
    <TouchableOpacity 
      style={[styles.chip, current === value && styles.chipActive]} 
      onPress={() => onSelect(current === value ? '' : value)}
    >
      <Text style={[styles.chipText, current === value && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const DateInput = ({ label, value, target }) => (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateInputButton} onPress={() => openDatePicker(target)}>
        <Ionicons name="calendar-outline" size={18} color="#666" />
        <Text style={[styles.dateText, !value && { color: '#aaa' }]}>{value || "Select Date"}</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) return <ActivityIndicator style={styles.center} size="large" color="#404072ff" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.topSection}>
        <Text style={styles.headerTitle}>Class Schedule</Text>
        
        <View style={styles.scheduleCard}>
          <Text style={styles.courseTitle}>{courseName}</Text>
          <Text style={styles.yearText}>Year {year}</Text>
          <View style={styles.divider} />
          
          <View style={styles.tableContainer}>
            {WEEK_DAYS.map((day) => {
              const isActive = activeDays.includes(day.code);
              return (
                <View key={day.code} style={styles.dayColumn}>
                  <Text style={styles.dayLabel}>{day.label}</Text>
                  <View style={[styles.statusBox, isActive ? styles.activeBox : styles.inactiveBox]}></View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.bottomSheetContainer}>
        <View style={styles.historyHeaderRow}>
          <Text style={styles.sheetHeaderTitle}>Bus History</Text>
          <TouchableOpacity style={styles.filterTriggerButton} onPress={openModal}>
            <Ionicons name="options" size={18} color="white" />
            <Text style={styles.filterTriggerText}>Filters</Text>
          </TouchableOpacity>
        </View>

        <FlatList 
          data={historyData}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={handleRefresh} 
              tintColor="#404072ff" 
              colors={['#404072ff']}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No records found.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <View>
                  <Text style={styles.busText}>{item.bus_number}</Text>
                  <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
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
      </View>

      <Modal transparent={true} visible={isFilterVisible} onRequestClose={closeModal} animationType="none">
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
            <Pressable style={{flex: 1}} onPress={closeModal} />
          </Animated.View>

          <Animated.View 
            style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}
            {...panResponder.panHandlers}
          >
            <View style={styles.dragHandleArea}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Filter Options</Text>
            </View>

            <View style={{ marginBottom: 15 }}>
              <Text style={styles.label}>Bus Number</Text>
              <TextInput 
                style={styles.input} 
                placeholder="e.g. 1" 
                value={filters.bus_number}
                onChangeText={(t) => updateFilter('bus_number', t)}
                onEndEditing={formatBusNumber}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.row}>
              <DateInput label="From Date" value={filters.from_date} target="from_date" />
              <DateInput label="To Date" value={filters.to_date} target="to_date" />
            </View>

            <Text style={styles.label}>Status:</Text>
            <View style={styles.rowWrap}>
              <FilterChip label="Valid" value="VALID" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
              <FilterChip label="Invalid" value="INVALID" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
              <FilterChip label="Override" value="OVERRIDE" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
            </View>

            <Text style={styles.label}>Direction:</Text>
            <View style={styles.rowWrap}>
              <FilterChip label="Inbound" value="INBOUND" current={filters.direction} onSelect={(v) => updateFilter('direction', v)} />
              <FilterChip label="Outbound" value="OUTBOUND" current={filters.direction} onSelect={(v) => updateFilter('direction', v)} />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                {isHistoryLoading ? <ActivityIndicator color="white" /> : <Text style={styles.applyText}>Apply Filters</Text>}
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                style={Platform.OS === 'ios' ? { width: '100%', backgroundColor: 'white' } : undefined}
              />
            )}
            {showDatePicker && Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.iosDoneButton} onPress={() => setShowDatePicker(false)}>
                <Text style={{color: '#404072ff', fontWeight: 'bold'}}>Done</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#404072ff', 
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', textAlign: 'center', marginTop: 50 },

  topSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    backgroundColor: 'transparent',
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: '800', 
    marginBottom: 15, 
    color: '#ffffffff' 
  },
  scheduleCard: { 
    backgroundColor: 'white', 
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  courseTitle: { fontSize: 22, fontWeight: 'bold', color: '#111' },
  yearText: { fontSize: 16, color: '#666', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 20 },
  tableContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  dayColumn: { alignItems: 'center', width: 40 },
  dayLabel: { fontSize: 12, color: '#888', marginBottom: 8, fontWeight: '600' },
  statusBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  activeBox: { backgroundColor: '#10B981' },
  inactiveBox: { backgroundColor: '#F3F4F6' },

  bottomSheetContainer: {
    flex: 1, 
    backgroundColor: '#ffffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    paddingHorizontal: 20,
    overflow: 'hidden', 
  },
  historyHeaderRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  sheetHeaderTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#000000ff'
  },
  filterTriggerButton: { 
    flexDirection: 'row', 
    backgroundColor: '#404072ff',
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 20, 
    alignItems: 'center', 
    gap: 6 
  },
  filterTriggerText: { color: 'white', fontWeight: '600', fontSize: 13 },
  
  listContent: {
    paddingBottom: 40,
  },
  historyItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 12, 
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  busText: { fontWeight: '700', fontSize: 16, color: '#333' },
  dateText: { color: '#64748B', fontSize: 13, marginTop: 2 },
  statusText: { fontWeight: '700', fontSize: 14 },
  directionText: { color: '#64748B', fontSize: 12, marginTop: 2, textAlign: 'right', fontStyle: 'italic', paddingRight: 4 },
  
  green: { color: '#059669' }, 
  red: { color: '#DC2626' }, 
  orange: { color: '#D97706' },
  emptyText: { textAlign: 'center', color: '#64748B', marginTop: 40 },

  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, elevation: 10 },
  
  dragHandleArea: { alignItems: 'center', width: '100%' },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#e5e7eb', borderRadius: 3, marginBottom: 15 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  
  row: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  
  input: { 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: '#F3F4F6',
    color: '#1F2937'
  },
  dateInputButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: '#F3F4F6' 
  },
  
  dateText: { fontSize: 14, color: '#333' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#4B5563' },
  rowWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 15 },
  
  chip: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    backgroundColor: '#F3F4F6', 
  },
  chipActive: { 
    backgroundColor: '#404072ff', 
  },
  chipText: { fontSize: 13, color: '#4B5563' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 16,
  },
  applyButton: { 
    flex: 1,
    backgroundColor: '#404072ff', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
  },
  applyText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  iosDoneButton: { alignItems: 'center', padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, marginTop: 10 }
});