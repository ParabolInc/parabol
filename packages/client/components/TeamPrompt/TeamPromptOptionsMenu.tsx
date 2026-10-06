import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {TeamPromptOptionsMenu_meeting$key} from '~/__generated__/TeamPromptOptionsMenu_meeting.graphql'
import {OpenInNew} from '~/ui/icons'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import useTeamPromptOptionItems from './useTeamPromptOptionItems'

const OptionMenuItem = ({children}: {children: ReactNode}) => (
  <div className='flex w-60 flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap'>
    {children}
  </div>
)

interface Props {
  meetingRef: TeamPromptOptionsMenu_meeting$key
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
  popTooltip: () => void
}

const TeamPromptOptionsMenu = (props: Props) => {
  const {meetingRef, openRecurrenceSettingsModal, openEndRecurringMeetingModal, popTooltip} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptOptionsMenu_meeting on TeamPromptMeeting {
        ...useTeamPromptOptionItems_meeting
      }
    `,
    meetingRef
  )
  const items = useTeamPromptOptionItems(meeting, {
    openRecurrenceSettingsModal,
    openEndRecurringMeetingModal,
    onCopied: popTooltip
  })

  return (
    <MenuContent align='end'>
      {items.map((item) => {
        const {key, label, icon, onClick, to, isNewTab, isDisabled} = item
        if (to) {
          return (
            <MenuItem key={key} asChild onClick={onClick}>
              <Link to={to} {...(isNewTab && {target: '_blank', rel: 'noopener noreferrer'})}>
                <OptionMenuItem>
                  {icon}
                  <span className='ml-2'>{label}</span>
                  <OpenInNew className='ml-auto text-base text-fg-secondary' />
                </OptionMenuItem>
              </Link>
            </MenuItem>
          )
        }
        return (
          <MenuItem
            key={key}
            isDisabled={isDisabled}
            onSelect={isDisabled ? (e) => e.preventDefault() : undefined}
            onClick={isDisabled ? undefined : onClick}
          >
            <OptionMenuItem>
              {icon}
              <span className='ml-2'>{label}</span>
            </OptionMenuItem>
          </MenuItem>
        )
      })}
    </MenuContent>
  )
}

export default TeamPromptOptionsMenu
