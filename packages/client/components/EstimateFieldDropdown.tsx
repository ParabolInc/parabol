import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {ExpandMore} from '~/ui/icons'
import type {EstimateFieldDropdown_stage$key} from '../__generated__/EstimateFieldDropdown_stage.graphql'
import {cn} from '../ui/cn'
import {Menu} from '../ui/Menu/Menu'
import EditVotingLabelTemplateModal from './EditVotingLabelTemplateModal'
import type {EditModalConfig} from './EstimateFieldMenu'
import EstimateFieldMenu from './EstimateFieldMenu'
import {resolveEstimateFieldLabel} from './estimateFieldOptions'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: EstimateFieldDropdown_stage$key
  submitScore(): void
}

const EstimateFieldDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment EstimateFieldDropdown_stage on EstimateStage {
        ...EstimateFieldMenu_stage
        finalScore
        serviceField {
          name
        }
        dimensionFieldListing {
          targets
          options {
            fieldId
            label
          }
        }
      }
    `,
    stageRef
  )
  const {finalScore, serviceField, dimensionFieldListing} = stage
  const [editModalConfig, setEditModalConfig] = useState<EditModalConfig | null>(null)
  const label = resolveEstimateFieldLabel({
    name: serviceField.name,
    options: dimensionFieldListing.options,
    targets: dimensionFieldListing.targets,
    finalScore
  })

  const trigger = (
    <PlainButton
      className={cn(
        'flex select-none text-fg-primary',
        isFacilitator
          ? 'hover:opacity-50 focus:opacity-50 active:opacity-50'
          : 'cursor-default pr-2'
      )}
    >
      <div className='text-sm'>{label}</div>
      <ExpandMore className={cn('h-[18px] w-[18px]', !isFacilitator && 'hidden')} />
    </PlainButton>
  )

  if (!isFacilitator) return trigger

  return (
    <>
      <Menu trigger={trigger} onOpenChange={(open) => open && clearError()}>
        <EstimateFieldMenu
          stageRef={stage}
          submitScore={submitScore}
          onOpenEditModal={setEditModalConfig}
        />
      </Menu>
      {editModalConfig && (
        <EditVotingLabelTemplateModal
          isOpen
          onClose={() => setEditModalConfig(null)}
          updateLabelTemplate={editModalConfig.updateLabelTemplate}
          defaultValue={editModalConfig.defaultValue}
          placeholder={editModalConfig.placeholder}
        />
      )}
    </>
  )
}

export default EstimateFieldDropdown
