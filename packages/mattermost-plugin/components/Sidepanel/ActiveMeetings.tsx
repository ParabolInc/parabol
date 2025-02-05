import graphql from 'babel-plugin-relay/macro'

import {useDispatch} from 'react-redux'

import {openStartActivityModal} from '../../reducers'

import {useLazyLoadQuery} from 'react-relay'
import {ActiveMeetingsQuery} from '../../__generated__/ActiveMeetingsQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import LoadingSpinner from '../LoadingSpinner'
import MeetingRow from './MeetingRow'

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
            id
            activeMeetings {
              ...MeetingRow_meeting
            }
          }
        }
      }
    `,
    {
      channel: channel.id
    }
  )
  const {viewer, linkedTeamIds} = data
  const linkedTeams = viewer.teams.filter(
    (team) => !linkedTeamIds || linkedTeamIds.includes(team.id)
  )
  const isLoading = false
  const error = false

  const dispatch = useDispatch()

  const handleStartActivity = () => {
    dispatch(openStartActivityModal())
  }

  return (
    <div>
      <h2>Active Meetings</h2>
      <button className='btn btn-primary' onClick={handleStartActivity}>
        Start Activity
      </button>
      {isLoading && <LoadingSpinner text='Loading...' />}
      {error && <div className='error-text'>Loading meetings failed, try refreshing the page</div>}
      {linkedTeams?.map((team) =>
        team.activeMeetings.map((meeting) => <MeetingRow meetingRef={meeting} />)
      )}
    </div>
  )
}

export default ActiveMeetings
