import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {JiraServerFieldMenu_stage$key} from '../__generated__/JiraServerFieldMenu_stage.graphql'
import useUpdateIntegrationDimensionFieldMutation from '../mutations/useUpdateIntegrationDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectSeparator} from '../ui/Select/SelectSeparator'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import {
  fromSelectValue,
  SERVICE_FIELD_NULL_VALUE,
  toSelectValue
} from '../utils/serviceFieldSelectValue'

interface Props {
  stage: JiraServerFieldMenu_stage$key
  trigger: ReactNode
  onOpenChange: (isOpen: boolean) => void
  submitScore(): void
}

const JiraServerFieldMenu = (props: Props) => {
  const {stage: stageRef, trigger, onOpenChange, submitScore} = props
  const [updateIntegrationDimensionField] = useUpdateIntegrationDimensionFieldMutation()

  const stage = useFragment(
    graphql`
      fragment JiraServerFieldMenu_stage on EstimateStage {
        dimensionRef {
          name
        }
        meetingId
        serviceField {
          name
        }
        task {
          id
          integration {
            ... on JiraServerIssue {
              __typename
              id
              possibleEstimationFieldNames
            }
          }
        }
      }
    `,
    stageRef
  )
  const {meetingId, dimensionRef, serviceField, task} = stage

  if (task?.integration?.__typename !== 'JiraServerIssue') return null

  const {id: taskId, integration} = task
  const {possibleEstimationFieldNames} = integration

  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const selectedValue = [
    ...possibleEstimationFieldNames,
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ].includes(serviceFieldName)
    ? toSelectValue(serviceFieldName)
    : SprintPokerDefaults.SERVICE_FIELD_COMMENT

  const handleValueChange = (value: string) => {
    updateIntegrationDimensionField(
      {variables: {meetingId, taskId, dimensionName, fieldId: fromSelectValue(value)}},
      {onSuccess: submitScore}
    )
  }
  return (
    <Select value={selectedValue} onValueChange={handleValueChange} onOpenChange={onOpenChange}>
      <SelectTrigger asChild>{trigger}</SelectTrigger>
      <SelectContent align='end' className='max-h-56 overflow-y-auto'>
        {possibleEstimationFieldNames.length === 0 && (
          <div className='px-4 pt-2 pb-0 text-fg-secondary text-sm'>No fields found</div>
        )}
        {possibleEstimationFieldNames.map((fieldName) => {
          return (
            <SelectItem key={fieldName} value={fieldName}>
              {fieldName}
            </SelectItem>
          )
        })}
        <SelectSeparator />
        <SelectItem value={SprintPokerDefaults.SERVICE_FIELD_COMMENT}>
          {SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL}
        </SelectItem>
        <SelectItem value={SERVICE_FIELD_NULL_VALUE}>
          {SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default JiraServerFieldMenu
