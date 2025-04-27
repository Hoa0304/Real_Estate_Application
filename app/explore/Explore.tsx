import React from 'react-native';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import images from "@/constants/images"
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
const HomeScreen = () => {

    const { user } = useUser();

    const router = useRouter();
    const handlePost = () => {
        router.push('/explore/Detail');
    }

    const getBuoiHienTai = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) {
          return "sáng";
        } else if (hour >= 11 && hour < 13) {
          return "trưa";
        } else if (hour >= 13 && hour < 18) {
          return "chiều";
        } else {
          return "tối";
        }
    };

    const fullName = user?.fullName || 'Người dùng';
    const initial = fullName.charAt(0).toUpperCase();
      
    return (
        <ScrollView className="bg-gray-100 h-fullscreen">
            {/* Header */}
            <View className="bg-red-600 p-4 pt-5 rounded-b-2xl">
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <View className="bg-white rounded-full p-2 w-12 h-12 ">
                            <Text className="text-center text-red-600 font-bold text-xl">{initial}</Text>
                        </View>
                        <View className="ml-3">
                            <Text className="text-white font-bold text-base">Chào buổi {getBuoiHienTai()}</Text>
                            <View className="flex-row items-center">
                                <Text className="text-white font-semibold mr-1">{fullName}</Text>
                                <Feather name="chevron-right" size={20} color="white" />
                            </View>
                        </View>
                    </View>
                    <Ionicons name="notifications-outline" size={24} color="white" />
                </View>

                {/* Quà tặng */}
                <View className="bg-white rounded-2xl p-4 mt-4 items-center">
                    <Image source={images.home} className="w-[200px] h-[100px] mb-2" />
                    <Text className="text-red-600 font-bold text-lg mb-2">Quà tặng 1 tin thường 15 ngày</Text>
                    <Text className="text-gray-600 text-sm text-center mb-4">Tin đăng của bạn sẽ được tiếp cận hơn 6 triệu người tìm mua / thuê bất động sản mỗi tháng</Text>
                    <TouchableOpacity className="bg-red-600 rounded-full px-6 py-2" onPress={() => { handlePost() }}>
                        <Text className="text-white font-semibold">+ Tạo tin đăng đầu tiên</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tổng quan tài khoản */}
            <View className="bg-white rounded-2xl p-4 m-4">
                <Text className="text-lg font-bold mb-4">Tổng quan tài khoản</Text>
                <View className="flex-row justify-between">
                    <View className=" flex-1 items-center">
                        <Ionicons name="newspaper-outline" size={24} color="gray" />
                        <Text className="text-sm mt-1">Tin đăng</Text>
                        <Text className="text-xl font-bold">0 tin</Text>
                        <Text className="text-sm">Đang hiển thị</Text>
                        <TouchableOpacity>
                            {/* <Text className="text-red-600 text-sm mt-2">Đăng tin </Text> */}
                        </TouchableOpacity>
                    </View>
                    <View className=" flex-1 items-center">
                        <Ionicons name="people-outline" size={24} color="gray" />
                        <Text className="text-sm mt-1">Liên hệ trong 30 ngày</Text>
                        <Text className="text-xl font-bold">0 người</Text>
                        <Text className="text-sm">+0 mới vào hôm nay</Text>
                    </View>
                    {/* <View className="items-center">
                        <Ionicons name="cash-outline" size={24} color="gray" />
                        <Text className="text-sm mt-1">Tài khoản</Text>
                        <Text className="text-xl font-bold">0 ₫</Text>
                    </View> */}
                </View>
            </View>

            {/* Thông tin dành riêng cho bạn */}
            <View className="bg-white rounded-2xl p-4 m-4">
                <Text className="text-lg font-bold mb-4">Thông tin dành riêng cho bạn</Text>
                <View className="flex-row justify-between mb-4">
                    <TouchableOpacity className="border border-gray-300 rounded-full px-4 py-2">
                        <Text className="text-sm">Quan trọng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="border border-gray-300 rounded-full px-4 py-2">
                        <Text className="text-sm">Thông tin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="border border-gray-300 rounded-full px-4 py-2">
                        <Text className="text-sm">Gợi ý</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="border border-gray-300 rounded-full px-4 py-2">
                        <Text className="text-sm">...</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </ScrollView>
    );
};

export default HomeScreen;