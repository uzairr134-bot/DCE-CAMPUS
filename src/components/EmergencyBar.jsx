import { useEffect, useState } from 'react'
import { api } from '../api.js'

function EmergencyBar() {
  const [helpline, setHelpline] = useState('112')

  useEffect(() => {
    api.getHelpline().then(({ helpline: loadedHelpline }) => setHelpline(loadedHelpline)).catch(() => {})
  }, [])

  return (
    <div className="emergency-bar">
      <span>Campus emergency helpline: {helpline}</span>
      <a className="emergency-call" href={`tel:${helpline.replace(/[^+\d]/g, '')}`}>
        Call {helpline} now
      </a>
    </div>
  )
}

export default EmergencyBar
