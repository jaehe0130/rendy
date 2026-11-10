import { lazy, Suspense, useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { FloatingAI, Footer, Header } from './components'
import Home from './pages/Home'
import HomeRendy from './pages/HomeRendy'
import { THEME } from './theme'

// 렌디 테마면 집업 스타일 메인
const Main = THEME === 'rendy' ? HomeRendy : Home
import { ProductDetail, ProductList } from './pages/Products'
import { Checkout, Complete } from './pages/Checkout'
import Login from './pages/Login'
import School from './pages/School'
import { Guide, Quiz } from './pages/Guide'
import Ai from './pages/Ai'
import My from './pages/My'
import Sell from './pages/Sell'
import Try from './pages/Try'
// 3D 뷰어는 model-viewer(약 1MB)가 필요해서 이 화면을 열 때만 불러옴
const Viewer3D = lazy(() => import('./pages/Viewer3D'))

function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      <Header />
      <main><Outlet /></main>
      <Footer />
      {pathname !== '/ai' && <FloatingAI />}
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Main />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/:id/3d" element={<Suspense fallback={<section className="section"><p className="muted">3D 화면 여는 중…</p></section>}><Viewer3D /></Suspense>} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/complete" element={<Complete />} />
        <Route path="/login" element={<Login />} />
        <Route path="/school" element={<School />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/ai" element={<Ai />} />
        <Route path="/my" element={<My />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/try" element={<Try />} />
        <Route path="*" element={<Main />} />
      </Route>
    </Routes>
  )
}
