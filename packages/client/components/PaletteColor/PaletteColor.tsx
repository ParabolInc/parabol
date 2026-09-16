import {Check} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import {cn} from '../../ui/cn'
import PlainButton from '../PlainButton/PlainButton'

interface Props {
  color: {
    hex: string
    name: string
  }
  isAvailable: boolean
  isCurrentColor: boolean
  handleClick: (color: string) => void
}

const PaletteColor = (props: Props) => {
  const {color, isAvailable, isCurrentColor, handleClick} = props
  const {name, hex} = color
  return (
    <div
      className={cn(
        'm-[2px] flex h-10 w-10 items-center justify-center rounded-full border-2',
        isAvailable ? 'border-surface-card' : 'border-hairline-strong'
      )}
    >
      <Tooltip delayDuration={800}>
        <TooltipTrigger asChild>
          <PlainButton
            className='relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-surface-card transition-all duration-300 ease-[ease]'
            style={{backgroundColor: hex}}
            onClick={() => handleClick(hex)}
          >
            {isCurrentColor && <Check className='text-white' />}
          </PlainButton>
        </TooltipTrigger>
        <TooltipContent side='bottom'>{name}</TooltipContent>
      </Tooltip>
    </div>
  )
}

export default PaletteColor
