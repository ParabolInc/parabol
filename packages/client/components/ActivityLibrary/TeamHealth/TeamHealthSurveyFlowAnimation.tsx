import type {CSSProperties} from 'react'
import {cn} from '../../../ui/cn'

interface Props {
  className?: string
}

// spread across the hue arc the likert scale leaves free: its chips are tomato, gold, jade and a
// desaturated slate, so categories stay clear of red, amber and green
const CATEGORY_COLORS = [
  'var(--color-aqua-500)',
  'var(--color-lilac-500)',
  'var(--color-fuscia-500)'
]
// SCORE_COLORS from TeamHealthScoreScale, low (disagree) to high (agree)
const SCORE_COLORS = [
  'var(--color-tomato-500)',
  'var(--color-gold-500)',
  'var(--color-slate-600)',
  'var(--color-jade-400)',
  'var(--color-jade-500)'
]
const UP = 'var(--color-forest-500)'
const DOWN = 'var(--color-tomato-600)'
const FONT = "'IBM Plex Sans', sans-serif"
const STANDARD = 'cubic-bezier(0.4, 0, 0.2, 1)'
const DECELERATE = 'cubic-bezier(0, 0, 0.2, 1)'
const ACCELERATE = 'cubic-bezier(0.4, 0, 1, 1)'
const POP = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

const ROUND_S = 6.5
// three meetings plus a short tail, so the last line still has room to finish growing
const LOOP_S = 21
const rounds = [0, 1, 2]
const at = (round: number, seconds: number) =>
  (((round * ROUND_S + seconds) / LOOP_S) * 100).toFixed(3)
const abs = (seconds: number) => ((seconds / LOOP_S) * 100).toFixed(3)
const just = (round: number, seconds: number) => (Number(at(round, seconds)) - 0.01).toFixed(3)
const after = (round: number, seconds: number) => (Number(at(round, seconds)) + 0.01).toFixed(3)
// a line starts the moment its meeting hands over a score and takes the same flat second to grow,
// so every segment advances at one pace and the last finishes a second after the last delta lands
const GROW = [
  {from: at(1, 5.75), to: abs(13.25)},
  {from: at(2, 5.75), to: abs(19.75)}
]
const CHART_OUT = abs(20.5)

// Within each round: the meeting page rises (0-0.6s), the picked questions fly in (0.9-2.0s), the
// likert scales appear (2.1s), lines reach the teams (2.5s), members answer (2.9-4.3s), each team's
// score lands (4.1s) and then rides the departing page over to the chart (5.8-6.4s).
const flyFrames = (name: string, firesOn: number[]) => `
@keyframes ${name} {
  0% {opacity: 0; transform: translate(0, 0)}
${firesOn
  .map(
    (r) => `  ${at(r, 0)}% {opacity: 0; transform: translate(0, 0)}
  ${at(r, 0.9)}% {opacity: 1; transform: translate(0, 0); animation-timing-function: ${STANDARD}}
  ${at(r, 2)}%, ${at(r, 5.15)}% {opacity: 1; transform: translate(var(--dx), var(--dy)); animation-timing-function: ${ACCELERATE}}
  ${at(r, 5.75)}% {opacity: 0; transform: translate(var(--dx), calc(var(--dy) - 150px))}
  ${after(r, 5.75)}% {opacity: 0; transform: translate(0, 0)}`
  )
  .join('\n')}
  100% {opacity: 0; transform: translate(0, 0)}
}`

