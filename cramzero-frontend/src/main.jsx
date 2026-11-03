import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { API_BASE } from './lib/api'

const nativeFetch = window.fetch.bind(window)
window.fetch = (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url
  if (!url.startsWith(API_BASE)) return nativeFetch(input, init)
  const token = localStorage.getItem('cramzero-access-token')
  if (!token) return nativeFetch(input, init)
  const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined))
  headers.set('Authorization', `Bearer ${token}`)
  return nativeFetch(input, { ...init, headers }).then(response => {
    if (response.status === 401 && url.startsWith(API_BASE)) {
      localStorage.setItem('cramzero-session-draft', JSON.stringify({
        path: window.location.pathname,
        hash: window.location.hash,
        savedAt: new Date().toISOString(),
      }))
      window.dispatchEvent(new CustomEvent('cramzero-session-expired'))
    }
    return response
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
