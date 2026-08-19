import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { resetStats } from './stats'
import './index.css'

resetStats()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
