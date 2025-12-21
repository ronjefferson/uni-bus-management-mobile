import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, RefreshControl, 
  ActivityIndicator, TextInput, TouchableOpacity, Modal, 
  Pressable, Platform, Animated, Dimensions, FlatList, PanResponder 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStudentRequestsViewModel } from '../../../src/features/student/useStudentRequestsViewModel';

const RequestItem = ({ item, formatDate, getStatusColor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasNote = !!item.admin_notes;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateLabel}>Requested: {formatDate(item.request_date)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.reasonTitle}>{item.reason}</Text>
      
      <View style={styles.divider} />
      
      <View style={styles.detailsRow}>
         <Text style={styles.detailValue}>Valid: {formatDate(item.requested_valid_from)}</Text>
         <Text style={styles.arrow}>→</Text>
         <Text style={styles.detailValue}>{formatDate(item.requested_valid_until)}</Text>
      </View>

      {hasNote && (
        <View>
          <TouchableOpacity 
            style={styles.expandButton} 
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.expandText}>Admin Note</Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#6B7280" 
            />
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>{item.admin_notes}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default function RequestsScreen() {
  const { 
    requestsList, nextPageUrl, filters, updateFilter, applyFilters, resetFilters,
    isLoading, isFiltering, isLoadingMore, isRefreshing, error, handleRefresh, handleLoadMore,
    newRequestDate, setNewRequestDate, newRequestReason, setNewRequestReason, 
    submitRequest, isSubmitting
  } = useStudentRequestsViewModel();

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isCreateVisible, setCreateVisible] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('filter');
  const [pickerTarget, setPickerTarget] = useState('');

  const screenHeight = Dimensions.get('window').height;
  
  const filterFade = useRef(new Animated.Value(0)).current;
  const filterSlide = useRef(new Animated.Value(screenHeight)).current;

  const createFade = useRef(new Animated.Value(0)).current;
  const createSlide = useRef(new Animated.Value(screenHeight)).current;

  const filterPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) filterSlide.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          closeFilter();
        } else {
          Animated.spring(filterSlide, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
    })
  ).current;

  const createPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) createSlide.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          closeCreate();
        } else {
          Animated.spring(createSlide, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        }
      },
    })
  ).current;

  const openFilter = () => {
    setFilterVisible(true);
    Animated.parallel([
      Animated.timing(filterFade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(filterSlide, { toValue: 0, useNativeDriver: true, damping: 20 })
    ]).start();
  };

  const closeFilter = () => {
    Animated.parallel([
      Animated.timing(filterFade, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(filterSlide, { toValue: screenHeight, duration: 250, useNativeDriver: true })
    ]).start(() => setFilterVisible(false));
  };

  const openCreate = () => {
    setCreateVisible(true);
    Animated.parallel([
      Animated.timing(createFade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(createSlide, { toValue: 0, useNativeDriver: true, damping: 20 })
    ]).start();
  };

  const closeCreate = () => {
    Animated.parallel([
      Animated.timing(createFade, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(createSlide, { toValue: screenHeight, duration: 250, useNativeDriver: true })
    ]).start(() => setCreateVisible(false));
  };

  const handleCreateSubmit = async () => {
    const success = await submitRequest();
    if (success) closeCreate();
  };

  const openDatePicker = (mode, target) => {
    setPickerMode(mode);
    setPickerTarget(target);
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      if (pickerMode === 'filter') {
        const formatted = selectedDate.toISOString().split('T')[0];
        updateFilter(pickerTarget, formatted);
      } else {
        setNewRequestDate(selectedDate);
      }
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusColor = (s) => (s === 'APPROVED' ? '#10B981' : s === 'REJECTED' ? '#EF4444' : '#F59E0B');

  const handleApply = () => {
    applyFilters();
    closeFilter();
  };

  const handleClear = () => {
    resetFilters();
    closeFilter();
  };

  const DateInput = ({ label, value, onPress }) => (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateInputButton} onPress={onPress}>
        <Ionicons name="calendar-outline" size={18} color="#666" />
        <Text style={[styles.dateText, !value && { color: '#aaa' }]}>{value || "Select Date"}</Text>
      </TouchableOpacity>
    </View>
  );

  const FilterChip = ({ label, value, current, onSelect }) => (
    <TouchableOpacity 
      style={[styles.chip, current === value && styles.chipActive]} 
      onPress={() => onSelect(current === value ? '' : value)}
    >
      <Text style={[styles.chipText, current === value && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  if (isLoading) return <ActivityIndicator style={styles.center} size="large" color="#404072ff" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Requests</Text>
          <TouchableOpacity style={styles.iconButton} onPress={openFilter}>
            <Ionicons name="options" size={24} color="#404072ff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={openCreate}>
          <Ionicons name="add-circle" size={24} color="#404072ff" />
          <Text style={styles.createText}>New Bus Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSheetContainer}>
        <FlatList
          data={requestsList}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <RequestItem 
              item={item} 
              formatDate={formatDate} 
              getStatusColor={getStatusColor} 
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No requests found.</Text>
          }
          ListFooterComponent={
            nextPageUrl && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? <ActivityIndicator color="#404072ff" /> : <Text style={styles.loadMoreText}>Load More</Text>}
              </TouchableOpacity>
            )
          }
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={handleRefresh} 
              tintColor="#404072ff" 
              colors={['#404072ff']}
            />
          }
        />
      </View>

      <Modal transparent={true} visible={isFilterVisible} onRequestClose={closeFilter} animationType="none">
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.backdrop, { opacity: filterFade }]}>
            <Pressable style={{flex:1}} onPress={closeFilter}/>
          </Animated.View>
          <Animated.View 
            style={[styles.modalSheet, { transform: [{ translateY: filterSlide }] }]}
            {...filterPanResponder.panHandlers}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Filter Requests</Text>
            <View style={styles.row}>
              <DateInput label="Start" value={filters.request_date__gte} onPress={() => openDatePicker('filter', 'request_date__gte')} />
              <DateInput label="End" value={filters.request_date__lte} onPress={() => openDatePicker('filter', 'request_date__lte')} />
            </View>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.rowWrap}>
              <FilterChip label="Pending" value="PENDING" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
              <FilterChip label="Approved" value="APPROVED" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
              <FilterChip label="Rejected" value="REJECTED" current={filters.status} onSelect={(v) => updateFilter('status', v)} />
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                {isFiltering ? <ActivityIndicator color="white" /> : <Text style={styles.applyText}>Apply Filters</Text>}
              </TouchableOpacity>
            </View>

          </Animated.View>
        </View>
      </Modal>

      <Modal transparent={true} visible={isCreateVisible} onRequestClose={closeCreate} animationType="none">
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.backdrop, { opacity: createFade }]}>
            <Pressable style={{flex:1}} onPress={closeCreate}/>
          </Animated.View>
          <Animated.View 
            style={[styles.modalSheet, { transform: [{ translateY: createSlide }] }]}
            {...createPanResponder.panHandlers}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>New Bus Request</Text>
            
            <Text style={styles.label}>Select Date</Text>
            <TouchableOpacity style={styles.dateInputButton} onPress={() => openDatePicker('create', null)}>
              <Ionicons name="calendar" size={20} color="#404072ff" />
              <Text style={styles.dateTextMain}>
                {newRequestDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.label, { marginTop: 15 }]}>Reason</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="e.g. Dentist appointment..."
              multiline={true}
              numberOfLines={3}
              value={newRequestReason}
              onChangeText={setNewRequestReason}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />

            <TouchableOpacity 
              style={[styles.applyButton, { flex: 0, marginTop: 20 }, isSubmitting && { backgroundColor: '#666' }]} 
              onPress={handleCreateSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.applyText}>Submit Request</Text>}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker 
          value={pickerMode === 'create' ? newRequestDate : new Date()} 
          mode="date" 
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
          onChange={onDateChange}
          minimumDate={pickerMode === 'create' ? new Date() : undefined}
        />
      )}
      {showDatePicker && Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.iosDoneButton} onPress={() => setShowDatePicker(false)}>
          <Text style={{color: '#404072ff', fontWeight: 'bold'}}>Done</Text>
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#404072ff', 
  },
  center: { flex: 1, justifyContent: 'center' },
  error: { color: 'white', textAlign: 'center', marginTop: 50 },

  topSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    backgroundColor: 'transparent',
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#ffffffff' 
  },
  iconButton: { 
    padding: 8, 
    backgroundColor: 'white', 
    borderRadius: 20 
  },
  createButton: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 10, 
  },
  createText: { 
    color: '#404072ff', 
    fontWeight: '700', 
    fontSize: 16 
  },

  bottomSheetContainer: {
    flex: 1, 
    backgroundColor: '#ffffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 25,
    paddingHorizontal: 20,
    overflow: 'hidden', 
    minHeight: 500,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 50 },

  card: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 14, 
    padding: 16, 
    marginBottom: 12, 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10 
  },
  dateLabel: { 
    color: '#6B7280', 
    fontSize: 13, 
    fontWeight: '500' 
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  statusText: { 
    color: 'white', 
    fontSize: 11, 
    fontWeight: '700' 
  },
  reasonTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1F2937' 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#e5e7eb', 
    marginVertical: 12 
  },
  detailsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10,
    flexWrap: 'wrap' 
  },
  detailValue: { 
    fontSize: 13, 
    fontWeight: '500', 
    color: '#4B5563' 
  },
  arrow: { color: '#9CA3AF' },
  
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 5
  },
  expandText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600'
  },
  noteBox: { 
    marginTop: 10, 
    backgroundColor: '#FEF3C7', 
    padding: 12, 
    borderRadius: 8,
  },
  noteText: { fontSize: 13, color: '#B45309', lineHeight: 18 },

  loadMoreButton: { 
    padding: 15, 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 12, 
    marginTop: 10 
  },
  loadMoreText: { fontWeight: '700', color: '#4B5563' },

  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, elevation: 10 },
  sheetHandle: { width: 40, height: 5, backgroundColor: '#e5e7eb', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, color: '#4B5563' },
  input: { 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: '#F3F4F6', 
    fontSize: 15 
  },
  textArea: { height: 100 },
  dateInputButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: '#F3F4F6' 
  },
  dateText: { fontSize: 14, color: '#374151' },
  dateTextMain: { fontSize: 16, color: '#404072ff', fontWeight: '700' },
  
  applyButton: { 
    flex: 1,
    backgroundColor: '#404072ff', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
  },
  applyText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  row: { flexDirection: 'row', gap: 10, marginBottom: 15 },
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
  iosDoneButton: { alignItems: 'center', padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8, marginTop: 10 }
});