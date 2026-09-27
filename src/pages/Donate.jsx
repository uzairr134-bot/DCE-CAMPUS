import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { api } from '../api.js'

function Donate({ currentUser, onLogout, showToast }) {
  const navigate = useNavigate()
  const [total, setTotal] = useState(0)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    api.getDonationTotal().then(({ total: loadedTotal }) => setTotal(loadedTotal)).catch((requestError) => showToast(requestError.message))
  }, [currentUser])

  if (!currentUser) return null

  async function handleSubmit(e) {
    e.preventDefault()
    const pledge = Number(amount)
    if (!pledge || pledge <= 0) {
      showToast('Please enter a valid pledge amount.')
      return
    }
    try {
      const { total: updatedTotal } = await api.createDonation({ name, amount: pledge, message })
      setTotal(updatedTotal)
      setName('')
      setAmount('')
      setMessage('')
      showToast('Thank you—your donation pledge was recorded.')
    } catch (requestError) {
      showToast(requestError.message)
    }
  }

  return (
    <div>
      <Header currentUser={currentUser} onLogout={onLogout} />
      <main className="page">
        <div className="donation-hero">
          <h1>Help us fix campus, faster</h1>
          <p>Your pledge supports repairs and upgrades across GDC Ganderbal — from lighting to Wi-Fi to hostel plumbing.</p>
        </div>
        <div className="donation-box">
          <div className="donation-total">
            Total pledged so far: <strong>₹{total}</strong>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="full">
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="full">
              Pledge amount (₹)
              <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </label>
            <label className="full">
              Message (optional)
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            <button className="primary full" type="submit">Pledge donation</button>
          </form>
          <p className="donation-note">Pledges are recorded locally for this demo and are not real financial transactions.</p>
        </div>
      </main>
    </div>
  )
}

export default Donate
