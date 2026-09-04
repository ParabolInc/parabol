import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {ExpandMore} from '~/ui/icons'
import type {EstimateFieldDropdown_stage$key} from '../__generated__/EstimateFieldDropdown_stage.graphql'
import {cn} from '../ui/cn'
import {SelectValue} from '../ui/Select/SelectValue'
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
  // a label service renders a Menu, every other service a Select, which anchors on its own value
  const isSelect = isFacilitator && !dimensionFieldListing.targets.includes('label')
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
      {isSelect ? <SelectValue>{labelEl}</SelectValue> : labelEl}
      <ExpandMore className={cn('h-[18px] w-[18px]', !isFacilitator && 'hidden')} />
    </PlainButton>
  )

  if (!isFacilitator) return trigger

  return (
    <>
      <EstimateFieldMenu
        stageRef={stage}
        trigger={trigger}
        onOpenChange={(isOpen) => isOpen && clearError()}
        submitScore={submitScore}
        onOpenEditModal={setEditModalConfig}
      />
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
