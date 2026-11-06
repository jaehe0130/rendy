// 화면 테마
// 'wire'  : 디자인 적용 전 와이어프레임 모습 (회색조 · 기본 글꼴 · 그림 자리 X 상자)
// 'classic': 이전 디자인 v4.1 (모두의 물건 · 주황 + 검정)
// 'rendy' : 렌디(Rendy) 시안 — 클린 민트(깨끗함) + 딥 네이비(신뢰) + 오렌지 포인트(혜택·가격)
export type Theme = 'wire' | 'classic' | 'rendy'
export const THEME = 'rendy' as Theme

export const WIREFRAME = THEME === 'wire'
export const BRAND = THEME === 'rendy' ? { name: '렌디', en: 'Rendy', tagline: '빌리면 바로 쓸 준비 완료' } : { name: '모두의 물건', en: '', tagline: '필요한 가전만 필요한 만큼 구독' }
