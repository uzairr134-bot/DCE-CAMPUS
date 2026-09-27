import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { api } from '../api.js'

function Report({ currentUser, onLogout, showToast }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Electrical')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState('Low')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState(null)
  const [notifyBuzzer, setNotifyBuzzer] = useState(false)

  useEffect(() => {
    if (!currentUser) navigate('/login')
  }, [currentUser])

  if (!currentUser) return null

  function handlePhotoChange(e) {
    setPhoto(e.target.files[0] || null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const { id } = await api.createIssue({ title, category, location, priority, description, notifyBuzzer })
      if (photo) await api.uploadPhoto(id, photo)
      showToast('Report submitted successfully!')
      navigate('/home')
    } catch (requestError) {
      showToast(requestError.message)
    }
  }

  return (
    <div>
      <Header currentUser={currentUser} onLogout={onLogout} />
      <main className="page report-page">
        <div className="form-wrap">
          <h1>Report an issue</h1>
          <p>Tell us what's wrong and where, and campus staff will take it from there.</p>
          <form onSubmit={handleSubmit}>
            <label className="full">
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Furniture</option>
                <option>Cleanliness</option>
                <option>Internet/Wi-Fi</option>
                <option>Safety</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Location
              <input value={location} onChange={(e) => setLocation(e.target.value)} required />
            </label>
            <label>
              Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label className="full">
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>
            <label className="photo-upload-label full">
              Photo (optional)
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
            <label className="checkbox-label full">
              <input type="checkbox" checked={notifyBuzzer} onChange={(e) => setNotifyBuzzer(e.target.checked)} />
              Request a 10-second buzzer alert for the administrator
            </label>
            <button className="primary full" type="submit">Submit report</button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Report
