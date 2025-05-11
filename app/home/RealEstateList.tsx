import React, { useState } from 'react';
import { FlatList } from 'react-native';
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
    />
  );
};


export default RealEstateList;
