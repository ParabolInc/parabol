import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Navigate, useNavigate} from 'react-router'
import type {MeetingSeriesManagementPageQuery} from '../__generated__/MeetingSeriesManagementPageQuery.graphql'
import {PALETTE} from '../styles/paletteV3'
import {MeetingSeriesEditForm} from './MeetingSeriesEditForm'

const PageRoot = styled('div')({
  maxWidth: 560,
  margin: '32px auto',
  padding: 24,
  backgroundColor: PALETTE.WHITE,
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
})

const PageHeader = styled('h1')({
  fontSize: 22,
  fontWeight: 600,
  margin: '0 0 8px 0',
  color: PALETTE.SLATE_900
})

const Subhead = styled('p')({
  margin: '0 0 16px 0',
  color: PALETTE.SLATE_600,
  fontSize: 14
})

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
    <PageRoot>
      <PageHeader>Scheduled meeting</PageHeader>
      <Subhead>
        Edit the schedule, rename the series, or cancel it. The first meeting hasn't started yet.
      </Subhead>
      <MeetingSeriesEditForm
        seriesRef={meetingSeries}
        onClose={() => navigate('/meetings')}
        onCancelled={() => navigate('/meetings')}
      />
    </PageRoot>
  )
}

export default MeetingSeriesManagementPage
