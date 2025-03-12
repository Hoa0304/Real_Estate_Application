import React from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find your dream house</Text>
      
      <View style={styles.infoContainer}>
        <View style={styles.textAndImage}>
          <View style={styles.textContainer}>
            <Text style={styles.infoText}>New Properties!</Text>
            <Text style={styles.infoText}>house and land packages</Text>
          </View>

          <Image
            source={ require('../assets/images/house.png') }
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Province"
        />

        <Button title="Search" onPress={() => {}} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f4f4f4',
  },
  textAndImage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  textContainer: {
    flexDirection: 'column',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
    width: '100%',
  },
});

export default App;
