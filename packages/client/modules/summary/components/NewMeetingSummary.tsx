import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import DashSidebar from '../../../components/Dashboard/DashSidebar'
import MeetingLockedOverlay from '../../../components/MeetingLockedOverlay'
import useBreakpoint from '../../../hooks/useBreakpoint'
import useDocumentTitle from '../../../hooks/useDocumentTitle'
import useRouter from '../../../hooks/useRouter'
import {PALETTE} from '../../../styles/paletteV3'
import {Breakpoint} from '../../../types/constEnums'
import {APP_CORS_OPTIONS} from '../../../types/cors'
import {MEETING_SUMMARY_LABEL} from '../../../utils/constants'
import isDemoRoute from '../../../utils/isDemoRoute'
import makeHref from '../../../utils/makeHref'
import {NewMeetingSummaryQuery} from '../../../__generated__/NewMeetingSummaryQuery.graphql'
import {demoTeamId} from '../../demo/initDB'
import MeetingSummaryEmail from '../../email/components/SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'

interface Props {
  queryRef: PreloadedQuery<NewMeetingSummaryQuery>
  urlAction?: 'csv' | undefined
}

const query = graphql`
  query NewMeetingSummaryQuery($meetingId: ID!) {
    viewer {
      ...DashSidebar_viewer
      newMeeting(meetingId: $meetingId) {
        ...MeetingSummaryEmail_meeting
        ...MeetingLockedOverlay_meeting
        id
        team {
          id
          name
        }
        name
      }
    }
  }
`

const NewMeetingSummary = (props: Props) => {
  const {urlAction, queryRef} = props
  const data = usePreloadedQuery<NewMeetingSummaryQuery>(query, queryRef)
  const {viewer} = data
  const {newMeeting} = viewer
  const {history} = useRouter()
  useEffect(() => {
    if (!newMeeting) {
      history.replace('/meetings')
    }
  }, [history, newMeeting])
  if (!newMeeting) {
    return null
  }
  const {id: meetingId, name: meetingName, team} = newMeeting
  const {id: teamId, name: teamName} = team
  const title = `${meetingName} ${MEETING_SUMMARY_LABEL} | ${teamName}`
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useDocumentTitle(title, 'Summary')
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const meetingUrl = makeHref(`/meet/${meetingId}`)
  const teamDashUrl = `/team/${teamId}/tasks`
  const emailCSVUrl = isDemoRoute()
    ? `/retrospective-demo-summary/csv`
    : `/new-summary/${meetingId}/csv`

  return (
    <>
      <div style={{display: 'flex', backgroundColor: PALETTE.SLATE_200, minHeight: '100vh'}}>
        {isDesktop && <DashSidebar viewerRef={viewer} isOpen />}
        <MeetingSummaryEmail
          appOrigin={window.location.origin}
          urlAction={urlAction}
          isDemo={teamId === demoTeamId}
          meeting={newMeeting}
          referrer='meeting'
          meetingUrl={meetingUrl}
          teamDashUrl={teamDashUrl}
          emailCSVUrl={emailCSVUrl}
          corsOptions={APP_CORS_OPTIONS}
        />
        <MeetingLockedOverlay meetingRef={newMeeting} />
      </div>
    </>
  )
}

export default NewMeetingSummary
