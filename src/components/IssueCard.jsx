function statusClass(status) {
  return status.toLowerCase()
}

import { assetUrl } from '../api.js'

function IssueCard({ issue, currentUser, onResolve }) {
  const canResolve = currentUser?.role === 'student' && currentUser.id === issue.reportedById && issue.status !== 'Resolved'

  return (
    <article className="issue">
      <div className="issue-top">
        <span className={`badge ${statusClass(issue.status)}`}>{issue.status}</span>
        <span className={`badge ${issue.priority === 'High' ? 'high' : 'reported'}`}>{issue.priority}</span>
      </div>
      <h3>{issue.title}</h3>
      <p>📍 {issue.location}</p>
      <p className="issue-category">{issue.category}</p>
      {issue.photoUrl && (
        <div style={{ position: 'relative' }}>
          <img className="issue-photo" src={assetUrl(issue.photoUrl)} alt={`Shared photo for ${issue.title}`} />
          <a 
            href={assetUrl(issue.photoUrl)} 
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
      {canResolve && <button className="primary issue-resolve" type="button" onClick={() => onResolve(issue.id)}>Mark as resolved</button>}
    </article>
  )
}

export default IssueCard
