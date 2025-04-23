import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

type Props = {
  searchText: string;
  onChangeText: (text: string) => void;
};

const SearchBar = ({ searchText, onChangeText }: Props) => (
  <View className="flex-row items-center bg-white rounded-xl px-4 py-2 mb-3">
    <Feather name="search" size={20} color="#666" />
    <View className="ml-3 flex-1">
      <Text className="text-black font-semibold mb-1">Bạn tìm BĐS ở đâu?</Text>
      <TextInput
        placeholder="Tìm Đường phố"
        value={searchText}
        onChangeText={onChangeText}
        className="text-gray-700 text-sm"
        placeholderTextColor="#999"
      />
    </View>
  </View>
);

export default SearchBar;
