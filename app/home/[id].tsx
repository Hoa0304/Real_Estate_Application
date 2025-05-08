import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useFetchRealEstatePosts from "../../hooks/useFetchRealEstatePosts";
import { fetchFavoritesFromFirebase } from "../../utils/fetchFavoritesFromFirebase";
import { toggleFavoriteInFirebase } from "../../utils/toggleFavoriteInFirebase";
import { useAuth } from "@clerk/clerk-expo";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const RealEstateDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { posts, loading } = useFetchRealEstatePosts();
  const [item, setItem] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    const selectedItem = posts.find((post) => post.id === id);
    setItem(selectedItem);

    const checkFavoriteStatus = async () => {
      const favorites = await fetchFavoritesFromFirebase();
      const isFav = favorites.some((fav) => fav.id === id);
      setIsFavorite(isFav);
    };

    if (id) {
      checkFavoriteStatus();
    }
  }, [id, posts]);

  const handleBackPress = () => {
    router.back();
  };

  const handleFavoriteToggle = async () => {
    if (!item) return;

    if (!isLoaded || !userId) {
      alert("Bạn cần đăng nhập để lưu yêu thích");
      return;
    }

    await toggleFavoriteInFirebase(item, isFavorite, userId);
    setIsFavorite((prev) => !prev);
  };

  const handleImageScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Không có dữ liệu chi tiết</Text>
      </View>
    );
  }

  // ✅ Convert item.image (có thể là 1 string hoặc mảng string) thành mảng
  const images: string[] = Array.isArray(item.images)
    ? item.images
    : item.image
    ? [item.image]
    : [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback>
        <ScrollView className="bg-white">
          <View className="relative">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleImageScroll}
              scrollEventThrottle={16}
              className="w-full h-64"
            >
              {images.map((uri: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri }}
                  className="w-[${
                    SCREEN_WIDTH
                  }px] h-64"
                  style={{ width: SCREEN_WIDTH }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Indicator */}
            {images.length > 1 && (
              <View className="absolute bottom-2 right-4 bg-black/60 px-2 py-1 rounded-full">
                <Text className="text-white text-sm">
                  {activeImageIndex + 1}/{images.length}
                </Text>
              </View>
            )}

            {/* Back + Favorite */}
            <View className="absolute top-4 left-0 right-0 px-4 flex-row justify-between items-center">
              <Pressable
                onPress={handleBackPress}
                className="bg-white/80 rounded-full p-2"
              >
                <AntDesign name="arrowleft" size={20} color="black" />
              </Pressable>
              <Pressable
                onPress={handleFavoriteToggle}
                className="bg-white/80 rounded-full p-2"
              >
                <AntDesign
                  name={isFavorite ? "heart" : "hearto"}
                  size={20}
                  color={isFavorite ? "red" : "black"}
                />
              </Pressable>
            </View>
          </View>

          <View className="px-4 py-2 border-b border-gray-200">
            <Text className="text-red-600 text-xl font-semibold">
              {item.price}
            </Text>
            <Text className="mt-2 text-gray-700">
              {item.bedrooms} PN • {item.bathrooms} WC • {item.floors} tầng
            </Text>
          </View>

          <View className="px-4 py-2">
            <Text className="text-lg font-bold">{item.title}</Text>
            <Text className="text-gray-500 mt-1">{item.location}</Text>
          </View>

          <View className="px-4 py-2 space-y-2">
            <Text className="font-semibold text-base">Mô tả</Text>
            <Text className="text-gray-700">
              {item.description || "Không có mô tả"}
            </Text>
          </View>

          <View className="px-4 py-2 space-y-2 border-t border-gray-200">
            <Text className="font-semibold text-base">
              Đặc điểm bất động sản
            </Text>
            {[["Diện tích", item.area || "N/A"], ["Mức giá", item.price || "N/A"]].map(
              ([label, value], index) => (
                <View key={index} className="flex-row justify-between">
                  <Text className="text-gray-600">{label}:</Text>
                  <Text className="font-medium">{value}</Text>
                </View>
              )
            )}
          </View>

          <View className="px-4 py-4">
            <Pressable className="bg-red-600 rounded-full py-3 flex-row items-center justify-center">
              <Ionicons name="call-outline" size={20} color="#fff" />
              <Text className="text-white ml-2 font-semibold text-base">
                {item.contact?.phone || "Liên hệ"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default RealEstateDetail;
