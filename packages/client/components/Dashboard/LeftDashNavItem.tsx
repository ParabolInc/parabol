import type {SvgIconTypeMap} from '@mui/material'
import type {OverridableComponent} from '@mui/material/OverridableComponent'
import {useRouteMatch} from 'react-router'
import {Link} from 'react-router-dom'
import {PageDropTarget} from '../../modules/pages/PageDropTarget'
import {cn} from '../../ui/cn'
import {LeftNavItem} from '../DashNavList/LeftNavItem'

interface Props {
  onClick?: () => void
  label: string
  href: string
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>
  exact?: boolean
}

const LeftDashNavItem = (props: Props) => {
  const {label, Icon, href, onClick, exact} = props
  const match = useRouteMatch(href)
  const isActive = !!match && (match?.isExact || !exact)
  return (
    <div className='relative rounded-md'>
      <PageDropTarget
        data-highlighted={isActive ? '' : undefined}
        className={cn(
          'peer group relative my-0.5 flex w-full cursor-pointer items-center space-x-2 rounded-md px-1 py-1 text-slate-700 text-sm leading-8 outline-hidden',
          'hover:bg-slate-300 focus:bg-slate-300 data-highlighted:bg-slate-300 data-highlighted:text-slate-900'
        )}
      >
        <Link draggable={false} to={href} className={'flex w-full items-center'} onClick={onClick}>
          <div
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-sm bg-inherit text-slate-600 group-data-highlighted:bg-slate-300'
              // className
            )}
          >
            <Icon className={'sm size-5 transition-transform'} />
          </div>
          <LeftNavItem>
            <span className='pl-1'>{label}</span>
          </LeftNavItem>
        </Link>
      </PageDropTarget>
    </div>
  )
}

export default LeftDashNavItem
