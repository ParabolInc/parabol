import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV3'
import {mergeRefs} from '~/utils/react/mergeRefs'
import {TeamPromptOptions_meeting$key} from '~/__generated__/TeamPromptOptions_meeting.graphql'
import useTooltip from '../../hooks/useTooltip'
import BaseButton from '../BaseButton'
import IconLabel from '../IconLabel'
import TeamPromptOptionsMenu from './TeamPromptOptionsMenu'

const OptionsButton = styled(BaseButton)({
  color: PALETTE.SLATE_600,
  height: '100%',
  aspectRatio: '1 / 1',
  opacity: 1,
  borderRadius: '100%',
  padding: 0,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700,
    backgroundColor: PALETTE.SLATE_300
  }
})

interface Props {
  meetingRef: TeamPromptOptions_meeting$key
  openRecurrenceSettingsModal: () => void
}

const TeamPromptOptions = (props: Props) => {
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {
    tooltipPortal: optionsTooltipPortal,
    openTooltip: openOptionsTooltip,
    closeTooltip: closeOptionsTooltip,
    originRef: optionsTooltipOriginRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.UPPER_CENTER)
  const {
    tooltipPortal: copiedTooltipPortal,
    openTooltip: openCopiedTooltip,
    closeTooltip: closeCopiedTooltip,
    originRef: copiedTooltipRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.UPPER_RIGHT)
  const {meetingRef, openRecurrenceSettingsModal} = props

  const meeting = useFragment(
    graphql`
      fragment TeamPromptOptions_meeting on TeamPromptMeeting {
        ...TeamPromptOptionsMenu_meeting
      }
    `,
    meetingRef
  )

  const popTooltip = () => {
    openCopiedTooltip()
    setTimeout(() => {
      closeCopiedTooltip()
    }, 2000)
  }

  return (
    <>
      <OptionsButton
        ref={mergeRefs(originRef, optionsTooltipOriginRef, copiedTooltipRef)}
        onClick={togglePortal}
        onMouseEnter={openOptionsTooltip}
        onMouseLeave={closeOptionsTooltip}
      >
        <IconLabel ref={originRef} icon='more_vert' iconLarge />
      </OptionsButton>
      {optionsTooltipPortal('Options')}
      {copiedTooltipPortal('Copied!')}
      {menuPortal(
        <TeamPromptOptionsMenu
          meetingRef={meeting}
          menuProps={menuProps}
          openRecurrenceSettingsModal={openRecurrenceSettingsModal}
          popTooltip={popTooltip}
        />
      )}
    </>
  )
}

export default TeamPromptOptions
