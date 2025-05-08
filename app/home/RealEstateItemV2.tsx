import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import images from '@/constants/images';

type RealEstateItemProps = {
  item: {
    id: string;
    title: string;
    price: string;
    location: string;
    images?: string[];
    image?: string; 
    contact: {
      phone?: string;
      name: string;
    };
    isFavorite?: boolean; 
  };
  onFavoriteToggle: (item: any) => void; 
  isFavorite: boolean;
};

const RealEstateItemV2 = ({ item, onFavoriteToggle, isFavorite }: RealEstateItemProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/home/[id]',
      params: { id: item.id },
    });
  };

  const getRandomImage = () => {
    const imgs = Array.isArray(item.images)
      ? item.images
      : item.image
      ? [item.image]
      : [];

    if (imgs.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * imgs.length);
    return imgs[randomIndex];
  };

  const imageUri = getRandomImage();

  return (
    <TouchableOpacity onPress={handlePress}>
      <View className="bg-white rounded-xl shadow p-3 mb-4">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="w-full h-60 rounded-lg mb-2"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-60 rounded-lg mb-2 bg-gray-200 justify-center items-center">
            <Text className="text-gray-500">Không có ảnh</Text>
          </View>
        )}

        <Text className="text-base font-semibold" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="text-red-600 font-bold mt-1">{item.price}</Text>
        <Text className="text-gray-500">{item.location}</Text>

        <View className="flex-row justify-between items-center mt-2">
          <View className="flex-row items-center">
            <Image source={images.home} className="w-6 h-6 mr-2" />
            <Text className="text-sm text-gray-600">{item.contact.name}</Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="bg-red-500 px-3 py-1 rounded-xl mr-2">
              <Text className="text-white font-semibold">
                {item.contact?.phone || "Liên hệ"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RealEstateItemV2;
