import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useDocumentTitle from '../../../hooks/useDocumentTitle'
import useRouter from '../../../hooks/useRouter'
import {PALETTE} from '../../../styles/paletteV3'
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
      newMeeting(meetingId: $meetingId) {
        ...MeetingSummaryEmail_meeting
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

  const {t} = useTranslation()

  const data = usePreloadedQuery<NewMeetingSummaryQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
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
  const title = t('NewMeetingSummary.MeetingNameMeetingSummaryLabelTeamName', {
    meetingName,
    meetingSummaryLabel: MEETING_SUMMARY_LABEL,
    teamName
  })
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useDocumentTitle(title, t('NewMeetingSummary.Summary'))
  const meetingUrl = makeHref(
    t('NewMeetingSummary.MeetMeetingId', {
      meetingId
    })
  )
  const teamDashUrl = t('NewMeetingSummary.TeamTeamId', {
    teamId
  })
  const emailCSVUrl = isDemoRoute()
    ? t('NewMeetingSummary.RetrospectiveDemoSummaryCsv', {})
    : t('NewMeetingSummary.NewSummaryMeetingIdCsv', {
        meetingId
      })
  return (
    <div style={{backgroundColor: PALETTE.SLATE_200, minHeight: '100vh'}}>
      <MeetingSummaryEmail
        appOrigin={window.location.origin}
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

export default NewMeetingSummary
