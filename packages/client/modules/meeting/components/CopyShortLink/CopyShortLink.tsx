import {Link} from '@mui/icons-material'
import type {ReactNode} from 'react'
import CopyLink from '../../../../components/CopyLink'
import {cn} from '../../../../ui/cn'

interface Props {
  className?: string
  //FIXME 6062: change to React.ComponentType
  icon?: string
  label?: ReactNode
  title?: string | undefined
  tooltip?: string | undefined
  url: string
  onCopy?: () => void
}
const CopyShortLink = (props: Props) => {
  const {className, icon, label, url, title, tooltip, onCopy} = props
  const theLabel = label || url
  return (
    <CopyLink url={url} title={title} tooltip={tooltip} onCopy={onCopy}>
      <div
        className={cn(
          'flex min-w-0 shrink-0 select-none items-center overflow-auto text-fg-secondary hover:cursor-pointer hover:text-fg-primary',
          className
        )}
      >
        {icon && (
          <div className='mr-3 block h-6 w-6'>
            {
              {
                link: <Link />
              }[icon]
            }
          </div>
        )}
        <div className='whitespace-nowrap'>{theLabel}</div>
      </div>
    </CopyLink>
  )
}

export default CopyShortLink
