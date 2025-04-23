import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

type Props = {
  onClose: () => void;
  onSend: (receiver: string, content: string) => void;
};

const NewMessage = ({ onClose, onSend }: Props) => {
  const [receiver, setReceiver] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (receiver && message) {
      onSend(receiver, message);
      setReceiver('');
      setMessage('');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold">Tin nhắn mới</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-red-500 font-medium">Thoát</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-1">Email / SĐT</Text>
          <TextInput
            value={receiver}
            onChangeText={setReceiver}
            placeholder="Nhập email hoặc số điện thoại"
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 mb-1">Nội dung</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập tin nhắn"
            multiline
            numberOfLines={4}
            className="border border-gray-300 rounded-xl px-4 py-3 text-base h-28 text-gray-800"
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!receiver || !message}
          className={`py-4 rounded-full items-center ${
            receiver && message ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white font-semibold text-base">Gửi</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default NewMessage;
