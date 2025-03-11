import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'semibold',
    marginBottom: 10,
    marginTop: 30
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
  },
  
  taskText: {
    fontSize: 16,
  },
  priority: {
    color: 'black',
    fontSize: 13,
    fontWeight: 300,
    marginTop: 3,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 10,
    marginTop:10,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#F25F4C',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
