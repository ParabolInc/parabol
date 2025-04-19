import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useFragment} from 'react-relay'
import {TeamInsightContent_team$key} from '../../../../__generated__/TeamInsightContent_team.graphql'
import renderMarkdown from '../../../../utils/renderMarkdown'
interface Props {
  teamName: string
  insightRef: TeamInsightContent_team$key
}

const TeamInsightContent = (props: Props) => {
  const {insightRef, teamName} = props
  const insight = useFragment(
    graphql`
      fragment TeamInsightContent_team on Insight {
        meetingsCount
        wins
        challenges
        startDateTime
        endDateTime
      }
    `,
    insightRef
  )
  const {meetingsCount, wins, challenges} = insight

  const formatDateRange = (start: string, end: string) => {
    const startDate = dayjs(start)
    const endDate = dayjs(end)

    if (startDate.year() === endDate.year()) {
      return `${startDate.format('MMM')} to ${endDate.format('MMM YYYY')}`
    } else {
      return `${startDate.format('MMM YYYY')} to ${endDate.format('MMM YYYY')}`
    }
  }

  const dateRange = insight
    ? formatDateRange(insight.startDateTime, insight.endDateTime)
    : 'Date range not available'

  return (
    <div className='mx-auto aspect-[1/1.414] w-[640px] max-w-3xl overflow-y-auto rounded-lg bg-white px-[56px] pt-8 shadow-md'>
      <h2 className='mt-0 mb-4 flex items-center pt-0 text-2xl leading-9 font-semibold'>
        <AutoAwesomeIcon className='mr-2 h-9 w-9 text-grape-500' />
        <span>Insights - {dateRange}</span>
      </h2>
      <p className='mb-6 text-sm text-slate-600'>Summarized {meetingsCount} meetings</p>

      {wins && wins.length > 0 && (
        <>
          <h3 className='mb-0 text-lg font-semibold text-slate-700'>Wins</h3>
          <p className='mt-0 mb-2 text-sm text-slate-600 italic'>
            What wins has "{teamName}" seen during this timeframe?
          </p>
          <ul className='mb-6 list-disc space-y-0 pl-6'>
            {wins.map((win, index) => (
              <li key={index} className='text-sm text-slate-700'>
                <span
                  className='link-style'
                  dangerouslySetInnerHTML={{__html: renderMarkdown(win)}}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      {challenges && challenges.length > 0 && (
        <>
          <h3 className='mb-0 text-lg font-semibold text-slate-700'>Challenges</h3>
          <p className='mt-0 mb-2 text-sm text-slate-600 italic'>
            What challenges has "{teamName}" faced during this timeframe?
          </p>
          <ul className='list-disc space-y-0 pl-6'>
            {challenges.map((challenge, index) => (
              <li key={index} className='text-sm text-slate-700'>
                <span
                  className='link-style'
                  dangerouslySetInnerHTML={{__html: renderMarkdown(challenge)}}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default TeamInsightContent
