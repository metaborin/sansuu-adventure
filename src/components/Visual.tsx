import type { Visual } from '../types'

// ==========================================================================
// 問題の「見た目（イラスト・ブロックなど）」を描くコンポーネント
// visual.kind に あわせて えがきわけます。
// revealed = true のとき（こたえ合わせ後）は、こたえの ハイライトや
// かずの ひょうじを 出します。
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
      return <Compare left={visual.left} right={visual.right} revealed={revealed} />
    case 'ordinalRow':
      return (
        <OrdinalRow
          items={visual.items}
          targetIndex={visual.targetIndex}
          ends={visual.ends}
          countFrom={visual.countFrom}
          revealed={revealed}
        />
      )
    case 'tenAndOnes':
      return <TenAndOnes ones={visual.ones} hideOnes={visual.hideOnes} />
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
      return (
        <Measure
          variant={visual.variant}
          left={visual.left}
          right={visual.right}
          highlight={visual.highlight}
          revealed={revealed}
        />
      )
    case 'clock':
      return <Clock hour={visual.hour} minute={visual.minute} />
    case 'pictograph':
      return <Pictograph rows={visual.rows} revealed={revealed} />
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
function Compare({
  left,
  right,
  revealed,
}: {
  left: { emoji: string; count: number }
  right: { emoji: string; count: number }
  revealed: boolean
}) {
  return (
    <div className="compare">
      <div className="compare-col">
        <div className="compare-label">ひだり</div>
        <div className="compare-stack">
          {Array.from({ length: left.count }).map((_, i) => (
            <span key={i} className="obj pop" style={{ animationDelay: `${i * 60}ms` }}>{left.emoji}</span>
          ))}
        </div>
        {revealed && <div className="compare-count pop">{left.count}</div>}
      </div>
      <div className="compare-divider" />
      <div className="compare-col">
        <div className="compare-label">みぎ</div>
        <div className="compare-stack">
          {Array.from({ length: right.count }).map((_, i) => (
            <span key={i} className="obj pop" style={{ animationDelay: `${i * 60}ms` }}>{right.emoji}</span>
          ))}
        </div>
        {revealed && <div className="compare-count pop">{right.count}</div>}
      </div>
    </div>
  )
}

