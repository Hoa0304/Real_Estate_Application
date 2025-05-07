import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchBar from '../home/SearchBar';
import FilterBar from '../home/FilterBar';
import RealEstateList from '../home/RealEstateList';
import useFetchRealEstatePosts from '../../hooks/useFetchRealEstatePosts';

type FilterState = {
  type: boolean;
  price: boolean;
  area: boolean;
};

const Home = () => {
  const { posts, loading } = useFetchRealEstatePosts();

  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState<FilterState>({
    type: false,
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
    if (key === 'type') setSelectedType(value);
    if (key === 'price') setSelectedPrice(value);
    if (key === 'area') setSelectedArea(value);
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
    const matchType = selectedType ? item.type === selectedType : true;
    const matchPrice =
      selectedPrice === 'Dưới 1 tỷ'
        ? extractPriceValue(item.price) < 1
        : selectedPrice === '1-2 tỷ'
        ? extractPriceValue(item.price) >= 1 && extractPriceValue(item.price) <= 2
        : selectedPrice === 'Trên 2 tỷ'
        ? extractPriceValue(item.price) > 2
        : true;
    const matchArea =
      selectedArea === 'Dưới 50 m²'
        ? extractAreaValue(item.area) < 50
        : selectedArea === '50-100 m²'
        ? extractAreaValue(item.area) >= 50 && extractAreaValue(item.area) <= 100
        : selectedArea === 'Trên 100 m²'
        ? extractAreaValue(item.area) > 100
        : true;
    const matchSearch = item.title?.toLowerCase().includes(searchText.toLowerCase());
    return matchType && matchPrice && matchArea && matchSearch;
  });

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4">
        <SearchBar searchText={searchText} onChangeText={setSearchText} />
        <FilterBar
          isFilterVisible={isFilterVisible}
          selectedType={selectedType}
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
