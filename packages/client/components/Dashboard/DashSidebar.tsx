import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useRouteMatch} from 'react-router'
import {DashSidebar_viewer$key} from '../../__generated__/DashSidebar_viewer.graphql'
import {NavSidebar} from '../../types/constEnums'
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

const Nav = styled('nav')<{isOpen: boolean}>(({isOpen}) => ({
  // 70px is total height of 'Add meeting' block
  height: 'calc(100% - 70px)',
  userSelect: 'none',
  transition: `all 300ms`,
  transform: isOpen ? undefined : `translateX(-${NavSidebar.WIDTH}px)`,
  width: isOpen ? NavSidebar.WIDTH : '70px'
}))

const Contents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: 0,
  width: NavSidebar.WIDTH
})

const NavMain = styled('div')({
  overflowY: 'auto'
})

const NavItem = styled(LeftDashNavItem)({
  borderRadius: 44,
  paddingLeft: 16
})

const NavList = styled(DashNavList)({
  paddingLeft: 16
})

const NavItemsWrap = styled('div')({
  paddingRight: 8
})

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

interface Props {
  isOpen: boolean
  viewerRef: DashSidebar_viewer$key | null
}

const DashSidebar = (props: Props) => {
  const {isOpen, viewerRef} = props
  const match = useRouteMatch<{orgId: string}>('/me/organizations/:orgId')

  const viewer = useFragment(
    graphql`
      fragment DashSidebar_viewer on User {
        ...StandardHub_viewer
        organizations {
          ...DashNavList_organization
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
    const {orgId: orgIdFromParams} = match.params
    const currentOrg = organizations.find((org) => org.id === orgIdFromParams)
    const {id: orgId, name} = currentOrg ?? {}
    return (
      <Wrapper>
        <SideBarStartMeetingButton isOpen={isOpen} />
        <Nav isOpen={isOpen}>
          <Contents>
            <div className='px-3'>
              <NavItemsWrap>
                <NavItem
                  icon={'arrowBack'}
                  href={'/me/organizations'}
                  label={'Organizations'}
                  exact
                />
                <div className='mt-4 mb-1 flex min-h-[32px] items-center'>
                  <span className='flex-1 pl-3 text-base leading-6 font-semibold text-slate-700'>
                    {name}
                  </span>
                </div>
                <NavItem
                  icon={'creditScore'}
                  href={`/me/organizations/${orgId}/${BILLING_PAGE}`}
                  label={'Plans & Billing'}
                />
                <NavItem
                  icon={'groups'}
                  href={`/me/organizations/${orgId}/${TEAMS_PAGE}`}
                  label={'Teams'}
                />
                <NavItem
                  icon={'group'}
                  href={`/me/organizations/${orgId}/${MEMBERS_PAGE}`}
                  label={'Members'}
                />
                <NavItem
                  icon={'work'}
                  href={`/me/organizations/${orgId}/${ORG_SETTINGS_PAGE}`}
                  label={'Organization Settings'}
                />
                <NavItem
                  icon={'appRegistration'}
                  href={`/me/organizations/${orgId}/${ORG_INTEGRATIONS_PAGE}`}
                  label={'Integration Settings'}
                />
                <NavItem
                  icon={'key'}
                  href={`/me/organizations/${orgId}/${AUTHENTICATION_PAGE}`}
                  label={'Authentication'}
                />
              </NavItemsWrap>
            </div>
          </Contents>
        </Nav>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <SideBarStartMeetingButton isOpen={isOpen} />
      <Nav isOpen={isOpen}>
        <Contents>
          <div className='px-3'>
            <NavItem icon={'forum'} href={'/meetings'} label={'Meetings'} />
            <NavItem icon={'timeline'} href={'/me'} label={'History'} exact />
            <NavItem icon={'playlist_add_check'} href={'/me/tasks'} label={'Tasks'} />
            <NavItem icon={'add'} href={'/newteam/1'} label={'Add a Team'} />
          </div>
          <NavMain>
            <NavList organizationsRef={organizations} />
          </NavMain>
        </Contents>
      </Nav>
    </Wrapper>
  )
}

export default DashSidebar
