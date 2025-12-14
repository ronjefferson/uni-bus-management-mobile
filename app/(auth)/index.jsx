import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, 
  LayoutAnimation, ScrollView, Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLoginViewModel } from '../../src/features/auth/useLoginViewModel';

export default function UnifiedLoginScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  
  const { 
    username, setUsername,
    password, setPassword,
    email, setEmail,
    handleLogin, isLoading, error, setError,
    setLoginType 
  } = useLoginViewModel();

  const [activeTab, setActiveTab] = useState('student');
  const [displayError, setDisplayError] = useState(null);

  useEffect(() => {
    setLoginType('student');
  }, []);

  useEffect(() => {
    setDisplayError(error);
  }, [error]);

  // Reset fields and error when switching tabs
  useEffect(() => {
    setDisplayError(null);
    if (setError) setError(null);
    setEmail('');
    setPassword('');
    setUsername('');
    
    // Scroll to top when tab changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [activeTab]);

  const switchTab = (role) => {
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(role);
    setLoginType(role);
  };

  const renderFooterLinks = () => {
    if (activeTab === 'student') {
      return (
        <View style={styles.linkContainerColumn}>
          <TouchableOpacity 
            onPress={() => switchTab('parent')} 
            style={{ marginBottom: 15 }}
          >
            <Text style={styles.linkText}>Parent Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => switchTab('admin')}>
            <Text style={styles.linkText}>Admin Access</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'parent') {
      return (
        <View style={styles.linkContainerColumn}>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/parent-register')}>
                <Text style={styles.linkText}>Register</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={{marginTop: 15}} onPress={() => switchTab('student')}>
              <Text style={styles.secondaryLinkText}>Back to Student Login</Text>
            </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'admin') {
      return (
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => switchTab('student')}>
            <Text style={styles.secondaryLinkText}>Back to Student Login</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent} 
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          
          <View style={styles.topSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="school" size={40} color="white" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>University Portal</Text>
              <Text style={styles.headerSubtitle}>
                {activeTab === 'student' ? 'Student Sign In' : 
                 activeTab === 'parent' ? 'Parent Portal' : 'Administrator Access'}
              </Text>
            </View>
          </View>

          <View style={styles.bottomSheet}>
            <View style={styles.formContainer}>

              {displayError && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              )}

              {activeTab === 'student' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Student Email</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="student@uni.edu"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>
              )}

              {activeTab === 'parent' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Parent Email</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="parent@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </>
              )}

              {activeTab === 'admin' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Admin Username</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter username"
                        placeholderTextColor="#9CA3AF"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.bottomLinksContainer}>
                {renderFooterLinks()}
              </View>

            </View>
          </View>
        
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#404072ff' },
  
  // This flexGrow is critical: it ensures the content stretches to fill the screen
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'flex-start' 
  },

  topSection: { 
    paddingHorizontal: 30, 
    paddingTop: 40,
    paddingBottom: 30,
    justifyContent: 'center', 
    alignItems: 'flex-start',
    backgroundColor: '#404072ff'
  },
  
  iconContainer: { width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  headerTextContainer: { marginBottom: 10 },
  headerTitle: { fontSize: 34, fontWeight: '800', color: 'white', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 16, color: '#A5A5C7', marginTop: 5, fontWeight: '500' },

  bottomSheet: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    paddingHorizontal: 30, 
    paddingTop: 40,
    paddingBottom: 40, 
    flex: 1, 
    width: '100%',
  },
  
  formContainer: { width: '100%' },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 16, paddingHorizontal: 16 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: '#111827' },

  loginButton: { backgroundColor: '#404072ff', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10, marginBottom: 25 },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginBottom: 20, gap: 8 },
  errorText: { color: '#DC2626', fontSize: 14, fontWeight: '500', flex: 1 },

  bottomLinksContainer: { alignItems: 'center' },
  linkContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  linkContainerColumn: { alignItems: 'center', justifyContent: 'center' },
  secondaryLinkText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },

  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#6B7280', fontSize: 14 },
  linkText: { color: '#404072ff', fontWeight: 'bold', fontSize: 14 }
});