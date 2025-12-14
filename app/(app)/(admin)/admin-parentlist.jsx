import React, { useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, RefreshControl, 
  ActivityIndicator, TextInput, TouchableOpacity, Modal, 
  Dimensions, Animated, Pressable, Platform, UIManager, 
  ScrollView, PanResponder 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAdminParentListViewModel } from '../../../src/features/admin/useAdminParentListViewModel';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}


const ParentDetailSheet = ({ parent, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const screenHeight = Dimensions.get('window').height;

  const { children } = parent;


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
        {/* Drag Handle Area */}
        <View style={styles.dragHandleArea} {...panResponder.panHandlers}>
          <View style={styles.sheetHandle} />
        </View>
        
        <ScrollView contentContainerStyle={styles.sheetContent}>
          {/* Header Section */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetAvatar}>
              <Text style={styles.sheetAvatarText}>
                {parent.first_name?.[0]}{parent.last_name?.[0]}
              </Text>
            </View>
            <Text style={styles.sheetName}>{parent.first_name} {parent.last_name}</Text>
            <Text style={styles.sheetId}>ID: {parent.id}</Text>
          </View>

          {/* Parent Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                  {parent.email || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.value}>{parent.phone_number || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Children Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Linked Children</Text>
            {children && children.length > 0 ? (
              children.map((child, index) => (
                <View key={index} style={styles.childCard}>
                  <View style={styles.childAvatar}>
                    <Text style={styles.childAvatarText}>
                      {child.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childDetail}>ID: {child.university_id}</Text>
                    <Text style={styles.childDetail}>Schedule ID: {child.schedule_id}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No children linked.</Text>
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


const ParentListItem = ({ parent, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {parent.first_name?.[0] || 'P'}
            {parent.last_name?.[0] || ''}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>
            {parent.first_name} {parent.last_name}
          </Text>
          <Text style={styles.emailText} numberOfLines={1}>
            {parent.email}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
};

export default function AdminParentList() {
  const { 
    parents, searchQuery, isLoading, isRefreshing, selectedParent,
    handleRefresh, handleSearch, handleSelectParent, handleCloseDetail
  } = useAdminParentListViewModel();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parent Directory</Text>
        <Text style={styles.headerSubtitle}>Manage registered parents & guardians</Text>
      </View>

      <View style={styles.whiteSheet}>
 
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
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
            data={parents}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#404072ff" />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>No parents found.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <ParentListItem 
                parent={item} 
                onPress={() => handleSelectParent(item)} 
              />
            )}
          />
        )}
      </View>

      <Modal 
        animationType="none" 
        transparent={true} 
        visible={!!selectedParent} 
        onRequestClose={handleCloseDetail}
      >
        {selectedParent && (
          <ParentDetailSheet 
            parent={selectedParent} 
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

  searchContainer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  searchInput: { flex: 1, fontSize: 16, color: '#1F2937' },

  listContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },


  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#404072ff' },
  infoContainer: { flex: 1 },
  nameText: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  emailText: { fontSize: 13, color: '#6B7280' },

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


  childCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 10 },
  childAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  childAvatarText: { fontSize: 16, fontWeight: '700', color: '#404072ff' },
  childName: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  childDetail: { fontSize: 12, color: '#6B7280' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  closeBtn: { marginTop: 30, backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  closeBtnText: { color: '#4B5563', fontWeight: 'bold', fontSize: 16 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9CA3AF', marginTop: 10, fontSize: 16, fontWeight: '500' },
});