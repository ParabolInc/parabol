import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {ICON_SIZE} from 'styles/typographyV2'
import {PALETTE} from 'styles/paletteV2'
import useRouter from 'hooks/useRouter'
import {createFragmentContainer} from 'react-relay'
import {SelectMeetingDropdownItem_meeting} from '__generated__/SelectMeetingDropdownItem_meeting.graphql'
import {meetingTypeToIcon} from 'utils/meetings/lookups'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const MeetingIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD24,
  padding: 16
})

const MeetingInfo = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const Title = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  lineHeight: '24px',
  fontWeight: 600
})

const Subtitle = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 12
})

const Action = styled(Icon)({
  flex: 1,
  textAlign: 'right',
  padding: 16
})

interface Props {
  meeting: SelectMeetingDropdownItem_meeting
}

const SelectMeetingDropdownItem = (props: Props) => {
  const {meeting} = props
  const {history} = useRouter()
  const {name, team, id: meetingId, meetingType} = meeting
  const {name: teamName} = team
  const gotoMeeting = () => {
    history.push(`/meet/${meetingId}`)
  }
  const icon = meetingTypeToIcon[meetingType]
  return (
    <Wrapper onClick={gotoMeeting}>
      <MeetingIcon>{icon}</MeetingIcon>
      <MeetingInfo>
        <Title>{name}</Title>
        <Subtitle>{teamName}</Subtitle>
      </MeetingInfo>
      <Action>{'arrow_forward'}</Action>
    </Wrapper>
  )
}

export default createFragmentContainer(SelectMeetingDropdownItem, {
  meeting: graphql`
    fragment SelectMeetingDropdownItem_meeting on NewMeeting {
      id
      name
      meetingType
      team {
        name
      }
    }
  `
})
