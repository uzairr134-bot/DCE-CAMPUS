import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import AdminIssueRow from '../components/AdminIssueRow.jsx'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import { api, assetUrl } from '../api.js'

function formatIssueDateTime(value) {
  if (!value) return 'Unknown'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function AdminDashboard({ currentUser, onLogin, onLogout, showToast }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [issues, setIssues] = useState([])
  const [filter, setFilter] = useState(location.state?.filter || 'All')
  const [helpline, setHelpline] = useState('')
  const [activeIssueIndex, setActiveIssueIndex] = useState(null)
  const [modalStatus, setModalStatus] = useState('Reported')
  const [photoFile, setPhotoFile] = useState(null)
  const [isSharingPhoto, setIsSharingPhoto] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [adminCategory, setAdminCategory] = useState(currentUser?.adminCategory || 'Electrical')
  const loadedIssues = useRef(false)
  const issuesRef = useRef([])

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (currentUser.role !== 'admin') {
      showToast('Administrator sign-in is required for the dashboard.')
      navigate('/home')
      return
    }
    let active = true
    async function loadDashboard() {
      const [loadedReports, settings] = await Promise.all([api.getIssues(), api.getHelpline()])
      if (!active) return
      setIssues(loadedReports)
      issuesRef.current = loadedReports
      setHelpline(settings.helpline)
      loadedIssues.current = true
    }

    loadDashboard().catch((requestError) => showToast(requestError.message))
    const interval = window.setInterval(async () => {
      try {
        const latestReports = await api.getIssues()
        if (!active) return
        if (loadedIssues.current) {
          const existingIds = new Set(issuesRef.current.map((issue) => issue.id))
          const newReports = latestReports.filter((issue) => !existingIds.has(issue.id))
          if (newReports.length > 0) {
            setNotifications((current) => [
              ...newReports.filter((report) => !current.some((item) => item.id === report.id)),
              ...current
            ])
            newReports.forEach((report) => {
              showToast(`New report received: ${report.title}`)
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New CampusFix report', { body: report.title })
              }
            })
          }
        }
        setIssues(latestReports)
        issuesRef.current = latestReports
      } catch {
        // The next polling cycle will retry if the API is temporarily unavailable.
      }
    }, 10000)

    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [currentUser])

  if (!currentUser || currentUser.role !== 'admin') return null

  async function saveHelpline() {
    if (!helpline.trim()) {
      showToast('Please enter a helpline number.')
      return
    }
    try {
      await api.updateHelpline(helpline.trim())
      showToast('Campus safety helpline updated for all students.')
    } catch (requestError) {
      showToast(requestError.message)
    }
  }

  async function saveAdminCategory() {
    try {
      const authResponse = await api.updateAdminCategory(adminCategory)
      onLogin(authResponse)
      showToast(`You now manage ${adminCategory} reports.`)
    } catch (requestError) {
      showToast(requestError.message)
    }
  }

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'All') return true
    if (filter === 'Open') return issue.status !== 'Resolved'
    if (filter === 'High') return issue.priority === 'High'
    return issue.status === filter
  })

  function openModal(index) {
    setActiveIssueIndex(index)
    setModalStatus(issues[index].status)
    setPhotoFile(null)
  }

  function closeModal() {
    setActiveIssueIndex(null)
  }

  async function saveStatus() {
    const issue = issues[activeIssueIndex]
    try {
      const updatedIssue = await api.updateIssueStatus(issue.id, modalStatus)
      setIssues((currentIssues) => {
        const updatedIssues = currentIssues.map((currentIssue) => currentIssue.id === updatedIssue.id ? updatedIssue : currentIssue)
        issuesRef.current = updatedIssues
        return updatedIssues
      })
      showToast(modalStatus === 'Resolved' ? 'Report resolved. It will be removed after 7 days.' : 'Status updated successfully.')
      closeModal()
    } catch (requestError) {
      showToast(requestError.message)
    }
  }

  async function sharePhoto() {
    if (!activeIssue || !photoFile || isSharingPhoto) return
    setIsSharingPhoto(true)
    try {
      const response = await api.uploadPhoto(activeIssue.id, photoFile)
      setIssues((currentIssues) => {
        const updatedIssues = currentIssues.map((issue) => issue.id === response.issue.id ? response.issue : issue)
        issuesRef.current = updatedIssues
        return updatedIssues
      })
      setPhotoFile(null)
      showToast('Photo shared with the student.')
    } catch (requestError) {
      showToast(requestError.message)
    } finally {
      setIsSharingPhoto(false)
    }
  }

  const activeIssue = activeIssueIndex !== null ? issues[activeIssueIndex] : null
  const totalIssues = issues.length
  const resolvedIssues = issues.filter((issue) => issue.status === 'Resolved').length
  const pendingIssues = totalIssues - resolvedIssues
  const assignedIssues = issues.filter((issue) => issue.status === 'Assigned').length

  function showIssueFilter(nextFilter) {
    setFilter(nextFilter)
    requestAnimationFrame(() => document.querySelector('.admin-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return (
    <div>
      <Header currentUser={currentUser} onLogout={onLogout} />
      <main className="page">
        <h1>{currentUser.adminCategory ? `${currentUser.adminCategory} Reports` : 'Admin Dashboard'}</h1>
        {currentUser.adminCategory ? (
          <p className="dashboard-scope">Managing {currentUser.adminCategory} reports</p>
        ) : (
          <div className="safety-settings">
            <label>
              Choose your assigned issue category
              <select value={adminCategory} onChange={(e) => setAdminCategory(e.target.value)}>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Furniture</option>
                <option>Cleanliness</option>
                <option>Internet/Wi-Fi</option>
                <option>Safety</option>
                <option>Other</option>
              </select>
            </label>
            <button className="primary" onClick={saveAdminCategory}>Save assignment</button>
          </div>
        )}

        <div className="cards">
          <StatCard label="Total issues" value={totalIssues} onClick={() => showIssueFilter('All')} />
          <StatCard label="Resolved issues" value={resolvedIssues} onClick={() => showIssueFilter('Resolved')} />
          <StatCard label="Pending issues" value={pendingIssues} onClick={() => showIssueFilter('Open')} />
          <StatCard label="Assigned issues" value={assignedIssues} onClick={() => showIssueFilter('Assigned')} />
        </div>

        <section className="maintenance-banner" aria-label="Campus repair activity">
          <div>
            <span className="maintenance-kicker"><span className="status-dot" /> Campus systems in motion</span>
            <h2>Every report moves a fix forward.</h2>
            <p>Review the latest issue, assign the next step, and keep GDC moving.</p>
          </div>
          <div className="repair-scene" aria-hidden="true">
            <div className="repair-signal signal-one" />
            <div className="repair-signal signal-two" />
            <div className="repair-person">
              <div className="repair-head" />
              <div className="repair-body" />
              <div className="repair-arm" />
            </div>
            <div className="repair-laptop">
              <div className="laptop-screen"><span /></div>
              <div className="laptop-base" />
            </div>
            <div className="repair-wrench">+</div>
          </div>
        </section>

        <div className="notification-tools">
          <button className="notification-button" onClick={() => setNotificationsOpen((open) => !open)}>
            Notifications
            {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
          </button>
          {notificationsOpen && (
            <div className="notification-panel">
              <div className="notification-panel-head">
                <strong>New reports</strong>
                {notifications.length > 0 && (
                  <button className="link-button" onClick={() => setNotifications([])}>Mark all read</button>
                )}
              </div>
              {notifications.length === 0 ? <p>No new reports.</p> : notifications.map((notification) => (
                <button
                  className="notification-item"
                  key={notification.id}
                  onClick={() => {
                    setNotifications((current) => current.filter((item) => item.id !== notification.id))
                    setNotificationsOpen(false)
                    const index = issues.findIndex((issue) => issue.id === notification.id)
                    if (index >= 0) openModal(index)
                  }}
                >
                  <strong>{notification.title}</strong>
                  <span>{notification.location} · {notification.priority} priority{notification.notifyBuzzer ? ' · 10-second buzzer requested' : ''}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="safety-settings">
          <label>
            Campus emergency helpline number
            <input value={helpline} onChange={(e) => setHelpline(e.target.value)} />
          </label>
          <button className="primary" onClick={saveHelpline}>Save helpline</button>
        </div>

        <div className="toolbar">
          <label>
            Filter reports
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Open">Open</option>
              <option value="High">High priority</option>
              <option value="Reported">Reported</option>
              <option value="Assigned">Assigned</option>
            </select>
          </label>
        </div>

        <div className="admin-list">
          {filteredIssues.length === 0 && <p>No reports match this filter.</p>}
          {filteredIssues.map((issue) => {
            const realIndex = issues.indexOf(issue)
            return <AdminIssueRow key={realIndex} issue={issue} onView={() => openModal(realIndex)} />
          })}
        </div>
      </main>

      {activeIssue && (
        <Modal onClose={closeModal}>
          <h2>{activeIssue.title}</h2>
          <div className="detail-grid">
            <div className="detail-item"><small>Category</small>{activeIssue.category}</div>
            <div className="detail-item"><small>Location</small>{activeIssue.location}</div>
            <div className="detail-item"><small>Priority</small>{activeIssue.priority}</div>
            <div className="detail-item"><small>Status</small>{activeIssue.status}</div>
            <div className="detail-item"><small>Reported</small>{formatIssueDateTime(activeIssue.createdAt)}</div>
          </div>
          <p>{activeIssue.description}</p>
          {activeIssue.photoUrl && (
            <div className="report-photo" style={{ position: 'relative' }}>
              <img src={assetUrl(activeIssue.photoUrl)} alt={`Photo for ${activeIssue.title}`} style={{ display: 'block', width: '100%' }} />
              <a 
                href={assetUrl(activeIssue.photoUrl)} 
                target="_blank" 
                rel="noreferrer" 
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  backdropFilter: 'blur(4px)'
                }}
              >
                ⛶ Full Screen
              </a>
            </div>
          )}
          <div className="share-photo">
            <label>
              Share a resolution photo with the student
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0] || null)} />
            </label>
            <button className="secondary" type="button" onClick={sharePhoto} disabled={!photoFile || isSharingPhoto}>
              {isSharingPhoto ? 'Sharing...' : 'Share photo'}
            </button>
          </div>
          <div className="modal-actions">
            {activeIssue.status === 'Resolved' ? (
              <strong>Resolved by reporting student</strong>
            ) : (
              <>
                <select value={modalStatus} onChange={(e) => setModalStatus(e.target.value)}>
                  <option value="Reported">Reported</option>
                  <option value="Assigned">Assigned</option>
                </select>
                <button className="primary" onClick={saveStatus}>Update status</button>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminDashboard
