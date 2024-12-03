import React from 'react'
import graphql from 'babel-plugin-relay/macro'

import {useDispatch} from 'react-redux'

import {openStartActivityModal} from '../../reducers'

import LoadingSpinner from '../LoadingSpinner'
import {useLazyLoadQuery} from 'react-relay'
import {ActiveMeetingsQuery} from '../../__generated__/ActiveMeetingsQuery.graphql'
import MeetingRow from './MeetingRow'


const ActiveMeetings = () => {
  //const {data: meetings, isLoading, error, refetch} = useActiveMeetingsQuery()
  const data = useLazyLoadQuery<ActiveMeetingsQuery>(
    graphql`
      query ActiveMeetingsQuery {
        config {
          __typename
          parabolUrl
        }
        viewer {
          teams {
            id
            activeMeetings {
              ...MeetingRow_meeting @relay(plural: true)
            }
          }
        }
      }
    `, {})
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

