import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Photo to macros',
    copy: 'Snap a meal and get calories, protein, carbs, and fats in seconds.',
  },
  {
    title: 'Diary that stays real',
    copy: 'Log meals without the friction, and keep your streak intact.',
  },
  {
    title: 'Coaching-ready insights',
    copy: 'Export a clean summary your coach can review in minutes.',
  },
]

const signals = [
  { label: 'Daily goal', value: '1,950 kcal' },
  { label: 'Streak', value: '12 days' },
  { label: 'Coach sync', value: 'Weekly' },
]

function Login() {
  return (
    <section className="page-grid">
      <div className="hero">
        <div className="eyebrow">Private beta</div>
        <h1>Snap a meal. Cal AI handles the math.</h1>
        <p>
          Cal AI turns meal photos into a clean, trustworthy nutrition summary.
          Built for people who want to eat well without spending the day
          tracking.
        </p>
        <div className="cta-row">
          <button className="primary-btn google" type="button">
            <span className="google-dot">G</span>
            Continue with Google
          </button>
          <button className="ghost-btn" type="button">
            Request access
          </button>
        </div>
        <div className="note">No spam. Cancel anytime. Your data stays yours.</div>
        <div className="feature-list">
          {features.map((item) => (
            <div key={item.title} className="feature-item">
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          ))}
        </div>
        <div className="signal-row">
          {signals.map((signal) => (
            <div key={signal.label} className="signal">
              <span>{signal.label}</span>
              <strong>{signal.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="device">
        <div className="phone">
          <div className="phone-top">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <div className="phone-header">
            <div>
              <div className="phone-title">Cal AI</div>
              <div className="phone-sub">Meal capture</div>
            </div>
            <span className="chip">Live</span>
          </div>
          <div className="scan-card">
            <div className="scan-photo">Meal photo</div>
            <div className="scan-meta">
              <div>
                <span>Estimated calories</span>
                <strong>540 kcal</strong>
              </div>
              <button className="ghost-btn" type="button">
                Retake
              </button>
            </div>
          </div>
          <div className="macro-list">
            <div>
              <span>Protein</span>
              <strong>32g</strong>
            </div>
            <div>
              <span>Carbs</span>
              <strong>48g</strong>
            </div>
            <div>
              <span>Fat</span>
              <strong>18g</strong>
            </div>
          </div>
          <div className="phone-footer">
            <span>Today, 12:24 PM</span>
            <button className="primary-btn" type="button">
              Add to diary
            </button>
          </div>
        </div>
        <div className="phone-shadow"></div>
      </div>

      <div className="page-actions">
        <div>
          <strong>Next:</strong> See how Cal AI explains the data
        </div>
        <Link className="link-btn" to="/analysis">
          View analysis
        </Link>
      </div>
    </section>
  )
}

export default Login
