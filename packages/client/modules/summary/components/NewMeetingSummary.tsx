import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {NewMeetingSummaryQuery} from '../../../__generated__/NewMeetingSummaryQuery.graphql'
import DashTopBar from '../../../components/DashTopBar'
import DashSidebar from '../../../components/Dashboard/DashSidebar'
import MeetingLockedOverlay from '../../../components/MeetingLockedOverlay'
import useDocumentTitle from '../../../hooks/useDocumentTitle'
import useRouter from '../../../hooks/useRouter'
import useSidebar from '../../../hooks/useSidebar'
import useSnacksForNewMeetings from '../../../hooks/useSnacksForNewMeetings'
import {APP_CORS_OPTIONS} from '../../../types/cors'
import {MEETING_SUMMARY_LABEL} from '../../../utils/constants'
import isDemoRoute from '../../../utils/isDemoRoute'
import makeHref from '../../../utils/makeHref'
import {demoTeamId} from '../../demo/initDB'
import MeetingSummaryEmail from '../../email/components/SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'

interface Props {
  queryRef: PreloadedQuery<NewMeetingSummaryQuery>
  urlAction?: 'csv' | undefined
}

const query = graphql`
  query NewMeetingSummaryQuery($meetingId: ID!, $first: Int!, $after: DateTime) {
    ...DashTopBar_query
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
      teams {
        activeMeetings {
          ...useSnacksForNewMeetings_meetings
        }
      }
    }
  }
`

const NewMeetingSummary = (props: Props) => {
  const {urlAction, queryRef} = props
  const data = usePreloadedQuery<NewMeetingSummaryQuery>(query, queryRef)
  const {viewer} = data
  const {newMeeting, teams} = viewer
  const activeMeetings = teams.flatMap((team) => team.activeMeetings).filter(Boolean)
  const {history} = useRouter()
  useEffect(() => {
    if (!newMeeting) {
      history.replace('/meetings')
    }
  }, [history, newMeeting])
  if (!newMeeting) {
    return null
  }
  // eslint-disable react-hooks/rules-of-hooks -- return above violates these rules, but is just a safeguard and not normal usage
  const {id: meetingId, name: meetingName, team} = newMeeting
  const {id: teamId, name: teamName} = team
  const title = `${meetingName} ${MEETING_SUMMARY_LABEL} | ${teamName}`
  useDocumentTitle(title, 'Summary')
  const meetingUrl = makeHref(`/meet/${meetingId}`)
  const teamDashUrl = `/team/${teamId}/tasks`
  const {isOpen, toggle} = useSidebar()
  const emailCSVUrl = isDemoRoute()
    ? `/retrospective-demo-summary/csv`
    : `/new-summary/${meetingId}/csv`

  useSnacksForNewMeetings(activeMeetings as any)
  return (
    <>
      {!isDemoRoute() && (
        <div className='hidden print:hidden lg:block'>
          <DashTopBar queryRef={data} toggle={toggle} />
        </div>
      )}
      <div className='h-100 flex flex-1 overflow-auto bg-slate-200'>
        {!isDemoRoute() && (
          <div className='hidden print:hidden lg:block'>
            <DashSidebar viewerRef={viewer} isOpen={isOpen} />
          </div>
        )}
        <div className='h-full w-full overflow-auto'>
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
        </div>
        <MeetingLockedOverlay meetingRef={newMeeting} />
      </div>
    </>
  )
}

export default NewMeetingSummary
