import graphql from 'babel-plugin-relay/macro'
import CreateAccountSection from 'parabol-client/modules/demo/components/CreateAccountSection'
import {sheetShadow} from 'parabol-client/styles/elevation'
import {ACTION} from 'parabol-client/utils/constants'
import {SummarySheet_meeting$key} from 'parabol-client/__generated__/SummarySheet_meeting.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import {CorsOptions} from '../../../../../types/cors'
import ExportToCSV from '../ExportToCSV'
import ContactUsFooter from './ContactUsFooter'
import LogoFooter from './LogoFooter'
import MeetingMembersWithoutTasks from './MeetingMembersWithoutTasks'
import MeetingMembersWithTasks from './MeetingMembersWithTasks'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail'
import QuickStats from './QuickStats'
import TeamHealthSummary from './TeamHealthSummary'
import RetroTopics from './RetroTopics'
import SummaryHeader from './SummaryHeader'
import SummaryPokerStories from './SummaryPokerStories'
import SummarySheetCTA from './SummarySheetCTA'
import TeamPromptResponseSummary from './TeamPromptResponseSummary'
import WholeMeetingSummary from './WholeMeetingSummary'
import lazyPreload from '../../../../../utils/lazyPreload'
import EmailBorderBottom from '../MeetingSummaryEmail/EmailBorderBottom'
import {PALETTE} from '../../../../../styles/paletteV3'
import {TableChart} from '@mui/icons-material'
import {Link} from 'react-router-dom'

const ExportAllTasks = lazyPreload(() => import('./ExportAllTasks'))

interface Props {
  emailCSVUrl: string
  isDemo?: boolean
  meeting: SummarySheet_meeting$key
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
  const {
    emailCSVUrl,
    urlAction,
    meeting: meetingRef,
    referrer,
    teamDashUrl,
    appOrigin,
    corsOptions
  } = props
  const meeting = useFragment(
    graphql`
      fragment SummarySheet_meeting on NewMeeting {
        id
        ... on RetrospectiveMeeting {
          taskCount
        }
        ... on ActionMeeting {
          taskCount
        }
        ... on TeamPromptMeeting {
          taskCount
        }
        ...WholeMeetingSummary_meeting
        ...SummaryHeader_meeting
        ...QuickStats_meeting
        ...TeamHealthSummary_meeting
        ...MeetingMembersWithTasks_meeting
        ...MeetingMembersWithoutTasks_meeting
        ...RetroTopics_meeting
        ...SummaryPokerStories_meeting
        ...TeamPromptResponseSummary_meeting
        ...ExportAllTasks_meeting
        meetingType
        name
      }
    `,
    meetingRef
  )
  const {id: meetingId, meetingType, taskCount} = meeting
  const isDemo = !!props.isDemo

  return (
    <table width='100%' height='100%' align='center' bgcolor='#FFFFFF' style={sheetStyle}>
      <tbody>
        <tr>
          <td>
            <SummaryHeader meeting={meeting} corsOptions={corsOptions} />
            <QuickStats meeting={meeting} />
            <TeamHealthSummary meeting={meeting} />
          </td>
        </tr>
        <SummarySheetCTA referrer={referrer} isDemo={isDemo} teamDashUrl={teamDashUrl} />
        {referrer === 'meeting'
          ? (meetingType !== 'teamPrompt' || (!!taskCount && taskCount > 0)) && (
              <>
                <tr>
                  <td>
                    <table width='90%' align='center' className='mt-8 rounded-lg bg-slate-200 py-4'>
                      <tbody>
                        <tr>
                          <td align='center' width='100%'>
                            <div className='flex justify-center gap-4'>
                              {!!taskCount && taskCount > 0 && (
                                <ExportAllTasks meetingRef={meeting} />
                              )}
                              {meetingType !== 'teamPrompt' && (
                                <Link
                                  to={emailCSVUrl}
                                  className={
                                    'flex cursor-pointer items-center gap-2 rounded-full border border-solid border-slate-400 bg-white px-5 py-2 text-center font-sans text-sm font-semibold hover:bg-slate-100'
                                  }
                                >
                                  <TableChart
                                    style={{
                                      width: '14px',
                                      height: '14px',
                                      color: PALETTE.SLATE_600
                                    }}
                                  />
                                  Export to CSV
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                {/* :HACK: The 'ExportToCSV' component both downloads the CSV if 'urlAction' is 'csv'
                and shows the 'Export to CSV' button. We need the download functionality, but we
                don't want to show the button as-is, so hide it in the DOM */}
                <div className='hidden'>
                  {/* :TODO: (jmtaber129): Decouple the download and button functionality of this
                  component. */}
                  <ExportToCSV
                    emailCSVUrl={emailCSVUrl}
                    meetingId={meetingId}
                    urlAction={urlAction}
                    referrer={referrer}
                    corsOptions={corsOptions}
                  />
                </div>
              </>
            )
          : meetingType !== 'teamPrompt' && (
              <ExportToCSV
                emailCSVUrl={emailCSVUrl}
                meetingId={meetingId}
                urlAction={urlAction}
                referrer={referrer}
                corsOptions={corsOptions}
              />
            )}
        <EmailBorderBottom />
        <CreateAccountSection dataCy='create-account-section' isDemo={isDemo} />
        {meetingType === 'teamPrompt' ? (
          <TeamPromptResponseSummary meetingRef={meeting} />
        ) : (
          <>
            <WholeMeetingSummary meetingRef={meeting} />
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

export default SummarySheet
