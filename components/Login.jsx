import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    TextInput,
    Alert,
    Pressable,
    TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginInfoKey, userKey } from "../constants/common";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./GlobalStyles";
import colors from "../constants/colors";
import useStore from "../utils/store";
import { accessToken, getDataBackend, postDataBackend } from "../utils/commonRequestBackend";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Login() {
    //navigation
    const navigation = useNavigation();
    //function of navigate 
    const { navigate, goBack } = navigation;
    const { setCurrentUser } = useStore();
    const [phonenumber, setPhonenumber] = useState("");
    const [password, setPassword] = useState("");
    const [mobileDeviceCode, setMobileDeviceCode] = useState("");
    const [count, setCount] = useState(0);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State to toggle password visibility

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible); // Toggle state
    };
    const handleTest = async () => {
        setCount(prevCount => prevCount + 1);
        try {
            const loginResponse = await getDataBackend('/api/login/device', accessToken);
            // console.log(loginResponse);
            if (loginResponse) {
                Alert.alert('res: ' + loginResponse?.totalElement);
            } else {
                Alert.alert("Thông tin đăng nhập không chính xác. Vui lòng thử lại!");
            }
            // Alert.alert(loginResponse);
        } catch (e) {
            console.error(e);
            Alert.alert("Thông tin đăng nhập không chính xác. Vui lòng thử lại!", e);
        }
        // Alert.alert("Đã ấn vào nút đăng nhập");
    };
    const handleLogin = async () => {
        if (phonenumber === "" || password === "" || mobileDeviceCode === "") {
            Alert.alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        try {
            const reqBody = {
                phonenumber: phonenumber,
                password: password,
                mobileDeviceCode: mobileDeviceCode,
            }
            const loginResponse = await postDataBackend('/api/login/device', reqBody, accessToken);
            // console.log(loginResponse);
            if (loginResponse) {
                await AsyncStorage.setItem(userKey, JSON.stringify(loginResponse));
                await AsyncStorage.setItem(loginInfoKey, JSON.stringify(reqBody));
                setCurrentUser(loginResponse);
                navigation.replace('Home'); // Navigate to Home after login
            } else {
                Alert.alert("Email hoặc password không đúng. Vui lòng thử lại!");
            }
            // Alert.alert(loginResponse);
        } catch (e) {
            console.error(e);
            Alert.alert("Email hoặc password không đúng. Vui lòng thử lại!", e);
        }
        // Alert.alert("Đã ấn vào nút đăng nhập");
    };
    return (
        <SafeAreaView style={[loginCss.customSafeArea, { backgroundColor: colors.white }]}>
            <View style={loginCss.container}>
                {/* <Text style={styles.h1}>Tất cả thiết bị</Text> */}
                <View style={loginCss.loginHeader}>
                    <Text style={[loginCss.loginTextHeader, colors.black]}>Đăng nhập</Text>
                    <Text> </Text>
                </View>

                <View style={[loginCss.loginContainer]}>

                    <View style={loginCss.loginInputEmail}>
                        <TextInput
                            style={[loginCss.loginTextInputEmail, colors.black]}
                            value={mobileDeviceCode}
                            onChangeText={setMobileDeviceCode}
                            placeholder="Mã thiết bị"
                            placeholderTextColor={colors.dark_grey}
                        ></TextInput>
                    </View>

                    <View style={loginCss.loginInputPassword}>
                        <TextInput
                            style={[loginCss.loginTextInputPassword, colors.black]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder={"Mã bảo mật"}
                            secureTextEntry={!isPasswordVisible}
                            placeholderTextColor={colors.dark_grey}
                        ></TextInput>
                        <Pressable onPress={togglePasswordVisibility}>
                            <Icon
                                name={isPasswordVisible ? "eye-off" : "eye"}
                                size={24}
                                color={colors.dark_grey}
                            />
                        </Pressable>
                    </View>

                    <View style={loginCss.loginInputEmail}>
                        <TextInput
                            style={[loginCss.loginTextInputEmail, colors.black]}
                            value={phonenumber}
                            onChangeText={setPhonenumber}
                            placeholder="Số điện thoại"
                            placeholderTextColor={colors.dark_grey}
                        ></TextInput>
                    </View>


                    <Pressable
                        style={loginCss.loginButtonViewlogin}
                        onPress={() => {
                            handleLogin();
                        }}
                    >
                        {/* <Entypo name="login" size={25} color={colors.white} /> */}
                        <Text style={loginCss.loginButtonlogin}>Đăng nhập</Text>
                    </Pressable>

                    {/* <Pressable
                        style={loginCss.loginButtonViewlogin}
                        onPress={() => {
                            handleTest();
                        }}
                    >
                        <Text style={loginCss.loginButtonlogin}>Test</Text>
                    </Pressable> */}

                    {/* <Text style={[loginCss.loginTextInputPassword, colors.black]}>Số lượt ấn: {count}</Text> */}
                    <View style={loginCss.footer}>
                        <Text style={loginCss.footerText}>© Agent Banking v1.0</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const loginCss = StyleSheet.create({
    container: {
        flexDirection: "column",
        marginHorizontal: 16,
        flex: 1
    },
    customSafeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 45 : 0,
        // marginHorizontal: 16,
        flexDirection: 'column'
    },
    login: {
        flex: 1,
        backgroundColor: "#fff",
    },

    loginHeader: {
        // flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        justifyContent: "center",
    },

    loginTextHeader: {
        fontWeight: "bold",
        fontSize: 26,
        width: '100%',
        // height: 200,
        textAlign: 'center',
        paddingBottom: 30
    },

    loginContainer: {
        flex: 2,
        backgroundColor: "#fff",
        alignItems: "center",
        // justifyContent: "center",
        marginTop: 20,
        marginHorizontal: 16,
    },

    loginInputEmail: {
        marginBottom: 20,

        marginHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#C0C0C0",
        width: "100%",
    },

    loginTextInputEmail: {
        color: colors.dark_grey,
        fontSize: 17,
    },

    loginInputPassword: {
        marginBottom: 20,
        flexDirection: "row",
        // marginTop: 20,
        // marginHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#C0C0C0",
        width: "100%",
        // marginTop: 46,
        justifyContent: "space-between",
    },

    loginTextForgot: {
        color: "#FF6363",
        fontSize: 16,
    },

    loginViewNoEmail: {
        flexDirection: "row",
        // marginHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 55,
    },
    loginTextInputPassword: {
        flex: 1,
        fontSize: 17,
        color: colors.dark_grey,
    },
    loginTextNoEmail: {
        color: "red",
        fontSize: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#FF6363",
    },
    loginButtonViewlogin: {
        width: "100%",
        height: 55,
        borderRadius: 25,
        borderWidth: 1,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        borderColor: "white",
        marginTop: 63,
        flexDirection: "row",
    },
    loginButtonlogin: {
        color: "white",
        fontWeight: "bold",
        fontSize: 17,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 10
    },

    loginButtonViewGoogle: {
        width: "100%",
        height: 55,
        borderRadius: 25,
        borderWidth: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        borderColor: colors.primary,
        marginTop: 30,
        flexDirection: "row",
    },
    loginButtonGoogle: {
        color: colors.primary,
        fontWeight: "bold",
        fontSize: 17,
    },

    loginButtonViewFb: {
        width: "100%",
        height: 55,
        borderRadius: 25,
        borderWidth: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
        borderColor: colors.primary,
        flexDirection: "row",
    },
    loginButtonFb: {
        color: colors.primary,
        fontWeight: "bold",
        fontSize: 17,
    },

    // Footer Styles
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
});