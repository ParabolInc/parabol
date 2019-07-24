import React from 'react'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail'
import {sheetShadow} from '../../../../../styles/elevation'
import SummaryHeader from './SummaryHeader'
import QuickStats from './QuickStats'
import SummarySheetCTA from './SummarySheetCTA'
import ExportToCSV from '../ExportToCSV'
import {createFragmentContainer, graphql} from 'react-relay'
import MeetingMembersWithoutTasks from './MeetingMembersWithoutTasks'
import MeetingMembersWithTasks from './MeetingMembersWithTasks'
import SummaryEmailScheduleCalendar from '../SummaryEmailScheduleCalendar'
import {ACTION} from '../../../../../utils/constants'
import {meetingTypeToLabel} from '../../../../../utils/meetings/lookups'
import ContactUsFooter from './ContactUsFooter'
import LogoFooter from './LogoFooter'
import CreateAccountSection from '../../CreateAccountSection/CreateAccountSection'
import RetroTopics from './RetroTopics'
import {SummarySheet_meeting} from '../../../../../__generated__/SummarySheet_meeting.graphql'

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
        <ExportToCSV
          emailCSVUrl={emailCSVUrl}
          meetingId={meetingId}
          urlAction={urlAction}
          referrer={referrer}
        />
        <CreateAccountSection isDemo={isDemo} />
        <MeetingMembersWithTasks meeting={meeting} />
        <MeetingMembersWithoutTasks meeting={meeting} />
        <RetroTopics imageSource={referrer === 'email' ? 'static' : 'local'} meeting={meeting} />
        <SummaryEmailScheduleCalendar
          isDemo={isDemo}
          createdAt={createdAt}
          meetingUrl={meetingUrl}
          meetingNumber={meetingNumber}
          teamName={teamName}
        />
        <ContactUsFooter
          isDemo={isDemo}
          hasLearningLink={meetingType === ACTION}
          prompt={`How’d your ${meetingLabel} meeting go?`}
          tagline='We’re eager for your feedback!'
        />
        <LogoFooter />
      </tbody>
    </table>
  )
}

export default createFragmentContainer(SummarySheet, {
  meeting: graphql`
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
})
