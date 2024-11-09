import graphql from 'babel-plugin-relay/macro'
import {MeetingSummaryEmailRootSSRQuery} from 'parabol-client/__generated__/MeetingSummaryEmailRootSSRQuery.graphql'
import {useLazyLoadQuery} from 'react-relay'
import {EMAIL_CORS_OPTIONS} from '../../../types/cors'
import makeAppURL from '../../../utils/makeAppURL'
import MeetingSummaryEmail from './SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'

const query = graphql`
  query MeetingSummaryEmailRootSSRQuery($meetingId: ID!) {
    viewer {
      meeting(meetingId: $meetingId) {
        meetingType
        team {
          id
        }
        ...MeetingSummaryEmail_meeting
      }
    }
  }
`

interface Props {
  appOrigin: string
  meetingId: string
}

export const meetingSummaryUrlParams = {
  utm_source: 'summary email',
  utm_medium: 'email',
  utm_campaign: 'after-meeting'
}

const MeetingSummaryEmailRootSSR = (props: Props) => {
  const {appOrigin, meetingId} = props
  const data = useLazyLoadQuery<MeetingSummaryEmailRootSSRQuery>(
    query,
    {meetingId},
    // fetchKey must change in order to trigger new fetch. fetchPolicy is not enough!
    {fetchKey: Math.random()}
  )
  // viewer will be null on initial SSR render
  if (!data?.viewer) return null
  const {viewer} = data
  const {meeting} = viewer
  if (!meeting) return null
  const {team} = meeting
  const {id: teamId} = team
  const options = {searchParams: meetingSummaryUrlParams}
  const referrerUrl = makeAppURL(appOrigin, `new-summary/${meetingId}`, options)
  const meetingUrl = makeAppURL(appOrigin, `meet/${meetingId}`, options)
  const teamDashUrl = makeAppURL(appOrigin, `team/${teamId}`, options)
  const emailCSVUrl = makeAppURL(appOrigin, `new-summary/${meetingId}/csv`, options)
  return (
    <MeetingSummaryEmail
      meeting={meeting}
      referrer={'email'}
      teamDashUrl={teamDashUrl}
      meetingUrl={meetingUrl}
      referrerUrl={referrerUrl}
      emailCSVUrl={emailCSVUrl}
      appOrigin={appOrigin}
      corsOptions={EMAIL_CORS_OPTIONS}
    />
  )
}

export default MeetingSummaryEmailRootSSR
