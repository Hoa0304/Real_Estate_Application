import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChatDetail from '../chatbot/chatDetail';

const chatbot = () => {
  return (
    <SafeAreaView className="flex-1 -mt-12 mb-8 bg-white">
      <ChatDetail />
    </SafeAreaView>

  );
};

export default chatbot;
