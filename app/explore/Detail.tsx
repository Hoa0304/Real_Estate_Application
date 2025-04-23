import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Detail() {

  const router = useRouter()
  const [selected, setSelected] = useState('Bán')
  const [showOptions, setShowOptions] = useState(false)
  const options = [
    { id: 1, label: 'Bán', icon: 'cash-outline' },
    { id: 2, label: 'Cho thuê', icon: 'key-outline' },
  ]
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(dropdownHeight, {
      toValue: showOptions ? options.length * 40 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // height cannot use native driver
    }).start();
  }, [showOptions]);


const handleContinue = () => {
  Alert.alert("Thông báo!", "Thông tin đã đầy đủ và chính xác?", [
       { text: "Hủy", style: "cancel" },
       { text: "Xác nhận", onPress: () => console.log('handle event') },
     ]);
}
  return (
    <SafeAreaView className="flex-1 bg-white">

      <View className='p-2 flex-row items-center justify-between px-4'>
        <Text className="text-xl font-bold ">Tạo tin đăng</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-[14px] font-medium text-gray-500 border rounded-3xl p-2 px-2">Thoát</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 bg-gray-100 p-4">
\        <View className="bg-white p-4 rounded-2xl mb-4">
          <Text className="font-medium mb-1">Nhu cầu</Text>

          <TouchableOpacity
            onPress={() => setShowOptions(!showOptions)}
            className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-3 flex-row justify-between items-center"
          >
            <Text>{selected}</Text>
            {showOptions
              ? <Ionicons name="chevron-up-outline" size={20} />
              : <Ionicons name="chevron-down-outline" size={20} />}
          </TouchableOpacity>

          <Animated.View
            style={{
              height: dropdownHeight,
              overflow: 'hidden',
            }}
            className="flex-row justify-between rounded-md mt-1 bg-white"
          >
            {options.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setSelected(item.label);
                  setShowOptions(false);
                }}
                className="px-4 py-2 border border-gray-300  mx-2 rounded-3xl w-[40%]"
              >
                <Ionicons name={item.icon as any} size={30} color="gray" />
                <Text className='font-medium text-[16px]'>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        <TouchableOpacity className="bg-white p-4 rounded-2xl mb-4">
          <Text className="font-medium mb-1">Địa chỉ BĐS</Text>
        </TouchableOpacity>

        <View className="bg-white p-4 rounded-2xl mb-4">
          <Text className="font-medium mb-2">Thông tin chính</Text>
          <View>
            <Text className="text-sm font-medium">Loại BĐS</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3"
              placeholder="Loại BĐS"
            />
          </View>
          <View>
            <Text className="text-sm font-medium">Diện Tich m2</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3"
              placeholder="Nhập diện tích "
            />
          </View>
          <View className='flex-row justify-between items-center'>
            <View className='w-[70%]'>
              <Text className="text-sm font-medium">Mức giá</Text>
              <TextInput
                className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3 "
                placeholder="Nhập diện tích "
              />
            </View>
            <View className='w-[20%]'>
              <Text className="text-sm font-medium">Đơn vị</Text>
              <TextInput
                className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3 "
                placeholder="Đơn vị "
              />
            </View>
          </View>
        </View>

        <View className="bg-white p-4 rounded-2xl mb-4">

          {["Số phòng ngủ", "Số phòng tắm, vệ sinh", "Số tầng"].map((label, i) => (
            <View key={i} className="flex-row justify-between items-center mt-4">
              <Text className="text-sm font-medium">{label}</Text>
              <View className="flex-row items-center space-x-3">
                <Pressable className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-xl font-semibold">-</Text>
                </Pressable>
                <Text className="text-base mx-2">0</Text>
                <Pressable className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-xl font-semibold">+</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View className="bg-white p-4 rounded-2xl mb-4">
          <Text className="font-medium mb-2">Thông tin liên hệ</Text>
          <View>
            <Text className="text-sm font-medium">Tên liên hệ</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3"
              placeholder="Trần Thị Cẩm Hoa"
            />
          </View>
          <View>
            <Text className="text-sm font-medium">Email</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3"
              placeholder="Email"
            />
          </View>
          <View className=''>

            <Text className="text-sm font-medium">Số điện thoại</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200  rounded-3xl px-4 py-2 mt-1 mb-3 "
              placeholder="Nhập diện tích "
            />

          </View>
        </View>
        <View className="bg-white p-4 rounded-2xl mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-semibold text-base">Tiêu đề & Mô tả</Text>
            <TouchableOpacity className="flex-row items-center bg-purple-100 px-3 py-2 rounded-2xl">
              <Ionicons name="sparkles-outline" size={16} color="#7c3aed" />
              <Text className="text-sm font-medium text-purple-700 ml-1">Tạo với AI</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-medium mb-1">Tiêu đề</Text>
          <TextInput
            className="border border-gray-300 bg-white text-sm rounded-xl p-3 mb-1"
            placeholder="Mô tả ngắn gọn về loại hình bất động sản, diện tích, địa chỉ..."
            multiline
          />
          <Text className="text-gray-400 text-xs mb-4">Tối thiểu 30 ký tự, tối đa 99 ký tự</Text>

          <Text className="text-sm font-medium mb-1">Mô tả</Text>
          <TextInput
            className="border border-gray-300 bg-white text-sm rounded-xl p-3"
            placeholder={`Mô tả chi tiết về:\n• loại hình bất động sản\n• vị trí\n• diện tích, tiện ích\n• tình trạng nội thất\n\n(VD: Khu nhà có vị trí thuận lợi, gần công viên, trường học...)`}
            multiline
            numberOfLines={5}
          />
          <Text className="text-gray-400 text-xs mt-2">Tối thiểu 30 ký tự, tối đa 3000 ký tự</Text>
        </View>

      </ScrollView>
      <TouchableOpacity onPress={()=>{handleContinue()}} className="bg-red-600 py-3 rounded-full items-center mx-10 my-5 ">
        <Text className="text-white font-semibold text-base">Tiếp tục</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
