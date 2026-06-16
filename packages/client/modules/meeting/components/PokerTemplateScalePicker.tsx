import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {PokerTemplateScalePicker_dimension$key} from '../../../__generated__/PokerTemplateScalePicker_dimension.graphql'
import {Menu} from '../../../ui/Menu/Menu'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import lazyPreload from '../../../utils/lazyPreload'

const SelectScaleDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'SelectScaleDropdown' */
      './SelectScaleDropdown'
    )
)

interface Props {
  dimension: PokerTemplateScalePicker_dimension$key
  isOwner: boolean
  readOnly?: boolean
}

const PokerTemplateScalePicker = (props: Props) => {
  const {dimension: dimensionRef, isOwner, readOnly} = props
  const dimension = useFragment(
    graphql`
      fragment PokerTemplateScalePicker_dimension on TemplateDimension {
        ...SelectScaleDropdown_dimension
        id
        selectedScale {
          name
        }
      }
    `,
    dimensionRef
  )
  const {selectedScale} = dimension
  const [open, setOpen] = useState(false)

  const trigger = (
    <div
      onMouseEnter={SelectScaleDropdown.preload}
      className={`flex min-w-36 select-none rounded-full text-[13px] leading-5 ${
        readOnly
          ? 'bg-white'
          : !isOwner
            ? 'cursor-not-allowed border border-slate-400 bg-slate-200'
            : 'cursor-pointer border border-slate-400 bg-white'
      }`}
    >
      <div className='ml-4 flex min-w-0 flex-1 flex-wrap items-center'>
        <div className='m-auto truncate text-center font-semibold leading-5'>
          {selectedScale.name}
        </div>
      </div>
      {!readOnly && (
        <ExpandMore className='mt-[7px] mr-4 mb-[5px] h-[18px] w-[18px] text-slate-700' />
      )}
    </div>
  )

  if (readOnly) return trigger

  if (!isOwner) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent side='bottom'>Must be the template owner to change</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Menu trigger={trigger} open={open} onOpenChange={setOpen}>
      <SelectScaleDropdown dimension={dimension} onClose={() => setOpen(false)} />
    </Menu>
  )
}

export default PokerTemplateScalePicker
