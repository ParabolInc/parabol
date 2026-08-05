import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type TooltipItem
} from 'chart.js'
import {Bar} from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

// one color per Likert score, low (disagree) -> high (agree), pulled from paletteV3
const BAR_COLORS = ['#FD7F77', '#FBB337', '#E0DDEC', '#91E8B7', '#40B574']
const SCORE_LABELS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree'
] as const

interface Props {
  // count of responses at each Likert score, index 0 = score 1 ... index 4 = score 5
  distribution: number[]
}

const TeamHealthDistributionChart = (props: Props) => {
  const {distribution} = props
  const data = {
    labels: [...SCORE_LABELS],
    datasets: [
      {
        data: distribution,
        backgroundColor: BAR_COLORS,
        borderRadius: 4,
        borderSkipped: false as const,
        // keep bars from stretching to full column width on cards with few responses
        categoryPercentage: 0.7,
        barPercentage: 0.9
      }
    ]
  }
  return (
    <div className='h-20'>
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {display: false},
            tooltip: {
              displayColors: false,
              callbacks: {
                title: (items: TooltipItem<'bar'>[]) => SCORE_LABELS[items[0]!.dataIndex]!,
                label: (item: TooltipItem<'bar'>) => {
                  const count = item.parsed.y
                  return `${count} ${count === 1 ? 'response' : 'responses'}`
                }
              }
            }
          },
          scales: {
            x: {display: false, grid: {display: false}},
            y: {display: false, grid: {display: false}, beginAtZero: true}
          }
        }}
      />
    </div>
  )
}

export default TeamHealthDistributionChart
