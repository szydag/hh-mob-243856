import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import DetailTaskScreen from '../screens/DetailTaskScreen';

// Define types for navigation parameters
export type RootStackParamList = { 
  Home: undefined; 
  AddTask: undefined; 
  DetailTask: { taskId: number; }; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* All screens hidden header because custom Headers are used */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddTask" 
          component={AddTaskScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="DetailTask" 
          component={DetailTaskScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}