const KEYFRAMES = `
@keyframes thsfa-page {
  0% {opacity: 0; transform: translateY(130px); animation-timing-function: ${DECELERATE}}
${rounds
  .map(
    (
      r
    ) => `  ${at(r, 0.6)}%, ${at(r, 5.15)}% {opacity: 1; transform: translateY(0); animation-timing-function: ${ACCELERATE}}
  ${at(r, 5.75)}% {opacity: 0; transform: translateY(-150px)}
  ${after(r, 5.75)}%, ${at(r + 1, 0)}% {opacity: 0; transform: translateY(130px); animation-timing-function: ${DECELERATE}}`
  )
  .join('\n')}
  100% {opacity: 0; transform: translateY(130px)}
}
@keyframes thsfa-likert {
${rounds
  .map(
    (
      r
    ) => `  ${at(r, 0)}%, ${at(r, 2.1)}% {opacity: 0; transform: scale(0.5); animation-timing-function: ${POP}}
  ${at(r, 2.5)}%, ${at(r, 5.75)}% {opacity: 1; transform: scale(1)}
  ${after(r, 5.75)}% {opacity: 0; transform: scale(0.5)}`
  )
  .join('\n')}
  100% {opacity: 0; transform: scale(0.5)}
}
@keyframes thsfa-link {
${rounds
  .map(
    (
      r
    ) => `  ${at(r, 0)}%, ${at(r, 2.5)}% {opacity: 0; stroke-dashoffset: 150; animation-timing-function: ${DECELERATE}}
  ${at(r, 2.9)}%, ${at(r, 5.15)}% {opacity: 0.7; stroke-dashoffset: 0}
  ${at(r, 5.55)}% {opacity: 0; stroke-dashoffset: 0}`
  )
  .join('\n')}
  100% {opacity: 0; stroke-dashoffset: 150}
}
@keyframes thsfa-answer {
${rounds
  .map(
    (
      r
    ) => `  ${at(r, 0)}%, ${at(r, 2.9)}% {opacity: 0; transform: translateY(6px); animation-timing-function: ${DECELERATE}}
  ${at(r, 3.2)}% {opacity: 1; transform: translateY(0)}
  ${at(r, 3.85)}% {opacity: 1; transform: translateY(-12px)}
  ${at(r, 4.3)}% {opacity: 0; transform: translateY(-24px)}`
  )
  .join('\n')}
  100% {opacity: 0; transform: translateY(6px)}
}
@keyframes thsfa-select-3 {
  0%, ${at(0, 5.75)}% {transform: translateY(0); animation-timing-function: ${STANDARD}}
  ${at(1, 0)}%, ${at(1, 5.75)}% {transform: translateY(var(--step)); animation-timing-function: ${STANDARD}}
  ${at(2, 0)}%, ${CHART_OUT}% {transform: translateY(calc(var(--step) * 2)); animation-timing-function: ${STANDARD}}
  100% {transform: translateY(0)}
}
@keyframes thsfa-select-2 {
  0%, ${at(0, 5.75)}% {transform: translateY(0); animation-timing-function: ${STANDARD}}
  ${at(1, 0)}%, ${at(1, 5.75)}% {transform: translateY(var(--step)); animation-timing-function: ${STANDARD}}
  ${at(2, 0)}%, 100% {transform: translateY(0)}
}
@keyframes thsfa-axes {
  0%, ${at(0, 4.3)}% {opacity: 0; animation-timing-function: ${DECELERATE}}
  ${at(0, 5)}%, ${CHART_OUT}% {opacity: 0.6}
  100% {opacity: 0}
}
@keyframes thsfa-dot {
  0%, ${at(0, 5.75)}% {opacity: 0; transform: translate(0, 0) scale(0.3); animation-timing-function: ${POP}}
  ${at(0, 6.05)}%, ${GROW[0]!.from}% {opacity: 1; transform: translate(0, 0) scale(1); animation-timing-function: linear}
  ${GROW[0]!.to}%, ${GROW[1]!.from}% {opacity: 1; transform: translate(var(--d2x), var(--d2y)) scale(1); animation-timing-function: linear}
  ${GROW[1]!.to}%, ${CHART_OUT}% {opacity: 1; transform: translate(var(--d3x), var(--d3y)) scale(1)}
  100% {opacity: 0; transform: translate(var(--d3x), var(--d3y)) scale(1)}
}
${GROW.map(
  // a round linecap paints a dot even at full offset, so a segment stays hidden until it draws
  (grow, idx) => `@keyframes thsfa-seg${idx + 1} {
  0%, ${(Number(grow.from) - 0.01).toFixed(3)}% {stroke-dashoffset: var(--len); opacity: 0}
  ${grow.from}% {stroke-dashoffset: var(--len); opacity: 1; animation-timing-function: linear}
  ${grow.to}%, ${CHART_OUT}% {stroke-dashoffset: 0; opacity: 1}
  99.99% {stroke-dashoffset: 0; opacity: 0}
  100% {stroke-dashoffset: var(--len); opacity: 0}
}`
).join('\n')}
${rounds
  .map(
    (r) => `@keyframes thsfa-title-r${r} {
  ${r === 0 ? '0%' : `0%, ${just(r, 0)}%`} {opacity: ${r === 0 ? 1 : 0}}
  ${at(r, 0)}%, ${at(r, 5.75)}% {opacity: 1}
  ${after(r, 5.75)}%, 100% {opacity: 0}
}
@keyframes thsfa-score-r${r} {
  0%, ${at(r, 4.1)}% {opacity: 0; transform: translate(0, 6px) scale(0.6); animation-timing-function: ${POP}}
  ${at(r, 4.5)}%, ${at(r, 5.15)}% {opacity: 1; transform: translate(0, 0) scale(1); animation-timing-function: ${STANDARD}}
  ${at(r, 5.75)}% {opacity: 1; transform: translate(var(--sx), var(--sy)) scale(0.75)}
  ${at(r, 6.05)}%, 100% {opacity: 0; transform: translate(var(--sx), var(--sy)) scale(0.75)}
}`
  )
  .join('\n')}
${flyFrames('thsfa-fly-r0', [0])}
${flyFrames('thsfa-fly-r1', [1])}
${flyFrames('thsfa-fly-r2', [2])}
${flyFrames('thsfa-fly-r02', [0, 2])}
${flyFrames('thsfa-fly-all', [0, 1, 2])}
.thsfa-fly {transform: translate(var(--dx), var(--dy))}
.thsfa-fly-r1, .thsfa-fly-r2 {opacity: 0}
.thsfa-likert, .thsfa-answer, .thsfa-dot, .thsfa-score-r0, .thsfa-score-r1, .thsfa-score-r2 {transform-box: fill-box; transform-origin: center}
.thsfa-title-r1, .thsfa-title-r2, .thsfa-score-r1, .thsfa-score-r2, .thsfa-seg1, .thsfa-seg2 {opacity: 0}
.thsfa-axes {opacity: 0.6}
@media (prefers-reduced-motion: no-preference) {
  .thsfa-page {animation: thsfa-page ${LOOP_S}s linear infinite}
  .thsfa-likert {animation: thsfa-likert ${LOOP_S}s linear infinite}
  .thsfa-link {animation: thsfa-link ${LOOP_S}s linear infinite}
  .thsfa-answer {animation: thsfa-answer ${LOOP_S}s linear infinite}
  .thsfa-select-3 {animation: thsfa-select-3 ${LOOP_S}s linear infinite}
  .thsfa-select-2 {animation: thsfa-select-2 ${LOOP_S}s linear infinite}
  .thsfa-axes {animation: thsfa-axes ${LOOP_S}s linear infinite}
  .thsfa-dot {animation: thsfa-dot ${LOOP_S}s linear infinite}
  .thsfa-seg1 {animation: thsfa-seg1 ${LOOP_S}s linear infinite}
  .thsfa-seg2 {animation: thsfa-seg2 ${LOOP_S}s linear infinite}
${rounds
  .map(
    (r) => `  .thsfa-title-r${r} {animation: thsfa-title-r${r} ${LOOP_S}s linear infinite}
  .thsfa-score-r${r} {animation: thsfa-score-r${r} ${LOOP_S}s linear infinite}`
  )
  .join('\n')}
  .thsfa-fly-r0 {animation: thsfa-fly-r0 ${LOOP_S}s linear infinite}
  .thsfa-fly-r1 {animation: thsfa-fly-r1 ${LOOP_S}s linear infinite}
  .thsfa-fly-r2 {animation: thsfa-fly-r2 ${LOOP_S}s linear infinite}
  .thsfa-fly-r02 {animation: thsfa-fly-r02 ${LOOP_S}s linear infinite}
  .thsfa-fly-all {animation: thsfa-fly-all ${LOOP_S}s linear infinite}
}
`

