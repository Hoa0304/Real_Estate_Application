import React, { useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../home/SearchBar';
import FilterBar from '../home/FilterBar';
import RealEstateList from '../home/RealEstateList';
import useFetchRealEstatePosts from '@/hooks/useFetchRealEstatePosts';

type FilterState = {
  category: boolean;
  price: boolean;
  area: boolean;
};

const Home = () => {
  const { posts, loading } = useFetchRealEstatePosts();

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Loại nhà đất');
  const [selectedPrice, setSelectedPrice] = useState<string | null>('Mức giá');
  const [selectedArea, setSelectedArea] = useState<string | null>('Diện tích');
  const [isFilterVisible, setIsFilterVisible] = useState<FilterState>({
    category: false,
    price: false,
    area: false,
  });
  const [favorites, setFavorites] = useState<any[]>([]);

  const handleFavoriteToggle = (item: any) => {
    const exists = favorites.some((fav) => fav.id === item.id);
    setFavorites((prev) =>
      exists ? prev.filter((fav) => fav.id !== item.id) : [...prev, item]
    );
  };

  const handleFilterPress = (key: keyof FilterState) => {
    setIsFilterVisible((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  

  const handleFilterSelect = (key: string, value: string) => {
    if (value === 'Tất cả') {
      if (key === 'category') setSelectedCategory('Loại nhà đất');
      if (key === 'price') setSelectedPrice('Mức giá');
      if (key === 'area') setSelectedArea('Diện tích');
    } else {
      if (key === 'category') setSelectedCategory(value);
      if (key === 'price') setSelectedPrice(value);
      if (key === 'area') setSelectedArea(value);
    }
  
    setIsFilterVisible((prev) => ({ ...prev, [key]: false }));
  };

  const extractPriceValue = (price: string) => {
    const priceMatch = price.match(/(\d+(\.\d+)?)/);
    return priceMatch ? parseFloat(priceMatch[0]) : 0;
  };

  const extractAreaValue = (area: string | number) => {
    if (typeof area === 'number') return area;
    const areaMatch = area.match(/(\d+)( m²)?/);
    return areaMatch ? parseFloat(areaMatch[1]) : 0;
  };

  const filteredData = posts.filter((item) => {
    const matchCategory =
      !selectedCategory || selectedCategory === 'Loại nhà đất' || selectedCategory === 'Tất cả' || item.category === selectedCategory;

    const numericPrice = extractPriceValue(item.price || '');
    const matchPrice =
      !selectedPrice || selectedPrice === 'Tất cả'
        ? true
        : selectedPrice === 'Dưới 2 tỷ'
        ? numericPrice < 2
        : selectedPrice === '2-10 tỷ'
        ? numericPrice >= 2 && numericPrice <= 10
        : selectedPrice === 'Trên 10 tỷ'
        ? numericPrice > 10
        : true;

    const numericArea = extractAreaValue(item.area || '');
    const matchArea =
      !selectedArea || selectedArea === 'Tất cả'
        ? true
        : selectedArea === 'Dưới 50 m²'
        ? numericArea < 50
        : selectedArea === '50-100 m²'
        ? numericArea >= 50 && numericArea <= 100
        : selectedArea === 'Trên 100 m²'
        ? numericArea > 100
        : true;

    const matchSearch = item.title?.toLowerCase().includes(searchText.toLowerCase());

    return matchCategory && matchPrice && matchArea && matchSearch;
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (filteredData.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text>No properties match your filters!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4">
        <SearchBar searchText={searchText} onChangeText={setSearchText} />
        <FilterBar
          isFilterVisible={isFilterVisible}
          selectedCategory={selectedCategory}
          selectedPrice={selectedPrice}
          selectedArea={selectedArea}
          handleFilterPress={handleFilterPress}
          handleFilterSelect={handleFilterSelect}
        />
      </View>

      <RealEstateList
      data={filteredData}
      favorites={favorites}
      onFavoriteToggle={handleFavoriteToggle}
      />
    </SafeAreaView>
  );
};

export default Home;
