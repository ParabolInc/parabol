import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type TooltipItem
} from 'chart.js'
import dayjs from 'dayjs'
import {Line} from 'react-chartjs-2'
import useResolvedTheme from '../../hooks/useResolvedTheme'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip)

// grape from paletteV3, since the canvas can't read our CSS tokens. Past points sit on the line in
// the theme's mid grape; the current point is filled darker (light) or lighter (dark) so it stands
// off the card as the one the team is discussing
const LINE_COLORS = {
  light: {line: '#A06BD6', current: '#7340B5'},
  dark: {line: '#A06BD6', current: '#AF6BD6'}
} as const

const TOOLTIP_COLORS = {
  light: {background: '#1C1C21', text: '#F1F0FA'},
  dark: {background: '#493272', text: '#EEEDF7'}
} as const

export interface TeamHealthTrendPoint {
  endedAt: string
  score: number
}

interface Props {
  // past cycles oldest first, then this cycle last
  points: TeamHealthTrendPoint[]
}

const TeamHealthTrendChart = (props: Props) => {
  const {points} = props
  const theme = useResolvedTheme()
  const colors = LINE_COLORS[theme]
  const tooltipColors = TOOLTIP_COLORS[theme]
  const lastIdx = points.length - 1
  const data = {
    labels: points.map(({endedAt}) => dayjs(endedAt).format('MMM D')),
    datasets: [
      {
        data: points.map(({score}) => score),
        borderColor: colors.line,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: points.map((_, idx) => (idx === lastIdx ? 5 : 3)),
        pointHoverRadius: 6,
        pointBackgroundColor: points.map((_, idx) =>
          idx === lastIdx ? colors.current : colors.line
        ),
        pointBorderColor: points.map((_, idx) => (idx === lastIdx ? colors.current : colors.line))
      }
    ]
  }
  return (
    <div className='h-20'>
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          layout: {padding: 8},
          plugins: {
            legend: {display: false},
            tooltip: {
              displayColors: false,
              backgroundColor: tooltipColors.background,
              titleColor: tooltipColors.text,
              bodyColor: tooltipColors.text,
              callbacks: {
                title: (items: TooltipItem<'line'>[]) =>
                  dayjs(points[items[0]!.dataIndex]!.endedAt).format('MMM D, YYYY'),
                label: (item: TooltipItem<'line'>) => `${item.parsed.y!.toFixed(1)} / 5`
              }
            }
          },
          scales: {
            x: {display: false, grid: {display: false}},
            y: {display: false, grid: {display: false}, min: 1}
          }
        }}
      />
    </div>
  )
}

export default TeamHealthTrendChart
