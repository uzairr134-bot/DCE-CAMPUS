import { Link, useNavigate } from 'react-router-dom'

function Header({ currentUser, onLogout }) {
  const navigate = useNavigate()

  function handleLogout() {
    onLogout()
    navigate('/')
  }

  return (
    <header className="app-header">
      <div className="brand">
        GDC <span>CampusFix</span>
      </div>
      <nav>
        <Link className="nav-btn" to="/home">Home</Link>
        <Link className="nav-btn" to="/report">Report an issue</Link>
        <Link className="nav-btn" to="/donate">Donate</Link>
        {currentUser?.role === 'admin' && (
          <Link className="nav-btn" to="/admin">Admin Dashboard</Link>
        )}
        <button className="ghost" onClick={handleLogout}>Log out</button>
      </nav>
    </header>
  )
}

export default Header
