function Toast({ message }) {
  if (!message) return null
  return <div className="notice">{message}</div>
}

export default Toast
