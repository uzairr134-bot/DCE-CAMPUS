import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import EmergencyBar from '../components/EmergencyBar.jsx'
import StatCard from '../components/StatCard.jsx'
import IssueCard from '../components/IssueCard.jsx'
import { api } from '../api.js'

function Home({ currentUser, onLogout, showToast }) {
  const navigate = useNavigate()
  const [issues, setIssues] = useState([])
  const [issueFilter, setIssueFilter] = useState('All')
  const reportsRef = useRef(null)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getIssues().then(setIssues).catch(() => setIssues([]))
  }, [currentUser])

  async function resolveIssue(id) {
    try {
      const updatedIssue = await api.resolveIssue(id)
      setIssues((currentIssues) => currentIssues.map((issue) => issue.id === updatedIssue.id ? updatedIssue : issue))
      showToast('Issue marked as resolved.')
    } catch (requestError) {
      showToast(requestError.message)
    }
  }

  if (!currentUser) return null

  const openCount = issues.filter((i) => i.status !== 'Resolved').length
  const highCount = issues.filter((i) => i.priority === 'High' && i.status !== 'Resolved').length
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length
  const assignedCount = issues.filter((i) => i.status === 'Assigned').length
  const totalCount = issues.length
  const visibleIssues = issueFilter === 'All' ? issues : issues.filter((issue) => issue.status === issueFilter)
  const recentIssues = visibleIssues.slice(0, 4)

  function goToAdminFiltered(filter) {
    navigate('/admin', { state: { filter } })
  }

  function showIssueFilter(filter) {
    setIssueFilter(filter)
    requestAnimationFrame(() => reportsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return (
    <div>
      <Header currentUser={currentUser} onLogout={onLogout} />
      <EmergencyBar />
      <main className="page">
        <section className="hero">
          <div>
            <h1>Better campus, one report at a time</h1>
            <p>Spotted something broken or unsafe on campus? Let us know and we'll get it fixed.</p>
          </div>
          <button className="primary" onClick={() => navigate('/report')}>Report an issue</button>
        </section>

        <div className="cards">
          <StatCard label="Open issues" value={openCount} onClick={() => goToAdminFiltered('Open')} />
          <StatCard label="High priority" value={highCount} onClick={() => goToAdminFiltered('High')} />
          <StatCard label="Resolved issues" value={resolvedCount} onClick={() => showIssueFilter('Resolved')} />
          <StatCard label="Assigned issues" value={assignedCount} onClick={() => showIssueFilter('Assigned')} />
          <StatCard label="Total issues" value={totalCount} onClick={() => showIssueFilter('All')} />
        </div>

        <div className="section-head" ref={reportsRef}>
          <h2>{issueFilter === 'All' ? 'Recent campus reports' : `${issueFilter} issues`}</h2>
        </div>
        <div className="issues-grid">
          {recentIssues.length === 0 && <p>No reports have been filed yet.</p>}
          {recentIssues.map((issue, index) => (
            <IssueCard key={index} issue={issue} currentUser={currentUser} onResolve={resolveIssue} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home
