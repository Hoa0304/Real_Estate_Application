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
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import debounce from 'lodash/debounce';
import DropDownPicker from 'react-native-dropdown-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { db } from '../../firebaseConfig';

export default function EditScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [showMapModal, setShowMapModal] = useState(false);
  const [region, setRegion] = useState({
    latitude: 14.0583,
    longitude: 108.2772,
    latitudeDelta: 10.0,
    longitudeDelta: 10.0,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [inputAddress, setInputAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [propertyType, setPropertyType] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [floors, setFloors] = useState(0);
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Nhà phố', value: 'townhouse' },
    { label: 'Căn hộ', value: 'apartment' },
    { label: 'Biệt thự', value: 'villa' },
  ]);

  useEffect(() => {
    const fetchPostData = async () => {
      if (!id || !isSignedIn || !user) return;
      try {
        const docRef = doc(db, 'real_estate_posts', id.toString());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAddress(data.location || '');
          setPropertyType(data.category || '');
          setArea(data.area || '');
          setPrice(data.price || '');
          setBedrooms(data.bedrooms || 0);
          setBathrooms(data.bathrooms || 0);
          setFloors(data.floors || 0);
          setContactName(data.contact?.name || '');
          setEmail(data.contact?.email || '');
          setPhone(data.contact?.phone || '');
          setTitle(data.title || '');
          setDescription(data.description || '');
          setImages(data.images || []);
        } else {
          Alert.alert('Lỗi', 'Không tìm thấy bài đăng.');
          router.back();
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu bài đăng:', error);
        Alert.alert('Lỗi', 'Không thể tải dữ liệu bài đăng.');
      }
    };
    fetchPostData();
  }, [id, isSignedIn, user]);

  const uploadImage = async (uri) => {
    const data = new FormData();
    data.append('file', { uri, type: 'image/jpeg', name: 'image.jpg' });
    data.append('upload_preset', 'housing');
    data.append('cloud_name', 'dftomqzrj');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dftomqzrj/image/upload', {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const result = await response.json();
      if (response.ok) {
        console.log('Upload thành công, URL:', result.secure_url);
        return result.secure_url;
      } else {
        console.error('Lỗi từ Cloudinary:', result);
        Alert.alert('Lỗi', `Không thể upload ảnh: ${result.error?.message || 'Lỗi không xác định'}`);
        return null;
      }
    } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
      Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng kiểm tra kết nối internet.');
      return null;
    }
  };

  const pickMultipleImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const remainingSlots = 10 - images.length;
      if (result.assets.length > remainingSlots) {
        Alert.alert('Giới hạn', `Bạn chỉ có thể chọn thêm ${remainingSlots} ảnh nữa (tối đa 10 ảnh).`);
        return;
      }

      const newImageUris = result.assets.map(asset => asset.uri);
      const uploadPromises = newImageUris.map(uri => uploadImage(uri));
      const uploadedUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
      if (uploadedUrls.length > 0) {
        setImages(prevImages => [...prevImages, ...uploadedUrls].slice(0, 10));
      } else {
        Alert.alert('Lỗi', 'Không có ảnh nào được upload thành công.');
      }
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const fetchAddressSuggestions = async (query) => {
    const apiKey = 'pk.1f712969e89f02344e338bfa6ed76ff7';
    const url = `https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&countrycodes=vn&accept-language=vi`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setAddressSuggestions(data);
      } else {
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy gợi ý địa chỉ:', error);
      setAddressSuggestions([]);
    }
  };

  const debouncedFetchAddressSuggestions = useCallback(
    debounce((query) => fetchAddressSuggestions(query), 500),
    []
  );

  const geocodeAddress = async (selectedAddress) => {
    const apiKey = 'pk.1f712969e89f02344e338bfa6ed76ff7';
    const addressToGeocode = selectedAddress.display_name || inputAddress;
    const url = `https://api.locationiq.com/v1/geocode?key=${apiKey}&q=${encodeURIComponent(addressToGeocode)}&format=json&countrycodes=vn&accept-language=vi`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0];
        setSelectedLocation({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
        setRegion({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setInputAddress(data[0].display_name);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy địa chỉ.');
      }
    } catch (error) {
      console.error('Lỗi khi chuyển địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể tìm địa chỉ.');
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    const apiKey = 'pk.1f712969e89f02344e338bfa6ed76ff7';
    const url = `https://api.locationiq.com/v1/reverse?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json&accept-language=vi`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.display_name) {
        setInputAddress(data.display_name);
        setAddress(data.display_name);
      } else {
        setInputAddress('Không tìm thấy địa chỉ');
        Alert.alert('Thông báo', 'Không tìm thấy địa chỉ.');
      }
    } catch (error) {
      console.error('Lỗi khi lấy địa chỉ:', error);
      setInputAddress('Lỗi khi lấy địa chỉ');
      Alert.alert('Lỗi', 'Không thể lấy địa chỉ.');
    }
  };

  const handleAddressInput = (text) => {
    setInputAddress(text);
    if (text.trim().length > 2) {
      debouncedFetchAddressSuggestions(text);
    } else {
      setAddressSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setInputAddress(suggestion.display_name);
    setAddressSuggestions([]);
    try {
      const { lat, lon } = suggestion;
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      setSelectedLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Lỗi khi chọn gợi ý:', error);
      Alert.alert('Lỗi', 'Không thể chọn địa chỉ.');
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    fetchAddress(latitude, longitude);
  };

  const handleSave = async () => {
    if (!isSignedIn || !user || !id) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để chỉnh sửa bài.');
      return;
    }

    const updatedData = {
      area,
      bathrooms,
      bedrooms,
      category: propertyType,
      contact: {
        email,
        name: contactName,
        phone,
      },
      description,
      floors,
      location: address,
      price,
      title,
      userId: user.id,
      updatedAt: new Date().toISOString(),
      images,
    };

    try {
      const docRef = doc(db, 'real_estate_posts', id.toString());
      await updateDoc(docRef, updatedData);
      console.log('Dữ liệu đã được cập nhật:', updatedData);
      Alert.alert('Thành công', 'Bài đăng đã được cập nhật!');
      router.back();
    } catch (error) {
      console.error('Lỗi khi cập nhật bài đăng:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật bài đăng. Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-2 flex-row items-center justify-between px-4">
        <Text className="text-xl font-bold">Chỉnh sửa tin đăng</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-[14px] font-medium text-gray-500 border rounded-3xl p-2 px-2">Thoát</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          className="flex-1 bg-gray-100 p-4"
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            className="bg-white p-4 rounded-2xl mb-4"
            onPress={() => setShowMapModal(true)}
          >
            <Text className="font-medium mb-1">Địa chỉ BĐS</Text>
            <TextInput
              multiline={true}
              keyboardType="default"
              textBreakStrategy="simple"
              className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
              placeholder="Chọn địa chỉ trên bản đồ"
              value={address}
              editable={false}
            />
          </TouchableOpacity>

          <View className="bg-white p-4 rounded-2xl mb-4">
            <Text className="font-medium mb-2">Hình ảnh (Tối đa 10 ảnh)</Text>
            <TouchableOpacity
              className="bg-gray-200 p-2 rounded-lg mb-2"
              onPress={pickMultipleImages}
            >
              <Text className="text-center">Chọn nhiều ảnh</Text>
            </TouchableOpacity>
            <FlatList
              data={images}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item, index }) => (
                <View className="relative">
                  <Image
                    source={{ uri: item }}
                    style={{ width: 100, height: 100, marginRight: 10 }}
                  />
                  <TouchableOpacity
                    className="absolute top-1 right-11 bg-red-500 rounded-full p-1"
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          <View className="bg-white p-4 rounded-2xl mb-4">
            <Text className="font-medium mb-2">Thông tin chính</Text>
            <View className="bg-white rounded-2xl">
              <Text className="font-medium mb-2">Loại BĐS</Text>
              <DropDownPicker
                open={open}
                value={propertyType}
                items={items}
                setOpen={setOpen}
                setValue={setPropertyType}
                setItems={setItems}
                placeholder="Chọn loại bất động sản"
                style={{ borderColor: '#ccc', borderRadius: 16, backgroundColor: '#f3f4f6' }}
                dropDownContainerStyle={{ borderColor: '#ccc', borderRadius: 16, backgroundColor: '#fff', padding: 0 }}
                textStyle={{ fontSize: 14 }}
              />
            </View>
            <View>
              <Text className="text-sm font-medium">Diện Tích m²</Text>
              <TextInput
                multiline={true}
                keyboardType="default"
                textBreakStrategy="simple"
                className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                placeholder="Nhập diện tích"
                value={area}
                onChangeText={setArea}
              />
            </View>
            <View className="flex-row justify-between items-center">
              <View className="w-[100%]">
                <Text className="text-sm font-medium">Mức giá</Text>
                <TextInput
                  multiline={true}
                  keyboardType="default"
                  textBreakStrategy="simple"
                  className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                  placeholder="Nhập mức giá"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>
          </View>

          <View className="bg-white p-4 rounded-2xl mb-4">
            {[
              { label: 'Số phòng ngủ', value: bedrooms, setValue: setBedrooms },
              { label: 'Số phòng tắm, vệ sinh', value: bathrooms, setValue: setBathrooms },
              { label: 'Số tầng', value: floors, setValue: setFloors },
            ].map(({ label, value, setValue }, i) => (
              <View key={i} className="flex-row justify-between items-center mt-4">
                <Text className="text-sm font-medium">{label}</Text>
                <View className="flex-row items-center space-x-3">
                  <Pressable
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                    onPress={() => setValue(Math.max(0, value - 1))}
                  >
                    <Text className="text-xl font-semibold">-</Text>
                  </Pressable>
                  <Text className="text-base mx-2">{value}</Text>
                  <Pressable
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                    onPress={() => setValue(value + 1)}
                  >
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
                multiline={true}
                keyboardType="default"
                textBreakStrategy="simple"
                className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                placeholder="Tên liên hệ"
                value={contactName}
                onChangeText={setContactName}
              />
            </View>
            <View>
              <Text className="text-sm font-medium">Email</Text>
              <TextInput
                className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <View>
              <Text className="text-sm font-medium">Số điện thoại</Text>
              <TextInput
                className="border border-gray-300 bg-gray-200 rounded-3xl px-4 py-2 mt-1 mb-3"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View className="bg-white p-4 rounded-2xl mb-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-semibold text-base">Tiêu đề & Mô tả</Text>
            </View>
            <Text className="text-sm font-medium mb-1">Tiêu đề</Text>
            <TextInput
              className="border border-gray-300 bg-white text-sm rounded-xl p-3 mb-1"
              placeholder="Mô tả ngắn gọn về loại hình bất động sản, diện tích, địa chỉ..."
              multiline
              value={title}
              onChangeText={setTitle}
            />
            <Text className="text-gray-400 text-xs mb-4">Tối thiểu 30 ký tự, tối đa 99 ký tự</Text>
            <Text className="text-sm font-medium mb-1">Mô tả</Text>
            <TextInput
              className="border border-gray-300 bg-white text-sm rounded-xl p-3"
              placeholder={`Mô tả chi tiết về:\n• loại hình bất động sản\n• vị trí\n• diện tích, tiện ích\n• tình trạng nội thất\n\n(VD: Khu nhà có vị trí thuận lợi, gần công viên, trường học...)`}
              multiline
              numberOfLines={5}
              value={description}
              onChangeText={setDescription}
            />
            <Text className="text-gray-400 text-xs mt-2">Tối thiểu 30 ký tự, tối đa 3000 ký tự</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <TouchableOpacity onPress={handleSave} className="bg-red-600 py-3 rounded-full items-center mx-10 my-5">
        <Text className="text-white font-semibold text-base">Lưu thay đổi</Text>
      </TouchableOpacity>

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
                    className="p-2 border-b"
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
              region={region}
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
                  setInputAddress('');
                  setAddressSuggestions([]);
                  setSelectedLocation(null);
                }}
              >
                <Text className="text-white font-semibold">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-600 py-2 px-4 rounded-full"
                onPress={() => {
                  setAddress(inputAddress);
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