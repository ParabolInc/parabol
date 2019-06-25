import {NewMeetingSummary_viewer} from '__generated__/NewMeetingSummary_viewer.graphql'
import React, {useEffect} from 'react'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import {MEETING_SUMMARY_LABEL} from 'universal/utils/constants'
import makeHref from 'universal/utils/makeHref'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'
import {demoTeamId} from 'universal/modules/demo/initDB'
import MeetingSummaryEmail from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'
import useRouter from 'universal/hooks/useRouter'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  viewer: NewMeetingSummary_viewer
  urlAction?: 'csv' | undefined
}

const NewMeetingSummary = (props: Props) => {
  const {
    urlAction,
    viewer: {newMeeting}
  } = props
  const {history} = useRouter()
  useEffect(() => {
    if (!newMeeting) {
      history.replace('/me')
    }
  }, [newMeeting])
  if (!newMeeting) {
    return null
  }
  const {
    id: meetingId,
    meetingNumber,
    meetingType,
    team: {id: teamId, name: teamName}
  } = newMeeting
  const meetingLabel = meetingTypeToLabel[meetingType]
  const title = `${meetingLabel} Meeting ${MEETING_SUMMARY_LABEL} | ${teamName} ${meetingNumber}`
  const slug = meetingTypeToSlug[meetingType]
  const meetingUrl = makeHref(`/${slug}/${teamId}`)
  const teamDashUrl = `/team/${teamId}`
  const emailCSVUrl = `/new-summary/${meetingId}/csv`
  return (
    <div style={{backgroundColor: PALETTE.BACKGROUND_MAIN, minHeight: '100vh'}}>
      <Helmet title={title} />
      <MeetingSummaryEmail
        urlAction={urlAction}
        isDemo={teamId === demoTeamId}
        meeting={newMeeting}
        referrer='meeting'
        meetingUrl={meetingUrl}
        teamDashUrl={teamDashUrl}
        emailCSVUrl={emailCSVUrl}
      />
    </div>
  )
}

export default createFragmentContainer(
  NewMeetingSummary,
  graphql`
    fragment NewMeetingSummary_viewer on User {
      newMeeting(meetingId: $meetingId) {
        ...MeetingSummaryEmail_meeting
        id
        team {
          id
          name
        }
        meetingType
        meetingNumber
      }
    }
  `
)
