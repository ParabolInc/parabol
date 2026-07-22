import {AccountBalance, AccountBox, ExitToApp, Star} from '@mui/icons-material'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {StandardHubUserMenu_viewer$key} from '../__generated__/StandardHubUserMenu_viewer.graphql'
import {cn} from '../ui/cn'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import {SIGNOUT_LABEL, SIGNOUT_SLUG} from '../utils/constants'

const linkClassName =
  'flex w-full items-center gap-2 py-0.5 text-sm leading-6 hover:text-fg-primary focus:text-fg-primary'
const iconClassName = 'size-[18px] text-[18px] text-fg-secondary'

interface Props {
  viewerRef: StandardHubUserMenu_viewer$key
}

const StandardHubUserMenu = (props: Props) => {
  const {viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment StandardHubUserMenu_viewer on User {
        email
        organizations {
          id
          billingTier
        }
      }
    `,
    viewerRef
  )
  const {email, organizations} = viewer
  const ownedFreeOrgs = organizations.filter((org) => org.billingTier === 'starter')
  const showUpgradeCTA = ownedFreeOrgs.length > 0
  const routeSuffix = ownedFreeOrgs.length === 1 ? `/${ownedFreeOrgs[0]!.id}` : ''

  return (
    <MenuContent
      align='end'
      sideOffset={4}
      aria-label='Select your settings'
      className='min-w-0 max-w-[280px]'
    >
      <DropdownMenu.Label className='mb-1 select-none truncate px-4 font-semibold text-[15px] text-fg-primary leading-8'>
        {email}
      </DropdownMenu.Label>
      <MenuItem>
        <Link to={'/me/profile'} className={linkClassName}>
          <AccountBox className={iconClassName} />
          {'My Settings'}
        </Link>
      </MenuItem>
      <MenuItem>
        <Link to={'/me/organizations'} className={linkClassName}>
          <AccountBalance className={iconClassName} />
          {'Organizations'}
        </Link>
      </MenuItem>
      {showUpgradeCTA && (
        <MenuItem>
          <Link
            to={`/me/organizations${routeSuffix}`}
            className={cn(linkClassName, 'text-accent hover:text-accent focus:text-accent')}
          >
            <Star className={cn(iconClassName, 'text-accent')} />
            {'Upgrade'}
          </Link>
        </MenuItem>
      )}
      <MenuItem>
        <Link to={`/${SIGNOUT_SLUG}`} className={linkClassName}>
          <ExitToApp className={iconClassName} />
          {SIGNOUT_LABEL}
        </Link>
      </MenuItem>
    </MenuContent>
  )
}

export default StandardHubUserMenu
