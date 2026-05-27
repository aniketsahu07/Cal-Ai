import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const defaultMeals = [
  { id: 1, name: 'Oatmeal with berries & almond butter', calories: 340, protein: 12, carbs: 52, fat: 10, time: '08:30 AM' },
  { id: 2, name: 'Grilled salmon & quinoa salad bowl', calories: 540, protein: 36, carbs: 48, fat: 18, time: '12:24 PM' }
]

const defaultWeightHistory = [
  { id: 1, date: 'May 25', weight: 72.8 },
  { id: 2, date: 'May 26', weight: 72.6 },
  { id: 3, date: 'May 27', weight: 72.4 }
]

function MacroRing({ label, value, target, color, percent }) {
  const radius = 36;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, percent) / 100) * circumference;

  return (
    <div className="macro-ring-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            stroke="var(--surface-soft)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--ink)' }}>
          {percent}%
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '12px' }}>
        <strong style={{ display: 'block', color: 'var(--ink)', fontSize: '13px' }}>{label}</strong>
        <span style={{ color: 'var(--muted)', fontSize: '10px' }}>{value}g / {target}g</span>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()
  
  const [diary, setDiary] = useState(() => {
    const storedDiary = localStorage.getItem('cal-ai-diary')
    if (storedDiary) {
      return JSON.parse(storedDiary)
    }
    localStorage.setItem('cal-ai-diary', JSON.stringify(defaultMeals))
    return defaultMeals
  })

  const [water, setWater] = useState(() => {
    const storedWater = localStorage.getItem('cal-ai-water')
    return storedWater ? parseFloat(storedWater) : 1.6
  })

  const [weightHistory, setWeightHistory] = useState(() => {
    const storedWeight = localStorage.getItem('cal-ai-weight')
    if (storedWeight) {
      return JSON.parse(storedWeight)
    }
    localStorage.setItem('cal-ai-weight', JSON.stringify(defaultWeightHistory))
    return defaultWeightHistory
  })

  const [newWeight, setNewWeight] = useState('')
  
  const dailyGoal = 1950
  const dailyWaterGoal = 3.0

  // Dynamic calculations
  const totalCalories = diary.reduce((acc, curr) => acc + curr.calories, 0)
  const totalProtein = diary.reduce((acc, curr) => acc + curr.protein, 0)
  const totalCarbs = diary.reduce((acc, curr) => acc + curr.carbs, 0)
  const totalFat = diary.reduce((acc, curr) => acc + curr.fat, 0)

  const caloriePercent = Math.min(100, Math.round((totalCalories / dailyGoal) * 100))
  const remainingCalories = Math.max(0, dailyGoal - totalCalories)

  // Handlers
  const addWater = () => {
    const nextWater = parseFloat((water + 0.25).toFixed(2))
    setWater(nextWater)
    localStorage.setItem('cal-ai-water', nextWater.toString())
  }

  const resetWater = () => {
    setWater(0)
    localStorage.setItem('cal-ai-water', '0')
  }

  const handleAddWeight = (e) => {
    e.preventDefault()
    const weightVal = parseFloat(newWeight)
    if (isNaN(weightVal) || weightVal <= 0) return

    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: weightVal
    }

    const updatedHistory = [...weightHistory, newEntry]
    setWeightHistory(updatedHistory)
    localStorage.setItem('cal-ai-weight', JSON.stringify(updatedHistory))
    setNewWeight('')
  }

  const clearWeight = () => {
    localStorage.setItem('cal-ai-weight', JSON.stringify(defaultWeightHistory))
    setWeightHistory(defaultWeightHistory)
  }

  const clearDiary = () => {
    localStorage.setItem('cal-ai-diary', JSON.stringify([]))
    setDiary([])
  }

  return (
    <section className="page-stack">
      {/* Header Summary */}
      <div className="dashboard-welcome">
        <div>
          <div className="eyebrow">Personal Dashboard</div>
          <h1>Welcome back, {user?.displayName || 'Cal Athlete'}!</h1>
          <p className="quote">"Small daily habits compound into massive lifetime results."</p>
        </div>
        <div className="streak-badge">
          <span className="fire-icon">🔥</span>
          <div>
            <strong>12 Days</strong>
            <span>Streak Active</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Core Calorie Tracking Ring/Card */}
        <div className="card calorie-tracker-card highlight">
          <div className="card-head">
            <div>
              <h3>Calorie Progress</h3>
              <p>Daily budget vs dynamic consumption</p>
            </div>
            <span className="chip">Goal: {dailyGoal} kcal</span>
          </div>

          <div className="circle-progress-container">
            <div className="calorie-summary-details">
              <span className="calories-number">{totalCalories}</span>
              <span className="calories-label">kcal consumed</span>
              <div className="bar progress-bar-main" style={{ width: '100%', height: '6px', marginTop: '10px' }}>
                <span style={{ width: `${caloriePercent}%` }}></span>
              </div>
              <span className="calories-remaining">{remainingCalories} kcal remaining</span>
            </div>
          </div>

          {/* Macro Progress splits */}
          <div className="dashboard-macros" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid var(--stroke)', paddingTop: '18px', justifyItems: 'center' }}>
            <MacroRing
              label="Protein"
              value={totalProtein}
              target={120}
              color="var(--accent)"
              percent={Math.min(100, Math.round((totalProtein / 120) * 100))}
            />
            <MacroRing
              label="Carbs"
              value={totalCarbs}
              target={250}
              color="var(--highlight)"
              percent={Math.min(100, Math.round((totalCarbs / 250) * 100))}
            />
            <MacroRing
              label="Fat"
              value={totalFat}
              target={70}
              color="#a855f7"
              percent={Math.min(100, Math.round((totalFat / 70) * 100))}
            />
          </div>
        </div>

        {/* Side panel: Water and Weight */}
        <div className="stack">
          {/* Hydration Tracker */}
          <div className="card hydration-card">
            <div className="card-head">
              <h3>Water Intake</h3>
              <span className="chip muted">{water} L / {dailyWaterGoal} L</span>
            </div>
            <p>Stay hydrated to support steady metabolism and energy.</p>
            <div className="hydration-meter">
              <div className="bar water-bar">
                <span style={{ width: `${Math.min(100, Math.round((water / dailyWaterGoal) * 100))}%`, backgroundColor: '#4a90e2' }}></span>
              </div>
            </div>
            <div className="cta-row" style={{ marginTop: '6px' }}>
              <button className="primary-btn" type="button" onClick={addWater} style={{ backgroundColor: '#2f80ed', boxShadow: '0 8px 16px rgba(47, 128, 237, 0.2)' }}>
                💧 + 250ml Cup
              </button>
              <button className="ghost-btn" type="button" onClick={resetWater}>
                Reset
              </button>
            </div>
          </div>

          {/* Weight progress logger */}
          <div className="card weight-card">
            <div className="card-head">
              <h3>Weight Tracker</h3>
              <span className="chip muted">{weightHistory[weightHistory.length - 1]?.weight || '--'} kg</span>
            </div>
            <form onSubmit={handleAddWeight} className="manual-row" style={{ marginTop: '0px' }}>
              <div className="manual-field" style={{ flex: 1 }}>
                <input
                  type="number"
                  step="0.1"
                  className="manual-input"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Record today (e.g. 72.4)"
                  style={{ width: '100%' }}
                />
              </div>
              <button className="primary-btn" type="submit" style={{ padding: '10px 16px' }}>
                Log Weight
              </button>
            </form>
            <div className="weight-history-list" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {weightHistory.slice(-5).map((w, index) => (
                <div key={w.id || index} className="weight-pill" style={{ background: 'var(--surface-soft)', border: '1px solid var(--stroke)', padding: '6px 12px', borderRadius: '12px', textAlign: 'center', minWidth: '70px', fontSize: '12px' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '10px' }}>{w.date}</div>
                  <strong style={{ display: 'block', fontSize: '13px', marginTop: '2px' }}>{w.weight} kg</strong>
                </div>
              ))}
            </div>
            <button className="ghost-btn" type="button" onClick={clearWeight} style={{ width: '100%', fontSize: '12px', padding: '6px' }}>
              Reset History
            </button>
          </div>
        </div>
      </div>

      {/* Diary logs list */}
      <div className="card diary-card">
        <div className="card-head">
          <div>
            <h3>Logged Meals & Snacks</h3>
            <p>Meals added via the photo scan or database search</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="ghost-btn" type="button" onClick={clearDiary} style={{ fontSize: '12px', padding: '6px 12px' }}>
              Clear Logs
            </button>
            <Link className="primary-btn" to="/analysis" style={{ fontSize: '12px', padding: '8px 14px' }}>
              📸 Snap & Analyze Meal
            </Link>
          </div>
        </div>

        {diary.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
            No meals logged today yet. Snap a picture to automatically calculate your macros!
          </div>
        ) : (
          <div className="diary-items" style={{ display: 'grid', gap: '12px' }}>
            {diary.map((meal) => (
              <div key={meal.id} className="diary-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--surface-soft)', borderRadius: '16px', border: '1px solid var(--stroke)' }}>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <strong style={{ fontSize: '15px' }}>{meal.name}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {meal.time} · Protein: {meal.protein}g · Carbs: {meal.carbs}g · Fat: {meal.fat}g
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '16px', color: 'var(--accent-strong)' }}>{meal.calories} kcal</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom coach advice link card */}
      <div className="card action-card">
        <div>
          <h3>Smart Coaching Active</h3>
          <p>
            Gemini AI coach has analyzed your daily balance. You have {remainingCalories} kcal left.
            Need high-protein dinner ideas or water reminders?
          </p>
        </div>
        <Link className="primary-btn" to="/interactive">
          💬 Ask AI Coach
        </Link>
      </div>
    </section>
  )
}

export default Dashboard
