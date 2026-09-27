function StatCard({ label, value, onClick }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div className={onClick ? 'card clickable' : 'card'} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={onClick ? handleKeyDown : undefined}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}

export default StatCard
