import React, { useCallback, useEffect, useState } from 'react';
import { View, Button, Alert, StyleSheet, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSSO, useUser } from '@clerk/clerk-expo';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import images from "@/constants/images"
import { SafeAreaView } from 'react-native-safe-area-context';
export const useWarmUpBrowser = () => {
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const router = useRouter();
  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      console.log('createdSessionId', createdSessionId);
      console.log('setActive', setActive);

      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        Alert.alert('Lỗi', 'Không thể bắt đầu phiên đăng nhập.');
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert('Lỗi', 'Đăng nhập thất bại.');
    }
  }, []);

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)"); // Điều hướng sử dụng router.replace
    }
  }, [user, router]);


  const [phoneNumber, setPhoneNumber] = useState('0356031160');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    Alert.alert('Thông báo!', 'Hiện tại chỉ hỗ trợ đăng nhập bằng Google.');
  };
  return (
    <SafeAreaView>
      <View className=" bg-gray-100 p-2">
        <View className=" justify-center items-center  bg-red-500 rounded-lg shadow-md p-2 my-2">
          <Image source={images.home} className='rounded-full w-[200px] h-[200px]' />
          <Text className="text-lg text-white font-medium m-2">ĐỪNG ĐỂ TIỀN BAY MẤT</Text>
        </View>

        <View className="bg-white p-5 rounded-lg shadow-md">
          <Text className="text-2xl font-bold mb-2">Đăng nhập</Text>
          <Text className="text-base mb-4">Đăng nhập tài khoản của bạn</Text>

          <Text className="text-base mt-2">Số điện thoại đăng nhập</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mt-1 mb-2"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <Text className="text-base mt-2">Mật khẩu</Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mt-1 mb-2"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity className="flex-row items-center">
              <View className="w-5 h-5 border border-gray-300 mr-2"></View>
              <Text className="text-sm">Lưu mật khẩu</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-sm">Quên mật khẩu</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-2">
            <TouchableOpacity onPress={onPress} className=" flex-row justify-center items-end bg-blue-400 py-2 rounded-md ">
              <Image source={images.logo} className='size-7' />
              <Text className='font-medium text-[16px] text-white'>oogle</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogin} className=" flex-row justify-center items-end bg-red-500 py-2 rounded-md ">
              <Text className='font-medium text-[16px] text-white'>ĐĂNG NHẬP</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="flex-row justify-center mt-5">
            <Text className="text-base">Bạn chưa có tài khoản? </Text>
            <Text className="text-base text-blue-500">Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};



export default LoginScreen;