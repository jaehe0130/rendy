// 프로토타입용 고정 데이터. 숫자는 비즈니스 모델 개정 6 기준.

export type IllustKey = 'dehumidifier' | 'dryer' | 'humidifier' | 'foodwaste' | 'standbyme' | 'vacuum' | 'box'
export type Category = 'seasonal' | 'laundry' | 'air' | 'kitchen'

export interface Product {
  id: string
  name: string
  model: string
  category: Category
  illust: IllustKey
  bg: string
  newPrice: number
  monthly: { standard: number; value: number | null } // 일반형 / 실속형(일반형 −5,000원, 없으면 null)
  shortFirst?: number // 4개월 미만이면 첫 달 요금 (음식물 처리기: 새 필터)
  bought: { standard: string; value: string } // 대표 기기 매입 연월 (YYYY.MM), 일반형 3년 이내 · 실속형 3년 넘음
  weekly?: { w1: number; w2: number } // 1주 단기 (고가 소형만)
  stock: number
  waitlist: number
  source: string
  consumable: string
  specs: [string, string][]
  reasons: [string, number][]
  review: { good: string; bad: string; who: string; quote: string; who2: string }
  rating: number
  reviewCount: number
  minMonths: number
}

export const CATEGORIES: { key: Category; en: string; name: string; illust: IllustKey; bg: string }[] = [
  { key: 'seasonal', en: 'Seasonal', name: '계절 가전', illust: 'dehumidifier', bg: 'var(--sky)' },
  { key: 'laundry', en: 'Laundry', name: '세탁 · 건조', illust: 'dryer', bg: 'var(--peach)' },
  { key: 'air', en: 'Humidity', name: '가습 · 공기', illust: 'humidifier', bg: 'var(--mint)' },
  { key: 'kitchen', en: 'Kitchen', name: '주방 가전', illust: 'foodwaste', bg: 'var(--butter)' },
]

