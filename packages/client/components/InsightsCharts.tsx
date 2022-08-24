import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartDataset,
  ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  SubTitle,
  TimeScale,
  TimeSeriesScale,
  Title,
  Tooltip,
  TooltipOptions
} from 'chart.js'
import 'chartjs-adapter-dayjs-3'
import React, {useMemo} from 'react'
import {Bar, Line} from 'react-chartjs-2'
import {useFragment} from 'react-relay'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {FONT_FAMILY} from '../styles/typographyV2'
import {
  InsightsCharts_domain$key,
  MeetingTypeEnum
} from '../__generated__/InsightsCharts_domain.graphql'

ChartJS.register(
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  TimeSeriesScale,
  SubTitle,
  Title,
  Tooltip
)
ChartJS.defaults.font.family = FONT_FAMILY.SANS_SERIF

const ChartBlock = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%'
})

const HalfChartBlock = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%'
})

const HalfChartWrapper = styled('div')({
  margin: 8,
  marginLeft: 16,
  maxWidth: 476,
  backgroundColor: '#fff',
  boxShadow: Elevation.Z3,
  borderRadius: 4,
  width: '50%'
})

const FullChartWrapper = styled(HalfChartWrapper)({
  maxHeight: 312,
  maxWidth: 976,
  width: '100%'
})

interface Props {
  domainRef: InsightsCharts_domain$key
}

const filterZero: TooltipOptions<any>['filter'] = (item: any) => {
  return item?.raw?.y ?? 1 > 0
}

const meetingOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    point: {
      radius: 1,
      hoverRadius: 4
    }
  },
  layout: {
    padding: 16
  },
  scales: {
    x: {
      stacked: true,
      type: 'time',
      time: {
        displayFormats: {
          month: 'MMM'
        },
        round: 'month',
        tooltipFormat: 'MMMM YYYY'
      },
      grid: {
        display: false,
        drawBorder: false
      }
    },
    y: {
      stacked: true,
      grid: {
        display: false,
        drawBorder: false
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  },
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      enabled: true,
      displayColors: true,
      bodyAlign: 'center',
      titleAlign: 'center',
      filter: filterZero
    },
    title: {
      display: true,
      text: 'Total Meetings',
      font: {
        size: 20,
        weight: '400'
      }
    }
  }
}
const makeOptions = (title: string) => {
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: {
        // point will clip on hover when radius is 0
        radius: 1,
        hoverRadius: 4
      }
    },
    layout: {
      padding: 16
    },
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            month: 'MMM'
          },
          round: 'day',
          tooltipFormat: 'MMM DD'
        },
        grid: {
          display: false,
          drawBorder: false
        }
      },
      y: {
        grid: {
          display: false,
          drawBorder: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        displayColors: false,
        bodyAlign: 'center'
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 20,
          weight: '400'
        }
      }
    }
  }
  return options
}

const makeData = (data: any, borderColor: string, fillColor: string) => {
  const result: ChartData<'line'> = {
    datasets: [
      {
        data,
        borderColor,
        fill: {
          target: 'origin',
          above: fillColor
        }
      }
    ]
  }
  return result
}

const toDataSet = (time: (number | Date | string)[]) => {
  return time.map((x, idx) => ({
    x,
    y: idx + 1
  }))
}

type MeetingMeta = {
  type: MeetingTypeEnum
  label: string
  backgroundColor: string
  borderColor: string
}
const meetingMeta: MeetingMeta[] = [
  {
    type: 'retrospective',
    label: 'Retro',
    backgroundColor: PALETTE.SKY_500,
    borderColor: PALETTE.SKY_500
  },
  {
    type: 'poker',
    label: 'Poker',
    backgroundColor: PALETTE.ROSE_500,
    borderColor: PALETTE.ROSE_500
  },
  {
    type: 'action',
    label: 'Check-in',
    backgroundColor: PALETTE.FUSCIA_400,
    borderColor: PALETTE.FUSCIA_400
  },
  {
    type: 'teamPrompt',
    label: 'Standup',
    backgroundColor: PALETTE.GOLD_500,
    borderColor: PALETTE.GOLD_500
  }
]

const makeMeetingData = (flatMeetingStats: {createdAt: string; meetingType: MeetingTypeEnum}[]) => {
  const stats = flatMeetingStats
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    .map((stat) => ({meetingType: stat.meetingType, createdAt: new Date(stat.createdAt).getTime()}))
  const firstStat = stats[0]
  if (!firstStat) return {datasets: []}
  const curDate = new Date(firstStat.createdAt)
  const maxDate = Date.now()
  const dateBins = [] as number[]
  while (curDate.getTime() < maxDate) {
    dateBins.push(curDate.getTime())
    curDate.setMonth(curDate.getMonth() + 1)
  }
  const datasets: ChartDataset<'bar'>[] = meetingMeta.map((meta) => {
    const {backgroundColor, borderColor, type, label} = meta
    const statsForMeetingType = stats.filter((stat) => stat.meetingType === type)
    const data = dateBins.map((dateBin) => {
      return {
        x: dateBin,
        y: statsForMeetingType.filter((stat) => stat.createdAt < dateBin).length
        //  the types for chartjs are wrong, casting to a primitive array
      } as unknown as number
    })
    return {
      label,
      fill: true,
      data,
      backgroundColor,
      borderColor
    }
  })
  return {datasets} as ChartData<'bar'>
}

const membersOptions = makeOptions('Total Members')
const teamsOptions = makeOptions('Total Teams')

const InsightsCharts = (props: Props) => {
  const {domainRef} = props
  const domain = useFragment(
    graphql`
      fragment InsightsCharts_domain on Company {
        organizations {
          meetingStats {
            meetingType
            createdAt
          }
          teamStats {
            createdAt
          }
          organizationUsers {
            edges {
              node {
                user {
                  createdAt
                }
              }
            }
          }
        }
      }
    `,
    domainRef
  )
  const {organizations} = domain
  const {membersData, teamsData, meetingData} = useMemo(() => {
    const userCreatedAts = [
      ...new Set(
        organizations
          .map(({organizationUsers}) =>
            organizationUsers.edges.map((edge) => new Date(edge.node.user.createdAt).getTime())
          )
          .flat()
          .sort()
      )
    ]

    const teamCreatedAts = organizations
      .map(({teamStats}) => teamStats.map(({createdAt}) => new Date(createdAt).getTime()))
      .flat()
      .sort()

    const flatMeetingStats = organizations.map(({meetingStats}) => meetingStats).flat()
    const cumulativeUserCreatedAts = toDataSet(userCreatedAts)
    const cumulativeTeamCreatedAts = toDataSet(teamCreatedAts)
    const membersData = makeData(cumulativeUserCreatedAts, PALETTE.GRAPE_500, PALETTE.GRAPE_500_30)
    const teamsData = makeData(cumulativeTeamCreatedAts, PALETTE.JADE_400, PALETTE.JADE_400_30)
    const meetingData = makeMeetingData(flatMeetingStats)
    return {membersData, teamsData, meetingData}
  }, [organizations])
  return (
    <ChartBlock>
      <FullChartWrapper>
        <Bar height={312} options={meetingOptions} data={meetingData} />
      </FullChartWrapper>
      <HalfChartBlock>
        <HalfChartWrapper>
          <Line height={312} options={membersOptions} data={membersData} />
        </HalfChartWrapper>
        <HalfChartWrapper>
          <Line height={312} options={teamsOptions} data={teamsData} />
        </HalfChartWrapper>
      </HalfChartBlock>
    </ChartBlock>
  )
}
export default InsightsCharts
