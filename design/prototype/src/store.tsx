import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { priceOf, productById, SCHOOLS, type PlanKey } from './data'

export type Grade = 'standard' | 'value'
export interface CartItem { key: string; productId: string; mode: 'long' | 'short'; grade: Grade; months: number; weeks: number; plan: PlanKey }
export interface Rental { id: string; productId: string; mode: 'long' | 'short'; grade: Grade; start: string; end: string; price: number; plan: PlanKey; status: '사용 중' | '반납 신청' | '회수 완료' }
export interface Coupon { id: string; kind: 'firstMonth' | 'doorFree' | 'invite' | 'extend'; title: string; desc: string; used: boolean }
export interface SellCase { id: string; kind: '팔기'; item: string; amount: string; status: string; date: string }
export interface User { name: string; phone: string; school?: string; inviteCode?: string }

interface State {
  user: User | null
  coupons: Coupon[]
  cart: CartItem[]
  rentals: Rental[]
  waitlist: string[]
  sells: SellCase[]
  schoolCounts: Record<string, number>
}

const today = new Date()
const iso = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000)
export const addMonths = (d: Date, n: number) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return addDays(x, -1) }

const seed: State = {
  user: null,
  coupons: [],
  cart: [],
  rentals: [
    { id: 'R-20260701-0012', productId: 'dehumidifier-10', mode: 'long', grade: 'standard', start: iso(addDays(today, -100)), end: iso(addDays(today, 12)), price: 15000, plan: 'full', status: '사용 중' },
    { id: 'R-20261103-0031', productId: 'mini-dryer', mode: 'long', grade: 'value', start: iso(addDays(today, -10)), end: iso(addDays(today, 110)), price: 15000, plan: 'basic', status: '사용 중' },
  ],
  waitlist: [],
  sells: [],
  schoolCounts: Object.fromEntries(SCHOOLS.map((s) => [s.name, s.count])),
}

const KEY = 'modu-proto-v1'
// 항상 로그인 · 학교 인증된 데모 회원으로 시작 (해커톤 시연: 로그인 화면 없음). 장바구니는 비워 두고 심사위원이 직접 고른 것만 담김
function demoState(): State {
  return {
    ...seed,
    user: { name: '김성북', phone: '010-1234-5678', school: '성신여대', inviteCode: 'SS-K7Q2' },
    coupons: [
      { id: 'c-first', kind: 'firstMonth', title: '첫 렌탈 첫 달 50%', desc: '최대 1만 원 · 30일 안에 사용', used: false },
      { id: 'c-door', kind: 'doorFree', title: '배송비 1회 무료', desc: '1만원 → 0원', used: false },
    ],
    cart: [],
    waitlist: [],
    sells: [],
    schoolCounts: { ...seed.schoolCounts, 성신여대: (seed.schoolCounts['성신여대'] ?? 0) + 1 },
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    // 이 브라우저에 기록(데모 회원)이 있으면 그대로 이어서 씀. 회원 정보가 없는 예전 기록은 새 데모 회원으로
    if (raw && JSON.parse(raw).user) {
      const s = { ...seed, ...JSON.parse(raw) }
      // 예전 데이터(care: true/false)를 보장 단계로 바꿈
      const fix = <T extends { plan?: PlanKey; care?: boolean }>(x: T) => ({ ...x, plan: x.plan ?? (x.care ? 'full' : 'basic') })
      // v3.2에서 위탁(맡기기)과 위탁 전용 품목을 뺐으므로 예전 저장 데이터에서 걸러냄
      const known = (x: { productId: string }) => !!productById(x.productId)
      return { ...s, cart: s.cart.map(fix).filter(known), rentals: s.rentals.map(fix).filter(known), waitlist: s.waitlist.filter((id: string) => !!productById(id)), sells: s.sells.filter((x: SellCase) => x.kind === '팔기') }
    }
  } catch { /* 저장소를 못 쓰면 기본값 */ }
  return demoState()
}

