import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {TeamPromptOptions_meeting$key} from '~/__generated__/TeamPromptOptions_meeting.graphql'
import {PALETTE} from '../../styles/paletteV3'
import CardButton from '../CardButton'
import IconLabel from '../IconLabel'
import TeamPromptOptionsMenu from './TeamPromptOptionsMenu'

const Options = styled(CardButton)({
  color: PALETTE.SLATE_700,
  height: 32,
  width: 32,
  opacity: 1,
  ':hover': {
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
      <Options ref={originRef} onClick={togglePortal}>
        <IconLabel ref={originRef} icon='more_vert' />
      </Options>
      {menuPortal(<TeamPromptOptionsMenu meetingRef={meeting} menuProps={menuProps} />)}
    </>
  )
}

export default TeamPromptOptions
