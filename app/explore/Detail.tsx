import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location'; // Nhập expo-location
import debounce from 'lodash/debounce'; // Thêm lodash để dùng debounce
import { Platform } from 'react-native';


export default function Detail() {
  const router = useRouter();
  const [selected, setSelected] = useState('Bán');
  const [showOptions, setShowOptions] = useState(false);
  const [region, setRegion] = useState({
    latitude: 14.0583, // Trung tâm Việt Nam (gần Huế)
    longitude: 108.2772,
    latitudeDelta: 10.0, // Bao quát cả Việt Nam
    longitudeDelta: 10.0,
  });
  const [selectedLocation, setSelectedLocation] = useState(null); // Lưu tọa độ đã chọn
  const [address, setAddress] = useState(''); // Lưu địa chỉ đã chọn
  const [inputAddress, setInputAddress] = useState(''); // Địa chỉ người dùng nhập trong modal
  const [showMapModal, setShowMapModal] = useState(false); // State để hiển thị modal bản đồ
  const [addressSuggestions, setAddressSuggestions] = useState([]); // Danh sách gợi ý địa chỉ

  const options = [
    { id: 1, label: 'Bán', icon: 'cash-outline' },
    { id: 2, label: 'Cho thuê', icon: 'key-outline' },
  ];
  const dropdownHeight = useRef(new Animated.Value(0)).current;

  // Lấy vị trí hiện tại khi component được mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập vị trí bị từ chối', 'Vui lòng cấp quyền để sử dụng bản đồ.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
    })();
  }, []);

  useEffect(() => {
    Animated.timing(dropdownHeight, {
      toValue: showOptions ? options.length * 40 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // height không thể dùng native driver
    }).start();
  }, [showOptions]);

  // Hàm lấy gợi ý địa chỉ từ LocationIQ Autocomplete API
  const fetchAddressSuggestions = async (query) => {
    const apiKey = 'pk.1f712969e89f02344e338bfa6ed76ff7'; // Thay bằng khóa API của bạn
    const url = `https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&countrycodes=vn&accept-language=vi`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setAddressSuggestions(data);
      } else {
        setAddressSuggestions([]);
        console.log('Không có gợi ý từ API:', data);
      }
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý địa chỉ:', error);
      setAddressSuggestions([]);
    }
  };

  // Debounce fetchAddressSuggestions để tránh gọi API quá nhanh
  const debouncedFetchAddressSuggestions = useCallback(
    debounce((query) => {
      fetchAddressSuggestions(query);
    }, 500), // Chờ 500ms sau khi người dùng ngừng nhập
    []
  );

  // Hàm chuyển địa chỉ thành tọa độ (Geocoding)
  const geocodeAddress = async (selectedAddress) => {
    const apiKey = 'pk.1f712969e89f02344e338bfa6ed76ff7'; // Thay bằng khóa API của bạn
    const addressToGeocode = selectedAddress.display_name || inputAddress; // Dùng display_name hoặc inputAddress nếu lỗi
    const url = `https://api.locationiq.com/v1/geocode?key=${apiKey}&q=${encodeURIComponent(addressToGeocode)}&format=json&countrycodes=vn&accept-language=vi`;

    try {
      const response = await fetch(url);
      const text = await response.text(); // Đọc raw response để debug
      console.log('Response text:', text); // Log để kiểm tra
      const data = JSON.parse(text);
      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0];
        setSelectedLocation({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
        setRegion({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setInputAddress(data[0].display_name); // Cập nhật địa chỉ chuẩn hóa
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy địa chỉ. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi chuyển địa chỉ thành tọa độ:', error, 'Response:', await response.text());
      Alert.alert('Lỗi', 'Không thể tìm địa chỉ. Vui lòng kiểm tra API Key hoặc kết nối mạng.');
    }
  };

  // Hàm chuyển tọa độ thành địa chỉ (Reverse Geocoding)
  const fetchAddress = async (latitude, longitude) => {
    const apiKey = 'pk.1f712969e89f02344e338bfa6ed76ff7'; // Replace with your LocationIQ API key
    const url = `https://api.locationiq.com/v1/reverse?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json&accept-language=vi`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.display_name) {
        console.log('Fetched address:', data.display_name); // Log the fetched address
        setInputAddress(data.display_name); // Update the input address
        setAddress(data.display_name); // Update the main address
      } else {
        console.error('No address found:', data);
        setInputAddress('Không tìm thấy địa chỉ');
        Alert.alert('Thông báo', 'Không tìm thấy địa chỉ cho vị trí đã chọn.');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setInputAddress('Lỗi khi lấy địa chỉ');
      Alert.alert('Lỗi', 'Không thể lấy địa chỉ. Vui lòng kiểm tra kết nối mạng.');
    }
  };

  // Xử lý khi nhập địa chỉ
  const handleAddressInput = (text) => {
    setInputAddress(text); // Update the input address state
    if (text.trim().length > 2) {
      debouncedFetchAddressSuggestions(text); // Fetch suggestions with debounce
    } else {
      setAddressSuggestions([]); // Clear suggestions if input is too short
    }
  };

  // Xử lý khi chọn một gợi ý địa chỉ
  const handleSelectSuggestion = async (suggestion) => {
    setInputAddress(suggestion.display_name); // Update the input address
    setAddressSuggestions([]); // Clear the suggestions list

    try {
      // Geocode the selected address to get coordinates
      const { lat, lon } = suggestion;
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      setSelectedLocation({ latitude, longitude }); // Update the selected location
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01, // Zoom in closer to the selected location
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error selecting suggestion:', error);
      Alert.alert('Lỗi', 'Không thể chọn địa chỉ. Vui lòng thử lại.');
    }
  };

  // Xử lý khi nhấn vào bản đồ để chọn vị trí
  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    fetchAddress(latitude, longitude); // Lấy địa chỉ từ tọa độ
  };

  const handleContinue = () => {
    Alert.alert('Thông báo!', 'Thông tin đã đầy đủ và chính xác?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: () => {
          console.log('Địa chỉ đã chọn:', address);
          console.log('Tọa độ đã chọn:', selectedLocation);
          // Thêm logic để lưu dữ liệu vào Firestore hoặc tiếp tục
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-2 flex-row items-center justify-between px-4">
        <Text className="text-xl font-bold">Tạo tin đăng</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-[14px] font-medium text-gray-500 border rounded-3xl p-2 px-2">Thoát</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 bg-gray-100 p-4">
        <TouchableOpacity
          className="bg-white p-4 rounded-2xl mb-4"
          onPress={() => setShowMapModal(true)} // Mở modal khi nhấn
        >
          <Text className="font-medium mb-1">Địa chỉ BĐS</Text>
          <TextInput
            className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
            placeholder="Chọn địa chỉ trên bản đồ"
            value={address}
            editable={false} // Không cho phép chỉnh tay trực tiếp
          />
        </TouchableOpacity>

        <View className="bg-white p-4 rounded-2xl mb-4">
          <Text className="font-medium mb-2">Thông tin chính</Text>
          <View>
            <Text className="text-sm font-medium">Loại BĐS</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
              placeholder="Loại BĐS"
            />
          </View>
          <View>
            <Text className="text-sm font-medium">Diện Tích m2</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
              placeholder="Nhập diện tích"
            />
          </View>
          <View className="flex-row justify-between items-center">
            <View className="w-[70%]">
              <Text className="text-sm font-medium">Mức giá</Text>
              <TextInput
                className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                placeholder="Nhập mức giá"
              />
            </View>
            <View className="w-[20%]">
              <Text className="text-sm font-medium">Đơn vị</Text>
              <TextInput
                className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                placeholder="Đơn vị"
              />
            </View>
          </View>
        </View>

        <View className="bg-white p-4 rounded-2xl mb-4">
          {['Số phòng ngủ', 'Số phòng tắm, vệ sinh', 'Số tầng'].map((label, i) => (
            <View key={i} className="flex-row justify-between items-center mt-4">
              <Text className="text-sm font-medium">{label}</Text>
              <View className="flex-row items-center space-x-3">
                <Pressable className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-xl font-semibold">-</Text>
                </Pressable>
                <Text className="text-base mx-2">0</Text>
                <Pressable className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Text className="text-xl font-semibold">+</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View className="bg-white p-4 rounded-2xl mb-4">
          <Text className="font-medium mb-2">Thông tin liên hệ</Text>
          <View>
            <Text className="text-sm font-medium">Tên liên hệ</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
              placeholder="Trần Thị Cẩm Hoa"
            />
          </View>
          <View>
            <Text className="text-sm font-medium">Email</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
              placeholder="Email"
            />
          </View>
          <View>
            <Text className="text-sm font-medium">Số điện thoại</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
              placeholder="Nhập số điện thoại"
            />
          </View>
        </View>

        <View className="bg-white p-4 rounded-2xl mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-semibold text-base">Tiêu đề & Mô tả</Text>
            <TouchableOpacity className="flex-row items-center bg-purple-100 px-3 py-2 rounded-2xl">
              <Ionicons name="sparkles-outline" size={16} color="#7c3aed" />
              <Text className="text-sm font-medium text-purple-700 ml-1">Tạo với AI</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-medium mb-1">Tiêu đề</Text>
          <TextInput
            className="border border-gray-300 bg-white text-sm rounded-xl p-3 mb-1"
            placeholder="Mô tả ngắn gọn về loại hình bất động sản, diện tích, địa chỉ..."
            multiline
          />
          <Text className="text-gray-400 text-xs mb-4">Tối thiểu 30 ký tự, tối đa 99 ký tự</Text>

          <Text className="text-sm font-medium mb-1">Mô tả</Text>
          <TextInput
            className="border border-gray-300 bg-white text-sm rounded-xl p-3"
            placeholder={`Mô tả chi tiết về:\n• loại hình bất động sản\n• vị trí\n• diện tích, tiện ích\n• tình trạng nội thất\n\n(VD: Khu nhà có vị trí thuận lợi, gần công viên, trường học...)`}
            multiline
            numberOfLines={5}
          />
          <Text className="text-gray-400 text-xs mt-2">Tối thiểu 30 ký tự, tối đa 3000 ký tự</Text>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={() => handleContinue()} className="bg-red-600 py-3 rounded-full items-center mx-10 my-5">
        <Text className="text-white font-semibold text-base">Tiếp tục</Text>
      </TouchableOpacity>

      {/* Modal cho bản đồ */}
      <Modal
        visible={showMapModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, padding: 20 }}>
            <Text className="font-medium mb-2 text-lg">Nhập và chọn địa chỉ</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mb-2"
              placeholder="Nhập địa chỉ (VD: 23 Lê Văn Hiến, Đà Nẵng)"
              value={inputAddress}
              onChangeText={handleAddressInput}
            />
            {addressSuggestions.length > 0 && (
              <FlatList
                data={addressSuggestions}
                keyExtractor={(item, index) => `${item.place_id || index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="p-2 border-b border-gray-200"
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <Text>{item.display_name}</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 150, marginBottom: 10 }}
              />
            )}
            <MapView
              style={{ width: '100%', height: 300, marginBottom: 10 }}
              region={region} // Center the map on the selected region
              onPress={handleMapPress}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  title="Vị trí đã chọn"
                />
              )}
            </MapView>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="bg-gray-300 py-2 px-4 rounded-full"
                onPress={() => {
                  setShowMapModal(false);
                  setInputAddress(''); // Reset địa chỉ nhập
                  setAddressSuggestions([]); // Reset gợi ý
                  setSelectedLocation(null); // Reset vị trí
                }}
              >
                <Text className="text-white font-semibold">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-600 py-2 px-4 rounded-full"
                onPress={() => {
                  setAddress(inputAddress); // Lưu địa chỉ vào state chính
                  setShowMapModal(false);
                }}
              >
                <Text className="text-white font-semibold">Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}