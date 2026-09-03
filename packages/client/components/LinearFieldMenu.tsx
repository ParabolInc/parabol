import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {LinearFieldMenu_stage$key} from '../__generated__/LinearFieldMenu_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import UpdateLinearDimensionFieldMutation from '../mutations/UpdateLinearDimensionFieldMutation'
import LinearProjectId from '../shared/gqlIds/LinearProjectId'
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
  const atmosphere = useAtmosphere()
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
          integration {
            ... on _xLinearIssue {
              __typename
              id
              project {
                id
              }
              team {
                id
              }
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
  const {integration} = task
  const {
    project,
    team: {id: teamId}
  } = integration
  if (!teamId) return null
  const {id: projectId} = project ?? {id: undefined}
  const repoId = LinearProjectId.join(teamId, projectId)
  const handleValueChange = (value: string) => {
    const labelTemplate = fromSelectValue(value)
    if (labelTemplate !== serviceFieldName) {
      UpdateLinearDimensionFieldMutation(
        atmosphere,
        {
          dimensionName,
          labelTemplate,
          repoId,
          meetingId
        },
        {
          onCompleted: submitScore,
          onError: () => {
            /* noop */
          }
        }
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