export const PRODUCTS: Product[] = [
  {
    id: 'dehumidifier-10',
    name: '제습기 10L',
    model: 'Dehumidifier 10L',
    category: 'seasonal',
    illust: 'dehumidifier',
    bg: 'var(--sky)',
    newPrice: 377000,
    monthly: { standard: 15000, value: 10000 },
    bought: { standard: '2025.04', value: '2022.06' },
    stock: 3,
    waitlist: 0,
    source: '중고 매입',
    consumable: '물통 필터 · 2개월마다 교체',
    specs: [['방 크기', '원룸 5~8평'], ['물통', '2.2L · 분리 세척'], ['한 달 전기요금', '약 4,000원'], ['최근 정비', '2026.10.28 · 필터 교체']],
    reasons: [['실내에 빨래 말리면 냄새나요', 42], ['반지하·1층이라 곰팡이가 펴요', 27], ['장마철 3~4개월만 필요해요', 19], ['이사 갈 때 들고 가기 싫어요', 12]],
    review: { good: '빨래가 하루 만에 마름 · 소음 적음', bad: '물통 2.2L라 하루 한 번 비워야 함', who: '원룸 · 장마철 3~4개월 · 실내 건조', quote: '장마 4개월만 빌렸는데 살 뻔한 돈 30만 원 아꼈어요', who2: '돈암동 · 자취 2년차' },
    rating: 4.9,
    reviewCount: 24,
    minMonths: 2,
  },
  {
    id: 'dehumidifier-16',
    name: '제습기 16L',
    model: 'Dehumidifier 16L',
    category: 'seasonal',
    illust: 'dehumidifier',
    bg: 'var(--sky)',
    newPrice: 459000,
    monthly: { standard: 19000, value: 14000 },
    bought: { standard: '2026.05', value: '2023.03' },
    stock: 0,
    waitlist: 12,
    source: '새 제품',
    consumable: '물통 필터 · 2개월마다 교체',
    specs: [['방 크기', '투룸 이상'], ['물통', '3.5L'], ['한 달 전기요금', '약 6,500원'], ['최근 정비', '—']],
    reasons: [['투룸 이상이라 10L로 부족해요', 38], ['장마철 결로가 심해요', 34], ['빨래 양이 많아요', 28]],
    review: { good: '넓은 방도 금방 보송해짐', bad: '조금 무겁고 소음이 있음', who: '투룸 · 셰어하우스', quote: '둘이 사는 집이라 16L가 딱 맞았어요', who2: '안암동 · 셰어하우스' },
    rating: 4.8,
    reviewCount: 11,
    minMonths: 2,
  },
  {
    id: 'mini-dryer',
    name: '미니 건조기',
    model: 'Mini Dryer 3kg',
    category: 'laundry',
    illust: 'dryer',
    bg: 'var(--peach)',
    newPrice: 499000,
    monthly: { standard: 20000, value: 15000 },
    bought: { standard: '2025.09', value: '2023.01' },
    stock: 5,
    waitlist: 0,
    source: '새 제품',
    consumable: '먼지 필터 · 소모품 포함',
    specs: [['용량', '3kg (수건 6장)'], ['건조 시간', '약 2시간'], ['한 달 전기요금', '약 5,000원'], ['최근 정비', '2026.10.30 · 필터 세척']],
    reasons: [['원룸에 빨래 널 데가 없어요', 46], ['겨울에 빨래가 안 말라요', 31], ['코인세탁소 가기 귀찮아요', 23]],
    review: { good: '수건이 호텔처럼 뽀송 · 방이 넓어짐', bad: '한 번에 많이는 못 돌림', who: '1인 가구 · 원룸 · 실내 건조', quote: '건조대 치우니까 방이 두 배로 넓어졌어요', who2: '정릉동 · 대학원생' },
    rating: 4.9,
    reviewCount: 31,
    minMonths: 2,
  },
  {
    id: 'humidifier',
    name: '가습기 3L',
    model: 'Humidifier 3L',
    category: 'air',
    illust: 'humidifier',
    bg: 'var(--mint)',
    newPrice: 305000,
    monthly: { standard: 15000, value: null },
    bought: { standard: '2024.11', value: '2022.10' },
    stock: 4,
    waitlist: 0,
    source: '중고 매입',
    consumable: '필터 · 소모품 포함',
    specs: [['용량', '3L · 12시간'], ['방식', '초음파 · 세척 쉬움'], ['한 달 전기요금', '약 1,500원'], ['최근 정비', '2026.10.25 · 살균 세척']],
    reasons: [['겨울에 목이 따가워요', 44], ['난방 때문에 너무 건조해요', 36], ['겨울 4개월만 필요해요', 20]],
    review: { good: '아침에 목이 안 아픔 · 조용함', bad: '이틀에 한 번 물 보충', who: '겨울 · 원룸 · 난방 많이 쓰는 집', quote: '겨울 한 철만 빌리니까 보관 걱정이 없어요', who2: '돈암동 · 직장인' },
    rating: 4.7,
    reviewCount: 18,
    minMonths: 2,
  },
  {
    id: 'foodwaste',
    name: '음식물 처리기',
    model: 'Food Waste Dryer 2L',
    category: 'kitchen',
    illust: 'foodwaste',
    bg: 'var(--butter)',
    newPrice: 329000,
    monthly: { standard: 15000, value: null },
    shortFirst: 20000,
    bought: { standard: '2026.02', value: '2023.05' },
    stock: 2,
    waitlist: 0,
    source: '새 제품',
    consumable: '탈취 필터 · 소모품 포함',
    specs: [['용량', '2L'], ['방식', '건조 분쇄'], ['한 달 전기요금', '약 3,000원'], ['최근 정비', '2026.10.29 · 필터 교체']],
    reasons: [['여름에 음식물 냄새가 심해요', 48], ['음식물 쓰레기 버리러 나가기 귀찮아요', 32], ['초파리가 생겨요', 20]],
    review: { good: '냄새·초파리 사라짐', bad: '한 번 돌리면 시간이 걸림', who: '요리 자주 하는 1인 가구', quote: '여름 석 달만 써봤는데 이제 없으면 못 살겠어요', who2: '길음동 · 자취 3년차' },
    rating: 4.6,
    reviewCount: 9,
    minMonths: 2,
  },
]

