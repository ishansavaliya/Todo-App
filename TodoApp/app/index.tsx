import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ToDoType = {
  id: number;
  title: string;
  isDone: boolean;
};

// Define theme colors
const theme = {
  light: {
    background: "#f5f5f5",
    text: "#333",
    card: "#fff",
    primary: "#3599ea",
  },
  dark: {
    background: "#121212",
    text: "#e0e0e0",
    card: "#1e1e1e",
    primary: "#4dabff",
  },
};

export default function Index() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);
  const [todos, setTodos] = useState<ToDoType[]>([]);
  const [todoText, setTodoText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [oldTodos, setOldTodos] = useState<ToDoType[]>([]);

  // Get current theme colors
  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Load theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme-preference");
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        } else {
          setIsDarkMode(systemColorScheme === "dark");
        }
      } catch (error) {
        console.log("Error loading theme preference:", error);
        setIsDarkMode(systemColorScheme === "dark");
      }
    };
    loadThemePreference();
  }, [systemColorScheme]);

  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem(
        "theme-preference",
        newTheme ? "dark" : "light"
      );
    } catch (error) {
      console.log("Error saving theme preference:", error);
    }
  };

  useEffect(() => {
    const getTodos = async () => {
      try {
        const todos = await AsyncStorage.getItem("my-todo");
        if (todos !== null) {
          setTodos(JSON.parse(todos));
          setOldTodos(JSON.parse(todos));
        }
      } catch (error) {
        console.log(error);
      }
    };
    getTodos();
  }, []);

  const addTodo = async () => {
    try {
      const newTodo = {
        id: Math.random(),
        title: todoText,
        isDone: false,
      };

      todos.push(newTodo);
      setTodos(todos);
      setOldTodos(todos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(todos));
      setTodoText("");
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const newTodos = todos.filter((todo) => todo.id !== id);
      await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
      setTodos(newTodos);
      setOldTodos(newTodos);
    } catch (error) {
      console.log(error);
    }
  };
  const handleDone = async (id: number) => {
    try {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          todo.isDone = !todo.isDone;
        }
        return todo;
      });
      await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
      setTodos(newTodos);
      setOldTodos(newTodos);
    } catch (error) {
      console.log(error);
    }
  };

  const onSearch = (query: string) => {
    if (query == "") {
      setTodos(oldTodos);
    } else {
      const filteredTodos = todos.filter((todo) =>
        todo.title.toLowerCase().includes(query.toLowerCase())
      );
      setTodos(filteredTodos);
    }
  };

  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="menu" size={24} color={currentTheme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons
            name={isDarkMode ? "sunny" : "moon"}
            size={24}
            color={currentTheme.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Image
            source={{
              uri: "https://img.icons8.com/fluent/600/microsoft-todo-2019.png",
            }}
            style={{ width: 35, height: 35, borderRadius: 20 }}
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.searchBar, { backgroundColor: currentTheme.card }]}>
        <Ionicons name="search" size={24} color={currentTheme.text} />
        <TextInput
          placeholder="Search"
          placeholderTextColor={currentTheme.text}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          style={[styles.searchInput, { color: currentTheme.text }]}
          clearButtonMode="always"
        />
      </View>

      <FlatList
        data={[...todos].reverse()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ToDoItem
            todo={item}
            deleteTodo={deleteTodo}
            handleDone={handleDone}
            currentTheme={currentTheme}
          />
        )}
      />

      <KeyboardAvoidingView
        style={styles.footer}
        behavior="padding"
        keyboardVerticalOffset={10}
      >
        <TextInput
          placeholder="Add New ToDo"
          placeholderTextColor={currentTheme.text}
          value={todoText}
          onChangeText={(Text) => setTodoText(Text)}
          style={[
            styles.newTodoInput,
            { backgroundColor: currentTheme.card, color: currentTheme.text },
          ]}
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: currentTheme.primary }]}
          onPress={() => addTodo()}
        >
          <Ionicons name="add" size={34} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ToDoItem = ({
  todo,
  deleteTodo,
  handleDone,
  currentTheme,
}: {
  todo: ToDoType;
  deleteTodo: (id: number) => void;
  handleDone: (id: number) => void;
  currentTheme: any;
}) => (
  <View style={[styles.todoContainer, { backgroundColor: currentTheme.card }]}>
    <View style={styles.todoInfoContainer}>
      <Checkbox
        value={todo.isDone}
        color={todo.isDone ? currentTheme.primary : undefined}
        onValueChange={() => handleDone(todo.id)}
        style={{ borderRadius: 4 }}
      />
      <Text
        style={[
          styles.todoText,
          { color: currentTheme.text },
          todo.isDone && { textDecorationLine: "line-through" },
        ]}
      >
        {todo.title}
      </Text>
    </View>
    <TouchableOpacity
      onPress={() => {
        deleteTodo(todo.id);
        alert("ToDo Deleted");
      }}
    >
      <Ionicons name="trash" size={24} color="red" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 8,
    borderRadius: 10,
    gap: 10,
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  todoContainer: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todoInfoContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  todoText: {
    fontSize: 16,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  newTodoInput: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
  },
  addButton: {
    padding: 8,
    borderRadius: 10,
    marginLeft: 20,
  },
});
