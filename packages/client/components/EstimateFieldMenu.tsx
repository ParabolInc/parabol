import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OpenInNew} from '~/ui/icons'
import type {EstimateFieldMenu_stage$key} from '../__generated__/EstimateFieldMenu_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useUpdateIntegrationDimensionFieldMutation from '../mutations/useUpdateIntegrationDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import EstimateFieldLabelTemplateItem from './EstimateFieldLabelTemplateItem'
import {findEstimateFieldOption, SENTINEL_FIELD_LABELS} from './estimateFieldOptions'

export type EditModalConfig = {
  updateLabelTemplate: (labelTemplate: string) => () => void
  defaultValue: string
  placeholder: string
}

interface Props {
  onOpenEditModal: (config: EditModalConfig) => void
  stageRef: EstimateFieldMenu_stage$key
  submitScore(): void
}

const EstimateFieldMenu = (props: Props) => {
  const {onOpenEditModal, stageRef, submitScore} = props
  const atmosphere = useAtmosphere()
  const [updateIntegrationDimensionField] = useUpdateIntegrationDimensionFieldMutation()
  const stage = useFragment(
    graphql`
      fragment EstimateFieldMenu_stage on EstimateStage {
        meetingId
        dimensionRef {
          name
        }
        serviceField {
          name
        }
        dimensionFieldListing {
          targets
          options {
            fieldId
            label
          }
          helpUrl
        }
        task {
          id
          teamId
          integration {
            service
          }
        }
      }
    `,
    stageRef
  )
  const {meetingId, dimensionRef, serviceField, dimensionFieldListing, task} = stage
  if (!task?.integration) return null
  const {id: taskId, teamId, integration} = task
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const {targets, options, helpUrl} = dimensionFieldListing
  const acceptsFields = targets.includes('field')
  const acceptsLabel = targets.includes('label')

  const handleClick = (fieldId: string) => () => {
    const isCurrent =
      fieldId === serviceFieldName ||
      findEstimateFieldOption(options, serviceFieldName)?.fieldId === fieldId
    if (isCurrent) {
      submitScore()
      return
    }
    updateIntegrationDimensionField(
      {
        variables: {meetingId, taskId, dimensionName, fieldId},
        optimisticFieldName: options.find((option) => option.fieldId === fieldId)?.label
      },
      {onSuccess: submitScore}
    )
  }

  const openHelp = () => {
    if (!helpUrl) return
    window.open(helpUrl, '_blank', 'noreferrer')
    SendClientSideEvent(atmosphere, 'Missing Estimate Field Doc Link Clicked', {
      meetingId,
      teamId,
      taskId,
      service: integration.service,
      helpUrl
    })
  }

  return (
    <MenuContent>
      {acceptsFields && options.length === 0 && (
        <div className='px-4 pt-2 pb-0 text-fg-secondary text-sm'>No fields found</div>
      )}
      {options.map(({fieldId, label}) => (
        <MenuItem key={fieldId} onClick={handleClick(fieldId)}>
          {label}
        </MenuItem>
      ))}
      {acceptsLabel && (
        <EstimateFieldLabelTemplateItem
          dimensionName={dimensionName}
          serviceFieldName={serviceFieldName}
          onSelect={handleClick}
          onOpenEditModal={onOpenEditModal}
        />
      )}
      <MenuItem onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_COMMENT)}>
        {SENTINEL_FIELD_LABELS[SprintPokerDefaults.SERVICE_FIELD_COMMENT]}
      </MenuItem>
      <MenuItem onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}>
        {SENTINEL_FIELD_LABELS[SprintPokerDefaults.SERVICE_FIELD_NULL]}
      </MenuItem>
      {helpUrl && (
        <MenuItem onClick={openHelp} onSelect={(e) => e.preventDefault()}>
          <span className='flex w-full items-center italic'>
            Where's my field?
            <OpenInNew className='ml-auto h-[18px] w-[30px] pl-3 text-fg-muted' />
          </span>
        </MenuItem>
      )}
    </MenuContent>
  )
}

export default EstimateFieldMenu
