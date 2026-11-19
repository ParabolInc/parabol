import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptWorkDrawer_meeting$key} from '../../__generated__/TeamPromptWorkDrawer_meeting.graphql'
import useInspirationDrawer from '../../hooks/useInspirationDrawer'
import {useTeamPromptComposerApi} from './structured/TeamPromptComposerApiContext'
import InspirationDraftSection from './WorkDrawer/InspirationDraftSection'
import InspirationSettingsButton from './WorkDrawer/InspirationSettingsButton'
import InspirationSettingsDialog from './WorkDrawer/InspirationSettingsDialog'
import InspirationSourceTiles from './WorkDrawer/InspirationSourceTiles'
import InspirationWorkSection from './WorkDrawer/InspirationWorkSection'
import {dateRangeLabel} from './WorkDrawer/inspirationCopy'
import useInspirationSourceDraft from './WorkDrawer/useInspirationSourceDraft'

const SINCE_LAST_STANDUP = 'Since last standup'

interface Props {
  meetingRef: TeamPromptWorkDrawer_meeting$key
}

const TeamPromptWorkDrawer = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptWorkDrawer_meeting on TeamPromptMeeting {
        ...useInspirationDrawer_meeting
        id
        organization {
          useAI
        }
        prompts {
          id
          question
          groupColor
        }
        viewerMeetingMember {
          teamMember {
            ...useInspirationSourceAvailability_teamMember
            ...InspirationSourceTiles_teamMember
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, prompts} = meeting
  const teamMember = meeting.viewerMeetingMember?.teamMember
  const composer = useTeamPromptComposerApi()
  const {dateRange, setDateRange, isDefaultRange, lastMeetingStartAt} = useInspirationDrawer(
    'draft',
    meeting
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const {
    availability,
    settings,
    setSettings,
    instructions,
    setInstructions,
    aiOffMessage,
    canDraft,
    draftRange,
    draft,
    requestRedraft,
    drafting,
    error,
    issueCounts,
    countingServices
  } = useInspirationSourceDraft({
    meetingId,
    teamMemberRef: teamMember,
    isOrgAIEnabled: meeting.organization.useAI,
    dateRange,
    instructionsKey: 'Inspiration:instructions'
  })

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <div className='flex flex-col gap-3 px-4 pt-4'>
        {teamMember && (
          <InspirationSourceTiles
            sources={availability}
            issueCounts={issueCounts}
            countingServices={countingServices}
            canDraft={canDraft}
            settings={settings}
            setSettings={setSettings}
            onPopoverClose={() => requestRedraft()}
            teamMemberRef={teamMember}
          />
        )}
        <InspirationSettingsButton
          dateLabel={dateRangeLabel(draftRange, isDefaultRange ? SINCE_LAST_STANDUP : null)}
          hasInstructions={canDraft && !!instructions.trim()}
          canDraft={canDraft}
          onClick={() => setSettingsOpen(true)}
        />
      </div>
      {aiOffMessage ? (
        <InspirationWorkSection
          draft={draft}
          drafting={drafting}
          error={error}
          aiOffMessage={aiOffMessage}
        />
      ) : (
        <InspirationDraftSection
          draft={draft}
          prompts={prompts}
          composer={composer}
          drafting={drafting}
          error={error}
        />
      )}
      {settingsOpen && (
        <InspirationSettingsDialog
          isOpen
          meetingKind='standup'
          onClose={() => setSettingsOpen(false)}
          dateRange={dateRange}
          sincePreset={
            lastMeetingStartAt
              ? {label: SINCE_LAST_STANDUP, startAt: lastMeetingStartAt}
              : undefined
          }
          instructions={instructions}
          canDraft={canDraft}
          onSave={(nextRange, nextInstructions) => {
            setDateRange(nextRange)
            setInstructions(nextInstructions)
            setSettingsOpen(false)
            requestRedraft(nextInstructions.trim() !== instructions.trim())
          }}
        />
      )}
    </div>
  )
}

export default TeamPromptWorkDrawer
