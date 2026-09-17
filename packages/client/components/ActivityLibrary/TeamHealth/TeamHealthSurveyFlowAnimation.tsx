import type {CSSProperties} from 'react'
import {cn} from '../../../ui/cn'

interface Props {
  className?: string
}

const CATEGORY_COLORS = ['var(--color-aqua-500)', 'var(--color-tomato-500)', 'var(--color-sky-500)']
// SCORE_COLORS from TeamHealthScoreScale, low (disagree) to high (agree)
const SCORE_COLORS = [
  'var(--color-tomato-500)',
  'var(--color-gold-500)',
  'var(--color-slate-600)',
  'var(--color-jade-400)',
  'var(--color-jade-500)'
]
const FONT = "'IBM Plex Sans', sans-serif"
const STANDARD = 'cubic-bezier(0.4, 0, 0.2, 1)'
const DECELERATE = 'cubic-bezier(0, 0, 0.2, 1)'
const ACCELERATE = 'cubic-bezier(0.4, 0, 1, 1)'
const POP = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

const ROUND_S = 6
const LOOP_S = 18
// a percentage of the whole loop, from a round index and a time within that round
const at = (round: number, seconds: number) =>
  (((round * ROUND_S + seconds) / LOOP_S) * 100).toFixed(3)
const rounds = [0, 1, 2]

// Within each round: the page rises (0-0.6s), the picked questions fly in (0.9-2.0s), the likert
// scales appear (2.1s), the lines reach the teams (2.6s), members answer (3.0-4.4s), the page
// leaves upward (4.8-5.4s) and the selection slides to the next question (5.4-6.0s).
const flyFrames = (name: string, firesOn: number[]) => `
@keyframes ${name} {
  0% {opacity: 0; transform: translate(0, 0)}
${firesOn
  .map(
    (r) => `  ${at(r, 0)}% {opacity: 0; transform: translate(0, 0)}
  ${at(r, 0.9)}% {opacity: 1; transform: translate(0, 0); animation-timing-function: ${STANDARD}}
  ${at(r, 2)}%, ${at(r, 4.8)}% {opacity: 1; transform: translate(var(--dx), var(--dy)); animation-timing-function: ${ACCELERATE}}
  ${at(r, 5.4)}% {opacity: 0; transform: translate(var(--dx), calc(var(--dy) - 150px))}
  ${Number(at(r, 5.4)) + 0.001}% {opacity: 0; transform: translate(0, 0)}`
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
    ) => `  ${at(r, 0.6)}%, ${at(r, 4.8)}% {opacity: 1; transform: translateY(0); animation-timing-function: ${ACCELERATE}}
  ${at(r, 5.4)}% {opacity: 0; transform: translateY(-150px)}
  ${Number(at(r, 5.4)) + 0.001}%, ${at(r + 1, 0)}% {opacity: 0; transform: translateY(130px); animation-timing-function: ${DECELERATE}}`
  )
  .join('\n')}
}
@keyframes thsfa-likert {
${rounds
  .map(
    (
      r
    ) => `  ${at(r, 0)}%, ${at(r, 2.1)}% {opacity: 0; transform: scale(0.5); animation-timing-function: ${POP}}
  ${at(r, 2.5)}%, ${at(r, 5.4)}% {opacity: 1; transform: scale(1)}
  ${Number(at(r, 5.4)) + 0.001}% {opacity: 0; transform: scale(0.5)}`
  )
  .join('\n')}
  100% {opacity: 0; transform: scale(0.5)}
}
@keyframes thsfa-line {
${rounds
  .map(
    (
      r
    ) => `  ${at(r, 0)}%, ${at(r, 2.6)}% {opacity: 0; stroke-dashoffset: 150; animation-timing-function: ${DECELERATE}}
  ${at(r, 3)}%, ${at(r, 4.8)}% {opacity: 1; stroke-dashoffset: 0}
  ${at(r, 5.4)}% {opacity: 0; stroke-dashoffset: 0}`
  )
  .join('\n')}
  100% {opacity: 0; stroke-dashoffset: 150}
}
@keyframes thsfa-answer {
${rounds
  .map(
    (
      r
    ) => `  ${at(r, 0)}%, ${at(r, 3)}% {opacity: 0; transform: translateY(6px); animation-timing-function: ${DECELERATE}}
  ${at(r, 3.3)}% {opacity: 1; transform: translateY(0)}
  ${at(r, 3.95)}% {opacity: 1; transform: translateY(-12px)}
  ${at(r, 4.4)}% {opacity: 0; transform: translateY(-24px)}`
  )
  .join('\n')}
  100% {opacity: 0; transform: translateY(6px)}
}
@keyframes thsfa-select-3 {
  0%, ${at(0, 5.4)}% {transform: translateY(0); animation-timing-function: ${STANDARD}}
  ${at(1, 0)}%, ${at(1, 5.4)}% {transform: translateY(var(--step)); animation-timing-function: ${STANDARD}}
  ${at(2, 0)}%, ${at(2, 5.4)}% {transform: translateY(calc(var(--step) * 2)); animation-timing-function: ${STANDARD}}
  100% {transform: translateY(0)}
}
@keyframes thsfa-select-2 {
  0%, ${at(0, 5.4)}% {transform: translateY(0); animation-timing-function: ${STANDARD}}
  ${at(1, 0)}%, ${at(1, 5.4)}% {transform: translateY(var(--step)); animation-timing-function: ${STANDARD}}
  ${at(2, 0)}%, 100% {transform: translateY(0)}
}
${flyFrames('thsfa-fly-r0', [0])}
${flyFrames('thsfa-fly-r1', [1])}
${flyFrames('thsfa-fly-r2', [2])}
${flyFrames('thsfa-fly-r02', [0, 2])}
${flyFrames('thsfa-fly-all', [0, 1, 2])}
.thsfa-fly {transform: translate(var(--dx), var(--dy))}
.thsfa-fly-r1, .thsfa-fly-r2 {opacity: 0}
.thsfa-likert, .thsfa-answer {transform-box: fill-box; transform-origin: center}
@media (prefers-reduced-motion: no-preference) {
  .thsfa-page {animation: thsfa-page ${LOOP_S}s linear infinite}
  .thsfa-likert {animation: thsfa-likert ${LOOP_S}s linear infinite}
  .thsfa-line {animation: thsfa-line ${LOOP_S}s linear infinite}
  .thsfa-answer {animation: thsfa-answer ${LOOP_S}s linear infinite}
  .thsfa-select-3 {animation: thsfa-select-3 ${LOOP_S}s linear infinite}
  .thsfa-select-2 {animation: thsfa-select-2 ${LOOP_S}s linear infinite}
  .thsfa-fly-r0 {animation: thsfa-fly-r0 ${LOOP_S}s linear infinite}
  .thsfa-fly-r1 {animation: thsfa-fly-r1 ${LOOP_S}s linear infinite}
  .thsfa-fly-r2 {animation: thsfa-fly-r2 ${LOOP_S}s linear infinite}
  .thsfa-fly-r02 {animation: thsfa-fly-r02 ${LOOP_S}s linear infinite}
  .thsfa-fly-all {animation: thsfa-fly-all ${LOOP_S}s linear infinite}
}
`

