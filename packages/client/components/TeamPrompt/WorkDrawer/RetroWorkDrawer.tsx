import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {RetroWorkDrawer_meeting$key} from '../../../__generated__/RetroWorkDrawer_meeting.graphql'
import useInspirationDrawer from '../../../hooks/useInspirationDrawer'
import dndNoise from '../../../utils/dndNoise'
import getNextSortOrder from '../../../utils/getNextSortOrder'
import InspirationSettingsButton from './InspirationSettingsButton'
import InspirationSettingsDialog from './InspirationSettingsDialog'
import InspirationSourceTiles from './InspirationSourceTiles'
import {dateRangeLabel} from './inspirationCopy'
import RetroActionItems from './RetroActionItems'
import RetroWorkSection from './RetroWorkSection'
import useInspirationSourceDraft from './useInspirationSourceDraft'
import WorkDrawerConsumeContext from './WorkDrawerConsumeContext'

// A retro's reflect phase outlasts the standup's five minutes, and redrafting mid-phase would
// reword drafts the viewer already added
const RETRO_DRAFT_LIFESPAN_MS = 60 * 60 * 1000

interface Props {
  meetingRef: RetroWorkDrawer_meeting$key
}

const RetroWorkDrawer = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroWorkDrawer_meeting on RetrospectiveMeeting {
        ...useInspirationDrawer_meeting
        id
        organization {
          useAI
        }
        reflectionGroups {
          promptId
          sortOrder
          reflections {
            plaintextContent
          }
        }
        phases {
          ... on ReflectPhase {
            phaseType
            reflectPrompts {
              id
              question
              groupColor
            }
          }
        }
        prevMeeting {
          ...RetroActionItems_meeting
        }
        prevCompletedMeeting {
          ...RetroActionItems_meeting
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
  const {id: meetingId} = meeting
  const lastRetro = meeting.prevMeeting ?? meeting.prevCompletedMeeting
  const teamMember = meeting.viewerMeetingMember?.teamMember
  const {dateRange, setDateRange, isDefaultRange} = useInspirationDrawer('draft', meeting)
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
    instructionsKey: 'Inspiration:retroInstructions',
    lifespanMs: RETRO_DRAFT_LIFESPAN_MS
  })

  // Reflect phase stacks reflections descending by sortOrder, so the highest sortOrder is on top.
  const getNextReflectionSortOrder = (promptId: string | null) => {
    const promptGroups = meeting.reflectionGroups.filter((group) => group.promptId === promptId)
    return getNextSortOrder(promptGroups, dndNoise())
  }
  const reflectPrompts = meeting.phases.flatMap((phase) => phase.reflectPrompts ?? [])
  const getReflectPrompt = (promptId: string | null) => {
    const prompt = reflectPrompts.find(({id}) => id === promptId)
    return prompt ? {question: prompt.question, groupColor: prompt.groupColor} : null
  }
  const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim()
  const isReflectionAdded = (promptId: string | null, plaintext: string) => {
    const target = normalizeText(plaintext)
    if (!target) return false
    return meeting.reflectionGroups.some(
      (group) =>
        group.promptId === promptId &&
        group.reflections.some((r) => normalizeText(r.plaintextContent) === target)
    )
  }

  return (
    <WorkDrawerConsumeContext.Provider
      value={{
        mode: 'retro',
        meetingId,
        reflectPrompts,
        getNextReflectionSortOrder,
        getReflectPrompt,
        isReflectionAdded
      }}
    >
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
            dateLabel={dateRangeLabel(
              draftRange,
              isDefaultRange && lastRetro ? 'Since last retro' : null
            )}
            hasInstructions={canDraft && !!instructions.trim()}
            canDraft={canDraft}
            onClick={() => setSettingsOpen(true)}
          />
        </div>
        <RetroActionItems meetingRef={lastRetro} />
        <RetroWorkSection
          draft={draft}
          drafting={drafting}
          error={error}
          aiOffMessage={aiOffMessage}
          dateRange={draftRange}
        />
        {settingsOpen && (
          <InspirationSettingsDialog
            isOpen
            meetingKind='retro'
            onClose={() => setSettingsOpen(false)}
            dateRange={dateRange}
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
    </WorkDrawerConsumeContext.Provider>
  )
}

export default RetroWorkDrawer
