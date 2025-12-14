import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#404072',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        height: Platform.OS === 'ios' ? 95 : 75,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        paddingTop: 10,
        borderTopWidth: 0,
        elevation: 15,
        shadowColor: '#404072',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 5,
      }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={26} color={color} />
          )
        }} 
      />
      
      <Tabs.Screen 
        name="admin-studentlist" 
        options={{ 
          title: 'Students',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={26} color={color} />
          )
        }} 
      />

      <Tabs.Screen 
        name="admin-parentlist" 
        options={{ 
          title: 'Parents', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people-circle' : 'people-circle-outline'} size={26} color={color} /> 
          )
        }} 
      />

      <Tabs.Screen 
        name="admin-buspassrequests" 
        options={{ 
          title: 'Requests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'documents' : 'documents-outline'} size={26} color={color} />
          )
        }} 
      />

      <Tabs.Screen 
        name="admin-attendancereport" 
        options={{ 
          title: 'Report',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={26} color={color} />
          )
        }} 
      />
    </Tabs>
  );
}