import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptPhoneBottomBar_meeting$key} from '~/__generated__/TeamPromptPhoneBottomBar_meeting.graphql'
import {AutoAwesome, ExpandMore} from '~/ui/icons'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import TeamUpdatesAvatarStack from '../TeamUpdatesAvatarStack'
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
        rightDrawerOpen
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              teamMember {
                user {
                  id
                  preferredName
                  picture
                }
              }
              response {
                isShared
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const state = usePhoneComposerState()
  const barRef = useRef<HTMLDivElement>(null)
  const isHidden = !state || !!state.focusedPromptId
  useBottomBarHeightVar(barRef, !isHidden)
  if (!state || isHidden) return null
  const {answeredCount, promptCount, isShared, isDirty, submitting, share, openInspiration} = state
  const stages = meeting.phases[0]?.stages ?? []
  const sharedMembers = stages
    .filter((stage) => stage.response?.isShared)
    .map((stage) => stage.teamMember.user)
  const draftingCount = stages.filter((stage) => stage.response && !stage.response.isShared).length
  const isInspirationOpen = meeting.rightDrawerOpen === 'inspiration'
  const label = isShared ? 'Share changes' : promptCount > 1 ? 'Share Responses' : 'Share Response'
  const disabled = submitting || answeredCount === 0 || (isShared && !isDirty)
  return (
    <div
      ref={barRef}
      className='fixed inset-x-0 bottom-0 z-[8] border-hairline border-t border-solid bg-surface-card px-4 pt-2 pb-[max(28px,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(28,28,33,.06)]'
    >
      <button
        type='button'
        onClick={onSeeTeam}
        className='flex h-11 w-full items-center gap-2 bg-transparent text-left'
      >
        <TeamUpdatesAvatarStack members={sharedMembers} size='sm' />
        <span className='font-semibold text-[13px]'>Team updates</span>
        <span className='text-fg-muted text-xs'>
          {sharedMembers.length} shared · {draftingCount} drafting
        </span>
        <span className='ml-auto flex items-center font-semibold text-[13px] text-accent'>
          See
          <ExpandMore className='h-5 w-5' />
        </span>
      </button>
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
          variant='primary'
          size='lg'
          className='h-12 flex-1'
          disabled={disabled}
          onClick={share}
        >
          {label}
        </Button>
      </div>
    </div>
  )
}

export default TeamPromptPhoneBottomBar
