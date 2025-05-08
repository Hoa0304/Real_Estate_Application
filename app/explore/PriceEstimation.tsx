import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '../../firebaseConfig';
import { collection, doc, addDoc, query, getDocs } from 'firebase/firestore';
import { useAuth } from '@clerk/clerk-expo';

const PriceEstimation = () => {
    const router = useRouter();
    const { userId } = useAuth();

    const [area, setArea] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [floors, setFloors] = useState('');
    const [category, setCategory] = useState('');
    const [location, setLocation] = useState('');
    const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [previousPredictions, setPreviousPredictions] = useState<any[]>([]);
    const categories = ['Nhà phố', 'Căn hộ', 'Biệt thự'];

    useEffect(() => {
        const fetchPreviousPredictions = async () => {
            if (!userId) return;

            try {
                const predictionsRef = collection(db, 'user', userId, 'predict');
                const q = query(predictionsRef);
                const querySnapshot = await getDocs(q);

                const predictionsList: any[] = [];
                querySnapshot.forEach((doc) => {
                    predictionsList.push({ id: doc.id, ...doc.data() });
                });

                setPreviousPredictions(predictionsList);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu từ Firestore", error);
                Alert.alert('Lỗi', 'Không thể lấy dữ liệu dự đoán trước đó.');
            }
        };

        fetchPreviousPredictions();
    }, [userId]);

    const handleEstimate = async () => {
        if (!area || !bedrooms || !bathrooms || !floors || !category || !location) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            setLoading(true);
            const response = await fetch('http://192.168.1.174:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    area,
                    bedrooms: parseInt(bedrooms),
                    bathrooms: parseInt(bathrooms),
                    floors,
                    category,
                    location,
                }),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error('Lỗi khi gọi API');
            }

            const data = await response.json();
            setEstimatedPrice(data.estimated_price);

            if (userId) {
                await saveToFirebase(userId, {
                    area,
                    bedrooms,
                    bathrooms,
                    floors,
                    category,
                    location,
                    estimatedPrice: data.estimated_price,
                });
            } else {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log('Lỗi khi gọi API:', error.message);
                Alert.alert('Lỗi', 'Không thể dự đoán. Vui lòng thử lại sau.');
            } else {
                console.log('Lỗi không xác định:', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    const saveToFirebase = async (uid: string, data: any) => {
        try {
            const userRef = doc(db, 'user', uid);
            const predictRef = collection(userRef, 'predict');

            await addDoc(predictRef, {
                ...data,
                timestamp: new Date(),
            });

            const predictionsRef = collection(db, 'user', uid, 'predict');
            const q = query(predictionsRef);
            const querySnapshot = await getDocs(q);

            const predictionsList: any[] = [];
            querySnapshot.forEach((doc) => {
                predictionsList.push({ id: doc.id, ...doc.data() });
            });

            setPreviousPredictions(predictionsList);

            Alert.alert('Thành công', 'Dự đoán đã được lưu thành công.');
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu vào Firebase:', error);
            Alert.alert('Lỗi', 'Không thể lưu dữ liệu vào Firebase.');
        }
    };

    const handleSelectCategory = (item: string) => {
        setCategory(item);
        setModalVisible(false);
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 30 }}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>

            <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, color: '#F44336' }}>
                Dự đoán giá bất động sản
            </Text>

            {[
                { label: 'Diện tích (m²)', value: area, setter: setArea, placeholder: 'VD: 96' },
                { label: 'Số phòng ngủ', value: bedrooms, setter: setBedrooms, placeholder: 'VD: 4' },
                { label: 'Số phòng tắm', value: bathrooms, setter: setBathrooms, placeholder: 'VD: 2' },
                { label: 'Số tầng', value: floors, setter: setFloors, placeholder: 'VD: 3' },
                { label: 'Vị trí ( Thành Phố )', value: location, setter: setLocation, placeholder: 'VD: Đà Nẵng' },
            ].map((item, index) => (
                <View key={index} style={{ marginTop: 20 }}>
                    <Text>{item.label}:</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: '#D1D5DB',
                            borderRadius: 8,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            marginTop: 5,
                        }}
                        keyboardType={index < 4 ? 'numeric' : 'default'}
                        value={item.value || ''}
                        onChangeText={item.setter}
                        placeholder={item.placeholder}
                        placeholderTextColor="#A0A0A0"
                    />

                </View>
            ))}

            <View style={{ marginTop: 20 }}>
                <Text>Loại nhà:</Text>
                <TouchableOpacity
                    style={{
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 8,
                        padding: 12,
                        marginTop: 5,
                        justifyContent: 'center',
                        width: '100%',
                    }}
                    onPress={() => setModalVisible(true)}
                >
                    <Text>{category || 'Chọn loại nhà'}</Text>
                </TouchableOpacity>
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: '80%', backgroundColor: 'white', borderRadius: 8, padding: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Chọn loại nhà</Text>

                        <FlatList
                            data={categories}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{
                                        padding: 12,
                                        width: '100%',
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#D1D5DB',
                                    }}
                                    onPress={() => handleSelectCategory(item)}
                                >
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item}
                        />
                    </View>
                </View>
            </Modal>

            <TouchableOpacity
                style={{
                    backgroundColor: '#3B82F6',
                    borderRadius: 30,
                    paddingVertical: 14,
                    marginTop: 30
                }}
                onPress={handleEstimate}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Dự đoán ngay</Text>
                )}
            </TouchableOpacity>

            {estimatedPrice !== null && (
                <View style={{ marginTop: 20, backgroundColor: '#D1FAE5', padding: 15, borderRadius: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#16A34A' }}>
                        💰 Giá dự đoán: {estimatedPrice.toLocaleString('vi-VN')} ₫
                    </Text>
                </View>
            )}

            <View style={{ marginTop: 30 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Các dự đoán trước đó</Text>

                <FlatList
                    data={previousPredictions}
                    style={{ maxHeight: 200 }}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    renderItem={({ item }) => (
                        <View style={{ backgroundColor: '#F3F4F6', padding: 15, marginBottom: 15, borderRadius: 8 }}>
                            <Text style={{ fontWeight: 'bold' }}>{item.category} - {item.location}</Text>
                            <Text>Diện tích: {item.area} m²</Text>
                            <Text>Số phòng ngủ: {item.bedrooms}</Text>
                            <Text>Số phòng tắm: {item.bathrooms}</Text>
                            <Text>Số tầng: {item.floors}</Text>
                            <Text>Giá dự đoán: {item.estimatedPrice.toLocaleString('vi-VN')} ₫</Text>
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                />
            </View>

        </View>
    );
};

export default PriceEstimation;
