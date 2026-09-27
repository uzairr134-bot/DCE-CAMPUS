import { Link } from 'react-router-dom'

function Welcome() {
  return (
    <div className="welcome-screen">
      <div className="welcome-shell">
        <div className="welcome-card">
          <div className="welcome-topline">
            <span className="welcome-mark">CF</span>
            <span>GDC Ganderbal · Campus operations</span>
          </div>
          <div className="welcome-copy">
            <p className="welcome-kicker">Make the campus better, together</p>
            <h1>Small reports.<br /><span>Real improvements.</span></h1>
            <p className="welcome-description">CampusFix gives every student a direct line to the people who can fix what is broken, unsafe, or getting in the way.</p>
            <div className="welcome-actions">
              <Link to="/login" className="primary btn-link">Report an issue <span aria-hidden="true">→</span></Link>
              <span className="welcome-note">Takes less than a minute</span>
            </div>
          </div>
          <div className="welcome-proof">
            <div><strong>01</strong><span>Spot it</span></div>
            <div><strong>02</strong><span>Report it</span></div>
            <div><strong>03</strong><span>See it fixed</span></div>
          </div>
        </div>
        <aside className="welcome-side">
          <div className="side-label"><span className="status-dot" /> Live campus care</div>
          <div className="signal-ring"><span>GDC<br /><b>CARE</b></span></div>
          <p>Every useful report helps staff respond sooner and helps students feel heard.</p>
          <div className="impact-list">
            <div><strong>Fast</strong><span>Direct issue reporting</span></div>
            <div><strong>Clear</strong><span>Progress you can follow</span></div>
            <div><strong>Shared</strong><span>A better campus for everyone</span></div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Welcome
