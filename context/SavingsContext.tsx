import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Entry = {
  id: string;
  amount: number;
  date: string;
  type: "deposit" | "withdrawal";
};

type SavingsContextType = {
  entries: Entry[];
  addEntry: (amount: number, type: "deposit" | "withdrawal") => void;
  deleteEntry: (id: string) => void;
};

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

const STORAGE_KEY = "savings_entries";

export function SavingsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
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

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch((error) =>
      console.log("Failed to save entries:", error),
    );
  }, [entries, loaded]);

  const addEntry = (amount: number, type: "deposit" | "withdrawal") => {
    const newEntry: Entry = {
      id: Date.now().toString(),
      amount,
      date: new Date().toLocaleDateString(),
      type,
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <SavingsContext.Provider value={{ entries, addEntry, deleteEntry }}>
      {children}
    </SavingsContext.Provider>
  );
}

export function useSavings() {
  const context = useContext(SavingsContext);
  if (!context)
    throw new Error("useSavings must be used within a SavingsProvider");
  return context;
}
