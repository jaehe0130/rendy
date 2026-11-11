// 내 방에 놓아 보기 — three.js로 만든 방(디오라마)에 렌디 가전 GLB를 실제 크기(cm)로 올려 보고 끌어서 옮긴다
// 방은 코드로 만듦(가볍고 크기를 바꿀 수 있게): 바닥 x 0~W, 깊이 z 0~D, 왼쪽 벽 x=0, 뒷벽 z=0, 1 = 1m
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { PRODUCTS, bundleSaving, gradeFor, lowest, productById, won } from '../data'
import { useStore } from '../store'

// 방 크기 (원룸 방 부분만, 부엌·욕실 제외 대략값)
const ROOMS = [
  { key: 's', label: '원룸 5평', w: 3.0, d: 3.3 },
  { key: 'm', label: '원룸 6~8평', w: 3.6, d: 4.2 },
] as const
type RoomKey = (typeof ROOMS)[number]['key']
const WALL_H = 2.3

// 방 전체(바닥 · 벽)가 화면에 들어오는 카메라 거리: 방을 감싸는 구의 반지름 ÷ sin(좁은 쪽 시야각의 절반)
function fitDistance(cam: THREE.PerspectiveCamera, W: number, D: number) {
  const r = Math.sqrt(W * W + D * D + WALL_H * WALL_H) / 2
  const v = THREE.MathUtils.degToRad(cam.fov) / 2
  const h = Math.atan(Math.tan(v) * cam.aspect)
  return (r / Math.sin(Math.min(v, h))) * 0.98
}

// 가전 실제 크기 (가로 · 깊이 · 높이 cm). 제습기 10L은 실측(data.ts), 나머지는 대표 모델 기준 대략값
const SIZE: Record<string, [number, number, number]> = {
  'dehumidifier-10': [30, 20, 48],
  'dehumidifier-16': [34, 26, 58],
  'mini-dryer': [45, 30, 50],
  humidifier: [22, 22, 32],
  foodwaste: [27, 29, 38],
}
// 처음 놓는 자리 (방 크기에 대한 비율이 아니라 m, 가구와 안 겹치게)
const SPOTS = (W: number, D: number): [number, number][] => [[0.35, 0.3], [W - 0.45, D - 0.55], [1.55, 0.35], [W - 0.4, 1.5], [1.7, D - 0.5]]

