import {cn} from '../ui/cn'
import type {BaseButtonProps} from './BaseButton'
import IconButton from './IconButton'

interface Props extends BaseButtonProps {}

const SidebarToggle = (props: Props) => {
  const {dataCy, className, ...rest} = props
  return (
    <IconButton
      {...rest}
      className={cn(
        // hover stays fg-secondary (the source overrode the hover color back to the base)
        'h-6 p-0 text-fg-secondary hover:text-fg-secondary focus:text-fg-secondary active:text-fg-secondary',
        className
      )}
      dataCy={`${dataCy}-toggle`}
      aria-label='Toggle the sidebar'
      icon='menu'
      iconLarge
    />
  )
}
export default SidebarToggle
