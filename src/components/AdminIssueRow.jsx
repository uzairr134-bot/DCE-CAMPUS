function statusClass(status) {
  return status.toLowerCase()
}

function AdminIssueRow({ issue, onView }) {
  return (
    <div className="admin-row">
      <div>
        <strong>{issue.title}</strong>
        <p>📍 {issue.location} · {issue.category}</p>
      </div>
      <span className={`badge ${issue.priority === 'High' ? 'high' : 'reported'}`}>{issue.priority} priority</span>
      <span className={`badge ${statusClass(issue.status)}`}>{issue.status}</span>
      <button className="view-report" onClick={onView}>View report</button>
    </div>
  )
}

export default AdminIssueRow