// Each category keeps its own pool and the meeting takes one from each. Over three meetings the
// first category walks all three of its questions, the second wraps after two, and the third has
// only one so it joins every meeting. `flyOn` is the keyframe set per round, indexed by question.
const BANK = [
  {
    dotY: 50,
    headerY: 47.5,
    questionYs: [58, 70, 82],
    landsOn: 58,
    flyOn: ['thsfa-fly-r0', 'thsfa-fly-r1', 'thsfa-fly-r2']
  },
  {
    dotY: 106,
    headerY: 103.5,
    questionYs: [114, 126],
    landsOn: 96,
    flyOn: ['thsfa-fly-r02', 'thsfa-fly-r1']
  },
  {dotY: 148, headerY: 145.5, questionYs: [156], landsOn: 134, flyOn: ['thsfa-fly-all']}
]
// the first meeting reports a score, later ones report the move, which is what a team watches
const TEAMS = [
  {
    name: 'Product',
    cx: 362,
    cy: 56,
    labelW: 50,
    link: 'M294,98 C310,98 314,56 330,56',
    answers: [-18, -4, 10, 20],
    values: [3, 3.3, 3.5]
  },
  {
    name: 'Engineering',
    cx: 428,
    cy: 94,
    labelW: 72,
    link: 'M294,98 C330,94 360,94 396,94',
    answers: [-22, -10, 2, 14, 24],
    values: [4, 3.9, 4.5]
  },
  {
    name: 'Marketing',
    cx: 382,
    cy: 150,
    labelW: 62,
    link: 'M294,98 C312,98 318,150 350,150',
    answers: [-14, 0, 14],
    values: [2, 2.8, 2.9]
  }
]
const SURVEY_ROWS = [58, 96, 134]
const LIKERT_CX = [204, 218, 232, 246, 260]
const BAR_X = 34
const BAR_W = 96
const BAR_H = 8
const DX = 184 - BAR_X
// the trend chart sits beside the teams, bare: the shape of the line is the whole message
const AXIS_X = 500
const AXIS_Y = 165
const CHART_TOP = 45
const UNIT = (AXIS_Y - CHART_TOP) / 5
const MEETING_X = [515, 558, 601]
const scoreY = (value: number) => AXIS_Y - value * UNIT
const GROUPS_ICON =
  'M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91M4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29M20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3'

