import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, RefreshControl, 
  ActivityIndicator, TouchableOpacity, Modal, TextInput, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useBusPassRequestsViewModel } from '../../../src/features/admin/useBusPassRequestsViewModel';

const RequestCard = ({ request, onPress }) => {
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{request.student_name.charAt(0)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.studentName}>{request.student_name}</Text>
          <Text style={styles.requestDate}>Req: {formatDate(request.request_date)}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{request.status}</Text>
        </View>
      </View>
      
      <Text style={styles.reasonText} numberOfLines={2}>{request.reason}</Text>
      
      <View style={styles.divider} />
      
      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
        <Text style={styles.dateRange}>
          {new Date(request.requested_valid_from).toLocaleDateString()}  →  {new Date(request.requested_valid_until).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function AdminRequestsScreen() {
  const { 
    requests, isLoading, isRefreshing, selectedRequest, 
    approvalForm, isProcessing,
    handleRefresh, handleSelectRequest, handleCloseModal, 
    updateDate, updateNotes, submitApproval, submitRejection 
  } = useBusPassRequestsViewModel();

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('from');

  const openDatePicker = (mode) => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(false);
    
    if (event.type === 'set' && selectedDate) {
      if (pickerMode === 'from') updateDate('valid_from', selectedDate);
      else updateDate('valid_until', selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pass Requests</Text>
        <Text style={styles.headerSubtitle}>Manage pending bus pass approvals</Text>
      </View>

      <View style={styles.whiteSheet}>
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#404072ff" />
          </View>
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#404072ff" />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="documents-outline" size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>No pending requests.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <RequestCard request={item} onPress={() => handleSelectRequest(item)} />
            )}
          />
        )}
      </View>

      <Modal 
        visible={!!selectedRequest} 
        animationType="slide" 
        onRequestClose={handleCloseModal}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Process Request</Text>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {selectedRequest && (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>Student</Text>
                  <Text style={styles.valueLarge}>{selectedRequest.student_name}</Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Reason</Text>
                  <View style={styles.infoBox}>
                    <Text style={styles.value}>{selectedRequest.reason}</Text>
                  </View>
                </View>

                <View style={styles.dividerLarge} />

                <Text style={styles.sectionHeader}>Approval Details</Text>
                
                <View style={styles.row}>
                  <View style={{flex: 1, marginRight: 10}}>
                    <Text style={styles.label}>Valid From</Text>
                    <TouchableOpacity style={styles.dateInput} onPress={() => openDatePicker('from')}>
                      <Text style={styles.dateText}>
                        {approvalForm.valid_from.toLocaleDateString()} {approvalForm.valid_from.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.label}>Valid Until</Text>
                    <TouchableOpacity style={styles.dateInput} onPress={() => openDatePicker('until')}>
                      <Text style={styles.dateText}>
                        {approvalForm.valid_until.toLocaleDateString()} {approvalForm.valid_until.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>Admin Notes (Optional)</Text>
                  <TextInput 
                    style={styles.textArea}
                    placeholder="Add notes for the student..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={approvalForm.admin_notes}
                    onChangeText={updateNotes}
                  />
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.rejectBtn} 
                    onPress={submitRejection}
                    disabled={isProcessing}
                  >
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.approveBtn} 
                    onPress={submitApproval}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.approveText}>Approve</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>

          {showPicker && (
            <DateTimePicker
              value={pickerMode === 'from' ? approvalForm.valid_from : approvalForm.valid_until}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
        </SafeAreaView>
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
  listContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#404072ff' },
  headerInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  requestDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
  reasonText: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateRange: { fontSize: 13, color: '#6B7280', fontWeight: '500' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9CA3AF', marginTop: 10, fontSize: 16, fontWeight: '500' },

  modalContainer: { flex: 1, backgroundColor: 'white' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  closeButton: { padding: 4 },
  modalContent: { padding: 24 },
  
  section: { marginBottom: 20 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 6, textTransform: 'uppercase' },
  valueLarge: { fontSize: 22, fontWeight: '700', color: '#404072ff' },
  infoBox: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12 },
  value: { fontSize: 16, color: '#1F2937', lineHeight: 24 },
  
  dividerLarge: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10, marginBottom: 25 },
  
  row: { flexDirection: 'row', marginBottom: 20 },
  dateInput: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, borderWidth: 0 },
  dateText: { fontSize: 15, color: '#1F2937', fontWeight: '500' },
  
  textArea: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, fontSize: 16, color: '#1F2937', height: 100 },

  actionRow: { flexDirection: 'row', gap: 15, marginTop: 20 },
  
  rejectBtn: { 
    flex: 1,
    backgroundColor: '#FEE2E2', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  rejectText: { color: '#DC2626', fontWeight: '700', fontSize: 16 },
  
  approveBtn: { 
    flex: 1,
    backgroundColor: '#10B981', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  approveText: { color: 'white', fontWeight: '700', fontSize: 16 },
});