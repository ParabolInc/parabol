import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {TeamPromptMobileMenu_meeting$key} from '~/__generated__/TeamPromptMobileMenu_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {KeyboardArrowLeft, KeyboardArrowRight, Notes, PersonAdd} from '~/ui/icons'
import lazyPreload from '../../../utils/lazyPreload'
import useTeamPromptOptionItems from '../useTeamPromptOptionItems'
import TeamPromptMobileMenuRow from './TeamPromptMobileMenuRow'
import TeamPromptMobileSheet from './TeamPromptMobileSheet'

const AddTeamMemberModal = lazyPreload(
  () => import(/* webpackChunkName: 'AddTeamMemberModal' */ '../../AddTeamMemberModal')
)

interface Props {
  meetingRef: TeamPromptMobileMenu_meeting$key
  isOpen: boolean
  onClose: () => void
  openRecurrenceSettingsModal: () => void
  openEndRecurringMeetingModal: () => void
}

const TeamPromptMobileMenu = (props: Props) => {
  const {meetingRef, isOpen, onClose, openRecurrenceSettingsModal, openEndRecurringMeetingModal} =
    props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMobileMenu_meeting on TeamPromptMeeting {
        ...useTeamPromptOptionItems_meeting
        id
        team {
          id
          teamMembers {
            ...AddTeamMemberModal_teamMembers
          }
        }
        meetingSeries {
          cancelledAt
        }
        prevMeeting {
          id
        }
        nextMeeting {
          id
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {id: meetingId, team, meetingSeries, prevMeeting, nextMeeting} = meeting
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const isRecurring = !!meetingSeries && !meetingSeries.cancelledAt
  const items = useTeamPromptOptionItems(meeting, {
    openRecurrenceSettingsModal,
    openEndRecurringMeetingModal,
    onCopied: () => {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'standupPermalinkCopied',
        message: 'Copied meeting permalink',
        autoDismiss: 5
      })
    }
  })
  const openTranscription = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(meetingId)?.setValue('transcription', 'rightDrawerOpen')
    })
  }
  const iconClassName = 'text-fg-secondary'
  return (
    <>
      <TeamPromptMobileSheet isOpen={isOpen} onClose={onClose} title='Meeting menu'>
        <div className='flex flex-col py-1' onClick={onClose}>
          <TeamPromptMobileMenuRow
            label='Invite to team'
            icon={<PersonAdd className={iconClassName} />}
            onClick={() => setIsInviteOpen(true)}
          />
          <TeamPromptMobileMenuRow
            label='Transcription'
            icon={<Notes className={iconClassName} />}
            onClick={openTranscription}
          />
          {isRecurring && prevMeeting && (
            <TeamPromptMobileMenuRow
              label='Previous standup'
              icon={<KeyboardArrowLeft className={iconClassName} />}
              to={`/meet/${prevMeeting.id}`}
            />
          )}
          {isRecurring && nextMeeting && (
            <TeamPromptMobileMenuRow
              label='Next standup'
              icon={<KeyboardArrowRight className={iconClassName} />}
              to={`/meet/${nextMeeting.id}`}
            />
          )}
          {items.map(({key, ...item}) => (
            <TeamPromptMobileMenuRow key={key} {...item} />
          ))}
        </div>
      </TeamPromptMobileSheet>
      <AddTeamMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        meetingId={meetingId}
        teamId={team.id}
        teamMembers={team.teamMembers}
      />
    </>
  )
}

export default TeamPromptMobileMenu
