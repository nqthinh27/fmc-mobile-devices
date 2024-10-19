/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import Tts from 'react-native-tts';

AppRegistry.registerComponent(appName, () => App);

AppRegistry.registerHeadlessTask('TTSBackgroundTask', () => async (taskData) => {
    const notificationBody = taskData.message || '';
    if (notificationBody == 'null') {
        // console.log('Background => Ping Pong');
    } else {
        console.log('Message handled in the background!', taskData);
        Tts.setDefaultLanguage('vi-VN');
        Tts.setDefaultVoice('vi-vn-x-gft-network');
        Tts.setDefaultRate(0.45);
        Tts.setDucking(true);
        Tts.speak('Bạn vừa nhận được ' + notificationBody + ' đồng');
    }
});
