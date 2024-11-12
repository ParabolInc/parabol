import {OpenInNew} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router-dom'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import {GCalIntegrationResultsQuery} from '../../../__generated__/GCalIntegrationResultsQuery.graphql'
import GCalEventCard from './GCalEventCard'

interface Props {
  queryRef: PreloadedQuery<GCalIntegrationResultsQuery>
  order: 'DESC' | 'ASC'
  teamId: string
}

const GCalIntegrationResults = (props: Props) => {
  const {queryRef, order, teamId} = props
  const query = usePreloadedQuery(
    graphql`
      query GCalIntegrationResultsQuery($teamId: ID!, $startDate: DateTime!, $endDate: DateTime!) {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              gcal {
                events(startDate: $startDate, endDate: $endDate) {
                  startDate
                  endDate
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

  const gcalResults = gcal?.events ? [...gcal!.events] : null
  if (order === 'DESC') {
    gcalResults?.reverse()
  }

  const gcalEventsByDay = gcalResults?.reduce<{[day: string]: typeof gcalResults}>(
    (eventsByDate, event) => {
      const eventDate = event.startDate ?? event.endDate
      const parsedEventDate = eventDate ? new Date(eventDate) : new Date()
      const eventDay = new Date(parsedEventDate.setHours(0, 0, 0, 0)).toJSON()
      const eventsForDay = eventsByDate[eventDay]
      if (eventsForDay) {
        eventsForDay.push(event)
      } else {
        eventsByDate[eventDay] = [event]
      }
      return eventsByDate
    },
    {}
  )

  return (
    <>
      <div className='mt-4 flex h-full flex-col gap-y-4 overflow-auto px-4'>
        {gcalEventsByDay && Object.keys(gcalEventsByDay).length > 0 ? (
          <>
            {Object.entries(gcalEventsByDay).map(([dayString, events]) => {
              const date = new Date(dayString)
              return (
                <div key={dayString} className='flex flex-col gap-y-2'>
                  <div className='text-sm font-medium text-slate-600'>
                    {date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {events.map((event, idx) => (
                    <GCalEventCard key={idx} eventRef={event} />
                  ))}
                </div>
              )
            })}
            <a
              href='https://calendar.google.com'
              className='mb-4 flex items-center justify-center text-sm font-semibold text-sky-500 hover:text-sky-400'
              target='_blank'
              rel='noopener noreferrer'
            >
              See more events <OpenInNew className='ml-2 text-base' />
            </a>
          </>
        ) : (
          <div className='-mt-14 flex h-full flex-col items-center justify-center'>
            <img className='w-20' src={halloweenRetrospectiveTemplate} />
            <div className='mt-7 w-2/3 text-center'>
              Looks like you don’t have any events to display
            </div>
            <Link
              to={`/team/${teamId}/integrations`}
              className='mt-4 font-semibold text-sky-500 hover:text-sky-400'
            >
              Review your Google Calendar configuration
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

export default GCalIntegrationResults
