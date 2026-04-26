"use client";

import { useMemo } from "react";
import { useExpenseStore } from "@/store/expenseStore";
import { useAuthStore } from "@/store/authStore";
import { useCurrencyStore } from "@/store/currencyStore";
import styles from "./analytics.module.css";

export default function AnalyticsPage() {
  const { expenses } = useExpenseStore();
  const { user } = useAuthStore();
  const { getRate } = useCurrencyStore();
  const displayCurrency = user?.currency || "INR";
  const userId = user?.id;

  // Calculate stats using normalized currency
  const {
    monthlySpend,
    categorySpend,
    totalPaid,
    totalOwedToOthers,
  } = useMemo(() => {
    if (!userId) {
      return {
        monthlySpend: [],
        categorySpend: {},
        totalPaid: 0,
        totalOwedToOthers: 0,
      };
    }

    // 1. Monthly Spend (last 6 months)
    const now = new Date();
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        label: d.toLocaleString('default', { month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear(),
        amount: 0,
      };
    }).reverse(); // chronological order

    const catSpend: Record<string, number> = {};
    let tPaid = 0;
    let tOwed = 0;

    expenses.forEach((expense) => {
      const rate = getRate(expense.currency, displayCurrency);
      const convertedAmount = expense.amount * rate;

      // Check if user is involved (either paid or is part of split)
      const userSplit = expense.splits.find((s) => s.userId === userId);
      
      if (expense.paidBy === userId) {
        tPaid += convertedAmount;
      }
      
      if (userSplit) {
        // Amount user owes for this expense
        const splitConverted = userSplit.amount * rate;
        if (expense.paidBy !== userId) {
          tOwed += splitConverted;
        }

        // Add to category and monthly only what the user actually spent (their split)
        const d = new Date(expense.date);
        
        // Category
        const currentMonth = now.getMonth() === d.getMonth() && now.getFullYear() === d.getFullYear();
        if (currentMonth) {
          if (!catSpend[expense.category]) catSpend[expense.category] = 0;
          catSpend[expense.category] += splitConverted;
        }

        // Monthly
        const monthSlot = last6Months.find(m => m.month === d.getMonth() && m.year === d.getFullYear());
        if (monthSlot) {
          monthSlot.amount += splitConverted;
        }
      }
    });

    return {
      monthlySpend: last6Months,
      categorySpend: catSpend,
      totalPaid: tPaid,
      totalOwedToOthers: tOwed,
    };
  }, [expenses, userId, displayCurrency, getRate]);

  if (!user) return null;

  // Bar Chart properties
  const maxMonthly = Math.max(...monthlySpend.map(m => m.amount), 1);
  const barHeight = 200;
  const barWidth = 40;
  const chartWidth = monthlySpend.length * 70;

  // Doughnut Chart properties
  const totalCatSpend = Object.values(categorySpend).reduce((a, b) => a + b, 0);
  let cumulativePercent = 0;
  
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const catColors = {
    Food: "#ff6b6b",
    Travel: "#4ecdc4",
    Utilities: "#45b7d1",
    Entertainment: "#f9ca24",
    Other: "#a55eea",
  };

  const topCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Analytics</h1>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.label}>Total Paid (All Time)</p>
          <p className={styles.value}>{totalPaid.toFixed(2)} {displayCurrency}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.label}>You Owe (All Time)</p>
          <p className={styles.value} style={{ color: "var(--destructive)" }}>
            {totalOwedToOthers.toFixed(2)} {displayCurrency}
          </p>
        </div>
        {topCategory && (
          <div className={styles.summaryCard}>
            <p className={styles.label}>Top Category (This Month)</p>
            <p className={styles.value} style={{ color: catColors[topCategory[0] as keyof typeof catColors] }}>
              {topCategory[0]}
            </p>
          </div>
        )}
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>Monthly Spend (Your Share)</h2>
        <div className={styles.barChartContainer}>
          <svg width={chartWidth} height={barHeight + 40} className={styles.barChart}>
            {monthlySpend.map((month, idx) => {
              const height = (month.amount / maxMonthly) * barHeight;
              const x = idx * 70 + 15;
              const y = barHeight - height;
              return (
                <g key={idx}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    fill="var(--primary)"
                    rx={4}
                    className={styles.bar}
                  />
                  <text x={x + barWidth / 2} y={barHeight + 20} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12">
                    {month.label}
                  </text>
                  {height > 0 && (
                    <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fill="var(--foreground)" fontSize="10">
                      {Math.round(month.amount)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>Category Breakdown (This Month)</h2>
        {totalCatSpend === 0 ? (
          <p className={styles.emptyText}>No spending this month.</p>
        ) : (
          <div className={styles.doughnutContainer}>
            <svg viewBox="-1 -1 2 2" className={styles.doughnutChart}>
              {Object.entries(categorySpend).map(([cat, amount]) => {
                const percent = amount / totalCatSpend;
                const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                cumulativePercent += percent;
                const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                const largeArcFlag = percent > 0.5 ? 1 : 0;
                
                // If it's a full circle (100%), we need to draw two arcs or a circle
                if (percent === 1) {
                   return (
                     <circle key={cat} cx="0" cy="0" r="1" fill="transparent" stroke={catColors[cat as keyof typeof catColors] || "var(--primary)"} strokeWidth="0.4" />
                   )
                }

                const pathData = [
                  `M ${startX} ${startY}`,
                  `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`
                ].join(" ");

                return (
                  <path
                    key={cat}
                    d={pathData}
                    fill="transparent"
                    stroke={catColors[cat as keyof typeof catColors] || "var(--primary)"}
                    strokeWidth="0.4"
                  />
                );
              })}
            </svg>
            <div className={styles.legend}>
              {Object.entries(categorySpend).map(([cat, amount]) => (
                <div key={cat} className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ backgroundColor: catColors[cat as keyof typeof catColors] || "var(--primary)" }}></div>
                  <span>{cat}</span>
                  <span className={styles.legendAmount}>
                    {amount.toFixed(0)} ({Math.round((amount / totalCatSpend) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
