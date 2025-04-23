import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import images from '@/constants/images';

type RealEstateItemProps = {
  item: {
    id: string;
    title: string;
    price: string;
    location: string;
    image: any;
    contact: string;
  };
  onFavoriteToggle: (item: any) => void;
  isFavorite: boolean;
};

const RealEstateItem = ({ item, onFavoriteToggle, isFavorite }: RealEstateItemProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/home/[id]',
      params: { id: item.id },
    });    
  };
  

  return (
    <TouchableOpacity onPress={handlePress}>
      <View className="bg-white rounded-xl shadow p-3 mb-4">
        <Image
          source={item.image}
          className="w-full h-60 rounded-lg mb-2"
          resizeMode="cover"
        />
        <Text className="text-base font-semibold" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="text-red-600 font-bold mt-1">{item.price}</Text>
        <Text className="text-gray-500">{item.location}</Text>

        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-row items-center">
            <Image source={images.home} className="w-6 h-6 mr-2" />
            <Text className="text-sm text-gray-600">Vinhomes Online</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="bg-red-500 px-3 py-1 rounded-xl mr-2">
              <Text className="text-white font-semibold">{item.contact}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => onFavoriteToggle(item)}>
              <AntDesign
                name={isFavorite ? 'heart' : 'hearto'}
                size={24}
                color={isFavorite ? 'red' : 'gray'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RealEstateItem;
