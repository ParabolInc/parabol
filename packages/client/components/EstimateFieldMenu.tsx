import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {OpenInNew} from '~/ui/icons'
import type {EstimateFieldMenu_stage$key} from '../__generated__/EstimateFieldMenu_stage.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useUpdateIntegrationDimensionFieldMutation from '../mutations/useUpdateIntegrationDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import SendClientSideEvent from '../utils/SendClientSideEvent'
import EstimateFieldLabelTemplateItem from './EstimateFieldLabelTemplateItem'
import EstimateFieldSelect from './EstimateFieldSelect'
import {findEstimateFieldOption, SENTINEL_FIELD_LABELS} from './estimateFieldOptions'

export type EditModalConfig = {
  updateLabelTemplate: (labelTemplate: string) => () => void
  defaultValue: string
  placeholder: string
}

interface Props {
  onOpenEditModal: (config: EditModalConfig) => void
  onOpenChange: (isOpen: boolean) => void
  stageRef: EstimateFieldMenu_stage$key
  submitScore(): void
  trigger: ReactNode
}

const EstimateFieldMenu = (props: Props) => {
  const {onOpenEditModal, onOpenChange, stageRef, submitScore, trigger} = props
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

  const selectField = (fieldId: string) => {
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
  const handleClick = (fieldId: string) => () => selectField(fieldId)

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

  if (!acceptsLabel) {
    return (
      <EstimateFieldSelect
        trigger={trigger}
        onOpenChange={onOpenChange}
        options={options}
        serviceFieldName={serviceFieldName}
        helpUrl={helpUrl}
        onSelectField={selectField}
        onOpenHelp={openHelp}
        hasEmptyFieldList={acceptsFields && options.length === 0}
      />
    )
  }

  return (
    <Menu trigger={trigger} onOpenChange={onOpenChange}>
      <MenuContent>
        {options.map(({fieldId, label}) => (
          <MenuItem key={fieldId} onClick={handleClick(fieldId)}>
            {label}
          </MenuItem>
        ))}
        <EstimateFieldLabelTemplateItem
          dimensionName={dimensionName}
          serviceFieldName={serviceFieldName}
          onSelect={handleClick}
          onOpenEditModal={onOpenEditModal}
        />
        <MenuItem onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_COMMENT)}>
          {SENTINEL_FIELD_LABELS[SprintPokerDefaults.SERVICE_FIELD_COMMENT]}
        </MenuItem>
        <MenuItem onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}>
          {SENTINEL_FIELD_LABELS[SprintPokerDefaults.SERVICE_FIELD_NULL]}
        </MenuItem>
        {helpUrl && (
          <MenuItem onClick={openHelp} onSelect={(e) => e.preventDefault()}>
            <span className='flex w-full items-center gap-2 italic'>
              Where's my field?
              <OpenInNew className='ml-auto h-[18px] w-[18px] text-fg-muted' />
            </span>
          </MenuItem>
        )}
      </MenuContent>
    </Menu>
  )
}

export default EstimateFieldMenu
