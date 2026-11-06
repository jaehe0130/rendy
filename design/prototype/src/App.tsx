import { useEffect } from 'react'
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
import Admin from './pages/Admin'
import Judge from './pages/Judge'

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
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/complete" element={<Complete />} />
        <Route path="/login" element={<Login />} />
        <Route path="/school" element={<School />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/ai" element={<Ai />} />
        <Route path="/my" element={<My />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/judge" element={<Judge />} />
        <Route path="*" element={<Main />} />
      </Route>
    </Routes>
  )
}