// --- ステージ3：よこ ならびの じゅんばん ------------------------------------
function OrdinalRow({
  items,
  targetIndex,
  ends,
  countFrom,
  revealed,
}: {
  items: string[]
  targetIndex: number
  ends: [string, string]
  countFrom: 'left' | 'right'
  revealed: boolean
}) {
  return (
    <div className="ordinal">
      <div className="ordinal-ends">
        <span>{countFrom === 'left' ? `👉 ${ends[0]}` : ends[0]}</span>
        <span>{countFrom === 'right' ? `${ends[1]} 👈` : ends[1]}</span>
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
function TenAndOnes({ ones, hideOnes }: { ones: number; hideOnes?: boolean }) {
  return (
    <div className="blocks-row">
      <div className="group">
        <TenFrame cells={Array(10).fill('blue')} />
        <div className="group-cap">10</div>
      </div>
      <div className="plus">と</div>
      <div className="group">
        {hideOnes ? (
          <>
            <div className="ones-hidden pop">?</div>
            <div className="group-cap">なんこ？</div>
          </>
        ) : (
          <>
            <div className="ones">
              {Array.from({ length: ones }).map((_, i) => (
                <div key={i} className="cell cell-green pop" style={{ animationDelay: `${i * 45}ms` }} />
              ))}
            </div>
            <div className="group-cap">{ones}</div>
          </>
        )}
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

// --- ステージ9：くりあがり たしざん（10を つくる うごきを 見せる）----------
// じゅんばん：
//   1. ひだりに a この あお、みぎに b この みどり が ならぶ
//   2. せつめいの ふきだしが でる
//   3. みぎの みどりが need こ、ひだりの あきに うつって 10が できる
//   4. 「10」と「のこり」の ラベルが でる
function AddCarry({ a, b }: { a: number; b: number }) {
  const need = 10 - a // 10に するのに ひつような かず
  const rest = b - need
  const moveAt = 1.5 // みどりが うつりはじめる 時刻（びょう）
  const doneAt = moveAt + need * 0.15 + 0.3

  return (
    <div className="carry-wrap">
      <div className="carry-caption late-pop" style={{ animationDelay: '0.7s' }}>
        💡 {b}を {need}と {rest}に わけて、10を つくろう！
      </div>
      <div className="blocks-row">
        <div className="group">
          <div className="tenframe">
            {Array.from({ length: a }).map((_, i) => (
              <div key={`a${i}`} className="cell cell-blue pop" style={{ animationDelay: `${i * 35}ms` }} />
            ))}
            {/* みぎから うつって くる みどり（おくれて 出現） */}
            {Array.from({ length: need }).map((_, i) => (
              <div key={`m${i}`} className="cell cell-green pop" style={{ animationDelay: `${moveAt + i * 0.15}s` }} />
            ))}
          </div>
          <div className="group-cap late-pop" style={{ animationDelay: `${doneAt}s` }}>
            10
          </div>
        </div>
        <div className="plus">と</div>
        <div className="group">
          <div className="tenframe">
            {/* うつって いく ぶんは、すこし ひかって きえる（ゴースト） */}
            {Array.from({ length: need }).map((_, i) => (
              <div key={`g${i}`} className="cell cell-green cell-ghost" style={{ animationDelay: `${0.5 + i * 0.12}s` }} />
            ))}
            {Array.from({ length: rest }).map((_, i) => (
              <div key={`r${i}`} className="cell cell-green pop" style={{ animationDelay: `${(need + i) * 40}ms` }} />
            ))}
          </div>
          <div className="group-cap late-pop" style={{ animationDelay: `${doneAt}s` }}>
            のこり {rest}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- ステージ10：くりさがり ひきざん（10から ひく うごきを 見せる）---------
// じゅんばん：
//   1. 10の まとまり（あお）と ばら が ならぶ
//   2. せつめいの ふきだしが でる
//   3. 10の まとまりから b こが ✕に かわって いく
//   4. 「のこり」の ラベルが でる
function SubBorrow({ a, b }: { a: number; b: number }) {
  const onesA = a - 10
  const takeAt = 1.3
  const doneAt = takeAt + b * 0.12 + 0.4

  return (
    <div className="carry-wrap">
      <div className="carry-caption late-pop" style={{ animationDelay: '0.7s' }}>
        💡 10の まとまりから {b}を ひこう！
      </div>
      <div className="blocks-row">
        <div className="group">
          <div className="tenframe">
            {Array.from({ length: b }).map((_, i) => (
              <div key={`t${i}`} className="cell cell-take cell-take-anim" style={{ animationDelay: `${takeAt + i * 0.12}s` }}>
                ✕
              </div>
            ))}
            {Array.from({ length: 10 - b }).map((_, i) => (
              <div key={`s${i}`} className="cell cell-blue pop" style={{ animationDelay: `${i * 35}ms` }} />
            ))}
          </div>
          <div className="group-cap late-pop" style={{ animationDelay: `${doneAt}s` }}>
            のこり {10 - b}
          </div>
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
    </div>
  )
}

// --- ステージ12：ながさ・ひろさ・かさ --------------------------------------
function Measure({
  variant,
  left,
  right,
  highlight,
  revealed,
}: {
  variant: 'length' | 'area' | 'volume'
  left: number
  right: number
  highlight?: 'left' | 'right'
  revealed: boolean
}) {
  const sizeToPct = (v: number) => 30 + v * 22 // 1→52%, 2→74%, 3→96%
  const winClass = (side: 'left' | 'right') => (revealed && highlight === side ? 'win' : '')

  if (variant === 'length') {
    return (
      <div className="measure-col">
        {([['left', left], ['right', right]] as const).map(([side, v], i) => (
          <div key={side} className={`measure-line ${winClass(side)}`}>
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
        {([['left', left], ['right', right]] as const).map(([side, v], i) => (
          <div key={side} className={`measure-item ${winClass(side)}`}>
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
      {([['left', left], ['right', right]] as const).map(([side, v], i) => (
        <div key={side} className={`measure-item ${winClass(side)}`}>
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
function Pictograph({
  rows,
  revealed,
}: {
  rows: { label: string; emoji: string; count: number }[]
  revealed: boolean
}) {
  return (
    <div className="pictograph">
      {rows.map((r, i) => (
        <div key={r.label} className="picto-row pop" style={{ animationDelay: `${i * 120}ms` }}>
          <span className="picto-label">{r.label}</span>
          <span className="picto-icons">
            {Array.from({ length: r.count }).map((_, j) => (
              <span key={j} className="picto-icon">{r.emoji}</span>
            ))}
          </span>
          {revealed && <span className="picto-count pop">{r.count}</span>}
        </div>
      ))}
    </div>
  )
}
