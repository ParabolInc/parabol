import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {CorsOptions} from '../../../../../types/cors'
// import './reactEmailDeclarations'
import SummarySheet from './SummarySheet'
import ViewInBrowserHeader from './ViewInBrowserHeader'

import {MeetingSummaryEmail_meeting$key} from 'parabol-client/__generated__/MeetingSummaryEmail_meeting.graphql'

const parentStyles = {
  WebkitTextSizeAdjust: '100%',
  msTextSizeAdjust: '100%',
  msoTableLspace: '0pt',
  msoTableRspace: '0pt',
  borderCollapse: 'collapse',
  margin: '0px auto'
} as React.CSSProperties

export type MeetingSummaryReferrer = 'meeting' | 'email' | 'history'

interface Props {
  emailCSVUrl: string
  isDemo?: boolean
  meeting: MeetingSummaryEmail_meeting$key
  referrer: MeetingSummaryReferrer
  referrerUrl?: string
  teamDashUrl: string
  meetingUrl: string
  appOrigin: string
  urlAction?: 'csv'
  corsOptions: CorsOptions
}

const pagePadding = {
  paddingTop: 24
}

declare module 'react' {
  interface TdHTMLAttributes<T> {
    height?: string | number
    width?: string | number
    bgcolor?: string
  }
  interface TableHTMLAttributes<T> {
    align?: 'center' | 'left' | 'right'
    bgcolor?: string
    height?: string | number
    width?: string | number
  }
}

const PagePadding = () => {
  return (
    <table align='center' width='100%'>
      <tbody>
        <tr>
          <td style={pagePadding} />
        </tr>
      </tbody>
    </table>
  )
}

const MeetingSummaryEmail = (props: Props) => {
  const {referrer, referrerUrl, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment MeetingSummaryEmail_meeting on NewMeeting {
        id
        ...SummarySheet_meeting
      }
    `,
    meetingRef
  )
  useEffect(() => {
    document.body.style.overflow = ''
    document.body.style.position = ''
  })
  return (
    <table width='100%' align='center' style={parentStyles}>
      <tbody>
        <tr>
          <td align='center'>
            <table width={600} align='center' style={parentStyles}>
              <tbody>
                <tr>
                  <td>
                    <PagePadding />
                    <ViewInBrowserHeader referrerUrl={referrerUrl} referrer={referrer} />
                    <SummarySheet {...props} meeting={meeting} />
                    <PagePadding />
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default MeetingSummaryEmail
