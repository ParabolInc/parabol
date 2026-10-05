import graphql from 'babel-plugin-relay/macro'
import dayjs from 'dayjs'
import {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import type {TeamPromptWorkDrawer_meeting$key} from '../../__generated__/TeamPromptWorkDrawer_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useInspirationDrawer from '../../hooks/useInspirationDrawer'
import useLocalStorageState from '../../hooks/useLocalStorageState'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import {useTeamPromptComposerApi} from './structured/TeamPromptComposerApiContext'
import buildInspirationSearchQuery from './WorkDrawer/buildInspirationSearchQuery'
import InspirationDraftSection from './WorkDrawer/InspirationDraftSection'
import InspirationSettingsButton from './WorkDrawer/InspirationSettingsButton'
import InspirationSettingsDialog from './WorkDrawer/InspirationSettingsDialog'
import InspirationSourceTiles from './WorkDrawer/InspirationSourceTiles'
import {dateRangeLabel} from './WorkDrawer/inspirationCopy'
import {
  DEFAULT_INSPIRATION_SOURCE_SETTINGS,
  type InspirationSourceSettings,
  withInspirationSourceDefaults
} from './WorkDrawer/inspirationSources'
import useInspirationDraft from './WorkDrawer/useInspirationDraft'
import useInspirationSourceAvailability from './WorkDrawer/useInspirationSourceAvailability'

interface Props {
  meetingRef: TeamPromptWorkDrawer_meeting$key
}

const TeamPromptWorkDrawer = ({meetingRef}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptWorkDrawer_meeting on TeamPromptMeeting {
        ...useInspirationDrawer_meeting
        id
        teamId
        prompts {
          id
          question
          groupColor
        }
        viewerMeetingMember {
          teamMember {
            ...useInspirationSourceAvailability_teamMember
            ...InspirationSourcePopover_teamMember
          }
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, teamId, prompts} = meeting
  const teamMember = meeting.viewerMeetingMember?.teamMember
  const atmosphere = useAtmosphere()
  const composer = useTeamPromptComposerApi()
  const availability = useInspirationSourceAvailability(teamMember)
  const {dateRange, setDateRange, isDefaultRange} = useInspirationDrawer('draft', meeting)
  const [storedSettings, setStoredSettings] = useLocalStorageState<
    Partial<InspirationSourceSettings>
  >('Inspiration:sources', DEFAULT_INSPIRATION_SOURCE_SETTINGS)
  const settings = withInspirationSourceDefaults(storedSettings)
  const setSettings = (update: (prev: InspirationSourceSettings) => InspirationSourceSettings) =>
    setStoredSettings((prev) => update(withInspirationSourceDefaults(prev)))
  const [instructions, setInstructions] = useLocalStorageState('Inspiration:instructions', '')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [anyTimeRange] = useState(() => ({
    startAt: dayjs().subtract(2, 'week').toISOString(),
    endAt: dayjs().endOf('day').toISOString()
  }))
  const draftRange = dateRange ?? anyTimeRange
  const sources = availability
    .filter(({service, isConnected}) => isConnected && settings.kinds[service].length > 0)
    .map(({service}) => ({
      service,
      searchQuery: buildInspirationSearchQuery(service, settings, draftRange)
    }))
  const {draft, requestRedraft, drafting, error} = useInspirationDraft({
    meetingId,
    isMeetingMember: !!teamMember,
    sources,
    instructions
  })
  const draftedIssues = draft?.issues ?? []
  const draftedQueries = new Map(
    (draft?.sources ?? []).map(({service, searchQuery}) => [service, searchQuery])
  )
  const countingServices = drafting
    ? sources.flatMap(({service, searchQuery}) =>
        draftedQueries.get(service) === searchQuery ? [] : [service]
      )
    : []
  const issueCounts = Object.fromEntries(
    (draft?.sources ?? []).map(({service}) => [
      service,
      draftedIssues.filter((issue) => issue.service === service).length
    ])
  )

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Impression', {teamId, meetingId})
  }, [])

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
      <div className='flex flex-col gap-3 px-4 pt-4'>
        {teamMember && (
          <InspirationSourceTiles
            sources={availability}
            issueCounts={issueCounts}
            countingServices={countingServices}
            meetingId={meetingId}
            settings={settings}
            setSettings={setSettings}
            onPopoverClose={() => requestRedraft()}
            teamMemberRef={teamMember}
          />
        )}
        <InspirationSettingsButton
          dateLabel={dateRangeLabel(draftRange, isDefaultRange)}
          hasInstructions={!!instructions.trim()}
          onClick={() => setSettingsOpen(true)}
        />
      </div>
      <InspirationDraftSection
        draft={draft}
        meetingId={meetingId}
        teamId={teamId}
        prompts={prompts}
        composer={composer}
        drafting={drafting}
        error={error}
      />
      {settingsOpen && (
        <InspirationSettingsDialog
          isOpen
          onClose={() => setSettingsOpen(false)}
          dateRange={dateRange}
          instructions={instructions}
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
