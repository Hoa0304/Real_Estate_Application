import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatList from '../chatbot/chatList';

const chatbot = () => {
  return (
    <SafeAreaView className="flex-1 -mt-12 bg-white">
      <ChatList />
    </SafeAreaView>

  );
};

export default chatbot;
