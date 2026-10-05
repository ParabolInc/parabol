import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamPromptComposer_meeting$key} from '~/__generated__/TeamPromptComposer_meeting.graphql'
import {cn} from '../../../ui/cn'
import TeamPromptAnswerEditor from './TeamPromptAnswerEditor'
import TeamPromptComposerFooter from './TeamPromptComposerFooter'
import TeamPromptComposerHeader from './TeamPromptComposerHeader'
import {TEAM_UPDATES_BAND, TEAM_UPDATES_COLUMN} from './teamUpdatesLayout'
import useTeamPromptComposer from './useTeamPromptComposer'

interface Props {
  meetingRef: TeamPromptComposer_meeting$key
}

const TeamPromptComposer = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptComposer_meeting on TeamPromptMeeting {
        ...useTeamPromptComposer_meeting
      }
    `,
    meetingRef
  )
  const {
    teamId,
    isEnded,
    prompts,
    stage,
    isShared,
    isExpanded,
    setIsExpanded,
    getEditorRef,
    onChange,
    onShare,
    submitting,
    isDirty,
    initialContentByPrompt,
    answeredPromptIds,
    preview,
    sharedAt,
    lastAnswerAt
  } = useTeamPromptComposer(meeting)

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
        <div className={cn(!isExpanded && 'hidden')}>
          <div className='flex flex-col gap-4 rounded-card bg-surface-card p-4 shadow-[var(--shadow-card)]'>
            {prompts.map((prompt, index) => {
              const nextPromptId = prompts[index + 1]?.id
              return (
                <TeamPromptAnswerEditor
                  key={prompt.id}
                  teamId={teamId}
                  prompt={prompt}
                  initialContent={initialContentByPrompt.get(prompt.id) ?? null}
                  readOnly={isEnded}
                  isAnswered={answeredPromptIds.has(prompt.id)}
                  compact={prompts.length === 1}
                  onChange={onChange}
                  onModEnter={onShare}
                  onTab={
                    nextPromptId
                      ? () => getEditorRef(nextPromptId).current?.commands.focus('end')
                      : undefined
                  }
                  editorRef={getEditorRef(prompt.id)}
                />
              )
            })}
          </div>
          {!isEnded && (
            <TeamPromptComposerFooter
              isShared={isShared}
              isDirty={isDirty}
              answeredCount={answeredPromptIds.size}
              promptCount={prompts.length}
              submitting={submitting}
              onShare={onShare}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamPromptComposer
