import React from 'react';
import { View } from 'react-native';
import FilterButton from './FilterButton';

type Props = {
  isFilterVisible: { type: boolean; price: boolean; area: boolean };
  selectedType: string | null;
  selectedPrice: string | null;
  selectedArea: string | null;
  handleFilterPress: (key: 'type' | 'price' | 'area') => void;
  handleFilterSelect: (key: string, value: string) => void;
};

const FilterBar = ({
  isFilterVisible,
  selectedType,
  selectedPrice,
  selectedArea,
  handleFilterPress,
  handleFilterSelect,
}: Props) => {
  return (
    <View className="flex-row justify-between gap-2 relative">
      <FilterButton
        title={selectedType || 'Loại nhà đất'}
        onPress={() => handleFilterPress('type')}
        isVisible={isFilterVisible.type}
        options={['Nhà phố', 'Căn hộ', 'Biệt thự']}
        onOptionSelect={(type) => handleFilterSelect('type', type)}
      />
      <FilterButton
        title={selectedPrice || 'Mức giá'}
        onPress={() => handleFilterPress('price')}
        isVisible={isFilterVisible.price}
        options={['Dưới 1 tỷ', '1-2 tỷ', 'Trên 2 tỷ']}
        onOptionSelect={(price) => handleFilterSelect('price', price)}
      />
      <FilterButton
        title={selectedArea || 'Diện tích'}
        onPress={() => handleFilterPress('area')}
        isVisible={isFilterVisible.area}
        options={['Dưới 50 m²', '50-100 m²', 'Trên 100 m²']}
        onOptionSelect={(area) => handleFilterSelect('area', area)}
      />
    </View>
  );
};

export default FilterBar;