// Each category keeps its own pool and the survey takes one from each. Over three rounds the first
// category walks all three of its questions, the second wraps after two, and the third has only one
// so it joins every survey. `flyOn` is the keyframe set per round, indexed by question.
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
// scattered rather than stacked, so the survey visibly fans out rather than feeding a list
const TEAMS = [
  {
    name: 'Product',
    cx: 424,
    cy: 56,
    labelW: 50,
    line: 'M362,98 C382,98 386,56 392,56',
    answers: [-18, -4, 10, 20]
  },
  {
    name: 'Engineering',
    cx: 524,
    cy: 102,
    labelW: 72,
    line: 'M362,98 C420,92 455,102 492,102',
    answers: [-22, -10, 2, 14, 24]
  },
  {
    name: 'Marketing',
    cx: 452,
    cy: 150,
    labelW: 62,
    line: 'M362,98 C386,98 394,150 420,150',
    answers: [-14, 0, 14]
  }
]
const SURVEY_ROWS = [58, 96, 134]
// inset well inside the question bar above it, so the scale reads as an answer to that question
const LIKERT_CX = [272, 286, 300, 314, 328]
const BAR_X = 34
const BAR_W = 96
const BAR_H = 8
const DX = 252 - BAR_X
const TEAM_R = 26
const TEAM_ICON = 26
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
      viewBox='0 0 600 200'
      className={cn('h-auto w-full max-w-[600px]', className)}
      role='img'
      aria-label='One question is picked from each category in the question bank and flows into a survey that goes out to the Product, Engineering and Marketing teams, whose members answer. The next survey picks the next question down in each category.'
    >
      <title>How a team health survey is assembled</title>
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
          x='240'
          y='22'
          width='120'
          height='152'
          rx='8'
          fill='var(--color-surface-card)'
          stroke='var(--color-hairline-strong)'
        />
        <text
          x='252'
          y='40'
          fontFamily={FONT}
          fontSize='11'
          fontWeight='600'
          fill='var(--color-fg-primary)'
        >
          Questions
        </text>
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
          className='thsfa-line'
          d={team.line}
          fill='none'
          stroke={muted}
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeDasharray='150'
          opacity='0.7'
        />
      ))}
      {TEAMS.map((team) => (
        <g key={team.name}>
          <circle
            cx={team.cx}
            cy={team.cy}
            r={TEAM_R}
            fill='var(--color-surface-well)'
            stroke='var(--color-hairline-strong)'
          />
          <path
            d={GROUPS_ICON}
            fill='var(--color-fg-secondary)'
            transform={`translate(${team.cx - TEAM_ICON / 2} ${team.cy - 4 - TEAM_ICON / 2}) scale(${TEAM_ICON / 24})`}
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
              style={{animationDelay: lag(answerIdx * 0.18)}}
            >
              <circle
                cx={team.cx + offsetX}
                cy={team.cy - 14}
                r='7'
                fill='var(--color-forest-500)'
              />
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
        </g>
      ))}
    </svg>
  )
}

export default TeamHealthSurveyFlowAnimation
