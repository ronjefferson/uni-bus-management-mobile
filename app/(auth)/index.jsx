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
import { useParentRegisterViewModel } from '../../src/features/auth/useParentRegisterViewModel';

export default function UnifiedLoginScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  
  const { 
    username, setUsername,
    password, setPassword,
    email, setEmail,
    handleLogin, isLoading: isLoginLoading, error: loginError, setError: setLoginError,
    setLoginType 
  } = useLoginViewModel();

  const [activeTab, setActiveTab] = useState('student');

  const {
    formData: regData, 
    handleChange: handleRegChange, 
    handleRegister, 
    isLoading: isRegLoading, 
    error: regError, 
    setError: setRegError
  } = useParentRegisterViewModel(() => switchTab('parent'));

  const [displayError, setDisplayError] = useState(null);

  useEffect(() => {
    setLoginType('student');
  }, []);

  useEffect(() => {
    if (activeTab === 'register') {
      setDisplayError(regError);
    } else {
      setDisplayError(loginError);
    }
  }, [loginError, regError, activeTab]);

  useEffect(() => {
    setDisplayError(null);
    if (setLoginError) setLoginError(null);
    if (setRegError) setRegError(null);
    
    if (activeTab !== 'register') {
        setEmail('');
        setPassword('');
        setUsername('');
    }

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [activeTab]);

  const switchTab = (role) => {
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(role);
    if (role !== 'register') {
      setLoginType(role);
    }
  };

  const renderFooterLinks = () => {
    if (activeTab === 'student') {
      return (
        <View style={styles.linkContainerColumn}>
          <TouchableOpacity onPress={() => switchTab('parent')} style={{ marginBottom: 15 }}>
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
              <TouchableOpacity onPress={() => switchTab('register')}>
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

    if (activeTab === 'register') {
      return (
        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={() => switchTab('parent')}>
            <Text style={styles.secondaryLinkText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent} 
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        >
          
          <View style={styles.topSection}>
            <View style={styles.iconContainer}>
              <Ionicons name={activeTab === 'register' ? "person-add" : "school"} size={40} color="white" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {activeTab === 'register' ? 'Create Account' : 'University Portal'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {activeTab === 'student' ? 'Student Sign In' : 
                 activeTab === 'parent' ? 'Parent Portal' : 
                 activeTab === 'admin' ? 'Administrator Access' : 'Parent Registration'}
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

              {activeTab !== 'register' && (
                <>
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
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {activeTab === 'register' && (
                <>
                  <Text style={styles.sectionHeader}>Personal Info</Text>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                      <Text style={styles.label}>First Name</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          placeholder="John"
                          placeholderTextColor="#9CA3AF"
                          value={regData.first_name}
                          onChangeText={(t) => handleRegChange('first_name', t)}
                        />
                      </View>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Last Name</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.input}
                          placeholder="Doe"
                          placeholderTextColor="#9CA3AF"
                          value={regData.last_name}
                          onChangeText={(t) => handleRegChange('last_name', t)}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="parent@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={regData.email}
                        onChangeText={(t) => handleRegChange('email', t)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="1234567890"
                        placeholderTextColor="#9CA3AF"
                        value={regData.phone_number}
                        onChangeText={(t) => handleRegChange('phone_number', t)}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Create Password"
                        placeholderTextColor="#9CA3AF"
                        value={regData.password}
                        onChangeText={(t) => handleRegChange('password', t)}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Link Student</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Student ID</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="id-card-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 1002345"
                        placeholderTextColor="#9CA3AF"
                        value={regData.child_university_id}
                        onChangeText={(t) => handleRegChange('child_university_id', t)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Reg Code</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="qr-code-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 81E85AE28F"
                        placeholderTextColor="#9CA3AF"
                        value={regData.child_registration_code}
                        onChangeText={(t) => handleRegChange('child_registration_code', t)}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.loginButton} 
                    onPress={handleRegister} 
                    disabled={isRegLoading}
                  >
                    {isRegLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.loginButtonText}>Create Account</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

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
  scrollContent: { flexGrow: 1, justifyContent: 'flex-start' },

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
  linkText: { color: '#404072ff', fontWeight: 'bold', fontSize: 14 },

  row: { flexDirection: 'row' },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
});