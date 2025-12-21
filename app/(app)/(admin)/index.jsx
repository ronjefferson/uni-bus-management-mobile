import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdminDashboardViewModel } from '../../../src/features/admin/useAdminDashboardViewModel';

export default function AdminDashboard() {
  const router = useRouter();
  const { handleLogoutPress, isLoading } = useAdminDashboardViewModel();

  const getCurrentDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#404072ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.nameText}>Administrator</Text>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
            <Ionicons name="log-out-outline" size={24} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.whiteSheet}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.grid}>
            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/admin/students')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="people" size={28} color="#0284C7" />
              </View>
              <Text style={styles.gridLabel}>Students</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/admin/parents')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="people-circle" size={28} color="#9333EA" />
              </View>
              <Text style={styles.gridLabel}>Parents</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/admin/attendance-report')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="calendar" size={28} color="#16A34A" />
              </View>
              <Text style={styles.gridLabel}>Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem} 
              onPress={() => router.push('/admin/requests')}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="documents" size={28} color="#D97706" />
              </View>
              <Text style={styles.gridLabel}>Requests</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#404072ff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  
  header: { paddingHorizontal: 24, paddingTop: 15, paddingBottom: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { color: '#A5A5C7', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  welcomeText: { color: 'white', fontSize: 18, fontWeight: '400' },
  nameText: { color: 'white', fontSize: 28, fontWeight: '800' },
  
  logoutButton: { backgroundColor: 'white', padding: 8, borderRadius: 20 },

  whiteSheet: { 
    flex: 1, 
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    overflow: 'hidden' 
  },
  scrollContent: { padding: 24 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  gridItem: { 
    width: '48%', 
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15,
  },
  
  iconCircle: { 
    width: 54, 
    height: 54, 
    borderRadius: 27, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  
  gridLabel: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#374151',
    textAlign: 'center' 
  },
});