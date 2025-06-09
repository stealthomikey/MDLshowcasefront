"use client";

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface LoggedFoodItem {
  id: number;
  user_id: number;
  product_name: string;
  serving_size_g: number;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  logged_at: string;
}

const FoodLogHistoryPage: React.FC = () => {
  const [loggedFoods, setLoggedFoods] = useState<LoggedFoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const API_BASE_URL = 'http://localhost:8000';
  const DAILY_CALORIE_GOAL = 2000;

  const fetchFoodHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/food-logs/history`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: LoggedFoodItem[] = await response.json();
      setLoggedFoods(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while fetching food history.');
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodHistory();
  }, []);

  const handleDeleteFood = async (itemId: number) => {
    setDeleteLoading(itemId);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/food-logs/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to delete food: HTTP status ${response.status}`);
      }

      setLoggedFoods(prevFoods => prevFoods.filter(item => item.id !== itemId));

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during deletion.');
      console.error('Delete food error:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const loggedFoodsToday = loggedFoods.filter(item => item.logged_at.startsWith(today));

  const totalCaloriesToday = loggedFoodsToday.reduce((sum, item) => sum + item.calories, 0);
  const totalProteinsToday = loggedFoodsToday.reduce((sum, item) => sum + item.proteins, 0);
  const totalCarbohydratesToday = loggedFoodsToday.reduce((sum, item) => sum + item.carbohydrates, 0);
  const totalFatsToday = loggedFoodsToday.reduce((sum, item) => sum + item.fats, 0);

  const macroNutrientData = [
    { name: 'Proteins', value: totalProteinsToday },
    { name: 'Carbohydrates', value: totalCarbohydratesToday },
    { name: 'Fats', value: totalFatsToday },
  ].filter(macro => macro.value > 0);

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const remainingCalories = Math.max(0, DAILY_CALORIE_GOAL - totalCaloriesToday);
  const calorieBarData = [
    {
      name: 'Daily Calories',
      consumed: totalCaloriesToday,
      remaining: remainingCalories,
      goal: DAILY_CALORIE_GOAL,
    },
  ];

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Your Food Log History</h1>

      {loading && <p style={styles.message}>Loading food history...</p>}
      {error && <p style={styles.errorMessage}>Error: {error}</p>}
      {!loading && !error && loggedFoods.length === 0 && (
        <p style={styles.message}>No food items logged yet. Search and log some food!</p>
      )}

      {!loading && !error && loggedFoods.length > 0 && (
        <div style={styles.chartsContainer}>
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>Macronutrient Breakdown (Today)</h2>
            <p style={styles.chartSubtitle}>Based on Proteins, Carbs, and Fats</p>
            {macroNutrientData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={macroNutrientData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''}
                    >
                      {macroNutrientData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(2)} g`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
            ) : (
                <p style={styles.message}>No macronutrient data available for today to display chart.</p>
            )}
             <div style={styles.nutritionSummary}>
              <p>Total Calories Today: <strong>{totalCaloriesToday.toFixed(2)} kcal</strong></p>
              <p>Total Proteins Today: <strong>{totalProteinsToday.toFixed(2)} g</strong></p>
              <p>Total Carbs Today: <strong>{totalCarbohydratesToday.toFixed(2)} g</strong></p>
              <p>Total Fats Today: <strong>{totalFatsToday.toFixed(2)} g</strong></p>
            </div>
          </div>

          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>Daily Calorie Goal</h2>
            <p style={styles.chartSubtitle}>Goal: {DAILY_CALORIE_GOAL} kcal</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={calorieBarData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                stackOffset="none"
              >
                <XAxis type="number" hide domain={[0, Math.max(DAILY_CALORIE_GOAL, totalCaloriesToday) * 1.05]}/>
                <YAxis type="category" dataKey="name" hide />
                <Tooltip formatter={(value: number, name: string, props: any) => {
                    if (name === 'consumed') return [`${value.toFixed(2)} kcal (Consumed)`, 'Consumed'];
                    if (name === 'remaining') return [`${value.toFixed(2)} kcal (Remaining)`, 'Remaining'];
                    return [value, name];
                }} />
                <Legend />
                <Bar
                  dataKey="consumed"
                  fill={totalCaloriesToday > DAILY_CALORIE_GOAL ? '#dc3545' : '#28a745'}
                  isAnimationActive={false}
                  stackId="calories"
                  barSize={40}
                />
                {totalCaloriesToday < DAILY_CALORIE_GOAL && (
                    <Bar
                      dataKey="remaining"
                      fill="#dddddd"
                      isAnimationActive={false}
                      stackId="calories"
                      barSize={40}
                    />
                )}
              </BarChart>
            </ResponsiveContainer>
            <p style={styles.calorieStatus}>
                {totalCaloriesToday.toFixed(2)} kcal Consumed ({(totalCaloriesToday / DAILY_CALORIE_GOAL * 100).toFixed(1)}% of goal)
                {totalCaloriesToday > DAILY_CALORIE_GOAL && <span style={{ color: '#dc3545', fontWeight: 'bold' }}> - OVER GOAL!</span>}
            </p>
          </div>
        </div>
      )}

      {/* List of ALL Logged Foods (from API) */}
      {!loading && !error && loggedFoods.length > 0 && (
        <div style={styles.foodListContainer}>
          <h2 style={styles.listTitle}>All Logged Food Items</h2>
          <ul style={styles.foodList}>
            {loggedFoods.map((item) => (
              <li key={item.id} style={styles.foodListItem}>
                <div>
                  <strong>{item.product_name}</strong> - {item.serving_size_g}g
                  <br />
                  Calories: {item.calories.toFixed(2)} kcal | Proteins: {item.proteins.toFixed(2)}g | Carbs: {item.carbohydrates.toFixed(2)}g | Fats: {item.fats.toFixed(2)}g
                  <br />
                  <span style={styles.loggedAt}>Logged at: {formatDate(item.logged_at)}</span>
                </div>
                <button
                  onClick={() => handleDeleteFood(item.id)}
                  style={styles.deleteButton}
                  disabled={deleteLoading === item.id}
                >
                  {deleteLoading === item.id ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  message: {
    textAlign: 'center',
    color: '#555',
    padding: '20px',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    padding: '20px',
  },
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '40px',
    borderBottom: '1px solid #eee',
    paddingBottom: '30px',

  },
  chartCard: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  chartTitle: {
    color: '#007bff',
    marginBottom: '5px',
    textAlign: 'center',
  },
  chartSubtitle: {
    color: '#666',
    fontSize: '0.9em',
    marginBottom: '15px',
    textAlign: 'center',
  },
  nutritionSummary: {
    marginTop: '15px',
    textAlign: 'center',
    fontSize: '0.95em',
    color: '#333',
  },
  calorieStatus: {
    marginTop: '10px',
    textAlign: 'center',
    fontSize: '1em',
    color: '#333',
  },
  foodListContainer: {
    marginTop: '30px',
  },
  listTitle: {
    color: '#007bff',
    marginBottom: '20px',
    textAlign: 'center',
  },
  foodList: {
    listStyleType: 'none',
    padding: 0,
  },
  foodListItem: {
    background: '#f0f0f0',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '6px',
    borderLeft: '5px solid #007bff',
    lineHeight: '1.6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loggedAt: {
    fontSize: '0.8em',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'background-color 0.3s ease',
  },
  deleteButtonHover: {
    backgroundColor: '#c82333',
  },
};

export default FoodLogHistoryPage;