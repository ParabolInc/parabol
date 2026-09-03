import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {OpenInNew} from '~/ui/icons'
import type {JiraFieldMenu_stage$key} from '../__generated__/JiraFieldMenu_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useUpdateIntegrationDimensionFieldMutation from '../mutations/useUpdateIntegrationDimensionFieldMutation'
import {ExternalLinks, SprintPokerDefaults} from '../types/constEnums'
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectSeparator} from '../ui/Select/SelectSeparator'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import {fromSelectValue, SERVICE_FIELD_NULL_VALUE} from '../utils/serviceFieldSelectValue'

// picking this doesn't change the field, it opens the Jira docs
const MISSING_FIELD = '__missingField'

interface Props {
  stage: JiraFieldMenu_stage$key
  trigger: ReactNode
  onOpenChange: (isOpen: boolean) => void
  submitScore(): void
}

const JiraFieldMenu = (props: Props) => {
  const {stage: stageRef, trigger, onOpenChange, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment JiraFieldMenu_stage on EstimateStage {
        dimensionRef {
          name
        }
        meetingId
        serviceField {
          name
        }
        task {
          id
          teamId
          integration {
            ... on JiraIssue {
              __typename
              possibleEstimationFields {
                fieldId
                fieldName
              }
              missingEstimationFieldHint
            }
          }
        }
      }
    `,
    stageRef
  )
  const atmosphere = useAtmosphere()
  const [updateIntegrationDimensionField] = useUpdateIntegrationDimensionFieldMutation()
  const {meetingId, dimensionRef, serviceField, task} = stage
  if (task?.integration?.__typename !== 'JiraIssue') return null
  const {id: taskId, teamId, integration} = task
  const {possibleEstimationFields, missingEstimationFieldHint} = integration

  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  // the items carry fieldIds, but the stage stores the field's name
  const selectedField = possibleEstimationFields.find(
    ({fieldName}) => fieldName === serviceFieldName
  )
  const selectedValue = selectedField
    ? selectedField.fieldId
    : serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL
      ? SERVICE_FIELD_NULL_VALUE
      : SprintPokerDefaults.SERVICE_FIELD_COMMENT

  const openMissingFieldDocs = () => {
    if (!missingEstimationFieldHint) {
      return
    }

    if (missingEstimationFieldHint === 'companyManagedStoryPoints') {
      window.open(
        ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_MISSING_FIELD_COMPANY_MANAGED,
        '_blank',
        'noreferrer'
      )
    } else if (missingEstimationFieldHint === 'teamManagedStoryPoints') {
      window.open(
        ExternalLinks.INTEGRATIONS_SUPPORT_JIRA_MISSING_FIELD_TEAM_MANAGED,
        '_blank',
        'noreferrer'
      )
    }
    SendClientSideEvent(atmosphere, 'Jira Missing Field Doc Link Clicked', {
      meetingId,
      teamId,
      taskId,
      jiraProjectType:
        missingEstimationFieldHint === 'companyManagedStoryPoints' ? 'COMPANY' : 'TEAM'
    })
  }

  const handleValueChange = (value: string) => {
    if (value === MISSING_FIELD) {
      openMissingFieldDocs()
      return
    }
    const fieldId = fromSelectValue(value)
    updateIntegrationDimensionField(
      {
        variables: {meetingId, taskId, dimensionName, fieldId},
        optimisticFieldName: possibleEstimationFields.find((field) => field.fieldId === fieldId)
          ?.fieldName
      },
      {onSuccess: submitScore}
    )
  }
  return (
    <Select value={selectedValue} onValueChange={handleValueChange} onOpenChange={onOpenChange}>
      <SelectTrigger asChild>{trigger}</SelectTrigger>
      <SelectContent align='end' className='max-h-56 overflow-y-auto'>
        {possibleEstimationFields.map(({fieldId, fieldName}) => {
          return (
            <SelectItem key={fieldId} value={fieldId}>
              {fieldName}
            </SelectItem>
          )
        })}
        {possibleEstimationFields.length > 0 && <SelectSeparator />}
        <SelectItem value={SprintPokerDefaults.SERVICE_FIELD_COMMENT}>
          {SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL}
        </SelectItem>
        <SelectItem value={SERVICE_FIELD_NULL_VALUE}>
          {SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
        </SelectItem>
        {missingEstimationFieldHint && (
          <SelectItem
            value={MISSING_FIELD}
            className='italic'
            endAdornment={<OpenInNew className='h-[18px] w-[18px] text-fg-muted' />}
          >
            Where's my field?
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}

export default JiraFieldMenu
