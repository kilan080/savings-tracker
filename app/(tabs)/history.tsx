import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useSavings } from "../../context/SavingsContext";

export default function HistoryScreen() {
  const { entries, deleteEntry } = useSavings();
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount">(
    "newest",
  );

  const total = entries.reduce((sum, entry) => {
    return entry.type === "deposit" ? sum + entry.amount : sum - entry.amount;
  }, 0);

  // Build cumulative balance over time, in chronological order
  const chronological = [...entries].sort(
    (a, b) => Number(a.id) - Number(b.id),
  );
  let runningBalannce = 0;

  const chartData = chronological.map((entry) => {
    runningBalannce =
      entry.type === "deposit"
        ? runningBalannce + entry.amount
        : runningBalannce - entry.amount;

    return runningBalannce;
  });

  const displayedEntries = entries
    .filter((entry) => filter === "all" || entry.type === filter)
    .sort((a, b) => {
      if (sortBy === "newest") return Number(b.id) - Number(a.id);
      if (sortBy === "oldest") return Number(a.id) - Number(b.id);
      return b.amount - a.amount;
    });

  return (
    <View style={styles.container}>
      <Text style={styles.total}>₦{total.toLocaleString()}</Text>

      {chartData.length > 1 && (
        <LineChart
          data={{
            labels: chartData.map((_, i) => (i + 1).toString()),
            datasets: [{ data: chartData }],
          }}
          width={Dimensions.get("window").width - 30}
          height={180}
          yAxisLabel="₦"
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={{ marginBottom: 20, borderRadius: 16 }}
        />
      )}

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
              style={filter === f ? styles.filterTextActive : styles.filterText}
            >
              {f === "all"
                ? "All"
                : f === "deposit"
                  ? "Deposits"
                  : "Withdrawals"}
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
            <Text
              style={sortBy === s ? styles.filterTextActive : styles.filterText}
            >
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
        style={styles.list}
        data={displayedEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => deleteEntry(item.id)}>
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
    padding: 20,
    paddingTop: 60,
  },
  total: {
    fontSize: 32,
    fontWeight: "600",
    color: "#2e7d32",
    marginBottom: 20,
  },
  filterRow: { flexDirection: "row", marginBottom: 8, width: "100%" },
  filterButton: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  filterButtonActive: { backgroundColor: "#333", borderColor: "#333" },
  filterText: { fontSize: 12, color: "#333" },
  filterTextActive: { fontSize: 12, color: "#fff", fontWeight: "bold" },
  list: { marginTop: 12, width: "100%" },
  entry: {
    fontSize: 18,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    textAlign: "center",
  },
  withdrawalText: { color: "#c62828" },
  date: { fontSize: 12, color: "#888", marginBottom: 8, textAlign: "right" },
});
