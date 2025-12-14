import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { getPendingRequests, approveRequest, rejectRequest } from './adminService';

export const useBusPassRequestsViewModel = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [approvalForm, setApprovalForm] = useState({
    valid_from: new Date(),
    valid_until: new Date(),
    admin_notes: ''
  });

  const fetchRequests = useCallback(async () => {
    try {
      const data = await getPendingRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRequests();
  };

  const handleSelectRequest = (request) => {
    setApprovalForm({
      valid_from: new Date(request.requested_valid_from),
      valid_until: new Date(request.requested_valid_until),
      admin_notes: ''
    });
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const updateDate = (field, date) => {
    setApprovalForm(prev => ({ ...prev, [field]: date }));
  };

  const updateNotes = (text) => {
    setApprovalForm(prev => ({ ...prev, admin_notes: text }));
  };

  const submitApproval = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      const payload = {
        valid_from: approvalForm.valid_from.toISOString(),
        valid_until: approvalForm.valid_until.toISOString(),
        admin_notes: approvalForm.admin_notes
      };
      await approveRequest(selectedRequest.id, payload);
      Alert.alert("Success", "Request approved.");
      handleCloseModal();
      fetchRequests();
    } catch (err) {
      Alert.alert("Error", "Failed to approve request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const submitRejection = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    try {
      await rejectRequest(selectedRequest.id);
      Alert.alert("Success", "Request rejected.");
      handleCloseModal();
      fetchRequests();
    } catch (err) {
      Alert.alert("Error", "Failed to reject request.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    isLoading,
    isRefreshing,
    selectedRequest,
    approvalForm,
    isProcessing,
    handleRefresh,
    handleSelectRequest,
    handleCloseModal,
    updateDate,
    updateNotes,
    submitApproval,
    submitRejection
  };
};