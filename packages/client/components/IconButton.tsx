import {CancelOutlined, Close, Menu} from '~/ui/icons'
import {cn} from '../ui/cn'
import LinkButton, {type LinkButtonProps} from './LinkButton'

interface Props extends LinkButtonProps {
  //FIXME 6062: change to React.ComponentType
  icon: string
  iconLarge?: boolean
}

const IconButton = (props: Props) => {
  const {icon, iconLarge, className, ...rest} = props

  return (
    <LinkButton {...rest} className={cn('outline-0', className)} type='button'>
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
    </LinkButton>
  )
}

export default IconButton
