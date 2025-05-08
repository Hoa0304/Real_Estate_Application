import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useAuth } from "@clerk/clerk-expo";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

type Message = {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
};

export default function ChatDetail() {
  const { user } = useLocalSearchParams<{ user: string }>();
  const userObj = user ? JSON.parse(user) : null;
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const { userId, isLoaded } = useAuth();

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const q = query(
      collection(db, `user/${userId}/chats`),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesList: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          fromMe: data.fromMe,
          text: data.text,
          time: data.time?.toDate?.().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }) ?? "",
        });
      });
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [userId, isLoaded]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || loading || !userId || !isLoaded) return;

    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      fromMe: true,
      text: inputText,
      time: formattedTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setLoading(true);

    try {
      await addDoc(collection(db, `user/${userId}/chats`), {
        fromMe: true,
        text: currentInput,
        time: currentTime,
        createdAt: currentTime,
      });

      const replyText = await getAIResponse(currentInput);
      const botTime = new Date();

      await addDoc(collection(db, `user/${userId}/chats`), {
        fromMe: false,
        text: replyText,
        time: botTime,
        createdAt: botTime,
      });
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
      const response = await axios.post("http://192.168.1.174:8000/chat", body, { timeout: 15000 });
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
              <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <Ionicons name="arrow-back" size={20} color="black" />
              </TouchableOpacity>
              <Text className="text-base font-semibold flex-1">
                {userObj?.name || "AI Bot"}
              </Text>
            </View>

            <ScrollView
              ref={scrollRef}
              className="px-4 py-2 flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
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
