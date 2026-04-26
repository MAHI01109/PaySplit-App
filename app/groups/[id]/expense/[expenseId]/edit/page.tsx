"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGroupStore } from "@/store/groupStore";
import { useExpenseStore, SplitType, Split } from "@/store/expenseStore";
import { useAuthStore } from "@/store/authStore";
import { useNominatim, LocationResult } from "@/app/hooks/useNominatim";
import { Button } from "@/app/components/ui/form/Button";
import styles from "../../new/expenseForm.module.css";

const CATEGORIES = ["Food", "Travel", "Utilities", "Entertainment", "Other"];

export default function EditExpensePage({ params }: { params: Promise<{ id: string; expenseId: string }> }) {
  const router = useRouter();
  const { id: groupId, expenseId } = use(params);
  
  const { groups } = useGroupStore();
  const { expenses, updateExpense } = useExpenseStore();
  const { user } = useAuthStore();

  const group = groups.find((g) => g.id === groupId);
  const expense = expenses.find((e) => e.id === expenseId);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "INR">("INR");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<any>("Food");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<SplitType>("EQUAL");
  const [splits, setSplits] = useState<Split[]>([]);
  const [image, setImage] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);

  const { query, setQuery, results, isLoading, recentSearches, addRecentSearch } = useNominatim();

  // Load existing expense data
  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount);
      setCurrency(expense.currency);
      setDate(expense.date);
      setCategory(expense.category);
      setPaidBy(expense.paidBy);
      setSplitType(expense.splitType);
      setSplits(expense.splits);
      setImage(expense.image || "");
      if (expense.location) {
        setSelectedLocation({
          place_id: Math.random(), // Mock place id for existing
          lat: expense.location.lat.toString(),
          lon: expense.location.lon.toString(),
          display_name: expense.location.display_name,
        });
      }
    }
  }, [expense]);

  // Recalculate Equal Split amounts when amount changes
  useEffect(() => {
    if (splitType === "EQUAL" && typeof amount === "number" && group) {
      const splitAmount = amount / group.members.length;
      setSplits((prev) =>
        prev.map((s) => ({ ...s, amount: parseFloat(splitAmount.toFixed(2)) }))
      );
    }
  }, [amount, splitType, group]);

  if (!user || !group || !expense) return <div>Loading...</div>;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSplitChange = (userId: string, field: "amount" | "percentage" | "share", value: number) => {
    setSplits((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof amount !== "number" || amount <= 0 || !description.trim()) return;

    let finalSplits = [...splits];
    if (splitType === "EXACT") {
      const total = finalSplits.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      if (Math.abs(total - amount) > 0.01) {
        alert("Exact amounts must sum up to the total amount.");
        return;
      }
    } else if (splitType === "PERCENTAGE") {
      const totalPercent = finalSplits.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
      if (Math.abs(totalPercent - 100) > 0.01) {
        alert("Percentages must sum up to 100%.");
        return;
      }
      finalSplits = finalSplits.map((s) => ({
        ...s,
        amount: parseFloat(((amount * (s.percentage || 0)) / 100).toFixed(2)),
      }));
    } else if (splitType === "SHARES") {
      const totalShares = finalSplits.reduce((acc, curr) => acc + (curr.share || 0), 0);
      if (totalShares === 0) {
        alert("Total shares must be greater than 0.");
        return;
      }
      finalSplits = finalSplits.map((s) => ({
        ...s,
        amount: parseFloat(((amount * (s.share || 0)) / totalShares).toFixed(2)),
      }));
    }

    const updatedFields = {
      amount,
      currency,
      description,
      date,
      category,
      paidBy,
      splitType,
      splits: finalSplits,
      image,
      location: selectedLocation
        ? {
            lat: parseFloat(selectedLocation.lat),
            lon: parseFloat(selectedLocation.lon),
            display_name: selectedLocation.display_name,
          }
        : undefined,
    };

    updateExpense(expense.id, updatedFields, `Updated description/amount to ${amount}`);
    router.push(`/groups/${groupId}/expense/${expense.id}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit Expense</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <label className={styles.label}>Description</label>
          <input
            type="text"
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.section} style={{ flex: 2 }}>
            <label className={styles.label}>Amount</label>
            <input
              type="number"
              step="0.01"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
            />
          </div>
          <div className={styles.section} style={{ flex: 1 }}>
            <label className={styles.label}>Currency</label>
            <select
              className={styles.select}
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.section} style={{ flex: 1 }}>
            <label className={styles.label}>Date</label>
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className={styles.section} style={{ flex: 1 }}>
            <label className={styles.label}>Category</label>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Paid By</label>
          <select
            className={styles.select}
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            {group.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id === user.id ? "You" : m.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Split Type</label>
          <div className={styles.splitTabs}>
            {(["EQUAL", "EXACT", "PERCENTAGE", "SHARES"] as SplitType[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`${styles.splitTab} ${splitType === type ? styles.activeSplitTab : ""}`}
                onClick={() => setSplitType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.splitDetails}>
          {group.members.map((m) => {
            const split = splits.find((s) => s.userId === m.id);
            if (!split) return null;

            return (
              <div key={m.id} className={styles.splitRow}>
                <span className={styles.splitName}>{m.id === user.id ? "You" : m.name}</span>
                {splitType === "EQUAL" && (
                  <span className={styles.splitValue}>{split.amount.toFixed(2)}</span>
                )}
                {splitType === "EXACT" && (
                  <input
                    type="number"
                    step="0.01"
                    className={styles.splitInput}
                    value={split.amount || ""}
                    onChange={(e) => handleSplitChange(m.id, "amount", parseFloat(e.target.value))}
                  />
                )}
                {splitType === "PERCENTAGE" && (
                  <div className={styles.inputWithSuffix}>
                    <input
                      type="number"
                      step="0.1"
                      className={styles.splitInput}
                      value={split.percentage || ""}
                      onChange={(e) => handleSplitChange(m.id, "percentage", parseFloat(e.target.value))}
                    />
                    <span>%</span>
                  </div>
                )}
                {splitType === "SHARES" && (
                  <input
                    type="number"
                    step="1"
                    className={styles.splitInput}
                    value={split.share || ""}
                    onChange={(e) => handleSplitChange(m.id, "share", parseInt(e.target.value))}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Receipt Image (Optional)</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className={styles.input} />
          {image && (
            <div className={styles.imagePreview}>
              <img src={image} alt="Receipt Preview" />
            </div>
          )}
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Location Tag (Optional)</label>
          <input
            type="text"
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location..."
          />
          {selectedLocation && (
            <div className={styles.selectedLocation}>
              Selected: {selectedLocation.display_name}
              <button type="button" onClick={() => setSelectedLocation(null)}>x</button>
            </div>
          )}
          {isLoading && <p className={styles.loadingText}>Searching...</p>}
          {!isLoading && results.length > 0 && (
            <ul className={styles.locationList}>
              {results.map((r) => (
                <li
                  key={r.place_id}
                  onClick={() => {
                    setSelectedLocation(r);
                    addRecentSearch(r);
                    setQuery("");
                  }}
                >
                  {r.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.actions}>
          <Button type="button"  onClick={() => router.back()}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
