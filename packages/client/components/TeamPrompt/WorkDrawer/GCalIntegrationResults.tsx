import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {GCalIntegrationResultsQuery} from '../../../__generated__/GCalIntegrationResultsQuery.graphql'
// import {GCalIntegrationResultsSearchPaginationQuery} from '../../../__generated__/GCalIntegrationResultsSearchPaginationQuery.graphql'
// import {GCalIntegrationResults_search$key} from '../../../__generated__/GCalIntegrationResults_search.graphql'
// import useLoadNextOnScrollBottom from '../../../hooks/useLoadNextOnScrollBottom'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
// import Ellipsis from '../../Ellipsis/Ellipsis'
import clsx from 'clsx'
import relativeDate from '../../../utils/date/relativeDate'

interface Props {
  queryRef: PreloadedQuery<GCalIntegrationResultsQuery>
  order: 'DESC' | 'ASC'
}

const GCalIntegrationResults = (props: Props) => {
  const {queryRef, order} = props
  const query = usePreloadedQuery(
    graphql`
      query GCalIntegrationResultsQuery($teamId: ID!, $startDate: DateTime!, $endDate: DateTime!) {
        # ...GCalIntegrationResults_search @arguments(teamId: $teamId)
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              gcal {
                events(startDate: $startDate, endDate: $endDate) {
                  summary
                  status
                  startDate
                  endDate
                  link
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const gcal = query.viewer.teamMember?.integrations.gcal

  // const gcalResults = gcal?.events
  const gcalResults = gcal?.events ? [...gcal?.events] : null
  if (order === 'DESC') {
    gcalResults?.reverse()
  }

  return (
    <>
      <div className='mt-4 flex flex h-full flex-col gap-y-2 overflow-auto px-4'>
        {gcalResults && gcalResults.length > 0 ? (
          gcalResults?.map((result, idx) => {
            if (!result) {
              return null
            }
            return (
              <a
                key={idx}
                href={result.link ?? undefined}
                target='_blank'
                className={clsx(
                  'group',
                  result.status === 'accepted' && 'font-semibold text-white'
                )}
                rel='noreferrer'
              >
                <div
                  className={clsx(
                    'rounded border border-solid border-slate-300 p-4 hover:border-slate-600',
                    result.status === 'accepted' && 'bg-sky-500 font-semibold text-white'
                  )}
                >
                  <div className='my-2 group-hover:underline'>{result.summary}</div>
                  <div className='text-sm'>
                    {result.startDate && relativeDate(result.startDate)}
                  </div>
                </div>
              </a>
            )
          })
        ) : (
          <div className='-mt-14 flex h-full flex-col items-center justify-center'>
            <img className='w-20' src={halloweenRetrospectiveTemplate} />
            <div className='mt-7 w-2/3 text-center'>
              oops
              {/* {errors?.[0]?.message
                ? errors?.[0]?.message
                : `Looks like you don’t have any ${
                    queryType === 'issue' ? 'issues' : 'pull requests'
                  } to display.`} */}
            </div>
          </div>
        )}
        {/* {lastItem}
        {hasNext && (
          <div className='mx-auto mb-4 -mt-4 h-8 text-2xl' key={'loadingNext'}>
            <Ellipsis />
          </div>
        )} */}
      </div>
    </>
  )
}

export default GCalIntegrationResults
