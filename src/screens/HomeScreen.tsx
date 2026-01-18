import React, { useState, useContext, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TaskContext, THEME, API_URL } from '../../App';
import { AntDesign, Ionicons } from '@expo/vector-icons';

// --- Component Abstractions ---

const Header = ({ title, color }: { title: string, color: string }) => (
  <View style={[styles.header, { backgroundColor: color }]}>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState('');
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <View style={styles.searchBarContainer}>
      <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Görevlerde ara..."
        value={query}
        onChangeText={setQuery}
      />
    </View>
  );
};

const Fab = ({ icon, color, action }: { icon: string, color: string, action: () => void }) => (
  <TouchableOpacity style={[styles.fab, { backgroundColor: color }]} onPress={action}>
    <AntDesign name={icon === 'add' ? 'plus' : icon} size={28} color="white" />
  </TouchableOpacity>
);

// --- Task Item Component ---

interface TaskItemProps { task: any; toggleComplete: (id: number, isCompleted: boolean) => void; navigateToDetail: (id: number) => void; }

const TaskItem: React.FC<TaskItemProps> = ({ task, toggleComplete, navigateToDetail }) => (
  <TouchableOpacity 
    style={styles.taskItemContainer} 
    onPress={() => navigateToDetail(task.id)}
  >
    <TouchableOpacity 
      style={styles.checkbox}
      onPress={(e) => { e.stopPropagation(); toggleComplete(task.id, !task.isCompleted); }}
    >
      <Ionicons 
        name={task.isCompleted ? "checkbox" : "square-outline"}
        size={24}
        color={task.isCompleted ? THEME.primary : '#888'}
      />
    </TouchableOpacity>
    <View style={styles.taskDetails}>
      <Text 
        style={[styles.taskTitle, task.isCompleted && styles.completedText]}
        numberOfLines={1}
      >
        {task.title}
      </Text>
    </View>
  </TouchableOpacity>
);

// --- Main Screen ---

const HomeScreen = () => {
  const navigation = useNavigation();
  const { tasks, fetchTasks } = useContext(TaskContext);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Refetch tasks when search query changes or screen focuses
  const refreshTasks = useCallback(async () => {
      setLoading(true);
      await fetchTasks(searchQuery);
      setLoading(false);
  }, [fetchTasks, searchQuery]);

  useEffect(() => {
    refreshTasks();
    const unsubscribe = navigation.addListener('focus', refreshTasks);
    return unsubscribe;
  }, [navigation, refreshTasks]);

  const toggleComplete = async (id: number, newStatus: boolean) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: newStatus }),
      });
      fetchTasks(searchQuery); // Refresh list to reflect changes
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const navigateToDetail = (taskId: number) => {
    // navigate_to_detail
    navigation.navigate('DetailTask', { taskId });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TaskItem 
      task={item} 
      toggleComplete={toggleComplete} 
      navigateToDetail={navigateToDetail} 
    />
  );

  return (
    <View style={styles.container}>
      <Header title="hh To-Do List" color={THEME.primary} />
      
      {/* searchBar */}
      <SearchBar onSearch={handleSearch} />

      {loading ? (
        <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={(
            <Text style={styles.emptyList}>Henüz hiç görev yok. Yeni bir tane ekleyin!</Text>
          )}
        />
      )}

      {/* fab - navigate_to_add_task */}
      <Fab 
        icon="add" 
        color={THEME.primary} 
        action={() => navigation.navigate('AddTask')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Header Styles
  header: {
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  // Search Bar Styles
  searchBarContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: THEME.secondary, 
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
  },
  // Task Item Styles
  taskItemContainer: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 15,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  emptyList: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  // FAB Styles
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default HomeScreen;