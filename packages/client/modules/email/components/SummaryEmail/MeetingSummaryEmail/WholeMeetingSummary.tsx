import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {FONT_FAMILY} from 'parabol-client/styles/typographyV2'
import {WholeMeetingSummary_meeting$key} from 'parabol-client/__generated__/WholeMeetingSummary_meeting.graphql'
import React from 'react'
import {useFragment} from 'react-relay'
import EmailBorderBottom from './EmailBorderBottom'

const topicTitleStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  lineHeight: '22px',
  fontSize: 14,
  padding: '8px 48px'
}

const textStyle = {
  color: PALETTE.SLATE_700,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  padding: '0px 48px 8px 48px',
  fontSize: 14
}

interface Props {
  meetingRef: WholeMeetingSummary_meeting$key
}

const WholeMeetingSummary = (props: Props) => {
  const {meetingRef} = props
  const {summary} = useFragment(
    graphql`
      fragment WholeMeetingSummary_meeting on RetrospectiveMeeting {
        summary
      }
    `,
    meetingRef
  )
  if (!summary) return null
  return (
    <>
      <tr>
        <td align='center' style={{paddingTop: 20}}>
          <tr>
            <td style={topicTitleStyle}>{'Meeting Summary'}</td>
          </tr>
          <tr>
            <td style={textStyle}>{summary}</td>
          </tr>
        </td>
      </tr>
      <EmailBorderBottom />
    </>
  )
}

export default WholeMeetingSummary
