import type {Editor} from '@tiptap/core'
import type {JSONContent} from '@tiptap/react'
import graphql from 'babel-plugin-relay/macro'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {TeamPromptComposer_meeting$key} from '~/__generated__/TeamPromptComposer_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import TeamPromptAnswerEditor from './TeamPromptAnswerEditor'
import TeamPromptComposerFooter from './TeamPromptComposerFooter'
import TeamPromptComposerHeader from './TeamPromptComposerHeader'
import {isDocEmpty, readDraftAnswer} from './teamPromptDraftStorage'
import useTeamPromptAnswersAutosave, {type DirtyAnswer} from './useTeamPromptAnswersAutosave'

const PREVIEW_LENGTH = 90

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
              response {
                ...TeamPromptStructuredResponse_response @relay(mask: false)
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
  const response = stage?.response ?? null
  const isShared = !!response?.isShared
  const [isExpanded, setIsExpanded] = useState(!isShared)
  const editorRefs = useRef(new Map<string, React.MutableRefObject<Editor | null>>())
  const {queueAnswer, seedDirty, share, submitting, dirtyPromptIds} = useTeamPromptAnswersAutosave({
    meetingId,
    teamId,
    stageId: stage?.id ?? '',
    isShared
  })

  const savedDocs = useMemo(() => {
    const map = new Map<string, JSONContent | null>()
    prompts.forEach((prompt) => {
      const saved = response?.answers.find((answer) => answer.promptId === prompt.id)
      map.set(prompt.id, saved ? JSON.parse(saved.content) : null)
    })
    return map
  }, [stage?.id])

  const initialContentByPrompt = useMemo(() => {
    const map = new Map<string, JSONContent | null>()
    prompts.forEach((prompt) => {
      const draft = stage ? readDraftAnswer(stage.id, prompt.id) : null
      map.set(prompt.id, draft ?? savedDocs.get(prompt.id) ?? null)
    })
    return map
  }, [savedDocs])

  const [answeredPromptIds, setAnsweredPromptIds] = useState<Set<string>>(
    () =>
      new Set(
        prompts
          .filter((prompt) => !isDocEmpty(initialContentByPrompt.get(prompt.id) ?? null))
          .map((prompt) => prompt.id)
      )
  )

  const hasSeededRef = useRef(false)
  useEffect(() => {
    if (!stage || hasSeededRef.current) return
    hasSeededRef.current = true
    const entries = prompts.reduce<DirtyAnswer[]>((acc, prompt) => {
      const draft = readDraftAnswer(stage.id, prompt.id)
      if (!draft) return acc
      if (JSON.stringify(draft) === JSON.stringify(savedDocs.get(prompt.id) ?? null)) return acc
      acc.push({promptId: prompt.id, doc: draft})
      return acc
    }, [])
    seedDirty(entries)
  }, [stage?.id])

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
  const savedText = prompts
    .map((prompt) => response?.answers.find((answer) => answer.promptId === prompt.id))
    .find((answer) => !!answer?.plaintextContent.trim())?.plaintextContent
  const preview = (savedText ?? '').replace(/\s+/g, ' ').trim().slice(0, PREVIEW_LENGTH)
  const isDirty = dirtyPromptIds.size > 0

  return (
    <div className='mx-auto w-full max-w-[640px] px-[5%] pt-6 pb-2'>
      <TeamPromptComposerHeader
        picture={stage.teamMember.user.picture}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((wasExpanded) => !wasExpanded)}
        isShared={isShared}
        sharedAt={response?.sharedAt ?? null}
        updatedAt={response?.updatedAt ?? null}
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
              isDirty={isDirty}
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
  )
}

export default TeamPromptComposer
