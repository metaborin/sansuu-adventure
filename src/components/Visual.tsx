import type { Visual } from '../types'

// ==========================================================================
// 問題の「見た目（イラスト・ブロックなど）」を描くコンポーネント
// visual.kind に あわせて えがきわけます。
// revealed = true のとき（こたえ合わせ後）は、ヒントの ハイライトを 出します。
// ==========================================================================

type Props = {
  visual: Visual
  revealed: boolean
}

export function VisualView({ visual, revealed }: Props) {
  switch (visual.kind) {
    case 'objects':
      return <Objects emoji={visual.emoji} count={visual.count} />
    case 'compare':
      return <Compare left={visual.left} right={visual.right} />
    case 'ordinalRow':
      return (
        <OrdinalRow
          items={visual.items}
          from={visual.from}
          targetIndex={visual.targetIndex}
          revealed={revealed}
        />
      )
    case 'tenAndOnes':
      return <TenAndOnes ones={visual.ones} />
    case 'sequence':
      return <Sequence numbers={visual.numbers} />
    case 'addBlocks':
      return <AddBlocks a={visual.a} b={visual.b} emoji={visual.emoji} />
    case 'subBlocks':
      return <SubBlocks a={visual.a} b={visual.b} emoji={visual.emoji} />
    case 'makeTen':
      return <MakeTen filled={visual.filled} />
    case 'addCarry':
      return <AddCarry a={visual.a} b={visual.b} />
    case 'subBorrow':
      return <SubBorrow a={visual.a} b={visual.b} />
    case 'shapeObject':
      return <div className="shape-object pop">{visual.emoji}</div>
    case 'measure':
      return <Measure variant={visual.variant} left={visual.left} right={visual.right} />
    case 'clock':
      return <Clock hour={visual.hour} minute={visual.minute} />
    case 'pictograph':
      return <Pictograph rows={visual.rows} />
    case 'none':
      return null
  }
}

// --- ステージ1：ものを ならべて かぞえる -----------------------------------
function Objects({ emoji, count }: { emoji: string; count: number }) {
  return (
    <div className="objects">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="obj pop" style={{ animationDelay: `${i * 40}ms` }}>
          {emoji}
        </span>
      ))}
    </div>
  )
}

