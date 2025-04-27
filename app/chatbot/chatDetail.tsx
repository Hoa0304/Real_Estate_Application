import React, { useRef, useState } from "react";
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
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatDetail() {
  const { user } = useLocalSearchParams<{ user: string }>();
  const userObj = user ? JSON.parse(user) : null;
  const scrollRef = useRef<ScrollView>(null);

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, fromMe: false, text: "Hi, Jimmy! Any update today?", time: "09:32 PM" },
    { id: 2, fromMe: true, text: "All good! we have some update", time: "09:34 PM" },
    {
      id: 3,
      fromMe: true,
      text: "I have updated the design for the “How it work” section. Please check it out.",
      time: "09:34 PM",
    },
    {
      id: 4,
      fromMe: false,
      text: "Cool! I have some feedbacks on the “How it work” section. but overall looks good now!",
      time: "10:15 PM",
    },
    { id: 5, fromMe: true, text: "Perfect! Will check it", time: "09:34 PM" },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), fromMe: true, text: inputText, time: formattedTime },
    ]);
    setInputText("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
  <SafeAreaView className="flex-1 bg-gray-100">
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
            <Image
              source={{ uri: userObj?.avatar }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold">{userObj?.name}</Text>
              <Text className="text-xs text-green-500">Online</Text>
            </View>
            <Ionicons name="call-outline" size={24} color="gray" className="mr-4" />
            <Ionicons name="videocam-outline" size={24} color="gray" />
          </View>

          <ScrollView
            ref={scrollRef}
            className="px-4 py-2"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <View key={msg.id} className={`mb-4 ${msg.fromMe ? "items-end" : "items-start"}`}>
                <View
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.fromMe ? "bg-indigo-500" : "bg-gray-100"
                  }`}
                >
                  <Text className={msg.fromMe ? "text-white" : "text-black"}>{msg.text}</Text>
                </View>
                <Text className="text-xs text-gray-400 mt-1">{msg.time}</Text>
              </View>
            ))}
          </ScrollView>

          <View className="flex-row items-center px-4 py-2 border-t border-gray-200 bg-white">
            <TextInput
              placeholderTextColor="#666666"
              placeholder="Nhập tin nhắn..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2 text-sm"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity onPress={handleSend}>
              <Ionicons name="send" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}
