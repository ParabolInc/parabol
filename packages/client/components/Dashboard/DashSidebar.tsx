import AddIcon from '@mui/icons-material/Add'
import AppRegistrationIcon from '@mui/icons-material/AppRegistration'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CreditScoreIcon from '@mui/icons-material/CreditScore'
import ForumIcon from '@mui/icons-material/Forum'
import GroupIcon from '@mui/icons-material/Group'
import GroupsIcon from '@mui/icons-material/Groups'
import KeyIcon from '@mui/icons-material/Key'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import TimelineIcon from '@mui/icons-material/Timeline'
import WorkIcon from '@mui/icons-material/Work'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useMatch} from 'react-router'
import type {DashSidebar_viewer$key} from '../../__generated__/DashSidebar_viewer.graphql'
import {SearchDialog} from '../../modules/search/SearchDialog'
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
import SideBarStartMeetingButton from '../SideBarStartMeetingButton'
import LeftDashNavItem from './LeftDashNavItem'

const navClassName = (isOpen: boolean) =>
  cn(
    // 70px is total height of 'Add meeting' block
    'h-[calc(100%-70px)] select-none transition-all duration-300 ease-[ease]',
    isOpen ? 'w-64' : '-translate-x-64 w-[70px]'
  )

interface Props {
  isOpen: boolean
  viewerRef: DashSidebar_viewer$key | null
}

const DashSidebar = (props: Props) => {
  const {isOpen, viewerRef} = props
  const match = useMatch('/me/organizations/:orgId/*')

  const viewer = useFragment(
    graphql`
      fragment DashSidebar_viewer on User {
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
      <div className='flex flex-col bg-surface-sidebar print:hidden'>
        <SideBarStartMeetingButton isOpen={isOpen} />
        <nav className={navClassName(isOpen)}>
          <div className='flex h-full w-64 flex-col p-0'>
            <div className='px-3'>
              <div className='pr-2'>
                <LeftDashNavItem
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
                  Icon={CreditScoreIcon}
                  href={`/me/organizations/${orgId}/${BILLING_PAGE}`}
                  label={'Plans & Billing'}
                />
                <LeftDashNavItem
                  Icon={GroupsIcon}
                  href={`/me/organizations/${orgId}/${TEAMS_PAGE}`}
                  label={'Teams'}
                />
                <LeftDashNavItem
                  Icon={GroupIcon}
                  href={`/me/organizations/${orgId}/${MEMBERS_PAGE}`}
                  label={'Members'}
                />
                <LeftDashNavItem
                  Icon={WorkIcon}
                  href={`/me/organizations/${orgId}/${ORG_SETTINGS_PAGE}`}
                  label={'Organization Settings'}
                />
                <LeftDashNavItem
                  Icon={AppRegistrationIcon}
                  href={`/me/organizations/${orgId}/${ORG_INTEGRATIONS_PAGE}`}
                  label={'Integration Settings'}
                />
                <LeftDashNavItem
                  Icon={KeyIcon}
                  href={`/me/organizations/${orgId}/${AUTHENTICATION_PAGE}`}
                  label={'Authentication'}
                />
              </div>
            </div>
          </div>
        </nav>
      </div>
    )
  }

  return (
    <div className='flex flex-col bg-surface-sidebar print:hidden'>
      <SideBarStartMeetingButton isOpen={isOpen} />
      <nav className={navClassName(isOpen)}>
        <div className='flex h-full w-64 flex-col p-0'>
          <div className='px-3'>
            <LeftDashNavItem Icon={ForumIcon} href={'/meetings'} label={'Meetings'} />
            <SearchDialog />
            <LeftDashNavItem Icon={TimelineIcon} href={'/me'} label={'History'} exact />
            <LeftDashNavItem Icon={PlaylistAddCheckIcon} href={'/me/tasks'} label={'Tasks'} />
            <LeftDashNavItem Icon={AddIcon} href={'/newteam'} label={'Add a Team'} />
          </div>
          <div className='overflow-y-auto'>
            <DashNavList viewerRef={viewer} />
          </div>
        </div>
      </nav>
    </div>
  )
}

export default DashSidebar
