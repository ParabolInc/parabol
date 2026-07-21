import type {SvgIconTypeMap} from '@mui/material'
import type {OverridableComponent} from '@mui/material/OverridableComponent'
import {forwardRef, type Ref} from 'react'
import {Link, useMatch} from 'react-router'
import {cn} from '../../ui/cn'
import {LeftNavItem} from '../DashNavList/LeftNavItem'

interface Props {
  onClick?: () => void
  label: string
  href: string
  Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>
  exact?: boolean
}

const LeftDashNavItem = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {label, Icon, href, onClick, exact} = props
  const match = useMatch({path: href || '/', end: !!exact})
  const isActive = href && !!match
  const LinkWrapper = href ? Link : 'div'
  return (
    <div className='relative rounded-md' ref={ref}>
      <div
        data-highlighted={isActive ? '' : undefined}
        className={cn(
          'peer group relative my-0.5 flex w-full cursor-pointer items-center space-x-2 rounded-md px-1 py-1 text-fg-nav text-sm leading-8 outline-hidden',
          'hover:bg-surface-nav-active focus:bg-surface-nav-active data-highlighted:bg-surface-nav-active data-highlighted:text-fg-primary data-highlighted:shadow-[var(--shadow-nav-active)]'
        )}
      >
        <LinkWrapper
          draggable={false}
          to={href}
          className={'flex w-full items-center text-inherit hover:text-inherit'}
          onClick={onClick}
        >
          <div
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-sm bg-inherit text-fg-nav-muted group-data-highlighted:bg-surface-nav-active'
              // className
            )}
          >
            <Icon className={'sm size-5 transition-transform'} />
          </div>
          <LeftNavItem>
            <span className='pl-1'>{label}</span>
          </LeftNavItem>
        </LinkWrapper>
      </div>
    </div>
  )
})

export default LeftDashNavItem
