import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {ExpandMore} from '~/ui/icons'
import type {JiraFieldDimensionDropdown_stage$key} from '../__generated__/JiraFieldDimensionDropdown_stage.graphql'
import {SprintPokerDefaults} from '../types/constEnums'
import {cn} from '../ui/cn'
import {SelectValue} from '../ui/Select/SelectValue'
import JiraFieldMenu from './JiraFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: JiraFieldDimensionDropdown_stage$key
  submitScore(): void
}

const labelLookup = {
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

const JiraFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props

  const stage = useFragment(
    graphql`
      fragment JiraFieldDimensionDropdown_stage on EstimateStage {
        ...JiraFieldMenu_stage
        serviceField {
          name
        }
        task {
          integration {
            ... on JiraIssue {
              possibleEstimationFields {
                fieldId
                fieldName
              }
            }
          }
        }
      }
    `,
    stageRef
  )

  const {serviceField, task} = stage
  const possibleEstimationFields = task?.integration?.possibleEstimationFields ?? []
  const {name: serviceFieldName} = serviceField
  const validFields = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL,
    ...possibleEstimationFields.map(({fieldName}) => fieldName)
  ]
  const lookupServiceFieldName = validFields.includes(serviceFieldName)
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
    <JiraFieldMenu
      stage={stage}
      trigger={trigger}
      onOpenChange={(isOpen) => isOpen && clearError()}
      submitScore={submitScore}
    />
  )
}

export default JiraFieldDimensionDropdown
