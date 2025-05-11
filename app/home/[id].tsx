import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TouchableWithoutFeedback,
  Dimensions,
  Modal,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useFetchRealEstatePosts from "../../hooks/useFetchRealEstatePosts";
import { fetchFavoritesFromFirebase } from "../../utils/fetchFavoritesFromFirebase";
import { toggleFavoriteInFirebase } from "../../utils/toggleFavoriteInFirebase";
import { useAuth } from "@clerk/clerk-expo";
import { db } from "../../firebaseConfig";
import { doc, deleteDoc, query, collection, where, getDocs } from "firebase/firestore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const RealEstateDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { posts, loading } = useFetchRealEstatePosts();
  const [item, setItem] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);

  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    const selectedItem = posts.find((post) => post.id === id);
    setItem(selectedItem);
  }, [posts, id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!userId || !isLoaded || !id) return;
      try {
        const favorites = await fetchFavoritesFromFirebase();
        const isFav = favorites.some((fav) => fav.id === id);
        setIsFavorite(isFav);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [userId, isLoaded, id]);

  const handleBackPress = () => {
    router.back();
  };

  const handleFavoriteToggle = async () => {
    if (!item || !userId || !isLoaded) {
      alert("Bạn cần đăng nhập để lưu yêu thích");
      return;
    }

    try {
      await toggleFavoriteInFirebase(item, isFavorite, userId);
      setIsFavorite((prev) => !prev);
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái yêu thích:", error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleImageScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  const handleEditPost = () => {
    setMenuVisible(false);
    if (!item) return;
    router.push({
      pathname: '/edit/[id]',
      params: { id: item.id },
    });
  };

  const handleDeletePost = async () => {
    setMenuVisible(false);
    if (!item) return;

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa bài đăng này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "real_estate_posts", item.id));

              const favoritesQuery = query(
                collection(db, "favorites"),
                where("postId", "==", item.id)
              );
              const favoritesSnapshot = await getDocs(favoritesQuery);
              const deletePromises = favoritesSnapshot.docs.map((doc) =>
                deleteDoc(doc.ref)
              );
              await Promise.all(deletePromises);

              Alert.alert("Thành công", "Bài đăng đã được xóa.");
              router.back();
            } catch (error) {
              console.error("Lỗi khi xóa bài đăng:", error);
              Alert.alert("Lỗi", "Không thể xóa bài đăng. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
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
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-center text-lg font-semibold text-gray-600">
          Bài đăng không còn tồn tại hoặc đã bị xóa.
        </Text>
        <Pressable
          onPress={handleBackPress}
          className="mt-4 bg-red-600 px-6 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const images: string[] = Array.isArray(item.images)
    ? item.images
    : item.image
    ? [item.image]
    : [];

  const isOwner = item.userId === userId;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableWithoutFeedback>
        <ScrollView className="bg-white">
          {/* Image Scroll */}
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
                  className="w-full h-64"
                  style={{ width: SCREEN_WIDTH }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {images.length > 1 && (
              <View className="absolute bottom-2 right-4 bg-black/60 px-2 py-1 rounded-full">
                <Text className="text-white text-sm">
                  {activeImageIndex + 1}/{images.length}
                </Text>
              </View>
            )}

            <View className="absolute top-4 left-0 right-0 px-4 flex-row justify-between items-center">
              <Pressable
                onPress={handleBackPress}
                className="bg-white/80 rounded-full p-2"
              >
                <AntDesign name="arrowleft" size={20} color="black" />
              </Pressable>
              <View className="flex-row items-center space-x-2">
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
                {isOwner && (
                  <Pressable
                    onPress={() => setMenuVisible(true)}
                    className="bg-white/80 rounded-full p-2"
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="black" />
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          {/* Thông tin bất động sản */}
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
            {[["Loại nhà", item.category || "N/A"], ["Diện tích", item.area || "N/A"], ["Mức giá", item.price || "N/A"]].map(
              ([label, value], index) => (
                <View key={index} className="flex-row justify-between">
                  <Text className="text-gray-600">{label}:</Text>
                  <Text className="font-medium">{value}</Text>
                </View>
              )
            )}
          </View>

          <View className="px-4 py-2 space-y-2 border-t border-gray-200">
            <Text className="font-semibold text-base">Thông tin liên hệ:</Text>
            {[["Tên", item.contact.name || "N/A"], ["Email", item.contact.email || "N/A"]].map(
              ([label, value], index) => (
                <View key={index} className="flex-row justify-between">
                  <Text className="text-gray-600">{label}:</Text>
                  <Text className="font-medium">{value}</Text>
                </View>
              )
            )}
          </View>

          <View className="px-4 py-4">
            <Pressable
              onPress={() => handleCall(item.contact?.phone)}
              className="bg-red-600 rounded-full py-3 flex-row items-center justify-center"
            >
              <Ionicons name="call-outline" size={20} color="#fff" />
              <Text className="text-white ml-2 font-semibold text-base">
                {item.contact?.phone || "Liên hệ"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Modal menu sửa/xoá */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setMenuVisible(false)}
        >
          <View className="bg-white rounded-t-xl p-4">
            <TouchableOpacity
              className="py-3 border-b border-gray-200"
              onPress={handleEditPost}
            >
              <Text className="text-base">Sửa bài đăng</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3" onPress={handleDeletePost}>
              <Text className="text-base text-red-600">Xóa bài đăng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default RealEstateDetail;
