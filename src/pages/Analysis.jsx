import { Link } from 'react-router-dom'

const macros = [
  { label: 'Calories', value: '540 kcal', percent: 72, detail: 'On track' },
  { label: 'Protein', value: '32g', percent: 64, detail: 'Solid' },
  { label: 'Carbs', value: '48g', percent: 58, detail: 'Balanced' },
  { label: 'Fat', value: '18g', percent: 44, detail: 'Light' },
]

const insights = [
  'Higher protein at lunch supports steady energy through mid-afternoon.',
  'Fiber looks low today. Add a fruit or greens to improve satiety.',
  'Sodium is moderate. Stay hydrated if you are training later.',
]

function Analysis() {
  return (
    <section className="page-stack">
      <div className="page-header">
        <div className="eyebrow">Research-backed analysis</div>
        <h1>Clear nutrition output you can act on.</h1>
        <p>
          Cal AI blends image recognition with verified nutrition sources to
          create a summary you can trust and share.
        </p>
        <div className="pill-row">
          <span className="pill">USDA data</span>
          <span className="pill">Portion confidence 92%</span>
          <span className="pill">Coach ready</span>
        </div>
      </div>

      <div className="analysis-grid">
        <div className="card highlight">
          <div className="card-head">
            <div>
              <h3>Meal snapshot</h3>
              <p>Grilled salmon bowl with quinoa and greens</p>
            </div>
            <span className="chip">Lunch</span>
          </div>
          <div className="snapshot">
            <div className="snapshot-photo">Meal photo</div>
            <div className="snapshot-meta">
              <div>
                <span>Total estimate</span>
                <strong>540 kcal</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>92%</strong>
              </div>
              <div>
                <span>Time</span>
                <strong>12:24 PM</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Macro breakdown</h3>
          <div className="macro-bars">
            {macros.map((macro) => (
              <div key={macro.label} className="macro-bar">
                <div className="macro-top">
                  <span>{macro.label}</span>
                  <strong>{macro.value}</strong>
                </div>
                <div className="bar">
                  <span style={{ width: `${macro.percent}%` }}></span>
                </div>
                <div className="macro-foot">{macro.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="split">
        <div className="card">
          <h3>Research notes</h3>
          <ul className="insight-list">
            {insights.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <div className="source-row">
            <span>Sources:</span>
            <span>USDA FoodData Central</span>
            <span>NIH macro guidance</span>
          </div>
        </div>
        <div className="card">
          <h3>Weekly trend</h3>
          <p>Calories stay within goal 5 of the last 7 days.</p>
          <div className="trend">
            <div className="trend-bar" style={{ height: '62%' }}></div>
            <div className="trend-bar" style={{ height: '75%' }}></div>
            <div className="trend-bar" style={{ height: '58%' }}></div>
            <div className="trend-bar" style={{ height: '80%' }}></div>
            <div className="trend-bar" style={{ height: '68%' }}></div>
            <div className="trend-bar" style={{ height: '74%' }}></div>
            <div className="trend-bar" style={{ height: '61%' }}></div>
          </div>
          <div className="trend-labels">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>

      <div className="page-actions">
        <Link className="ghost-btn" to="/">
          Back to login
        </Link>
        <Link className="primary-btn" to="/interactive">
          Go interactive
        </Link>
      </div>
    </section>
  )
}

export default Analysis
