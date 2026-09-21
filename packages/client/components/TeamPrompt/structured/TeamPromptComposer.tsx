import type {Editor} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {useCallback, useRef, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {TeamPromptComposer_meeting$key} from '~/__generated__/TeamPromptComposer_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {cn} from '../../../ui/cn'
import TeamPromptAnswerEditor from './TeamPromptAnswerEditor'
import TeamPromptComposerFooter from './TeamPromptComposerFooter'
import TeamPromptComposerHeader from './TeamPromptComposerHeader'
import {getMemberSharedAt} from './teamPromptStages'
import {TEAM_UPDATES_BAND, TEAM_UPDATES_COLUMN} from './teamUpdatesLayout'
import useTeamPromptAnswersAutosave from './useTeamPromptAnswersAutosave'
import useTeamPromptComposerState from './useTeamPromptComposerState'

interface Props {
  meetingRef: TeamPromptComposer_meeting$key
}

const TeamPromptComposer = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptComposer_meeting on TeamPromptMeeting {
        id
        teamId
        endedAt
        rightDrawerOpen
        prompts {
          id
          question
          description
          groupColor
        }
        phases {
          ... on TeamPromptResponsesPhase {
            stages {
              id
              teamMember {
                userId
                user {
                  picture
                }
              }
              responses {
                id
                promptId
                content
                plaintextContent
                sharedAt
                updatedAt
              }
            }
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {id: meetingId, teamId, endedAt, prompts, rightDrawerOpen} = meeting
  const stage = meeting.phases[0]?.stages?.find((stage) => stage.teamMember.userId === viewerId)
  const isShared = !!getMemberSharedAt(stage?.responses ?? [])
  const [isExpanded, setIsExpanded] = useState(!isShared)
  const editorRefs = useRef(new Map<string, React.MutableRefObject<Editor | null>>())
  const {queueAnswer, seedDirty, share, submitting, dirtyPromptIds} = useTeamPromptAnswersAutosave({
    meetingId,
    teamId,
    stageId: stage?.id ?? '',
    isShared
  })
  const {
    initialContentByPrompt,
    answeredPromptIds,
    setAnsweredPromptIds,
    preview,
    sharedAt,
    lastAnswerAt
  } = useTeamPromptComposerState({prompts, stage, isEnded: !!endedAt, seedDirty})

  const onChange = useCallback(
    (promptId: string, editor: Editor) => {
      setAnsweredPromptIds((prev) => {
        const next = new Set(prev)
        if (editor.isEmpty) next.delete(promptId)
        else next.add(promptId)
        return next
      })
      queueAnswer(promptId, editor.getJSON())
    },
    [queueAnswer]
  )

  const onShare = useCallback(() => {
    if (answeredPromptIds.size === 0) return
    if (isShared && dirtyPromptIds.size === 0) return
    share()
    setIsExpanded(false)
  }, [share, answeredPromptIds.size, isShared, dirtyPromptIds.size])

  const onOpenInspiration = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const proxy = store.get(meetingId)
      if (!proxy) return
      proxy.setValue(null, 'localStageId')
      proxy.setValue(rightDrawerOpen === 'inspiration' ? null : 'inspiration', 'rightDrawerOpen')
    })
  }

  if (!stage) return null
  return (
    <div className={cn(TEAM_UPDATES_BAND, 'pt-6 pb-2')}>
      <div className={TEAM_UPDATES_COLUMN}>
        <TeamPromptComposerHeader
          picture={stage.teamMember.user.picture}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded((wasExpanded) => !wasExpanded)}
          isShared={isShared}
          sharedAt={sharedAt}
          updatedAt={lastAnswerAt}
          preview={preview}
          answeredCount={answeredPromptIds.size}
          promptCount={prompts.length}
        />
        {isExpanded && (
          <>
            <div className='flex flex-col gap-4 rounded-card bg-surface-card p-4 shadow-[var(--shadow-card)]'>
              {prompts.map((prompt, index) => {
                if (!editorRefs.current.has(prompt.id))
                  editorRefs.current.set(prompt.id, {current: null})
                const nextPromptId = prompts[index + 1]?.id
                return (
                  <TeamPromptAnswerEditor
                    key={prompt.id}
                    teamId={teamId}
                    prompt={prompt}
                    initialContent={initialContentByPrompt.get(prompt.id) ?? null}
                    readOnly={!!endedAt}
                    isAnswered={answeredPromptIds.has(prompt.id)}
                    compact={prompts.length === 1}
                    onChange={onChange}
                    onModEnter={onShare}
                    onTab={
                      nextPromptId
                        ? () => editorRefs.current.get(nextPromptId)?.current?.commands.focus('end')
                        : undefined
                    }
                    editorRef={editorRefs.current.get(prompt.id)!}
                  />
                )
              })}
            </div>
            {!endedAt && (
              <TeamPromptComposerFooter
                isShared={isShared}
                isDirty={dirtyPromptIds.size > 0}
                answeredCount={answeredPromptIds.size}
                promptCount={prompts.length}
                submitting={submitting}
                isInspirationOpen={rightDrawerOpen === 'inspiration'}
                onOpenInspiration={onOpenInspiration}
                onShare={onShare}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default TeamPromptComposer
