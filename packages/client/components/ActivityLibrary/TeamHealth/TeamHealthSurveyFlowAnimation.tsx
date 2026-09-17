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

// One loop runs two survey rounds of 7s. Offsets below are percentages of the 14s loop, so round
// two is always its round-one counterpart + 50. Within a round: the page rises from the bottom
// (0-0.7s), the picked question in each category lights up (0.7s), those questions fly into the
// page (1.2-2.4s), a likert scale appears under the first (2.4s), arrows reach the three teams
// (2.8s), each team answers in turn (3.3s/3.7s/4.1s), and the page leaves upward (5.6-6.4s).
const KEYFRAMES = `
@keyframes thsfa-page {
  0% {opacity: 0; transform: translateY(120px)}
  5%, 40% {opacity: 1; transform: translateY(0)}
  45.714% {opacity: 0; transform: translateY(-150px)}
  45.715%, 50% {opacity: 0; transform: translateY(120px)}
  55%, 90% {opacity: 1; transform: translateY(0)}
  95.714% {opacity: 0; transform: translateY(-150px)}
  95.715%, 100% {opacity: 0; transform: translateY(120px)}
}
@keyframes thsfa-likert {
  0%, 17.143% {opacity: 0}
  20%, 45.714% {opacity: 1}
  45.715%, 67.143% {opacity: 0}
  70%, 95.714% {opacity: 1}
  95.715%, 100% {opacity: 0}
}
@keyframes thsfa-fly-a {
  0%, 5% {opacity: 0; transform: translate(0, 0)}
  8.571% {opacity: 1; transform: translate(0, 0)}
  17.143%, 40% {opacity: 1; transform: translate(var(--dx), var(--dy))}
  45.714%, 100% {opacity: 0; transform: translate(var(--dx), calc(var(--dy) - 150px))}
}
@keyframes thsfa-fly-b {
  0%, 55% {opacity: 0; transform: translate(0, 0)}
  58.571% {opacity: 1; transform: translate(0, 0)}
  67.143%, 90% {opacity: 1; transform: translate(var(--dx), var(--dy))}
  95.714%, 100% {opacity: 0; transform: translate(var(--dx), calc(var(--dy) - 150px))}
}
@keyframes thsfa-arrow {
  0%, 20% {opacity: 0; stroke-dashoffset: 70}
  23.571%, 40% {opacity: 1; stroke-dashoffset: 0}
  44.286% {opacity: 0; stroke-dashoffset: 0}
  50%, 70% {opacity: 0; stroke-dashoffset: 70}
  73.571%, 90% {opacity: 1; stroke-dashoffset: 0}
  94.286%, 100% {opacity: 0; stroke-dashoffset: 0}
}
@keyframes thsfa-check {
  0%, 23.571% {opacity: 0; transform: scale(0.3)}
  25.714%, 40% {opacity: 1; transform: scale(1)}
  42.857% {opacity: 0; transform: scale(1)}
  50%, 73.571% {opacity: 0; transform: scale(0.3)}
  75.714%, 90% {opacity: 1; transform: scale(1)}
  92.857%, 100% {opacity: 0; transform: scale(1)}
}
@keyframes thsfa-pick-a {
  0%, 5% {opacity: 0}
  8.571%, 40% {opacity: 1}
  42.857%, 100% {opacity: 0}
}
@keyframes thsfa-pick-b {
  0%, 55% {opacity: 0}
  58.571%, 90% {opacity: 1}
  92.857%, 100% {opacity: 0}
}
@keyframes thsfa-pick-both {
  0%, 5% {opacity: 0}
  8.571%, 40% {opacity: 1}
  42.857%, 55% {opacity: 0}
  58.571%, 90% {opacity: 1}
  92.857%, 100% {opacity: 0}
}
.thsfa-fly-a, .thsfa-fly-b {transform: translate(var(--dx), var(--dy))}
.thsfa-fly-b, .thsfa-pick-b {opacity: 0}
.thsfa-check {transform-box: fill-box; transform-origin: center}
@media (prefers-reduced-motion: no-preference) {
  .thsfa-page {animation: thsfa-page 14s linear infinite}
  .thsfa-likert {animation: thsfa-likert 14s linear infinite}
  .thsfa-fly-a {animation: thsfa-fly-a 14s ease-in-out infinite}
  .thsfa-fly-b {animation: thsfa-fly-b 14s ease-in-out infinite}
  .thsfa-arrow {animation: thsfa-arrow 14s linear infinite}
  .thsfa-check {animation: thsfa-check 14s ease-out infinite}
  .thsfa-pick-a {animation: thsfa-pick-a 14s linear infinite}
  .thsfa-pick-b {animation: thsfa-pick-b 14s linear infinite}
  .thsfa-pick-both {animation: thsfa-pick-both 14s linear infinite}
}
`

