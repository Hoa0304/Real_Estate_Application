import React from 'react';
import { FlatList, Text } from 'react-native';
import RealEstateItemV2 from './RealEstateItemV2';

type Props = {
  data: any[];
  favorites: any[];
  onFavoriteToggle: (item: any) => void;
};

const RealEstateList = ({ data, favorites, onFavoriteToggle }: Props) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <RealEstateItemV2
          item={item}
          onFavoriteToggle={onFavoriteToggle}
          isFavorite={favorites.some((fav) => fav.id === item.id)}
        />
      )}
      showsVerticalScrollIndicator={false}
      className="px-4"
      ListEmptyComponent={
        <Text className="text-center text-gray-500 mt-10">
          Không có kết quả phù hợp
        </Text>
      }
    />
  );
};

export default RealEstateList;
