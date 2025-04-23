import { View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatList from '../chatbot/chatList';
import ChatDetail from '../chatbot/chatDetail';

const chatbot = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ChatList />
    </SafeAreaView>

  );
};

export default chatbot;