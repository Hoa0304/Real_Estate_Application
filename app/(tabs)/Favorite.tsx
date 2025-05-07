import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchFavoritesFromFirebase } from '../../utils/fetchFavoritesFromFirebase';

interface FavoriteItem {
  id: string;
  image: string;
  title: string;
  price: string;
  location: string;
}

const Favorite = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favs = await fetchFavoritesFromFirebase();
        console.log("Dữ liệu yêu thích đã tải:", favs);
        setFavorites(favs);
      } catch (error) {
        console.error("Lỗi khi tải danh sách yêu thích:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  if (favorites.length === 0) {
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl shadow p-4 mb-4">
            <Image
              source={{ uri: item.image }}
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
