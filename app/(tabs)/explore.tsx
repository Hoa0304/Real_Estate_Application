import { StyleSheet, Image, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Index from "../explore/index";

export default function TabTwoScreen() {
  return (
    <SafeAreaView className='flex-1 bg-gray-100'>
      <Index />
    </SafeAreaView>
  )
}
