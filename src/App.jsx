import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import Analysis from './pages/Analysis'
import Interactive from './pages/Interactive'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { useAuth } from './context/AuthContext'

function App() {
  const { user, loading, signOutUser } = useAuth()
  
  const navItems = [
    { to: '/', label: user ? 'Dashboard' : 'Login', end: true },
    { to: '/analysis', label: 'Analysis' },
    { to: '/interactive', label: 'Interactive' },
  ]
  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CA'

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
            {loading ? (
              <span className="status-pill">Checking session...</span>
            ) : user ? (
              <div className="user-actions">
                <div className="user-chip">
                  {user.photoURL ? (
                    <img className="avatar" src={user.photoURL} alt="" />
                  ) : (
                    <span className="avatar-fallback">{initials}</span>
                  )}
                  <div>
                    <span className="user-name">
                      {user.displayName || 'Signed in'}
                    </span>
                    <span className="user-email">
                      {user.email || 'Google account'}
                    </span>
                  </div>
                </div>
                <button className="ghost-btn" type="button" onClick={signOutUser}>
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <button className="ghost-btn" type="button">
                  Request invite
                </button>
                <button className="primary-btn" type="button">
                  Start demo
                </button>
              </>
            )}
          </div>
        </header>

        <main className="page">
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Login />} />
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
