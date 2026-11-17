import graphql from 'babel-plugin-relay/macro'
import {forwardRef, type Ref, useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptOptions_meeting$key} from '~/__generated__/TeamPromptOptions_meeting.graphql'
import {Button, type ButtonProps} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'
import {Menu} from '../../ui/Menu/Menu'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import IconLabel from '../IconLabel'
import TeamPromptOptionsMenu from './TeamPromptOptionsMenu'

const COPIED_TOOLTIP_DURATION_MS = 2000

export const OptionsButton = forwardRef((props: ButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {className, children, ...rest} = props
  return (
    <Button
      ref={ref}
      size='default'
      className={cn(
        'flex h-full flex-col px-2 py-0 font-semibold text-[14px] text-accent leading-5 opacity-100 hover:text-accent focus:text-accent active:text-accent',
        className
      )}
      {...rest}
    >
      {children}
    </Button>
  )
})

interface Props {
  meetingRef: TeamPromptOptions_meeting$key
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
}

const TeamPromptOptions = (props: Props) => {
  const [isCopied, setIsCopied] = useState(false)
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
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, COPIED_TOOLTIP_DURATION_MS)
  }

  return (
    <Tooltip open={isCopied}>
      <Menu
        trigger={
          <TooltipTrigger asChild>
            <OptionsButton>
              <IconLabel icon='tune' iconLarge />
              <div className='text-fg-primary'>Options</div>
            </OptionsButton>
          </TooltipTrigger>
        }
      >
        <TeamPromptOptionsMenu
          meetingRef={meeting}
          openRecurrenceSettingsModal={openRecurrenceSettingsModal}
          openEndRecurringMeetingModal={openEndRecurringMeetingModal}
          popTooltip={popTooltip}
        />
      </Menu>
      <TooltipContent side='bottom' align='end'>
        Copied!
      </TooltipContent>
    </Tooltip>
  )
}

export default TeamPromptOptions
