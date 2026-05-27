import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import Analysis from './pages/Analysis'
import Interactive from './pages/Interactive'
import Login from './pages/Login'

const navItems = [
  { to: '/', label: 'Login', end: true },
  { to: '/analysis', label: 'Analysis' },
  { to: '/interactive', label: 'Interactive' },
]

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">Cal AI</div>
            <div className="brand-sub">Smart calorie companion</div>
          </div>
          <nav className="nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="top-actions">
            <button className="ghost-btn" type="button">
              Request invite
            </button>
            <button className="primary-btn" type="button">
              Start demo
            </button>
          </div>
        </header>

        <main className="page">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/interactive" element={<Interactive />} />
          </Routes>
        </main>

        <footer className="footer">
          <div>
            Cal AI helps busy people track meals with a quick snap and clear
            insights.
          </div>
          <div className="footer-links">
            <span>Privacy</span>
            <span>Security</span>
            <span>Contact</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
