function Modal({ children, onClose }) {
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop show" onClick={handleBackdropClick}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  )
}

export default Modal
