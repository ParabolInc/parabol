import type {Editor} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {useCallback, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {useTeamPromptComposer_meeting$key} from '~/__generated__/useTeamPromptComposer_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {getMemberSharedAt} from './teamPromptStages'
import useTeamPromptAnswersAutosave from './useTeamPromptAnswersAutosave'
import useTeamPromptComposerApiRegistration from './useTeamPromptComposerApiRegistration'
import useTeamPromptComposerState from './useTeamPromptComposerState'

const useTeamPromptComposer = (meetingRef: useTeamPromptComposer_meeting$key) => {
  const meeting = useFragment(
    graphql`
      fragment useTeamPromptComposer_meeting on TeamPromptMeeting {
        id
        teamId
        endedAt
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
  const {id: meetingId, teamId, endedAt, prompts} = meeting
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
  const composerState = useTeamPromptComposerState({
    prompts,
    stage,
    isEnded: !!endedAt,
    isExpanded,
    seedDirty
  })
  const {answeredPromptIds, setAnsweredPromptIds} = composerState

  const onChange = useCallback(
    (promptId: string, editor: Editor) => {
      setAnsweredPromptIds((prev) => {
        const isAnswered = !editor.isEmpty
        if (prev.has(promptId) === isAnswered) return prev
        const next = new Set(prev)
        if (isAnswered) next.add(promptId)
        else next.delete(promptId)
        return next
      })
      queueAnswer(promptId, editor.getJSON())
    },
    [queueAnswer]
  )

  const expand = useCallback(() => setIsExpanded(true), [])
  useTeamPromptComposerApiRegistration({editorRefs, onChange, expand})

  const onShare = useCallback(() => {
    if (answeredPromptIds.size === 0) return
    if (isShared && dirtyPromptIds.size === 0) return
    share(() => setIsExpanded(false))
  }, [share, answeredPromptIds.size, isShared, dirtyPromptIds.size])

  const getEditorRef = (promptId: string) => {
    if (!editorRefs.current.has(promptId)) editorRefs.current.set(promptId, {current: null})
    return editorRefs.current.get(promptId)!
  }

  return {
    ...composerState,
    teamId,
    isEnded: !!endedAt,
    prompts,
    stage,
    isShared,
    isExpanded,
    setIsExpanded,
    getEditorRef,
    onChange,
    onShare,
    submitting,
    isDirty: dirtyPromptIds.size > 0
  }
}

export default useTeamPromptComposer
