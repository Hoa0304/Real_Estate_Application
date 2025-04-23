import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NewMessage from "../chatbot/newMessage";

interface ChatItem {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

export default function ChatList() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  const [chats, setChats] = useState<ChatItem[]>([
    {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://6.soompi.io/wp-content/uploads/image/20240803033559_Lisa.jpg?s=900x600&e=t",
      lastMessage: "Chào bạn, bạn có khỏe không?",
      time: "10:30 AM",
      unreadCount: 0,
    },
    {
      id: 2,
      name: "Nguyễn Văn B",
      avatar: "https://6.soompi.io/wp-content/uploads/image/20240803033559_Lisa.jpg?s=900x600&e=t",
      lastMessage: "Hẹn gặp bạn vào ngày mai nhé!",
      time: "09:15 AM",
      unreadCount: 2,
    },
  ]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSendMessage = (receiver: string, message: string) => {
    const newChat: ChatItem = {
      id: chats.length + 1,
      name: receiver,
      avatar: "https://6.soompi.io/wp-content/uploads/image/20240803033559_Lisa.jpg?s=900x600&e=t",
      lastMessage: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 1,
    };
    setChats([newChat, ...chats]);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      className="flex-row items-center mb-3"
      onPress={() =>
        router.push({
          pathname: "../chatbot/chatDetail",
          params: { user: JSON.stringify(item) },
        })
      }
    >
      <Image
        source={{ uri: item.avatar }}
        className="w-[54px] h-[54px] rounded-full mr-3"
      />
      <View className="flex-1 border-b border-gray-200 pb-3">
        <View className="flex-row justify-between mb-1">
          <Text className="text-base font-semibold">{item.name}</Text>
          <Text className="text-xs text-gray-400">{item.time}</Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="flex-1 text-sm text-gray-500" numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View className="bg-purple-500 px-2 py-[2px] rounded-full ml-2">
              <Text className="text-white text-xs">{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-row items-center mb-3">
        <TextInput
          placeholder="Tìm kiếm tin nhắn..."
          value={searchText}
          onChangeText={setSearchText}
          className="flex-1 bg-gray-100 rounded-xl px-4 py-2"
        />
        <TouchableOpacity
          className="bg-purple-500 p-2 rounded-xl ml-2"
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={15} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-[90%] bg-white rounded-2xl p-4">
            <NewMessage
              onClose={() => setModalVisible(false)}
              onSend={handleSendMessage}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
