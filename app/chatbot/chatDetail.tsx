import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

type Message = {
  id: number;
  fromMe: boolean;
  text: string;
  time: string;
};

export default function ChatDetail() {
  const { user } = useLocalSearchParams<{ user: string }>();
  const userObj = user ? JSON.parse(user) : null;
  const scrollRef = useRef<ScrollView>(null);

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const userMessage: Message = {
      id: Date.now(),
      fromMe: true,
      text: inputText,
      time: formattedTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");

    setLoading(true);
    try {
      const replyText = await getAIResponse(currentInput);

      const botTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const botMessage: Message = {
        id: Date.now() + 1,
        fromMe: false,
        text: replyText,
        time: botTime,
      };

      setMessages((prev) => [...prev, botMessage]);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.log("Lỗi:", error?.response?.data || error.message);
      Alert.alert("Lỗi", "Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  const getAIResponse = async (userInput: string): Promise<string> => {
    const body = {
      messages: [{ role: "user", content: userInput }],
    };

    try {
      const response = await axios.post("http://192.168.1.162:3001/chat", body);
      return response.data.content;
    } catch (error: any) {
      console.error("Lỗi gọi Flask:", error?.response?.data || error.message);
      throw error;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
              <Image
                source={{ uri: userObj?.avatar }}
                className="w-10 h-10 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="text-base font-semibold">
                  {userObj?.name || "AI Bot"}
                </Text>
                <Text className="text-xs text-green-500">Online</Text>
              </View>
              <Ionicons name="call-outline" size={24} color="gray" className="mr-4" />
              <Ionicons name="videocam-outline" size={24} color="gray" />
            </View>

            <ScrollView
              ref={scrollRef}
              className="px-4 py-2 flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  className={`mb-4 ${msg.fromMe ? "items-end" : "items-start"}`}
                >
                  <View
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.fromMe ? "bg-indigo-500" : "bg-gray-100"
                    }`}
                  >
                    <Text className={msg.fromMe ? "text-white" : "text-black"}>
                      {msg.text}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-400 mt-1">{msg.time}</Text>
                </View>
              ))}
              {loading && (
                <View className="items-start mb-4">
                  <View className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[80%]">
                    <Text className="text-black">Đang nhập...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View className="flex-row items-center px-4 py-3 border-t border-gray-200 bg-white">
              <TextInput
                placeholderTextColor="#666666"
                placeholder="Nhập tin nhắn..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-3 mr-3 text-base"
                value={inputText}
                onChangeText={setInputText}
                style={{
                  flex: 1,
                  fontSize: 16,
                  lineHeight: 20,
                }}
              />
              <TouchableOpacity onPress={handleSend} disabled={loading}>
                <Ionicons
                  name="send"
                  size={24}
                  color={loading ? "#ccc" : "#6366F1"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
