import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV3'
import {TeamPromptOptions_meeting$key} from '~/__generated__/TeamPromptOptions_meeting.graphql'
import FlatButton from '../FlatButton'
import IconLabel from '../IconLabel'
import TeamPromptOptionsMenu from './TeamPromptOptionsMenu'

const OptionsButton = styled(FlatButton)({
  color: PALETTE.SLATE_600,
  height: '100%',
  width: 'auto',
  aspectRatio: '1/1',
  borderRadius: '100%',
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700,
    backgroundColor: PALETTE.SLATE_300
  }
})

interface Props {
  meetingRef: TeamPromptOptions_meeting$key
}

const TeamPromptOptions = (props: Props) => {
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment TeamPromptOptions_meeting on TeamPromptMeeting {
        ...TeamPromptOptionsMenu_meeting
      }
    `,
    meetingRef
  )

  return (
    <>
      <OptionsButton ref={originRef} onClick={togglePortal}>
        <IconLabel ref={originRef} icon='more_vert' iconLarge />
      </OptionsButton>
      {menuPortal(<TeamPromptOptionsMenu meetingRef={meeting} menuProps={menuProps} />)}
    </>
  )
}

export default TeamPromptOptions
