import React, { useState, useEffect, createContext } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';

// --- Global Configuration ---

export const THEME = {
  danger: "#DC2626",
  primary: "#2563EB",
  secondary: "#EFF6FF"
};
// IMPORTANT: Replace 'localhost' with your actual local network IP or '10.0.2.2' for Android Emulator.
export const API_URL = 'http://localhost:3000/api/tasks'; 

// --- Context for State Management ---

interface Task { id: number; title: string; description: string | null; isCompleted: boolean; createdAt: string; updated_at: string; }
interface TaskContextType { tasks: Task[]; fetchTasks: (searchQuery?: string) => Promise<void>; }

const defaultContext: TaskContextType = { 
  tasks: [], 
  fetchTasks: async () => {}
};

export const TaskContext = createContext<TaskContextType>(defaultContext);

const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async (searchQuery = '') => {
    try {
      const url = `${API_URL}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
      return data;
    } catch (error) {
      console.error('API Connection Error:', error);
      Alert.alert('Hata', 'Sunucuya bağlanılamadı. API çalışıyor mu? (http://localhost:3000)');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, fetchTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <TaskProvider>
        {/* Using primary color for status bar background */}
        <StatusBar style="light" backgroundColor={THEME.primary} />
        <AppNavigator />
      </TaskProvider>
    </SafeAreaProvider>
  );
}
