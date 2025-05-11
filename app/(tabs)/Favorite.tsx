import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig'; 
import useFetchFavorites from '@/hooks/fetchFavoritesFromFirebase';
import RealEstateItem from '../home/RealEstateItem';

const Favorite = () => {
  const { user } = useUser();
  const userId = user?.id;

  const { favorites, loading } = useFetchFavorites(userId || '');

  const [favoriteItems, setFavoriteItems] = useState(favorites);

  const handleFavoriteToggle = async (item: any) => {
    if (item.isFavorite && userId) {
      try {
        await deleteDoc(doc(db, 'user', userId, 'favorites', item.id));

        setFavoriteItems((prevItems) =>
          prevItems.filter((fav) => fav.id !== item.id)
        );
      } catch (error) {
        console.error('Lỗi khi xóa khỏi yêu thích:', error);
      }
    }
  };

  useEffect(() => {
    setFavoriteItems(favorites);
  }, [favorites]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  if (favoriteItems.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không có yêu thích nào để hiển thị</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7fafc' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Danh sách yêu thích</Text>
      </View>

      <FlatList
        data={favoriteItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RealEstateItem
            item={item}
            onFavoriteToggle={handleFavoriteToggle}
            isFavorite={item.isFavorite || false}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          paddingTop: 14,
        }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            Không có kết quả phù hợp
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default Favorite;