export const SCHOOLS: { name: string; domain: string; count: number }[] = [
  { name: '성신여대', domain: 'sungshin.ac.kr', count: 212 },
  { name: '고려대', domain: 'korea.ac.kr', count: 168 },
  { name: '국민대', domain: 'kookmin.ac.kr', count: 141 },
  { name: '한성대', domain: 'hansung.ac.kr', count: 97 },
  { name: '동덕여대', domain: 'dongduk.ac.kr', count: 63 },
  { name: '서경대', domain: 'skuniv.ac.kr', count: 41 },
  { name: 'KC대', domain: 'kcu.ac.kr', count: 22 },
]

export const PRICING = {
  delivery: 10000, // 주 2회 지정일 배송·회수 (한 번 결제 월 렌탈료 합계 3만원 미만)
  freeOver: 30000, // 이 금액 이상이면 배송·회수 무료
  express: 10000, // 지정일 외 급행 배송
  firstMonthCouponMax: 10000,
  inviteCoupon: 5000,
}

// 중고 매입(바이백) — 기능명세서 v3.2 부록 A · C-9
export const BUYBACK = {
  rate1y: 0.3, // 구매 1년 이하: 공식몰가 30%
  rate2y: 0.25, // 1년 초과 2년 이하: 25% (2년 넘으면 매입 안 함)
  memberBonus: 0.05, // 렌디에서 빌려 쓴 적 있는 회원 +5%p
}

export const won = (n: number) => n.toLocaleString('ko-KR') + '원'

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)
// 매입 연월부터 오늘까지 사용 기간 (예: '2025.04' → '1년 7개월')
export function usedFor(ym: string) {
  const [y, m] = ym.split('.').map(Number)
  const now = new Date()
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m)
  const yy = Math.floor(months / 12), mm = months % 12
  return [yy && `${yy}년`, mm && `${mm}개월`].filter(Boolean).join(' ') || '1개월 미만'
}

// 실속형이 없는 품목은 일반형으로
export const gradeFor = (p: Product, g: 'standard' | 'value') => (g === 'value' && p.monthly.value == null ? 'standard' : g)
export const priceOf = (p: Product, g: 'standard' | 'value') => (gradeFor(p, g) === 'value' ? p.monthly.value! : p.monthly.standard)
export const lowest = (p: Product) => p.monthly.value ?? p.monthly.standard
// 첫 달 요금: 음식물 처리기는 4개월 미만이면 새 필터 요금
export const firstMonth = (p: Product, g: 'standard' | 'value', months: number) => (p.shortFirst && months < 4 ? p.shortFirst : priceOf(p, g))
export const deliveryFee = (monthlySum: number) => (monthlySum >= PRICING.freeOver ? 0 : PRICING.delivery)

// 파손 보장 단계 (렌터카 자차처럼) — 기기 1대당 월 요금. 기능명세서 부록 A · C-7 (★ BM 확인 전)
export type PlanKey = 'basic' | 'safe' | 'full'
export const PLANS: { key: PlanKey; name: string; fee: number; pay: string; desc: string }[] = [
  { key: 'basic', name: '기본', fee: 0, pay: '수리비 실비', desc: '과실 파손 시 수리비 실비 (잔존가치 한도)' },
  { key: 'safe', name: '안심', fee: 1000, pay: '최대 1만 원', desc: '과실 파손 자기부담 최대 1만 원' },
  { key: 'full', name: '완전 안심', fee: 2000, pay: '0원', desc: '과실 파손 0원 (렌탈당 1회) · 분실 잔존가치 50%' },
]
export const planOf = (k: PlanKey | undefined) => PLANS.find((x) => x.key === k) ?? PLANS[0]
