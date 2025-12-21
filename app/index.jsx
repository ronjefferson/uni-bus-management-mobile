import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import { getStudentInfo } from '../src/features/student/studentService';
import { getParentProfile } from '../src/features/parent/parentService';
import { getAdminStudents } from '../src/features/admin/adminService'; 

export default function EntryScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        let role = await SecureStore.getItemAsync('user_role');

        if (role) {
          if (role === 'student') await getStudentInfo();
          else if (role === 'parent') await getParentProfile();
          else if (role === 'admin') await getAdminStudents();
        } else {
          try {
            await getStudentInfo();
            role = 'student';
          } catch (e) {
            try {
              await getParentProfile();
              role = 'parent';
            } catch (e2) {
              try {
                await getAdminStudents();
                role = 'admin';
              } catch (e3) {
                throw new Error('Session invalid');
              }
            }
          }
          
          if (role) {
            await SecureStore.setItemAsync('user_role', role);
          }
        }

        switch (role) {
          case 'student':
            router.replace('/(student)');
            break;
          case 'parent':
            router.replace('/(parent)');
            break;
          case 'admin':
            router.replace('/(admin)');
            break;
          default:
            throw new Error('Invalid role');
        }

      } catch (error) {
        await SecureStore.deleteItemAsync('user_role');
        router.replace('/(auth)'); 
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#404072ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});