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
        viewer {
          linkedTeamIds(channel: $channel)
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
  const viewer = data.viewer
  const linkedTeams = viewer.teams.filter(
    (team) => !viewer.linkedTeamIds || viewer.linkedTeamIds.includes(team.id)
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
      <button onClick={handleStartActivity}>Start Activity</button>
      {isLoading && <LoadingSpinner text='Loading...' />}
      {error && <div className='error-text'>Loading meetings failed, try refreshing the page</div>}
      {linkedTeams?.map((team) =>
        team.activeMeetings.map((meeting) => <MeetingRow meetingRef={meeting} />)
      )}
    </div>
  )
}

export default ActiveMeetings