// bank rows: header y, then one y per question. The survey asks one question per category, so the
// row a question lands on is its category's index, never its own.
const BANK = [
  {headerY: 41.5, dotY: 44, questionYs: [53, 65, 77], landsOn: 66},
  {headerY: 95.5, dotY: 98, questionYs: [107, 119], landsOn: 98},
  {headerY: 133.5, dotY: 136, questionYs: [145], landsOn: 120}
]
const TEAMS = [
  {name: 'Product', y: 62},
  {name: 'Engineering', y: 100},
  {name: 'Marketing', y: 138}
]
const BAR_X = 34
const SURVEY_BAR_X = 252
const DX = SURVEY_BAR_X - BAR_X

const TeamHealthSurveyFlowAnimation = (props: Props) => {
  const {className} = props
  const arrowHeadId = useId()
  const muted = 'var(--color-fg-muted)'

  return (
    <svg
      viewBox='0 0 600 200'
      className={cn('h-auto w-full max-w-[600px]', className)}
      role='img'
      aria-label='Questions picked from three categories flow into one survey, which goes out to the Product, Engineering and Marketing teams. The next survey draws the next question from each category.'
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
        rx='6'
        fill='var(--color-surface-card)'
        stroke='var(--color-hairline-strong)'
      />
      {BANK.map((category, categoryIdx) => (
        <g key={category.headerY}>
          <circle cx='24' cy={category.dotY} r='3.5' fill={CATEGORY_COLORS[categoryIdx]} />
          <rect
            x={BAR_X}
            y={category.headerY}
            width='62'
            height='5'
            rx='2.5'
            fill={muted}
            opacity='0.55'
          />
          {category.questionYs.map((questionY, questionIdx) => (
            <g key={questionY}>
              <rect
                x={BAR_X}
                y={questionY}
                width='96'
                height='7'
                rx='3.5'
                fill={muted}
                opacity='0.22'
              />
              <rect
                x={BAR_X}
                y={questionY}
                width='96'
                height='7'
                rx='3.5'
                fill={CATEGORY_COLORS[categoryIdx]}
                className={
                  category.questionYs.length === 1
                    ? 'thsfa-pick-both'
                    : questionIdx === 0
                      ? 'thsfa-pick-a'
                      : questionIdx === 1
                        ? 'thsfa-pick-b'
                        : undefined
                }
                opacity={questionIdx > 1 ? 0 : undefined}
              />
            </g>
          ))}
        </g>
      ))}

      <g className='thsfa-page'>
        <rect
          x='240'
          y='26'
          width='120'
          height='148'
          rx='6'
          fill='var(--color-surface-card)'
          stroke='var(--color-hairline-strong)'
        />
        <g className='thsfa-likert'>
          {[261, 280, 299, 318, 337].map((cx) => (
            <circle key={cx} cx={cx} cy='82' r='3' fill={muted} opacity='0.45' />
          ))}
        </g>
      </g>

      {BANK.map((category, categoryIdx) =>
        category.questionYs.slice(0, 2).map((questionY, questionIdx) => (
          <rect
            key={`${categoryIdx}-${questionY}`}
            x={BAR_X}
            y={questionY}
            width='96'
            height='7'
            rx='3.5'
            fill={CATEGORY_COLORS[categoryIdx]}
            className={
              category.questionYs.length === 1 || questionIdx === 0 ? 'thsfa-fly-a' : 'thsfa-fly-b'
            }
            style={
              {
                '--dx': `${DX}px`,
                '--dy': `${category.landsOn - questionY}px`
              } as React.CSSProperties
            }
          />
        ))
      )}

      {TEAMS.map((team) => (
        <path
          key={team.name}
          className='thsfa-arrow'
          d={team.y === 100 ? 'M366,100 L400,100' : `M366,100 C382,100 386,${team.y} 400,${team.y}`}
          fill='none'
          stroke={muted}
          strokeWidth='1.5'
          strokeDasharray='70'
          markerEnd={`url(#${arrowHeadId})`}
        />
      ))}
      {TEAMS.map((team, teamIdx) => (
        <g key={team.name}>
          {/* a positive delay would leave the check at its resting (visible) style until the
              animation starts, flashing every check on at mount; the negative equivalent starts it
              immediately, already advanced into the 14s loop */}
          <g
            className='thsfa-check'
            style={{animationDelay: teamIdx === 0 ? undefined : `${teamIdx * 0.4 - 14}s`}}
          >
            <circle cx='414' cy={team.y} r='7' fill='var(--color-forest-500)' />
            <path
              d={`M410.5,${team.y} L413,${team.y + 2.5} L417.5,${team.y - 2.5}`}
              fill='none'
              stroke='#fff'
              strokeWidth='1.6'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </g>
          <text
            x='428'
            y={team.y}
            dominantBaseline='middle'
            fontSize='11'
            fill='var(--color-fg-secondary)'
          >
            {team.name}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default TeamHealthSurveyFlowAnimation
