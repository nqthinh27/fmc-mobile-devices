

import React, { useState, useEffect } from 'react';
import { Alert, Text, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { Linking, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './components/Home';
import Setting from './components/Setting';
import Login from './components/Login';
import Tts from 'react-native-tts';
import useStore from './utils/store';

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
      console.log('Message handled in the background!', remoteMessage);
      const notificationBody = remoteMessage.data?.message || '';
      console.log('message :', notificationBody);
      Tts.setDefaultLanguage('vi-VN');
      Tts.setDefaultVoice('vi-vn-x-gft-network');
      Tts.setDefaultRate(0.55);
      Tts.speak('Bạn vừa nhận được ' + notificationBody + ' đồng');
    });

    const foreground = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      const notificationBody = remoteMessage.data?.message || '';
      console.log('message :', notificationBody);
      Tts.setDefaultLanguage('vi-VN');
      Tts.setDefaultVoice('vi-vn-x-gft-network');
      Tts.setDefaultRate(0.55);
      Tts.speak('Bạn vừa nhận được ' + notificationBody + ' đồng');
      Alert.alert('Bạn vừa nhận được +' + notificationBody + ' đồng');
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

function App(): React.JSX.Element {
  return (
    <NavigationContainer linking={linking} fallback={<ActivityIndicator animating />}>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={Setting} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;