const TeamHealthSurveyFlowAnimation = (props: Props) => {
  const {className} = props
  const muted = 'var(--color-fg-muted)'
  // a positive delay would hold an element at its resting style until the animation starts, so
  // every stagger is expressed as the negative equivalent inside the loop
  const lag = (seconds: number) => (seconds === 0 ? undefined : `${seconds - LOOP_S}s`)

  return (
    <svg
      viewBox='0 0 650 200'
      className={cn('h-auto w-full max-w-[650px]', className)}
      role='img'
      aria-label='One question is picked from each category in the question bank and flows into a meeting that goes out to the Product, Engineering and Marketing teams. Each team scores, and those scores carry over into a trend line across three meetings.'
    >
      <title>How a team health survey is assembled and tracked</title>
      <style>{KEYFRAMES}</style>

      <rect
        x='14'
        y='14'
        width='132'
        height='172'
        rx='8'
        fill='var(--color-surface-card)'
        stroke='var(--color-hairline-strong)'
      />
      <text
        x='26'
        y='34'
        fontFamily={FONT}
        fontSize='11'
        fontWeight='600'
        fill='var(--color-fg-primary)'
      >
        Question bank
      </text>
      {BANK.map((category, categoryIdx) => (
        <g key={category.dotY}>
          <circle cx='24' cy={category.dotY} r='3.5' fill={CATEGORY_COLORS[categoryIdx]} />
          <rect
            x={BAR_X}
            y={category.headerY}
            width='58'
            height='5'
            rx='2'
            fill={muted}
            opacity='0.5'
          />
          {category.questionYs.map((questionY) => (
            <rect
              key={questionY}
              x={BAR_X}
              y={questionY}
              width={BAR_W}
              height={BAR_H}
              rx='2'
              fill={muted}
              opacity='0.25'
            />
          ))}
          <rect
            className={
              category.questionYs.length === 3
                ? 'thsfa-select-3'
                : category.questionYs.length === 2
                  ? 'thsfa-select-2'
                  : undefined
            }
            style={
              category.questionYs[1]
                ? ({
                    '--step': `${category.questionYs[1] - category.questionYs[0]!}px`
                  } as CSSProperties)
                : undefined
            }
            x={BAR_X}
            y={category.questionYs[0]}
            width={BAR_W}
            height={BAR_H}
            rx='2'
            fill={CATEGORY_COLORS[categoryIdx]}
          />
        </g>
      ))}

      <g className='thsfa-page'>
        <rect
          x='172'
          y='22'
          width='120'
          height='152'
          rx='8'
          fill='var(--color-surface-card)'
          stroke='var(--color-hairline-strong)'
        />
        {rounds.map((r) => (
          <text
            key={r}
            className={`thsfa-title-r${r}`}
            x='184'
            y='40'
            fontFamily={FONT}
            fontSize='11'
            fontWeight='600'
            fill='var(--color-fg-primary)'
          >
            Meeting #{r + 1}
          </text>
        ))}
        {SURVEY_ROWS.map((rowY, rowIdx) => (
          <g key={rowY} className='thsfa-likert' style={{animationDelay: lag(rowIdx * 0.12)}}>
            {LIKERT_CX.map((cx, scoreIdx) => (
              <g key={cx}>
                <circle cx={cx} cy={rowY + 16} r='6' fill={SCORE_COLORS[scoreIdx]} />
                <text
                  x={cx}
                  y={rowY + 16}
                  textAnchor='middle'
                  dominantBaseline='central'
                  fontFamily={FONT}
                  fontSize='8'
                  fontWeight='600'
                  fill='#fff'
                >
                  {scoreIdx + 1}
                </text>
              </g>
            ))}
          </g>
        ))}
      </g>

      {BANK.map((category, categoryIdx) =>
        category.flyOn.map((flyClass, questionIdx) => (
          <rect
            key={flyClass + questionIdx}
            className={cn('thsfa-fly', flyClass)}
            x={BAR_X}
            y={category.questionYs[questionIdx]}
            width={BAR_W}
            height={BAR_H}
            rx='2'
            fill={CATEGORY_COLORS[categoryIdx]}
            style={
              {
                '--dx': `${DX}px`,
                '--dy': `${category.landsOn - category.questionYs[questionIdx]!}px`,
                animationDelay: lag(categoryIdx * 0.15)
              } as CSSProperties
            }
          />
        ))
      )}

      {/* no arrowheads: the line draws itself outward from the page, which carries the direction */}
      {TEAMS.map((team) => (
        <path
          key={team.name}
          className='thsfa-link'
          d={team.link}
          fill='none'
          stroke={muted}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeDasharray='150'
          opacity='0.7'
        />
      ))}

      <g className='thsfa-axes'>
        <path
          d={`M${AXIS_X},${CHART_TOP} L${AXIS_X},${AXIS_Y} L625,${AXIS_Y}`}
          fill='none'
          stroke={muted}
          strokeWidth='1.5'
        />
      </g>
      {TEAMS.map((team, teamIdx) => {
        const color = CATEGORY_COLORS[teamIdx]!
        const points = team.values.map((value, r) => ({x: MEETING_X[r]!, y: scoreY(value)}))
        return (
          <g key={team.name}>
            {[1, 2].map((r) => {
              const a = points[r - 1]!
              const b = points[r]!
              const len = Math.hypot(b.x - a.x, b.y - a.y).toFixed(2)
              return (
                <line
                  key={r}
                  className={`thsfa-seg${r}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={color}
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeDasharray={len}
                  style={{'--len': `${len}px`} as CSSProperties}
                />
              )
            })}
            {/* one dot per team, always riding the growing end of its line */}
            <circle
              className='thsfa-dot'
              cx={points[0]!.x}
              cy={points[0]!.y}
              r='3.5'
              fill={color}
              style={
                {
                  '--d2x': `${points[1]!.x - points[0]!.x}px`,
                  '--d2y': `${points[1]!.y - points[0]!.y}px`,
                  '--d3x': `${points[2]!.x - points[0]!.x}px`,
                  '--d3y': `${points[2]!.y - points[0]!.y}px`
                } as CSSProperties
              }
            />
          </g>
        )
      })}

      {TEAMS.map((team, teamIdx) => (
        <g key={team.name}>
          <circle
            cx={team.cx}
            cy={team.cy}
            r='26'
            fill='var(--color-surface-well)'
            stroke='var(--color-hairline-strong)'
          />
          <path
            d={GROUPS_ICON}
            fill='var(--color-fg-secondary)'
            transform={`translate(${team.cx - 13} ${team.cy - 17}) scale(${26 / 24})`}
          />
          <rect
            x={team.cx - team.labelW / 2}
            y={team.cy + 12}
            width={team.labelW}
            height='16'
            rx='4'
            fill='var(--color-surface-card)'
            stroke='var(--color-hairline-strong)'
          />
          <text
            x={team.cx}
            y={team.cy + 20}
            textAnchor='middle'
            dominantBaseline='central'
            fontFamily={FONT}
            fontSize='9.5'
            fontWeight='600'
            fill='var(--color-fg-primary)'
          >
            {team.name}
          </text>
          {team.answers.map((offsetX, answerIdx) => (
            <g
              key={offsetX}
              className='thsfa-answer'
              style={{animationDelay: lag(answerIdx * 0.15)}}
            >
              <circle cx={team.cx + offsetX} cy={team.cy - 14} r='7' fill={UP} />
              <path
                d={`M${team.cx + offsetX - 3},${team.cy - 14} L${team.cx + offsetX - 0.8},${team.cy - 11.8} L${team.cx + offsetX + 3},${team.cy - 17}`}
                fill='none'
                stroke='#fff'
                strokeWidth='1.6'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </g>
          ))}
          {rounds.map((r) => {
            const delta = r === 0 ? 0 : team.values[r]! - team.values[r - 1]!
            const label =
              r === 0
                ? team.values[0]!.toFixed(1)
                : `${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(1)}`
            const originX = team.cx + 42
            const originY = team.cy - 4
            return (
              <text
                key={r}
                className={`thsfa-score-r${r}`}
                x={originX}
                y={originY}
                textAnchor='middle'
                dominantBaseline='central'
                fontFamily={FONT}
                fontSize='13'
                fontWeight='600'
                fill={r === 0 ? 'var(--color-fg-primary)' : delta >= 0 ? UP : DOWN}
                style={
                  {
                    // the score hands itself to the chart: meeting one becomes the starting dot,
                    // later ones land where their line is headed
                    '--sx': `${MEETING_X[r]! - originX}px`,
                    '--sy': `${scoreY(team.values[r]!) - originY}px`,
                    animationDelay: lag(teamIdx * 0.1)
                  } as CSSProperties
                }
              >
                {label}
              </text>
            )
          })}
        </g>
      ))}
    </svg>
  )
}

export default TeamHealthSurveyFlowAnimation
