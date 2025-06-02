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
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '../../firebaseConfig';
import { collection, doc, addDoc, query, getDocs } from 'firebase/firestore';
import { useAuth } from '@clerk/clerk-expo';

interface PredictionInput {
  location: string;
  type_of_house: string;
  land_area: string;
  bedrooms?: string;
  toilets?: string;
  total_floors?: string;
  main_door_direction?: string;
  balcony_direction?: string;
  legal_documents?: string;
  phone: string;
}

interface PredictionData {
  id?: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  category: string;
  location: string;
  main_door_direction?: string;
  balcony_direction?: string;
  legal_documents?: string;
  estimatedPrice: number;
  timestamp?: Date;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  contentContainer: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#F44336', textAlign: 'center' },
  inputContainer: { marginTop: 15 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginTop: 5,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 30,
    paddingVertical: 14,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  resultContainer: { marginTop: 15, backgroundColor: '#D1FAE5', padding: 15, borderRadius: 8 },
  resultText: { fontSize: 18, fontWeight: 'bold', color: '#16A34A' },
  historyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
  historyItem: { backgroundColor: '#F3F4F6', padding: 15, marginBottom: 10, borderRadius: 8 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 8, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  modalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#D1D5DB' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
});

const PriceEstimation: React.FC = () => {
  const router = useRouter();
  const { userId } = useAuth();

  const [area, setArea] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [bathrooms, setBathrooms] = useState<string>('');
  const [floors, setFloors] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [mainDoorDirection, setMainDoorDirection] = useState<string>('');
  const [balconyDirection, setBalconyDirection] = useState<string>('');
  const [legalDocuments, setLegalDocuments] = useState<string>('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<{ type: string; visible: boolean }>({ type: '', visible: false });
  const [previousPredictions, setPreviousPredictions] = useState<PredictionData[]>([]);

  const categories: string[] = [
    'Nhà hẻm, ngõ',
    'Nhà mặt tiền',
    'Biệt thự, Villa',
    'Đất thổ cư',
    'Nhà phố liền kề',
    'Căn hộ chung cư',
    'Khách sạn, nhà hàng',
  ];

  const directions: string[] = [
    'Bắc',
    'Nam',
    'Tây',
    'Tây Bắc',
    'Tây Nam',
    'Đông',
    'Đông Bắc',
    'Đông Nam',
    'Không xác định',
  ];

  const legalDocs: string[] = [
    'Giấy tờ hợp lệ',
    'Giấy tờ khác',
    'Hợp đồng mua bán',
    'Sổ hồng',
    'Sổ đỏ',
    'Đang chờ sổ',
    'Không xác định',
  ];

  useEffect(() => {
    const fetchPreviousPredictions = async () => {
      if (!userId) return;

      try {
        const predictionsRef = collection(db, 'user', userId, 'predict');
        const q = query(predictionsRef);
        const querySnapshot = await getDocs(q);

        const predictionsList: PredictionData[] = [];
        querySnapshot.forEach((doc) => {
          predictionsList.push({ id: doc.id, ...doc.data() } as PredictionData);
        });

        setPreviousPredictions(predictionsList);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ Firestore:', error);
        Alert.alert('Lỗi', 'Không thể lấy dữ liệu dự đoán trước đó.');
      }
    };

    fetchPreviousPredictions();
  }, [userId]);

  const handleEstimate = async () => {
    if (!area || !category || !location) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc: Diện tích, Loại nhà, Vị trí.');
      return;
    }

    const land_area = parseFloat(area);
    const bedroomsInt = bedrooms ? parseInt(bedrooms) : undefined;
    const bathroomsInt = bathrooms ? parseInt(bathrooms) : undefined;
    const floorsInt = floors ? parseInt(floors) : undefined;

    if (isNaN(land_area) || (bedrooms && isNaN(bedroomsInt!)) || (bathrooms && isNaN(bathroomsInt!)) || (floors && isNaN(floorsInt!))) {
      Alert.alert('Lỗi', 'Vui lòng nhập số hợp lệ cho diện tích, phòng ngủ, phòng tắm và số tầng.');
      return;
    }

    const payload: PredictionInput = {
      location,
      type_of_house: category,
      land_area: area,
      bedrooms: bedrooms || undefined,
      toilets: bathrooms || undefined,
      total_floors: floors || undefined,
      main_door_direction: mainDoorDirection || undefined,
      balcony_direction: balconyDirection || undefined,
      legal_documents: legalDocuments || undefined,
      phone: '+84789469867',
    };

    console.log('Payload gửi đi:', JSON.stringify(payload, null, 2));

    Alert.alert(
      'Xác nhận',
      'Bạn có muốn gửi yêu cầu dự đoán với thông tin này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            try {
              setLoading(true);
              const response = await fetch('http://192.168.1.11:8000/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal,
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Lỗi khi gọi API');
              }

              const data = await response.json();
              setEstimatedPrice(parseFloat(data.predicted_price_vnd.replace(/[^0-9.]/g, '')));

              if (userId) {
                await saveToFirebase(userId, {
                  area: land_area,
                  bedrooms: bedroomsInt || 0,
                  bathrooms: bathroomsInt || 0,
                  floors: floorsInt || 1,
                  category,
                  location,
                  main_door_direction: mainDoorDirection || 'Không xác định',
                  balcony_direction: balconyDirection || 'Không xác định',
                  legal_documents: legalDocuments || 'Không xác định',
                  estimatedPrice: parseFloat(data.predicted_price_vnd.replace(/[^0-9.]/g, '')),
                });
              } else {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng.');
              }
            } catch (error: any) {
              console.error('Lỗi khi gọi API:', error.message);
              Alert.alert('Lỗi', error.message || 'Không thể dự đoán. Vui lòng thử lại sau.');
            } finally {
              clearTimeout(timeoutId);
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const saveToFirebase = async (uid: string, data: PredictionData) => {
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

      const predictionsList: PredictionData[] = [];
      querySnapshot.forEach((doc) => {
        predictionsList.push({ id: doc.id, ...doc.data() } as PredictionData);
      });

      setPreviousPredictions(predictionsList);
      Alert.alert('Thành công', 'Dự đoán đã được lưu thành công.');
    } catch (error) {
      console.error('Lỗi khi lưu dữ liệu vào Firebase:', error);
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu vào Firebase.');
    }
  };

  const clearInputs = () => {
    setArea('');
    setBedrooms('');
    setBathrooms('');
    setFloors('');
    setCategory('');
    setLocation('');
    setMainDoorDirection('');
    setBalconyDirection('');
    setLegalDocuments('');
    setEstimatedPrice(null);
  };

  const handleSelectDropdown = (type: string, item: string) => {
    if (type === 'category') setCategory(item);
    else if (type === 'main_door_direction') setMainDoorDirection(item);
    else if (type === 'balcony_direction') setBalconyDirection(item);
    else if (type === 'legal_documents') setLegalDocuments(item);
    setModalVisible({ type: '', visible: false });
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      <ScrollView style={styles.contentContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Dự đoán giá bất động sản</Text>

        {[
          { label: 'Diện tích (m²)', value: area, setter: setArea, placeholder: 'Nhập diện tích (m²)' },
          { label: 'Số phòng ngủ', value: bedrooms, setter: setBedrooms, placeholder: 'Nhập số phòng ngủ' },
          { label: 'Số phòng tắm', value: bathrooms, setter: setBathrooms, placeholder: 'Nhập số phòng tắm' },
          { label: 'Số tầng', value: floors, setter: setFloors, placeholder: 'Nhập số tầng' },
          { label: 'Vị trí', value: location, setter: setLocation, placeholder: 'VD: Bình Thạnh' },
        ].map((item, index) => (
          <View key={index} style={styles.inputContainer}>
            <Text style={styles.label}>{item.label}:</Text>
            <TextInput
              style={styles.input}
              keyboardType={index < 4 ? 'numeric' : 'default'}
              value={item.value}
              onChangeText={item.setter}
              placeholder={item.placeholder}
              placeholderTextColor="#A0A0A0"
            />
          </View>
        ))}

        {[
          { label: 'Loại nhà', value: category, type: 'category', options: categories },
          { label: 'Hướng cửa chính', value: mainDoorDirection, type: 'main_door_direction', options: directions },
          { label: 'Hướng ban công', value: balconyDirection, type: 'balcony_direction', options: directions },
          { label: 'Giấy tờ pháp lý', value: legalDocuments, type: 'legal_documents', options: legalDocs },
        ].map((item, index) => (
          <View key={index} style={styles.inputContainer}>
            <Text style={styles.label}>{item.label}:</Text>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => setModalVisible({ type: item.type, visible: true })}
            >
              <Text>{item.value || `Chọn ${item.label.toLowerCase()}`}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Modal
          transparent={true}
          visible={modalVisible.visible}
          animationType="slide"
          onRequestClose={() => setModalVisible({ type: '', visible: false })}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Chọn {modalVisible.type === 'category' ? 'loại nhà' : modalVisible.type === 'main_door_direction' ? 'hướng cửa chính' : modalVisible.type === 'balcony_direction' ? 'hướng ban công' : 'giấy tờ pháp lý'}
              </Text>
              <FlatList
                data={modalVisible.type === 'category' ? categories : modalVisible.type === 'main_door_direction' || modalVisible.type === 'balcony_direction' ? directions : legalDocs}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleSelectDropdown(modalVisible.type, item)}
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
          style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
          onPress={handleEstimate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Dự đoán ngay'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#EF4444', marginTop: 10 }]}
          onPress={clearInputs}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Xóa dữ liệu</Text>
        </TouchableOpacity>

        {estimatedPrice !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>
              💰 Giá dự đoán: {estimatedPrice.toLocaleString('vi-VN')} VND
            </Text>
          </View>
        )}

        <Text style={styles.historyTitle}>Các dự đoán trước đó</Text>
        <FlatList
          data={previousPredictions}
          scrollEnabled={false} // Disable FlatList scrolling to allow ScrollView to handle it
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={{ fontWeight: 'bold' }}>{item.category} - {item.location}</Text>
              <Text>Diện tích: {item.area} m²</Text>
              <Text>Số phòng ngủ: {item.bedrooms}</Text>
              <Text>Số phòng tắm: {item.bathrooms}</Text>
              <Text>Số tầng: {item.floors}</Text>
              <Text>Hướng cửa chính: {item.main_door_direction || 'Không có'}</Text>
              <Text>Hướng ban công: {item.balcony_direction || 'Không có'}</Text>
              <Text>Giấy tờ pháp lý: {item.legal_documents || 'Không có'}</Text>
              <Text>Giá dự đoán: {item.estimatedPrice.toLocaleString('vi-VN')} VND</Text>
            </View>
          )}
          keyExtractor={(item) => item.id!}
        />
      </ScrollView>
    </View>
  );
};

export default PriceEstimation;