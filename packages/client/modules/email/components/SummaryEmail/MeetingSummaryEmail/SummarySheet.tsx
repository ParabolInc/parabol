import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {sheetShadow} from '../../../../../styles/elevation'
import {ACTION} from '../../../../../utils/constants'
import {SummarySheet_meeting} from '../../../../../__generated__/SummarySheet_meeting.graphql'
import CreateAccountSection from '../../CreateAccountSection/CreateAccountSection'
import ExportToCSV from '../ExportToCSV'
import SummaryEmailScheduleCalendar from '../SummaryEmailScheduleCalendar'
import ContactUsFooter from './ContactUsFooter'
import LogoFooter from './LogoFooter'
import MeetingMembersWithoutTasks from './MeetingMembersWithoutTasks'
import MeetingMembersWithTasks from './MeetingMembersWithTasks'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail'
import QuickStats from './QuickStats'
import RetroTopics from './RetroTopics'
import SummaryHeader from './SummaryHeader'
import SummarySheetCTA from './SummarySheetCTA'

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
  const {id: meetingId, createdAt, meetingNumber, meetingType, team} = meeting
  const {name: teamName} = team
  const isDemo = !!props.isDemo
  return (
    <table width='100%' height='100%' align='center' bgcolor='#FFFFFF' style={sheetStyle}>
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
        {meetingType === ACTION && (
          <SummaryEmailScheduleCalendar
            isDemo={isDemo}
            createdAt={createdAt}
            meetingUrl={meetingUrl}
            meetingNumber={meetingNumber}
            teamName={teamName}
          />
        )}
        <ContactUsFooter
          isDemo={isDemo}
          hasLearningLink={meetingType === ACTION}
          prompt={`How’d your meeting go?`}
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
      name
      meetingNumber
      team {
        name
      }
      createdAt
    }
  `
})
