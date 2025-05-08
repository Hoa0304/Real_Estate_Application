import React from 'react';
import { View } from 'react-native';
import FilterButton from './FilterButton';

type Props = {
  isFilterVisible: { category: boolean; price: boolean; area: boolean };
  selectedCategory: string | null;
  selectedPrice: string | null;
  selectedArea: string | null;
  handleFilterPress: (key: 'category' | 'price' | 'area') => void;
  handleFilterSelect: (key: string, value: string) => void;
};

const FilterBar = ({
  isFilterVisible,
  selectedCategory,
  selectedPrice,
  selectedArea,
  handleFilterPress,
  handleFilterSelect,
}: Props) => {
  return (
    <View className="flex-row justify-between gap-2 relative">
      <FilterButton
        title={selectedCategory || 'Loại nhà đất'}
        onPress={() => handleFilterPress('category')}
        isVisible={isFilterVisible.category}
        options={['Tất cả', 'Nhà phố', 'Căn hộ', 'Biệt thự']}
        onOptionSelect={(category) => handleFilterSelect('category', category)}
      />
      <FilterButton
        title={selectedPrice || 'Mức giá'}
        onPress={() => handleFilterPress('price')}
        isVisible={isFilterVisible.price}
        options={['Tất cả', 'Dưới 2 tỷ', '2-10 tỷ', 'Trên 10 tỷ']}
        onOptionSelect={(price) => handleFilterSelect('price', price)}
      />
      <FilterButton
        title={selectedArea || 'Diện tích'}
        onPress={() => handleFilterPress('area')}
        isVisible={isFilterVisible.area}
        options={['Tất cả', 'Dưới 50 m²', '50-100 m²', 'Trên 100 m²']}
        onOptionSelect={(area) => handleFilterSelect('area', area)}
      />
    </View>
  );
};

export default FilterBar;
