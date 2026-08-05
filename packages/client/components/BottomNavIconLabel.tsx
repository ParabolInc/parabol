import {
  Event,
  Headphones,
  HelpOutline,
  PersonPinCircleOutlined,
  TimerOutlined
} from '@mui/icons-material'
import {forwardRef, type ReactNode, type Ref} from 'react'
import {cn} from '../ui/cn'

const paletteColors = {
  warm: 'text-rose-500',
  midGray: 'text-fg-secondary',
  red: 'text-tomato-600',
  green: 'text-jade-400',
  blue: 'text-sky-500'
}

interface Props {
  className?: string
  fontSize?: number
  //FIXME 6062: change to React.ComponentType
  icon?: string | undefined
  iconColor?: keyof typeof paletteColors
  label: any | undefined
  children?: ReactNode
}

const BottomNavIconLabel = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {children, className, icon, iconColor, label} = props

  return (
    <div className={cn('flex flex-col items-center px-2 pt-2 pb-1', className)} ref={ref}>
      {children || (
        <div className={cn('h-6 w-6', iconColor ? paletteColors[iconColor] : 'text-fg-secondary')}>
          {
            {
              help_outline: <HelpOutline />,
              headphones: <Headphones />,
              timer: <TimerOutlined />,
              event: <Event />,
              person_pin_circle: <PersonPinCircleOutlined />
            }[icon!]
          }
        </div>
      )}
      <div className='h-4 text-fg-primary text-xs leading-4'>{label}</div>
    </div>
  )
})

export default BottomNavIconLabel
