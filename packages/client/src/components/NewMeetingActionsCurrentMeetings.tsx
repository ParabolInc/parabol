import styled from '@emotion/styled'
import {MenuPosition} from 'parabol-client/src/hooks/useCoords'
import useMenu from 'parabol-client/src/hooks/useMenu'
import React from 'react'
import {Elevation} from 'parabol-client/src/styles/elevation'
import {PALETTE} from 'parabol-client/src/styles/paletteV2'
import FlatButton from './FlatButton'
import Icon from './Icon'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import SelectMeetingDropdown from './SelectMeetingDropdown'
import {NewMeetingActionsCurrentMeetings_team} from 'parabol-client/src/__generated__/NewMeetingActionsCurrentMeetings_team.graphql'
import {MeetingTypeEnum} from '../types/graphql'
import plural from 'parabol-client/src/utils/plural'
import useBreakpoint from 'parabol-client/src/hooks/useBreakpoint'
import {Breakpoint} from 'parabol-client/src/types/constEnums'

const CurrentButton = styled(FlatButton)<{hasMeetings: boolean}>(({hasMeetings}) => ({
  color: PALETTE.BACKGROUND_PINK,
  fontSize: 14,
  fontWeight: 600,
  padding: '4px 16px',
  marginBottom: 24,
  ':hover': {
    backgroundColor: '#fff',
    boxShadow: Elevation.BUTTON_RAISED
  },
  visibility: hasMeetings ? undefined : 'hidden'
}))

const ForumIcon = styled(Icon)({
  paddingRight: 12
})

interface Props {
  meetingType: MeetingTypeEnum
  team: NewMeetingActionsCurrentMeetings_team
}

const NewMeetingActionsCurrentMeetings = (props: Props) => {
  const {meetingType, team} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.LOWER_RIGHT,
    {isDropdown: true}
  )
  const {activeMeetings} = team
  const activeMeetingsOfType = activeMeetings.filter(
    (meeting) => meeting.meetingType === meetingType
  )
  const meetingCount = activeMeetingsOfType.length
  const label = `${meetingCount} Active ${plural(meetingCount, 'Meeting')}`
  if (meetingCount === 0 && !isDesktop) return null
  return (
    <>
      <CurrentButton
        onClick={togglePortal}
        ref={originRef}
        hasMeetings={meetingCount > 0}
        size={'large'}
      >
        <ForumIcon>forum</ForumIcon>
        {label}
      </CurrentButton>
      {menuPortal(<SelectMeetingDropdown menuProps={menuProps} meetings={activeMeetingsOfType!} />)}
    </>
  )
}

export default createFragmentContainer(NewMeetingActionsCurrentMeetings, {
  team: graphql`
    fragment NewMeetingActionsCurrentMeetings_team on Team {
      id
      activeMeetings {
        ...SelectMeetingDropdown_meetings
        meetingType
      }
    }
  `
})
