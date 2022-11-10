import graphql from 'babel-plugin-relay/macro'
import CreateAccountSection from 'parabol-client/modules/demo/components/CreateAccountSection'
import {sheetShadow} from 'parabol-client/styles/elevation'
import {ACTION} from 'parabol-client/utils/constants'
import {SummarySheet_meeting} from 'parabol-client/__generated__/SummarySheet_meeting.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import lazyPreload from '~/utils/lazyPreload'
import {CorsOptions} from '../../../../../types/cors'
import ExportToCSV from '../ExportToCSV'
import ContactUsFooter from './ContactUsFooter'
import LogoFooter from './LogoFooter'
import MeetingMembersWithoutTasks from './MeetingMembersWithoutTasks'
import MeetingMembersWithTasks from './MeetingMembersWithTasks'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail'
import QuickStats from './QuickStats'
import RetroTopics from './RetroTopics'
import SummaryHeader from './SummaryHeader'
import SummaryPokerStories from './SummaryPokerStories'
import SummarySheetCTA from './SummarySheetCTA'

interface Props {
  emailCSVUrl: string
  isDemo?: boolean
  meeting: SummarySheet_meeting
  appOrigin: string
  referrer: MeetingSummaryReferrer
  referrerUrl?: string
  teamDashUrl: string
  urlAction?: 'csv'
  corsOptions: CorsOptions
}

const sheetStyle = {
  borderSpacing: 0,
  boxShadow: sheetShadow
}

const SummarySheet = (props: Props) => {
  const {emailCSVUrl, urlAction, meeting, referrer, teamDashUrl, appOrigin, corsOptions} = props
  const {id: meetingId, meetingType} = meeting
  const isDemo = !!props.isDemo

  // 'TeamPromptResponseSummary' includes client-side-only code that breaks SSR, so lazy-load it.
  // :TODO: (jmtaber129): Change this to a normal import once 'TeamPromptResponseSummary' supports
  // SSR.
  const TeamPromptResponseSummary = lazyPreload(() => import('./TeamPromptResponseSummary'))

  return (
    <table width='100%' height='100%' align='center' bgcolor='#FFFFFF' style={sheetStyle}>
      <tbody>
        <tr>
          <td>
            <SummaryHeader meeting={meeting} corsOptions={corsOptions} />
            <QuickStats meeting={meeting} />
          </td>
        </tr>
        <SummarySheetCTA referrer={referrer} isDemo={isDemo} teamDashUrl={teamDashUrl} />
        <ExportToCSV
          emailCSVUrl={emailCSVUrl}
          meetingId={meetingId}
          urlAction={urlAction}
          referrer={referrer}
          corsOptions={corsOptions}
        />
        <CreateAccountSection dataCy='create-account-section' isDemo={isDemo} />
        {meetingType === 'teamPrompt' ? (
          <TeamPromptResponseSummary meetingRef={meeting} />
        ) : (
          <>
            <MeetingMembersWithTasks meeting={meeting} />
            <MeetingMembersWithoutTasks meeting={meeting} />
            <RetroTopics
              isDemo={isDemo}
              isEmail={referrer === 'email'}
              meeting={meeting}
              appOrigin={appOrigin}
            />
            <SummaryPokerStories
              appOrigin={appOrigin}
              meeting={meeting}
              isEmail={referrer === 'email'}
            />
          </>
        )}
        <ContactUsFooter
          isDemo={isDemo}
          hasLearningLink={meetingType === ACTION}
          prompt={`How’d your meeting go?`}
          tagline='We’re eager for your feedback!'
        />
        <LogoFooter corsOptions={corsOptions} />
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
      ...SummaryPokerStories_meeting
      ...TeamPromptResponseSummary_meeting
      meetingType
      name
    }
  `
})
