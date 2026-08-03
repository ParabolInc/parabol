import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Navigate, useNavigate} from 'react-router'
import type {MeetingSeriesManagementPageQuery} from '../__generated__/MeetingSeriesManagementPageQuery.graphql'
import {MeetingSeriesEditForm} from './MeetingSeriesEditForm'

interface Props {
  queryRef: PreloadedQuery<MeetingSeriesManagementPageQuery>
}

const MeetingSeriesManagementPage = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<MeetingSeriesManagementPageQuery>(
    graphql`
      query MeetingSeriesManagementPageQuery($meetingSeriesId: ID!) {
        viewer {
          meetingSeries(meetingSeriesId: $meetingSeriesId) {
            id
            activeMeetings {
              id
            }
            ...MeetingSeriesEditForm_series
          }
        }
      }
    `,
    queryRef
  )

  const navigate = useNavigate()
  const meetingSeries = data.viewer.meetingSeries

  if (!meetingSeries) {
    return <Navigate replace to='/meetings' />
  }

  const activeMeeting = meetingSeries.activeMeetings[0]
  if (activeMeeting) {
    return <Navigate replace to={`/meet/${activeMeeting.id}`} />
  }

  return (
    <div className='mx-auto mt-8 max-w-xl rounded-lg bg-surface-card p-6 shadow-md'>
      <h1 className='m-0 mb-2 font-semibold text-fg-primary text-xl'>Scheduled meeting</h1>
      <p className='m-0 mb-4 text-fg-secondary text-sm'>
        Edit the schedule, rename the series, or cancel it. The first meeting hasn't started yet.
      </p>
      <MeetingSeriesEditForm
        seriesRef={meetingSeries}
        onClose={() => navigate('/meetings')}
        onCancelled={() => navigate('/meetings')}
      />
    </div>
  )
}

export default MeetingSeriesManagementPage
