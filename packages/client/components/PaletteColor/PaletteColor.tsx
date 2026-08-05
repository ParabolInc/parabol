import {Check} from '@mui/icons-material'
import {MenuPosition} from '~/hooks/useCoords'
import useTooltip from '~/hooks/useTooltip'
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
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER,
    {
      delay: 800
    }
  )
  return (
    <>
      <div
        className={cn(
          'm-[2px] flex h-10 w-10 items-center justify-center rounded-full border-2',
          isAvailable ? 'border-surface-card' : 'border-hairline-strong'
        )}
      >
        <PlainButton
          ref={originRef}
          className='relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-surface-card transition-all duration-300 ease-[ease]'
          style={{backgroundColor: hex}}
          onClick={() => handleClick(hex)}
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
        >
          {isCurrentColor && <Check className='text-white' />}
        </PlainButton>
      </div>
      {tooltipPortal(<div>{name}</div>)}
    </>
  )
}

export default PaletteColor
