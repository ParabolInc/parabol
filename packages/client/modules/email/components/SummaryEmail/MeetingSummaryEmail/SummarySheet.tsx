import {TableChart} from '@mui/icons-material'
import PictureAsPdf from '@mui/icons-material/PictureAsPdf'
import graphql from 'babel-plugin-relay/macro'
import {SummarySheet_meeting$key} from 'parabol-client/__generated__/SummarySheet_meeting.graphql'
import CreateAccountSection from 'parabol-client/modules/demo/components/CreateAccountSection'
import {sheetShadow} from 'parabol-client/styles/elevation'
import {ACTION} from 'parabol-client/utils/constants'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import useAtmosphere from '../../../../../hooks/useAtmosphere'
import {PALETTE} from '../../../../../styles/paletteV3'
import {CorsOptions} from '../../../../../types/cors'
import SendClientSideEvent from '../../../../../utils/SendClientSideEvent'
import lazyPreload from '../../../../../utils/lazyPreload'
import ExportToCSV from '../ExportToCSV'
import EmailBorderBottom from '../MeetingSummaryEmail/EmailBorderBottom'
import ContactUsFooter from './ContactUsFooter'
import LogoFooter from './LogoFooter'
import MeetingMembersWithTasks from './MeetingMembersWithTasks'
import MeetingMembersWithoutTasks from './MeetingMembersWithoutTasks'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail'
import QuickStats from './QuickStats'
import RetroTopics from './RetroTopics'
import SummaryHeader from './SummaryHeader'
import SummaryPokerStories from './SummaryPokerStories'
import SummarySheetCTA from './SummarySheetCTA'
import TeamHealthSummary from './TeamHealthSummary'
import TeamPromptResponseSummary from './TeamPromptResponseSummary'
import WholeMeetingSummary from './WholeMeetingSummary'

const ExportAllTasks = lazyPreload(() => import('./ExportAllTasks'))

interface Props {
  emailCSVUrl: string
  isDemo?: boolean
  meeting: SummarySheet_meeting$key
  appOrigin: string
  referrer: MeetingSummaryReferrer
  referrerUrl?: string
  teamDashUrl: string
  meetingUrl: string
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
    meetingUrl,
    appOrigin,
    corsOptions
  } = props
  const atmosphere = useAtmosphere()
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
  const {id: meetingId, meetingType, taskCount, name} = meeting
  const isDemo = !!props.isDemo
  const sheetRef = useRef<HTMLTableElement | null>(null)

  const downloadPDF = () => {
    SendClientSideEvent(atmosphere, 'Download PDF Clicked', {meetingId})

    const printStyles = `
      <style>
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          table {
            page-break-after: auto;
            margin: 0 auto;
            width: 100%;
            max-width: 800px;
          }
          tr, td {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:w-[210mm] {
            width: 100%;
          }
          .text-center {
            text-align: center;
          }
        }
      </style>
    `

    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>Parabol: ${name} Summary</title>
        </head>
        <body>
          ${printStyles}
          ${sheetRef.current?.outerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.onafterprint = () => {
      printWindow.close()
    }
  }

  return (
    <table
      className='print:w-[210mm]'
      width='100%'
      height='100%'
      align='center'
      bgcolor='#FFFFFF'
      ref={sheetRef}
      style={sheetStyle}
    >
      <tbody>
        <tr>
          <td>
            <SummaryHeader
              meeting={meeting}
              corsOptions={corsOptions}
              teamDashUrl={teamDashUrl}
              meetingUrl={meetingUrl}
            />
            <QuickStats meeting={meeting} />
            <TeamHealthSummary meeting={meeting} />
          </td>
        </tr>
        <SummarySheetCTA referrer={referrer} isDemo={isDemo} teamDashUrl={teamDashUrl} />
        {referrer === 'meeting'
          ? (meetingType !== 'teamPrompt' || (!!taskCount && taskCount > 0)) && (
              <>
                <tr className='print:hidden'>
                  <td>
                    <table width='90%' align='center' className='mt-8 rounded-lg bg-slate-200 py-4'>
                      <tbody>
                        <tr>
                          <td align='center' width='100%'>
                            <div className='mb-2 flex justify-center gap-4'>
                              {!!taskCount && taskCount > 0 && (
                                <ExportAllTasks meetingRef={meeting} />
                              )}
                            </div>
                            {meetingType !== 'teamPrompt' && (
                              <tr>
                                <td align='center' width='100%'>
                                  <div className='flex justify-center gap-4'>
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
                                    <button
                                      onClick={downloadPDF}
                                      className={
                                        'flex cursor-pointer items-center gap-2 rounded-full border border-solid border-slate-400 bg-white px-5 py-2 text-center font-sans text-sm font-semibold hover:bg-slate-100'
                                      }
                                    >
                                      <PictureAsPdf
                                        style={{
                                          width: '14px',
                                          height: '14px',
                                          color: PALETTE.SLATE_600
                                        }}
                                      />
                                      Download PDF
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
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
        <WholeMeetingSummary meetingRef={meeting} />
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
        <LogoFooter corsOptions={corsOptions} appOrigin={appOrigin} />
      </tbody>
    </table>
  )
}

export default SummarySheet
