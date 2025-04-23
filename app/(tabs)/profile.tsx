// import { View, Text, TouchableOpacity, Alert } from 'react-native';
// import React from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useUser, useClerk } from "@clerk/clerk-expo";
// import { useNavigation } from '@react-navigation/native'; // Import navigation hook (nếu bạn sử dụng React Navigation)

// const Profile = () => {
//   const { signOut } = useClerk();
//   const { user } = useUser();

//   const navigation = useNavigation(); // Initialize navigation

//   const handleLogout = async () => {

//     Alert.alert("Thông báo!", "Bạn có chắc chắn muốn đăng xuất không?", [
//       { text: "Hủy", style: "cancel" },
//       { text: "Đăng xuất", onPress: () => signOut() },
//     ]);
//   };
//   const info = {
//     id: user?.id,
//     email: user?.emailAddresses[0]?.emailAddress,
//     fullName: user?.fullName,
//     firstName: user?.firstName,
//     lastName: user?.lastName,

//   }

//   const infoUser = () => {

//     console.log(info);
//   }
//   if (!user) {
//     return (
//       <SafeAreaView>
//         <View>
//           <Text>Bạn chưa đăng nhập!</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView>
//       <View className="border p-4">
//         <Text onPress={() => infoUser()}>id: {info.id}</Text>
//         <Text onPress={() => infoUser()}>email: {info.email}</Text>
//         <Text onPress={() => infoUser()}>họ và tên: {info.fullName}</Text>
//         <Text onPress={() => infoUser()}>{info.firstName}</Text>
//         <Text onPress={() => infoUser()}>{info.lastName}</Text>

//         <TouchableOpacity
//           className="bg-red-500 p-2 rounded-md mt-4"
//           onPress={handleLogout}
//         >
//           <Text className="text-white text-center">Đăng xuất</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default Profile;
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, Entypo, Feather } from '@expo/vector-icons';
import { useUser, useClerk } from '@clerk/clerk-expo';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleLogout = () => {
    Alert.alert('Thông báo', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', onPress: () => signOut() },
    ]);
  };

  const fullName = user?.fullName || 'Người dùng';
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-6 border-b border-gray-200">
        <View className="w-14 h-14 rounded-full bg-gray-200 justify-center items-center mr-4">
          <Text className="text-xl font-bold text-black">{initial}</Text>
        </View>
        <Text className="text-lg font-semibold">{fullName}</Text>
      </View>

      <ScrollView className="px-4 py-2">
        <Text className="text-sm font-semibold text-gray-700 mb-2 mt-3">Hướng dẫn</Text>
        <Item icon={<Ionicons name="help-circle-outline" size={20} />} label="Câu hỏi thường gặp" />
        <Item icon={<MaterialIcons name="feedback" size={20} />} label="Góp ý báo lỗi" />
        <Item icon={<Entypo name="users" size={20} />} label="Về chúng tôi" />

        <Text className="text-sm font-semibold text-gray-700 mb-2 mt-5">Quy định</Text>
        <Item icon={<Ionicons name="document-text-outline" size={20} />} label="Điều khoản thỏa thuận" />
        <Item icon={<Ionicons name="shield-checkmark-outline" size={20} />} label="Chính sách bảo mật" />

        <Text className="text-sm font-semibold text-gray-700 mb-2 mt-5">Quản lý tài khoản</Text>
        <Item icon={<Feather name="user-x" size={20} />} label="Yêu cầu xoá tài khoản" />
        <Item icon={<Ionicons name="log-out-outline" size={20} />} label="Đăng xuất" onPress={handleLogout} />
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white flex-row justify-around py-3">
        <Tab icon="search" label="Tìm kiếm" />
        <Tab icon="heart-outline" label="Tin đã lưu" />
        <Tab icon="person" label="Tài khoản" active />
      </View>
    </SafeAreaView>
  );
}

function Item({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-3"
    >
      <View className="w-6 mr-3">{icon}</View>
      <Text className="text-base text-black">{label}</Text>
    </TouchableOpacity>
  );
}

function Tab({
  icon,
  label,
  active,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <View className="items-center">
      <Ionicons name={icon} size={22} color={active ? 'black' : 'gray'} />
      <Text className={`text-xs mt-1 ${active ? 'text-black' : 'text-gray-500'}`}>{label}</Text>
    </View>
  );
}