// 나무 바닥 무늬 (캔버스로 그림)
function woodTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512
  const g = c.getContext('2d')!
  const rows = 8
  for (let i = 0; i < rows; i++) {
    const y = (i * 512) / rows
    let x = -Math.random() * 300
    while (x < 512) {
      const len = 220 + Math.random() * 200
      const l = 30 + Math.random() * 9
      g.fillStyle = `hsl(${24 + Math.random() * 6}, ${38 + Math.random() * 10}%, ${l}%)`
      g.fillRect(x, y, len, 512 / rows)
      g.strokeStyle = 'rgba(40,22,10,.35)'; g.lineWidth = 2; g.strokeRect(x, y, len, 512 / rows)
      for (let k = 0; k < 6; k++) { g.strokeStyle = 'rgba(60,30,10,.08)'; g.beginPath(); const yy = y + Math.random() * (512 / rows); g.moveTo(x, yy); g.lineTo(x + len, yy + (Math.random() - 0.5) * 6); g.stroke() }
      x += len
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

const mat = (color: string, rough = 0.9) => new THREE.MeshStandardMaterial({ color, roughness: rough })
function box(w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true
  return o
}

// 방: 받침 · 나무 바닥 · 두 벽 · 걸레받이 · 창문과 커튼 · 침대 · 책상 (크기 비교용)
function buildRoom(W: number, D: number) {
  const g = new THREE.Group()
  const T = 0.12
  const white = mat('#eeeae8'), wall = mat('#d9d2d1')
  g.add(box(W + T + 0.06, 0.1, D + T + 0.06, white, (W - T) / 2 + 0.03, -0.05, (D - T) / 2 + 0.03))
  const wood = woodTexture(); wood.repeat.set(W / 1.6, D / 1.6)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.75 }))
  floor.rotation.x = -Math.PI / 2; floor.position.set(W / 2, 0.001, D / 2); floor.receiveShadow = true; floor.name = 'floor'
  g.add(floor)
  g.add(box(T, WALL_H, D + T, wall, -T / 2, WALL_H / 2, (D - T) / 2)) // 왼쪽 벽
  g.add(box(W, WALL_H, T, wall, W / 2, WALL_H / 2, -T / 2)) // 뒷벽
  g.add(box(0.015, 0.08, D, white, 0.008, 0.04, D / 2)) // 걸레받이
  g.add(box(W, 0.08, 0.015, white, W / 2, 0.04, 0.008))
  // 창문 (뒷벽)
  const wx = W * 0.62, ww = 1.1, wy = 1.35, wh = 1.2
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshStandardMaterial({ color: '#dbeaf2', emissive: '#f4f8fb', emissiveIntensity: 0.7 }))
  glass.position.set(wx, wy, 0.002); g.add(glass)
  const frame = mat('#ffffff', 0.6)
  for (const [w, h, x, y] of [[ww + 0.08, 0.05, wx, wy + wh / 2], [ww + 0.08, 0.05, wx, wy - wh / 2], [0.05, wh, wx - ww / 2, wy], [0.05, wh, wx + ww / 2, wy], [0.03, wh, wx, wy]] as const) g.add(box(w, h, 0.05, frame, x, y, 0.025))
  g.add(box(ww + 0.5, 0.025, 0.025, mat('#2b2b2b', 0.4), wx, wy + wh / 2 + 0.18, 0.12)) // 커튼 봉
  const cloth = new THREE.MeshStandardMaterial({ color: '#fbfaf8', roughness: 1, transparent: true, opacity: 0.92 })
  for (const side of [-1, 1]) for (let i = 0; i < 5; i++) g.add(box(0.05, wh + 0.45, 0.03, cloth, wx + side * (ww / 2 + 0.05 - i * 0.055), wy - 0.05, 0.1 + (i % 2) * 0.03))
  // 침대 (왼쪽 벽 앞쪽) · 책상 (뒷벽 오른쪽)
  const bz = Math.max(1.0, D - 2.15)
  g.add(box(1.0, 0.28, 2.0, mat('#c9b8a6', 0.8), 0.5, 0.14, bz + 1.0))
  g.add(box(0.96, 0.18, 1.96, mat('#ffffff', 1), 0.5, 0.37, bz + 1.0))
  g.add(box(0.98, 0.06, 1.2, mat('#9fd9cc', 1), 0.5, 0.48, bz + 1.35))
  g.add(box(0.6, 0.12, 0.35, mat('#f6f3ee', 1), 0.5, 0.52, bz + 0.25))
  const desk = mat('#d8c3a5', 0.7), dx = W - 0.65
  g.add(box(1.0, 0.04, 0.55, desk, dx, 0.72, 0.3))
  for (const [x, z] of [[-0.46, -0.24], [0.46, -0.24], [-0.46, 0.24], [0.46, 0.24]]) g.add(box(0.04, 0.7, 0.04, desk, dx + x, 0.35, 0.3 + z))
  return g
}

interface Item { id: string; obj: THREE.Group; hw: number; hd: number }

