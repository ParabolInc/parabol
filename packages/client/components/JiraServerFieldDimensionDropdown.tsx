import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ExpandMore} from '~/ui/icons'
import type {JiraServerFieldDimensionDropdown_stage$key} from '../__generated__/JiraServerFieldDimensionDropdown_stage.graphql'
import {SprintPokerDefaults} from '../types/constEnums'
import {cn} from '../ui/cn'
import {SelectValue} from '../ui/Select/SelectValue'
import JiraServerFieldMenu from './JiraServerFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: JiraServerFieldDimensionDropdown_stage$key
  submitScore(): void
}

const labelLookup = {
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
} as const

const JiraServerFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props

  const stage = useFragment(
    graphql`
      fragment JiraServerFieldDimensionDropdown_stage on EstimateStage {
        ...JiraServerFieldMenu_stage
        serviceField {
          name
        }
        task {
          integration {
            ... on JiraServerIssue {
              id
              possibleEstimationFieldNames
            }
          }
        }
      }
    `,
    stageRef
  )

  const {serviceField, task} = stage
  const possibleEstimationFieldNames = task?.integration?.possibleEstimationFieldNames ?? []
  const {name: serviceFieldName} = serviceField
  const lookupServiceFieldName = [
    ...possibleEstimationFieldNames,
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ].includes(serviceFieldName)
    ? serviceFieldName
    : SprintPokerDefaults.SERVICE_FIELD_COMMENT

  const label =
    labelLookup[lookupServiceFieldName as keyof typeof labelLookup] ?? lookupServiceFieldName
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
    <JiraServerFieldMenu
      stage={stage}
      trigger={trigger}
      onOpenChange={(isOpen) => isOpen && clearError()}
      submitScore={submitScore}
    />
  )
}

export default JiraServerFieldDimensionDropdown
