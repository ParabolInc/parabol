import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ExpandMore} from '~/ui/icons'
import type {LinearFieldDimensionDropdown_stage$key} from '../__generated__/LinearFieldDimensionDropdown_stage.graphql'
import interpolateVotingLabelTemplate from '../shared/interpolateVotingLabelTemplate'
import {SprintPokerDefaults} from '../types/constEnums'
import {cn} from '../ui/cn'
import {SelectValue} from '../ui/Select/SelectValue'
import LinearFieldMenu from './LinearFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: LinearFieldDimensionDropdown_stage$key
  submitScore(): void
}

const labelLookup = {
  [SprintPokerDefaults.LINEAR_FIELD_ESTIMATE]: SprintPokerDefaults.LINEAR_FIELD_ESTIMATE_LABEL,
  [SprintPokerDefaults.LINEAR_FIELD_PRIORITY]: SprintPokerDefaults.LINEAR_FIELD_PRIORITY_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

const LinearFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment LinearFieldDimensionDropdown_stage on EstimateStage {
        ...LinearFieldMenu_stage
        finalScore
        serviceField {
          name
        }
      }
    `,
    stageRef
  )
  const {finalScore, serviceField} = stage
  const {name: serviceFieldName} = serviceField
  const label =
    labelLookup[serviceFieldName as keyof typeof labelLookup] ||
    interpolateVotingLabelTemplate(serviceFieldName, finalScore)

  const labelEl = <div className='text-sm'>{label}</div>
  const trigger = (
    <PlainButton
      className={cn(
        'flex select-none text-fg-primary',
        isFacilitator
          ? 'hover:opacity-50 active:opacity-50 data-[state=open]:opacity-50'
          : 'cursor-default pr-2'
      )}
    >
      {isFacilitator ? <SelectValue>{labelEl}</SelectValue> : labelEl}
      <ExpandMore className={cn('h-[18px] w-[18px]', !isFacilitator && 'hidden')} />
    </PlainButton>
  )

  if (!isFacilitator) return trigger

  return (
    <LinearFieldMenu
      stageRef={stage}
      trigger={trigger}
      onOpenChange={(isOpen) => isOpen && clearError()}
      submitScore={submitScore}
    />
  )
}

export default LinearFieldDimensionDropdown
