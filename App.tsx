

import React, { useState, useEffect, useRef } from 'react';
import { Alert, Animated, AppRegistry, Modal, StyleSheet, Text, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { Linking, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './components/Home';
import Setting from './components/Setting';
import Login from './components/Login';
import Tts from 'react-native-tts';
import BackgroundActions from 'react-native-background-actions';
import { device } from './utils/device';

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const veryIntensiveTask = async (taskData) => {
  const { delay } = taskData;

  while (BackgroundActions.isRunning()) {
    console.log("waiting message FMC");
    await sleep(delay);
  }
};

const options = {
  taskName: 'TTS Background Task',
  taskTitle: 'Phát TTS trong nền',
  taskDesc: 'Đang phát TTS mỗi 5 giây...',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourapp://home', // Tùy chọn: Liên kết ứng dụng của bạn khi nhấp vào thông báo
  parameters: {
    delay: 5000, // 5 giây
  },
};

const Stack = createStackNavigator();
const NAVIGATION_IDS = ["home", "settings"];

function buildDeepLinkFromNotificationData(data: any): string | null {
  const navigationId = data?.navigationId;
  if (!NAVIGATION_IDS.includes(navigationId)) {
    // console.warn('Unverified navigationId', navigationId)
    return null;
  }
  if (navigationId === "home") {
    return 'myapp://home';
  }
  if (navigationId === "settings") {
    return 'myapp://settings';
  }

  return null
}
function App(): React.JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');


  const linking = {
    prefixes: ['myapp://'],
    config: {
      screens: {
        Home: "home",
        Settings: "settings"
      }
    },
    async getInitialURL() {
      const url = await Linking.getInitialURL();
      if (typeof url === 'string') {
        return url;
      }
      //getInitialNotification: When the application is opened from a quit state.
      const message = await messaging().getInitialNotification();
      const deeplinkURL = buildDeepLinkFromNotificationData(message?.data);
      if (typeof deeplinkURL === 'string') {
        return deeplinkURL;
      }
    },
    subscribe(listener: (url: string) => void) {
      const onReceiveURL = ({ url }: { url: string }) => listener(url);

      // Listen to incoming links from deep linking
      const linkingSubscription = Linking.addEventListener('url', onReceiveURL);
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        const notificationBody = remoteMessage.data?.message || '';
        // Dữ liệu mà bạn muốn truyền cho headless task, có thể là một object
        const taskData = { message: notificationBody };

        // Gọi headless task với taskId, taskKey và taskData
        AppRegistry.startHeadlessTask(Date.now(), "TTSBackgroundTask", taskData);
      });
      // messaging().setBackgroundMessageHandler(async remoteMessage => {
      //   console.log('Message handled in the background!', remoteMessage);
      //   const notificationBody = remoteMessage.data?.message || '';
      //   console.log('message :', notificationBody);
      //   Tts.setDefaultLanguage('vi-VN');
      //   Tts.setDefaultVoice('vi-vn-x-gft-network');
      //   Tts.setDefaultRate(0.45);
      //   Tts.speak('Bạn vừa nhận được ' + notificationBody + ' đồng');
      // });

      const foreground = messaging().onMessage(async remoteMessage => {
        const notificationBody = remoteMessage.data?.message || '';
        if (notificationBody == 'null') {
          // console.log('Ping Pong');
        } else {
          console.log('A new FCM message arrived!', remoteMessage);
          console.log('message :', notificationBody);
          Tts.setDefaultLanguage('vi-VN');
          Tts.setDefaultVoice('vi-vn-x-gft-network');
          Tts.setDefaultRate(0.45);
          Tts.speak('Bạn vừa nhận được');
          setTimeout(() => {
            Tts.speak(notificationBody + ' đồng');
          }, 500);
          // Alert.alert('Bạn vừa nhận được +' + notificationBody + ' đồng');
          setShowModal(true);
          setModalMessage(notificationBody + "");
          setTimeout(() => {
            setShowModal(false);
          }, 3000);
        }
      });
      //onNotificationOpenedApp: When the application is running, but in the background.
      const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
        const url = buildDeepLinkFromNotificationData(remoteMessage.data)
        if (typeof url === 'string') {
          listener(url)
        }
      });

      return () => {
        linkingSubscription.remove();
        unsubscribe();
        foreground();
      };
    },
  }
  const startBackgroundTTS = async () => {
    try {
      console.log("Starting background TTS task...");
      await BackgroundActions.start(veryIntensiveTask, options);
      console.log("Background TTS task started!");
    } catch (error) {
      console.error("Failed to start background task:", error);
    }
  };

  const stopBackgroundTTS = async () => {
    console.log("Stopping background TTS task...");
    await BackgroundActions.stop();
    console.log("Background TTS task stopped!");
  };
  useEffect(() => {
    startBackgroundTTS();
  }, []);
  // useEffect(() => {
  //   // Cấu hình TTS
  //   Tts.setDefaultRate(0.8); // Tốc độ đọc
  //   Tts.setDefaultPitch(1.0); // Cao độ giọng

  //   // Hàm để bắt đầu đọc
  //   const speakText = () => {
  //     Tts.speak("   ");
  //     console.log("Chạy ngầm");
  //   };
  //   const intervalId = setInterval(() => {
  //     speakText();
  //   }, 3000);

  //   // Xoá bỏ interval khi component unmount
  //   return () => clearInterval(intervalId);
  // }, []);
  const slideAnim = useRef(new Animated.Value(-100)).current; // Vị trí bắt đầu ở trên màn hình
  useEffect(() => {
    if (showModal) {
      // Khi modal được hiển thị, đẩy nó từ trên xuống
      Animated.timing(slideAnim, {
        toValue: 0, // Đẩy xuống vị trí hiển thị
        duration: 500, // Thời gian animation
        useNativeDriver: true, // Sử dụng native driver để tối ưu hóa
      }).start();
    } else {
      // Khi modal đóng, đẩy nó trở lại lên trên
      Animated.timing(slideAnim, {
        toValue: -100, // Đẩy lên vị trí ngoài màn hình
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Đặt lại `showModal` sau khi animation hoàn tất
        setShowModal(false);
      });
    }
  }, [showModal]);
  return (
    <NavigationContainer linking={linking} fallback={<ActivityIndicator animating />}>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={Setting} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      </Stack.Navigator>

      {/* Modal hiển thị thông báo */}
      <Modal
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
        animationType="none" // Đảm bảo không có animation mặc định
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }], // Áp dụng animation để đẩy modal
              },
            ]}
          >
            <Text style={styles.modalText}>Bạn vừa nhận được {modalMessage} đồng</Text>
          </Animated.View>
        </View>
      </Modal>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Canh modal ở đầu màn hình
    alignItems: 'center',
    backgroundColor: 'transparent', // Nền trong suốt
    marginTop: 5, // Khoảng cách từ trên xuống
  },
  modalContent: {
    width: device.width - 40, // Chiều rộng modal
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',

    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,

    // Shadow cho Android
    elevation: 8, // Số càng cao, độ sâu của shadow càng lớn
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
export default App;