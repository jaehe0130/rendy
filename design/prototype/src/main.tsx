import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './rendy-pages.css'
import App from './App.tsx'
import { StoreProvider } from './store'
import { BRAND, THEME, WIREFRAME } from './theme'

if (WIREFRAME) document.documentElement.setAttribute('data-wire', '')
document.documentElement.setAttribute('data-theme', THEME)
document.title = `${BRAND.name} · 성북구 생활가전 렌탈`
// ?capture 이면 팝업을 화면 높이에 자르지 않고 끝까지 펼침 (Figma 시안 캡처용)
if (new URLSearchParams(location.search).has('capture')) document.documentElement.classList.add('capture')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
