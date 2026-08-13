import {CancelOutlined, Close, Menu} from '~/ui/icons'
import {Button, type ButtonProps} from '../ui/Button/Button'
import {cn} from '../ui/cn'

const paletteStyles = {
  blue: 'text-sky-500',
  dark: 'text-fg-primary',
  gray: 'text-slate-200',
  midGray: 'text-fg-secondary',
  red: 'text-tomato-600',
  warm: 'text-gold-500',
  white: 'text-white'
} as const

const hoverPaletteStyles = {
  blue: 'hover:text-sky-600 focus:text-sky-600 active:text-sky-600',
  dark: 'hover:text-accent focus:text-accent active:text-accent',
  gray: 'hover:text-slate-400 focus:text-slate-400 active:text-slate-400',
  midGray: 'hover:text-fg-primary focus:text-fg-primary active:text-fg-primary',
  red: 'hover:text-tomato-800 focus:text-tomato-800 active:text-tomato-800',
  warm: 'hover:text-gold-700 focus:text-gold-700 active:text-gold-700',
  white: 'hover:text-slate-300 focus:text-slate-300 active:text-slate-300'
} as const

interface Props extends Omit<ButtonProps, 'size' | 'variant'> {
  //FIXME 6062: change to React.ComponentType
  icon: string
  iconLarge?: boolean
  palette?: keyof typeof paletteStyles
  waiting?: boolean
  dataCy?: string
}

const IconButton = (props: Props) => {
  const {icon, iconLarge, className, palette = 'dark', waiting, disabled, dataCy, ...rest} = props

  return (
    <Button
      {...rest}
      size='default'
      disabled={disabled || waiting}
      data-cy={dataCy}
      className={cn(
        'bg-transparent p-0 text-[14px] leading-5 shadow-none',
        paletteStyles[palette],
        !(disabled || waiting) && hoverPaletteStyles[palette],
        'outline-0',
        className
      )}
      type='button'
    >
      <div
        className={cn(
          'flex items-center justify-center text-inherit',
          iconLarge ? 'h-6 w-6 [&_svg]:text-[24px]' : 'h-[18px] w-[18px] [&_svg]:text-[18px]'
        )}
      >
        {
          {
            cancel: <CancelOutlined />,
            close: <Close />,
            menu: <Menu />
          }[icon]
        }
      </div>
    </Button>
  )
}

export default IconButton
