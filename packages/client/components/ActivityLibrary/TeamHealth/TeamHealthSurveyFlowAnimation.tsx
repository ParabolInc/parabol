import type {CSSProperties} from 'react'
import {useId} from 'react'
import {cn} from '../../../ui/cn'

interface Props {
  className?: string
}

const CATEGORY_COLORS = [
  'var(--color-tomato-500)',
  'var(--color-gold-500)',
  'var(--color-jade-500)'
]
const FONT = "'IBM Plex Sans', sans-serif"
// material easing: standard for moves, decelerate on entrances, accelerate on exits, and an
// overshooting back-out so the approval stamps land with some weight
const STANDARD = 'cubic-bezier(0.4, 0, 0.2, 1)'
const DECELERATE = 'cubic-bezier(0, 0, 0.2, 1)'
const ACCELERATE = 'cubic-bezier(0.4, 0, 1, 1)'
const STAMP = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

// One loop runs two survey rounds of 7s, so round two's percentages are round one's + 50. Within a
// round: the page rises (0-0.7s), the picked questions fly in (1.0-2.2s), the likert scale appears
// (2.4s), arrows reach the teams (2.9s), each team stamps its approval (3.4/3.8/4.2s), the page
// leaves upward (5.6-6.3s), and the selection slides to the next question (6.4-7.0s).
const KEYFRAMES = `
@keyframes thsfa-page {
  0% {opacity: 0; transform: translateY(130px); animation-timing-function: ${DECELERATE}}
  5%, 40% {opacity: 1; transform: translateY(0); animation-timing-function: ${ACCELERATE}}
  45% {opacity: 0; transform: translateY(-150px)}
  45.001%, 50% {opacity: 0; transform: translateY(130px); animation-timing-function: ${DECELERATE}}
  55%, 90% {opacity: 1; transform: translateY(0); animation-timing-function: ${ACCELERATE}}
  95% {opacity: 0; transform: translateY(-150px)}
  95.001%, 100% {opacity: 0; transform: translateY(130px)}
}
@keyframes thsfa-likert {
  0%, 17.143% {opacity: 0; transform: scale(0.6); animation-timing-function: ${STAMP}}
  20%, 45% {opacity: 1; transform: scale(1)}
  45.001%, 67.143% {opacity: 0; transform: scale(0.6); animation-timing-function: ${STAMP}}
  70%, 95% {opacity: 1; transform: scale(1)}
  95.001%, 100% {opacity: 0; transform: scale(0.6)}
}
@keyframes thsfa-fly-a {
  0%, 5% {opacity: 0; transform: translate(0, 0)}
  7.143% {opacity: 1; transform: translate(0, 0); animation-timing-function: ${STANDARD}}
  15.714%, 40% {opacity: 1; transform: translate(var(--dx), var(--dy)); animation-timing-function: ${ACCELERATE}}
  45%, 100% {opacity: 0; transform: translate(var(--dx), calc(var(--dy) - 150px))}
}
@keyframes thsfa-fly-b {
  0%, 55% {opacity: 0; transform: translate(0, 0)}
  57.143% {opacity: 1; transform: translate(0, 0); animation-timing-function: ${STANDARD}}
  65.714%, 90% {opacity: 1; transform: translate(var(--dx), var(--dy)); animation-timing-function: ${ACCELERATE}}
  95%, 100% {opacity: 0; transform: translate(var(--dx), calc(var(--dy) - 150px))}
}
@keyframes thsfa-arrow {
  0%, 20.714% {opacity: 0; stroke-dashoffset: 70; animation-timing-function: ${DECELERATE}}
  24.286%, 40% {opacity: 1; stroke-dashoffset: 0}
  44.286% {opacity: 0; stroke-dashoffset: 0}
  50%, 70.714% {opacity: 0; stroke-dashoffset: 70; animation-timing-function: ${DECELERATE}}
  74.286%, 90% {opacity: 1; stroke-dashoffset: 0}
  94.286%, 100% {opacity: 0; stroke-dashoffset: 0}
}
@keyframes thsfa-stamp {
  0%, 24.286% {opacity: 0; transform: scale(1.9) rotate(-14deg); animation-timing-function: ${STAMP}}
  27.5%, 40% {opacity: 1; transform: scale(1) rotate(0deg)}
  42.857% {opacity: 0; transform: scale(1) rotate(0deg)}
  50%, 74.286% {opacity: 0; transform: scale(1.9) rotate(-14deg); animation-timing-function: ${STAMP}}
  77.5%, 90% {opacity: 1; transform: scale(1) rotate(0deg)}
  92.857%, 100% {opacity: 0; transform: scale(1) rotate(0deg)}
}
@keyframes thsfa-select {
  0%, 45.714% {transform: translateY(0); animation-timing-function: ${STANDARD}}
  50%, 95.714% {transform: translateY(var(--step)); animation-timing-function: ${STANDARD}}
  100% {transform: translateY(0)}
}
.thsfa-fly-a, .thsfa-fly-b {transform: translate(var(--dx), var(--dy))}
.thsfa-fly-b {opacity: 0}
.thsfa-stamp, .thsfa-likert {transform-box: fill-box; transform-origin: center}
@media (prefers-reduced-motion: no-preference) {
  .thsfa-page {animation: thsfa-page 14s linear infinite}
  .thsfa-likert {animation: thsfa-likert 14s linear infinite}
  .thsfa-fly-a {animation: thsfa-fly-a 14s linear infinite}
  .thsfa-fly-b {animation: thsfa-fly-b 14s linear infinite}
  .thsfa-arrow {animation: thsfa-arrow 14s linear infinite}
  .thsfa-stamp {animation: thsfa-stamp 14s linear infinite}
  .thsfa-select {animation: thsfa-select 14s linear infinite}
}
`

