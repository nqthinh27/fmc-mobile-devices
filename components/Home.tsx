import { Alert, Button, PermissionsAndroid, Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import useStore from '../utils/store';
import { loginInfoKey, userKey } from '../constants/common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import messaging from '@react-native-firebase/messaging';
import { accessToken, postDataBackend } from '../utils/commonRequestBackend';
import { TextInput } from 'react-native-gesture-handler';
import Tts from 'react-native-tts';
import colors from '../constants/colors';

// Define the type for your stack parameters
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

// Type for navigation prop
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;


const Home = () => {
  //navigation
  const navigation = useNavigation<HomeScreenNavigationProp>();
  /**
   * check authen
   */
  const { currentUser, setCurrentUser, removeCurrentUser, currentTokenDevice, setTokenDevice, removeTokenDevice, currentLoginInfo, setLoginInfo, removeLoginInfo, notificationList } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [parsedLoginInfo, setParsedLoginInfo] = useState(null);
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const user = await AsyncStorage.getItem(userKey);
        const loginInfo = await AsyncStorage.getItem(loginInfoKey);
        if (user !== null && loginInfo !== null) {
          await setCurrentUser(JSON.parse(user));
          await setLoginInfo(JSON.parse(loginInfo));
          const { mobileDeviceCode, password, phonenumber } = JSON.parse(loginInfo);
          await requestUserPermission(mobileDeviceCode, password, phonenumber);
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    checkCurrentUser();


    const requestUserPermission = async (mobileDeviceCode: string, password: string, phonenumber: string) => {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        const token = await messaging().getToken();
        setTokenDevice(token);
        // console.log(currentLoginInfo);

        try {
          const reqBody = {
            mobileDeviceCode: mobileDeviceCode,
            password: password,
            phonenumber: phonenumber,
            tokenDevice: token,
          }
          const createDevice = await postDataBackend('/api/login/token-device', reqBody, accessToken);
          if (createDevice && createDevice.code === 201) {
            console.log(createDevice);
          }
        } catch (e) {
          console.error("Lỗi khi gọi API: ", e);
        }
        console.log('FCM token:', token);
      }
    };
  }, []);
  const [text, setText] = useState('');

  const speak = () => {
    if (text) {
      console.log(text);
      Tts.setDefaultLanguage('vi-VN');
      Tts.setDefaultVoice('vi-vn-x-gft-network');
      Tts.speak(text);
    }
    // Alert.alert("Đã ấn vào nút Đọc");
  };

  const handleLogout = async () => {
    try {
      const reqBody = {
        mobileDeviceCode: currentLoginInfo.mobileDeviceCode,
        tokenDevice: currentTokenDevice,
      }
      const logout = await postDataBackend('/api/logout/token-device', reqBody, accessToken);
      if (logout && logout.code === 201) {
        await AsyncStorage.removeItem(userKey)
        removeCurrentUser();
        removeTokenDevice();
        removeLoginInfo();
        // console.log("Đăng xuất thành công: ", reqBody, logout);
        navigation.replace('Login');
      }
    } catch (e) {
      console.error("Lỗi khi gọi API đăng xuất: ", e);
    }
    // Alert.alert("Đã ấn vào nút đăng xuất");
  };
  return currentUser == null ? <></> : (
    <SafeAreaView style={[styles.customSafeArea]}>
      <View style={styles.container}>
        {/* <View style={styles.textInputContainer}>
          <TextInput
            placeholder="Nhập văn bản ở đây"
            onChangeText={setText}
            value={text}
            style={styles.textInput}
          />
          <Pressable style={styles.button} onPress={speak}>
            <Text style={styles.buttonText}>Đọc văn bản</Text>
          </Pressable>
        </View> */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.label}>Tên người dùng: {currentUser?.fullName || 'Không xác định'}</Text>
          <Text style={styles.label}>Số điện thoại: {currentUser?.phoneNumber || 'Không xác định'}</Text>
          <Text style={styles.label}>Địa chỉ: {currentUser?.address || 'Không xác định'}</Text>
          <Text style={styles.label}>Email: {currentUser?.email || 'Không xác định'}</Text>
          <Text style={styles.label}>Mã thiết bị: {currentUser?.mobileCode || 'Không xác định'}</Text>
          <Text style={styles.label}>Giới hạn thiết bị: {currentUser?.limitDevice || 'Không xác định'}</Text>
        </View>
        <View style={styles.logoutContainer}>
          <Pressable style={styles.button} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>© Agent Banking v1.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    marginBottom: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  footerText: {
    fontSize: 14,
    color: colors.dark_grey, // You can change the color as you want
  },
  userInfoContainer: {
    paddingHorizontal: 16,
    marginTop: 30,
    // alignItems: 'center',
  },
  label: {
    fontWeight: 'medium',
    fontSize: 18,
    marginBottom: 10,
    color: '#000'
  },
  customSafeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 45 : 0,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notificationContainer: {
    flex: 1,
    marginTop: 20,
  },
  textInputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderBottomWidth: 1,
    margin: 10,
    fontSize: 17,
  },
  button: {
    backgroundColor: '#37874E',
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutContainer: {
    marginTop: 30,
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home