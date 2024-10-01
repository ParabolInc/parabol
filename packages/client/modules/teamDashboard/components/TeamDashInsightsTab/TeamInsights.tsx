import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {marked} from 'marked'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import sanitizeHtml from 'sanitize-html'
import {TeamInsightsQuery} from '../../../../__generated__/TeamInsightsQuery.graphql'

interface Props {
  queryRef: PreloadedQuery<TeamInsightsQuery>
}

const query = graphql`
  query TeamInsightsQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        id
        name
        insight {
          meetingsCount
          wins
          challenges
          startDateTime
          endDateTime
        }
      }
    }
  }
`

const Insights = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<TeamInsightsQuery>(query, queryRef)
  const insight = data.viewer.team?.insight

  const renderMarkdown = (text: string) => {
    const renderedText = marked(text, {
      gfm: true,
      breaks: true
    }) as string
    return sanitizeHtml(renderedText, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['a']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        a: ['href', 'target', 'rel']
      },
      transformTags: {
        a: (tagName, attribs) => {
          return {
            tagName,
            attribs: {
              ...attribs,
              target: '_blank',
              rel: 'noopener noreferrer'
            }
          }
        }
      }
    })
  }

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
    <div className='mb-8 space-y-6'>
      <p className='text-sm text-slate-700'>
        Only you (as <span className='font-bold'>Team Lead</span>) can see Team Insights. Insights
        are auto-generated.{' '}
        <a
          href='#'
          className='font-semibold text-sky-500 hover:underline'
          target='_blank'
          rel='noopener noreferrer'
        >
          Give us feedback
        </a>
        .
      </p>
      <div className='mx-auto aspect-[1/1.414] max-w-3xl overflow-y-auto rounded-lg bg-white py-6 px-12 shadow-md'>
        <h2 className='mb-4 flex items-center text-2xl font-semibold'>
          <AutoAwesomeIcon className='mr-2 text-grape-500' />
          <span>Insights - {dateRange}</span>
        </h2>
        <p className='mb-6 text-sm text-slate-600'>Summarized {insight?.meetingsCount} meetings</p>

        <h3 className='mb-0 text-lg font-semibold text-slate-700'>Wins</h3>
        <p className='mb-2 mt-0 text-sm italic text-slate-600'>
          What wins has this team seen during this timeframe?
        </p>
        <ul className='mb-6 list-disc pl-6'>
          {insight?.wins.map((win, index) => (
            <li key={index} className='text-sm text-slate-700'>
              <span
                className='summary-link-style'
                dangerouslySetInnerHTML={{__html: renderMarkdown(win)}}
              />
            </li>
          ))}
        </ul>

        <h3 className='mb-0 text-lg font-semibold text-slate-700'>Challenges</h3>
        <p className='mb-2 mt-0 text-sm italic text-slate-600'>
          What challenges has this team faced during this timeframe?
        </p>
        <ul className='list-disc pl-6'>
          {insight?.challenges.map((challenge, index) => (
            <li key={index} className='text-sm text-slate-700'>
              <span
                className='summary-link-style'
                dangerouslySetInnerHTML={{__html: renderMarkdown(challenge)}}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Insights
