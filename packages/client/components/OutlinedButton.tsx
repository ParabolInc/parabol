import {forwardRef, type Ref} from 'react'
import {cn} from '../ui/cn'
import FlatButton, {type FlatButtonProps} from './FlatButton'

const OutlinedButton = forwardRef((props: FlatButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {className, children, ...rest} = props
  return (
    <FlatButton {...rest} ref={ref} className={cn('border-current', className)}>
      {children}
    </FlatButton>
  )
})

export default OutlinedButton
