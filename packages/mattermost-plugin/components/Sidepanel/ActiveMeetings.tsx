import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import {ActiveMeetingsQuery} from '../../__generated__/ActiveMeetingsQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import LoadingSpinner from '../LoadingSpinner'
import MeetingRow from './MeetingRow'

graphql`
  fragment ActiveMeetings_team on Team {
    id
    activeMeetings {
      ...MeetingRow_meeting
    }
  }
`

const ActiveMeetings = () => {
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<ActiveMeetingsQuery>(
    graphql`
      query ActiveMeetingsQuery($channel: ID!) {
        config {
          parabolUrl
        }
        linkedTeamIds(channel: $channel)
        viewer {
          teams {
            ...ActiveMeetings_team @relay(mask: false)
          }
        }
      }
    `,
    {
      channel: channel?.id ?? ''
    },
    {
      networkCacheConfig: {
        force: true,
        poll: 15000
      }
    }
  )
  const {viewer, linkedTeamIds} = data
  const linkedTeams = viewer.teams.filter(
    (team) => !linkedTeamIds || linkedTeamIds.includes(team.id)
  )
  const isLoading = false
  const error = false

  return (
    <div>
      {isLoading && <LoadingSpinner text='Loading...' />}
      {error && (
        <div className='error-text p-2'>Loading meetings failed, try refreshing the page</div>
      )}
      {linkedTeams?.length === 0 && (
        <p className='self-center p-2 font-semibold'>There are no teams linked to this channel</p>
      )}
      {linkedTeams?.map((team) =>
        team.activeMeetings.map((meeting) => <MeetingRow meetingRef={meeting} />)
      )}
    </div>
  )
}

export default ActiveMeetings
