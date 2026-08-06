import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {ArrowBack} from '~/ui/icons'
import type {PokerTemplateScaleDetails_team$key} from '../../../__generated__/PokerTemplateScaleDetails_team.graphql'
import FlatButton from '../../../components/FlatButton'
import useAtmosphere from '../../../hooks/useAtmosphere'
import EditableTemplateScaleName from './EditableTemplateScaleName'
import scaleValueString from './scaleValueString'
import TemplateScaleValueList from './TemplateScaleValueList'

const scaleValuesClassName =
  'overflow-hidden text-ellipsis whitespace-nowrap pt-1 font-sans text-fg-secondary text-xs leading-4'

interface Props {
  team: PokerTemplateScaleDetails_team$key
}

const PokerTemplateScaleDetails = (props: Props) => {
  const {team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment PokerTemplateScaleDetails_team on Team {
        id
        editingScaleId
        scales {
          ...EditableTemplateScaleName_scales
          ...TemplateScaleValueList_scale
          ...NewTemplateScaleValueLabelInput_scale
          id
          name
          teamId
          values {
            label
          }
        }
      }
    `,
    teamRef
  )
  const atmosphere = useAtmosphere()
  const gotoTemplateDetail = () => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(teamId)?.setValue(null, 'editingScaleId')
    })
  }
  const {id: teamId, scales, editingScaleId} = team
  const scale = scales.find((scale) => scale.id === editingScaleId)
  if (!scale) return null
  const {values} = scale
  const isOwner = scale.teamId === teamId

  return (
    <div className='flex w-full max-w-[520px] flex-col items-start overflow-hidden rounded-lg bg-surface-card pb-1'>
      <div className='flex flex-row items-start p-3'>
        <FlatButton
          aria-label='Back to Template'
          onClick={gotoTemplateDetail}
          className='h-8 w-8 items-center justify-center p-0 text-fg-secondary hover:text-fg-primary focus:text-fg-primary active:text-fg-primary'
        >
          <ArrowBack className='text-inherit' />
        </FlatButton>
        <div className='select-none pl-3 font-sans font-semibold text-[16px] leading-8'>
          {'Edit Scale'}
        </div>
      </div>
      <div className='my-4 flex w-full flex-col pr-4 pl-14'>
        <div className='flex flex-col items-start'>
          <EditableTemplateScaleName
            name={scale.name}
            scaleId={scale.id}
            scales={scales}
            isOwner={isOwner}
          />
          <div className={scaleValuesClassName}>{scaleValueString(values)}</div>
          <div className={scaleValuesClassName}>{'Note: all scales include ? and Pass cards'}</div>
        </div>
      </div>
      <TemplateScaleValueList scale={scale} isOwner={isOwner} />
    </div>
  )
}

export default PokerTemplateScaleDetails
