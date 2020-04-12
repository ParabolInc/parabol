import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {PALETTE} from '../../../../../styles/paletteV2'
import {FONT_FAMILY} from '../../../../../styles/typographyV2'
import {SummaryAvatarHeader_meetingMember} from '../../../../../__generated__/SummaryAvatarHeader_meetingMember.graphql'

const presentLabelStyle = (isCheckedIn: boolean) => ({
  color: isCheckedIn ? PALETTE.TEXT_GREEN : PALETTE.TEXT_GRAY,
  fontFamily: FONT_FAMILY.SANS_SERIF,
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
  color: PALETTE.TEXT_MAIN,
  fontFamily: FONT_FAMILY.SANS_SERIF,
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