// Each category keeps its own pool; the survey takes one from each, so a question's row in the
// survey is its category's index. The third category has a single question, which is why its
// selection never moves and it turns up in every survey.
const BANK = [
  {dotY: 44, headerY: 41.5, questionYs: [53, 66, 79], landsOn: 62},
  {dotY: 100, headerY: 97.5, questionYs: [109, 122], landsOn: 106},
  {dotY: 143, headerY: 140.5, questionYs: [152], landsOn: 126}
]
const TEAMS = [
  {name: 'Product', y: 58},
  {name: 'Engineering', y: 100},
  {name: 'Marketing', y: 142}
]
const LIKERT_CX = [260, 280, 300, 320, 340]
const BAR_X = 34
const BAR_W = 96
const BAR_H = 8
const SURVEY_BAR_X = 252
const DX = SURVEY_BAR_X - BAR_X
const GROUPS_ICON =
  'M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91M4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29M20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3'

const TeamHealthSurveyFlowAnimation = (props: Props) => {
  const {className} = props
  const arrowHeadId = useId()
  const muted = 'var(--color-fg-muted)'

  return (
    <svg
      viewBox='0 0 600 200'
      className={cn('h-auto w-full max-w-[600px]', className)}
      role='img'
      aria-label='One question is picked from each of three categories and flows into a single survey, which goes out to the Product, Engineering and Marketing teams. The next survey picks the next question down in each category.'
    >
      <title>How a team health survey is assembled</title>
      <style>{KEYFRAMES}</style>
      <defs>
        <marker
          id={arrowHeadId}
          viewBox='0 0 8 8'
          refX='6'
          refY='4'
          markerWidth='5'
          markerHeight='5'
          orient='auto'
        >
          <path d='M0,1 L6,4 L0,7 Z' fill={muted} />
        </marker>
      </defs>

      <rect
        x='14'
        y='14'
        width='132'
        height='172'
        rx='8'
        fill='var(--color-surface-card)'
        stroke='var(--color-hairline-strong)'
      />
      {BANK.map((category, categoryIdx) => (
        <g key={category.dotY}>
          <circle cx='24' cy={category.dotY} r='3.5' fill={CATEGORY_COLORS[categoryIdx]} />
          <rect
            x={BAR_X}
            y={category.headerY}
            width='62'
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
              opacity='0.2'
            />
          ))}
          <rect
            className={category.questionYs[1] ? 'thsfa-select' : undefined}
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
          y='26'
          width='120'
          height='148'
          rx='8'
          fill='var(--color-surface-card)'
          stroke='var(--color-hairline-strong)'
        />
        <g className='thsfa-likert'>
          {LIKERT_CX.map((cx, scoreIdx) => (
            <g key={cx}>
              <circle
                cx={cx}
                cy='84'
                r='8'
                fill='none'
                stroke={muted}
                strokeWidth='1'
                opacity='0.55'
              />
              <text
                x={cx}
                y='84'
                textAnchor='middle'
                dominantBaseline='central'
                fontFamily={FONT}
                fontSize='9'
                fontWeight='500'
                fill='var(--color-fg-secondary)'
              >
                {scoreIdx + 1}
              </text>
            </g>
          ))}
        </g>
      </g>

      {BANK.map((category, categoryIdx) =>
        // the single-question category flies in both rounds, the others alternate
        (category.questionYs.length === 1
          ? [category.questionYs[0]!, category.questionYs[0]!]
          : category.questionYs.slice(0, 2)
        ).map((questionY, roundIdx) => (
          <rect
            key={`${categoryIdx}-${roundIdx}`}
            x={BAR_X}
            y={questionY}
            width={BAR_W}
            height={BAR_H}
            rx='2'
            fill={CATEGORY_COLORS[categoryIdx]}
            className={roundIdx === 0 ? 'thsfa-fly-a' : 'thsfa-fly-b'}
            style={
              {
                '--dx': `${DX}px`,
                '--dy': `${category.landsOn - questionY}px`,
                // a small cascade so the three questions do not arrive as one block
                animationDelay: categoryIdx === 0 ? undefined : `${categoryIdx * 0.15 - 14}s`
              } as CSSProperties
            }
          />
        ))
      )}

      {TEAMS.map((team) => (
        <path
          key={team.name}
          className='thsfa-arrow'
          d={team.y === 100 ? 'M366,100 L386,100' : `M366,100 C380,100 378,${team.y} 386,${team.y}`}
          fill='none'
          stroke={muted}
          strokeWidth='1.5'
          strokeDasharray='70'
          markerEnd={`url(#${arrowHeadId})`}
        />
      ))}
      {TEAMS.map((team, teamIdx) => (
        <g key={team.name}>
          <path
            d={GROUPS_ICON}
            fill={muted}
            transform={`translate(392 ${team.y - 7}) scale(0.583)`}
          />
          <text
            x='414'
            y={team.y}
            dominantBaseline='central'
            fontFamily={FONT}
            fontSize='12'
            fontWeight='500'
            fill='var(--color-fg-secondary)'
          >
            {team.name}
          </text>
          <g transform={`translate(436 ${team.y}) rotate(-12)`}>
            {/* a positive delay would hold the stamp at its resting (visible) style until the
                animation starts, flashing every stamp on at mount; the negative equivalent starts
                it immediately, already advanced into the 14s loop */}
            <path
              className='thsfa-stamp'
              style={{animationDelay: teamIdx === 0 ? undefined : `${teamIdx * 0.4 - 14}s`}}
              d='M-26,1 L-9,18 L26,-17'
              fill='none'
              stroke='var(--color-forest-500)'
              strokeWidth='8'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </g>
        </g>
      ))}
    </svg>
  )
}

export default TeamHealthSurveyFlowAnimation
