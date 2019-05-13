import React from 'react'
import {MeetingSummaryReferrer} from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/MeetingSummaryEmail'
import {sheetShadow} from 'universal/styles/elevation'
import SummaryHeader from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/SummaryHeader'
import QuickStats from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/QuickStats'
import SummarySheetCTA from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/SummarySheetCTA'
import ExportToCSV from 'universal/modules/email/components/SummaryEmail/ExportToCSV'
import {createFragmentContainer, graphql} from 'react-relay'
import MeetingMembersWithoutTasks from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/MeetingMembersWithoutTasks'
import MeetingMembersWithTasks from './MeetingMembersWithTasks'
import SummaryEmailScheduleCalendar from 'universal/modules/email/components/SummaryEmail/SummaryEmailScheduleCalendar'
import {ACTION} from 'universal/utils/constants'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'
import ContactUsFooter from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/ContactUsFooter'
import LogoFooter from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/LogoFooter'
import CreateAccountSection from 'universal/modules/email/components/CreateAccountSection/CreateAccountSection'
import RetroTopics from 'universal/modules/email/components/SummaryEmail/MeetingSummaryEmail/RetroTopics'
import {SummarySheet_meeting} from '__generated__/SummarySheet_meeting.graphql'

interface Props {
  emailCSVUrl: string
  isDemo?: boolean
  meeting: SummarySheet_meeting
  referrer: MeetingSummaryReferrer
  referrerUrl?: string
  teamDashUrl: string
  meetingUrl: string
  urlAction?: 'csv'
}

const sheetStyle = {
  borderSpacing: 0,
  boxShadow: sheetShadow
}

const SummarySheet = (props: Props) => {
  const {emailCSVUrl, urlAction, meeting, meetingUrl, referrer, teamDashUrl} = props
  const {createdAt, meetingNumber, meetingType, team} = meeting
  const {name: teamName} = team
  const isDemo = !!props.isDemo
  const {id: meetingId} = meeting
  const meetingLabel = meetingTypeToLabel[meetingType]
  return (
    <table width='100%' height='100%' align='center' bgcolor='#ffffff' style={sheetStyle}>
      <tbody>
        <tr>
          <td>
            <SummaryHeader meeting={meeting} />
            <QuickStats meeting={meeting} />
          </td>
        </tr>
        <SummarySheetCTA referrer={referrer} isDemo={isDemo} teamDashUrl={teamDashUrl} />
        <ExportToCSV emailCSVUrl={emailCSVUrl} meetingId={meetingId} urlAction={urlAction} />
        <CreateAccountSection isDemo={isDemo} />
        <MeetingMembersWithTasks meeting={meeting} />
        <MeetingMembersWithoutTasks meeting={meeting} />
        <RetroTopics imageSource={referrer === 'email' ? 'static' : 'local'} meeting={meeting} />
        <SummaryEmailScheduleCalendar
          createdAt={createdAt}
          meetingUrl={meetingUrl}
          meetingNumber={meetingNumber}
          teamName={teamName}
        />
        <ContactUsFooter
          hasLearningLink={meetingType === ACTION}
          prompt={`How’d your ${meetingLabel} meeting go?`}
          tagline='We’re eager for your feedback!'
        />
        <LogoFooter />
      </tbody>
    </table>
  )
}

export default createFragmentContainer(
  SummarySheet,
  graphql`
    fragment SummarySheet_meeting on NewMeeting {
      id
      ...SummaryHeader_meeting
      ...QuickStats_meeting
      ...MeetingMembersWithTasks_meeting
      ...MeetingMembersWithoutTasks_meeting
      ...RetroTopics_meeting
      meetingType
      meetingNumber
      team {
        name
      }
      createdAt
    }
  `
)
