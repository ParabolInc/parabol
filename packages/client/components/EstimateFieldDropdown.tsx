import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {ExpandMore} from '~/ui/icons'
import type {EstimateFieldDropdown_stage$key} from '../__generated__/EstimateFieldDropdown_stage.graphql'
import {cn} from '../ui/cn'
import {SelectValue} from '../ui/Select/SelectValue'
import EditVotingLabelTemplateModal from './EditVotingLabelTemplateModal'
import type {EditModalConfig} from './EstimateFieldMenu'
import EstimateFieldMenu from './EstimateFieldMenu'
import PlainButton from './PlainButton/PlainButton'
import {resolveServiceFieldLabel} from './serviceFieldLabel'

export interface ServiceFieldSummary {
  fieldId: string
  type: string
}

interface Props {
  title: string
  clearError: () => void
  isFacilitator: boolean
  stageRef: EstimateFieldDropdown_stage$key
  submitScore(): void
  onServiceFieldChange: (serviceField: ServiceFieldSummary) => void
}

const EstimateFieldDropdown = (props: Props) => {
  const {title, clearError, stageRef, isFacilitator, submitScore, onServiceFieldChange} = props
  const stage = useFragment(
    graphql`
      fragment EstimateFieldDropdown_stage on EstimateStage {
        ...EstimateFieldMenu_stage
        finalScore
        serviceField {
          fieldId
          label
          type
        }
        serviceFieldListing {
          targets
          options {
            fieldId
          }
        }
        task {
          integration {
            __typename
          }
        }
      }
    `,
    stageRef
  )
  const {finalScore, serviceField, serviceFieldListing, task} = stage
  const [editModalConfig, setEditModalConfig] = useState<EditModalConfig | null>(null)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  useEffect(() => {
    onServiceFieldChange(serviceField)
  }, [serviceField])
  if (!task?.integration) return null
  const label = resolveServiceFieldLabel(serviceField, serviceFieldListing, finalScore)
  // a label service renders a Menu, every other service a Select, which anchors on its own value
  const isSelect = isFacilitator && !serviceFieldListing.targets.includes('label')
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

  return (
    <div className='flex items-center'>
      {isDesktop ? (
        <div className='flex px-2 font-semibold text-sm'>{`${title} Label: `}</div>
      ) : (
        <div className='flex pr-1 font-semibold text-sm'>Label:</div>
      )}
      {isFacilitator ? (
        <EstimateFieldMenu
          stageRef={stage}
          trigger={trigger}
          onOpenChange={(isOpen) => isOpen && clearError()}
          submitScore={submitScore}
          onOpenEditModal={setEditModalConfig}
        />
      ) : (
        trigger
      )}
      {editModalConfig && (
        <EditVotingLabelTemplateModal
          isOpen
          onClose={() => setEditModalConfig(null)}
          updateLabelTemplate={editModalConfig.updateLabelTemplate}
          defaultValue={editModalConfig.defaultValue}
          placeholder={editModalConfig.placeholder}
        />
      )}
    </div>
  )
}

export default EstimateFieldDropdown
