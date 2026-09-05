import type {Editor} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {useCallback, useRef, useState} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {TeamPromptComposer_meeting$key} from '~/__generated__/TeamPromptComposer_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import usePhoneViewport from '~/hooks/usePhoneViewport'
import {cn} from '../../../ui/cn'
import TeamPromptOwnUpdateRow from './mobile/TeamPromptOwnUpdateRow'
import TeamPromptPhoneComposerFooter from './mobile/TeamPromptPhoneComposerFooter'
import useComposerFocusMode from './mobile/useComposerFocusMode'
import usePhoneComposerBridge from './mobile/usePhoneComposerBridge'
import TeamPromptAnswerList from './TeamPromptAnswerList'
import TeamPromptComposerFooter from './TeamPromptComposerFooter'
import TeamPromptComposerHeader from './TeamPromptComposerHeader'
import {TEAM_UPDATES_BAND, TEAM_UPDATES_COLUMN} from './teamUpdatesLayout'
import useTeamPromptAnswersAutosave from './useTeamPromptAnswersAutosave'
import useTeamPromptComposerApiRegistration from './useTeamPromptComposerApiRegistration'
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
        template {
          name
        }
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
                id
                isShared
                sharedAt
                answers {
                  id
                  promptId
                  content
                  plaintextContent
                  updatedAt
                }
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
  const {id: meetingId, teamId, endedAt, prompts, rightDrawerOpen, template} = meeting
  const isPhone = usePhoneViewport()
  const stage = meeting.phases[0]?.stages?.find((stage) => stage.teamMember.userId === viewerId)
  const isShared = !!stage?.response?.isShared
  const [isExpanded, setIsExpanded] = useState(!isShared)
  const [isEditingAfterShare, setIsEditingAfterShare] = useState(false)
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
    savedTextByPrompt,
    sharedAt,
    lastAnswerAt
  } = useTeamPromptComposerState({prompts, stage, isEnded: !!endedAt, seedDirty})

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
  const [hasInsertedFromInspiration, setHasInsertedFromInspiration] = useState(false)
  const onInserted = useCallback(() => setHasInsertedFromInspiration(true), [])
  useTeamPromptComposerApiRegistration({editorRefs, onChange, expand, onInserted})

  const focusMode = useComposerFocusMode({
    prompts,
    editorRefs: editorRefs.current,
    answeredPromptIds,
    isPhone
  })
  const onShare = useCallback(() => {
    if (answeredPromptIds.size === 0) return
    if (isShared && dirtyPromptIds.size === 0) return
    share(() => {
      setIsExpanded(false)
      setIsEditingAfterShare(false)
    })
    setHasInsertedFromInspiration(false)
  }, [share, answeredPromptIds.size, isShared, dirtyPromptIds.size])

  const onOpenInspiration = useCallback(() => {
    commitLocalUpdate(atmosphere, (store) => {
      const proxy = store.get(meetingId)
      if (!proxy) return
      proxy.setValue(null, 'localStageId')
      proxy.setValue(rightDrawerOpen === 'inspiration' ? null : 'inspiration', 'rightDrawerOpen')
    })
  }, [atmosphere, meetingId, rightDrawerOpen])

  usePhoneComposerBridge({
    focusedPromptId: focusMode.focusedPromptId,
    blur: focusMode.blur,
    focusNextUnanswered: focusMode.focusNextUnanswered,
    answeredCount: answeredPromptIds.size,
    promptCount: prompts.length,
    isLastPrompt: focusMode.isLastPrompt,
    share: onShare,
    openInspiration: onOpenInspiration,
    isShared,
    isDirty: dirtyPromptIds.size > 0,
    submitting
  })

  if (!stage) return null
  const isPhoneFocused = isPhone && !!focusMode.focusedPromptId
  const isPhoneCollapsed = isPhone && isShared && !isEditingAfterShare
  const isCardOpen = isPhone ? !isPhoneCollapsed : isExpanded
  return (
    <div className={cn(TEAM_UPDATES_BAND, isPhoneCollapsed ? 'px-0' : 'pt-6 pb-2')}>
      <div className={TEAM_UPDATES_COLUMN}>
        {isPhoneCollapsed ? (
          <TeamPromptOwnUpdateRow
            picture={stage.teamMember.user.picture}
            sharedAt={sharedAt}
            updatedAt={lastAnswerAt}
            isEnded={!!endedAt}
            onEdit={() => setIsEditingAfterShare(true)}
          />
        ) : (
          !isPhoneFocused && (
            <TeamPromptComposerHeader
              picture={stage.teamMember.user.picture}
              isExpanded={isCardOpen}
              onToggle={() => setIsExpanded((wasExpanded) => !wasExpanded)}
              isShared={isShared}
              sharedAt={sharedAt}
              updatedAt={lastAnswerAt}
              preview={preview}
              answeredCount={answeredPromptIds.size}
              promptCount={prompts.length}
              isPhone={isPhone}
              templateName={template?.name}
              onDone={
                isPhone && isEditingAfterShare && dirtyPromptIds.size === 0
                  ? () => setIsEditingAfterShare(false)
                  : undefined
              }
            />
          )
        )}
        <div className={cn(!isCardOpen && 'hidden')}>
          <TeamPromptAnswerList
            teamId={teamId}
            prompts={prompts}
            initialContentByPrompt={initialContentByPrompt}
            savedTextByPrompt={savedTextByPrompt}
            answeredPromptIds={answeredPromptIds}
            editorRefs={editorRefs}
            readOnly={!!endedAt}
            isPhone={isPhone}
            focusMode={focusMode}
            onChange={onChange}
            onModEnter={onShare}
          />
          {!endedAt &&
            (isPhone ? (
              <TeamPromptPhoneComposerFooter
                isShared={isShared}
                hasInsertedFromInspiration={hasInsertedFromInspiration}
              />
            ) : (
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
            ))}
        </div>
      </div>
    </div>
  )
}

export default TeamPromptComposer
