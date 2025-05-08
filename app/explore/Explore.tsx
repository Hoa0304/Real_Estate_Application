import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import images from "@/constants/images";
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const HomeScreen = () => {
    const { user } = useUser();
    const router = useRouter();
    const [postCount, setPostCount] = useState(0);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
    
        const q = query(collection(db, 'real_estate_posts'), where('userId', '==', user.id));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userPosts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(userPosts);
            setPostCount(userPosts.length);
        }, (error) => {
            console.error('Lỗi khi lắng nghe bài đăng:', error);
            setPosts([]);
            setPostCount(0);
        });
    
        return () => unsubscribe();
    }, [user?.id]);
    

    const handlePost = () => {
        router.push('/explore/Detail');
    };

    const handlePredictPrice = () => {
        router.push('/explore/PriceEstimation');
    };

    const getBuoiHienTai = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) {
            return "sáng";
        } else if (hour >= 11 && hour < 13) {
            return "trưa";
        } else if (hour >= 13 && hour < 18) {
            return "chiều";
        } else {
            return "tối";
        }
    };

    const fullName = user?.fullName || 'Người dùng';
    const initial = fullName.charAt(0).toUpperCase();

    const renderHeader = () => (
        <>
            <View className="bg-red-600 p-4 pt-5 rounded-b-2xl">
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <View className="bg-white rounded-full p-2 w-12 h-12">
                            <Text className="text-center text-red-600 font-bold text-xl">{initial}</Text>
                        </View>
                        <View className="ml-3">
                            <Text className="text-white font-bold text-base">Chào buổi {getBuoiHienTai()}</Text>
                            <View className="flex-row items-center">
                                <Text className="text-white font-semibold mr-1">{fullName}</Text>
                                <Feather name="chevron-right" size={20} color="white" />
                            </View>
                        </View>
                    </View>
                    <Ionicons name="notifications-outline" size={24} color="white" />
                </View>

                <View className="bg-white rounded-2xl p-4 mt-4 items-center">
                    <Image source={images.home} className="w-[200px] h-[100px] mb-2" />
                    <Text className="text-red-600 font-bold text-lg mb-2">Quà tặng 1 tin thường 15 ngày</Text>
                    <Text className="text-gray-600 text-sm text-center mb-4">Tin đăng của bạn sẽ được tiếp cận hơn 6 triệu người tìm mua / thuê bất động sản mỗi tháng</Text>
                    
                    <TouchableOpacity className="bg-red-600 rounded-full px-6 py-2" onPress={handlePost}>
                        <Text className="text-white font-semibold">+ Tạo tin đăng đầu tiên</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-blue-600 rounded-full px-6 py-2 mt-2" onPress={handlePredictPrice}>
                        <Text className="text-white font-semibold">📊 Dự đoán giá bất động sản</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="bg-white rounded-2xl p-4 m-4">
                <Text className="text-lg font-bold mb-4">Tổng quan tài khoản</Text>
                <View className="flex-row justify-between">
                    <View className="flex-1 items-center">
                        <Ionicons name="newspaper-outline" size={24} color="gray" />
                        <Text className="text-sm mt-1">Tin đăng</Text>
                        <Text className="text-xl font-bold">{postCount} tin</Text>
                        <Text className="text-sm">Đang hiển thị</Text>
                    </View>
                    <View className="flex-1 items-center">
                        <Ionicons name="people-outline" size={24} color="gray" />
                        <Text className="text-sm mt-1">Dự đoán giá</Text>
                        <Text className="text-xl font-bold">0 bài</Text>
                        <Text className="text-sm">Được lưu</Text>
                    </View>
                </View>
            </View>

            <View className="bg-white rounded-2xl p-4 m-4">
                <Text className="text-lg font-bold mb-4">Bài đăng của bạn</Text>
                <FlatList
                    data={posts}
                    renderItem={renderPostItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={<Text className="text-center text-gray-500">Chưa có bài đăng nào.</Text>}
                    contentContainerStyle={{ paddingBottom: 10 }}
                />
            </View>
        </>
    );

    const renderPostItem = ({ item }) => (
        <TouchableOpacity
            className="bg-white p-4 mb-2 rounded-xl flex-row items-center mx-4"
            onPress={() => router.push(`/home/${item.id}`)}
        >
            {item.images && item.images.length > 0 && (
                <Image
                    source={{ uri: item.images[0] }}
                    className="w-20 h-20 rounded-lg mr-4"
                    resizeMode="cover"
                />
            )}
            <View className="flex-1">
                <Text className="text-lg font-bold">{item.title || 'Chưa có tiêu đề'}</Text>
                <Text className="text-gray-600">{item.location || 'Chưa có địa chỉ'}</Text>
                <Text className="text-red-600 font-semibold">{item.price || 'Chưa có giá'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={[]}
            renderItem={null}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{ backgroundColor: '#F3F4F6' }}
            keyExtractor={(item, index) => index.toString()}
        />
    );
};

export default HomeScreen;