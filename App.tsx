import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Button,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Entry = {
  id: string;
  amount: number;
  date: string;
  type: "deposit" | "withdrawal";
};

const STORAGE_KEY = "savings-entries";

export default function App() {
  const [amount, setAmount] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount">(
    "newest",
  );
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");

  // Load saved entries once, when the app starts
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Check if data matches the new shape; if not, wipe it
          const isValidShape =
            Array.isArray(parsed) &&
            parsed.every(
              (entry) =>
                entry &&
                typeof entry === "object" &&
                "id" in entry &&
                "amount" in entry &&
                "type" in entry,
            );
          if (isValidShape) {
            setEntries(parsed);
          } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setEntries([]);
          }
        }
      } catch (error) {
        console.log("Failed to load entries:", error);
      } finally {
        setLoaded(true);
      }
    };
    loadEntries();
  }, []);

  //Save entries every time they change (but not before initial load finishes)

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch((error) =>
      console.log("Failed to save entries:", error),
    );
  }, [entries, loaded]);

  const handleAdd = () => {
    if (amount.trim() === "") return;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return;

    const newEntry: Entry = {
      id: Date.now().toString(),
      amount: numericAmount,
      date: new Date().toLocaleDateString(),
      type,
    };

    setEntries([...entries, newEntry]);
    setAmount("");
    Keyboard.dismiss();

    console.log("amount entred:", numericAmount);
  };

  const handleDelete = (idToRemove: string) => {
    setEntries(entries.filter((entry) => entry.id !== idToRemove));
  };

  const total = entries.reduce((sum, entry) => {
    return entry.type === "deposit" ? sum + entry.amount : sum - entry.amount;
  }, 0);

  const displayedEntries = entries
    .filter((entry) => filter === "all" || entry.type === filter)
    .sort((a, b) => {
      if (sortBy === "newest") return Number(b.id) - Number(a.id);
      if (sortBy === "oldest") return Number(a.id) - Number(b.id);
      return b.amount - a.amount; //amount, highest first.
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Savings Tracker</Text>

      <Text style={styles.total}>${total.toLocaleString()}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "deposit" && styles.typeButtonActive,
          ]}
          onPress={() => setType("deposit")}
        >
          <Text
            style={type === "deposit" ? styles.typeTextActive : styles.typeText}
          >
            Deposit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "withdrawal" && styles.typeButtonActive,
          ]}
          onPress={() => setType("withdrawal")}
        >
          <Text
            style={
              type === "withdrawal" ? styles.typeTextActive : styles.typeText
            }
          >
            Withdrawal
          </Text>
        </TouchableOpacity>
      </View>

      <Button title="Add" onPress={handleAdd} />

      <View style={styles.filterRow}>
        {(["all", "deposit", "withdrawal"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={filter == f ? styles.filterTextActive : styles.filterText}
            >
              {f === "all" ? "All" : f === "deposit" ? "Deposit" : "Withdrawal"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterRow}>
        {(["newest", "oldest", "amount"] as const).map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.filterButton,
              sortBy === s && styles.filterButtonActive,
            ]}
            onPress={() => setSortBy(s)}
          >
            <Text>
              {s === "newest"
                ? "Newest"
                : s === "oldest"
                  ? "Oldest"
                  : "Highest"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        style={styles.List}
        data={displayedEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text
              style={[
                styles.entry,
                item.type === "withdrawal" && styles.withdrawalText,
              ]}
            >
              {item.type === "withdrawal" ? "-" : "+"}₦
              {item.amount.toLocaleString()} ✕
            </Text>
            <Text style={styles.date}>{item.date}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  total: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 20,
    color: "#2e7d32",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    width: "100%",
    padding: 10,
    marginBottom: 12,
  },
  List: {
    width: "100%",
    marginTop: 20,
  },
  entry: {
    fontSize: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    textAlign: "center",
    borderBottomColor: "#5022cfff",
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    textAlign: "right",
  },
  typeToggle: {
    flexDirection: "row",
    marginBottom: 12,
    width: "100%",
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#2e7d32",
    borderColor: "#2e7d32",
  },
  typeText: {
    color: "#333",
  },
  typeTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  withdrawalText: {
    color: "#c62828",
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 8,
    width: "100%",
  },
  filterButton: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#333",
    borderColor: "#fff",
  },
  filterText: {
    fontSize: 12,
    color: "#333",
  },
  filterTextActive: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
});
