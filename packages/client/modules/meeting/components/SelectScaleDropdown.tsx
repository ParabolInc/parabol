import {Add} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import type {SelectScaleDropdown_dimension$key} from '../../../__generated__/SelectScaleDropdown_dimension.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'
import UpdatePokerTemplateDimensionScaleMutation from '../../../mutations/UpdatePokerTemplateDimensionScaleMutation'
import {Threshold} from '../../../types/constEnums'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import ScaleDropdownMenuItem from './ScaleDropdownMenuItem'

interface Props {
  onClose: () => void
  dimension: SelectScaleDropdown_dimension$key
}

const SelectScaleDropdown = (props: Props) => {
  const {onClose, dimension: dimensionRef} = props
  const dimension = useFragment(
    graphql`
      fragment SelectScaleDropdown_dimension on TemplateDimension {
        ...ScaleDropdownMenuItem_dimension
        id
        name
        selectedScale {
          id
          teamId
          ...ScaleDropdownMenuItem_scale
        }
        team {
          id
          scales {
            id
            isStarter
            name
            ...ScaleDropdownMenuItem_scale
          }
        }
      }
    `,
    dimensionRef
  )
  const {id: dimensionId, team} = dimension
  const {id: teamId, scales} = team
  const sortedScales = scales.toSorted((a, b) => {
    return a.isStarter !== b.isStarter ? (a.isStarter ? 1 : -1) : a.name.localeCompare(b.name)
  })

  const menuRef = useRef<HTMLDivElement>(null)
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()

  const addScale = () => {
    if (submitting) return
    submitMutation()
    AddPokerTemplateScaleMutation(
      atmosphere,
      {teamId},
      {
        onError,
        onCompleted: (res, errors) => {
          onCompleted(res, errors)
          const newScaleId = res?.addPokerTemplateScale?.scale?.id
          if (!newScaleId) return
          UpdatePokerTemplateDimensionScaleMutation(
            atmosphere,
            {dimensionId, scaleId: newScaleId},
            {onError, onCompleted: () => {}}
          )
          requestAnimationFrame(() => {
            menuRef.current
              ?.querySelector(`[data-scale-id="${newScaleId}"]`)
              ?.scrollIntoView({behavior: 'smooth', block: 'nearest'})
          })
        }
      }
    )
  }

  return (
    <MenuContent
      ref={menuRef}
      aria-label='Select the scale for this dimension'
      className='max-h-80'
    >
      {sortedScales.map((scale) => (
        <ScaleDropdownMenuItem
          key={scale.id}
          scale={scale}
          dimension={dimension}
          scaleCount={sortedScales.length}
          closePortal={onClose}
        />
      ))}
      <hr className='my-2 border-0 border-hairline-strong border-t' />
      {sortedScales.length < Threshold.MAX_POKER_TEMPLATE_SCALES && (
        <button
          className='flex w-full cursor-pointer items-center px-4 py-3 font-semibold text-accent text-base hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-50'
          onClick={addScale}
          disabled={submitting}
        >
          <Add className='mr-2 block' />
          Create a Scale
        </button>
      )}
    </MenuContent>
  )
}

export default SelectScaleDropdown
