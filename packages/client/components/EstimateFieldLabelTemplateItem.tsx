import type {MouseEvent} from 'react'
import {Edit} from '~/ui/icons'
import {MenuItem} from '../ui/Menu/MenuItem'
import type {EditModalConfig} from './EstimateFieldMenu'
import {isFieldTemplate} from './estimateFieldOptions'

interface Props {
  dimensionName: string
  serviceFieldName: string
  onSelect: (labelTemplate: string) => () => void
  onOpenEditModal: (config: EditModalConfig) => void
}

const EstimateFieldLabelTemplateItem = (props: Props) => {
  const {dimensionName, serviceFieldName, onSelect, onOpenEditModal} = props
  const defaultLabelTemplate = `${dimensionName}: {{#}}`
  const serviceFieldTemplate = isFieldTemplate(serviceFieldName)
    ? serviceFieldName
    : defaultLabelTemplate
  const openEditModal = (e: MouseEvent) => {
    e.stopPropagation()
    onOpenEditModal({
      updateLabelTemplate: onSelect,
      defaultValue: serviceFieldTemplate,
      placeholder: defaultLabelTemplate
    })
  }
  return (
    <MenuItem onClick={onSelect(serviceFieldTemplate)}>
      <div className='flex min-w-[300px] items-center justify-between'>
        <div className='block max-w-[200px] grow py-3'>
          <div className='flex font-sans text-fg-primary leading-6'>As a label</div>
          <div className='truncate font-sans text-[11px] text-fg-secondary leading-4'>
            {serviceFieldTemplate}
          </div>
        </div>
        <button
          className='mr-2 flex h-8 w-8 items-center justify-center rounded text-fg-secondary hover:bg-surface-hover'
          onClick={openEditModal}
        >
          <Edit className='h-[18px] w-[18px]' />
        </button>
      </div>
    </MenuItem>
  )
}

export default EstimateFieldLabelTemplateItem
