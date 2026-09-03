import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {LinearFieldMenu_stage$key} from '../__generated__/LinearFieldMenu_stage.graphql'
import useUpdateIntegrationDimensionFieldMutation from '../mutations/useUpdateIntegrationDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import {
  fromSelectValue,
  SERVICE_FIELD_NULL_VALUE,
  toSelectValue
} from '../utils/serviceFieldSelectValue'

interface Props {
  stageRef: LinearFieldMenu_stage$key
  trigger: ReactNode
  onOpenChange: (isOpen: boolean) => void
  submitScore(): void
}

const LinearFieldMenu = (props: Props) => {
  const {stageRef, trigger, onOpenChange, submitScore} = props
  const [updateIntegrationDimensionField] = useUpdateIntegrationDimensionFieldMutation()
  const stage = useFragment(
    graphql`
      fragment LinearFieldMenu_stage on EstimateStage {
        serviceField {
          name
        }
        dimensionRef {
          name
        }
        task {
          id
          integration {
            ... on _xLinearIssue {
              __typename
              id
            }
          }
        }
        meetingId
      }
    `,
    stageRef
  )
  const {serviceField, task, dimensionRef, meetingId} = stage
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  if (task?.integration?.__typename !== '_xLinearIssue') return null
  const {id: taskId} = task
  const handleValueChange = (value: string) => {
    const labelTemplate = fromSelectValue(value)
    if (labelTemplate !== serviceFieldName) {
      updateIntegrationDimensionField(
        {variables: {meetingId, taskId, dimensionName, fieldId: labelTemplate}},
        {onSuccess: submitScore}
      )
    } else {
      submitScore()
    }
  }
  return (
    <Select
      value={toSelectValue(serviceFieldName)}
      onValueChange={handleValueChange}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger asChild>{trigger}</SelectTrigger>
      <SelectContent align='end' className='max-h-56 overflow-y-auto'>
        <SelectItem value={SprintPokerDefaults.LINEAR_FIELD_ESTIMATE}>
          {SprintPokerDefaults.LINEAR_FIELD_ESTIMATE_LABEL}
        </SelectItem>
        <SelectItem value={SprintPokerDefaults.LINEAR_FIELD_PRIORITY}>
          {SprintPokerDefaults.LINEAR_FIELD_PRIORITY_LABEL}
        </SelectItem>
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

export default LinearFieldMenu
