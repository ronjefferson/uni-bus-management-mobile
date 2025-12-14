import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  ActivityIndicator, TouchableOpacity, Platform, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStudentDashboardViewModel } from '../../../src/features/student/useStudentDashboardViewModel';

export default function StudentDashboard() {
  const router = useRouter();
  const { 
    student, isLoading, error, isRefreshing, handleRefresh 
  } = useStudentDashboardViewModel();

  const getCurrentDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  const navigateTo = (route) => {
    router.push(route);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#404072ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh} 
            tintColor="#ffffff" 
          />
        }
      >
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.dateText}>{getCurrentDate()}</Text>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <Text style={styles.nameText}>{student?.first_name}</Text>
            </View>
            <TouchableOpacity style={styles.profileIcon} onPress={() => navigateTo('/(app)/(student)/student-profile')}>
              <Text style={styles.profileInitials}>
                {student?.first_name?.charAt(0)}{student?.last_name?.charAt(0)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSheetContainer}>
          <View style={styles.content}>
            <View style={styles.idCard}>
              <View style={styles.idCardHeader}>
                <View>
                  <Text style={styles.uniName}>UNIVERSITY ID</Text>
                  <Text style={styles.uniId}>{student?.university_id}</Text>
                </View>
                <Ionicons name="school" size={32} color="rgba(255,255,255,0.8)" />
              </View>
              <View style={styles.idCardFooter}>
                <View>
                  <Text style={styles.idLabel}>STUDENT</Text>
                  <Text style={styles.idValue}>{student?.first_name} {student?.last_name}</Text>
                </View>
                <View>
                  <Text style={styles.idLabel}>REG CODE</Text>
                  <Text style={styles.idValueCode}>{student?.registration_code}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.grid}>
              <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('/(app)/(student)/student-schedule')}>
                <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="calendar" size={24} color="#0284C7" />
                </View>
                <Text style={styles.gridLabel}>Schedule</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('/(app)/(student)/student-requests')}>
                <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="bus" size={24} color="#16A34A" />
                </View>
                <Text style={styles.gridLabel}>Bus Request</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('/(app)/(student)/student-requests')}>
                <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="time" size={24} color="#D97706" />
                </View>
                <Text style={styles.gridLabel}>History</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('/(app)/(student)/student-profile')}>
                <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="person" size={24} color="#9333EA" />
                </View>
                <Text style={styles.gridLabel}>Profile</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#404072ff' },
  scrollContent: { flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'white', fontWeight: 'bold' },

  topSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: { color: '#A5A5C7', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  greetingText: { color: 'white', fontSize: 18, fontWeight: '400' },
  nameText: { color: 'white', fontSize: 28, fontWeight: '800' },
  
  profileIcon: {
    width: 50, height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  profileInitials: { color: 'white', fontSize: 20, fontWeight: '700' },

  bottomSheetContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    minHeight: 500,
  },
  content: {
    padding: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },

  idCard: {
    backgroundColor: '#404072ff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    height: 180,
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#404072ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  idCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  uniName: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  uniId: { color: 'white', fontSize: 24, fontWeight: '700', marginTop: 5, letterSpacing: 1 },
  idCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  idLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  idValue: { color: 'white', fontSize: 16, fontWeight: '600' },
  idValueCode: { color: 'white', fontSize: 16, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 15 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  iconCircle: {
    width: 50, height: 50,
    borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10,
  },
  gridLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },

  statusCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  statusIconBox: {
    width: 40, height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  statusValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
});