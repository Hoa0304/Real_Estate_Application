import React from "react";
import { View, Text, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from '@react-navigation/native';

const Favorite = () => {
  const route = useRoute();
  const { favorites } = route.params || {}; 

  if (!favorites || favorites.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">Không có yêu thích nào để hiển thị</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="bg-white p-4">
        <Text className="text-2xl font-bold">Danh sách yêu thích</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl shadow p-4 mb-4">
            <Image
              source={item.image}
              className="w-full h-40 rounded-lg"
              resizeMode="cover"
            />
            <Text className="text-base font-semibold mt-2" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="text-red-600 font-bold mt-1">{item.price}</Text>
            <Text className="text-gray-500">{item.location}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Favorite;
