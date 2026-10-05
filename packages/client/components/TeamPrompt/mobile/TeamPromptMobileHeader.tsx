import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptMobileHeader_meeting$key} from '~/__generated__/TeamPromptMobileHeader_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useMeetingSeriesDate} from '~/hooks/useMeetingSeriesDate'
import {useRenameMeeting} from '~/hooks/useRenameMeeting'
import {MoreHoriz} from '~/ui/icons'
import EditableText from '../../EditableText'
import LogoBlock from '../../LogoBlock/LogoBlock'
import TeamPromptMobileAvatars from './TeamPromptMobileAvatars'
import TeamPromptMobileMenu from './TeamPromptMobileMenu'

const titleClassName = 'm-0 truncate p-0 font-semibold text-base leading-6'

interface Props {
  meetingRef: TeamPromptMobileHeader_meeting$key
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
}

const TeamPromptMobileHeader = (props: Props) => {
  const {meetingRef, openRecurrenceSettingsModal, openEndRecurringMeetingModal} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMobileHeader_meeting on TeamPromptMeeting {
        ...useMeetingSeriesDate_meeting
        ...TeamPromptMobileAvatars_meeting
        ...TeamPromptMobileMenu_meeting
        id
        name
        facilitatorUserId
        endedAt
      }
    `,
    meetingRef
  )
  const {id: meetingId, name, facilitatorUserId, endedAt} = meeting
  const {viewerId} = useAtmosphere()
  const {label: dateLabel} = useMeetingSeriesDate(meeting)
  const {handleSubmit, validate, error} = useRenameMeeting(meetingId)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  return (
    <header className='flex shrink-0 items-center gap-2 py-2 pr-1 pl-3'>
      <LogoBlock className='p-0' />
      <div className='min-w-0 flex-1'>
        {viewerId === facilitatorUserId ? (
          <EditableText
            className={titleClassName}
            error={error?.message}
            handleSubmit={handleSubmit}
            initialValue={name}
            maxLength={50}
            validate={validate}
            placeholder='Best Meeting Ever!'
            hideIcon
          />
        ) : (
          <h1 className={titleClassName}>{name}</h1>
        )}
        {(dateLabel || endedAt) && (
          <div className='flex items-center gap-1.5 truncate text-fg-muted text-xs'>
            {endedAt && (
              <span className='rounded-sm border border-hairline-strong px-1 font-semibold text-fg-secondary'>
                Ended
              </span>
            )}
            {dateLabel}
          </div>
        )}
      </div>
      <TeamPromptMobileAvatars meetingRef={meeting} />
      <button
        type='button'
        aria-label='Meeting menu'
        aria-haspopup='dialog'
        onClick={() => setIsMenuOpen(true)}
        className='flex h-11 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-transparent text-fg-secondary hover:bg-surface-hover'
      >
        <MoreHoriz />
      </button>
      <TeamPromptMobileMenu
        meetingRef={meeting}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        openRecurrenceSettingsModal={openRecurrenceSettingsModal}
        openEndRecurringMeetingModal={openEndRecurringMeetingModal}
      />
    </header>
  )
}

export default TeamPromptMobileHeader
