import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

type FilterButtonProps = {
  title: string;
  onPress: () => void;
  isVisible: boolean;
  options: string[];
  onOptionSelect?: (option: string) => void;
};

const FilterButton = ({ title, onPress, isVisible, options, onOptionSelect }: FilterButtonProps) => (
  <View>
    <TouchableOpacity
      onPress={onPress}
      className="w-34 bg-white px-4 py-3 rounded-full border border-gray-300"
    >
      <Text className="text-sm text-gray-400 text-center">{title} ▼</Text>
    </TouchableOpacity>

    {isVisible && (
      <View
        style={{
          position: 'absolute',
          top: 40,
          left: 0,
          zIndex: 10,
        }}
        className="bg-white border border-gray-300 rounded-xl mt-2 p-2"
      >
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              onOptionSelect?.(option);
            }}
          >
            <Text className="text-sm text-gray-700 py-2">{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

export default FilterButton;
