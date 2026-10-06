import graphql from 'babel-plugin-relay/macro'
import {type ReactNode, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptMobileComposer_meeting$key} from '~/__generated__/TeamPromptMobileComposer_meeting.graphql'
import {Edit, Lock} from '~/ui/icons'
import {Button} from '../../../ui/Button/Button'
import {cn} from '../../../ui/cn'
import TeamPromptAnswerEditor from '../structured/TeamPromptAnswerEditor'
import useTeamPromptComposer from '../structured/useTeamPromptComposer'
import TeamPromptMobileShareBar from './TeamPromptMobileShareBar'
import useIsKeyboardOpen from './useIsKeyboardOpen'

interface Props {
  meetingRef: TeamPromptMobileComposer_meeting$key
  renderSharedCard: (editAction: ReactNode) => ReactNode
  onOpenInspiration: () => void
}

const TeamPromptMobileComposer = (props: Props) => {
  const {meetingRef, renderSharedCard, onOpenInspiration} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMobileComposer_meeting on TeamPromptMeeting {
        ...useTeamPromptComposer_meeting
      }
    `,
    meetingRef
  )
  const composer = useTeamPromptComposer(meeting)
  const {teamId, isEnded, prompts, stage, isShared, isExpanded, setIsExpanded, getEditorRef} =
    composer
  const {onChange, onShare, submitting, isDirty, initialContentByPrompt, answeredPromptIds} =
    composer
  const isKeyboardOpen = useIsKeyboardOpen()
  const [focusedPromptId, setFocusedPromptId] = useState<string | null>(null)
  const promptElsRef = useRef(new Map<string, HTMLDivElement>())
  useEffect(() => {
    if (!focusedPromptId) return
    promptElsRef.current.get(focusedPromptId)?.scrollIntoView({block: 'start', behavior: 'smooth'})
  }, [focusedPromptId])

  const onFocusChange = (promptId: string, isFocused: boolean) => {
    setFocusedPromptId((prev) => (isFocused ? promptId : prev === promptId ? null : prev))
  }

  if (!stage) return null
  const isEditing = isExpanded || !isShared
  const editAction = !isEnded && (
    <Button
      variant='flat'
      className='h-8 gap-1 px-2 text-fg-secondary text-sm'
      onClick={() => setIsExpanded(true)}
    >
      <Edit className='size-4.5' />
      Edit
    </Button>
  )
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3',
          focusedPromptId && 'pb-[60vh]'
        )}
      >
        {!isEditing && renderSharedCard(editAction)}
        <div className={cn('flex flex-col gap-4', !isEditing && 'hidden')}>
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className='scroll-mt-3'
              ref={(el) => {
                if (el) promptElsRef.current.set(prompt.id, el)
                else promptElsRef.current.delete(prompt.id)
              }}
            >
              <TeamPromptAnswerEditor
                teamId={teamId}
                prompt={prompt}
                initialContent={initialContentByPrompt.get(prompt.id) ?? null}
                readOnly={isEnded}
                isAnswered={answeredPromptIds.has(prompt.id)}
                compact={prompts.length === 1}
                onChange={onChange}
                onModEnter={onShare}
                onFocusChange={onFocusChange}
                bubbleMenuPlacement='bottom'
                editorClassName='max-h-40 text-base'
                editorRef={getEditorRef(prompt.id)}
              />
            </div>
          ))}
          {!isShared && (
            <div className='flex items-center gap-1.5 text-fg-muted text-xs'>
              <Lock className='size-4' />
              {isEnded
                ? "This standup ended before you shared, so the team can't see this"
                : 'Only you can see this until you share'}
            </div>
          )}
        </div>
      </div>
      {isEditing && !isEnded && !isKeyboardOpen && (
        <TeamPromptMobileShareBar
          isShared={isShared}
          isDirty={isDirty}
          answeredCount={answeredPromptIds.size}
          promptCount={prompts.length}
          submitting={submitting}
          onShare={onShare}
          onOpenInspiration={onOpenInspiration}
          onClose={() => setIsExpanded(false)}
        />
      )}
    </div>
  )
}

export default TeamPromptMobileComposer
