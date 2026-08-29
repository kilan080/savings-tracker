import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useSavings } from "../../context/SavingsContext";

export default function AddScreen() {
  const { addEntry } = useSavings();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");

  const handleAdd = () => {
    if (amount.trim() === "") return;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return;

    addEntry(numericAmount, type);
    setAmount("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Entry</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount"
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
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
    width: "100%",
    marginBottom: 12,
  },
  typeToggle: { flexDirection: "row", marginBottom: 12, width: "100%" },
  typeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  typeButtonActive: { backgroundColor: "#2e7d32", borderColor: "#2e7d32" },
  typeText: { color: "#333" },
  typeTextActive: { color: "#fff", fontWeight: "bold" },
});
