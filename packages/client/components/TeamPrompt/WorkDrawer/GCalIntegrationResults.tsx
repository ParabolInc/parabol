import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {GCalIntegrationResultsQuery} from '../../../__generated__/GCalIntegrationResultsQuery.graphql'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import GCalEventCard from './GCalEventCard'

interface Props {
  queryRef: PreloadedQuery<GCalIntegrationResultsQuery>
  order: 'DESC' | 'ASC'
}

const GCalIntegrationResults = (props: Props) => {
  const {queryRef, order} = props
  const query = usePreloadedQuery(
    graphql`
      query GCalIntegrationResultsQuery($teamId: ID!, $startDate: DateTime!, $endDate: DateTime!) {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              gcal {
                events(startDate: $startDate, endDate: $endDate) {
                  ...GCalEventCard_event
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
            return <GCalEventCard key={idx} eventRef={result} />
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
      </div>
    </>
  )
}

export default GCalIntegrationResults
