import React from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, 
  ActivityIndicator, TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useParentDashboardViewModel } from '../../../src/features/parent/useParentDashboardViewModel';

const NewsCard = ({ item }) => {
  return (
    <TouchableOpacity style={styles.newsCard} activeOpacity={0.7}>
      <View style={styles.newsHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: item.color + '20' }]}>
          <Text style={[styles.categoryText, { color: item.color }]}>{item.category}</Text>
        </View>
        <Text style={styles.newsDate}>{item.date}</Text>
      </View>
      
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsContent} numberOfLines={3}>{item.content}</Text>
      
      <View style={styles.readMore}>
        <Text style={styles.readMoreText}>Read more</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ParentDashboard() {
  const { 
    parentName, news, currentDate, 
    isLoading, isRefreshing, handleRefresh 
  } = useParentDashboardViewModel();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#404072ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      
      {/* --- Purple Header --- */}
      <View style={styles.header}>
        <Text style={styles.dateText}>{currentDate}</Text>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.nameText}>{parentName}</Text>
      </View>

      {/* --- White Rounded Sheet --- */}
      <View style={styles.whiteSheet}>
        <View style={styles.sheetHandle} />
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing} 
              onRefresh={handleRefresh} 
              tintColor="#404072ff"
            />
          }
        >
          <Text style={styles.sectionTitle}>School News</Text>
          <Text style={styles.sectionSubtitle}>Updates and announcements</Text>

          <View style={styles.newsList}>
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </View>
        </ScrollView>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#404072ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30, // Spacing above the white sheet
  },
  dateText: {
    color: '#A5A5C7',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '400',
    opacity: 0.9,
  },
  nameText: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: '800',
    marginTop: -2,
  },

  // White Sheet
  whiteSheet: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Very light gray for contrast with white cards
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Content
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 20,
  },

  // News Cards
  newsList: {
    gap: 16,
  },
  newsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    // Flat style, no border
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  newsDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  readMore: {
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#404072ff',
  },
});