import { useEffect, useRef, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Report from './pages/Report.jsx'
import Donate from './pages/Donate.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Toast from './components/Toast.jsx'
import { api } from './api.js'

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const raw = localStorage.getItem('campusfix_currentUser')
    return raw ? JSON.parse(raw).user : null
  })
  const [toastMessage, setToastMessage] = useState('')
  const alertAudioContext = useRef(null)
  const alertedReportIds = useRef(new Set())
  const [pushStatus, setPushStatus] = useState('checking')

  function unlockAlertAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    if (!alertAudioContext.current) alertAudioContext.current = new AudioContextClass()
    if (alertAudioContext.current.state === 'suspended') alertAudioContext.current.resume()
  }

  async function playBuzzer() {
    unlockAlertAudio()
    const audioContext = alertAudioContext.current
    if (!audioContext) return
    await audioContext.resume()
    const now = audioContext.currentTime
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(620, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.36, now + 0.08)

    for (let second = 0; second < 10; second += 1) {
      const start = now + second
      oscillator.frequency.linearRampToValueAtTime(1120, start + 0.5)
      oscillator.frequency.linearRampToValueAtTime(620, start + 1)
    }

    gain.gain.setValueAtTime(0.36, now + 9.7)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 10)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 10.05)
  }

  useEffect(() => {
    if (currentUser?.role !== 'admin') return undefined
    registerAdminPush().catch(() => setPushStatus('unavailable'))
    window.addEventListener('pointerdown', unlockAlertAudio)
    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type !== 'campusfix-report' || !event.data.id || alertedReportIds.current.has(event.data.id)) return
      alertedReportIds.current.add(event.data.id)
      if (event.data.notifyBuzzer) playBuzzer().catch(() => {})
    }
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage)
    let active = true
    let latestTime = Date.now()
    const poll = async () => {
      try {
        const reports = await api.getReportAlerts(latestTime)
        if (!active || reports.length === 0) return
        latestTime = Math.max(...reports.map((report) => new Date(report.createdAt).getTime()))
        reports.forEach((report) => {
          if (alertedReportIds.current.has(report.id)) return
          alertedReportIds.current.add(report.id)
          if (report.notifyBuzzer) playBuzzer().catch(() => {})
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New CampusFix report', { body: report.title })
          }
        })
      } catch {
        // Retry on the next polling cycle.
      }
    }
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {})
    const interval = window.setInterval(poll, 10000)
    return () => {
      active = false
      window.removeEventListener('pointerdown', unlockAlertAudio)
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage)
      window.clearInterval(interval)
    }
  }, [currentUser?.role])

  async function registerAdminPush() {
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setPushStatus('https-required')
      return
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPushStatus('unsupported')
      return
    }
    const registration = await navigator.serviceWorker.register('/sw.js')
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setPushStatus('permission-denied')
      return
    }
    const { publicKey } = await api.getPushConfig()
    if (!publicKey) {
      setPushStatus('unavailable')
      return
    }
    const existing = await registration.pushManager.getSubscription()
    const subscription = existing || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })
    await api.subscribeToPush(subscription.toJSON())
    setPushStatus('enabled')
  }

  function urlBase64ToUint8Array(value) {
    const padding = '='.repeat((4 - value.length % 4) % 4)
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
    return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
  }

  function showToast(message) {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 3000)
  }

  function handleLogin(authResponse) {
    localStorage.setItem('campusfix_currentUser', JSON.stringify(authResponse))
    setCurrentUser(authResponse.user)
  }

  function handleLogout() {
    localStorage.removeItem('campusfix_currentUser')
    setCurrentUser(null)
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login onLogin={handleLogin} showToast={showToast} />} />
        <Route path="/home" element={<Home currentUser={currentUser} onLogout={handleLogout} showToast={showToast} />} />
        <Route path="/report" element={<Report currentUser={currentUser} onLogout={handleLogout} showToast={showToast} />} />
        <Route path="/donate" element={<Donate currentUser={currentUser} onLogout={handleLogout} showToast={showToast} />} />
        <Route path="/admin" element={<AdminDashboard currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} showToast={showToast} />} />
      </Routes>
      {currentUser?.role === 'admin' && pushStatus !== 'enabled' && pushStatus !== 'checking' && (
        <button className="push-status" onClick={() => registerAdminPush().catch(() => setPushStatus('unavailable'))}>
          {pushStatus === 'https-required' ? 'Background alerts need HTTPS' : 'Tap to enable background alerts'}
        </button>
      )}
      <Toast message={toastMessage} />
    </>
  )
}

export default App