// --- ステージ2：2つの グループを くらべる（1対1で ならべる）-----------------
function Compare({ left, right }: { left: { emoji: string; count: number }; right: { emoji: string; count: number } }) {
  return (
    <div className="compare">
      <div className="compare-col">
        <div className="compare-label">ひだり</div>
        <div className="compare-stack">
          {Array.from({ length: left.count }).map((_, i) => (
            <span key={i} className="obj pop" style={{ animationDelay: `${i * 60}ms` }}>{left.emoji}</span>
          ))}
        </div>
      </div>
      <div className="compare-divider" />
      <div className="compare-col">
        <div className="compare-label">みぎ</div>
        <div className="compare-stack">
          {Array.from({ length: right.count }).map((_, i) => (
            <span key={i} className="obj pop" style={{ animationDelay: `${i * 60}ms` }}>{right.emoji}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- ステージ3：よこ ならびの じゅんばん ------------------------------------
function OrdinalRow({
  items,
  from,
  targetIndex,
  revealed,
}: {
  items: string[]
  from: 'front' | 'back'
  targetIndex: number
  revealed: boolean
}) {
  return (
    <div className="ordinal">
      <div className="ordinal-ends">
        <span>{from === 'front' ? '👈 まえ' : 'まえ'}</span>
        <span>{from === 'back' ? 'うしろ 👉' : 'うしろ'}</span>
      </div>
      <div className="ordinal-row">
        {items.map((it, i) => (
          <span
            key={i}
            className={`obj ordinal-item pop ${revealed && i === targetIndex ? 'target' : ''}`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  )
}

// --- ブロック（ドット）を 10のわく に ならべる ------------------------------
type CellState = 'blue' | 'green' | 'empty' | 'take'

function TenFrame({ cells }: { cells: CellState[] }) {
  const padded: CellState[] = [...cells]
  while (padded.length < 10) padded.push('empty')
  return (
    <div className="tenframe">
      {padded.slice(0, 10).map((c, i) => (
        <div key={i} className={`cell cell-${c} pop`} style={{ animationDelay: `${i * 35}ms` }}>
          {c === 'take' ? '✕' : ''}
        </div>
      ))}
    </div>
  )
}

// --- ステージ4：10と いくつ -------------------------------------------------
function TenAndOnes({ ones }: { ones: number }) {
  return (
    <div className="blocks-row">
      <div className="group">
        <TenFrame cells={Array(10).fill('blue')} />
        <div className="group-cap">10</div>
      </div>
      <div className="plus">と</div>
      <div className="group">
        <div className="ones">
          {Array.from({ length: ones }).map((_, i) => (
            <div key={i} className="cell cell-green pop" style={{ animationDelay: `${i * 45}ms` }} />
          ))}
        </div>
        <div className="group-cap">{ones}</div>
      </div>
    </div>
  )
}

// --- ステージ5：かずの ならび ------------------------------------------------
function Sequence({ numbers }: { numbers: (number | null)[] }) {
  return (
    <div className="sequence">
      {numbers.map((n, i) => (
        <div
          key={i}
          className={`seq-box pop ${n === null ? 'seq-blank' : ''}`}
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {n === null ? '?' : n}
        </div>
      ))}
    </div>
  )
}

// --- ステージ6：たしざん（え）----------------------------------------------
function AddBlocks({ a, b, emoji }: { a: number; b: number; emoji: string }) {
  return (
    <div className="blocks-row">
      <div className="dish">
        {Array.from({ length: a }).map((_, i) => (
          <span key={i} className="obj sm pop" style={{ animationDelay: `${i * 50}ms` }}>{emoji}</span>
        ))}
      </div>
      <div className="plus">＋</div>
      <div className="dish">
        {Array.from({ length: b }).map((_, i) => (
          <span key={i} className="obj sm pop" style={{ animationDelay: `${(a + i) * 50}ms` }}>{emoji}</span>
        ))}
      </div>
    </div>
  )
}

// --- ステージ7：ひきざん（え。とった ぶんは ✕）------------------------------
function SubBlocks({ a, b, emoji }: { a: number; b: number; emoji: string }) {
  return (
    <div className="dish wide">
      {Array.from({ length: a }).map((_, i) => (
        <span key={i} className={`obj sm pop ${i >= a - b ? 'gone' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
          {emoji}
        </span>
      ))}
    </div>
  )
}

// --- ステージ8：10を つくろう ------------------------------------------------
function MakeTen({ filled }: { filled: number }) {
  const cells: CellState[] = Array.from({ length: 10 }, (_, i) => (i < filled ? 'blue' : 'empty'))
  return (
    <div className="group">
      <TenFrame cells={cells} />
      <div className="group-cap">いま {filled}こ</div>
    </div>
  )
}

// --- ステージ9：くりあがり たしざん（10を つくる）--------------------------
function AddCarry({ a, b }: { a: number; b: number }) {
  const need = 10 - a
  const rest = b - need
  const frame1: CellState[] = [
    ...Array(a).fill('blue' as CellState),
    ...Array(need).fill('green' as CellState),
  ]
  const frame2: CellState[] = Array(rest).fill('green' as CellState)
  return (
    <div className="blocks-row">
      <div className="group">
        <TenFrame cells={frame1} />
        <div className="group-cap">10</div>
      </div>
      <div className="plus">と</div>
      <div className="group">
        <TenFrame cells={frame2} />
        <div className="group-cap">{rest}</div>
      </div>
    </div>
  )
}

// --- ステージ10：くりさがり ひきざん（10から ひく）------------------------
function SubBorrow({ a, b }: { a: number; b: number }) {
  const onesA = a - 10
  // 10のまとまりから b を とる（さきに ✕）、のこりは blue
  const ten: CellState[] = [
    ...Array(b).fill('take' as CellState),
    ...Array(10 - b).fill('blue' as CellState),
  ]
  return (
    <div className="blocks-row">
      <div className="group">
        <TenFrame cells={ten} />
        <div className="group-cap">10から {b}を とる</div>
      </div>
      <div className="plus">と</div>
      <div className="group">
        <div className="ones">
          {Array.from({ length: onesA }).map((_, i) => (
            <div key={i} className="cell cell-blue pop" style={{ animationDelay: `${i * 45}ms` }} />
          ))}
        </div>
        <div className="group-cap">{onesA}</div>
      </div>
    </div>
  )
}

// --- ステージ12：ながさ・ひろさ・かさ --------------------------------------
function Measure({ variant, left, right }: { variant: 'length' | 'area' | 'volume'; left: number; right: number }) {
  const sizeToPct = (v: number) => 30 + v * 22 // 1→52%, 2→74%, 3→96%

  if (variant === 'length') {
    return (
      <div className="measure-col">
        {[left, right].map((v, i) => (
          <div key={i} className="measure-line">
            <div className="pencil" style={{ width: `${sizeToPct(v)}%` }}>✏️</div>
            <span className="measure-tag">{i === 0 ? 'ひだり' : 'みぎ'}</span>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'area') {
    return (
      <div className="measure-pair">
        {[left, right].map((v, i) => (
          <div key={i} className="measure-item">
            <div className="rug" style={{ width: `${40 + v * 22}px`, height: `${40 + v * 22}px` }} />
            <span className="measure-tag">{i === 0 ? 'ひだり' : 'みぎ'}</span>
          </div>
        ))}
      </div>
    )
  }

  // volume（コップの みず）
  return (
    <div className="measure-pair">
      {[left, right].map((v, i) => (
        <div key={i} className="measure-item">
          <div className="cup">
            <div className="water" style={{ height: `${v * 28}px` }} />
          </div>
          <span className="measure-tag">{i === 0 ? 'ひだり' : 'みぎ'}</span>
        </div>
      ))}
    </div>
  )
}

// --- ステージ13：とけい（SVG）----------------------------------------------
function Clock({ hour, minute }: { hour: number; minute: number }) {
  const cx = 100
  const cy = 100
  const hourAngle = ((hour % 12) + minute / 60) * 30 - 90
  const minAngle = minute * 6 - 90
  const hx = cx + 42 * Math.cos((hourAngle * Math.PI) / 180)
  const hy = cy + 42 * Math.sin((hourAngle * Math.PI) / 180)
  const mx = cx + 62 * Math.cos((minAngle * Math.PI) / 180)
  const my = cy + 62 * Math.sin((minAngle * Math.PI) / 180)

  return (
    <svg viewBox="0 0 200 200" className="clock pop" role="img" aria-label="とけい">
      <circle cx={cx} cy={cy} r="92" fill="#fffdf7" stroke="#ffb703" strokeWidth="8" />
      {Array.from({ length: 12 }).map((_, i) => {
        const n = i + 1
        const ang = (n * 30 - 90) * (Math.PI / 180)
        const x = cx + 74 * Math.cos(ang)
        const y = cy + 74 * Math.sin(ang)
        return (
          <text key={n} x={x} y={y + 7} textAnchor="middle" className="clock-num">
            {n}
          </text>
        )
      })}
      <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#495057" strokeWidth="8" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#e8590c" strokeWidth="5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="7" fill="#495057" />
    </svg>
  )
}

// --- ステージ14：えグラフ ---------------------------------------------------
function Pictograph({ rows }: { rows: { label: string; emoji: string; count: number }[] }) {
  return (
    <div className="pictograph">
      {rows.map((r, i) => (
        <div key={r.label} className="picto-row pop" style={{ animationDelay: `${i * 120}ms` }}>
          <span className="picto-label">{r.label}</span>
          <span className="picto-icons">
            {Array.from({ length: r.count }).map((_, i) => (
              <span key={i} className="picto-icon">{r.emoji}</span>
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}
