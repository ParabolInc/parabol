import React from 'react'
import {MeetingSummaryReferrer} from './MeetingSummaryEmail'
import {
  FONT_FAMILY,
  PALETTE_TEXT_GRAY
} from './constants'

const bannerLink = {
  color: `${PALETTE_TEXT_GRAY} !important`,
  cursor: 'pointer',
  fontFamily: FONT_FAMILY,
  fontSize: '11px',
  fontWeight: 400,
  paddingBottom: 16,
  textDecoration: 'underline'
}

interface Props {
  referrer: MeetingSummaryReferrer
  referrerUrl?: string
}

const ViewInBrowserHeader = (props: Props) => {
  const {referrer, referrerUrl} = props
  if (referrer !== 'email') return null
  return (
    <table align='center' width='100%'>
      <tbody>
        <tr>
          <td align='center'>
            <a href={referrerUrl} style={bannerLink}>
              {'View this in your browser'}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default ViewInBrowserHeader
