import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {
  FONT_FAMILY,
  PALETTE_TEXT_GREEN,
  PALETTE_TEXT_LIGHT,
  PALETTE_TEXT_MAIN
} from './constants'
import {SummaryAvatarHeader_meetingMember} from '../../../../../../__generated__/SummaryAvatarHeader_meetingMember.graphql'

const presentLabelStyle = (isCheckedIn: boolean) => ({
  color: isCheckedIn ? PALETTE_TEXT_GREEN : PALETTE_TEXT_LIGHT,
  fontFamily: FONT_FAMILY,
  fontSize: '14px',
  fontStyle: 'italic',
  fontWeight: 600,
  paddingTop: 4
})

const avatarCell = {
  paddingTop: 24
}

const avatarStyles = {
  borderRadius: '100%',
  minWidth: 80
}

const nameStyle = {
  color: PALETTE_TEXT_MAIN,
  fontFamily: FONT_FAMILY,
  fontSize: '20px',
  paddingTop: 4
}

interface Props {
  meetingMember: SummaryAvatarHeader_meetingMember
}

const SummaryAvatarHeader = (props: Props) => {
  const {meetingMember} = props
  const {isCheckedIn, user} = meetingMember
  const {rasterPicture, preferredName} = user
  return (
    <>
      <tr>
        <td align='center' style={avatarCell}>
          <img height='80' src={rasterPicture} style={avatarStyles} width='80' />
        </td>
      </tr>
      <tr>
        <td align='center' style={nameStyle}>
          {preferredName}
        </td>
      </tr>
      <tr>
        <td align='center' style={presentLabelStyle(!!isCheckedIn)}>
          {isCheckedIn ? 'Present' : 'Absent'}
        </td>
      </tr>
    </>
  )
}

export default createFragmentContainer(SummaryAvatarHeader, {
  meetingMember: graphql`
    fragment SummaryAvatarHeader_meetingMember on MeetingMember {
      isCheckedIn
      user {
        rasterPicture
        preferredName
      }
    }
  `
})
