import { useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { type IllustKey, type Product, lowest, won } from './data'
import { useStore } from './store'
import { BRAND, THEME, WIREFRAME } from './theme'

// 일러스트 선 · 포인트 색 (렌디: 네이비 선 + 민트 포인트)
const INK = THEME === 'rendy' ? '#14213D' : '#1E1B18'
const ACC = THEME === 'rendy' ? '#2EC4A6' : '#FF6A3D'
const S = { stroke: INK, strokeWidth: 1.6, fill: '#FFFFFF' }

export function Illust({ k, size }: { k: IllustKey; size?: number }) {
  const common = { className: 'ill', width: size, height: size, viewBox: '0 0 120 120', fill: 'none', 'aria-hidden': true }
  if (WIREFRAME)
    return (
      <svg {...common}>
        <rect x="10" y="10" width="100" height="100" fill="#fff" stroke="#9a9a9a" strokeWidth="1.2" />
        <path d="M10 10l100 100M110 10L10 110" stroke="#c4c4c4" strokeWidth="1" />
      </svg>
    )
  switch (k) {
    case 'dehumidifier':
      return (
        <svg {...common}>
          <rect x="34" y="14" width="52" height="92" rx="12" {...S} />
          <rect x="42" y="24" width="36" height="6" rx="3" fill={INK} />
          <path d="M44 39h32M44 47h32" {...S} />
          <rect x="42" y="60" width="36" height="36" rx="6" {...S} />
          <path d="M60 68c-5 6-7 10-7 13a7 7 0 0 0 14 0c0-3-2-7-7-13z" {...S} />
          <circle cx="76" cy="27" r="3" fill={ACC} />
        </svg>
      )
    case 'dryer':
      return (
        <svg {...common}>
          <rect x="24" y="16" width="72" height="88" rx="6" {...S} />
          <path d="M24 34h72" {...S} />
          <circle cx="36" cy="25" r="3" fill={ACC} />
          <path d="M50 25h34" {...S} />
          <circle cx="60" cy="68" r="24" {...S} />
          <circle cx="60" cy="68" r="16" {...S} />
          <path d="M52 64c4 4 12 4 16 0" {...S} />
        </svg>
      )
    case 'humidifier':
      return (
        <svg {...common}>
          <path d="M40 50c0-12 9-22 20-22s20 10 20 22v40a10 10 0 0 1-10 10H50a10 10 0 0 1-10-10z" {...S} />
          <path d="M40 74h40" {...S} />
          <rect x="50" y="18" width="20" height="10" rx="3" fill={INK} />
          <path d="M55 12c-4-3 4-6 0-9M65 12c-4-3 4-6 0-9" stroke={INK} strokeWidth="1.6" />
          <circle cx="60" cy="86" r="2.5" fill={ACC} />
        </svg>
      )
    case 'foodwaste':
      return (
        <svg {...common}>
          <path d="M34 40h52v54a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8z" {...S} />
          <path d="M30 32a6 6 0 0 1 6-6h48a6 6 0 0 1 6 6v8H30z" {...S} />
          <path d="M50 26v-6h20v6" {...S} />
          <circle cx="60" cy="62" r="10" {...S} />
          <path d="M56 62l3 3 5-6" {...S} />
          <circle cx="74" cy="33" r="2.5" fill={ACC} />
          <path d="M42 88h36" {...S} />
        </svg>
      )
    case 'standbyme':
      return (
        <svg {...common}>
          <rect x="22" y="12" width="76" height="52" rx="6" {...S} />
          <path d="M30 52l14-12 10 8 12-14 24 18" {...S} />
          <path d="M60 64v38M44 104h32" {...S} />
          <circle cx="90" cy="20" r="2.5" fill={ACC} />
        </svg>
      )
    case 'vacuum':
      return (
        <svg {...common}>
          <rect x="56" y="10" width="14" height="22" rx="5" {...S} />
          <path d="M63 32v58" {...S} />
          <rect x="54" y="44" width="18" height="26" rx="6" {...S} />
          <path d="M40 92h44a6 6 0 0 1 0 12H40a6 6 0 0 1 0-12z" {...S} />
          <circle cx="63" cy="57" r="2.5" fill={ACC} />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <rect x="22" y="30" width="76" height="70" rx="16" {...S} />
          <rect x="46" y="42" width="28" height="9" rx="4.5" fill={INK} />
          <path d="M42 70c6 11 30 11 36 0" stroke={ACC} strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
  }
}

export function Logo({ light }: { light?: boolean }) {
  if (WIREFRAME)
    return (
      <Link to="/" className="row gap-8 logo" aria-label="모두의 물건 홈">
        <span style={{ width: 28, height: 28, border: `1.5px solid ${light ? '#fff' : 'var(--ink)'}`, display: 'inline-block' }} />
        <span style={{ fontWeight: 700, fontSize: 19, color: light ? '#fff' : 'var(--ink)' }}>모두의 물건</span>
      </Link>
    )
  if (THEME === 'rendy')
    return (
      <Link to="/" className="row gap-8 logo" aria-label="렌디 홈">
        <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden>
          <rect width="40" height="40" rx="11" fill="#2EC4A6" />
          <path d="M11 13h11a6 6 0 0 1 0 12h-4l7 6" stroke="#14213D" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="30.5" cy="12" r="3" fill="#FF7A2F" />
        </svg>
        <span className="row" style={{ alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em', color: light ? '#fff' : 'var(--ink)' }}>Rendy</span>
          <span className="hide-sm" style={{ fontWeight: 600, fontSize: 13, color: light ? 'rgba(255,255,255,.7)' : 'var(--ink-3)' }}>렌디</span>
        </span>
      </Link>
    )
  return (
    <Link to="/" className="row gap-8 logo" aria-label="모두의 물건 홈">
      <svg width="30" height="30" viewBox="0 0 40 40" aria-hidden>
        <rect width="40" height="40" rx="12" fill="#FF6A3D" />
        <rect x="14" y="8.5" width="12" height="4.5" rx="2.25" fill="#fff" />
        <path d="M11.5 21.5c3 5.5 14 5.5 17 0" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" fill="none" />
      </svg>
      <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.04em', color: light ? '#fff' : 'var(--ink)' }}>
        모두의 <span style={{ color: 'var(--primary)' }}>물건</span>
      </span>
    </Link>
  )
}

const Icon = {
  search: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="11" cy="11" r="7.5" /><path d="m20.5 20.5-4.2-4.2" /></svg>,
  user: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="8" r="4.5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>,
  box: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>,
  heart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" /></svg>,
  menu: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 17 17 7M8 7h9v9" /></svg>,
}
export { Icon }

const NAV = [
  { to: '/products', label: '빌리기' },
  { to: '/ai', label: 'AI 살림 상담' },
  { to: '/sell', label: '팔기' },
  { to: '/school', label: '학생 혜택' },
  { to: '/guide', label: '가전 가이드' },
]

export function Header() {
  const { user, cart } = useStore()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  return (
    <>
      <div className="announce">성북구 전용 생활가전 렌탈 · 주 2회 지정일 배송 · 학교 인증하면 첫 달 50%</div>
      <header className="header">
        <div className="header-in">
          <button className="menu-btn" aria-label="메뉴" onClick={() => setOpen(!open)}>{Icon.menu}</button>
          <nav className="nav">
            {NAV.map((n) => <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>{n.label}</NavLink>)}
          </nav>
          <Logo />
          <div className="hicons">
            <Link to="/products" aria-label="검색">{Icon.search}</Link>
            <Link to={user ? '/my' : `/login?next=${encodeURIComponent(loc.pathname)}`} aria-label={user ? '내 정보' : '로그인 · 회원가입'} className="row gap-4">
              {Icon.user}
              <span style={{ fontSize: 13, fontWeight: 600 }} className="hide-sm">{user ? user.name : '로그인'}</span>
            </Link>
            <Link to="/checkout" aria-label="꾸러미" className="row">{Icon.box}<span className="cart-count">{cart.length}</span></Link>
          </div>
        </div>
        {open && (
          <div className="mobile-nav" onClick={() => setOpen(false)}>
            {NAV.map((n) => <Link key={n.to} to={n.to}>{n.label}</Link>)}
            <Link to="/my">내 렌탈</Link>
            <Link to="/admin">운영자</Link>
          </div>
        )}
      </header>
    </>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="news">
        <div className="stack gap-4">
          <span className="eyebrow" style={{ color: 'var(--ink-2)' }}>Neighbors first</span>
          <b style={{ fontSize: 20 }}>새로 들어온 가전과 동네 혜택을 먼저 받아보세요</b>
        </div>
        <div className="row" style={{ border: '1px solid var(--ink)', background: '#fff', minWidth: 'min(420px,100%)' }}>
          <input className="input" style={{ border: 0 }} placeholder="휴대폰 번호 또는 이메일" aria-label="소식 받을 연락처" />
          <button className="btn" style={{ margin: 4 }}>소식 받기</button>
        </div>
      </div>
      <div className="cols">
        <div className="stack gap-12">
          <Logo light />
          <p style={{ color: '#bfb8b0', fontSize: 14 }}>{BRAND.tagline}.<br />떠날 땐 렌디에 팔고 가는 성북구 살림</p>
        </div>
        <div><p className="eyebrow" style={{ color: 'var(--ink-3)' }}>Service</p><Link to="/products">빌리기</Link><Link to="/ai">AI 살림 상담</Link><Link to="/sell">팔기</Link><Link to="/guide">가전 가이드</Link></div>
        <div><p className="eyebrow" style={{ color: 'var(--ink-3)' }}>Support</p><Link to="/">자주 묻는 질문</Link><Link to="/admin">운영자 화면</Link></div>
        <div><p className="eyebrow" style={{ color: 'var(--ink-3)' }}>Policy</p><Link to="/">이용약관</Link><Link to="/">개인정보처리방침</Link><Link to="/">파손 케어 안내</Link></div>
      </div>
      <div className="wm">{BRAND.en || BRAND.name}</div>
      <div className="copy"><span>© 2026 {BRAND.name}</span></div>
    </footer>
  )
}

/** 상품 그림: 사진이 있으면 사진(i번째), 없거나 와이어프레임 모드면 일러스트 */
export function ProductArt({ p, size, i = 0 }: { p: Product; size?: number; i?: number }) {
  const ph = p.photos?.[i] ?? p.photos?.[0]
  if (!ph || WIREFRAME) return <Illust k={p.illust} size={size} />
  return <img className={`ill photo ${ph.fit}`} src={ph.src} alt={p.name} width={size} height={size} loading="lazy" />
}

export function ProductCard({ p }: { p: Product }) {
  const sold = p.stock === 0
  return (
    <Link to={`/products/${p.id}`} className="pcard">
      <div className="ph" style={{ background: p.bg }}>
        <span className={`badge ${sold ? 'solid' : 'soft'}`}>{sold ? `품절 · 대기 ${p.waitlist}명` : p.source}</span>
        <span className="heart" aria-hidden>{Icon.heart}</span>
        <ProductArt p={p} />
      </div>
      <div className="nm">{p.name}</div>
      <div className="pr">월 {won(lowest(p))}~</div>
      <div className="mt">{p.monthly.value ? '2개월부터 · 일반형 / 실속형' : '2개월부터 · 일반형'}</div>
      <div className="mt">★ {p.rating.toFixed(1)} · 리뷰 {p.reviewCount}</div>
    </Link>
  )
}

// oneLine: 좁은 화면에서도 줄바꿈 없이 한 줄 (글자 크기를 화면 폭에 맞춰 줄임)
export function SectionHead({ en, title, right, oneLine }: { en: string; title: string; right?: ReactNode; oneLine?: boolean }) {
  return (
    <div className="row between gap-16 wrap-row" style={{ alignItems: 'flex-end', marginBottom: 28 }}>
      <div className="stack gap-8">
        <span className="eyebrow">{en}</span>
        <h2 className="serif" style={oneLine ? { fontSize: 'clamp(18px, 5.2vw, 36px)', whiteSpace: 'nowrap' } : { fontSize: 'clamp(26px, 3.4vw, 36px)' }}>{title}</h2>
      </div>
      {right}
    </div>
  )
}

export function FloatingAI() {
  // 3D 보기 화면에서는 뷰어 도구 막대를 가려서 숨김
  const { pathname } = useLocation()
  if (pathname.endsWith('/3d')) return null
  return <Link to="/ai" className="floating-ai"><i />AI 살림 상담</Link>
}

export function Toast({ msg }: { msg: string }) {
  return msg ? <div className="toast" role="status">{msg}</div> : null
}

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

export function Bar({ pct, orange }: { pct: number; orange?: boolean }) {
  return <div className={`bar ${orange ? 'orange' : ''}`}><span style={{ width: `${Math.min(100, pct)}%` }} /></div>
}
