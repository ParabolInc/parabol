import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useDispatch} from 'react-redux'
import {useLazyLoadQuery} from 'react-relay'
import {ActiveMeetingsQuery} from '../../__generated__/ActiveMeetingsQuery.graphql'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {openStartActivityModal} from '../../reducers'
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
  const dispatch = useDispatch()
  const data = useLazyLoadQuery<ActiveMeetingsQuery>(
    graphql`
      query ActiveMeetingsQuery {
        viewer {
          teams {
            ...ActiveMeetings_team @relay(mask: false)
            viewerTeamMember {
              id
              integrations {
                mattermost {
                  linkedChannels
                }
              }
            }
          }
        }
      }
    `,
    {},
    {
      networkCacheConfig: {
        force: true,
        poll: 15000
      }
    }
  )

  const linkedTeams = useMemo(() => {
    const {viewer} = data
    return viewer.teams.filter(
      (team) =>
        channel &&
        team.viewerTeamMember?.integrations.mattermost.linkedChannels.includes(channel.id)
    )
  }, [data, channel])

  const handleStart = () => {
    dispatch(openStartActivityModal())
  }

  const isLoading = false
  const error = false

  return (
    <>
      <div className='flex items-center justify-between py-3 text-2xl font-semibold'>
        Open Activities
        <button className='btn btn-primary' onClick={handleStart}>
          Start Activity
        </button>
      </div>
      {isLoading && <LoadingSpinner text='Loading...' />}
      {error && (
        <div className='error-text p-2'>Loading meetings failed, try refreshing the page</div>
      )}
      {linkedTeams?.length === 0 && (
        <p className='self-center p-2 font-semibold'>There are no teams linked to this channel</p>
      )}
      <div className='flex flex-col overflow-y-scroll'>
        {linkedTeams?.map((team) =>
          team.activeMeetings.map((meeting) => <MeetingRow meetingRef={meeting} />)
        )}
      </div>
    </>
  )
}

export default ActiveMeetings
