import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import type {RetroMeetingSettings_meeting$key} from '../../__generated__/RetroMeetingSettings_meeting.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import type useGotoStageId from '../../hooks/useGotoStageId'
import useSetMeetingSettingsMutation from '../../mutations/useSetMeetingSettingsMutation'
import {toHumanReadable} from '../../utils/humanReadableRecurrenceRule'
import getRetroSettingSections, {
  PHASE_SETTINGS,
  type RetroPhaseSettingId,
  type RetroSettingId
} from './getRetroSettingSections'
import RetroSettingLinkRow from './RetroSettingLinkRow'
import RetroSettingRow from './RetroSettingRow'
import RetroSettingsSection from './RetroSettingsSection'

export type RetroSettingsSubview = 'settingsTemplate' | 'settingsRecurrence'

interface Props {
  meetingRef: RetroMeetingSettings_meeting$key
  onOpenSubview: (subview: RetroSettingsSubview) => void
  gotoStageId?: ReturnType<typeof useGotoStageId>
}

const RetroMeetingSettings = ({meetingRef, onOpenSubview, gotoStageId}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment RetroMeetingSettings_meeting on RetrospectiveMeeting {
        id
        facilitatorUserId
        facilitatorStageId
        disableAnonymity
        template {
          id
          name
        }
        reflectionGroups {
          id
        }
        phases {
          id
          phaseType
          stages {
            id
            isComplete
          }
        }
        meetingSeries {
          id
          cancelledAt
          recurrenceRule
          template {
            id
            name
          }
        }
        team {
          id
          retroSettings: meetingSettings(meetingType: retrospective) {
            id
            phaseTypes
            ... on RetrospectiveMeetingSettings {
              disableAnonymity
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {viewerId} = useAtmosphere()
  const [setMeetingSettings, submitting] = useSetMeetingSettingsMutation()
  const {id: meetingId, phases, facilitatorStageId, meetingSeries, template, team} = meeting
  const {retroSettings} = team
  const {id: settingsId} = retroSettings
  const isRecurring = !!meetingSeries && !meetingSeries.cancelledAt
  const phaseTypes = phases.map(({phaseType}) => phaseType)
  const currentPhaseIdx = phases.findIndex(({stages}) =>
    stages.some(({id}) => id === facilitatorStageId)
  )
  const currentPhase = phases[currentPhaseIdx]
  const reflectPhase = phases.find(({phaseType}) => phaseType === 'reflect')
  const {forThisMeeting, forFutureMeetings} = getRetroSettingSections({
    isRecurring,
    isViewerFacilitator: viewerId === meeting.facilitatorUserId,
    facilitatorPhaseType: currentPhase?.phaseType,
    phaseTypes,
    hasReflections: meeting.reflectionGroups.length > 0,
    isReflectDone: !reflectPhase || reflectPhase.stages.every(({isComplete}) => isComplete)
  })

  const setPhase = (settingId: RetroPhaseSettingId, isEnabled: boolean, isNow: boolean) => {
    const {phaseType, variable} = PHASE_SETTINGS[settingId]
    const isEndingCurrentPhase = isNow && !isEnabled && currentPhase?.phaseType === phaseType
    if (!isEndingCurrentPhase || isRecurring) {
      setMeetingSettings({variables: {settingsId, meetingId, [variable]: isEnabled}})
    }
    if (isEndingCurrentPhase) {
      const nextStage = phases[currentPhaseIdx + 1]?.stages[0]
      if (nextStage) gotoStageId?.(nextStage.id)
    }
  }

  const renderRow = (settingId: RetroSettingId, isNow: boolean) => (
    <RetroSettingRow
      key={settingId}
      settingId={settingId}
      templateName={
        (isNow ? template?.name : (meetingSeries?.template?.name ?? template?.name)) ?? ''
      }
      disableAnonymity={isNow ? meeting.disableAnonymity : !!retroSettings.disableAnonymity}
      phaseTypes={isNow ? phaseTypes : retroSettings.phaseTypes}
      disabled={submitting}
      onChangeTemplate={() => onOpenSubview('settingsTemplate')}
      onAnonymityChange={(isAnonymous) =>
        setMeetingSettings({variables: {settingsId, meetingId, disableAnonymity: !isAnonymous}})
      }
      onPhaseChange={(phaseSettingId, isEnabled) => setPhase(phaseSettingId, isEnabled, isNow)}
    />
  )

  const rrule = isRecurring ? RRule.fromString(meetingSeries.recurrenceRule) : null
  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-1 pb-6'>
      {forThisMeeting.length > 0 && (
        <RetroSettingsSection
          heading={isRecurring ? 'This meeting and future meetings' : 'This meeting'}
        >
          {forThisMeeting.map((settingId) => renderRow(settingId, true))}
        </RetroSettingsSection>
      )}
      <RetroSettingsSection heading='Future meetings'>
        {forFutureMeetings.map((settingId) => renderRow(settingId, false))}
        <RetroSettingLinkRow
          label='Repeats'
          value={rrule ? toHumanReadable(rrule) : 'Doesn’t repeat'}
          actionLabel={isRecurring ? 'Edit' : 'Set up'}
          onAction={() => onOpenSubview('settingsRecurrence')}
        />
      </RetroSettingsSection>
    </div>
  )
}

export default RetroMeetingSettings
