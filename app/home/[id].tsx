import React from 'react';
import { View, Text, Image, ScrollView, Pressable, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome, Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { fullData } from '../../constants/data';
import { SafeAreaView } from 'react-native-safe-area-context';

const RealEstateDetail = () => {
  const { id } = useLocalSearchParams();

  const item = fullData.find((x) => x.id === String(id));
  console.log('params id:', id);
  console.log('fullData:', fullData);
  
  if (!item) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Không có dữ liệu chi tiết</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
    <TouchableWithoutFeedback>
      <ScrollView className="bg-white">
        <View className="relative">
          <Image
            source={item.image}
            className="w-full h-64"
          />
          <View className="absolute top-4 left-4 flex-row items-center space-x-2">
            <Pressable className="bg-white/80 rounded-full p-2">
              <Feather name="share" size={20} color="black" />
            </Pressable>
            <Pressable className="bg-white/80 rounded-full p-2">
              <FontAwesome name="heart-o" size={20} color="black" />
            </Pressable>
          </View>
        </View>

        <View className="px-4 py-2 border-b border-gray-200">
          <Text className="text-red-600 text-xl font-semibold">{item.price}</Text>
          <Text className="text-gray-500">~169 triệu/m²</Text>
          <Text className="mt-2 text-gray-700">5 PN • 5 WC • 4 tầng</Text>
        </View>

        <View className="px-4 py-2">
          <Text className="text-lg font-bold">{item.title}</Text>
          <Text className="text-gray-500 mt-1">{item.location}</Text>
        </View>

        <View className="px-4 py-2 space-y-2">
          <Text className="font-semibold text-base">Mô tả</Text>
          <Text className="text-gray-700">
            - Bán căn biệt thự song lập mini Vinhomes Đan Phượng 104m² giá 17.576 tỷ (đã gồm VAT).
          </Text>
          <Text className="text-gray-700">
            - Mặt tiền đất 8m, sân rộng rãi.
          </Text>
        </View>

        <View className="px-4 py-2 space-y-2 border-t border-gray-200">
          <Text className="font-semibold text-base">Đặc điểm bất động sản</Text>
          {[
            ['Diện tích', '104 m²'],
            ['Mức giá', item.price],
            ['Mặt tiền', '8 m'],
            ['Đường vào', '13 m'],
            ['Hướng nhà', 'Đông - Bắc'],
          ].map(([label, value], index) => (
            <View key={index} className="flex-row justify-between">
              <Text className="text-gray-600">{label}:</Text>
              <Text className="font-medium">{value}</Text>
            </View>
          ))}
        </View>

        <View className="px-4 py-4">
          <Pressable className="bg-red-600 rounded-full py-3 flex-row items-center justify-center">
            <Ionicons name="call-outline" size={20} color="#fff" />
            <Text className="text-white ml-2 font-semibold text-base">{item.contact}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default RealEstateDetail;
