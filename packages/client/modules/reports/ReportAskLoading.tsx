import {useId} from 'react'

interface Props {
  question: string
}

const WIDTH = 600
const HEIGHT = 200
const GRIDLINE_YS = [40, 100, 160]
const LINE_POINTS = [
  [0, 160],
  [50, 140],
  [90, 150],
  [140, 118],
  [185, 128],
  [235, 96],
  [280, 108],
  [330, 78],
  [375, 90],
  [425, 60],
  [470, 72],
  [520, 44],
  [560, 52],
  [600, 28]
]
const LINE_PATH = `M${LINE_POINTS.map(([x, y]) => `${x},${y}`).join(' L')}`

const ReportAskLoading = ({question}: Props) => {
  const id = useId()
  const gradientId = `${id}-gradient`
  const maskId = `${id}-mask`
  return (
    <section aria-busy className='rounded-md border border-hairline bg-surface-card shadow-xs'>
      <div className='px-5 pt-4'>
        <h2 className='m-0 font-semibold text-lg'>{question}</h2>
        <p role='status' className='m-0 mt-1 text-fg-muted text-sm'>
          Asking AI…
        </p>
      </div>
      <div className='h-80 px-5 pt-3 pb-5'>
        <svg
          aria-hidden
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio='none'
          className='size-full overflow-visible'
        >
          <defs>
            <linearGradient
              id={gradientId}
              gradientUnits='userSpaceOnUse'
              x1={0}
              x2={WIDTH}
              y1={0}
              y2={0}
              spreadMethod='repeat'
            >
              <stop offset='0%' stopColor='var(--color-grape-500)' />
              <stop offset='33%' stopColor='var(--color-tomato-500)' />
              <stop offset='66%' stopColor='var(--color-aqua-400)' />
              <stop offset='100%' stopColor='var(--color-grape-500)' />
            </linearGradient>
            <mask
              id={maskId}
              maskUnits='userSpaceOnUse'
              x={-10}
              y={-10}
              width={WIDTH + 20}
              height={HEIGHT + 20}
            >
              <path
                d={LINE_PATH}
                fill='none'
                stroke='white'
                strokeWidth={3}
                strokeLinecap='round'
                strokeLinejoin='round'
                vectorEffect='non-scaling-stroke'
                className='animate-report-ask-draw motion-reduce:animate-none'
              />
            </mask>
          </defs>
          {GRIDLINE_YS.map((y) => (
            <line
              key={y}
              x1={0}
              x2={WIDTH}
              y1={y}
              y2={y}
              stroke='var(--color-hairline)'
              vectorEffect='non-scaling-stroke'
            />
          ))}
          <line
            x1={0}
            x2={WIDTH}
            y1={HEIGHT}
            y2={HEIGHT}
            stroke='var(--color-hairline-strong)'
            vectorEffect='non-scaling-stroke'
          />
          <g mask={`url(#${maskId})`}>
            <rect
              x={0}
              y={-10}
              width={WIDTH * 2}
              height={HEIGHT + 20}
              fill={`url(#${gradientId})`}
              className='animate-report-ask-shimmer motion-reduce:animate-none'
            />
          </g>
        </svg>
      </div>
    </section>
  )
}

export default ReportAskLoading
