import {forwardRef, type Ref} from 'react'
import {BezierCurve} from '~/types/constEnums'
import {cn} from '../ui/cn'
import FlatButton, {type FlatButtonProps} from './FlatButton'

interface Props extends FlatButtonProps {
  confirming?: boolean
  disabled?: boolean
  waiting?: boolean
}

const BottomNavControl = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {confirming, disabled, waiting, className, style, ...rest} = props
  const visuallyDisabled = disabled || waiting
  return (
    <FlatButton
      {...rest}
      disabled={disabled}
      waiting={waiting}
      ref={ref}
      className={cn(
        'min-h-14 w-24 origin-bottom rounded-none border-0 p-0',
        confirming ? 'opacity-50' : 'opacity-100',
        !visuallyDisabled &&
          'hover:bg-surface-hover focus:bg-surface-hover active:bg-surface-hover',
        className
      )}
      style={{transition: `opacity 300ms ${BezierCurve.DECELERATE}`, ...style}}
    />
  )
})

export default BottomNavControl
