import {Public} from '@mui/icons-material'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ScaleDropdownMenuItem_dimension$key} from '../../../__generated__/ScaleDropdownMenuItem_dimension.graphql'
import type {ScaleDropdownMenuItem_scale$key} from '../../../__generated__/ScaleDropdownMenuItem_scale.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import UpdatePokerTemplateDimensionScaleMutation from '../../../mutations/UpdatePokerTemplateDimensionScaleMutation'
import ScaleActions from './ScaleActions'
import scaleValueString from './scaleValueString'

interface Props {
  scale: ScaleDropdownMenuItem_scale$key
  scaleCount: number
  dimension: ScaleDropdownMenuItem_dimension$key
  closePortal: () => void
}

const ScaleDropdownMenuItem = (props: Props) => {
  const {scale: scaleRef, dimension: dimensionRef, closePortal, scaleCount} = props
  const dimension = useFragment(
    graphql`
      fragment ScaleDropdownMenuItem_dimension on TemplateDimension {
        id
        selectedScale {
          id
        }
        team {
          id
        }
      }
    `,
    dimensionRef
  )
  const scale = useFragment(
    graphql`
      fragment ScaleDropdownMenuItem_scale on TemplateScale {
        ...ScaleActions_scale
        id
        name
        isStarter
        teamId
        values {
          label
        }
      }
    `,
    scaleRef
  )
  const {id: scaleId, isStarter, name: scaleName, values} = scale
  const {id: dimensionId, selectedScale} = dimension
  const {id: selectedScaleId} = selectedScale
  const atmosphere = useAtmosphere()
  const {submitMutation, submitting, onError, onCompleted} = useMutationProps()

  const setScale = () => {
    if (submitting || scaleId === selectedScaleId) return
    submitMutation()
    UpdatePokerTemplateDimensionScaleMutation(
      atmosphere,
      {dimensionId, scaleId},
      {onError, onCompleted}
    )
    closePortal()
  }

  return (
    <DropdownMenu.Item
      className='mx-1 flex min-w-[300px] cursor-pointer justify-between rounded-md outline-hidden hover:bg-surface-raised focus:bg-surface-raised'
      data-scale-id={scaleId}
      onClick={setScale}
    >
      <div className='flex max-w-[200px] grow flex-col px-4 py-3'>
        <div className='flex items-center truncate font-semibold text-base text-fg-primary leading-6'>
          {scaleName}
          {isStarter && <Public className='ml-1 h-[18px] w-[18px]' />}
        </div>
        <div className='truncate text-fg-secondary text-xs leading-4'>
          {scaleValueString(values)}
        </div>
      </div>
      <div className='my-auto px-2'>
        <ScaleActions scale={scale} scaleCount={scaleCount} teamId={dimension.team.id} />
      </div>
    </DropdownMenu.Item>
  )
}

export default ScaleDropdownMenuItem
