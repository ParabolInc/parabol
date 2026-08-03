import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptOptions_meeting$key} from '~/__generated__/TeamPromptOptions_meeting.graphql'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {mergeRefs} from '~/utils/react/mergeRefs'
import useTooltip from '../../hooks/useTooltip'
import BaseButton from '../BaseButton'
import IconLabel from '../IconLabel'
import TeamPromptOptionsMenu from './TeamPromptOptionsMenu'

const COPIED_TOOLTIP_DURATION_MS = 2000

export const OptionsButton = styled(BaseButton)({
  color: 'var(--color-accent)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  opacity: 1,
  padding: '0px 8px',
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: 'var(--color-accent)'
  }
})

interface Props {
  meetingRef: TeamPromptOptions_meeting$key
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
}

const TeamPromptOptions = (props: Props) => {
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {
    tooltipPortal: copiedTooltipPortal,
    openTooltip: openCopiedTooltip,
    closeTooltip: closeCopiedTooltip,
    originRef: copiedTooltipRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.UPPER_RIGHT)
  const {meetingRef, openRecurrenceSettingsModal, openEndRecurringMeetingModal} = props

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
    }, COPIED_TOOLTIP_DURATION_MS)
  }

  return (
    <>
      <OptionsButton ref={mergeRefs(originRef, copiedTooltipRef)} onClick={togglePortal}>
        <IconLabel ref={originRef} icon='tune' iconLarge />
        <div className='text-fg-primary'>Options</div>
      </OptionsButton>
      {copiedTooltipPortal('Copied!')}
      {menuPortal(
        <TeamPromptOptionsMenu
          meetingRef={meeting}
          menuProps={menuProps}
          openRecurrenceSettingsModal={openRecurrenceSettingsModal}
          openEndRecurringMeetingModal={openEndRecurringMeetingModal}
          popTooltip={popTooltip}
        />
      )}
    </>
  )
}

export default TeamPromptOptions
