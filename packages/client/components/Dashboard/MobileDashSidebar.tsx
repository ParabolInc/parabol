import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useMatch} from 'react-router'
import {
  AccountBox as AccountBoxIcon,
  Add as AddIcon,
  AppRegistration as AppRegistrationIcon,
  ArrowBack as ArrowBackIcon,
  CreditScore as CreditScoreIcon,
  ExitToApp as ExitToAppIcon,
  Forum as ForumIcon,
  Group as GroupIcon,
  Groups as GroupsIcon,
  Key as KeyIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  Timeline as TimelineIcon,
  Work as WorkIcon
} from '~/ui/icons'
import type {DashSidebar_viewer$key} from '../../__generated__/DashSidebar_viewer.graphql'
import {cn} from '../../ui/cn'
import {
  AUTHENTICATION_PAGE,
  BILLING_PAGE,
  MEMBERS_PAGE,
  ORG_INTEGRATIONS_PAGE,
  ORG_SETTINGS_PAGE,
  TEAMS_PAGE
} from '../../utils/constants'
import DashNavList from '../DashNavList/DashNavList'
import StandardHub from '../StandardHub/StandardHub'
import LeftDashNavItem from './LeftDashNavItem'
import LeftDashParabol from './LeftDashNavParabol'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

interface Props {
  handleMenuClick: () => void
  viewerRef: DashSidebar_viewer$key | null
}

// NavSidebar.WIDTH = 256px (max-w-64/min-w-64); GlobalBanner.HEIGHT = 24px (pt-6)
const dashSidebarClassName = cn(
  'flex h-screen min-w-64 max-w-64 select-none flex-col overflow-hidden bg-surface-app text-fg-nav-muted',
  isGlobalBannerEnabled && 'pt-6'
)

const dashHRClassName = '-ml-2 w-[calc(100%+8px)] border-hairline-strong border-b'

const navBlockClassName = 'relative flex-1 overflow-y-auto p-2'

const navClassName = 'absolute top-0 left-0 flex h-full max-h-full w-full flex-col p-0'

const topNavItemsWrapClassName = 'px-3 py-2.5'

const navItemsWrapClassName = 'px-3 pt-2.5 pb-0'

// safari flexbox bug: https://stackoverflow.com/a/58720054/3155110
const footerClassName = 'mt-auto flex flex-col justify-end p-2'

const MobileDashSidebar = (props: Props) => {
  const {handleMenuClick, viewerRef} = props
  const match = useMatch('/me/organizations/:orgId/*')

  const viewer = useFragment(
    graphql`
      fragment MobileDashSidebar_viewer on User {
        ...StandardHub_viewer
        ...DashNavList_viewer
        organizations {
          id
          name
        }
      }
    `,
    viewerRef
  )
  if (!viewer) return null
  const {organizations} = viewer

  if (match) {
    const orgIdFromParams = match.params.orgId!
    const currentOrg = organizations.find((org) => org.id === orgIdFromParams)
    const {id: orgId, name} = currentOrg ?? {}
    return (
      <div className={dashSidebarClassName}>
        <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} />
        <div className={navBlockClassName}>
          <nav className={navClassName}>
            <div className={topNavItemsWrapClassName}>
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={AccountBoxIcon}
                href={'/me/profile'}
                label={'My Settings'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={ExitToAppIcon}
                href={'/signout'}
                label={'Sign Out'}
                exact
              />
            </div>
            <div className={dashHRClassName} />
            <div className={navItemsWrapClassName}>
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={ArrowBackIcon}
                href={'/me/organizations'}
                label={'Organizations'}
                exact
              />
              <div className='mt-4 mb-1 flex min-h-[32px] items-center'>
                <span className='flex-1 pl-3 font-semibold text-base text-fg-nav leading-6'>
                  {name}
                </span>
              </div>
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={CreditScoreIcon}
                href={`/me/organizations/${orgId}/${BILLING_PAGE}`}
                label={'Plans & Billing'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={GroupsIcon}
                href={`/me/organizations/${orgId}/${TEAMS_PAGE}`}
                label={'Teams'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={GroupIcon}
                href={`/me/organizations/${orgId}/${MEMBERS_PAGE}`}
                label={'Members'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={WorkIcon}
                href={`/me/organizations/${orgId}/${ORG_SETTINGS_PAGE}`}
                label={'Organization Settings'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={AppRegistrationIcon}
                href={`/me/organizations/${orgId}/${ORG_INTEGRATIONS_PAGE}`}
                label={'Integration Settings'}
              />
              <LeftDashNavItem
                onClick={handleMenuClick}
                Icon={KeyIcon}
                href={`/me/organizations/${orgId}/${AUTHENTICATION_PAGE}`}
                label={'Authentication'}
              />
            </div>
          </nav>
        </div>
        <div className={dashHRClassName} />
        <div className={footerClassName}>
          <div>
            <LeftDashParabol />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={dashSidebarClassName}>
      <StandardHub handleMenuClick={handleMenuClick} viewer={viewer} />
      <div className={navBlockClassName}>
        <nav className={navClassName}>
          <div className={topNavItemsWrapClassName}>
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={AccountBoxIcon}
              href={'/me/profile'}
              label={'My Settings'}
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={ExitToAppIcon}
              href={'/signout'}
              label={'Sign Out'}
              exact
            />
          </div>
          <div className={dashHRClassName} />
          <div className={navItemsWrapClassName}>
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={ForumIcon}
              href={'/meetings'}
              label={'Meetings'}
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={TimelineIcon}
              href={'/me'}
              label={'History'}
              exact
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={PlaylistAddCheckIcon}
              href={'/me/tasks'}
              label={'Tasks'}
            />
            <LeftDashNavItem
              onClick={handleMenuClick}
              Icon={AddIcon}
              href={'/newteam'}
              label={'Add a Team'}
            />
          </div>
          <DashNavList closeMobileSidebar={handleMenuClick} viewerRef={viewer} />
        </nav>
      </div>
      <div className={dashHRClassName} />
      <div className={footerClassName}>
        <div>
          <LeftDashParabol />
        </div>
      </div>
    </div>
  )
}

export default MobileDashSidebar