interface Ctx extends State {
  login: (name: string, phone: string) => void
  logout: () => void
  verifySchool: (school: string, invite?: string) => void
  addToCart: (item: Omit<CartItem, 'key'>) => void
  removeFromCart: (key: string) => void
  checkout: (start: string, couponIds: string[]) => string[]
  joinWaitlist: (productId: string) => void
  extendRental: (id: string, months: number) => void
  requestReturn: (id: string) => void
  addSell: (c: Omit<SellCase, 'id' | 'date'>) => void
  reset: () => void
}

const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* 무시 */ } }, [s])

  const ctx: Ctx = {
    ...s,
    login: (name, phone) => setS((p) => ({ ...p, user: { ...(p.user ?? {}), name, phone } })),
    logout: () => setS((p) => ({ ...p, user: null })),
    verifySchool: (school, invite) =>
      setS((p) => {
        if (p.user?.school) return p
        const code = school.slice(0, 2).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
        const coupons: Coupon[] = [
          { id: 'c-first', kind: 'firstMonth', title: '첫 렌탈 첫 달 50%', desc: '최대 1만 원 · 30일 안에 사용', used: false },
          { id: 'c-door', kind: 'doorFree', title: '배송비 1회 무료', desc: '1만원 → 0원', used: false },
        ]
        if (invite) coupons.push({ id: 'c-invite', kind: 'invite', title: '친구 초대 5,000원', desc: `초대 코드 ${invite}`, used: false })
        return { ...p, user: { ...(p.user ?? { name: '김성북', phone: '' }), school, inviteCode: code }, coupons: [...p.coupons, ...coupons], schoolCounts: { ...p.schoolCounts, [school]: (p.schoolCounts[school] ?? 0) + 1 } }
      }),
    addToCart: (item) => setS((p) => ({ ...p, cart: [...p.cart, { ...item, key: Math.random().toString(36).slice(2) }] })),
    removeFromCart: (key) => setS((p) => ({ ...p, cart: p.cart.filter((c) => c.key !== key) })),
    checkout: (start, couponIds) => {
      const d0 = new Date(start)
      const rentals: Rental[] = s.cart.map((c, i) => {
        const prod = productById(c.productId)!
        const id = `R-${start.replace(/-/g, '')}-${String(Math.floor(Math.random() * 9000) + 1000)}${i}`
        const end = c.mode === 'long' ? addMonths(d0, c.months) : addDays(d0, c.weeks * 7 - 1)
        const price = c.mode === 'long' ? priceOf(prod, c.grade) : c.weeks === 1 ? prod.weekly!.w1 : prod.weekly!.w2
        return { id, productId: c.productId, mode: c.mode, grade: c.grade, start, end: iso(end), price, plan: c.plan, status: '사용 중' }
      })
      setS((p) => ({ ...p, cart: [], rentals: [...rentals, ...p.rentals], coupons: p.coupons.map((c) => (couponIds.includes(c.id) ? { ...c, used: true } : c)) }))
      return rentals.map((r) => r.id)
    },
    joinWaitlist: (productId) => setS((p) => ({ ...p, waitlist: p.waitlist.includes(productId) ? p.waitlist : [...p.waitlist, productId] })),
    // 1개월 단위 연장
    extendRental: (id, months) => setS((p) => ({ ...p, rentals: p.rentals.map((r) => (r.id === id ? { ...r, end: iso(addMonths(addDays(new Date(r.end), 1), months)) } : r)) })),
    requestReturn: (id) => setS((p) => ({ ...p, rentals: p.rentals.map((r) => (r.id === id ? { ...r, status: '반납 신청' } : r)) })),
    addSell: (c) => setS((p) => ({ ...p, sells: [{ ...c, id: 'S-' + Date.now(), date: iso(new Date()) }, ...p.sells] })),
    // 처음부터 다시: 데모 회원 상태로 (장바구니 · 신청 기록 비움)
    reset: () => setS(demoState()),
  }
  return <StoreCtx.Provider value={ctx}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('StoreProvider 밖에서 useStore를 썼습니다')
  return c
}

export const dday = (end: string) => Math.ceil((new Date(end).getTime() - new Date(iso(new Date())).getTime()) / 86400000)
export { iso, addDays }
