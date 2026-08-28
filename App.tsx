import { useState } from "react";
import { StyleSheet, View, Button, TextInput, Text } from "react-native";
export default function App() {
  const [amount, setAmount] = useState("");
  const [entries, setEnteries] = useState<number[]>([]);

  const handleAdd = () => {
    if (amount.trim() === "") return;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return;

    setEnteries([...entries, numericAmount]);
    setAmount("");

    console.log("amount entred:", numericAmount);
  };

  const total = entries.reduce((sum, entry) => sum + entry, 0);
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

      <Button title="Add" onPress={handleAdd} />

      <View>
        {entries.map((entry, index) => (
          <Text key={index} style={styles.entry}>
            ${entry}
          </Text>
        ))}
      </View>
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
    borderRadius: 8,
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
    borderBottomWidth: 3,
    borderBottomColor: "#5022cfff",
  },
});
