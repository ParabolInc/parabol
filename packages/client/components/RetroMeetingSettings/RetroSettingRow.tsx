import {
  PHASE_SETTINGS,
  type RetroPhaseSettingId,
  type RetroSettingId
} from './getRetroSettingSections'
import RetroSettingCheckRow from './RetroSettingCheckRow'
import RetroSettingLinkRow from './RetroSettingLinkRow'

const PHASE_COPY = {
  icebreaker: {label: 'Include icebreaker', description: 'Open with a warm-up question'},
  reviewTasks: {label: 'Review tasks', description: 'Go over open tasks before reflecting'}
} satisfies Record<RetroPhaseSettingId, {label: string; description: string}>

interface Props {
  settingId: RetroSettingId
  templateName: string
  disableAnonymity: boolean
  phaseTypes: readonly string[]
  disabled: boolean
  onChangeTemplate: () => void
  onAnonymityChange: (isAnonymous: boolean) => void
  onPhaseChange: (settingId: RetroPhaseSettingId, isEnabled: boolean) => void
}

const RetroSettingRow = (props: Props) => {
  const {settingId, templateName, disableAnonymity, phaseTypes, disabled} = props
  if (settingId === 'template') {
    return (
      <RetroSettingLinkRow
        label='Template'
        value={templateName}
        actionLabel='Change'
        disabled={disabled}
        onAction={props.onChangeTemplate}
      />
    )
  }
  if (settingId === 'anonymity') {
    return (
      <RetroSettingCheckRow
        label='Anonymous reflections'
        description='Hide who wrote each reflection'
        checked={!disableAnonymity}
        disabled={disabled}
        onCheckedChange={props.onAnonymityChange}
      />
    )
  }
  const {label, description} = PHASE_COPY[settingId]
  return (
    <RetroSettingCheckRow
      label={label}
      description={description}
      checked={phaseTypes.includes(PHASE_SETTINGS[settingId].phaseType)}
      disabled={disabled}
      onCheckedChange={(isEnabled) => props.onPhaseChange(settingId, isEnabled)}
    />
  )
}

export default RetroSettingRow
