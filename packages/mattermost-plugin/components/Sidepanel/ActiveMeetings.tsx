import graphql from 'babel-plugin-relay/macro'

import {useDispatch} from 'react-redux'

import {openStartActivityModal} from '../../reducers'

import LoadingSpinner from '../LoadingSpinner'
import {useLazyLoadQuery} from 'react-relay'
import {ActiveMeetingsQuery} from '../../__generated__/ActiveMeetingsQuery.graphql'
import MeetingRow from './MeetingRow'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'


const ActiveMeetings = () => {
  //const {data: meetings, isLoading, error, refetch} = useActiveMeetingsQuery()
  const channel = useCurrentChannel()
  const data = useLazyLoadQuery<ActiveMeetingsQuery>(
    graphql`
      query ActiveMeetingsQuery($channel: ID!) {
        config {
          __typename
          parabolUrl
        }
        viewer {
          linkedTeams(channel: $channel) @waterfall {
            id
          }
          teams {
            id
            activeMeetings {
              ...MeetingRow_meeting
            }
          }
        }
      }
    `, {
      channel: channel.id
    })
  console.log('GEORG data', data)
  const viewer = data.viewer
  const teams = viewer.teams
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
      {isLoading && <LoadingSpinner text='Loading...'/>}
      {error && <div className='error-text'>Loading meetings failed, try refreshing the page</div>}
      {teams?.map((team) => (
        team.activeMeetings.map((meeting) => (
          <MeetingRow meetingRef={meeting} />
        ))
      ))}
    </div>
  )
}

export default ActiveMeetings