export default function RoomPlanner() {
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const { addToCart } = useStore()
  const [room, setRoom] = useState<RoomKey>(sp.get('room') === 'm' ? 'm' : 's')
  const init = (sp.get('items')?.split(',') ?? ['dehumidifier-10', 'mini-dryer']).filter((id) => SIZE[id] && productById(id))
  const [ids, setIds] = useState<string[]>(init)
  const [sel, setSel] = useState<string | null>(null)
  const [loading, setLoading] = useState(0)
  const wrap = useRef<HTMLDivElement>(null)
  // three 객체는 렌더와 상관없이 ref에 둠
  const T = useRef<{ scene: THREE.Scene; camera: THREE.PerspectiveCamera; controls: OrbitControls; roomG: THREE.Group | null; items: Map<string, Item>; ring: THREE.Mesh; W: number; D: number; loader: GLTFLoader; cache: Map<string, Promise<THREE.Group>> } | null>(null)
  const R = ROOMS.find((r) => r.key === room)!

  // 장면 · 카메라 · 조명 · 끌기
  useEffect(() => {
    const el = wrap.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.9
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const pm = new THREE.PMREMGenerator(renderer)
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.45
    scene.add(new THREE.HemisphereLight('#fff6ee', '#b9a294', 0.45))
    const sun = new THREE.DirectionalLight('#fff1e2', 1.6)
    sun.position.set(5, 7, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048)
    Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 }); sun.shadow.bias = -0.0004
    scene.add(sun, sun.target)
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true; controls.enablePan = false
    // 벽 두 개가 늘 뒤에 오게 각도 제한
    controls.minAzimuthAngle = 0.05; controls.maxAzimuthAngle = Math.PI / 2 - 0.05
    controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.25
    controls.minDistance = 3; controls.maxDistance = 22
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.33, 48), new THREE.MeshBasicMaterial({ color: '#2ec4a6', transparent: true, opacity: 0.9 }))
    ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring)
    const loader = new GLTFLoader()
    T.current = { scene, camera, controls, roomG: null, items: new Map(), ring, W: 3, D: 3, loader, cache: new Map() }

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix()
      // 화면 비율이 바뀌면(휴대폰 · 창 크기) 보는 방향은 그대로 두고 방이 다 들어오게 거리만 다시
      const t = T.current
      if (t?.roomG) { const dir = camera.position.clone().sub(controls.target).normalize(); camera.position.copy(controls.target).addScaledVector(dir, fitDistance(camera, t.W, t.D)); controls.update() }
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(el)

    // 끌어서 옮기기: 가전을 누르면 바닥 위로 끌고, 빈 곳을 누르면 방을 돌림
    const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3()
    let drag: Item | null = null; const off = new THREE.Vector3()
    const setPtr = (e: PointerEvent) => { const r = renderer.domElement.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, camera) }
    const clamp = (it: Item, x: number, z: number) => {
      const t = T.current!
      return [Math.min(t.W - it.hw, Math.max(it.hw, x)), Math.min(t.D - it.hd, Math.max(it.hd, z))]
    }
    const down = (e: PointerEvent) => {
      const t = T.current!; setPtr(e)
      const objs = [...t.items.values()].map((i) => i.obj)
      const h = ray.intersectObjects(objs, true)[0]
      if (!h) return
      let o: THREE.Object3D | null = h.object
      while (o && !objs.includes(o as THREE.Group)) o = o.parent
      drag = [...t.items.values()].find((i) => i.obj === o) ?? null
      if (!drag) return
      controls.enabled = false
      renderer.domElement.setPointerCapture(e.pointerId)
      if (ray.ray.intersectPlane(ground, hit)) off.set(drag.obj.position.x - hit.x, 0, drag.obj.position.z - hit.z)
      setSel(drag.id)
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      setPtr(e)
      if (!ray.ray.intersectPlane(ground, hit)) return
      const [x, z] = clamp(drag, hit.x + off.x, hit.z + off.z)
      drag.obj.position.x = x; drag.obj.position.z = z
    }
    const up = () => { drag = null; controls.enabled = true }
    renderer.domElement.addEventListener('pointerdown', down)
    renderer.domElement.addEventListener('pointermove', move)
    renderer.domElement.addEventListener('pointerup', up)
    renderer.domElement.addEventListener('pointercancel', up)

    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      controls.update()
      const t = T.current!
      const s = sel0.current && t.items.get(sel0.current)
      t.ring.visible = !!s
      if (s) { t.ring.position.set(s.obj.position.x, 0.01, s.obj.position.z); const r = Math.max(s.hw, s.hd) + 0.06; t.ring.scale.setScalar(r / 0.3) }
      renderer.render(scene, camera)
    }
    tick()
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); pm.dispose(); renderer.dispose()
      el.removeChild(renderer.domElement); T.current = null
    }
  }, [])

  // 선택된 가전 (애니메이션 루프에서 읽음)
  const sel0 = useRef<string | null>(null)
  useEffect(() => { sel0.current = sel }, [sel])

  // 방 크기가 바뀌면 방을 다시 만들고 카메라 · 가전 위치를 맞춤
  useEffect(() => {
    const t = T.current!
    if (t.roomG) { t.scene.remove(t.roomG); t.roomG.traverse((o) => { if (o instanceof THREE.Mesh) o.geometry.dispose() }) }
    t.roomG = buildRoom(R.w, R.d); t.W = R.w; t.D = R.d; t.scene.add(t.roomG)
    const c = new THREE.Vector3(R.w / 2, 0.7, R.d / 2)
    t.controls.target.copy(c)
    const dist = fitDistance(t.camera, R.w, R.d)
    t.camera.position.copy(c).add(new THREE.Vector3(0.72, 0.62, 0.72).normalize().multiplyScalar(dist))
    t.controls.update()
    const spots = SPOTS(R.w, R.d)
    ;[...t.items.values()].forEach((it, i) => { const [x, z] = spots[i % spots.length]; it.obj.position.set(Math.min(R.w - it.hw, Math.max(it.hw, x)), 0, Math.min(R.d - it.hd, Math.max(it.hd, z))) })
  }, [R.w, R.d])

  // 고른 가전을 불러와 실제 크기로 놓기 · 뺀 가전은 치우기
  useEffect(() => {
    const t = T.current!
    for (const [id, it] of t.items) if (!ids.includes(id)) { t.scene.remove(it.obj); t.items.delete(id) }
    ids.forEach((id, i) => {
      if (t.items.has(id)) return
      const p = productById(id)!
      if (!t.cache.has(id)) t.cache.set(id, new Promise((ok, fail) => t.loader.load(p.model3d!.src.standard, (g) => ok(g.scene), undefined, fail)))
      setLoading((n) => n + 1)
      t.cache.get(id)!.then((src) => {
        const tt = T.current
        if (!tt || tt.items.has(id)) return
        const [w, d, h] = SIZE[id]
        const model = src.clone(true)
        const b = new THREE.Box3().setFromObject(model), s = new THREE.Vector3(); b.getSize(s)
        model.scale.setScalar(h / 100 / s.y)
        const b2 = new THREE.Box3().setFromObject(model), c = new THREE.Vector3(); b2.getCenter(c)
        model.position.set(-c.x, -b2.min.y, -c.z)
        model.traverse((o) => { if (o instanceof THREE.Mesh) { o.castShadow = true; o.receiveShadow = true } })
        const obj = new THREE.Group(); obj.add(model)
        const it: Item = { id, obj, hw: w / 200, hd: d / 200 }
        const [x, z] = SPOTS(tt.W, tt.D)[i % 5]
        obj.position.set(Math.min(tt.W - it.hw, Math.max(it.hw, x)), 0, Math.min(tt.D - it.hd, Math.max(it.hd, z)))
        tt.scene.add(obj); tt.items.set(id, it)
      }).catch(() => {}).finally(() => setLoading((n) => n - 1))
    })
  }, [ids])

  const toggle = (id: string) => { setIds((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id])); setSel(null) }
  const rotate = () => {
    const it = sel && T.current?.items.get(sel)
    if (!it) return
    it.obj.rotation.y += Math.PI / 2; [it.hw, it.hd] = [it.hd, it.hw]
    it.obj.position.x = Math.min(T.current!.W - it.hw, Math.max(it.hw, it.obj.position.x)); it.obj.position.z = Math.min(T.current!.D - it.hd, Math.max(it.hd, it.obj.position.z))
  }
  const list = useMemo(() => ids.map((id) => productById(id)!), [ids])
  const ok = list.filter((p) => p.stock > 0)
  const sum = ok.reduce((a, p) => a + lowest(p), 0)
  const save = bundleSaving(ok.map(lowest)).saved

  return (
    <section className="section bg-surface">
      <div className="stack gap-8" style={{ marginBottom: 20 }}>
        <span className="eyebrow">내 방에 놓아 보기 · 3D</span>
        <h1 className="serif" style={{ fontSize: 'clamp(26px,5vw,40px)' }}>빌리기 전에 내 방에 놓아 보세요</h1>
        <p className="muted">렌디 가전을 실제 크기로 방에 놓아 봤어요. 가전을 끌어서 옮기고, 빈 곳을 끌면 방이 돌아가요.</p>
      </div>
      <div className="room-layout">
        <div className="room-stage" ref={wrap}>
          {loading > 0 && <span className="room-badge">가전 불러오는 중…</span>}
          {sel && <div className="room-tools"><b>{productById(sel)?.name}</b><button className="btn sm line" onClick={rotate}>90° 돌리기</button><button className="btn sm line" onClick={() => toggle(sel)}>빼기</button></div>}
        </div>
        <div className="panel stack gap-16">
          <div className="stack gap-8"><b>방 크기</b>
            <div className="chips">{ROOMS.map((r) => <button key={r.key} className={`chip ${room === r.key ? 'on' : ''}`} onClick={() => setRoom(r.key)}>{r.label} · {r.w}×{r.d}m</button>)}</div>
          </div>
          <div className="stack gap-8"><b>놓아 볼 가전</b>
            <div className="chips">{PRODUCTS.filter((p) => SIZE[p.id] && p.model3d).map((p) => <button key={p.id} className={`chip ${ids.includes(p.id) ? 'on' : ''}`} onClick={() => toggle(p.id)}>{ids.includes(p.id) ? '✓ ' : '+ '}{p.name}</button>)}</div>
          </div>
          <hr className="rule" />
          {list.length === 0 ? <span className="faint">가전을 골라 방에 놓아 보세요.</span> : list.map((p) => (
            <div key={p.id} className="kv"><span>{p.name} <span className="faint" style={{ fontSize: 12 }}>{SIZE[p.id].join('×')}cm</span></span><b>{p.stock > 0 ? `월 ${won(lowest(p))}` : '품절'}</b></div>
          ))}
          {ok.length > 0 && <>
            <div className="kv" style={{ alignItems: 'baseline' }}><span>한 달 합계</span><b className="serif" style={{ fontSize: 24 }}>{won(sum)}</b></div>
            {save > 0 && <div className="bundle-save"><b>꾸러미로 빌리면 {won(save)} 더 싸요</b><span>따로 빌리면 배송·회수 건마다 1만원 → 월 3만원 이상 꾸러미는 0원</span></div>}
            <button className="btn block" onClick={() => { ok.forEach((p) => addToCart({ productId: p.id, mode: 'long', grade: gradeFor(p, 'value'), months: 4, weeks: 1, plan: 'full' })); nav('/checkout') }}>이대로 꾸러미에 담기</button>
          </>}
          <Link to="/products" className="link" style={{ fontSize: 14 }}>가전 자세히 보기 ›</Link>
          <span className="demo-note">방은 원룸 방 부분 기준 예시 크기예요. 가전 크기는 제습기 10L만 실측이고 나머지는 대표 모델 기준 대략값이에요.</span>
        </div>
      </div>
    </section>
  )
}
