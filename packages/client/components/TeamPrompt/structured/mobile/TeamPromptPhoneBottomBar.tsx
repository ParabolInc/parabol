import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptPhoneBottomBar_meeting$key} from '~/__generated__/TeamPromptPhoneBottomBar_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {AutoAwesome, ExpandMore} from '~/ui/icons'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import shareButtonState from '../shareButtonState'
import TeamUpdatesAvatarStack from '../TeamUpdatesAvatarStack'
import {sortTeamStages} from '../teamPromptStages'
import useBottomBarHeightVar from './useBottomBarHeightVar'
import usePhoneComposerState from './usePhoneComposerState'

interface Props {
  meetingRef: TeamPromptPhoneBottomBar_meeting$key
  onSeeTeam: () => void
}

const TeamPromptPhoneBottomBar = (props: Props) => {
  const {meetingRef, onSeeTeam} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptPhoneBottomBar_meeting on TeamPromptMeeting {
        endedAt
        rightDrawerOpen
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              id
              teamMember {
                userId
                user {
                  id
                  preferredName
                  picture
                }
              }
              response {
                id
                isShared
                sharedAt
                createdAt
                updatedAt
                answeredPromptIds
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {viewerId} = useAtmosphere()
  const state = usePhoneComposerState()
  const barRef = useRef<HTMLDivElement>(null)
  const isHidden = !state || !!state.focusedPromptId
  useBottomBarHeightVar(barRef, !isHidden)
  if (!state || isHidden) return null
  const {answeredCount, promptCount, isShared, isDirty, submitting, share, openInspiration} = state
  const isEnded = !!meeting.endedAt
  const {shared, drafting} = sortTeamStages(meeting.phases[0]?.stages ?? [], viewerId)
  const sharedMembers = shared.map((stage) => stage.teamMember.user)
  const isInspirationOpen = meeting.rightDrawerOpen === 'inspiration'
  const {label, disabled} = shareButtonState({
    isShared,
    isDirty,
    answeredCount,
    promptCount,
    submitting,
    isEnded
  })
  return (
    <div
      ref={barRef}
      className='fixed inset-x-0 bottom-0 z-[8] border-hairline border-t border-solid bg-surface-card px-4 pt-2 pb-[max(28px,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(28,28,33,.06)]'
    >
      <button
        type='button'
        onClick={onSeeTeam}
        aria-label='See team updates'
        className='flex h-11 w-full items-center gap-2 bg-transparent text-left'
      >
        <div className='shrink-0'>
          <TeamUpdatesAvatarStack members={sharedMembers} size='sm' />
        </div>
        <span className='min-w-0 truncate font-semibold text-[13px]'>Team updates</span>
        <span className='min-w-0 truncate text-fg-muted text-xs'>
          {sharedMembers.length} shared <span aria-hidden>·</span> {drafting.length} drafting
        </span>
        <span className='ml-auto flex shrink-0 items-center font-semibold text-[13px] text-accent'>
          See
          <ExpandMore className='h-5 w-5' />
        </span>
      </button>
      {!isEnded && (
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={openInspiration}
            aria-label='Inspiration'
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-solid bg-transparent',
              isInspirationOpen
                ? 'border-accent text-accent'
                : 'border-hairline-strong text-fg-primary'
            )}
          >
            <AutoAwesome className='h-[22px] w-[22px]' />
          </button>
          <Button
            type='button'
            variant='primary'
            size='lg'
            className='h-12 flex-1'
            disabled={disabled}
            onClick={share}
          >
            {label}
          </Button>
        </div>
      )}
    </div>
  )
}

export default TeamPromptPhoneBottomBar
